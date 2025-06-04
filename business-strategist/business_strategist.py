from __future__ import annotations

"""Interactive Business Strategist orchestrator with Mem0 memory."""

import asyncio
import json
import os
from contextlib import AsyncExitStack
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable

from dotenv import load_dotenv
from rich.console import Console
from rich.live import Live
from rich.markdown import Markdown

from mem0 import Memory
from pydantic_ai import Agent, RunContext
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
=======
from contextlib import AsyncExitStack
from typing import Optional
from rich.markdown import Markdown
from rich.console import Console
from rich.live import Live
from dotenv import load_dotenv
import asyncio
import os

from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.mcp import MCPServerStdio
from pydantic_ai import Agent

# Optional Langfuse instrumentation
try:
    from configure_langfuse import configure_langfuse
except Exception:  # pragma: no cover - optional dependency
    import importlib.util
=======
except ImportError:  # handle relative path when not installed as a package
    import importlib.util
    from pathlib import Path

    module_path = Path(__file__).resolve().parent.parent / "pydantic-ai-langfuse" / "configure_langfuse.py"
    spec = importlib.util.spec_from_file_location("configure_langfuse", module_path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        configure_langfuse = module.configure_langfuse  # type: ignore
    else:  # pragma: no cover - fallback when file missing
        def configure_langfuse():
            return None
=======
    else:
        configure_langfuse = lambda: None

load_dotenv()


# ---------------------------------------------------------------------------
# Model and memory setup
# ---------------------------------------------------------------------------

def get_model() -> OpenAIModel:
=======
def get_model() -> OpenAIModel:
    """Return the configured OpenAI model."""
    llm = os.getenv("MODEL_CHOICE", "gpt-4o-mini")
    base_url = os.getenv("BASE_URL", "https://api.openai.com/v1")
    api_key = os.getenv("LLM_API_KEY", "")
    return OpenAIModel(llm, provider=OpenAIProvider(base_url=base_url, api_key=api_key))


MEMORY_CONFIG = {
    "llm": {"provider": "openai", "config": {"model": os.getenv("MODEL_CHOICE", "gpt-4o-mini")}},
    "vector_store": {
        "provider": "supabase",
        "config": {
            "connection_string": os.environ.get("DATABASE_URL", ""),
            "collection_name": "memories",
        },
    },
}

memory = Memory.from_config(MEMORY_CONFIG)


@dataclass
class Mem0Deps:
    memories: str


# ---------------------------------------------------------------------------
# MCP server loading
# ---------------------------------------------------------------------------

PROMPTS: Dict[str, str] = {
    "airtable": "You are an Airtable specialist. Help users interact with Airtable databases.",
    "brave": "You are a web search specialist using Brave Search.",
    "filesystem": "You are a filesystem specialist. Manage files and directories.",
    "github": "You are a GitHub specialist. Manage repositories and issues.",
    "slack": "You are a Slack specialist. Work with channels and messages.",
    "firecrawl": "You are a web crawling specialist. Extract data from websites.",
    "notionApi": "You are a Notion specialist. Work with Notion pages and databases.",
}

CONFIG_PATH = Path(__file__).parent / "mcp_config.json"


def _expand_env(env: Dict[str, str]) -> Dict[str, str]:
    return {k: os.path.expandvars(v) for k, v in env.items()}


def load_subagents() -> Dict[str, Agent]:
    with open(CONFIG_PATH, "r") as fh:
        config = json.load(fh)

    agents: Dict[str, Agent] = {}
    for name, params in config.get("mcpServers", {}).items():
        env = _expand_env(params.get("env", {}))
        server = MCPServerStdio(params["command"], params["args"], env=env)
        prompt = PROMPTS.get(name, f"You are the {name} specialist.")
        agents[name] = Agent(
            get_model(),
            system_prompt=prompt,
            mcp_servers=[server],
            instrument=os.getenv("ENABLE_LANGFUSE", "false").lower() == "true",
        )
    return agents


sub_agents = load_subagents()


# Primary orchestrator
instrument = os.getenv("ENABLE_LANGFUSE", "false").lower() == "true"
tracer = configure_langfuse() if instrument else None
primary_agent = Agent(
    get_model(),
    system_prompt=(
        "You are a Business Strategist orchestrator. "
        "Delegate tasks to subagents based on the user's request."
    ),
    deps_type=Mem0Deps,
    instrument=instrument,
)


@primary_agent.system_prompt
def add_memories(ctx: RunContext[str]) -> str:
    return f"\nUser Memories:\n{ctx.deps.memories}"


# Dynamically register tools for each subagent
for _name, _agent in sub_agents.items():

    async def _factory(query: str, agent=_agent) -> Dict[str, str]:
        result = await agent.run(query)
        return {"result": result.data}

    primary_agent.tool_plain(_factory, name=f"use_{_name}_agent")


async def run_cli() -> None:
    """Run the orchestrator in an interactive loop."""
=======
# ---- Optional Langfuse setup ----
tracer = None
if os.getenv("ENABLE_LANGFUSE", "false").lower() == "true":
    tracer = configure_langfuse()

instrument = tracer is not None

# ---- MCP Servers ----
airtable_server = MCPServerStdio(
    "npx", ["-y", "airtable-mcp-server"], env={"AIRTABLE_API_KEY": os.getenv("AIRTABLE_API_KEY")}
)
brave_server = MCPServerStdio(
    "npx", ["-y", "@modelcontextprotocol/server-brave-search"], env={"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY")}
)
filesystem_server = MCPServerStdio(
    "npx", ["-y", "@modelcontextprotocol/server-filesystem", os.getenv("LOCAL_FILE_DIR", "./")]
)
github_server = MCPServerStdio(
    "npx", ["-y", "@modelcontextprotocol/server-github"], env={"GITHUB_PERSONAL_ACCESS_TOKEN": os.getenv("GITHUB_TOKEN")}
)
slack_server = MCPServerStdio(
    "npx",
    ["-y", "@modelcontextprotocol/server-slack"],
    env={"SLACK_BOT_TOKEN": os.getenv("SLACK_BOT_TOKEN"), "SLACK_TEAM_ID": os.getenv("SLACK_TEAM_ID")},
)
firecrawl_server = MCPServerStdio(
    "npx", ["-y", "firecrawl-mcp"], env={"FIRECRAWL_API_KEY": os.getenv("FIRECRAWL_API_KEY")}
)

