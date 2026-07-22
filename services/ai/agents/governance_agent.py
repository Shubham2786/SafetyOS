# """
# Governance Agent – Centralized Guardrail Enforcement
#
# This module defines a simple GovernanceAgent that encapsulates the security
# policies defined in the AI specification. It is responsible for:
#   * Maintaining a list of *forbidden* AI actions (e.g. actuation of equipment).
#   * Providing a `check_action` method that validates a requested tool/action
#     against the forbidden list and raises a `PermissionError` if the action is
#     prohibited.
#   * Exposing a `is_allowed` helper used by agents and the OPA middleware.
#
# The implementation is intentionally lightweight – the full policy engine is
# delegated to Open Policy Agent (OPA) which is invoked via FastAPI middleware.
# The GovernanceAgent therefore acts as an in‑process cache of static guardrail
# rules and a single source of truth for Python‑level checks.
# """

from __future__ import annotations

import logging
from typing import Set

logger = logging.getLogger(__name__)


class GovernanceAgent:
    """Central authority for AI guardrails.

    The specification defines a set of *forbidden* capabilities that the AI must
    never execute (e.g. `actuate_equipment`, `override_sis`).  This class stores
    those capabilities and provides a quick O(1) lookup for runtime checks.

    The agent can be extended in the future to load dynamic policies from a
    database or feature‑flag service – for now the list is static and matches the
    canonical specification.
    """

    # Static list of forbidden actions – must stay in sync with the spec.
    _FORBIDDEN_ACTIONS: Set[str] = {
        "actuate_equipment",
        "override_sis",
        "bypass_loto",
        "suppress_alarm",
    }

    def __init__(self) -> None:
        # In a real system we might load additional policies from a config file
        # or remote store. For now we simply log the initialization.
        logger.info("GovernanceAgent initialized with %d forbidden actions", len(self._FORBIDDEN_ACTIONS))

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------
    def is_forbidden(self, action: str) -> bool:
        """Return ``True`` if *action* is in the forbidden set.

        The check is case‑insensitive to avoid accidental bypasses.
        """
        result = action.lower() in (a.lower() for a in self._FORBIDDEN_ACTIONS)
        logger.debug("Governance check for action='%s' => %s", action, result)
        return result

    def check_action(self, action: str) -> None:
        """Validate *action* and raise :class:`PermissionError` if prohibited.

        Agents should call this method before invoking any tool that could affect
        physical systems.  The exception includes a clear message for log
        aggregation and for the client to surface a user‑friendly error.
        """
        if self.is_forbidden(action):
            logger.warning("Attempted forbidden action blocked: %s", action)
            raise PermissionError(f"Action '{action}' is forbidden by governance policy")

    def list_forbidden(self) -> Set[str]:
        """Return a copy of the forbidden‑action set – useful for diagnostics."""
        return set(self._FORBIDDEN_ACTIONS)

    @staticmethod
    async def check_action_opa(action: str, payload: dict) -> dict:
        """Centralized gateway for policy checks via OPAMiddleware.
        Returns the policy evaluation result.
        """
        from services.ai.security.opa_middleware import OPAMiddleware
        opa_mw = OPAMiddleware(app=lambda req: req)
        result = await opa_mw.evaluate_policy(payload)
        return result

# Instantiate a singleton for easy import across the codebase.
governance_agent = GovernanceAgent()
