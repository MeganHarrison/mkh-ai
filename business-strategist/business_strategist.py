from __future__ import annotations
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
except ImportError:  # handle relative path when not installed as a package
    import importlib.util
    from pathlib import Path

    module_path = Path(__file__).resolve().parent.parent / "pydantic-ai-langfuse" / "configure_langfuse.py"
    spec = importlib.util.spec_from_file_location("configure_langfuse", module_path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        configure_langfuse = module.configure_langfuse  # type: ignore
    else:
        configure_langfuse = lambda: None

load_dotenv()


def get_model() -> OpenAIModel:
    """Return the configured OpenAI model."""
    llm = os.getenv("MODEL_CHOICE", "gpt-4o-mini")
    base_url = os.getenv("BASE_URL", "https://api.openai.com/v1")
    api_key = os.getenv("LLM_API_KEY", "")
    return OpenAIModel(llm, provider=OpenAIProvider(base_url=base_url, api_key=api_key))


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
                print("\n[Assistant]")
                curr = ""
                with Live("", console=console, vertical_overflow="visible") as live:
                    async with primary_agent.run_stream(user_input, message_history=messages) as result:
                        async for msg in result.stream_text(delta=True):
                            curr += msg
                            live.update(Markdown(curr))
                messages.extend(result.all_messages())
            except Exception as exc:
                print(f"\n[Error] {exc}")


if __name__ == "__main__":
    asyncio.run(main())
