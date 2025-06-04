# Next Level AI Agents

## Objective

Create a visually beautiful, intuitive, and high-functioning front-end interface designed for a powerful suite of AI agents. This app should make interacting with your AI assistant seamless, personalized, and delightful across business workflows, content creation, and technical documentation.

## Core UX Requirements

- Sleek, clean UI optimized for both mobile and desktop
- Supabase authentication
- Light/dark theme toggle
- Sidebar navigation that collapses to icons
- Structured chat display (bubbles, cards, or clean layout with headings)
- Sticky input bar for sending messages
- Typing animation and AI response fade-in
- Smooth transition effects

## Interface Pages

**Dashboard**

**Agents**

1. **Business Strategist** (RAG Supabase vector store and MCP servers with multi-agent orchestration)
2. **Documentation Agent** (Use Crawl4ai to scrape urls and add to Supabase vector store)
3. **Content Lab**
4. **Lead Generation and Sales Agent**

**Database Pages**

1. Products + Services
2. Customers
3. Sales
4. Content Library
5. Projects

**Additional Pages**

1. Login
2. Create Account
3. Forgot Password
4. Account

## MCP Servers

- **Supabase**: Store all user data, content ideas, and embedded documentation
- Mem0
- Tavily
- Notion
- Slack
- Github
- BraveSearch
- YouTube
- **n8n**: Webhook for intelligent agent responses

## Platforms

### Frontend Platforms

- NextJS
- Tailwind
- Shadcn UI
- Supabase UI Library
- Vercel

### Backend Platforms

- Pydantic AI
- Langchain
- Langfuse
- Zapier
- Mem0

## **Core Architecture**

**Frontend**:

- **Framework**: Next.js (with App Router)
- **Auth**: Supabase Auth
- **State Management**: React (for agent/task state)
- **Styling/UI**: Tailwind CSS + ShadCN UI (or similar)

**Backend/API Layer**:

- **Edge Functions or Next.js API Routes** for routing requests to agents
- **Supabase**: Postgres DB + Edge Functions + Vector Store (pgvector)
- **Agent Backends**: Python (FastAPI or LangChain) agents deployed as services

**Data Stores**:

- **Supabase Tables**: Users, Business Data, Project Management, etc.
- **Supabase Vector Store**: For RAG-style queries per business
- **Notion API**: For 2-way sync with Supabase (periodic CRON or Webhooks)

### **Tech Stack**

| **Layer** | **Tool** |
| --- | --- |
| Frontend | Next.js, Tailwind, React |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Vector Store | Supabase pgvector |
| AI Agents | Python, Pydantic AI, or OpenAI + LangChain/CrewAI |
| Integration APIs | Notion, WordPress REST, Crawl4AI |
| Hosting | Vercel (Frontend), Railway/Fly.io/Digital Ocean/Render (Agents) |

## **Foundational Setup**

1. **Auth & Dashboard**
    - Set up Supabase Auth (email/password or OAuth)
    - Build a protected dashboard route in Next.js
    - Create basic Supabase tables: users, business_docs, projects, leads, etc.
2. **Embedding & Vector Search**
    - Use OpenAI or another model to embed uploaded docs
    - Store embeddings in pgvector in Supabase
    - Build a basic chat interface powered by an agent that queries these embeddings
3. **CRUD Interface**
    - Use Supabase client to pull/display tables (e.g., products, leads)
    - Build simple UI to add/delete/update records (admin dashboard)

### Dashboard Homepage

- 3-column grid of cards for:
    - Business Strategist Agent Chat
    - Documentation Expert Chat
    - Content Lab
    - Copywriting Agent
    - Sales Agent
    - Databases
- Each card = icon, short description, CTA button

### Business Strategist Chat (RAG with Multi-Agent Orchestration)

**Agent Orchestration & Tools**

- Introduce tool routing (e.g., via LangChain’s AgentExecutor or Autogen roles):
- Use routing logic:
    - Strategy Agent decides what other agent(s) to delegate to
    - Chain-of-Thought reasoning or tool selection tree
- Agent uses:
    - Supabase RAG context retrieval
    - Access to CRUD layer
    - Tools like NotionTool, WordPressTool
    - Mem0 or similar tool for long-term memory
- Chat interface
- Display chat history in secondary sidebar
- Expose via API /api/agents/strategy
- Use webhook to connect with n8n workflow: `https://agents.nextlevelaiagents.com/webhook/chat`
- POST JSON input with `chat_input` and `session_id`
- Display structured responses
- Button to add additional files to vector store (documents table)

### Documentation Expert Chat (RAG)

- AI agent with same chat format - uses “crawled-pages” Supabase table as the vector store
- Connect to endpoint for ai agent
- Feature: **Add Documentation**
    - Form: name + sitemap URL
    - Show progress bar during backend process
    - Notify: "Documentation added."
    - Tooltip for "Instructions"

### Content Lab

- Supabase Table (connect to `content_ideas` table)
    - Display tables in horizontal tabs based on status (Idea, Production, Published)
- Actions: Add new, Edit, Delete
- Chat interface at the bottom of the page connected to the Content Lab Agent
- Edit page: Pull Supabase row details into full page view

### **Notion Sync & Project Management Agent**

- Sync Notion DB → Supabase via:
    - CRON Job (serverless function or background worker)
    - Webhook listener (if supported)
- Project Manager agent gets:
    - Project deadlines
    - Milestones
    - Can send updates via Notion comments, Slack, or email

### LeadGenAgent: web scraper or CRM connector

### Account Page

- User avatar
- Change name/email/password/profile
- API Key input field (saved per user session)