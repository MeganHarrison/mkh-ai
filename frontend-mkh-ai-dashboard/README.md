# Supabase AI Dashboard

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/meganharrisons-projects/v0-supabase-ai-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/sZraP6ly5QS)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/meganharrisons-projects/v0-supabase-ai-dashboard](https://vercel.com/meganharrisons-projects/v0-supabase-ai-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/sZraP6ly5QS](https://v0.dev/chat/projects/sZraP6ly5QS)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Environment Variables

Create a `.env` file in this directory using `.env.example` as a starting point.
The following variables are used by the dashboard:

- `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anonymous key
- `OPENAI_API_KEY` – OpenAI API key
- `API_BEARER_TOKEN` – secret token for authenticated agent requests
- `WEBHOOK_API_KEY` – optional n8n webhook key
- `documentation_agent_key` – Documentation Agent API key
- `AGENT_BASE_URL` – base URL for the MCP agent API (defaults to `http://localhost:8001`)
