# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js v18+
- PostgreSQL Connection String
- Redis Connection String
- OpenAI / Gemini API Keys

## Local Development (Full Stack)

1. **Clone Repository**
   ```bash
   git clone <repo_url>
   cd coara
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create .env file with DB credentials
   npm run dev
   ```

## Production Deployment (Docker)

1. **Build Images**
   ```bash
   docker-compose build
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Database Migrations**
   ```bash
   docker-compose exec server npm run migrate
   ```

## Environment Variables (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```
