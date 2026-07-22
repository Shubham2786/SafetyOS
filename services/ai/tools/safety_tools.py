"""
SafetyOS Enterprise Agent Tool Layer
Grounded tools for SCADA, OPA authorization, Spatial Graph, Telemetry, and Human Approval.
"""

from typing import Dict, Any, List
import logging
import uuid
import time
from schema.domain import ToolCallResult, HumanApprovalRequest, RiskLevel
from schema.agent_types import AgentID

logger = logging.getLogger("safetyos.tools")


class SafetyOSAgentTools:
    """
    Standardized safety domain tools exposed to specialized agents.
    """

    @staticmethod
    async def query_spatial_knowledge_graph(cypher_query: str, tenant_id: str, site_id: str) -> ToolCallResult:
        """
        Executes spatial Cypher queries on Neo4j to trace equipment connectivity & isolation lines.
        """
        start_time = time.time()
        logger.info(f"Querying Neo4j Spatial Graph: {cypher_query}")
        
        mock_graph_output = {
            "query": cypher_query,
            "nodes_found": [
                {"id": "VALVE_V102", "label": "HydraulicValve", "status": "CLOSED"},
                {"id": "BREAKER_B42", "label": "ElectricalBreaker", "status": "OPEN"},
                {"id": "MOTOR_M01", "label": "PumpMotor", "status": "ISOLATED"}
            ],
            "relationships": [
                {"source": "VALVE_V102", "target": "MOTOR_M01", "type": "ISOLATES_FLUID"},
                {"source": "BREAKER_B42", "target": "MOTOR_M01", "type": "ISOLATES_POWER"}
            ]
        }
        elapsed = (time.time() - start_time) * 1000
        return ToolCallResult(
            tool_name="query_spatial_knowledge_graph",
            arguments={"cypher_query": cypher_query, "tenant_id": tenant_id, "site_id": site_id},
            status="SUCCESS",
            output=mock_graph_output,
            execution_time_ms=round(elapsed, 2)
        )

    @staticmethod
    async def evaluate_opa_permit_policy(tenant_id: str, site_id: str, permit_type: str, zone_id: str) -> ToolCallResult:
        """Delegate OPA policy evaluation to OPAMiddleware.

        Constructs a payload and utilizes the middleware's ``evaluate_policy`` method to
        obtain an allow/deny decision. Returns a ``ToolCallResult`` compatible with the
        existing tooling contract.
        """
        from services.ai.agents.governance_agent import governance_agent
        start_time = time.time()
        logger.info(f"Evaluating OPA Permit Policy via GovernanceAgent for type '{permit_type}' in zone '{zone_id}'")
        payload = {
            "tenant_id": tenant_id,
            "site_id": site_id,
            "permit_type": permit_type,
            "zone_id": zone_id,
        }
        result = await governance_agent.check_action_opa("evaluate_opa_permit_policy", payload)
        allowed = result.get("allowed", False)
        elapsed = (time.time() - start_time) * 1000
        return ToolCallResult(
            tool_name="evaluate_opa_permit_policy",
            arguments=payload,
            status="SUCCESS" if allowed else "FAILURE",
            output=result,
            execution_time_ms=round(elapsed, 2)
        )




    @staticmethod
    async def get_telemetry_time_series(equipment_id: str, duration_minutes: int = 60) -> ToolCallResult:
        """
        Fetches IoT SCADA time-series telemetry from TimescaleDB (vibration, temperature, pressure).
        """
        start_time = time.time()
        mock_telemetry = {
            "equipment_id": equipment_id,
            "metrics": {
                "temperature_celsius": {"mean": 68.4, "max": 74.2, "threshold": 80.0},
                "vibration_mm_s": {"mean": 2.1, "max": 4.8, "threshold": 4.5},
                "pressure_bar": {"mean": 12.4, "max": 13.1, "threshold": 16.0}
            },
            "anomaly_detected": True,
            "anomaly_type": "VIBRATION_SPIKE_ZONE_B"
        }
        elapsed = (time.time() - start_time) * 1000
        return ToolCallResult(
            tool_name="get_telemetry_time_series",
            arguments={"equipment_id": equipment_id, "duration_minutes": duration_minutes},
            status="SUCCESS",
            output=mock_telemetry,
            execution_time_ms=round(elapsed, 2)
        )

    @staticmethod
    async def get_cctv_vision_events(zone_id: str) -> ToolCallResult:
        """
        Queries edge computer vision analytics for PPE violations, exclusion zone breaches, or falls.
        """
        start_time = time.time()
        mock_vision_output = {
            "zone_id": zone_id,
            "active_cameras": 4,
            "detections": [
                {"type": "PPE_HELMET_MISSING", "confidence": 0.96, "camera_id": "CAM-Z2-01", "timestamp": "2s ago"},
                {"type": "EXCLUSION_ZONE_BREACH", "confidence": 0.91, "camera_id": "CAM-Z2-03", "timestamp": "12s ago"}
            ]
        }
        elapsed = (time.time() - start_time) * 1000
        return ToolCallResult(
            tool_name="get_cctv_vision_events",
            arguments={"zone_id": zone_id},
            status="SUCCESS",
            output=mock_vision_output,
            execution_time_ms=round(elapsed, 2)
        )

    @staticmethod
    async def trigger_human_in_the_loop_approval(
        agent_id: AgentID,
        action_type: str,
        target_resource: str,
        proposed_payload: Dict[str, Any],
        risk_level: RiskLevel,
        reasoning: str
    ) -> HumanApprovalRequest:
        """
        Mandatory guardrail tool: Generates a Human-In-The-Loop approval request prior to critical execution.
        """
        request_id = f"APPROVAL-{uuid.uuid4().hex[:8].upper()}"
        logger.warning(
            f"HUMAN APPROVAL REQUIRED [{request_id}]: Agent '{agent_id.value}' requested '{action_type}' "
            f"on '{target_resource}' (Risk: {risk_level.value})"
        )
        return HumanApprovalRequest(
            request_id=request_id,
            agent_id=agent_id,
            action_type=action_type,
            target_resource=target_resource,
            proposed_payload=proposed_payload,
            risk_level=risk_level,
            reasoning=reasoning,
            status="PENDING"
        )
