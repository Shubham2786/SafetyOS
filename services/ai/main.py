"""
SafetyOS AI Service Entry Point (FastAPI)
Exposes RAG query endpoints and SSE streaming reasoning traces.
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from rag_pipeline import KnowledgeGraphRAGPipeline
from agent_orchestrator import AgentOrchestrator

app = FastAPI(title="SafetyOS AI & Agent Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_pipeline = KnowledgeGraphRAGPipeline()
orchestrator = AgentOrchestrator()

class QueryRequest(BaseModel):
    prompt: str
    tenant_id: str
    site_id: str
    zone_id: Optional[str] = None

@app.get("/healthz")
async def health_check():
    return {"status": "healthy", "service": "ai-agent-service"}

@app.post("/api/v1/ai/rag/query")
async def rag_query(request: QueryRequest):
    citations = await rag_pipeline.query_knowledge_graph(request.prompt, request.site_id)
    return {
        "success": True,
        "query": request.prompt,
        "citations": citations
    }

@app.post("/api/v1/ai/copilot/stream")
async def stream_copilot_reasoning(request: QueryRequest):
    return StreamingResponse(
        orchestrator.stream_reasoning_trace(request.prompt, request.tenant_id, request.site_id),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
