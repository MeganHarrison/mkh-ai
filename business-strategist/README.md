# Business Strategist Orchestrator

This module consolidates the MCP-based agents from the project into a single orchestrator. It optionally enables Langfuse observability when the environment variable `ENABLE_LANGFUSE` is set to `true`.

## Usage

1. Create a `.env` file with your API keys and model configuration. Example variables include `LLM_API_KEY`, `MODEL_CHOICE`, `AIRTABLE_API_KEY`, `BRAVE_API_KEY`, `LOCAL_FILE_DIR`, `GITHUB_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, and `FIRECRAWL_API_KEY`. Set `ENABLE_LANGFUSE=true` and provide the standard Langfuse keys to enable observability.
2. Install dependencies and run the agent:

```bash
pip install -r requirements.txt
python business_strategist.py
```

## Docker

Build and run the container:

```bash
docker build -t business-strategist .
docker run --env-file .env -it business-strategist
```

The container exposes port `8001` for compatibility with common hosting platforms like Render or Digital Ocean.
