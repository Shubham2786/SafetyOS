"""
SafetyOS Enterprise Multi-Agent AI Service Entry Point (FastAPI)
Exposes REST APIs, 9-State Halo Orb SSE streaming, hybrid RAG search, direct agent invocation, and Prometheus metrics.
"""

from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from services.ai.security.opa_middleware import OPAMiddleware
import logging
import uuid

from config import settings
from schema.agent_types import AgentID
from schema.domain import AgentState, SafetyContext, AgentResponse
from memory.manager import MultiTierAgentMemoryManager
from rag.hybrid_retriever import EnterpriseHybridRetriever
from rag.reranker import CrossEncoderReranker
from orchestrator.graph_builder import MultiAgentGraphOrchestrator
from orchestrator.halo_streamer import HaloOrbStreamer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("safetyos.ai.main")

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Enterprise Multi-Agent Platform for SafetyOS zero-trust industrial safety reasoning."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(OPAMiddleware)

# Initialize Core Platform Services
memory_manager = MultiTierAgentMemoryManager()
retriever = EnterpriseHybridRetriever()
reranker = CrossEncoderReranker()
orchestrator = MultiAgentGraphOrchestrator()
streamer = HaloOrbStreamer(orchestrator)


class ChatQueryRequest(BaseModel):
    prompt: str = Field(description="Natural language safety query or instruction")
    tenant_id: str = Field(default="tenant-default")
    site_id: str = Field(default="SITE-01")
    zone_id: Optional[str] = Field(default="Z-02")
    user_id: Optional[str] = Field(default="operator_01")
    user_role: Optional[str] = Field(default="SAFETY_ENGINEER")


class HybridSearchRequest(BaseModel):
    query: str
    site_id: str
    zone_id: Optional[str] = None
    top_k: int = Field(default=5)


@app.get("/healthz")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "agents_registered": len(orchestrator.agents),
        "version": "2.0.0"
    }


@app.get("/api/v1/ai/agents")
async def list_agents():
    """
    Lists all 12 registered specialized AI agents with their missions and capabilities.
    """
    agents_info = []
    for agent_id, agent_inst in orchestrator.agents.items():
        agents_info.append({
            "agent_id": agent_id.value,
            "mission": agent_inst.mission,
            "responsibilities": agent_inst.responsibilities,
            "default_reasoning_mode": agent_inst.default_reasoning_mode.value
        })
    return {"success": True, "count": len(agents_info), "agents": agents_info}


@app.post("/api/v1/ai/copilot/chat")
async def copilot_chat(request: ChatQueryRequest) -> AgentResponse:
    """
    Synchronous Multi-Agent query execution returning structured response and citations.
    """
    context = SafetyContext(
        tenant_id=request.tenant_id,
        site_id=request.site_id,
        zone_id=request.zone_id,
        user_id=request.user_id,
        user_role=request.user_role
    )
    state = AgentState(
        conversation_id=f"conv-{uuid.uuid4().hex[:8]}",
        user_query=request.prompt,
        context=context
    )
    response = await orchestrator.execute_graph(state)
    await memory_manager.add_conversation_turn(state.conversation_id, "user", request.prompt)
    await memory_manager.add_conversation_turn(state.conversation_id, "assistant", response.response_text)
    return response


@app.post("/api/v1/ai/copilot/stream")
async def copilot_stream(request: ChatQueryRequest):
    """
    Server-Sent Events (SSE) endpoint streaming real-time 9-state Halo Orb updates.
    """
    context = SafetyContext(
        tenant_id=request.tenant_id,
        site_id=request.site_id,
        zone_id=request.zone_id,
        user_id=request.user_id,
        user_role=request.user_role
    )
    state = AgentState(
        conversation_id=f"conv-{uuid.uuid4().hex[:8]}",
        user_query=request.prompt,
        context=context
    )
    return StreamingResponse(
        streamer.stream_reasoning_trace(state),
        media_type="text/event-stream"
    )


@app.post("/api/v1/ai/agents/{agent_id}/invoke")
async def invoke_specific_agent(
    agent_id: AgentID = Path(..., description="Target specialized agent ID"),
    request: ChatQueryRequest = ...
) -> AgentResponse:
    """
    Direct invocation endpoint for targeted specialized agent execution.
    """
    if agent_id not in orchestrator.agents:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found.")

    context = SafetyContext(
        tenant_id=request.tenant_id,
        site_id=request.site_id,
        zone_id=request.zone_id,
        user_id=request.user_id,
        user_role=request.user_role
    )
    state = AgentState(
        conversation_id=f"conv-direct-{uuid.uuid4().hex[:8]}",
        user_query=request.prompt,
        context=context
    )
    target_agent = orchestrator.agents[agent_id]
    response = await target_agent.execute(state)
    return response


@app.post("/api/v1/ai/rag/hybrid-search")
async def hybrid_search(request: HybridSearchRequest):
    """
    Enterprise RAG Endpoint: Hybrid Dense Vector + Neo4j Graph + BM25 search.
    """
    raw_citations = await retriever.search(
        query=request.query,
        site_id=request.site_id,
        zone_id=request.zone_id,
        top_k=request.top_k * 2
    )
    reranked = await reranker.rerank(request.query, raw_citations, top_n=request.top_k)
    return {
        "success": True,
        "query": request.query,
        "total_retrieved": len(reranked),
        "citations": [c.model_dump() for c in reranked]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
