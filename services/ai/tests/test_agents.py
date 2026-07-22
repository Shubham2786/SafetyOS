"""
SafetyOS Multi-Agent Platform Unit and Integration Tests
Validates all 12 agents, hybrid RAG retriever, routing engine, and human-in-the-loop guardrails.
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Ensure services/ai directory is in Python path for test discovery
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from schema.agent_types import AgentID
from schema.domain import AgentState, SafetyContext
from orchestrator.graph_builder import MultiAgentGraphOrchestrator
from rag.hybrid_retriever import EnterpriseHybridRetriever
from memory.manager import MultiTierAgentMemoryManager


@pytest.mark.asyncio
async def test_all_12_agents_registered():
    orchestrator = MultiAgentGraphOrchestrator()
    assert len(orchestrator.agents) == 12
    for agent_id in AgentID:
        assert agent_id in orchestrator.agents


@pytest.mark.asyncio
async def test_intent_routing():
    orchestrator = MultiAgentGraphOrchestrator()
    assert orchestrator.route_query_to_agent("What are the LOTO isolation valves for pump P102?") == AgentID.LOTO
    assert orchestrator.route_query_to_agent("Issue a hot work permit for confined space entry") == AgentID.PERMIT_INTELLIGENCE
    assert orchestrator.route_query_to_agent("Analyze recent CCTV PPE helmet violations") == AgentID.VISION_INTELLIGENCE
    assert orchestrator.route_query_to_agent("Root cause analysis of gas pressure spike") == AgentID.INCIDENT_INVESTIGATION
    assert orchestrator.route_query_to_agent("Evaluate plant safety index score") == AgentID.EXECUTIVE_INTELLIGENCE


@pytest.mark.asyncio
async def test_loto_agent_execution_and_guardrail():
    orchestrator = MultiAgentGraphOrchestrator()
    context = SafetyContext(tenant_id="tenant-test", site_id="SITE-01", zone_id="Z-02")
    state = AgentState(
        conversation_id="conv-test-loto",
        user_query="Trace zero energy isolation for hydraulic valve V-102",
        context=context
    )
    response = await orchestrator.execute_graph(state)
    assert response.agent_id == AgentID.LOTO
    assert response.confidence_score >= 0.85
    assert len(response.citations) > 0
    assert response.human_approval_required is True
    assert len(response.pending_approvals) > 0


@pytest.mark.asyncio
async def test_hybrid_retriever():
    retriever = EnterpriseHybridRetriever()
    citations = await retriever.search(query="LOTO procedure valve isolation", site_id="SITE-01")
    assert len(citations) > 0
    assert citations[0].confidence_score >= 0.80


@pytest.mark.asyncio
async def test_multi_tier_memory():
    memory = MultiTierAgentMemoryManager()
    await memory.add_conversation_turn("conv-1", "user", "What is ISO 45001 standard?")
    history = await memory.get_conversation_history("conv-1")
    assert len(history) == 1
    assert history[0]["content"] == "What is ISO 45001 standard?"
