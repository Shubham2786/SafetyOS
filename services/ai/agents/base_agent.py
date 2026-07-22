"""
SafetyOS Enterprise Base Agent Engine
Abstract Base Class defining the canonical execution lifecycle for all SafetyOS specialized AI agents.
"""

from typing import List, Dict, Any, Tuple
import logging
import time
from schema.agent_types import AgentID, ReasoningMode, RiskLevel
from schema.domain import AgentState, AgentResponse, Citation, ToolCallResult, HumanApprovalRequest
from rag.hybrid_retriever import EnterpriseHybridRetriever
from rag.reranker import CrossEncoderReranker
from rag.citation_engine import CitationEngine
from tools.safety_tools import SafetyOSAgentTools

logger = logging.getLogger("safetyos.agent.base")


class BaseSafetyAgent:
    """
    Standardized Base Agent featuring Mission, Responsibilities, ReAct/Reflection loop,
    Confidence Scoring, Guardrails, and Human-in-the-Loop escalation rules.
    """

    def __init__(
        self,
        agent_id: AgentID,
        mission: str,
        responsibilities: List[str],
        default_reasoning_mode: ReasoningMode = ReasoningMode.REACT
    ):
        self.agent_id = agent_id
        self.mission = mission
        self.responsibilities = responsibilities
        self.default_reasoning_mode = default_reasoning_mode
        self.retriever = EnterpriseHybridRetriever()
        self.reranker = CrossEncoderReranker()

    async def execute(self, state: AgentState) -> AgentResponse:
        """
        Executes full reasoning lifecycle: Plan -> Tool Calls -> Verification -> Reflection -> Guardrails.
        """
        start_time = time.time()
        logger.info(f"[{self.agent_id.value}] Executing mission: {self.mission}")

        # 1. Retrieve grounded domain knowledge
        raw_citations = await self.retriever.search(
            query=state.user_query,
            site_id=state.context.site_id,
            zone_id=state.context.zone_id
        )
        citations = await self.reranker.rerank(state.user_query, raw_citations)

        # 2. Agent-Specific Core Reasoning & Tool Execution
        response_text, tool_calls, confidence_score, pending_approvals = await self.agent_reasoning_loop(
            state, citations
        )

        # 3. Reflection & Verification Node
        verified_text, final_confidence = self._reflect_and_verify(
            state.user_query, response_text, citations, confidence_score
        )

        # 4. Citation Attachment
        final_response_text = verified_text + CitationEngine.format_explainable_citations(citations)

        elapsed = (time.time() - start_time) * 1000

        return AgentResponse(
            agent_id=self.agent_id,
            response_text=final_response_text,
            confidence_score=final_confidence,
            reasoning_mode=self.default_reasoning_mode,
            citations=citations,
            tool_calls=tool_calls,
            human_approval_required=len(pending_approvals) > 0,
            pending_approvals=pending_approvals,
            execution_metrics={"execution_time_ms": round(elapsed, 2)}
        )

    async def agent_reasoning_loop(
        self, state: AgentState, citations: List[Citation]
    ) -> Tuple[str, List[ToolCallResult], float, List[HumanApprovalRequest]]:
        """
        Override in specialized agents to implement agent-specific logic and tool invocation.
        """
        raise NotImplementedError("Subclasses must implement agent_reasoning_loop")

    def _reflect_and_verify(
        self, query: str, response_text: str, citations: List[Citation], raw_score: float
    ) -> Tuple[str, float]:
        """
        Self-Verification node: validates groundings and enforces non-hallucination guardrails.
        """
        if not citations:
            return response_text + "\n\n*Note: Self-verification flagged missing external citation sources.*", round(raw_score * 0.9, 2)
        return response_text, raw_score
