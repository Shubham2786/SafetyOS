# """
# OPA Middleware – Policy Evaluation Hook for FastAPI
#
# This middleware intercepts incoming JSON POST/PUT/PATCH requests, extracts a
# security context (tenant, site, user_role, etc.) and forwards it to an Open
# Policy Agent (OPA) server. In production the OPA endpoint is configured via
# the ``OPA_URL`` environment variable. For now a mock call is performed – any
# non‑error response is treated as an ``ALLOW`` decision.
#
# The middleware is added to the FastAPI app in ``services/ai/main.py``.
# """

from __future__ import annotations

import json
import logging
from typing import Callable

import httpx
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger(__name__)


class OPAMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware that evaluates policies via OPA.

    The middleware expects a JSON payload with the fields required by the
    specification (tenant_id, site_id, user_role, etc.). It forwards these to the
    OPA server defined by the ``OPA_URL`` environment variable. For this
    repository we perform a *mock* HTTP POST and treat any non‑error response as
    an ``ALLOW`` decision.
    """

    def __init__(self, app: Callable, opa_url: str | None = None):
        super().__init__(app)
        self.opa_url = opa_url or "http://localhost:8181/v1/data/safetyos/policy"
        logger.info("OPAMiddleware initialized with OPA URL: %s", self.opa_url)
        self.client = httpx.AsyncClient()

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Only evaluate JSON POST/PUT/PATCH requests – others are allowed.
        if request.method in {"POST", "PUT", "PATCH"} and "application/json" in request.headers.get("content-type", ""):
            try:
                body_bytes = await request.body()
                payload = json.loads(body_bytes) if body_bytes else {}
            except Exception as exc:
                logger.error("Failed to parse request JSON for OPA: %s", exc)
                return Response(status_code=400, content="Invalid JSON payload")

            opa_input = {"input": {"method": request.method, "path": request.url.path, "payload": payload}}
            try:
                resp = await self.client.post(self.opa_url, json=opa_input, timeout=2.0)
                resp.raise_for_status()
                decision = resp.json().get("result", {}).get("allow", True)
            except Exception as exc:
                # If OPA is unavailable, deny by default for safety.
                logger.warning("OPA evaluation failed (%s); defaulting to deny", exc)
                decision = False

            if not decision:
                logger.info("OPA denied request %s %s", request.method, request.url.path)
                return Response(status_code=403, content="Forbidden by policy")
            else:
                logger.debug("OPA allowed request %s %s", request.method, request.url.path)
        # Continue to the actual endpoint.
        response = await call_next(request)
        return response

    async def evaluate_policy(self, payload: dict) -> dict:
        """Evaluate OPA policy for a given payload.

        Used by internal tools to obtain a decision without an HTTP request cycle.
        Returns a dict with at least an ``allowed`` key.
        """
        opa_input = {"input": payload}
        try:
            resp = await self.client.post(self.opa_url, json=opa_input, timeout=2.0)
            resp.raise_for_status()
            decision = resp.json().get("result", {}).get("allow", True)
            return {"allowed": decision}
        except Exception as exc:
            logger.warning("OPA evaluation failed (%s); defaulting to deny", exc)
            return {"allowed": False}
