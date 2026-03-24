# ProAI: Production AI Platform

A unified AI workspace for multi-model chat, RAG (Knowledge Base), and specialized Agents.

## 🚀 Quick Start (Local Docker)

1.  **Open Workspace**:
    - Open VS Code.
    - Click **File > Open Folder...** and select: `C:\Users\DELL\.gemini\antigravity\scratch\compai-suite`
    - (Or run `code .` in that directory if you have the command line tool).

2.  **Configure Environment**:
    - Copy `.env.example` to `.env`.
    - Populate your API keys (Gemini, NVIDIA, Kimi).

3.  **Launch**:
    - Open a terminal in VS Code (`Ctrl + `).
    ```bash
    docker-compose up --build
    ```

3.  **Access**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:8000](http://localhost:8000)

## 🛠 Features

- **Multi-Model Intelligence**: Hot-swap between Gemini Pro, NIM Nemotron, and Kimi K2.5.
- **Contextual Intelligence (RAG)**: Upload PDFs/MD files and chat with your local "Knowledge Base" (powered by `pgvector`).
- **Agent Lab**: Specialized agent personas (Phase 4 ongoing).
- **Premium UI**: Enterprise dark theme with glassmorphism and streaming animations.

## 📁 Project Structure

- `apps/web`: Next.js 14 Frontend.
- `apps/api`: FastAPI (Python) Backend.
- `packages/`: Shared components and logic (WIP).

## 🌍 Hosting in the Web

To host this publicly:

### 1. Cloud Infrastructure
- **Frontend**: Deploy to **Vercel** or **Netlify**. Ensure `NEXT_PUBLIC_API_URL` points to your backend.
- **Backend**: Deploy to **Railway**, **Render**, or **DigitalOcean App Platform**.
- **Database**: Use a managed PostgreSQL service with `pgvector` support (e.g., **Supabase**, **Neon**, or **AWS RDS**).

### 2. Kubernetes (Enterprise)
Manifest files are located in the `infra/k8s` directory (Phase 6 planned).

### 3. Railway / Render (Easy)
Simply link this repository to their platform. They will detect the `docker-compose` or the Dockerfiles automatically.
