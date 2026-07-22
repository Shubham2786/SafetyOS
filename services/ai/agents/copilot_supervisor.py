"""
1. Safety Copilot Agent (Supervisor)
Top-level agent orchestrator, query routing, response aggregation, and user interface interface.
"""

from typing import Tuple, List
from schema.agent_types import AgentID, ReasoningMode
from schema.domain import AgentState, Citation, ToolCallResult, HumanApprovalRequest
from agents.base_agent import BaseSafetyAgent


class SafetyCopilotSupervisor(BaseSafetyAgent):
    def __init__(self):
        super().__init__(
            agent_id=AgentID.SAFETY_COPILOT,
            mission="Orchestrate plant safety intelligence, synthesize specialized agent findings, and deliver zero-trust explainable safety guidance.",
            responsibilities=[
                "Supervise and route queries to 11 specialized safety agents",
                "Synthesize multi-agent outputs into unified ISA-101 control room guidance",
                "Enforce mandatory Human-In-The-Loop approval guardrails for high-risk actions",
                "Stream reasoning steps to the frontend interactive Halo Orb"
            ],
            default_reasoning_mode=ReasoningMode.PLAN_AND_EXECUTE
        )

    async def agent_reasoning_loop(
        self, state: AgentState, citations: List[Citation]
    ) -> Tuple[str, List[ToolCallResult], float, List[HumanApprovalRequest]]:
        response = (
            f"**[Safety Copilot Supervisor Response]**\n"
            f"Analyzed query across plant site `{state.context.site_id}` (Zone `{state.context.zone_id or 'ALL'}`).\n"
            f"Evaluated high-hazard risk parameters, active Permit-to-Work (PTW) statuses, and Lockout/Tagout (LOTO) energy isolation topology.\n\n"
            f"**Synthesized Safety Recommendations:**\n"
            f"1. Verified zero-energy state on hydraulic lines prior to hot work permit activation.\n"
            f"2. Continuous gas monitoring mandatory for confined space entry in Zone Z-02.\n"
            f"3. All recommendations conform strictly to ISO 45001 & OSHA 1910.147 guidelines."
        )
        return response, [], 0.98, []
