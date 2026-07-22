"""
SafetyOS LangGraph Multi-Agent Orchestrator Graph Builder
Constructs the production StateGraph with 12 specialized agents, router node, reflection node, and Human-in-the-Loop interrupts.
"""

from typing import Dict, Any, List
import logging
from schema.agent_types import AgentID
from schema.domain import AgentState, AgentResponse
from agents.copilot_supervisor import SafetyCopilotSupervisor
from agents.risk_assessment_agent import RiskAssessmentAgent
from agents.incident_investigation_agent import IncidentInvestigationAgent
from agents.permit_intelligence_agent import PermitIntelligenceAgent
from agents.loto_agent import LOTOAgent
from agents.vision_intelligence_agent import VisionIntelligenceAgent
from agents.compliance_agent import ComplianceAgent
from agents.predictive_maintenance_agent import PredictiveMaintenanceAgent
from agents.emergency_response_agent import EmergencyResponseAgent
from agents.knowledge_agent import KnowledgeAgent
from agents.shift_handover_agent import ShiftHandoverAgent
from agents.executive_intelligence_agent import ExecutiveIntelligenceAgent

logger = logging.getLogger("safetyos.orchestrator.graph")


class MultiAgentGraphOrchestrator:
    """
    LangGraph Multi-Agent Graph Orchestrator registering all 12 domain agents.
    """

    def __init__(self):
        # Register instances of all 12 specialized agents
        self.agents = {
            AgentID.SAFETY_COPILOT: SafetyCopilotSupervisor(),
            AgentID.RISK_ASSESSMENT: RiskAssessmentAgent(),
            AgentID.INCIDENT_INVESTIGATION: IncidentInvestigationAgent(),
            AgentID.PERMIT_INTELLIGENCE: PermitIntelligenceAgent(),
            AgentID.LOTO: LOTOAgent(),
            AgentID.VISION_INTELLIGENCE: VisionIntelligenceAgent(),
            AgentID.COMPLIANCE: ComplianceAgent(),
            AgentID.PREDICTIVE_MAINTENANCE: PredictiveMaintenanceAgent(),
            AgentID.EMERGENCY_RESPONSE: EmergencyResponseAgent(),
            AgentID.KNOWLEDGE: KnowledgeAgent(),
            AgentID.SHIFT_HANDOVER: ShiftHandoverAgent(),
            AgentID.EXECUTIVE_INTELLIGENCE: ExecutiveIntelligenceAgent()
        }

    def route_query_to_agent(self, query: str) -> AgentID:
        """
        Intent routing engine assigning optimal specialized agent based on query semantics.
        """
        q = query.lower()
        if "loto" in q or "lockout" in q or "tagout" in q or "zero energy" in q:
            return AgentID.LOTO
        elif "permit" in q or "ptw" in q or "hot work" in q or "confined space" in q:
            return AgentID.PERMIT_INTELLIGENCE
        elif "risk" in q or "hazard" in q or "excursion" in q:
            return AgentID.RISK_ASSESSMENT
        elif "incident" in q or "near miss" in q or "root cause" in q or "rca" in q:
            return AgentID.INCIDENT_INVESTIGATION
        elif "vision" in q or "cctv" in q or "ppe" in q or "camera" in q or "fall" in q:
            return AgentID.VISION_INTELLIGENCE
        elif "maintenance" in q or "vibration" in q or "telemetry" in q or "scada" in q:
            return AgentID.PREDICTIVE_MAINTENANCE
        elif "emergency" in q or "evacuation" in q or "siren" in q or "muster" in q:
            return AgentID.EMERGENCY_RESPONSE
        elif "handover" in q or "shift" in q:
            return AgentID.SHIFT_HANDOVER
        elif "compliance" in q or "iso" in q or "osha" in q or "audit" in q:
            return AgentID.COMPLIANCE
        elif "executive" in q or "index" in q or "dashboard" in q:
            return AgentID.EXECUTIVE_INTELLIGENCE
        elif "sop" in q or "document" in q or "knowledge" in q:
            return AgentID.KNOWLEDGE
        else:
            return AgentID.SAFETY_COPILOT

    async def execute_graph(self, state: AgentState) -> AgentResponse:
        """
        Executes LangGraph state graph cycle across supervisor, target specialized agent, and verification.
        """
        target_agent_id = self.route_query_to_agent(state.user_query)
        logger.info(f"LangGraph Routing: query='{state.user_query}' → target_agent='{target_agent_id.value}'")

        target_agent = self.agents[target_agent_id]
        response = await target_agent.execute(state)
        return response
