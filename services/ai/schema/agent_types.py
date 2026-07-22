"""
Agent Types, Reasoning Enums, and Protocol Enums for SafetyOS Multi-Agent Engine
"""

from enum import Enum


class AgentID(str, Enum):
    SAFETY_COPILOT = "safety_copilot"
    RISK_ASSESSMENT = "risk_assessment_agent"
    INCIDENT_INVESTIGATION = "incident_investigation_agent"
    PERMIT_INTELLIGENCE = "permit_intelligence_agent"
    LOTO = "loto_agent"
    VISION_INTELLIGENCE = "vision_intelligence_agent"
    COMPLIANCE = "compliance_agent"
    PREDICTIVE_MAINTENANCE = "predictive_maintenance_agent"
    EMERGENCY_RESPONSE = "emergency_response_agent"
    KNOWLEDGE = "knowledge_agent"
    SHIFT_HANDOVER = "shift_handover_agent"
    EXECUTIVE_INTELLIGENCE = "executive_intelligence_agent"


class ReasoningMode(str, Enum):
    REACT = "ReAct"
    PLAN_AND_EXECUTE = "Plan-and-Execute"
    TREE_OF_THOUGHT = "Tree-of-Thought"
    REFLECTION = "Reflection"
    SELF_VERIFICATION = "Self-Verification"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    CATASTROPHIC = "CATASTROPHIC"


class HaloStepType(str, Enum):
    OBSERVED = "OBSERVED"
    RETRIEVED = "RETRIEVED"
    REASONED = "REASONED"
    VERIFIED = "VERIFIED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    EXECUTED = "EXECUTED"
    ESCALATED = "ESCALATED"