# ---- Subagents ----
airtable_agent = Agent(
    get_model(),
    system_prompt="You are an Airtable specialist. Help users interact with Airtable databases.",
    mcp_servers=[airtable_server],
    instrument=instrument,
)
brave_agent = Agent(
    get_model(),
    system_prompt="You are a web search specialist using Brave Search. Find relevant information on the web.",
    mcp_servers=[brave_server],
    instrument=instrument,
)
filesystem_agent = Agent(
    get_model(),
    system_prompt="You are a filesystem specialist. Help users manage their files and directories.",
    mcp_servers=[filesystem_server],
    instrument=instrument,
)
github_agent = Agent(
    get_model(),
    system_prompt="You are a GitHub specialist. Help users interact with GitHub repositories and features.",
    mcp_servers=[github_server],
    instrument=instrument,
)
slack_agent = Agent(
    get_model(),
    system_prompt="You are a Slack specialist. Help users interact with Slack workspaces and channels.",
    mcp_servers=[slack_server],
    instrument=instrument,
)
firecrawl_agent = Agent(
    get_model(),
    system_prompt="You are a web crawling specialist. Help users extract data from websites.",
    mcp_servers=[firecrawl_server],
    instrument=instrument,
)

# ---- Primary orchestrator ----
primary_agent = Agent(
    get_model(),
    system_prompt="""You are a Business Strategist orchestrator. Delegate tasks to subagents based on the user's request.""",
    instrument=instrument,
)


@primary_agent.tool_plain
async def use_airtable_agent(query: str) -> dict[str, str]:
    result = await airtable_agent.run(query)
    return {"result": result.data}


@primary_agent.tool_plain
async def use_brave_search_agent(query: str) -> dict[str, str]:
    result = await brave_agent.run(query)
    return {"result": result.data}


@primary_agent.tool_plain
async def use_filesystem_agent(query: str) -> dict[str, str]:
    result = await filesystem_agent.run(query)
    return {"result": result.data}


@primary_agent.tool_plain
async def use_github_agent(query: str) -> dict[str, str]:
    result = await github_agent.run(query)
    return {"result": result.data}


@primary_agent.tool_plain
async def use_slack_agent(query: str) -> dict[str, str]:
    result = await slack_agent.run(query)
    return {"result": result.data}


@primary_agent.tool_plain
async def use_firecrawl_agent(query: str) -> dict[str, str]:
    result = await firecrawl_agent.run(query)
    return {"result": result.data}


async def main() -> None:
    """Run the orchestrator interactively."""

    print("Business Strategist Orchestrator")
    print("Enter 'exit' to quit the program.")

    async with AsyncExitStack() as stack:
        for agent in sub_agents.values():
            await stack.enter_async_context(agent.run_mcp_servers())
        await stack.enter_async_context(airtable_agent.run_mcp_servers())
        await stack.enter_async_context(brave_agent.run_mcp_servers())
        await stack.enter_async_context(filesystem_agent.run_mcp_servers())
        await stack.enter_async_context(github_agent.run_mcp_servers())
        await stack.enter_async_context(slack_agent.run_mcp_servers())
        await stack.enter_async_context(firecrawl_agent.run_mcp_servers())

        console = Console()
        messages = []

        while True:
            user_input = input("\n[You] ")
            if user_input.lower() in {"exit", "quit", "bye", "goodbye"}:
                print("Goodbye!")
                break

            try:
                memories = memory.search(query=user_input, user_id="default_user", limit=3)
                mem_str = "\n".join(f"- {m['memory']}" for m in memories["results"])
                deps = Mem0Deps(memories=mem_str)
                print("\n[Assistant]")
                curr = ""
                with Live("", console=console, vertical_overflow="visible") as live:
                    async with primary_agent.run_stream(
                        user_input, message_history=messages, deps=deps
                    ) as result:

                print("\n[Assistant]")
                curr = ""
                with Live("", console=console, vertical_overflow="visible") as live:
                    async with primary_agent.run_stream(user_input, message_history=messages) as result:

                        async for msg in result.stream_text(delta=True):
                            curr += msg
                            live.update(Markdown(curr))
                messages.extend(result.all_messages())
                memory_messages = [
                    {"role": "user", "content": user_input},
                    {"role": "assistant", "content": curr},
                ]
                memory.add(memory_messages, user_id="default_user")
            except Exception as exc:  # pragma: no cover - runtime errors
            except Exception as exc:

                print(f"\n[Error] {exc}")


if __name__ == "__main__":
    asyncio.run(run_cli())
    asyncio.run(main())
