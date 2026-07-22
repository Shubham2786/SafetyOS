# API Specification — SafetyOS

**Document Version:** 1.0
**Status:** Canonical API Reference — Single Source of Truth
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0 + User Flow Specification v1.0 + Backend Service Specification v1.0 + Database Specification v1.0 + Design System v1.0 + Screen Specifications v1.0
**Owners:** Principal API Architect, Staff Backend Engineer, Cloud Architect, SRE Lead, Security Architect
**Classification:** Confidential — Engineering Blueprint
**Conflict Resolution Order:** Backend Service Specification > Master Feature Specification > PRSD
**Last Reviewed:** 2026-07-22

---

## Table of Contents

1. [API Philosophy](#1-api-philosophy)
2. [Authentication](#2-authentication)
3. [Authorization](#3-authorization)
4. [Standard Request Models](#4-standard-request-models)
5. [Microservice API Catalog (48 services)](#5-microservice-api-catalog)
6. [OpenAPI 3.1 Specification](#6-openapi-31-specification)
7. [gRPC / Protobuf Specification](#7-grpc--protobuf-specification)
8. [WebSocket Specification](#8-websocket-specification)
9. [Event APIs (Kafka)](#9-event-apis-kafka)
10. [API Ownership Matrix](#10-api-ownership-matrix)
11. [SDK Strategy](#11-sdk-strategy)
12. [API Lifecycle](#12-api-lifecycle)
13. [Testing](#13-testing)

---

## 1. API Philosophy

SafetyOS exposes **six coexisting API surfaces**, each with a well-defined use case, ownership, and governance model. No surface is optional; each is the canonical mechanism for its class of interaction.

### 1.1 Surface Selection Matrix

| Surface | Transport | Encoding | Use Case | Governance |
|---|---|---|---|---|
| **REST** | HTTP/1.1 + HTTP/2 (JSON) | OpenAPI 3.1 | External + BFF-mediated user traffic, admin CRUD, third-party integrations | Kong Gateway + Ingress; versioned under `/vN/` |
| **gRPC** | HTTP/2 (Protobuf) | protobuf 3 | Internal east-west (service-to-service), high-throughput, low-latency (edge inference, KG traversal) | Buf schema registry; `/proto` monorepo; mTLS via Istio |
| **GraphQL** | HTTP/2 (JSON) | SDL 2021 | Console BFF federation only — schema-stitched over gRPC service graph. NOT exposed to third parties. | Apollo Router; federated subgraphs per plane |
| **WebSocket** | HTTP/1.1 Upgrade → RFC 6455 | JSON envelopes | Realtime UI push (Command Console, Mobile), presence, muster reconciliation, ER broadcast | RFC 6455 + subprotocol `safetyos.v1`; Kong WS routing |
| **Server-Sent Events (SSE)** | HTTP/1.1 (text/event-stream) | JSON | LLM streaming (RAG copilot, agent narration), unidirectional log tails | text/event-stream; native HTTP/1.1 |
| **Kafka Event Bus** | Kafka wire protocol | Avro (+ JSON Schema fallback) | Asynchronous inter-service contracts (see §9) | Confluent Schema Registry; canonical topics per WFP-002 |

### 1.2 REST Conventions

**Resource Modeling.** URIs are noun-based, hierarchical, and singular verbs are avoided outside of documented action endpoints.

```
/{module}/v{n}/{collection}/{resource_id}/{sub-collection}/{sub_id}
```

Reserved action verbs (RFC-style `POST /...:action`) are permitted only for non-idempotent state transitions that cannot be represented as a `PUT` on a resource:

```
POST /ptw/v1/permits/{permit_id}:issue
POST /loto/v1/locks/{loto_id}:release
POST /er/v1/plans/{plan_id}:activate
POST /agents/v1/cases/{case_id}:kill-switch
POST /cv/v1/models/{model_id}:rollback
```

**HTTP Verb Semantics.**

| Verb | Semantics | Idempotent | Cacheable |
|---|---|---|---|
| `GET` | Read | Yes | Yes (`Cache-Control` mandatory) |
| `POST` | Create OR non-idempotent action | No (unless `Idempotency-Key` supplied) | No |
| `PUT` | Replace (full) | Yes | No |
| `PATCH` | Merge (RFC 7396) or JSON Patch (RFC 6902) — server declares in OpenAPI `content-type` | Yes | No |
| `DELETE` | Soft-delete (default) or hard-delete (query `?hard=true` + `SEC-021` scope) | Yes | No |
| `HEAD` | Metadata only | Yes | Same as GET |
| `OPTIONS` | Discovery / CORS | Yes | Yes |

**Status Codes (canonical set).**

| Code | Meaning | Common Use |
|---|---|---|
| 200 | OK | Successful GET / PUT / PATCH |
| 201 | Created | Successful POST creating a resource; `Location` header REQUIRED |
| 202 | Accepted | Async workflow accepted; `Location` → status URL |
| 204 | No Content | Successful DELETE, or PUT with no representation |
| 206 | Partial Content | Range-based responses (frame retrieval, log tail) |
| 301/308 | Redirect | Deprecated endpoint → successor |
| 400 | Bad Request | Schema-invalid payload |
| 401 | Unauthenticated | Missing/expired/invalid token |
| 403 | Forbidden | Authenticated but policy-denied (OPA) |
| 404 | Not Found | Resource does not exist OR caller cannot see it (indistinguishable per SEC-020) |
| 409 | Conflict | Concurrent write, ETag mismatch, dedupe collision |
| 410 | Gone | Deprecated + retired resource |
| 412 | Precondition Failed | ETag/If-Match mismatch |
| 415 | Unsupported Media Type | Wrong `Content-Type` |
| 422 | Unprocessable Entity | Semantic validation error (schema-valid but business-invalid) |
| 423 | Locked | LOTO-locked resource; permit under approval; legal-hold |
| 428 | Precondition Required | Server requires `If-Match` or `Idempotency-Key` |
| 429 | Too Many Requests | Rate limit exceeded; `Retry-After` REQUIRED |
| 451 | Unavailable For Legal Reasons | Legal hold; jurisdictional lock |
| 500 | Internal Server Error | Uncaught; correlation ID mandatory in body |
| 502 | Bad Gateway | Upstream service unavailable |
| 503 | Service Unavailable | Circuit-broken; `Retry-After` REQUIRED |
| 504 | Gateway Timeout | Upstream timed out; correlation ID mandatory |
| 507 | Insufficient Storage | Tenant quota exhausted |

### 1.3 gRPC Conventions

- **Package layout:** `com.safetyos.<plane>.<service>.v<n>` (e.g., `com.safetyos.perception.cv.v2`).
- **Schema home:** `/proto` monorepo; CI validates via `buf lint` + `buf breaking` against the last two minor versions.
- **Streaming:** server-streaming for hot fanouts (KG traversal, agent narration); bidirectional for edge inference batches (`SubmitBatch`); client-streaming for bulk telemetry ingestion.
- **Deadlines:** every RPC MUST declare a client-side deadline; servers refuse RPCs without one via interceptor (`safetyos.grpc.deadline_required`).
- **Metadata propagation:** `x-safetyos-trace-id`, `x-safetyos-tenant-id`, `x-safetyos-principal`, `x-safetyos-idempotency-key`, `x-safetyos-correlation-id` — propagated across process boundaries by mesh sidecar.
- **Status codes:** canonical gRPC codes (`OK`, `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `UNAUTHENTICATED`, `RESOURCE_EXHAUSTED`, `FAILED_PRECONDITION`, `ABORTED`, `OUT_OF_RANGE`, `UNIMPLEMENTED`, `INTERNAL`, `UNAVAILABLE`, `DATA_LOSS`, `DEADLINE_EXCEEDED`). Business error details attached as `google.rpc.ErrorInfo` + `google.rpc.PreconditionFailure` + `google.rpc.QuotaFailure`.
- **Reflection:** enabled in `dev`/`staging` only; disabled in production.

### 1.4 GraphQL Usage

- **Scope:** Console BFF (`console-bff-service`) only. Mobile BFF uses REST for offline delta-sync deterministic contracts.
- **Federation:** Apollo Router; subgraphs per plane (`perception`, `workflows`, `risk`, `command`, `platform`).
- **Read-only for GraphQL mutations that cross service boundaries** — writes route via REST/gRPC to the owning service (federation with mutation is disallowed).
- **Persisted queries:** all client queries are persisted (Apollo Persisted Queries) with a signed hash allowlist; ad-hoc queries rejected in production.
- **Depth + complexity limits:** max depth 12, max complexity 10,000, max aliases 20; enforced by Apollo Router plugin.
- **Introspection:** disabled in production.

### 1.5 WebSocket Usage

- **Subprotocol:** `safetyos.v1` (negotiated in `Sec-WebSocket-Protocol`).
- **Channels:** topic-scoped subscriptions (`safetyos:tenant:{tid}:site:{sid}:panel:{name}`); server enforces ACL on subscribe.
- **Backpressure:** server drops oldest low-priority messages first (`class=low|normal|critical|life-safety`); `life-safety` never dropped and always uses out-of-band Notification channel as belt-and-braces.
- **Reconnect:** clients MUST honor exponential backoff (`1s → 30s`, jitter 20%); server publishes a `resume_token` at every 100 messages for gap-fill replay.
- Full protocol spec in §8.

### 1.6 SSE Usage

- **Content-Type:** `text/event-stream; charset=utf-8`.
- **Use cases:** LLM streaming from `rag-service` (`POST /rag/v1/chat`), agent narration from `multi-agent-orchestrator`, log tail from `observability-platform-service`.
- **Heartbeat:** `:heartbeat\n\n` every 15 s; client disconnect on 45 s silence.
- **Retry hint:** server emits `retry: 5000` on the initial event.
- **Event framing:** each event carries `id`, `event`, `data` fields; `id` is monotonic ULID for resumption via `Last-Event-ID` header.

### 1.7 API Versioning

- **Major version in the path** for REST: `/cv/v1/`, `/cv/v2/`. Minor + patch delivered additively (no breaking changes within a major).
- **Header pinning (optional):** `X-SafetyOS-Api-Version: 2026-07-21` — date-based sub-major pin for backward compatibility windows.
- **gRPC:** major version in the protobuf `package` name (`.v1`, `.v2`); minor changes are additive per Google API Improvement Proposals (AIP-180).
- **Kafka topics:** version embedded in the topic name (`safetyos.cv.event.v2`); breaking change ⇒ `.v(n+1)` topic + dual-write migration (WFP-002).
- **Deprecation window:** minimum 12 months from `Deprecation` header emission to retirement; regulated APIs (PTW, LOTO, INC, COMP) minimum 24 months.
- Full lifecycle in §12.

### 1.8 Idempotency

- **Idempotency-Key header** (RFC-draft-idempotency-header-01) REQUIRED on `POST` and non-idempotent `PATCH` for every regulated flow (PTW, LOTO, INC, ER, COMP, e-sign, agent action, notification dispatch).
- **Server behavior:** dedupe window 24 h; keyed by `(tenant_id, endpoint, principal, idempotency_key)`; stored in Redis + Postgres for regulated flows.
- **Semantic:** first successful response is memoized; subsequent identical requests return the same response body + status; conflicting payloads return `409 Conflict` with `error.code=idempotency_key_reused_with_different_payload`.
- **Missing key on protected endpoint:** `428 Precondition Required` with `error.code=idempotency_key_required`.

### 1.9 Pagination

Two pagination styles coexist; each endpoint declares which it supports in its OpenAPI.

**Cursor pagination (default).** REQUIRED for any endpoint whose collection can exceed 10,000 rows or whose ordering is not stable under offset (event streams, telemetry, incidents).

- Request: `?page_size=100&page_token=<opaque>`
- Response envelope:

```json
{
  "items": [],
  "next_page_token": "eyJ0IjoxNzE...=",
  "prev_page_token": null,
  "page_info": { "has_next": true, "returned": 100 }
}
```

- Tokens are opaque, signed (HMAC-SHA256), and TTL 24 h; tampered tokens → `400 Bad Request`.
- Max `page_size` = 500 (regulated data), 1,000 (analytical); default 100.

**Offset pagination (legacy, admin-only).** Supported only where total-count is required and cardinality is bounded (< 10,000).

- Request: `?offset=0&limit=100&order_by=created_at:desc`
- Response includes `total_count` (best-effort; may be `~N` for approximate counts on Trino queries).

### 1.10 Filtering

- **Query DSL:** `?filter=<expr>` where `<expr>` follows Google AIP-160:
  - Comparison: `field:value`, `field=value`, `field>value`, `field<=value`, `field<>value`.
  - Boolean: `AND`, `OR`, `NOT`, parentheses.
  - Set: `field IN (v1, v2)`, `field NOT IN (v1, v2)`.
  - Range: `field BETWEEN v1 AND v2`.
  - Presence: `field:*` (has value), `NOT field:*` (null).
  - Text: `field:"free text"` (full-text on indexed fields only).
- **Server rejects unknown fields** with `400 Bad Request` + `error.field` pointing to the offending token.
- **Reserved fields** (available on every collection): `tenant_id`, `created_at`, `updated_at`, `deleted_at`, `version`.

### 1.11 Sorting

- **Query:** `?order_by=field1:asc,field2:desc` — comma-separated, direction suffix mandatory.
- **Multi-key stable sort** guaranteed by server (append `id:asc` internally as tiebreaker).
- **Sort keys must be indexed;** unindexed sort keys → `422 Unprocessable Entity` (no full-scan sorts on transactional stores).

### 1.12 Search

- **Cross-module search:** `search-service` at `GET /search/v1/query?q=...&types=permit,incident,contractor`.
- **Query semantics:** hybrid BM25 + vector (see `rag-service`); syntax supports quoted phrases, `-exclude`, `field:value`, wildcard `*`.
- **Result envelope:** each hit carries `resource_type`, `resource_id`, `href` (link back to canonical), `score`, `highlights`, `redactions_applied` (bool).
- **ACL:** every hit is re-authorized at answer time; denied hits are excluded and `x-safetyos-redacted-count` header is set.

### 1.13 Error Handling — RFC 7807 Problem Details

Every error response (4xx, 5xx) uses `application/problem+json` with the SafetyOS extension envelope:

```json
{
  "type": "https://errors.safetyos.io/ptw/interlock-not-satisfied",
  "title": "Required LOTO isolations are not yet verified",
  "status": 423,
  "detail": "Permit PTW-2026-000123 requires LOTO-2026-000045 in state LOCKED; current state is APPLIED.",
  "instance": "/ptw/v1/permits/PTW-2026-000123:issue",
  "code": "ptw.interlock_not_satisfied",
  "correlation_id": "01J8W9Z6XK5T5NPQ0KQ9C7A9AY",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "tenant_id": "acme-industrial",
  "principal": "user:jane.doe@acme.com",
  "occurred_at": "2026-07-21T14:23:07.412Z",
  "retryable": false,
  "retry_after_seconds": null,
  "documentation_url": "https://docs.safetyos.io/errors/ptw.interlock_not_satisfied",
  "field_errors": [
    { "field": "loto_reference_id", "code": "not_locked", "message": "LOTO must be in state LOCKED before permit issue." }
  ],
  "remediation": [
    "Verify zero-energy on all documented isolation points.",
    "Have lock owner sign the LOTO isolation confirmation.",
    "Re-attempt permit issue."
  ]
}
```

- **`type`:** stable URI in the `errors.safetyos.io` namespace; MUST resolve to human-readable documentation.
- **`code`:** dotted namespaced code, machine-stable across versions.
- **`correlation_id`:** ULID unique to this request/response pair.
- **`trace_id`:** W3C trace-context trace-id; joins logs, metrics, traces.
- **`field_errors`:** JSON-Pointer or dotted path to each offending field.
- **`retryable` + `retry_after_seconds`:** hint to clients whether retry is safe and when.

### 1.14 Correlation IDs & Trace IDs

- **`X-Correlation-Id`:** ULID; if absent on inbound edge request, gateway generates and echoes; propagated across every downstream call via headers + Kafka event envelope.
- **`traceparent` / `tracestate`:** W3C Trace Context, mandatory on every hop; sampled per §1.4 of Backend Spec.
- **`X-Request-Id`:** synonym for `X-Correlation-Id` accepted on ingress for compatibility with legacy Fortune-500 gateways.
- **Log line schema** (ECS-based) mandates: `trace.id`, `span.id`, `correlation.id`, `tenant.id`, `user.id`, `service.name`, `service.version`.

---

## 2. Authentication

SafetyOS enforces a **zero-trust** posture. Every request — human or machine, ingress or east-west — carries a cryptographically verifiable identity. There is no anonymous surface, no shared bearer, no implicit trust from network origin.

### 2.1 Identity Sources

| Caller Class | Primary Identity | Secondary Identity | Rotation |
|---|---|---|---|
| Human user (console/mobile) | OIDC ID token (from Keycloak or Okta) → short-lived JWT access token | WebAuthn / FIDO2 platform authenticator for step-up | Access 10 min, Refresh 24 h, RS256 signing key 90 d |
| Field worker (mobile offline) | OIDC + device biometrics (Face ID / fingerprint) | Backup PIN (client-side attested) | Refresh 24 h, offline grace 8 h |
| Service (east-west) | SPIFFE ID via SPIRE-issued X.509 SVID | mTLS handshake enforced by Istio | 24 h cert lifetime, auto-rotated |
| Edge device (camera, gateway) | X.509 device certificate provisioned via SCEP | Signed edge bundle attestation (Cosign) | 30 d device cert, 24 h operational cert |
| Third-party integration (ERP, CMMS, insurer bus) | OAuth 2.0 client-credentials with mTLS-bound tokens (RFC 8705) | Optional IP allowlist | Client secret 60 d; mTLS cert 90 d |
| Batch / ETL API key | HMAC-SHA256 signed API key, scoped and tenant-bound | IP allowlist REQUIRED | 60 d rotation |
| Break-glass (SEC-004) | Ephemeral token, dual-approved, TTL ≤ 15 min | WebAuthn step-up + audit witness | Not rotatable — single-use |

### 2.2 OIDC Flow (Users)

SafetyOS uses **OpenID Connect 1.0** with **PKCE (RFC 7636)** and **PAR (RFC 9126)**.

```
Web Console        Kong Gateway           Identity Service        Keycloak / Okta
     │                    │                        │                       │
     │ 1. GET /login      │                        │                       │
     ├───────────────────►│                        │                       │
     │                    │ 2. PAR (client_id,     │                       │
     │                    │    code_challenge)     │                       │
     │                    ├───────────────────────►│                       │
     │                    │                        │ 3. Forward             │
     │                    │                        ├──────────────────────►│
     │                    │◄───────request_uri─────┤                       │
     │◄────302 auth─URL───┤                        │                       │
     │ 4. authenticate    │                        │                       │
     ├──────────────────────────────────────────────────────────────────►  │
     │                              (WebAuthn / password + TOTP)           │
     │◄──302 code─────────────────────────────────────────────────────────  │
     │ 5. exchange (PKCE) │                        │                       │
     ├───────────────────►│                        │                       │
     │                    │ 6. token exchange       │                       │
     │                    ├───────────────────────►│                       │
     │                    │                        │ 7. tokens             │
     │                    │                        ├──────────────────────►│
     │                    │                        │◄─ id_token, access,  ─┤
     │                    │                        │   refresh             │
     │                    │◄─ re-sign JWT for      │                       │
     │                    │   mesh (add tenant,    │                       │
     │                    │   site, roles claims)  │                       │
     │◄─ Set-Cookie:______│                        │                       │
     │   __Host-safetyos-session (HttpOnly, Secure,│                       │
     │   SameSite=Lax, Path=/)                     │                       │
```

**Scopes issued to console:** `openid profile email safetyos:console safetyos:tenant:{tid} safetyos:sites:{sid,sid...}`.

### 2.3 JWT Structure

Two JWTs coexist in SafetyOS: the **identity JWT** (issued by IdP) and the **mesh JWT** (issued by `identity-service` after attribute enrichment, signed by the SafetyOS PKI intermediate).

```json
{
  "iss": "https://identity.safetyos.io",
  "sub": "user:01J8W9Z6XK5T5NPQ0KQ9C7A9AY",
  "aud": "safetyos.internal",
  "exp": 1806598800,
  "iat": 1806598200,
  "nbf": 1806598200,
  "jti": "01J8W9ZBQ0F2G5T8AZ8H1WV5R6",
  "azp": "safetyos-console",
  "tenant_id": "acme-industrial",
  "principal_type": "user",
  "roles": ["safety_supervisor", "permit_approver"],
  "site_ids": ["site-hou-01", "site-hou-02"],
  "zone_grants": ["zone-tank-farm-a:read", "zone-flare:read"],
  "contractor_org": null,
  "shift": "day",
  "data_classification_max": "confidential",
  "step_up_level": "webauthn",
  "step_up_expires_at": 1806598920,
  "session_id": "01J8W9ZC71ZY0PX2Y7Y0F4CJDA",
  "device_id": "dev-01J8W9ZCP2RE1F4TQK6S5AT2NR",
  "amr": ["pwd", "webauthn"],
  "acr": "urn:safetyos:acr:step-up",
  "safetyos:break_glass": false,
  "safetyos:policy_bundle_min_version": "2026.07.19-r3"
}
```

- **Access token TTL:** 10 minutes. Refresh via `POST /identity/v1/token/refresh`.
- **Refresh token TTL:** 24 hours; **rotating** (RFC 6749 §10.4) — each refresh returns a new refresh token, prior one is invalidated (theft detection).
- **Signing:** RS256 with keys rotated every 90 days; JWKS at `https://identity.safetyos.io/.well-known/jwks.json`; key overlap 24 h.
- **Introspection:** `POST /identity/v1/introspect` (RFC 7662) — enabled for third-party integrations.
- **Revocation:** `POST /identity/v1/revoke` (RFC 7009) — invalidates refresh token immediately; access tokens propagate to a revocation-cache checked by mesh sidecar (TTL 60 s).

### 2.4 Refresh Tokens

- **Storage (client):** HttpOnly, Secure, SameSite=Lax cookie for browser; secure enclave / Keystore for mobile.
- **Storage (server):** Hashed (SHA-256) with per-token salt in Postgres; never plaintext.
- **Rotation:** every use returns a new token, family lineage tracked; reuse of an invalidated token → entire family revoked + security event emitted + user notified.
- **Absolute lifetime:** 24 h from issuance; sliding window disabled.

### 2.5 SPIFFE / SPIRE (East-West)

- **Trust domain:** `spiffe://safetyos.io`.
- **SVID format:** `spiffe://safetyos.io/ns/{namespace}/sa/{service_account}`.
- **Node attestation:** k8s_sat / k8s_psat + cloud-provider metadata (aws_iid, gcp_iit).
- **Workload attestation:** unix:uid + k8s:sa + k8s:pod-label selector.
- **Issuance cadence:** every 24 h, refreshed at 50% TTL by SPIRE Agent (Envoy SDS).
- **Enforcement:** Istio PeerAuthentication `STRICT` mode; no plaintext east-west traffic; policy denies any workload without SVID.

### 2.6 mTLS

- **Ingress mTLS:** required for edge devices and third-party integrations. TLS 1.3 only; ciphers restricted to AEAD suites (`TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`, `TLS_AES_128_GCM_SHA256`).
- **East-west mTLS:** Istio-enforced, `STRICT` mode, SPIFFE-verified.
- **Certificate binding:** OAuth 2.0 client tokens are certificate-thumbprint-bound (`cnf.x5t#S256`) per RFC 8705; token replay across TLS sessions rejected.

### 2.7 API Keys

Only for batch / ETL / webhook-out scenarios where OIDC or SPIFFE cannot be used.

- **Format:** `sk_{env}_{tenant}_{20_char_ulid_hash}.{40_char_hmac_secret}` — visually distinguishable prefix + secret.
- **Storage:** hash-only in Postgres; secret shown once at creation.
- **Signing:** HMAC-SHA256 over canonical request (method + path + sorted-query + body-SHA-256 + timestamp).
- **Header:** `Authorization: SafetyOS-HMAC-SHA256 Credential={key_id}, SignedHeaders={list}, Signature={hex}`, plus `X-SafetyOS-Date` and `X-SafetyOS-Content-SHA256`.
- **Clock skew:** ±5 min tolerated.
- **Scoping:** each key declares (tenant, environment, IP allowlist, scopes, expiry).
- **Rotation:** 60 d default; overlap 7 d supported (old + new both valid).

### 2.8 OAuth 2.0 (Third-Party & Public API)

- **Flows supported:**
  - Authorization Code + PKCE — for user-facing apps.
  - Client Credentials + mTLS binding — for machine integrations.
  - **Not supported:** Implicit (deprecated), ROPC (rejected by security review).
- **Endpoints (compliant with RFC 6749, RFC 8628, RFC 8414):**
  - `GET  /.well-known/oauth-authorization-server`
  - `POST /identity/v1/oauth/authorize`
  - `POST /identity/v1/oauth/par` (RFC 9126)
  - `POST /identity/v1/oauth/token`
  - `POST /identity/v1/oauth/revoke`
  - `POST /identity/v1/oauth/introspect`
- **DPoP (RFC 9449):** supported as an alternative to mTLS binding for browser-based public apps.

### 2.9 Role Propagation

- Roles are **not** propagated as opaque names alone; each JWT carries the full computed `roles + zone_grants + site_ids + data_classification_max` snapshot at token issue.
- **Delta propagation:** role changes emit `safetyos.identity.roles.v1` on Kafka; mesh sidecar refreshes decision cache in ≤ 60 s.
- **Session invalidation on demotion:** `identity-service` publishes `safetyos.identity.session_revoked.v1`; console + mobile force re-auth.
- **Impersonation** (`SEC-005` — support-with-consent) inserts an `act` claim (RFC 8693 token exchange) recording the actor's principal; policy engine treats the acting principal as the authorization subject but audits both.

### 2.10 Tenant Propagation

- **`tenant_id`** is a first-class claim in every JWT and in every event envelope.
- **Ingress enforcement:** Kong plugin `safetyos-tenant-scope` cross-references the URL tenant path segment (or subdomain) with the token's `tenant_id`; mismatch → `403`.
- **East-west enforcement:** Envoy sidecar inserts `x-safetyos-tenant-id`; upstream services reject requests where the header disagrees with the JWT.
- **DB layer enforcement:** Postgres row-level security (RLS) predicates on every regulated table (`USING (tenant_id = current_setting('app.tenant_id')::uuid)`) — belt-and-braces even if application forgets.

---

## 3. Authorization

All authorization is delegated to **`policy-engine`** (§5.26) running Open Policy Agent (OPA) 0.63. There is no ambient authorization in service code; every check is a Rego evaluation.

### 3.1 OPA — Bundle Distribution

- **Bundles:** signed (Cosign), versioned, published from a Git-backed monorepo through a policy CI pipeline (lint → unit tests → coverage ≥ 90% → sim → sign → publish).
- **Distribution:** OPA sidecar in every namespace polls the Bundle Server every 30 s; falls back to last-known-good bundle if the server is unavailable.
- **Query interface:**
  - Sidecar (default): `POST http://localhost:8181/v1/data/safetyos/{module}/{action}` over loopback.
  - Central: `POST /policy/v1/evaluate` for cases where sidecar is unavailable or for heavy queries with cross-tenant scope.

### 3.2 ABAC over RBAC

Authorization decisions are computed from **attributes**, not from role names alone. Roles are one attribute among many.

**Input to every OPA evaluation:**

```json
{
  "principal": {
    "id": "user:01J8W9Z6XK5T5NPQ0KQ9C7A9AY",
    "type": "user",
    "roles": ["safety_supervisor", "permit_approver"],
    "site_ids": ["site-hou-01"],
    "zone_grants": ["zone-tank-farm-a:read"],
    "contractor_org": null,
    "shift": "day",
    "step_up_level": "webauthn",
    "step_up_expires_at": "2026-07-21T14:45:00Z",
    "data_classification_max": "confidential",
    "break_glass": false
  },
  "resource": {
    "type": "permit",
    "id": "PTW-2026-000123",
    "tenant_id": "acme-industrial",
    "site_id": "site-hou-01",
    "zone_id": "zone-tank-farm-a",
    "classification": "confidential",
    "state": "pending_issue",
    "owner_principal": "user:...",
    "attributes": { "permit_type": "hot_work", "loto_ref": "LOTO-2026-000045" }
  },
  "action": "issue",
  "context": {
    "tenant_id": "acme-industrial",
    "request_time": "2026-07-21T14:22:59Z",
    "ip": "10.20.30.40",
    "correlation_id": "01J8W9Z6XK...",
    "policy_bundle_version": "2026.07.19-r3",
    "environment": "prod"
  }
}
```

**Decision envelope:**

```json
{
  "allow": false,
  "decision_id": "01J8W9ZD9M3RXWJ0YQPXW3AH5J",
  "policy_bundle_version": "2026.07.19-r3",
  "obligations": [],
  "reason": {
    "code": "ptw.step_up_required",
    "message": "Permit issue requires WebAuthn step-up within the last 5 minutes.",
    "remediation": ["POST /identity/v1/stepup"]
  }
}
```

### 3.3 Scope Taxonomy

| Scope | Grants |
|---|---|
| `safetyos:console` | Access to Command Console BFF endpoints |
| `safetyos:mobile` | Access to Mobile BFF endpoints |
| `cv.read` / `cv.violation.ack` | Read CV events / ack violations |
| `cv.model.rollback` | Trigger CV model rollback |
| `ot.tag.read` / `ot.tag.admin` | Read tag values / manage tag registry |
| `kg.read` / `kg.write` / `kg.cypher` | KG operations |
| `ptw.read` / `ptw.create` / `ptw.approve` / `ptw.issue` / `ptw.close` | PTW lifecycle |
| `loto.read` / `loto.apply` / `loto.release` / `loto.override` | LOTO lifecycle |
| `sh.read` / `sh.compose` / `sh.certify` | Shift handover |
| `inc.read` / `inc.create` / `inc.investigate` / `inc.legalhold` | Incident |
| `er.read` / `er.activate` / `er.terminate` | Emergency response |
| `agent.case.read` / `agent.case.act` / `agent.killswitch` | Multi-agent orchestration |
| `rag.query` / `rag.admin.reindex` | RAG |
| `comp.read` / `comp.evidence.write` / `comp.audit.export` | Compliance |
| `con.read` / `con.credential.write` | Contractor |
| `notification.dispatch` | Send notifications |
| `pii.raw.read` | View un-blurred frames (requires step-up) |
| `dlp.override` | Approve DLP overrides |
| `edge.fleet.kill` | Fleet kill-switch |
| `platform.admin` / `platform.tenant.provision` | Platform ops |
| `policy.admin` | Policy authoring |
| `sec.break_glass` | Break-glass elevation |

### 3.4 Permission Matrix

| Action | Required Scope | Additional ABAC | Step-Up |
|---|---|---|---|
| `GET /cv/v1/cameras/{id}/latest` | `cv.read` | camera.site_id ∈ principal.site_ids | — |
| `GET /cv/v1/frames/{id}?blur=false` | `pii.raw.read` | dual-approval on active ticket | WebAuthn ≤ 5 min |
| `POST /ptw/v1/permits/{id}:issue` | `ptw.issue` | LOTO interlock LOCKED | WebAuthn ≤ 5 min |
| `POST /loto/v1/locks/{id}:override` | `loto.override` | dual-approval + break_glass | WebAuthn ≤ 5 min |
| `POST /er/v1/plans/{id}:activate` | `er.activate` | role ∈ {incident_commander} | — (life-safety exemption) |
| `POST /agents/v1/cases/{id}:kill-switch` | `agent.killswitch` | dual-approval | WebAuthn ≤ 2 min |
| `POST /cv/v1/models/{id}:rollback` | `cv.model.rollback` | dual-approval; MLOps + Safety | WebAuthn ≤ 5 min |
| `POST /policy/v1/bundles:publish` | `policy.admin` | Cosign valid; tests ≥ 90% | WebAuthn ≤ 5 min |

Full matrix is machine-generated from the Rego source tree and published at `/policy/v1/matrix?format=csv`.

---

## 4. Standard Request Models

### 4.1 Standard Request Headers

Every request to any SafetyOS API MUST include the following headers. The API gateway validates and rejects non-compliant requests before routing.

| Header | Required | Format | Description |
|---|---|---|---|
| `Authorization` | Yes | `Bearer {jwt}` OR `SafetyOS-HMAC-SHA256 ...` | Authentication credential |
| `Content-Type` | Yes (on body) | `application/json`, `application/protobuf`, `application/grpc` | Payload encoding |
| `Accept` | Yes | `application/json`, `application/problem+json`, `text/event-stream` | Desired response format |
| `X-Correlation-Id` | No (auto-gen) | ULID (26 chars) | Client-set correlation; gateway generates if absent |
| `X-SafetyOS-Tenant-Id` | No (from JWT) | UUID | Explicit tenant override (validated against JWT claim) |
| `Idempotency-Key` | Conditional | ULID or UUID | REQUIRED on regulated POST endpoints |
| `If-Match` | Conditional | ETag value | Optimistic concurrency on PUT/PATCH/DELETE |
| `If-None-Match` | No | ETag value | Conditional GET (304 Not Modified) |
| `X-SafetyOS-Api-Version` | No | `YYYY-MM-DD` | Date-based sub-major version pin |
| `X-SafetyOS-Date` | Conditional | ISO 8601 | REQUIRED for HMAC API key auth |
| `X-SafetyOS-Content-SHA256` | Conditional | hex-encoded SHA-256 | REQUIRED for HMAC API key auth |
| `traceparent` | No (auto-gen) | W3C Trace Context | Distributed tracing; gateway injects if absent |
| `Accept-Language` | No | BCP 47 | Preferred locale for error messages |
| `User-Agent` | Yes | `{app}/{version} ({platform})` | Client identification for analytics |

### 4.2 Standard Response Headers

Every response includes these headers:

| Header | Description |
|---|---|
| `X-Correlation-Id` | Echoed from request or server-generated |
| `X-Request-Id` | Unique request identifier (may equal X-Correlation-Id) |
| `X-SafetyOS-Trace-Id` | W3C trace ID for this transaction |
| `X-SafetyOS-Served-By` | Service name + version (e.g., `cv-inference-gateway/2.4.1`) |
| `X-SafetyOS-Region` | Serving region (e.g., `us-east-1`) |
| `ETag` | Resource version for conditional requests |
| `Cache-Control` | Caching directive (always set, even `no-store`) |
| `X-RateLimit-Limit` | Rate limit ceiling for the current window |
| `X-RateLimit-Remaining` | Remaining requests in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | Seconds to wait (on 429, 503) |
| `Deprecation` | RFC 8594: date when the endpoint is scheduled for retirement |
| `Sunset` | RFC 8594: date when the endpoint will stop responding |
| `Link` | RFC 8288: successor endpoint if deprecated |
| `Content-Security-Policy` | CSP for HTML responses (console only) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

### 4.3 Standard Metadata Envelope

Every JSON response wraps the payload in a metadata envelope for collections:

```json
{
  "meta": {
    "api_version": "v1",
    "request_id": "01J8WBZ3C4YJ4TDGA2M8DR3NK6",
    "correlation_id": "01J8WBZ3C4YJ4TDGA2M8DR3NK6",
    "served_by": "ptw-service/3.1.0",
    "region": "us-east-1",
    "timestamp": "2026-07-21T14:30:00.000Z",
    "deprecation": null,
    "warnings": []
  },
  "data": { },
  "pagination": {
    "next_page_token": "eyJ0IjoxNzE...=",
    "prev_page_token": null,
    "page_info": { "has_next": true, "returned": 100, "total_count": null }
  }
}
```

Single-resource responses use the same envelope without `pagination`:

```json
{
  "meta": { "..." : "..." },
  "data": { "permit_id": "PTW-2026-000123", "..." : "..." }
}
```

### 4.4 Standard Error Response (RFC 7807)

See §1.13 for the full error envelope. The `type` URI follows a strict convention:

```
https://errors.safetyos.io/{module}/{error-slug}
```

**Error code catalog (global — applicable to all services):**

| Code | Status | Description |
|---|---|---|
| `auth.invalid_token` | 401 | JWT expired, malformed, or signature invalid |
| `auth.token_revoked` | 401 | Token has been explicitly revoked |
| `auth.step_up_required` | 403 | Action requires WebAuthn step-up |
| `authz.policy_denied` | 403 | OPA denied the request |
| `authz.scope_insufficient` | 403 | Token lacks required scope |
| `authz.break_glass_required` | 403 | Action requires break-glass elevation |
| `authz.dual_approval_required` | 403 | Action requires second approver |
| `authz.tenant_mismatch` | 403 | Token tenant ≠ resource tenant |
| `validation.schema_invalid` | 400 | Payload does not match JSON Schema |
| `validation.field_required` | 400 | Required field missing |
| `validation.field_invalid` | 422 | Field value semantically invalid |
| `validation.filter_parse_error` | 400 | AIP-160 filter expression malformed |
| `resource.not_found` | 404 | Resource does not exist or is invisible |
| `resource.conflict` | 409 | ETag mismatch or state conflict |
| `resource.locked` | 423 | Resource under legal hold or workflow lock |
| `resource.gone` | 410 | Resource has been permanently deleted |
| `idempotency.key_required` | 428 | Idempotency-Key header missing on regulated endpoint |
| `idempotency.key_conflict` | 409 | Same key used with different payload |
| `rate.per_user_exceeded` | 429 | Per-user rate limit hit |
| `rate.per_tenant_exceeded` | 429 | Per-tenant rate limit hit |
| `rate.per_api_key_exceeded` | 429 | Per-API-key rate limit hit |
| `quota.storage_exceeded` | 507 | Tenant storage quota exhausted |
| `dependency.unavailable` | 503 | Downstream service circuit-broken |
| `dependency.timeout` | 504 | Downstream service timed out |
| `internal.unknown` | 500 | Unclassified internal error |
| `legal.hold_active` | 451 | Legal hold prevents modification |
| `legal.jurisdiction_block` | 451 | Data residency prevents access |

### 4.5 Validation Rules

- **JSON Schema validation** runs at the gateway (Kong plugin `safetyos-json-schema-validator`) before routing.
- **Business validation** runs in the owning service after deserialization.
- **Date/time format:** ISO 8601 with timezone (RFC 3339): `2026-07-21T14:30:00.000Z`. UTC preferred; local TZ accepted with offset.
- **UUID format:** lowercase RFC 4122 v4 or v7 (time-ordered preferred for new entities).
- **ULID format:** 26-character Crockford Base32; preferred for event IDs and correlation IDs.
- **Enum values:** lowercase snake_case; unknown enum values → `422` (not silently dropped).
- **String lengths:** validated per-field; global max 65,536 chars unless documented otherwise.
- **Nested depth:** max 10 levels; deeper payloads → `400`.
- **Array max items:** 1,000 per array field unless documented otherwise.
- **File uploads:** multipart/form-data; max 100 MB per file, 500 MB per request.

---

## 5. Microservice API Catalog

### 5.1 `cv-inference-gateway` — Service #1

**Purpose.** Terminates model inference from edge cameras/gateways, fuses on-edge detections with server-side re-scoring, publishes CV events and violations, enforces PPE grace-period logic (CV-035), gas-detector fusion (CV-033), camera cyber-hardening posture (CV-036). Owns **CV-001 … CV-036**.

#### REST APIs (Public via BFF)

| Verb + Path | Purpose | Scope | Status Codes |
|---|---|---|---|
| `GET /cv/v1/cameras` | List cameras (cursor-paginated) | `cv.read` | 200, 400, 401, 403, 429 |
| `GET /cv/v1/cameras/{camera_id}` | Fetch camera + calibration + model binding | `cv.read` | 200, 401, 403, 404 |
| `GET /cv/v1/cameras/{camera_id}/latest` | Most recent detections (last 60 s) | `cv.read` | 200, 401, 403, 404 |
| `GET /cv/v1/cameras/{camera_id}/health` | Edge health snapshot (CV-036) | `cv.read` | 200, 401, 403, 404 |
| `GET /cv/v1/events` | List CV events (cursor-paginated) | `cv.read` | 200, 400, 401, 403, 429 |
| `GET /cv/v1/events/{event_id}` | Fetch event | `cv.read` | 200, 401, 403, 404 |
| `GET /cv/v1/violations` | List violations | `cv.read` | 200, 400, 401, 403, 429 |
| `GET /cv/v1/violations/{violation_id}` | Fetch violation | `cv.read` | 200, 401, 403, 404 |
| `POST /cv/v1/violations/{violation_id}:acknowledge` | Operator ack | `cv.violation.ack` | 200, 400, 401, 403, 404, 409, 428 |
| `POST /cv/v1/violations/{violation_id}:dismiss` | Operator dismiss (with rationale) | `cv.violation.ack` | 200, 400, 401, 403, 404, 409, 428 |
| `POST /cv/v1/violations/{violation_id}:escalate` | Escalate to incident | `cv.violation.ack` | 202, 401, 403, 404, 409 |
| `GET /cv/v1/frames/{frame_id}` | Fetch frame (blurred by default) | `cv.read` | 200, 401, 403, 404, 410, 451 |
| `GET /cv/v1/frames/{frame_id}?blur=false` | Un-blurred (requires dual-approval) | `pii.raw.read` | 200, 401, 403, 404, 423 |
| `POST /cv/v1/frames/{frame_id}:request-unblur` | Open dual-approval ticket | `pii.raw.read` | 202, 401, 403, 404, 428 |
| `GET /cv/v1/models` | List active model versions | `cv.read` | 200, 401, 403 |
| `GET /cv/v1/models/{model_id}/canary` | Canary metrics (CV-025) | `cv.read` | 200, 401, 403, 404 |
| `POST /cv/v1/models/{model_id}:rollback` | Trigger rollback (AG-020) | `cv.model.rollback` | 202, 401, 403, 404, 409, 428 |
| `POST /cv/v1/cameras/{camera_id}/calibration` | Upload calibration (CV-024) | `platform.admin` | 201, 400, 401, 403, 404, 422 |
| `GET /cv/v1/cameras/{camera_id}/grace-periods` | Active PPE grace timers (CV-035) | `cv.read` | 200, 401, 403, 404 |

#### gRPC APIs (`com.safetyos.perception.cv.v2`)

```proto
syntax = "proto3";
package com.safetyos.perception.cv.v2;

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";

service CvInference {
  rpc SubmitFrame(FrameRequest) returns (InferenceResult);
  rpc SubmitBatch(stream FrameRequest) returns (stream InferenceResult);
  rpc GetModelBinding(ModelBindingRequest) returns (ModelBinding);
  rpc ReportEdgeHealth(EdgeHealthRequest) returns (Ack);
  rpc StreamMetrics(MetricsSubscribeRequest) returns (stream MetricSample);
}

message FrameRequest {
  string camera_id = 1;
  string frame_id = 2;
  google.protobuf.Timestamp captured_at = 3;
  bytes frame_bytes = 4;
  string encoding = 5;
  int32 width = 6;
  int32 height = 7;
  string edge_agent_id = 8;
  string edge_model_id = 9;
  float edge_top1_confidence = 10;
  repeated Detection edge_detections = 11;
  map<string,string> context = 12;
}

message Detection {
  string class_id = 1;
  float confidence = 2;
  BBox bbox = 3;
  string track_id = 4;
  map<string,float> attributes = 5;
}

message BBox { float x = 1; float y = 2; float w = 3; float h = 4; }

message InferenceResult {
  string frame_id = 1;
  repeated Detection detections = 2;
  float uncertainty = 3;
  string model_id = 4;
  string model_version = 5;
  google.protobuf.Duration server_processing = 6;
  repeated string violation_ids = 7;
  bool grace_period_active = 8;
}

message ModelBindingRequest { string camera_id = 1; }
message ModelBinding {
  string model_id = 1;
  string model_version = 2;
  string bundle_uri = 3;
  string cosign_signature = 4;
  google.protobuf.Timestamp effective_from = 5;
  bool is_canary = 6;
  float canary_traffic_pct = 7;
}

message EdgeHealthRequest {
  string edge_agent_id = 1;
  string firmware_version = 2;
  bool tamper_flag = 3;
  google.protobuf.Timestamp cert_expiry = 4;
  repeated string open_ports = 5;
  int32 cpu_pct = 6;
  int32 mem_pct = 7;
  int32 buffered_events = 8;
}

message Ack { bool ok = 1; }
message MetricsSubscribeRequest { string camera_id = 1; }
message MetricSample { string name = 1; double value = 2; google.protobuf.Timestamp t = 3; }
```

#### Kafka

- **Produces:** `safetyos.cv.event.v2`, `safetyos.cv.violation.v2`, `safetyos.audit.events`
- **Consumes:** `safetyos.model.lifecycle.v1`, `safetyos.ot.telemetry.v1` (filtered: `tag_type=gas_sensor`), `safetyos.kg.entity.upsert.v1`

#### Rate Limits / Timeouts / Retries / Idempotency

| Concern | Value |
|---|---|
| Timeout (SubmitFrame) | 200 ms server budget |
| Timeout (SubmitBatch) | 5 s per stream chunk |
| Retry (edge→gateway) | 3× @ 200ms/1s/5s |
| Circuit breaker (kg-service) | p99 > 200 ms sustained 60 s → cached binding |
| Rate limit (per-camera) | 30 fps hard ceiling |
| Rate limit (per-tenant) | 20,000 events/s |
| Rate limit (ack endpoint) | 100 req/min/user |
| Idempotency required | `:acknowledge`, `:dismiss`, `:escalate`, `:rollback` |

#### Error Codes

`cv.violation.already_acknowledged`, `cv.violation.dismiss_rationale_required`, `cv.frame.expired_by_retention`, `cv.frame.legal_hold`, `cv.model.canary_disagreement_exceeded`, `cv.model.rollback_locked_by_active_incident`, `cv.grace_period.not_configured`, `dependency.kg_unavailable`.

---

### 5.2 `edge-gateway-orchestrator` — Service #2

**Purpose.** Fleet-wide edge model distribution (signed bundles, canary, rollback), edge cyber-hardening posture (CV-036), SCEP + PKI enrollment. Owns **CV-025, CV-026, CV-027, CV-036, OT-032**.

#### REST APIs (Admin)

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /edge/v1/devices` | List devices | `platform.admin` |
| `POST /edge/v1/devices` | Provision device | `platform.tenant.provision` |
| `GET /edge/v1/devices/{device_id}` | Device detail | `platform.admin` |
| `PATCH /edge/v1/devices/{device_id}` | Update metadata (If-Match) | `platform.admin` |
| `DELETE /edge/v1/devices/{device_id}` | Decommission | `platform.admin` |
| `POST /edge/v1/devices/{device_id}:reenroll` | Rotate operational cert | `platform.admin` |
| `GET /edge/v1/bundles` | List published bundles | `platform.admin` |
| `POST /edge/v1/bundles` | Publish signed bundle | `policy.admin` |
| `POST /edge/v1/bundles/{bundle_id}:distribute` | Trigger distribution | `edge.fleet.kill` |
| `POST /edge/v1/bundles/{bundle_id}:rollback` | Kill-switch rollback (AG-020) | `edge.fleet.kill` |
| `GET /edge/v1/fleet/status` | Aggregate fleet health | `platform.admin` |

#### REST APIs (Edge-facing, mTLS)

| Verb + Path | Purpose |
|---|---|
| `POST /edge/v1/checkin` | Device heartbeat + posture |
| `GET /edge/v1/bundles/next` | Next bundle for device |
| `POST /edge/v1/logs` | Signed edge logs |

#### gRPC (`com.safetyos.perception.edge.v1`)

```proto
service EdgeOrchestrator {
  rpc EnrollDevice(DeviceEnrollRequest) returns (DeviceCredentials);
  rpc DistributeBundle(BundleDistributionRequest) returns (DistributionPlan);
  rpc GetFleetStatus(FleetStatusRequest) returns (FleetStatus);
  rpc TriggerRollback(RollbackRequest) returns (RollbackReceipt);
  rpc StreamPosture(FleetStatusRequest) returns (stream PostureEvent);
}
```

#### Kafka

- **Produces:** `safetyos.cv.event.v2` (edge_health), `safetyos.audit.events`
- **Consumes:** `safetyos.model.lifecycle.v1`

#### Rate Limits: Device check-in 1/30s/device; enrollment 100/min/site.

---

### 5.3 `pii-blur-service` — Service #3

**Purpose.** Face/plate blur on frames leaving the edge; authorization gate for un-blurred access (dual-approval + step-up + audit). Owns **CV-021**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /pii/v1/blur` | Synchronous blur | `cv.read` |
| `POST /pii/v1/unblur-tickets` | Request un-blur | `pii.raw.read` |
| `GET /pii/v1/unblur-tickets/{ticket_id}` | Ticket state | `pii.raw.read` |
| `POST /pii/v1/unblur-tickets/{ticket_id}:approve` | Second approver | `dlp.override` |
| `POST /pii/v1/unblur-tickets/{ticket_id}:reject` | Reject | `dlp.override` |

#### gRPC (`com.safetyos.perception.pii.v1`)

```proto
service PiiBlur {
  rpc Blur(BlurRequest) returns (BlurredFrame);
  rpc RequestUnblur(UnblurRequest) returns (UnblurTicket);
  rpc GetTicket(TicketId) returns (UnblurTicket);
  rpc DecideTicket(DecideTicketRequest) returns (UnblurTicket);
}
```

#### Kafka: Produces `safetyos.dlp.event.v1`, `safetyos.audit.events`.
#### Rate Limit: 100 req/s per tenant. Blur SLO p99 ≤ 400 ms. **Failure mode: hard fail-closed — unblurred frame is NEVER emitted.**

---

### 5.4 `ot-ingestion-bridge` — Service #4

**Purpose.** Ingests OPC-UA / Modbus / MQTT / historian telemetry (read-only), normalizes, maps tags to KG canonical IDs. Owns **OT-001 … OT-022, INT-001, OT-032**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /ot/v1/connectors` | List connectors | `ot.tag.admin` |
| `POST /ot/v1/connectors` | Create connector | `ot.tag.admin` |
| `GET /ot/v1/connectors/{id}` | Detail + health | `ot.tag.admin` |
| `PATCH /ot/v1/connectors/{id}` | Update | `ot.tag.admin` |
| `POST /ot/v1/connectors/{id}:test` | Probe endpoint | `ot.tag.admin` |
| `GET /ot/v1/tags` | List tags (cursor) | `ot.tag.read` |
| `GET /ot/v1/tags/{tag_id}` | Tag detail | `ot.tag.read` |
| `GET /ot/v1/tags/{tag_id}/value` | Last known value | `ot.tag.read` |
| `GET /ot/v1/tags/{tag_id}/history` | Historian query (cursor, `from`, `to`, `agg`, `interval`) | `ot.tag.read` |
| `POST /ot/v1/tags/{tag_id}/map` | Map tag → KG entity | `ot.tag.admin` |
| `POST /ot/v1/tags/bulk-map` | Bulk mapping | `ot.tag.admin` |

#### gRPC (`com.safetyos.ingestion.ot.v1`)

```proto
service OtIngestion {
  rpc GetTagMetadata(TagId) returns (TagMetadata);
  rpc SubscribeStream(SubscribeRequest) returns (stream Sample);
  rpc PublishGapFill(stream Sample) returns (GapFillAck);
  rpc GetConnectorHealth(ConnectorId) returns (ConnectorHealth);
}
```

#### Kafka

- **Produces:** `safetyos.ot.telemetry.v1` (256 partitions, key `tag_id`), `safetyos.ot.alarm.v1`
- **Consumes:** `safetyos.kg.entity.upsert.v1`

#### Rate Limits: No ingress rate limit (historian pushes native rates); admin API 100 req/min/user.
#### SLO: 99.99% availability (safety-critical), lag < 2 s at p99.

---

### 5.5 `ot-alarm-adapter` — Service #5

**Purpose.** Alarm feed normalization (ISA-18.2), debounce, burst detection. Feeds MODULE 14.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /ot/v1/alarms/sources` | List alarm sources | `ot.tag.admin` |
| `POST /ot/v1/alarms/sources` | Register source | `ot.tag.admin` |
| `GET /ot/v1/alarms/live` | Live alarm feed (SSE) | `ot.tag.read` |

#### Kafka: Produces `safetyos.ot.alarm.v1`, `safetyos.audit.events`. Inherits defaults from `ot-ingestion-bridge`.

---

### 5.6 `iot-wearable-bridge` — Service #6

**Purpose.** BLE / LoRaWAN / cellular wearable telemetry, presence-fusion with CV tracks. Owns **IOT-001 … IOT-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /iot/v1/telemetry` | Bulk telemetry ingest (CoAP bridge) | `ot.tag.admin` |
| `GET /iot/v1/devices` | List wearable devices | `ot.tag.admin` |
| `GET /iot/v1/devices/{device_id}` | Device detail | `ot.tag.admin` |
| `POST /iot/v1/devices` | Register device | `ot.tag.admin` |
| `GET /iot/v1/devices/{device_id}/position` | Last known position | `ot.tag.read` |
| `GET /iot/v1/presence/{zone_id}` | Zone occupancy (fused CV + UWB) | `ot.tag.read` |

#### Kafka: Produces `safetyos.iot.wearable.v1`, `safetyos.ot.telemetry.v1`.

---

### 5.7 `kg-service` — Service #7

**Purpose.** Canonical ontology of assets, zones, personnel, contractors, permits, equipment, hazards, chemicals, procedures. Entity resolution across sources. Owns **KG-001 … KG-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /kg/v1/search` | Full-text entity search (`q`, `type`, `site_id`) | `kg.read` |
| `GET /kg/v1/entities/{entity_id}` | Fetch entity | `kg.read` |
| `POST /kg/v1/entities` | Create entity | `kg.write` |
| `PUT /kg/v1/entities/{entity_id}` | Replace entity | `kg.write` |
| `PATCH /kg/v1/entities/{entity_id}` | Merge-patch entity | `kg.write` |
| `GET /kg/v1/entities/{entity_id}/neighbors` | Traverse immediate neighbors | `kg.read` |
| `GET /kg/v1/entities/{entity_id}/path` | Shortest path query | `kg.read` |
| `POST /kg/v1/cypher` | Execute scoped Cypher (read-only) | `kg.cypher` |
| `GET /kg/v1/ontology` | Ontology version + types | `kg.read` |

#### gRPC (`com.safetyos.fusion.kg.v1`)

```proto
service KnowledgeGraph {
  rpc Upsert(UpsertRequest) returns (UpsertResult);
  rpc Resolve(ResolveRequest) returns (Entity);
  rpc Traverse(TraversalRequest) returns (stream Entity);
  rpc CypherQuery(CypherQueryRequest) returns (stream Record);
  rpc BatchUpsert(stream UpsertRequest) returns (BatchResult);
}
```

#### Kafka

- **Produces:** `safetyos.kg.entity.upsert.v1` (compacted)
- **Consumes:** `safetyos.ot.telemetry.v1`, `safetyos.contractor.state.v1`, `safetyos.cv.event.v2`

#### Rate Limits: Cypher 10 concurrent queries/tenant, 30 s timeout; upsert 5k/s/tenant.
#### SLO: 99.95% availability, p99 read ≤ 100 ms.

---

### 5.8 `digital-twin-service` — Service #8

**Purpose.** 3D tile streams, spatial queries, real-time overlays (CV, OT, permits, LOTO). Owns **DT-001 … DT-024**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /twin/v1/tiles/{z}/{x}/{y}` | 3D tile (auth-scoped, CDN-fronted) | `kg.read` |
| `GET /twin/v1/spatial/query` | Spatial query (within radius, polygon) | `kg.read` |
| `POST /twin/v1/layouts` | Import layout (IFC/DWG/GeoJSON, streaming upload) | `platform.admin` |
| `GET /twin/v1/layouts/{layout_id}` | Layout metadata | `kg.read` |
| `GET /twin/v1/zones/{zone_id}/occupancy` | Zone occupancy overlay | `kg.read` |

#### gRPC (`com.safetyos.fusion.twin.v1`)

```proto
service DigitalTwin {
  rpc SpatialQuery(SpatialQueryRequest) returns (stream Entity);
  rpc ProjectDetection(ProjectDetectionRequest) returns (ProjectionResult);
  rpc ImportLayout(stream LayoutChunk) returns (ImportReceipt);
}
```

#### Kafka: Consumes `safetyos.cv.event.v2`, `safetyos.ot.telemetry.v1`, `safetyos.permit.state.v1`, `safetyos.loto.state.v1`, `safetyos.kg.entity.upsert.v1`. Produces `safetyos.audit.events`.
#### Rate Limits: 500 tile req/s/user (CDN absorbs). SLO: 99.9%, p99 spatial ≤ 300 ms.

---

### 5.9 `entity-resolution-service` — Service #9

**Purpose.** Deterministic + probabilistic entity matching (Splink/DuckDB). Owns **KG-005, KG-013**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /kg/v1/resolution/candidates` | List merge/split candidates | `kg.write` |
| `POST /kg/v1/resolution/candidates/{id}:approve` | Approve merge | `kg.write` |
| `POST /kg/v1/resolution/candidates/{id}:reject` | Reject candidate | `kg.write` |
| `POST /kg/v1/resolution/run` | Trigger resolution batch | `platform.admin` |

#### Kafka: Consumes `safetyos.kg.entity.upsert.v1`. Produces `safetyos.kg.match_candidates.v1`.

---

### 5.10 `compound-risk-engine` — Service #10

**Purpose.** Correlates events across CV, OT, KG, wearables to detect compound risk patterns via Flink streaming. Owns **CR-001 … CR-027**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /risk/v1/compound-risks` | List open compound risks (cursor, filter: `site_id`, `severity_min`, `pattern_id`) | `cv.read` |
| `GET /risk/v1/compound-risks/{risk_id}` | Fetch risk detail + evidence | `cv.read` |
| `POST /risk/v1/compound-risks/{risk_id}:acknowledge` | Operator ack | `cv.violation.ack` |
| `GET /risk/v1/patterns` | List patterns (admin) | `platform.admin` |
| `POST /risk/v1/patterns` | Create pattern (DSL) | `platform.admin` |
| `PUT /risk/v1/patterns/{pattern_id}` | Update pattern version | `platform.admin` |
| `POST /risk/v1/patterns/{pattern_id}:simulate` | Run simulation (links to sim-backtest) | `platform.admin` |
| `GET /risk/v1/patterns/{pattern_id}/metrics` | Pattern firing rate, FP rate | `platform.admin` |

#### gRPC (`com.safetyos.risk.compound.v2`)

```proto
service CompoundRisk {
  rpc EvaluateAdHoc(PatternRequest) returns (PatternResult);
  rpc StreamRisks(SiteFilter) returns (stream CompoundRiskEvent);
  rpc GetPatternStats(PatternId) returns (PatternStats);
}
```

#### Kafka

- **Consumes:** `safetyos.cv.event.v2`, `safetyos.cv.violation.v2`, `safetyos.ot.telemetry.v1`, `safetyos.ot.alarm.v1`, `safetyos.iot.wearable.v1`, `safetyos.permit.state.v1`, `safetyos.loto.state.v1`, `safetyos.kg.entity.upsert.v1`
- **Produces:** `safetyos.risk.compound.v2` (32 partitions, key `site_id`), `safetyos.audit.events`

#### SLO: 99.95%, ingest-to-emit p99 ≤ 5 s. Flink checkpoint every 30 s.

---

### 5.11 `multi-agent-orchestrator` — Service #11

**Purpose.** Coordinates LLM agents (triage, investigator, remediation, compliance, model-router) via Temporal + LangGraph. Owns **AG-001 … AG-020**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /agents/v1/cases` | Start a case | `agent.case.act` |
| `GET /agents/v1/cases/{case_id}` | Case state | `agent.case.read` |
| `GET /agents/v1/cases/{case_id}/decisions` | Pending decisions | `agent.case.read` |
| `POST /agents/v1/cases/{case_id}/decisions/{id}:respond` | Human-in-loop response | `agent.case.act` |
| `POST /agents/v1/cases/{case_id}:kill-switch` | Kill agent case | `agent.killswitch` |
| `GET /agents/v1/cases/{case_id}/narration` | SSE narration stream | `agent.case.read` |
| `POST /agents/v2/ai/global-kill` | Global AI kill-switch (AG-020) | `agent.killswitch` |
| `POST /agents/v2/models/{model_id}/kill` | Per-model kill (AG-020) | `agent.killswitch` |

#### gRPC (`com.safetyos.risk.agents.v1`)

```proto
service AgentOrchestrator {
  rpc StartCase(CaseRequest) returns (CaseId);
  rpc GetCaseState(CaseId) returns (CaseState);
  rpc RespondToHumanPrompt(HumanResponse) returns (Ack);
  rpc StreamNarration(CaseId) returns (stream NarrationEvent);
  rpc KillSwitch(KillRequest) returns (KillReceipt);
}
```

#### Kafka

- **Consumes:** `safetyos.risk.compound.v2`, `safetyos.incident.state.v1`, `safetyos.cv.violation.v2`
- **Produces:** `safetyos.agent.decision.v1`, `safetyos.audit.events`, `safetyos.workflow.command.v1`

#### Rate Limits: Global LLM spend budget/tenant/day; per-user prompt 60/min.
#### SLO: 99.9%, case-lifecycle p99 ≤ 60 s.

---

### 5.12 `rag-service` — Service #12

**Purpose.** RAG over SOPs, MSDS, permits, incidents, shift logs, regulatory codes. Hybrid retrieval (BM25 + vector) → re-ranker → LLM answer with citations. Owns **RAG-001 … RAG-020**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /rag/v1/query` | One-shot query (JSON response) | `rag.query` |
| `POST /rag/v1/chat` | Streaming chat (SSE response) | `rag.query` |
| `GET /rag/v1/conversations/{id}` | Conversation history | `rag.query` |
| `POST /rag/v1/feedback` | Thumbs-up/down signal | `rag.query` |
| `POST /rag/v1/admin/reindex` | Trigger full re-index | `rag.admin.reindex` |
| `GET /rag/v1/admin/index-status` | Index freshness + doc count | `rag.admin.reindex` |

#### SSE Streaming (`POST /rag/v1/chat`)

Response is `text/event-stream`:

```
id: 01J8WCZ3C4YJ
event: token
data: {"text": "According to ", "done": false}

id: 01J8WCZ3C4YK
event: token
data: {"text": "SOP-HW-14 §3.2", "done": false}

id: 01J8WCZ3C4YL
event: citation
data: {"doc_id": "sop-hw-14", "section": "3.2", "excerpt": "...", "score": 0.94}

id: 01J8WCZ3C4YM
event: done
data: {"total_tokens": 342, "sources": 4, "faithfulness": 0.96}
```

#### Kafka: Consumes `safetyos.shift.handover.v1`, `safetyos.incident.state.v1`, `safetyos.kg.entity.upsert.v1`.
#### Rate Limits: 30 queries/min/user; 5 concurrent streams/user.
#### SLO: 99.9%, p99 non-streaming ≤ 6 s, first-token TTFB ≤ 1.5 s.

---

### 5.13 `phm-service` — Service #13

**Purpose.** Prognostics + health-management models (RUL, failure-mode classification). Owns **PRED-001 … PRED-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /phm/v1/predictions` | List active predictions | `cv.read` |
| `GET /phm/v1/predictions/{id}` | Prediction detail | `cv.read` |
| `GET /phm/v1/equipment/{id}/health` | Equipment health score + RUL | `ot.tag.read` |
| `POST /phm/v1/models/{id}:retrain` | Trigger retraining | `platform.admin` |

#### Kafka: Consumes `safetyos.ot.telemetry.v1`. Produces `safetyos.phm.prediction.v1`.
#### SLO: 99.9%, p99 inference ≤ 500 ms.

---

### 5.14 `ptw-service` — Service #14

**Purpose.** Permit-to-Work lifecycle (draft → JHA → approval → issue → active → suspension → close). Hard interlocks with LOTO. Owns **PTW-001 … PTW-022**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /ptw/v1/permits` | List permits (cursor, rich filter) | `ptw.read` |
| `POST /ptw/v1/permits` | Draft permit (AI-assisted JSA) | `ptw.create` |
| `GET /ptw/v1/permits/{permit_id}` | Fetch permit | `ptw.read` |
| `PATCH /ptw/v1/permits/{permit_id}` | Update draft | `ptw.create` |
| `POST /ptw/v1/permits/{permit_id}:submit` | Submit for approval | `ptw.create` |
| `POST /ptw/v1/permits/{permit_id}:approve` | Approve (e-sign) | `ptw.approve` |
| `POST /ptw/v1/permits/{permit_id}:reject` | Reject with rationale | `ptw.approve` |
| `POST /ptw/v1/permits/{permit_id}:issue` | Issue (LOTO interlock enforced) | `ptw.issue` |
| `POST /ptw/v1/permits/{permit_id}:suspend` | Suspend (compound risk) | `ptw.issue` |
| `POST /ptw/v1/permits/{permit_id}:resume` | Resume (risk cleared) | `ptw.issue` |
| `POST /ptw/v1/permits/{permit_id}:close` | Close (area verification) | `ptw.close` |
| `POST /ptw/v1/permits/{permit_id}:cancel` | Cancel | `ptw.close` |
| `GET /ptw/v1/permits/{permit_id}/jsa` | Fetch JSA | `ptw.read` |
| `PUT /ptw/v1/permits/{permit_id}/jsa` | Update JSA | `ptw.create` |
| `GET /ptw/v1/permits/{permit_id}/approvals` | Approval chain state | `ptw.read` |
| `GET /ptw/v1/permits/{permit_id}/timeline` | State transition history | `ptw.read` |
| `GET /ptw/v1/permits/{permit_id}/evidence` | Attached evidence (photos, gas tests) | `ptw.read` |
| `POST /ptw/v1/permits/{permit_id}/evidence` | Upload evidence | `ptw.create` |
| `GET /ptw/v1/permits/active` | Active permits (hot index) | `ptw.read` |
| `GET /ptw/v1/permits/conflicts` | Open conflicts | `ptw.read` |

#### gRPC (`com.safetyos.workflows.ptw.v1`)

```proto
service PermitService {
  rpc Create(PermitDraftRequest) returns (Permit);
  rpc GetPermit(PermitId) returns (Permit);
  rpc ListPermits(PermitFilter) returns (stream Permit);
  rpc TransitionState(TransitionRequest) returns (Permit);
  rpc CheckInterlock(InterlockRequest) returns (InterlockResult);
}
```

#### Kafka

- **Produces:** `safetyos.permit.state.v1` (compacted, key `permit_id`), `safetyos.audit.events`
- **Consumes:** `safetyos.loto.state.v1`, `safetyos.cv.violation.v2`, `safetyos.ot.alarm.v1`, `safetyos.contractor.state.v1`

#### Idempotency: All state transitions idempotent by `permit_id + transition_id`.
#### Circuit Breakers: LOTO dependency fail → **permits CANNOT be issued** (fail-closed, regulatory requirement).
#### SLO: 99.95%, auto-suspend on CV violation ≤ 3 s.

---

### 5.15 `loto-service` — Service #15

**Purpose.** Energy-isolation lifecycle (identify → apply → verify zero-energy → lock → release). Cryptographic proof of isolation. Owns **LOTO-001 … LOTO-016**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /loto/v1/orders` | List LOTO orders | `loto.read` |
| `POST /loto/v1/orders` | Create LOTO order | `loto.apply` |
| `GET /loto/v1/orders/{loto_id}` | Order detail | `loto.read` |
| `POST /loto/v1/orders/{loto_id}:apply` | Apply locks | `loto.apply` |
| `POST /loto/v1/orders/{loto_id}:verify` | Verify zero-energy | `loto.apply` |
| `POST /loto/v1/orders/{loto_id}:lock` | Lock (cryptographic sign) | `loto.apply` |
| `POST /loto/v1/orders/{loto_id}:release` | Release locks (same-person + NFC) | `loto.release` |
| `POST /loto/v1/orders/{loto_id}:override` | Override (break-glass) | `loto.override` |
| `GET /loto/v1/orders/{loto_id}/points` | Isolation points | `loto.read` |
| `GET /loto/v1/orders/{loto_id}/verifications` | Verification records | `loto.read` |
| `GET /loto/v1/equipment/{equipment_id}/isolation` | Current isolation state | `loto.read` |

#### gRPC (`com.safetyos.workflows.loto.v1`)

```proto
service LotoService {
  rpc CreateOrder(LotoOrderRequest) returns (LotoOrder);
  rpc TransitionState(LotoTransition) returns (LotoOrder);
  rpc GetIsolationState(EquipmentId) returns (IsolationState);
  rpc VerifyZeroEnergy(VerificationRequest) returns (VerificationResult);
}
```

#### Kafka: Produces `safetyos.loto.state.v1` (compacted). Consumes IoT smart-lock attestation.
#### **Fail-closed** on any authoritative signal that isolation is uncertain.

---

### 5.16 `shift-handover-service` — Service #16

**Purpose.** Structured shift-log capture (voice, text, checklist), LLM-assisted summarization. Owns **SH-001 … SH-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /shift/v1/handovers` | List handovers | `sh.read` |
| `POST /shift/v1/handovers` | Create handover | `sh.compose` |
| `GET /shift/v1/handovers/{id}` | Detail + summary | `sh.read` |
| `POST /shift/v1/handovers/{id}/logs` | Add log entry (voice/text) | `sh.compose` |
| `POST /shift/v1/handovers/{id}:summarize` | Trigger AI summary | `sh.compose` |
| `POST /shift/v1/handovers/{id}:certify` | Incoming operator sign-off | `sh.certify` |
| `GET /shift/v1/handovers/{id}/audio` | Audio recording | `sh.read` |

#### WebSocket: `POST /shift/v1/handovers/{id}/voice-stream` — real-time voice transcription via WebSocket upgrade.
#### Kafka: Produces `safetyos.shift.handover.v1`.
#### SLO: 99.9%, summary p95 ≤ 30 s.

---

### 5.17 `incident-service` — Service #17

**Purpose.** Incident intake, triage, investigation, RCA (5-Why / TapRooT / Bow-Tie), CAPA tracking (ISO 45001), external reporting. Owns **INC-001 … INC-030**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /inc/v1/incidents` | List incidents (cursor, filter) | `inc.read` |
| `POST /inc/v1/incidents` | Create incident | `inc.create` |
| `GET /inc/v1/incidents/{id}` | Fetch incident | `inc.read` |
| `PATCH /inc/v1/incidents/{id}` | Update incident | `inc.create` |
| `POST /inc/v1/incidents/{id}:triage` | Set severity/priority | `inc.create` |
| `POST /inc/v1/incidents/{id}:assign` | Assign investigator | `inc.investigate` |
| `POST /inc/v1/incidents/{id}:close` | Close incident | `inc.investigate` |
| `POST /inc/v1/incidents/{id}:legal-hold` | Apply legal hold | `inc.legalhold` |
| `GET /inc/v1/incidents/{id}/evidence` | Evidence bundle | `inc.read` |
| `POST /inc/v1/incidents/{id}/evidence` | Upload evidence | `inc.create` |
| `GET /inc/v1/incidents/{id}/timeline` | AI-generated timeline | `inc.read` |
| `GET /inc/v1/incidents/{id}/rca` | RCA hypotheses | `inc.investigate` |
| `POST /inc/v1/incidents/{id}/rca` | Submit RCA findings | `inc.investigate` |
| `GET /inc/v1/incidents/{id}/capa` | CAPA items | `inc.read` |
| `POST /inc/v1/incidents/{id}/capa` | Create CAPA (INC-021) | `inc.investigate` |
| `GET /inc/v1/incidents/{id}/ir1` | Draft IR-1 (Factories Act §88A) | `inc.read` |
| `GET /inc/v1/incidents/{id}/notifications` | Notification log | `inc.read` |

#### gRPC (`com.safetyos.workflows.incident.v1`)

```proto
service IncidentService {
  rpc CreateIncident(IncidentRequest) returns (Incident);
  rpc GetIncident(IncidentId) returns (Incident);
  rpc TransitionState(IncidentTransition) returns (Incident);
  rpc StreamUpdates(IncidentId) returns (stream IncidentUpdate);
  rpc GetRCAGraph(IncidentId) returns (RCAGraph);
}
```

#### Kafka: Produces `safetyos.incident.state.v1` (compacted), `safetyos.audit.events`, `safetyos.compliance.finding.v1`.
#### SLO: 99.95%, incident-create p99 ≤ 2 s.

---

### 5.18 `emergency-response-orchestrator` — Service #18

**Purpose.** Emergency triggers, ER plans (evacuation, muster, hazmat, medical), muster reconciliation. Owns **ER-001 … ER-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /er/v1/plans` | List ER plans | `er.read` |
| `POST /er/v1/plans` | Create ER plan | `platform.admin` |
| `GET /er/v1/plans/{plan_id}` | Plan detail | `er.read` |
| `POST /er/v1/plans/{plan_id}:activate` | Activate ER (trigger broadcast) | `er.activate` |
| `POST /er/v1/plans/{plan_id}:terminate` | Terminate ER | `er.terminate` |
| `GET /er/v1/plans/{plan_id}/muster` | Muster reconciliation (who checked in, who missing) | `er.read` |
| `POST /er/v1/muster/{person_id}:check-in` | Muster check-in (QR/NFC) | `safetyos:mobile` |
| `GET /er/v1/plans/{plan_id}/routes` | Evacuation routes (from Digital Twin) | `er.read` |
| `GET /er/v1/active` | Active ER events | `er.read` |

#### WebSocket: `safetyos:tenant:{tid}:site:{sid}:er:live` — real-time muster updates, route changes, broadcast messages.

#### gRPC (`com.safetyos.workflows.er.v1`)

```proto
service EmergencyResponse {
  rpc ActivatePlan(ActivateRequest) returns (ActivationReceipt);
  rpc TerminatePlan(TerminateRequest) returns (Ack);
  rpc StreamMuster(PlanId) returns (stream MusterEvent);
  rpc GetEvacRoutes(EvacRequest) returns (EvacRoutes);
}
```

#### Kafka: Produces `safetyos.er.event.v1` (compacted, key `site_id`).
#### SLO: **99.99%** (life-safety), trigger-to-first-broadcast p99 ≤ 5 s.

---

### 5.19 `console-bff-service` — Service #19

**Purpose.** BFF for web Command Console. Aggregates queries across all planes via GraphQL federation. Owns **UI-001 … UI-032**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /console/v1/dashboard/{dashboard_id}` | Dashboard config | `safetyos:console` |
| `PUT /console/v1/dashboard/{dashboard_id}` | Save dashboard | `safetyos:console` |
| `GET /console/v1/preferences` | User preferences | `safetyos:console` |
| `PUT /console/v1/preferences` | Update preferences | `safetyos:console` |
| `POST /console/v1/ack` | Universal ack proxy | `cv.violation.ack` |

#### GraphQL Federation

```graphql
type Query {
  compoundRisks(siteId: ID!, severityMin: Severity): [CompoundRisk!]!
  permits(filter: PermitFilter!): PermitConnection!
  cameras(siteId: ID!): [Camera!]!
  incidents(filter: IncidentFilter!): IncidentConnection!
  kgEntity(id: ID!): Entity
  alarms(siteId: ID!, live: Boolean): [Alarm!]!
  shiftHandover(siteId: ID!, current: Boolean): ShiftHandover
}
```

#### WebSocket: Primary WebSocket gateway for all console panels (see §8).
#### SLO: 99.95%, panel-load p95 ≤ 2 s.

---

### 5.20 `mobile-bff-service` — Service #20

**Purpose.** BFF for iOS/Android app (native + Flutter). Offline-first sync. Owns **MOB-001 … MOB-024**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /mobile/v1/sync/pull` | Delta-sync pull | `safetyos:mobile` |
| `POST /mobile/v1/sync/push` | Delta-sync push (CRDT deltas) | `safetyos:mobile` |
| `POST /mobile/v1/voice/transcribe` | Voice command transcription | `safetyos:mobile` |
| `POST /mobile/v1/photos` | Upload photo (staging to S3) | `safetyos:mobile` |
| `GET /mobile/v1/notifications` | Notification inbox | `safetyos:mobile` |
| `POST /mobile/v1/muster/checkin` | ER muster check-in | `safetyos:mobile` |
| `GET /mobile/v1/nearby-hazards` | Geo-fenced hazards | `safetyos:mobile` |

#### SLO: 99.9%, sync p95 ≤ 3 s on LTE.

---

### 5.21 `alarm-rationalization-service` — Service #21

**Purpose.** ISA-18.2 alarm master-database, flood detection, stale-alarm nagging, KPI dashboards. Owns **AL-001 … AL-024**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /alarms/v1/master` | Alarm master database | `ot.tag.admin` |
| `PATCH /alarms/v1/master/{alarm_id}` | Update alarm config (priority, deadband) | `ot.tag.admin` |
| `GET /alarms/v1/live` | Live alarm state (SSE) | `ot.tag.read` |
| `GET /alarms/v1/kpi` | ISA-18.2 KPIs (alarms/hour/operator) | `ot.tag.read` |
| `GET /alarms/v1/floods` | Active alarm floods | `ot.tag.read` |
| `POST /alarms/v1/alarms/{alarm_id}:shelve` | Shelve alarm | `ot.tag.admin` |
| `POST /alarms/v1/alarms/{alarm_id}:unshelve` | Un-shelve alarm | `ot.tag.admin` |

#### Kafka: Consumes `safetyos.ot.alarm.v1`. Produces derived stats to lakehouse.
#### SLO: 99.95%.

---

### 5.22 `compliance-service` — Service #22

**Purpose.** Framework library (OSHA, ISO 45001, IEC 61511, ISA-84, PSM), evidence collection, audit-package generation. Owns **COMP-001 … COMP-030**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /comp/v1/frameworks` | List frameworks | `comp.read` |
| `GET /comp/v1/frameworks/{id}/controls` | Controls in framework | `comp.read` |
| `GET /comp/v1/controls/{control_id}/evidence` | Evidence mapped to control | `comp.read` |
| `POST /comp/v1/controls/{control_id}/evidence` | Attach evidence | `comp.evidence.write` |
| `GET /comp/v1/findings` | Compliance findings | `comp.read` |
| `POST /comp/v1/audits` | Create audit package | `comp.audit.export` |
| `GET /comp/v1/audits/{audit_id}` | Audit package (WORM hash) | `comp.audit.export` |
| `GET /comp/v1/audits/{audit_id}/download` | Download signed bundle | `comp.audit.export` |

#### Kafka: Consumes broad audit + state topics. Produces `safetyos.compliance.finding.v1`.
#### SLO: 99.95%.

---

### 5.23 `contractor-service` — Service #23

**Purpose.** Contractor registry, insurance certs, training records, badge issuance, gate check-in. Owns **CON-001 … CON-022**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /con/v1/contractors` | List contractors | `con.read` |
| `POST /con/v1/contractors` | Register contractor | `con.credential.write` |
| `GET /con/v1/contractors/{id}` | Contractor detail | `con.read` |
| `PATCH /con/v1/contractors/{id}` | Update contractor | `con.credential.write` |
| `GET /con/v1/contractors/{id}/credentials` | Training/certs/insurance | `con.read` |
| `POST /con/v1/contractors/{id}/credentials` | Upload credential | `con.credential.write` |
| `GET /con/v1/contractors/{id}/passport` | Safety Passport | `con.read` |
| `POST /con/v1/gate/checkin` | Gate check-in (NFC/QR) | `con.read` |
| `POST /con/v1/gate/checkout` | Gate check-out | `con.read` |

#### Kafka: Produces `safetyos.contractor.state.v1` (compacted).

---

### 5.24 `notification-router` — Service #24

**Purpose.** Multi-channel dispatch (SMS, voice, email, push, WebSocket, PA, radio), escalation trees. Owns **NOT-001 … NOT-020**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /notify/v1/dispatch` | Dispatch notification | `notification.dispatch` |
| `GET /notify/v1/dispatches/{id}` | Delivery status | `notification.dispatch` |
| `GET /notify/v1/preferences/{user_id}` | User notification preferences | `notification.dispatch` |
| `PUT /notify/v1/preferences/{user_id}` | Update preferences | `notification.dispatch` |
| `GET /notify/v1/oncall/{site_id}` | On-call schedule | `notification.dispatch` |
| `PUT /notify/v1/oncall/{site_id}` | Update on-call | `platform.admin` |
| `GET /notify/v1/escalation-trees` | List escalation trees | `platform.admin` |
| `POST /notify/v1/escalation-trees` | Create tree | `platform.admin` |

#### gRPC (`com.safetyos.comms.notification.v1`)

```proto
service NotificationRouter {
  rpc Dispatch(NotificationRequest) returns (DispatchReceipt);
  rpc GetStatus(DispatchId) returns (DispatchStatus);
  rpc StreamDeliveryReceipts(TenantFilter) returns (stream DeliveryReceipt);
}
```

#### Kafka: Consumes `safetyos.risk.compound.v2`, `safetyos.cv.violation.v2`, `safetyos.incident.state.v1`, `safetyos.er.event.v1`, `safetyos.ot.alarm.v1`, `safetyos.permit.state.v1`, `safetyos.compliance.finding.v1`. Produces `safetyos.notification.dispatch.v1`.
#### SLO: 99.95%, p99 dispatch ≤ 3 s. ER escalations: 99.99%.

---

### 5.25 `identity-service` — Service #25

**Purpose.** Frontend to Keycloak/Okta; SafetyOS attribute mapping, step-up (WebAuthn), break-glass, delegated admin. Owns **SEC-001 … SEC-006**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /identity/v1/token/refresh` | Refresh access token | — (refresh token) |
| `POST /identity/v1/introspect` | Token introspection (RFC 7662) | — (client creds) |
| `POST /identity/v1/revoke` | Token revocation (RFC 7009) | — (bearer) |
| `POST /identity/v1/stepup` | Initiate WebAuthn step-up | — (bearer) |
| `POST /identity/v1/stepup/verify` | Complete step-up | — (bearer) |
| `POST /identity/v1/break-glass` | Initiate break-glass (dual-approval) | `sec.break_glass` |
| `GET /identity/v1/users` | List users (admin) | `platform.admin` |
| `GET /identity/v1/users/{id}` | User detail | `platform.admin` |
| `PATCH /identity/v1/users/{id}/roles` | Update roles | `platform.admin` |
| `GET /identity/v1/sessions` | Active sessions | `platform.admin` |
| `DELETE /identity/v1/sessions/{session_id}` | Revoke session | `platform.admin` |
| `GET /.well-known/jwks.json` | JWKS endpoint | — (public) |
| `GET /.well-known/openid-configuration` | OIDC discovery | — (public) |
| `GET /.well-known/oauth-authorization-server` | OAuth metadata (RFC 8414) | — (public) |

#### SLO: 99.99% (login-blocker).

---

### 5.26 `policy-engine` — Service #26

**Purpose.** OPA Bundle Server + evaluation service (sidecar + centralized fallback). Policy authoring + CI/CD pipeline. Owns **WFP-003**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `POST /policy/v1/evaluate` | Central policy evaluation | — (sidecar / SPIFFE) |
| `GET /policy/v1/bundles` | List published bundles | `policy.admin` |
| `POST /policy/v1/bundles` | Publish bundle (signed) | `policy.admin` |
| `GET /policy/v1/bundles/{version}` | Download bundle | — (sidecar poll) |
| `GET /policy/v1/bundles/latest` | Latest bundle metadata | — (sidecar poll) |
| `GET /policy/v1/matrix` | Permission matrix (`?format=csv|json`) | `policy.admin` |
| `POST /policy/v1/test` | Run policy test suite | `policy.admin` |

#### SLO: 99.99% (sidecar), 99.95% (central).

---

### 5.27 `data-governance-service` — Service #27

**Purpose.** PII discovery, DLP scanning, DSR orchestration (GDPR/CCPA), retention policy execution. Owns **SEC-007 … SEC-022**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /governance/v1/classifications` | Data classification catalog | `platform.admin` |
| `POST /governance/v1/scan` | Trigger DLP scan | `platform.admin` |
| `GET /governance/v1/scan/{scan_id}` | Scan results | `platform.admin` |
| `POST /governance/v1/dsr` | Create data subject request | `platform.admin` |
| `GET /governance/v1/dsr/{dsr_id}` | DSR status | `platform.admin` |
| `GET /governance/v1/retention-policies` | List retention policies | `platform.admin` |
| `PUT /governance/v1/retention-policies/{id}` | Update retention policy | `platform.admin` |

#### Kafka: Produces `safetyos.dlp.event.v1`.
#### DSR SLA: erase ≤ 30 days per regulation.

---

### 5.28 `audit-sink-service` — Service #28

**Purpose.** Consumes all `safetyos.audit.events`, writes to S3 Object Lock (WORM), provides indexed search. Owns **SEC-018, OBS-002**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /audit/v1/events` | Search audit trail (cursor, filter: `actor`, `action`, `target`, `from`, `to`) | `comp.audit.export` |
| `GET /audit/v1/events/{event_id}` | Single audit event | `comp.audit.export` |
| `GET /audit/v1/events/{event_id}/verify` | Verify hash chain integrity | `comp.audit.export` |
| `POST /audit/v1/export` | Export audit bundle (WORM, signed) | `comp.audit.export` |

#### Kafka: Consumes `safetyos.audit.events` (64 partitions, key `tenant_id`).
#### SLO: 99.99% ingest (no audit loss tolerated).

---

### 5.29 `workflow-engine` — Service #29

**Purpose.** Managed Temporal cluster with SafetyOS wrappers: approval workflow substrate, per-namespace quotas. Owns **WFP-001, WFP-004**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /workflow/v1/executions` | List workflow executions | `platform.admin` |
| `GET /workflow/v1/executions/{id}` | Execution detail | `platform.admin` |
| `POST /workflow/v1/executions/{id}:terminate` | Terminate workflow | `platform.admin` |
| `POST /workflow/v1/approvals` | Create approval workflow | `platform.admin` |
| `GET /workflow/v1/approvals/{id}` | Approval state | `platform.admin` |
| `POST /workflow/v1/approvals/{id}:approve` | Approve | — (per approval type) |
| `POST /workflow/v1/approvals/{id}:reject` | Reject | — (per approval type) |

#### gRPC: Temporal-native gRPC + SafetyOS SDK wrappers.
#### Kafka: Bridges to `safetyos.workflow.command.v1`.
#### SLO: 99.99% (foundational).

---

### 5.30 `rule-engine-service` — Service #30

**Purpose.** Business rules (DMN + custom DSL) for non-OPA decisions (alarm-priority, PHM scoring, compliance evidence). Owns **WFP-006**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /rules/v1/rulesets` | List rulesets | `platform.admin` |
| `POST /rules/v1/rulesets` | Create ruleset | `platform.admin` |
| `PUT /rules/v1/rulesets/{id}` | Update ruleset | `platform.admin` |
| `POST /rules/v1/evaluate` | Evaluate rules against input | — (SPIFFE) |

---

### 5.31 `feature-flag-service` — Service #31

**Purpose.** Feature flags (kill-switches, canary gates, tenant-scoped). Owns **WFP-008**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /flags/v1/flags` | List all flags | `platform.admin` |
| `GET /flags/v1/flags/{flag_key}` | Flag detail | `platform.admin` |
| `PUT /flags/v1/flags/{flag_key}` | Update flag | `platform.admin` |
| `GET /flags/v1/evaluate` | Bulk evaluate flags for context | — (sidecar SDK) |

#### SLO: 99.99% (kill-switch reliability).

---

### 5.32 `tenant-service` — Service #32

**Purpose.** Tenant provisioning, quota enforcement. Owns **PLT-001 … PLT-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /platform/v1/tenants` | List tenants | `platform.admin` |
| `POST /platform/v1/tenants` | Provision tenant | `platform.tenant.provision` |
| `GET /platform/v1/tenants/{id}` | Tenant detail | `platform.admin` |
| `PATCH /platform/v1/tenants/{id}` | Update tenant config | `platform.admin` |
| `GET /platform/v1/tenants/{id}/quotas` | Quota usage | `platform.admin` |
| `PUT /platform/v1/tenants/{id}/quotas` | Update quotas | `platform.admin` |
| `GET /platform/v1/tenants/{id}/sites` | Sites for tenant | `platform.admin` |
| `POST /platform/v1/tenants/{id}/sites` | Create site | `platform.tenant.provision` |

#### SLO: 99.95%.

---

### 5.33 `integration-hub` — Service #33

**Purpose.** Adapter pattern for external systems (SAP, Oracle EAM, Maximo, ServiceNow, insurer bus, regulator bus). Owns **INT-001 … INT-024**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /integrations/v1/adapters` | List adapters | `platform.admin` |
| `POST /integrations/v1/adapters` | Create adapter config | `platform.admin` |
| `GET /integrations/v1/adapters/{id}` | Adapter detail + health | `platform.admin` |
| `PATCH /integrations/v1/adapters/{id}` | Update adapter | `platform.admin` |
| `POST /integrations/v1/adapters/{id}:test` | Test connectivity | `platform.admin` |
| `POST /integrations/v1/adapters/{id}:sync` | Trigger delta sync | `platform.admin` |
| `GET /integrations/v1/adapters/{id}/log` | Sync log | `platform.admin` |

#### Kafka: Consumes many topics for outbound sync. Produces `safetyos.integration.inbound.v1`.
#### SLO: 99.9%.

---

### 5.34 `devx-service` — Service #34

**Purpose.** Developer portal, API keys, webhooks, SDK distribution. Owns **PLT-015 … PLT-018**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /devx/v1/api-keys` | List API keys | `platform.admin` |
| `POST /devx/v1/api-keys` | Create API key (secret shown once) | `platform.admin` |
| `DELETE /devx/v1/api-keys/{key_id}` | Revoke key | `platform.admin` |
| `POST /devx/v1/api-keys/{key_id}:rotate` | Rotate key (7 d overlap) | `platform.admin` |
| `GET /devx/v1/webhooks` | List webhook endpoints | `platform.admin` |
| `POST /devx/v1/webhooks` | Register webhook | `platform.admin` |
| `PATCH /devx/v1/webhooks/{id}` | Update webhook | `platform.admin` |
| `DELETE /devx/v1/webhooks/{id}` | Deregister webhook | `platform.admin` |
| `POST /devx/v1/webhooks/{id}:test` | Send test event | `platform.admin` |
| `GET /devx/v1/sandbox` | Sandbox tenant status | `platform.admin` |
| `POST /devx/v1/sandbox` | Provision sandbox | `platform.admin` |

#### SLO: 99.9%.

---

### 5.35 `lakehouse-service` — Service #35

**Purpose.** Bronze / Silver / Gold lakehouse (Delta Lake on S3), Kafka → Bronze ingestion, BI via Trino. Owns **DP-001 … DP-016**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /data/v1/tables` | List lakehouse tables | `platform.admin` |
| `GET /data/v1/tables/{table}/schema` | Table schema | `platform.admin` |
| `GET /data/v1/tables/{table}/freshness` | Freshness metrics | `platform.admin` |
| `POST /data/v1/query` | Submit SQL query (via Trino) | `platform.admin` |
| `GET /data/v1/query/{query_id}` | Query results | `platform.admin` |
| `POST /data/v1/backfill` | Trigger backfill job | `platform.admin` |
| `GET /data/v1/jobs/{job_id}` | Job status | `platform.admin` |

#### Kafka: Consumes essentially all `safetyos.*` topics (Bronze ingestion). Terminal sink.
#### SLO: 99.5%, freshness ≤ 1 h Silver, ≤ 4 h Gold.

---

### 5.36 `mlops-control-plane` — Service #36

**Purpose.** Model registry, training pipelines, canary/shadow deployment, drift monitoring. Owns **DP-005 … DP-012**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /mlops/v1/models` | List models | `platform.admin` |
| `GET /mlops/v1/models/{model_id}` | Model detail + versions | `platform.admin` |
| `POST /mlops/v1/models/{model_id}/versions` | Register new version | `platform.admin` |
| `GET /mlops/v1/models/{model_id}/versions/{v}/card` | Model card (EU AI Act) | `platform.admin` |
| `POST /mlops/v1/models/{model_id}/versions/{v}:deploy` | Deploy (canary/shadow/full) | `platform.admin` |
| `POST /mlops/v1/models/{model_id}/versions/{v}:rollback` | Rollback | `cv.model.rollback` |
| `GET /mlops/v1/drift` | Drift monitoring dashboard | `platform.admin` |
| `POST /mlops/v1/training` | Submit training pipeline | `platform.admin` |
| `GET /mlops/v1/training/{pipeline_id}` | Pipeline status | `platform.admin` |

#### Kafka: Produces `safetyos.model.lifecycle.v1`. Consumes `safetyos.agent.decision.v1`.
#### SLO: 99.9%; kill-switch 99.99%.

---

### 5.37 `feature-store-service` — Service #37

**Purpose.** Feast-based online (Redis) + offline (Delta) feature stores. Owns **DP-013 … DP-016**.

#### REST / gRPC APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /features/v1/feature-views` | List feature views | `platform.admin` |
| `POST /features/v1/online` | Get online features (batch) | — (SPIFFE) |

```proto
service FeatureStore {
  rpc GetOnlineFeatures(FeatureRequest) returns (FeatureResponse);
  rpc GetHistoricalFeatures(HistoricalRequest) returns (stream FeatureRow);
}
```

#### SLO: 99.95%, p99 online read ≤ 20 ms.

---

### 5.38 `observability-platform-service` — Service #38

**Purpose.** Prometheus + Mimir + Loki + Tempo + Nobl9 + Alertmanager. Owns **OBS-001 … OBS-014**.

#### REST APIs

| Verb + Path | Purpose | Scope |
|---|---|---|
| `GET /obs/v1/slos` | SLO catalog | `platform.admin` |
| `GET /obs/v1/slos/{slo_id}/budget` | Error budget burn rate | `platform.admin` |
| `GET /obs/v1/alerts` | Active alerts | `platform.admin` |
| `POST /obs/v1/alerts/{id}:silence` | Silence alert | `platform.admin` |
| `GET /obs/v1/runbooks` | Runbook catalog | `platform.admin` |
| `GET /obs/v1/status` | Platform status page | — (public per tenant) |

#### SLO: 99.99% (visibility during outages).

---

### 5.39 – 5.48 (Remaining Services)

| # | Service | Purpose | Key REST Endpoints | Key gRPC | SLO |
|---|---|---|---|---|---|
| 39 | `sim-backtest-service` | Pattern simulation + backtest (CR-024) | `POST /sim/v1/runs`, `GET /sim/v1/runs/{id}` | `rpc RunBacktest(…)` | 99.5% |
| 40 | `frame-retention-service` | Encrypted video retention, legal hold promotion (CV-029) | `GET /frames/v1/segments`, `POST /frames/v1/segments/{id}:hold` | `rpc GetSegment(…)` | 99.95% |
| 41 | `human-in-loop-broker` | Universal AI→human decision hand-off (AG-019) | `POST /hitl/v1/decisions`, `POST /hitl/v1/decisions/{id}:approve`, `:reject`, `:escalate` | `rpc SubmitDecision(…)` | 99.95% |
| 42 | `search-service` | Cross-module unified search | `GET /search/v1/query` | — | 99.9% |
| 43 | `report-service` | Canned reports (PDF/XLSX) + scheduled distribution | `POST /reports/v1/generate`, `GET /reports/v1/{id}`, `GET /reports/v1/{id}/download` | — | 99.9% |
| 44 | `esign-service` | Cryptographic e-signature (21 CFR Part 11) | `POST /esign/v1/sign`, `GET /esign/v1/manifests/{id}`, `POST /esign/v1/verify` | `rpc Sign(…)` | 99.95% |
| 45 | `credentialing-service` | Training currency, medical validity (CON-005…014) | `GET /cred/v1/workers/{id}/status`, `POST /cred/v1/verify` | — | 99.9% |
| 46 | `map-tile-service` | CDN-fronted 2D/3D tile server (DT-005) | `GET /tiles/v1/{layer}/{z}/{x}/{y}` | — | 99.9% |
| 47 | `webhook-service` | Outbound webhooks (HMAC signed, exponential retry) | `GET /webhooks/v1/deliveries`, `POST /webhooks/v1/deliveries/{id}:replay` | — | 99.9% |
| 48 | `sre-runbook-service` | Executable runbooks (OBS-013) | `GET /runbooks/v1/`, `POST /runbooks/v1/{id}:execute` (dual-approval) | — | 99.9% |

---

## 6. OpenAPI 3.1 Specification

### 6.1 Canonical OpenAPI Document Structure

Each microservice publishes an independent OpenAPI 3.1 document at `/{module}/v{n}/openapi.json`. The gateway aggregates all documents into a unified developer portal.

```yaml
openapi: "3.1.0"
info:
  title: "SafetyOS — Permit-to-Work API"
  version: "1.0.0"
  description: "Permit lifecycle management with LOTO interlocks and AI-assisted JSA."
  contact:
    name: "PTW Platform Squad"
    email: "ptw-squad@safetyos.io"
  license:
    name: "Proprietary"
servers:
  - url: "https://api.safetyos.io/ptw/v1"
    description: "Production"
  - url: "https://api.staging.safetyos.io/ptw/v1"
    description: "Staging"
  - url: "https://api.sandbox.safetyos.io/ptw/v1"
    description: "Sandbox"

security:
  - BearerAuth: []
  - HMACAuth: []

paths:
  /permits:
    get:
      operationId: listPermits
      tags: [Permits]
      summary: List permits
      parameters:
        - $ref: "#/components/parameters/PageSize"
        - $ref: "#/components/parameters/PageToken"
        - $ref: "#/components/parameters/Filter"
        - $ref: "#/components/parameters/OrderBy"
        - name: site_id
          in: query
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: Paginated permit list
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PermitListResponse"
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthenticated" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "429": { $ref: "#/components/responses/RateLimited" }

    post:
      operationId: createPermit
      tags: [Permits]
      summary: Draft a Permit-to-Work
      parameters:
        - $ref: "#/components/parameters/IdempotencyKey"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PermitDraftRequest"
      responses:
        "201":
          description: Draft created with AI JSA
          headers:
            Location: { schema: { type: string } }
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PermitResponse"
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthenticated" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "422": { $ref: "#/components/responses/UnprocessableEntity" }
        "428": { $ref: "#/components/responses/PreconditionRequired" }

  /permits/{permit_id}:issue:
    post:
      operationId: issuePermit
      tags: [Permits]
      summary: Issue permit (LOTO interlock enforced)
      parameters:
        - name: permit_id
          in: path
          required: true
          schema: { type: string }
        - $ref: "#/components/parameters/IdempotencyKey"
      responses:
        "200":
          description: Permit issued
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PermitResponse"
        "401": { $ref: "#/components/responses/Unauthenticated" }
        "403": { $ref: "#/components/responses/Forbidden" }
        "404": { $ref: "#/components/responses/NotFound" }
        "409": { $ref: "#/components/responses/Conflict" }
        "423": { $ref: "#/components/responses/Locked" }
        "428": { $ref: "#/components/responses/PreconditionRequired" }

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    HMACAuth:
      type: apiKey
      in: header
      name: Authorization
      description: "SafetyOS-HMAC-SHA256 scheme"

  parameters:
    PageSize:
      name: page_size
      in: query
      schema: { type: integer, minimum: 1, maximum: 500, default: 100 }
    PageToken:
      name: page_token
      in: query
      schema: { type: string }
    Filter:
      name: filter
      in: query
      schema: { type: string }
      description: "AIP-160 filter expression"
    OrderBy:
      name: order_by
      in: query
      schema: { type: string }
      description: "Comma-separated field:direction pairs"
    IdempotencyKey:
      name: Idempotency-Key
      in: header
      required: true
      schema: { type: string, minLength: 26, maxLength: 64 }

  schemas:
    PermitDraftRequest:
      type: object
      required: [type, zone_id, requested_by, planned_start, planned_end, description]
      properties:
        type: { type: string, enum: [HOT_WORK, CONFINED_SPACE, WORK_AT_HEIGHT, LINE_BREAK, EXCAVATION, ELECTRICAL, GENERAL] }
        zone_id: { type: string, format: uuid }
        requested_by: { type: string }
        planned_start: { type: string, format: date-time }
        planned_end: { type: string, format: date-time }
        description: { type: string, maxLength: 2000 }
        crew: { type: array, items: { type: string } }
        loto_ref: { type: string, description: "LOTO order ID if required" }

    PermitResponse:
      type: object
      properties:
        meta: { $ref: "#/components/schemas/ResponseMeta" }
        data:
          $ref: "#/components/schemas/Permit"

    Permit:
      type: object
      properties:
        permit_id: { type: string }
        tenant_id: { type: string, format: uuid }
        site_id: { type: string, format: uuid }
        type: { type: string }
        status: { type: string, enum: [DRAFT, RISK_ASSESSED, CONFLICT_CHECK, REQUIRES_CHANGE, APPROVED, ACTIVE, SUSPENDED, CLOSED, CANCELLED] }
        zone_id: { type: string, format: uuid }
        created_by: { type: string }
        approved_by: { type: string, nullable: true }
        planned_start: { type: string, format: date-time }
        planned_end: { type: string, format: date-time }
        description: { type: string }
        jsa_ref: { type: string, nullable: true }
        loto_ref: { type: string, nullable: true }
        compound_risk_flags: { type: array, items: { $ref: "#/components/schemas/RiskFlag" } }
        ai_draft_meta: { type: object, nullable: true }
        created_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }
        version: { type: integer }

    RiskFlag:
      type: object
      properties:
        type: { type: string }
        pattern: { type: string }
        score: { type: number }
        evidence: { type: array, items: { type: object } }

    ResponseMeta:
      type: object
      properties:
        api_version: { type: string }
        request_id: { type: string }
        correlation_id: { type: string }
        served_by: { type: string }
        region: { type: string }
        timestamp: { type: string, format: date-time }

    ProblemDetail:
      type: object
      description: "RFC 7807 Problem Details with SafetyOS extensions"
      properties:
        type: { type: string, format: uri }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string }
        code: { type: string }
        correlation_id: { type: string }
        trace_id: { type: string }
        tenant_id: { type: string }
        retryable: { type: boolean }
        retry_after_seconds: { type: integer, nullable: true }
        field_errors: { type: array, items: { $ref: "#/components/schemas/FieldError" } }
        remediation: { type: array, items: { type: string } }

    FieldError:
      type: object
      properties:
        field: { type: string }
        code: { type: string }
        message: { type: string }

  responses:
    BadRequest: { description: "400 Bad Request", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    Unauthenticated: { description: "401 Unauthenticated", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    Forbidden: { description: "403 Forbidden", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    NotFound: { description: "404 Not Found", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    Conflict: { description: "409 Conflict", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    Locked: { description: "423 Locked", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    UnprocessableEntity: { description: "422 Unprocessable Entity", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    PreconditionRequired: { description: "428 Precondition Required", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
    RateLimited: { description: "429 Too Many Requests", headers: { Retry-After: { schema: { type: integer } } }, content: { "application/problem+json": { schema: { $ref: "#/components/schemas/ProblemDetail" } } } }
```

### 6.2 Canonical OpenAPI Documents per Service

Every service publishes at runtime. CI generates static snapshots committed to `api-specs/` monorepo:

| Service | Spec Path | Endpoints |
|---|---|---|
| cv-inference-gateway | `/cv/v1/openapi.json` | 20 |
| edge-gateway-orchestrator | `/edge/v1/openapi.json` | 15 |
| pii-blur-service | `/pii/v1/openapi.json` | 6 |
| ot-ingestion-bridge | `/ot/v1/openapi.json` | 12 |
| kg-service | `/kg/v1/openapi.json` | 9 |
| digital-twin-service | `/twin/v1/openapi.json` | 5 |
| compound-risk-engine | `/risk/v1/openapi.json` | 8 |
| multi-agent-orchestrator | `/agents/v1/openapi.json` | 8 |
| rag-service | `/rag/v1/openapi.json` | 6 |
| ptw-service | `/ptw/v1/openapi.json` | 22 |
| loto-service | `/loto/v1/openapi.json` | 12 |
| incident-service | `/inc/v1/openapi.json` | 18 |
| emergency-response-orchestrator | `/er/v1/openapi.json` | 9 |
| console-bff-service | `/console/v1/openapi.json` | 5 |
| mobile-bff-service | `/mobile/v1/openapi.json` | 7 |
| notification-router | `/notify/v1/openapi.json` | 8 |
| identity-service | `/identity/v1/openapi.json` | 13 |
| policy-engine | `/policy/v1/openapi.json` | 7 |
| All others | `/{module}/v1/openapi.json` | Per §5 |

---

## 7. gRPC / Protobuf Specification

### 7.1 Proto Repository Structure

```
/proto
├── safetyos/
│   ├── common/
│   │   ├── v1/
│   │   │   ├── envelope.proto        # EventEnvelope, ResponseMeta
│   │   │   ├── pagination.proto      # PageRequest, PageResponse
│   │   │   ├── error.proto           # ErrorDetail, FieldError
│   │   │   ├── audit.proto           # AuditEvent
│   │   │   └── types.proto           # UUID, ULID, GeoPoint, BBox
│   ├── perception/
│   │   ├── cv/v2/
│   │   │   └── cv_inference.proto     # CvInference service (§5.1)
│   │   ├── edge/v1/
│   │   │   └── edge_orchestrator.proto
│   │   └── pii/v1/
│   │       └── pii_blur.proto
│   ├── ingestion/
│   │   ├── ot/v1/
│   │   │   └── ot_ingestion.proto     # OtIngestion service (§5.4)
│   │   └── iot/v1/
│   │       └── iot_wearable.proto
│   ├── fusion/
│   │   ├── kg/v1/
│   │   │   └── knowledge_graph.proto  # KnowledgeGraph service (§5.7)
│   │   └── twin/v1/
│   │       └── digital_twin.proto
│   ├── risk/
│   │   ├── compound/v2/
│   │   │   └── compound_risk.proto
│   │   └── agents/v1/
│   │       └── agent_orchestrator.proto
│   ├── workflows/
│   │   ├── ptw/v1/
│   │   │   └── permit_service.proto
│   │   ├── loto/v1/
│   │   │   └── loto_service.proto
│   │   ├── incident/v1/
│   │   │   └── incident_service.proto
│   │   └── er/v1/
│   │       └── emergency_response.proto
│   ├── comms/
│   │   └── notification/v1/
│   │       └── notification_router.proto
│   ├── platform/
│   │   ├── feature_store/v1/
│   │   │   └── feature_store.proto
│   │   └── workflow_engine/v1/
│   │       └── workflow_engine.proto
│   └── data/
│       └── streaming/v1/
│           └── event_stream.proto     # Cross-module streaming (PRSD §17.4)
├── buf.yaml
├── buf.gen.yaml
└── buf.lock
```

### 7.2 Common Proto Definitions

```proto
syntax = "proto3";
package com.safetyos.common.v1;

import "google/protobuf/timestamp.proto";
import "google/protobuf/struct.proto";

message EventEnvelope {
  string event_id = 1;
  string event_type = 2;
  string tenant_id = 3;
  string trace_id = 4;
  string span_id = 5;
  google.protobuf.Timestamp occurred_at = 6;
  google.protobuf.Timestamp ingested_at = 7;
  string producer = 8;
  string schema_version = 9;
  string idempotency_key = 10;
  bytes payload = 11;
  map<string, string> attributes = 12;
}

message PageRequest {
  int32 page_size = 1;
  string page_token = 2;
  string filter = 3;
  string order_by = 4;
}

message PageResponse {
  string next_page_token = 1;
  string prev_page_token = 2;
  int32 total_count = 3;
  bool has_next = 4;
}

message ErrorDetail {
  string type = 1;
  string title = 2;
  int32 status = 3;
  string detail = 4;
  string code = 5;
  string correlation_id = 6;
  string trace_id = 7;
  bool retryable = 8;
  repeated FieldError field_errors = 9;
}

message FieldError {
  string field = 1;
  string code = 2;
  string message = 3;
}
```

### 7.3 Cross-Module Streaming Service (PRSD §17.4)

```proto
syntax = "proto3";
package com.safetyos.data.streaming.v1;

service EventStream {
  rpc SubscribeCompoundRisks(SiteFilter) returns (stream CompoundRiskEvent);
  rpc SubscribeObservations(TagFilter) returns (stream Observation);
  rpc SubscribeViolations(SiteFilter) returns (stream ViolationEvent);
  rpc PublishFieldObservation(stream FieldObservation) returns (Ack);
}

message SiteFilter {
  string tenant_id = 1;
  repeated string site_ids = 2;
  string severity_min = 3;
}

message TagFilter {
  string tenant_id = 1;
  repeated string tag_ids = 2;
  string site_id = 3;
}
```

### 7.4 buf.yaml Lint + Breaking Change Rules

```yaml
version: v2
lint:
  use:
    - DEFAULT
    - COMMENTS
    - UNARY_RPC
  except:
    - RPC_REQUEST_STANDARD_NAME
breaking:
  use:
    - WIRE_JSON
    - PACKAGE
```

---

## 8. WebSocket Specification

### 8.1 Connection Lifecycle

```
Client                                 Server (console-bff / ws-fanout)
  │                                         │
  │  GET /ws?token={jwt} HTTP/1.1           │
  │  Upgrade: websocket                     │
  │  Sec-WebSocket-Protocol: safetyos.v1    │
  ├────────────────────────────────────────►│
  │                                         │ validate JWT, ACL, rate-limit
  │  HTTP/1.1 101 Switching Protocols       │
  │  Sec-WebSocket-Protocol: safetyos.v1    │
  │◄────────────────────────────────────────┤
  │                                         │
  │  {"type":"hello","version":"1.0",       │
  │   "resume_token":null,                  │
  │   "heartbeat_interval_ms":15000}        │
  │◄────────────────────────────────────────┤
  │                                         │
  │  {"type":"subscribe",                   │
  │   "channel":"safetyos:acme:site-01:cv", │
  │   "resume_token":null}                  │
  ├────────────────────────────────────────►│
  │                                         │ check ACL for channel
  │  {"type":"subscribed","channel":"..."}  │
  │◄────────────────────────────────────────┤
  │                                         │
  │  {"type":"event","channel":"...",       │
  │   "event":"cv.violation","id":"01J...", │
  │   "data":{...},"priority":"critical"}  │
  │◄────────────────────────────────────────┤
```

### 8.2 Message Types

| Type | Direction | Purpose |
|---|---|---|
| `hello` | S→C | Connection established; carries `heartbeat_interval_ms`, `resume_token` |
| `subscribe` | C→S | Subscribe to a channel; optional `resume_token` for gap-fill |
| `subscribed` | S→C | Subscription confirmed |
| `unsubscribe` | C→S | Unsubscribe from channel |
| `unsubscribed` | S→C | Unsubscription confirmed |
| `event` | S→C | Domain event pushed to client |
| `ack` | C→S | Client acknowledgment (for `critical` / `life-safety` priority) |
| `heartbeat` | S→C | Keep-alive ping (every 15 s) |
| `pong` | C→S | Client response to heartbeat |
| `error` | S→C | Subscription error, auth error |
| `resume` | C→S | Request gap-fill from `resume_token` |
| `resumed` | S→C | Gap-fill complete; normal streaming resumes |

### 8.3 Channel Naming Convention

```
safetyos:{tenant}:{site}:{domain}[:{sub}]
```

| Channel Pattern | Domain | Payload |
|---|---|---|
| `safetyos:{t}:{s}:cv` | All CV events for site | `cv.event.v2`, `cv.violation.v2` |
| `safetyos:{t}:{s}:cv:{camera_id}` | Single camera | Filtered detections |
| `safetyos:{t}:{s}:risk` | Compound risks | `risk.compound.v2` |
| `safetyos:{t}:{s}:ot` | OT telemetry (sampled) | `ot.telemetry.v1` |
| `safetyos:{t}:{s}:alarms` | Alarm feed | `ot.alarm.v1` |
| `safetyos:{t}:{s}:ptw` | PTW state changes | `permit.state.v1` |
| `safetyos:{t}:{s}:loto` | LOTO state changes | `loto.state.v1` |
| `safetyos:{t}:{s}:er:live` | Emergency response | `er.event.v1` |
| `safetyos:{t}:{s}:muster` | Muster reconciliation | Muster check-ins |
| `safetyos:{t}:{s}:incidents` | Incident updates | `incident.state.v1` |
| `safetyos:{t}:{s}:notifications` | User notifications | `notification.dispatch.v1` |
| `safetyos:{t}:{s}:agent:{case_id}` | Agent case narration | `agent.decision.v1` |
| `safetyos:{t}:{s}:shift` | Shift handover events | `shift.handover.v1` |

### 8.4 Reconnect Protocol

1. Client detects disconnect (WebSocket `close` event or heartbeat timeout at 45 s).
2. Client waits: `min(1s × 2^attempt, 30s) + random_jitter(0, 0.2 × delay)`.
3. Client reconnects with `resume_token` from the last received `hello` or every 100th `event`.
4. Server replays missed events from Redis pub/sub buffer (last 5 min, max 10,000 messages per channel).
5. If `resume_token` is expired (> 5 min), server sends `{"type":"resumed","gap":true}` and client should full-refresh.

### 8.5 Backpressure & Priority

| Priority | Drop Policy | Delivery Guarantee |
|---|---|---|
| `life-safety` | Never dropped | At-least-once; also dispatched via Notification Router |
| `critical` | Never dropped within 60 s | At-least-once; requires `ack` from client |
| `normal` | Drop oldest when queue > 1,000 per connection | Best-effort |
| `low` | Drop oldest when queue > 200 per connection | Best-effort |

---

## 9. Event APIs (Kafka)

### 9.1 Canonical Topic Catalog

Per **WFP-002**, all topics are prefixed with `safetyos.` and use `<domain>.<event-type>.v<n>` naming. Every event carries the `EventEnvelope` (§7.2).

| Topic | Producer | Consumers | Partitions | Key | Retention | Compaction |
|---|---|---|---|---|---|---|
| `safetyos.cv.event.v2` | cv-inference-gateway | Compound Risk, KG, Digital Twin, Audit | 128 | `camera_id` | 7 d | delete |
| `safetyos.cv.violation.v2` | cv-inference-gateway | Incident, PTW, Console BFF, Notification | 64 | `site_id` | 30 d | delete |
| `safetyos.ot.telemetry.v1` | ot-ingestion-bridge | KG, PHM, Compound Risk, Lakehouse | 256 | `tag_id` | 3 d | delete |
| `safetyos.ot.alarm.v1` | ot-alarm-adapter | Alarm Rationalization, Console BFF, Notification | 64 | `plant_id` | 30 d | delete |
| `safetyos.kg.entity.upsert.v1` | kg-service | Digital Twin, RAG Indexer, Search | 32 | `entity_id` | ∞ | compact |
| `safetyos.risk.compound.v2` | compound-risk-engine | Incident, ER, Console BFF, Notification, Multi-Agent | 32 | `site_id` | 90 d | delete |
| `safetyos.permit.state.v1` | ptw-service | LOTO, Incident, Console BFF, Notification, Lakehouse | 16 | `permit_id` | ∞ | compact |
| `safetyos.loto.state.v1` | loto-service | PTW, Incident, Console BFF, Notification, Lakehouse | 16 | `loto_id` | ∞ | compact |
| `safetyos.incident.state.v1` | incident-service | ER, Notification, Compliance, Insurer Bus, Lakehouse | 16 | `incident_id` | ∞ | compact |
| `safetyos.er.event.v1` | emergency-response-orchestrator | Console BFF, Mobile BFF, Notification | 8 | `site_id` | ∞ | compact |
| `safetyos.shift.handover.v1` | shift-handover-service | RAG Indexer, Lakehouse | 8 | `site_id` | ∞ | compact |
| `safetyos.agent.decision.v1` | multi-agent-orchestrator | Audit, Lakehouse, Human-in-Loop Broker | 16 | `case_id` | 365 d | delete |
| `safetyos.notification.dispatch.v1` | notification-router | Audit, Lakehouse | 32 | `recipient_id` | 30 d | delete |
| `safetyos.audit.events` | ALL services | Audit Sink → S3 Object Lock, SIEM | 64 | `tenant_id` | 7 d hot, ∞ WORM | delete |
| `safetyos.contractor.state.v1` | contractor-service | PTW, Access, Console BFF, Lakehouse | 8 | `contractor_id` | ∞ | compact |
| `safetyos.compliance.finding.v1` | compliance-service | Notification, Console BFF, Lakehouse | 8 | `finding_id` | ∞ | compact |
| `safetyos.model.lifecycle.v1` | mlops-control-plane | Edge Distribution, Audit, Lakehouse | 4 | `model_id` | ∞ | compact |
| `safetyos.iot.wearable.v1` | iot-wearable-bridge | Compound Risk, ER, Lone-Worker Watcher | 64 | `wearable_id` | 7 d | delete |
| `safetyos.dlp.event.v1` | data-governance-service | SIEM, Audit, Compliance | 8 | `tenant_id` | 90 d | delete |
| `safetyos.workflow.command.v1` | workflow-engine | Any service (command routing) | 32 | `workflow_id` | 7 d | delete |
| `safetyos.phm.prediction.v1` | phm-service | CMMS integration, Compound Risk | 16 | `equipment_id` | 90 d | delete |
| `safetyos.integration.inbound.v1` | integration-hub | KG, relevant services | 16 | `source_system` | 30 d | delete |
| `safetyos.identity.roles.v1` | identity-service | Mesh sidecars | 8 | `user_id` | 7 d | compact |
| `safetyos.kg.match_candidates.v1` | entity-resolution-service | KG stewardship UI | 4 | `entity_id` | 30 d | delete |

### 9.2 Schema Registry & Compatibility

- **Registry:** Confluent Schema Registry (Avro primary, JSON Schema fallback).
- **Compatibility mode:** `FULL_TRANSITIVE` — both forward and backward compatible.
- **Breaking change protocol:** `.v(n+1)` topic + dual-write from producer for 30 d → consumer migration → old topic retired after 90 d.
- **Schema evolution rules:** fields may be added (with defaults); fields may NOT be removed or renamed; type changes prohibited.
- **Data contracts (DP-011):** every topic has a registered contract in `data-contract-registry`; CI blocks unregistered events.

### 9.3 Consumer Group Conventions

```
safetyos.{consumer_service}.{topic_shortname}
```

Example: `safetyos.compound-risk-engine.cv-event-v2`

### 9.4 Dead-Letter Queues

Every consumer has a per-topic DLQ: `{original_topic}.dlq`. Retention 30 d. Redrive job runs every 5 min with per-message diagnostics.

### 9.5 Webhook Event Delivery

For external consumers that cannot consume Kafka directly:

| Webhook Event | Triggered By | HMAC Signature |
|---|---|---|
| `compound_risk.opened` | `safetyos.risk.compound.v2` | HMAC-SHA256 with tenant secret |
| `permit.suspended` | `safetyos.permit.state.v1` | HMAC-SHA256 |
| `incident.confirmed` | `safetyos.incident.state.v1` | HMAC-SHA256 |
| `evac.initiated` | `safetyos.er.event.v1` | HMAC-SHA256 |
| `model.deployed` | `safetyos.model.lifecycle.v1` | HMAC-SHA256 |
| `compliance.finding` | `safetyos.compliance.finding.v1` | HMAC-SHA256 |

Retry policy: exponential backoff 1 min → 30 d; delivery receipt tracking; replay UI in `devx-service`.

---

## 10. API Ownership Matrix

| API Surface | Owner Service | Auth Method | Primary Database | SLO Tier |
|---|---|---|---|---|
| `/cv/v1/*` | cv-inference-gateway | mTLS (edge), JWT (human) | PostgreSQL + Redis + ClickHouse | Tier 1 (99.95%) |
| `/edge/v1/*` | edge-gateway-orchestrator | mTLS (device), JWT (admin) | PostgreSQL + S3 + Redis | Tier 2 (99.9%) |
| `/pii/v1/*` | pii-blur-service | mTLS, JWT | Redis (ephemeral) | Tier 2 (99.9%) |
| `/ot/v1/*` | ot-ingestion-bridge | SPIFFE, Vault dynamic | PostgreSQL + TimescaleDB + Redis | Tier 0 (99.99%) |
| `/iot/v1/*` | iot-wearable-bridge | mTLS, MQTT | Cassandra + Redis | Tier 2 (99.9%) |
| `/kg/v1/*` | kg-service | SPIFFE, JWT | Neo4j + PostgreSQL + OpenSearch + Redis | Tier 1 (99.95%) |
| `/twin/v1/*` | digital-twin-service | JWT | PostGIS + S3 + Redis | Tier 2 (99.9%) |
| `/risk/v1/*` | compound-risk-engine | SPIFFE, JWT | Flink (RocksDB) + PostgreSQL + Redis | Tier 1 (99.95%) |
| `/agents/v1/*` | multi-agent-orchestrator | JWT, SPIFFE | Temporal + PostgreSQL + Qdrant | Tier 2 (99.9%) |
| `/rag/v1/*` | rag-service | JWT | OpenSearch + Qdrant + PostgreSQL + Redis | Tier 2 (99.9%) |
| `/phm/v1/*` | phm-service | SPIFFE | Feature Store + PostgreSQL | Tier 2 (99.9%) |
| `/ptw/v1/*` | ptw-service | JWT (WebAuthn step-up) | PostgreSQL + Temporal + S3 + Redis | Tier 1 (99.95%) |
| `/loto/v1/*` | loto-service | JWT (WebAuthn step-up) | PostgreSQL + Temporal + Redis | Tier 1 (99.95%) |
| `/shift/v1/*` | shift-handover-service | JWT | PostgreSQL + S3 | Tier 2 (99.9%) |
| `/inc/v1/*` | incident-service | JWT | PostgreSQL + S3 (WORM) + Temporal + Neo4j | Tier 1 (99.95%) |
| `/er/v1/*` | emergency-response-orchestrator | JWT | PostgreSQL + Temporal + Redis | Tier 0 (99.99%) |
| `/console/v1/*` | console-bff-service | JWT | PostgreSQL + Redis | Tier 1 (99.95%) |
| `/mobile/v1/*` | mobile-bff-service | JWT + biometric | PostgreSQL + S3 + Redis | Tier 2 (99.9%) |
| `/alarms/v1/*` | alarm-rationalization-service | JWT | PostgreSQL + ClickHouse + Redis | Tier 1 (99.95%) |
| `/comp/v1/*` | compliance-service | JWT | PostgreSQL + S3 (WORM) | Tier 1 (99.95%) |
| `/con/v1/*` | contractor-service | JWT | PostgreSQL + S3 | Tier 2 (99.9%) |
| `/notify/v1/*` | notification-router | SPIFFE, JWT | PostgreSQL + Redis | Tier 0/1 (99.95–99.99%) |
| `/identity/v1/*` | identity-service | — (bootstrap) | PostgreSQL + Vault | Tier 0 (99.99%) |
| `/policy/v1/*` | policy-engine | SPIFFE | PostgreSQL + S3 + Redis | Tier 0 (99.99%) |
| `/governance/v1/*` | data-governance-service | JWT | PostgreSQL | Tier 2 (99.9%) |
| `/audit/v1/*` | audit-sink-service | JWT | S3 Object Lock + OpenSearch | Tier 0 (99.99%) |
| `/workflow/v1/*` | workflow-engine | SPIFFE, JWT | Cassandra + Elasticsearch | Tier 0 (99.99%) |
| `/rules/v1/*` | rule-engine-service | SPIFFE | PostgreSQL + Redis | Tier 2 (99.9%) |
| `/flags/v1/*` | feature-flag-service | SPIFFE | PostgreSQL + Redis | Tier 0 (99.99%) |
| `/platform/v1/*` | tenant-service | JWT | PostgreSQL | Tier 1 (99.95%) |
| `/integrations/v1/*` | integration-hub | OAuth 2.0 client-creds | PostgreSQL + Redis | Tier 2 (99.9%) |
| `/devx/v1/*` | devx-service | JWT | PostgreSQL | Tier 2 (99.9%) |
| `/data/v1/*` | lakehouse-service | JWT, SPIFFE | S3 (Delta Lake) + Trino | Tier 3 (99.5%) |
| `/mlops/v1/*` | mlops-control-plane | JWT | MLflow + PostgreSQL + S3 | Tier 2 (99.9%) |
| `/features/v1/*` | feature-store-service | SPIFFE | Redis + Delta Lake | Tier 1 (99.95%) |
| `/obs/v1/*` | observability-platform-service | JWT | Prometheus + Loki + Tempo | Tier 0 (99.99%) |
| `/search/v1/*` | search-service | JWT | OpenSearch | Tier 2 (99.9%) |
| `/reports/v1/*` | report-service | JWT | Lakehouse Gold + PostgreSQL | Tier 3 (99.5%) |
| `/esign/v1/*` | esign-service | JWT (WebAuthn) | PostgreSQL + S3 (WORM) | Tier 1 (99.95%) |
| `/hitl/v1/*` | human-in-loop-broker | JWT | PostgreSQL + Redis | Tier 1 (99.95%) |

---

## 11. SDK Strategy

### 11.1 Frontend SDK (`@safetyos/console-sdk`)

| Concern | Choice |
|---|---|
| Language | TypeScript |
| Distribution | npm (`@safetyos/console-sdk`) |
| Transport | REST + WebSocket + GraphQL (via Apollo Client) |
| Auth | OIDC PKCE flow; token auto-refresh; WebAuthn step-up helper |
| Offline | IndexedDB + CRDT merge for draft permits/incidents |
| Real-time | WebSocket client with auto-reconnect, resume-token, and backpressure |
| Streaming | SSE client for RAG chat with token-by-token rendering |
| Code generation | Auto-generated from OpenAPI 3.1 via `openapi-typescript` + custom codegen |
| Versioning | Semantic; major tracks API major version |
| Size | Tree-shakeable; core < 50 KB gzipped |

### 11.2 Mobile SDK (`@safetyos/mobile-sdk`)

| Concern | Choice |
|---|---|
| Language | TypeScript (React Native) + Swift / Kotlin native modules |
| Distribution | npm + CocoaPods + Maven Central |
| Transport | REST (delta-sync) + Push (FCM/APNs) |
| Auth | OIDC + biometric device unlock; offline grace 8 h |
| Offline | SQLite + Automerge CRDT; full field workflows offline |
| Sync | Background delta-sync with resumable cursors |
| Voice | On-device Whisper.cpp; fallback cloud transcription |
| NFC/BLE | Native modules for wearable check-in, LOTO tag scan, muster QR |
| Location | Mapbox GL Native with offline plant tiles |
| Size | < 15 MB impact on app bundle |

### 11.3 Backend SDK (`safetyos-sdk`)

| Concern | Choice |
|---|---|
| Languages | Go, Python, Java/Kotlin, Node.js |
| Distribution | Go module, PyPI, Maven Central, npm |
| Transport | gRPC (primary) + REST (fallback) |
| Auth | SPIFFE SVID (auto from SPIRE Agent); OAuth 2.0 client-credentials; API key HMAC |
| Code generation | Generated from `/proto` monorepo via `buf generate`; REST clients from OpenAPI via `openapi-generator` |
| Features | Automatic retry with backoff + jitter; circuit breaker; idempotency-key injection; correlation-ID propagation; OpenTelemetry trace-context propagation; paginator helpers |
| Versioning | Module version tracks API major; minor for SDK features |
| Temporal SDK | Go + Python Temporal workers with SafetyOS activity wrappers |

### 11.4 SDK Release Cadence

- SDKs are released within 48 h of any API change.
- Breaking API changes (major version bump) → new SDK major version + migration guide.
- SDK changelog auto-generated from OpenAPI diff.

---

## 12. API Lifecycle

### 12.1 Versioning Policy

| Dimension | Rule |
|---|---|
| Major version | URI path (`/v1/`, `/v2/`); only on breaking changes |
| Minor version | Additive (new fields, endpoints); no client impact |
| Patch version | Bug fixes, documentation |
| Date pin | `X-SafetyOS-Api-Version: YYYY-MM-DD` for intra-major compatibility |
| Kafka topics | Version in topic name (`safetyos.cv.event.v2`); new version = new topic |
| gRPC | Version in package name (`.v1`, `.v2`); additive within major |

### 12.2 Deprecation Protocol

1. **Announcement (T-0):** `Deprecation: true` + `Sunset: {date}` + `Link: <new-url>; rel="successor"` headers emitted on every response. Release note published. Webhook `api.deprecated` sent to all registered developers.
2. **Warning period (T-0 to T-sunset):** deprecated endpoint continues to function. `X-SafetyOS-Deprecated: true` header added. SDK emits console warning.
3. **Sunset (T-sunset):** endpoint returns `301 Moved Permanently` → successor URL (for 30 d).
4. **Retirement (T-sunset + 30 d):** endpoint returns `410 Gone`.

| API Class | Minimum Deprecation Window |
|---|---|
| Standard APIs | 12 months |
| Regulated APIs (PTW, LOTO, INC, COMP, ER, AUDIT) | 24 months |
| Webhook events | 12 months |
| Kafka topics | 12 months (with dual-write bridge) |
| gRPC services | 12 months |

### 12.3 Migration Support

- **Migration guides:** published to `docs.safetyos.io/migrations/{from-version}-to-{to-version}`.
- **Dual-version period:** both old and new versions run simultaneously; traffic-splitting via Kong route weights.
- **Automated migration tool:** `safetyos-api-migrate` CLI scans client code for deprecated endpoint usage and suggests replacements.
- **Canary consumers:** for Kafka topic migrations, canary consumer group reads from both old + new topics during the dual-write window.

### 12.4 Backward Compatibility Rules

| Change Type | Allowed? | Notes |
|---|---|---|
| Add optional request field | ✅ | Must have default |
| Add response field | ✅ | Clients MUST ignore unknown fields |
| Add new endpoint | ✅ | — |
| Add new enum value | ✅ | Clients MUST handle unknown enum values |
| Remove or rename field | ❌ | Breaking; requires major version |
| Change field type | ❌ | Breaking |
| Remove endpoint | ❌ | Must deprecate first |
| Change status code semantics | ❌ | Breaking |
| Change error code string | ❌ | Breaking (machine-stable) |
| Change authentication requirement | ❌ | Breaking |
| Tighten validation | ⚠️ | Must be announced; not considered breaking if previously documented as invalid |

---

## 13. Testing

### 13.1 Contract Testing

Every API boundary is contract-tested using **Pact** (consumer-driven) for REST and **Buf breaking** for gRPC.

| Layer | Tool | Trigger | Blocking |
|---|---|---|---|
| REST consumer → provider | Pact Broker | Every PR affecting API contracts | Yes — merge-blocking |
| gRPC schema compatibility | `buf breaking` against `main` | Every PR touching `/proto` | Yes — merge-blocking |
| Kafka event schema | Confluent Schema Registry compatibility check | Every PR touching Avro schemas | Yes — merge-blocking |
| GraphQL subgraph composition | Apollo Rover `supergraph compose` | Every PR touching subgraph SDL | Yes — merge-blocking |

**Pact workflow:**
1. Consumer generates a Pact contract (expectations of the provider).
2. Contract published to Pact Broker.
3. Provider CI runs `pact:verify` against all registered consumer contracts.
4. Both sides must pass for merge.

### 13.2 Schema Validation

| Artifact | Validator | Schedule |
|---|---|---|
| OpenAPI 3.1 specs | `spectral lint` + custom SafetyOS ruleset | Every PR + nightly |
| Protobuf definitions | `buf lint` | Every PR |
| Avro schemas | Confluent Schema Registry `compatibility` check | Every PR |
| JSON Schema (request/response) | AJV (compile-time) + Kong plugin (runtime) | Runtime |
| RFC 7807 error responses | Custom test harness validates every 4xx/5xx against `ProblemDetail` schema | Nightly integration test |

**SafetyOS Spectral ruleset (`spectral.yaml`):**

```yaml
extends: spectral:oas
rules:
  safetyos-correlation-id:
    description: "All responses must include X-Correlation-Id header"
    given: "$.paths.*.*.responses.*"
    then:
      field: headers.X-Correlation-Id
      function: truthy
  safetyos-error-rfc7807:
    description: "4xx/5xx responses must use application/problem+json"
    given: "$.paths.*.*.responses[?(@property >= '400')]"
    then:
      field: content.application/problem+json
      function: truthy
  safetyos-pagination:
    description: "Collection endpoints must support cursor pagination"
    given: "$.paths.*.get.parameters[?(@.name == 'page_token')]"
    then:
      function: truthy
  safetyos-idempotency:
    description: "Regulated POST endpoints must require Idempotency-Key"
    severity: warn
```

### 13.3 Backward Compatibility Testing

- **API diff:** `oasdiff breaking` runs on every PR; any breaking change blocks merge unless a major version bump is approved.
- **Canary verification:** after deployment, synthetic API clients (representing the previous SDK version) exercise every endpoint; failures trigger automatic rollback (Argo Rollouts SLO-based).
- **gRPC wire compatibility:** `buf breaking --against .git#branch=main` ensures no wire-incompatible changes.
- **Kafka schema forward/backward:** Schema Registry `FULL_TRANSITIVE` mode blocks incompatible schema evolution.

### 13.4 Mock APIs

Every service publishes a mock server for consumer development and testing.

| Tool | Use Case | Distribution |
|---|---|---|
| **Prism** (OpenAPI mock) | REST mock server from OpenAPI specs | Docker image `safetyos/{service}-mock:{version}` |
| **gRPC mock** (buf curl + WireMock gRPC) | gRPC mock with recorded interactions | Docker image |
| **Pact Stub Server** | Consumer-driven mock from Pact contracts | Pact Broker → stub |
| **Kafka mock** (Testcontainers + embedded) | Kafka producer/consumer test harness | Library (`@safetyos/kafka-test-kit`) |
| **Sandbox tenant** | Full-stack sandbox environment with synthetic data | `POST /devx/v1/sandbox` |

**Mock server guarantees:**
- Schema-faithful responses (generated from OpenAPI examples + Faker).
- Deterministic: same request → same response (for snapshot testing).
- Stateful mode available: mock tracks state across requests (e.g., permit lifecycle).
- Published alongside every API version; auto-updated in CI.

### 13.5 Integration Test Matrix

| Test Scope | Tool | Frequency | Environment |
|---|---|---|---|
| Unit (per service) | Go: `testing` / Kotlin: JUnit5 / Python: pytest | Every commit | CI |
| Contract (cross-service) | Pact + buf breaking | Every PR | CI |
| Integration (end-to-end flows) | Playwright (API) + custom harness | Nightly + pre-release | Staging |
| Load / Performance | k6 + Grafana k6 Cloud | Weekly + pre-release | Staging |
| Chaos | Litmus + GameDay (OBS-007) | Monthly | Staging + Prod (controlled) |
| Security (DAST) | OWASP ZAP + Nuclei | Nightly | Staging |
| Compliance (API audit) | Custom harness verifying WORM, retention, blur, ACL | Nightly | Staging |

### 13.6 CI/CD Pipeline for API Changes

```
Developer PR
  │
  ├─ buf lint + buf breaking (proto)
  ├─ spectral lint (OpenAPI)
  ├─ oasdiff breaking (OpenAPI diff)
  ├─ avro compatibility check (Schema Registry)
  ├─ pact:verify (consumer contracts)
  ├─ unit tests (≥ 90% coverage)
  ├─ mock server generation
  │
  ▼ merge
  │
  ├─ SDK generation (openapi-typescript, buf generate)
  ├─ SDK publish (npm, PyPI, Maven)
  ├─ Mock image publish
  ├─ OpenAPI spec commit to api-specs repo
  │
  ▼ deploy (canary)
  │
  ├─ synthetic client smoke tests (previous SDK version)
  ├─ SLO-based canary validation (Argo Rollouts)
  ├─ Pact can-i-deploy check
  │
  ▼ promote to production
```

---

**END OF API SPECIFICATION v1.0**
