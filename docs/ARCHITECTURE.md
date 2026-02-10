# CoAra System Architecture

## Overview
CoAra is a production-ready AI-native advertising platform designed to allow advertisers to control how AI models mention, rank, and recommend their brand.

## Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS / Vanilla CSS
- **State Management**: React Context / Hooks
- **Visualization**: Recharts (for dashboards)

### Backend
- **Runtime**: Node.js (Express)
- **Language**: TypeScript/JavaScript
- **AI Processing**: Python (FastAPI) [Optional for identifying intents, can be Node.js via APIs]

### Database
- **Primary DB**: PostgreSQL
- **Cache**: Redis
- **Vector DB**: Pinecone / Weaviate / Qdrant (for RAG)

### AI Pipeline
- **Models**: OpenAI GPT-4, Gemini 1.5 Pro, Claude 3.5 Sonnet
- **Orchestration**: LangChain / Custom Agentic Workflow

## System Modules

### 1. AI Influence Score Engine
- Tracks brand mentions across AI models.
- Ranks brand position (Top/Middle/Bottom).
- Scores trust signals (citations, reviews).

### 2. Brand Digital Twin Engine
- Programmable AI identity for usage in RAG.
- Stores brand tone, claims, compliance rules.
- Vector Knowledge Base connectivity.

### 3. Intent Prediction Engine
- Classifies user queries (Learn, Compare, Decide, Buy).
- Predicts next likely prompts.

### 4. Autonomous Campaign Manager
- Auto-adjusts bids and prompts.
- Runs A/B tests on sponsored answers.

### 5. Live Answer Injection System
- Injects sponsored content into AI answers.
- Ensures compliance and brand safety.

## Data Flow
1. **User Prompt** -> **Intent Check** (Backend/AI)
2. **Intent Check** -> **Brand Eligibility** (Postgres)
3. **Brand Eligibility** -> **Digital Twin Retrieval** (Vector DB)
4. **Digital Twin** -> **Compliance Filter**
5. **Final Output** -> **AI Response**
