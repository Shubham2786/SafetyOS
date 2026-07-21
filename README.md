# SafetyOS

Enterprise‑grade AI‑powered Industrial Safety Intelligence Platform.

## Overview
SafetyOS provides real‑time safety monitoring, AI‑driven risk analysis, digital twin visualizations, and a robust backend architecture built on microservices, event‑driven pipelines, and multi‑tenant data stores.

## Repository Structure
- `frontend/` – Next.js 15 application (React 19, TypeScript, TailwindCSS, shadcn/ui).
- `services/` – Backend microservices (Go, Python) for auth, BFF, AI, workflow engine, etc.
- `infra/` – Infrastructure‑as‑Code (Terraform) for cloud resources.
- `docs/` – Architecture decision records, design specs, onboarding guides.
- `docker-compose.yml` – Local development stack.

## Getting Started
```bash
# Clone the repo
git clone <repo-url>
cd SafetyOS

# Start local services
docker compose up -d

# Install frontend dependencies and run dev server
cd frontend
npm install
npm run dev
```

For detailed setup instructions see `docs/README.md`.
