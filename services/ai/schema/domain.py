"""
Domain Schemas and State Definitions for SafetyOS Enterprise Multi-Agent Engine
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from schema.agent_types import AgentID, ReasoningMode, RiskLevel, HaloStepType


class Citation(BaseModel):
    citation_id: str = Field(description="Unique identifier for the citation")
    title: str = Field(description="Title of the source document or standard")
    source_type: str = Field(description="Type of source e.g. SOP, REGULATION, INCIDENT_LOG, SCADA")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Relevance and accuracy score")
    snippet: str = Field(description="Verbatim excerpt or summarized evidence")
    document_uri: Optional[str] = None
    section_ref: Optional[str] = None


class SafetyContext(BaseModel):
    tenant_id: str
    site_id: str
    zone_id: Optional[str] = None
    user_id: str = "operator_user"
    user_role: str = "SAFETY_ENGINEER"
    active_permits: List[str] = Field(default_factory=list)
    active_loto_tags: List[str] = Field(default_factory=list)
    current_shift_id: Optional[str] = None


class ToolCallResult(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    status: str  # SUCCESS, ERROR, PENDING_APPROVAL
    output: Dict[str, Any]
    execution_time_ms: float


class HumanApprovalRequest(BaseModel):
    request_id: str
    agent_id: AgentID
    action_type: str
    target_resource: str
    proposed_payload: Dict[str, Any]
    risk_level: RiskLevel
    reasoning: str
    status: str = "PENDING"  # PENDING, APPROVED, REJECTED
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AgentState(BaseModel):
    """
    Typed LangGraph state shared across all agents in the orchestration graph.
    """
    conversation_id: str
    user_query: str
    context: SafetyContext
    assigned_agents: List[AgentID] = Field(default_factory=list)
    current_agent: AgentID = AgentID.SAFETY_COPILOT
    reasoning_mode: ReasoningMode = ReasoningMode.REACT
    reasoning_steps: List[Dict[str, Any]] = Field(default_factory=list)
    retrieved_citations: List[Citation] = Field(default_factory=list)
    working_memory: Dict[str, Any] = Field(default_factory=dict)
    tool_history: List[ToolCallResult] = Field(default_factory=list)
    human_approvals: List[HumanApprovalRequest] = Field(default_factory=list)
    confidence_score: float = 1.0
    final_response: Optional[str] = None
    requires_human_approval: bool = False
    error_message: Optional[str] = None


class AgentResponse(BaseModel):
    agent_id: AgentID
    response_text: str
    confidence_score: float
    reasoning_mode: ReasoningMode
    citations: List[Citation]
    tool_calls: List[ToolCallResult]
    human_approval_required: bool
    pending_approvals: List[HumanApprovalRequest] = Field(default_factory=list)
    execution_metrics: Dict[str, float] = Field(default_factory=dict)
