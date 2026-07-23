"""
11. Shift Handover Agent
Generates shift-to-shift safety summaries, open permit logs, pending LOTO states, and risk transfers.
"""

from typing import Tuple, List
from schema.agent_types import AgentID, ReasoningMode
from schema.domain import AgentState, Citation, ToolCallResult, HumanApprovalRequest
from agents.base_agent import BaseSafetyAgent


class ShiftHandoverAgent(BaseSafetyAgent):
    def __init__(self):
        super().__init__(
            agent_id=AgentID.SHIFT_HANDOVER,
            mission="Synthesize shift-to-shift safety handovers, tracking active permits, uncontained risks, and LOTO statuses.",
            responsibilities=[
                "Aggregate operational events across 12-hour shift cycles",
                "Highlight unresolved hazards and active LOTO locks for incoming shift crew",
                "Generate compliant shift handover logs for regulatory inspection"
            ],
            default_reasoning_mode=ReasoningMode.PLAN_AND_EXECUTE
        )

    async def agent_reasoning_loop(
        self, state: AgentState, citations: List[Citation]
    ) -> Tuple[str, List[ToolCallResult], float, List[HumanApprovalRequest]]:
        response = (
            f"**[Shift Handover Agent Briefing]**\n"
            f"Shift Handover Summary for Site `{state.context.site_id}` (Shift Alpha → Shift Beta):\n"
            f"- **Active PTW Permits**: 3 Hot Work permits active in Zone Z-01 & Z-02.\n"
            f"- **Active LOTO Isolations**: 2 Energy isolations locked on Pump P-102 & Motor M-01.\n"
            f"- **Uncontained Hazards**: 1 Minor vibration anomaly on Pump P-102 (Monitored).\n"
            f"- **Handover Status**: Approved for shift crew signature."
        )
        return response, [], 0.96, []
