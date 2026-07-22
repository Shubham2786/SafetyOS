"""
SafetyOS 9-State Interactive Halo Orb SSE Event Streamer
Formats multi-agent execution steps into Server-Sent Events (SSE) for Next.js control room UIs.
"""

from typing import AsyncGenerator
import asyncio
import json
from schema.domain import AgentState
from orchestrator.graph_builder import MultiAgentGraphOrchestrator


class HaloOrbStreamer:
    """
    Streams multi-agent reasoning steps, active tool calls, and human approval events to the Halo Orb.
    """

    def __init__(self, orchestrator: MultiAgentGraphOrchestrator):
        self.orchestrator = orchestrator

    async def stream_reasoning_trace(self, state: AgentState) -> AsyncGenerator[str, None]:
        """
        Emits 9-state SSE payloads matching the canonical SafetyOS Halo Orb UI specifications.
        """
        # Step 1: OBSERVED
        step1 = {
            "step": 1,
            "type": "OBSERVED",
            "agent": "Safety Copilot",
            "description": f"Parsing safety query for site '{state.context.site_id}', zone '{state.context.zone_id or 'Z-02'}'"
        }
        yield f"data: {json.dumps(step1)}\n\n"
        await asyncio.sleep(0.2)

        # Step 2: RETRIEVED
        target_agent_id = self.orchestrator.route_query_to_agent(state.user_query)
        step2 = {
            "step": 2,
            "type": "RETRIEVED",
            "agent": target_agent_id.value,
            "description": f"Routed to {target_agent_id.value}; querying Qdrant Vector & Neo4j Spatial Graph"
        }
        yield f"data: {json.dumps(step2)}\n\n"
        await asyncio.sleep(0.3)

        # Execute agent graph
        response = await self.orchestrator.execute_graph(state)

        # Step 3: REASONED
        step3 = {
            "step": 3,
            "type": "REASONED",
            "agent": target_agent_id.value,
            "description": f"Formulated recommendations with {int(response.confidence_score * 100)}% confidence score"
        }
        yield f"data: {json.dumps(step3)}\n\n"
        await asyncio.sleep(0.2)

        # Step 4: VERIFIED / APPROVAL_REQUIRED
        if response.human_approval_required:
            step4 = {
                "step": 4,
                "type": "APPROVAL_REQUIRED",
                "agent": target_agent_id.value,
                "description": f"Human-In-The-Loop approval required for action: {response.pending_approvals[0].action_type}",
                "pending_approval": response.pending_approvals[0].model_dump()
            }
            yield f"data: {json.dumps(step4)}\n\n"
            await asyncio.sleep(0.2)

        # Final Step: EXECUTED / RESPONDED payload
        final_payload = {
            "step": 5,
            "type": "EXECUTED",
            "agent": target_agent_id.value,
            "response": response.response_text,
            "citations": [c.model_dump() for c in response.citations],
            "tool_calls": [t.model_dump() for t in response.tool_calls],
            "confidence_score": response.confidence_score
        }
        yield f"data: {json.dumps(final_payload)}\n\n"
