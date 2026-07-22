# Backend Service Specification — SafetyOS

**Document Version:** 1.0
**Status:** Canonical Backend Service Reference — Engineering Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0 + User Flow Specification v1.0
**Owners:** Principal Systems Architect, Staff Backend Engineer, Cloud Architect, SRE Lead
**Classification:** Confidential — Engineering Blueprint
**Last Reviewed:** 2026-07-21

---

## 0. How to Read This Document

This Backend Service Specification is the canonical decomposition of SafetyOS into deployable microservices. Every service maps directly to one or more Feature IDs from the Master Feature Specifications v1.0 + vNext (CV-, OT-, KG-, CR-, PTW-, LOTO-, SH-, INC-, ER-, DT-, RAG-, AG-, PRED-, AL-, UI-, MOB-, CON-, COMP-, IOT-, SEC-, INT-, PLT-, DP-, WFP-, OBS-, ML-, NOT-, ADM-, EXT-).

For each service the specification defines:

1. **Service Identity** — name, prefix, ownership, feature IDs owned
2. **Responsibilities** — what it does and (equally important) what it does NOT do
3. **APIs** — synchronous REST/gRPC surface (public + internal)
4. **Events / Kafka Topics** — asynchronous contracts produced and consumed
5. **Databases** — primary + secondary stores, retention, partitioning
6. **Dependencies** — upstream services required to boot / operate
7. **Scaling** — horizontal model, sharding key, expected load
8. **Retry Policies** — client-side retries, backoff, budgets
9. **Circuit Breakers** — thresholds, half-open probing, fallback
10. **Authentication** — how the service verifies the caller
11. **Authorization** — how the service enforces policy (OPA)
12. **Observability** — RED/USE metrics, traces, structured logs, SLOs
13. **Caching** — read-through, write-through, TTLs, invalidation
14. **Rate Limiting** — per-tenant, per-user, per-API-key envelopes
15. **Deployment** — runtime, region topology, HA posture
16. **Failure Recovery** — RTO/RPO, replay, DLQ policy, graceful degradation

The service inventory is **48 microservices**, grouped into 10 planes:

- **Plane A — Edge & Perception** (CV inference gateway, edge orchestrator)
- **Plane B — OT/IoT Ingestion** (SCADA, OPC-UA, historians, IoT bridge)
- **Plane C — Semantic Fusion** (Knowledge Graph, Digital Twin, Entity Resolution)
- **Plane D — Risk & AI Reasoning** (Compound Risk, Multi-Agent, RAG, PHM)
- **Plane E — Safety Workflows** (PTW, LOTO, Shift Handover, Incident, ER)
- **Plane F — Command & Control** (HMI/Console BFF, Mobile BFF, Alarm Rationalization)
- **Plane G — Compliance, Contractor, Notifications** (COMP, CON, NOT)
- **Plane H — Security & Governance** (Zero-Trust, PII, Audit, DLP)
- **Plane I — Platform Substrate** (Workflow, Rule/Policy, Feature Flags, Multi-Tenant, DevX)
- **Plane J — Data Platform & Observability** (Lakehouse, MLOps, Feature Store, SRE)

---

## 1. Cross-Cutting Standards (Applies to ALL Services)

Before individual service specifications, the following conventions apply universally. They are declared once here and referenced by each service.

### 1.1 Runtime & Framework Baseline

| Concern | Standard |
|---|---|
| Language (control plane) | Go 1.22+ or Kotlin (JVM 21) — service authors pick one, no polyglot within a service |
| Language (AI / ML) | Python 3.12 with FastAPI + Pydantic v2 |
| Language (edge inference) | C++20 / Rust for hot path, Python for orchestration |
| RPC | gRPC for internal (protobuf schemas in `/proto` monorepo), REST/OpenAPI 3.1 for external |
| Async runtime | Kafka 3.7 (MSK / Confluent Cloud) with Schema Registry (Avro + JSON Schema) |
| Workflow engine | Temporal 1.24 (see WFP-001, MODULE 26) |
| Policy engine | OPA 0.63 + Rego bundles served by Bundle Server (see WFP-003) |
| Container runtime | Docker OCI + Kubernetes 1.29+ (EKS / GKE / on-prem RKE2) |
| Service mesh | Istio 1.22 with mTLS enforced, Envoy sidecar for east-west |
| API gateway | Kong Gateway 3.7 (public), internal is mesh-native |
| Secrets | HashiCorp Vault 1.16 with dynamic DB creds + PKI |
| Config | ConfigMaps + Vault Agent Injector; feature flags via LaunchDarkly-compatible OSS (Flagsmith) |

### 1.2 Authentication (all services, no exceptions)

- **User callers**: OIDC (Keycloak or Okta) → PKCE flow → short-lived (10 min) JWT access token, 24 h refresh, signed with RS256 rotated every 90 days.
- **Service-to-service**: SPIFFE / SPIRE workload identity → mTLS certificates auto-rotated every 24 h, no long-lived shared secrets.
- **Edge devices (cameras, gateways)**: X.509 device certificates provisioned via SCEP, mTLS to `edge-gateway` service, signed edge bundles (CV-026).
- **External integrations (ERP, CMMS, insurer bus)**: OAuth 2.0 client-credentials with mTLS-bound access tokens (RFC 8705).
- **API keys** (batch/ETL only): scoped, per-tenant, HMAC-signed, rotated every 60 days.

Every service MUST reject any request lacking a validated caller identity, propagate the identity via the `x-safetyos-principal` header (JWT re-signed by the mesh) and log the principal on every audit event.

### 1.3 Authorization (all services, no exceptions)

- All authorization decisions delegate to **Policy Engine Service** (see §26, WFP-003).
- Every request evaluates a Rego rule of the form `decision = data.safetyos.<module>.<action>` with input `{principal, resource, tenant, context}`.
- **Break-glass**: `SEC-004` emergency access requires dual-approval + immutable audit + 15-min TTL, enforced by policy engine — never bypassed by service code.
- **ABAC over RBAC**: attributes include `role`, `site_id`, `contractor_org`, `zone`, `shift`, `permit_scope`, `data_classification`.
- Row-level security enforced in the database layer via PostgreSQL RLS + tenant_id predicate injection.

### 1.4 Observability (all services, no exceptions — see MODULE 27)

- **Metrics**: Prometheus exposition on `/metrics`, RED (Rate/Error/Duration) on every endpoint, USE (Utilization/Saturation/Errors) on every dependency. Federated to Mimir.
- **Traces**: OpenTelemetry SDK, W3C traceparent propagated across Kafka via headers, 100% sampling on error paths, 5% head-based on healthy paths, 100% for regulated flows (PTW, LOTO, INC).
- **Logs**: JSON structured (ECS schema), shipped via Vector → Loki. Every log line MUST include `trace_id`, `span_id`, `tenant_id`, `principal`, `request_id`.
- **SLOs** (per OBS-006): every service declares availability (99.9% default, 99.95% for regulated services, 99.99% for ER) and latency (p99) SLOs; error budgets tracked in Grafana + Nobl9.
- **Audit trail**: every state-changing call emits an `audit.event.v1` to Kafka topic `safetyos.audit.events` — WORM-stored in S3 Object Lock (COMP-018).

### 1.5 Retry, Circuit Breaker, Rate Limiting (defaults)

Unless a service overrides:

- **Retries** (client-side, via mesh + SDK): exponential backoff `100ms → 5s`, jitter 20%, max 3 attempts, respects `Retry-After`, budget capped at 10% of total call volume per 60s.
- **Circuit breakers** (Envoy outlier detection): 5 consecutive 5xx OR 50% error rate over 30s → open for 30s, half-open probes 1 req/s until 3 consecutive successes → close.
- **Bulkheads**: connection pools per downstream (max 100 conn / 500 pending), one downstream's saturation cannot starve another.
- **Rate limits** (Kong + per-service enforcement): default 1000 req/min per tenant, 100 req/min per user, 10 req/s per API key. Ingest paths have separate envelopes (see specific services).
- **Idempotency**: all POST / PUT accept `Idempotency-Key` header, dedupe window 24 h via Redis.

### 1.6 Deployment & HA Baseline

- **Multi-AZ**: minimum 3 AZs per region, anti-affinity across nodes.
- **Multi-region**: active-active for stateless, active-passive for stateful (RPO ≤ 5 min, RTO ≤ 15 min for Tier-1 services).
- **Blue/green + canary**: Argo Rollouts, 5% → 25% → 50% → 100% with automated SLO-based rollback (OBS-011).
- **Namespaces**: one per module plane (`plane-a-edge`, `plane-e-workflows`, …). Multi-tenant isolation via tenant-scoped RBAC in-cluster, and physical isolation for Tier-1 customers (PLT-001).
- **GitOps**: ArgoCD, all manifests in `platform-manifests` repo, drift-detection alerts.

### 1.7 Failure Recovery Baseline

- **DLQ**: every consumer has a per-topic DLQ (`.dlq` suffix), retention 30 d, redrive job runs every 5 min with per-message diagnostics.
- **Idempotent consumers**: exactly-once semantics via `event_id + consumer_group` dedupe table (Redis 24 h, Postgres for regulated topics).
- **Backfill**: every event topic has a bounded 30-day retention on the hot cluster + infinite retention in the lakehouse Bronze layer (DP-002); replay tool (WFP-011) can rehydrate consumers.
- **Graceful degradation**: every service declares its **degraded mode** (e.g. CV inference degrades to on-camera analytics only when semantic fusion is down).

---

## 2. Canonical Kafka Topic Catalog

Per **WFP-002**, a single canonical event bus replaces per-module ad-hoc topics. All topics are prefixed with `safetyos.` and use `<domain>.<event-type>.v<n>` naming. Every event carries the standard envelope:

```protobuf
message EventEnvelope {
  string event_id       = 1;   // ULID
  string event_type     = 2;   // e.g. cv.event.v2
  string tenant_id      = 3;
  string trace_id       = 4;
  string span_id        = 5;
  google.protobuf.Timestamp occurred_at = 6;
  google.protobuf.Timestamp ingested_at = 7;
  string producer       = 8;   // service name + version
  string schema_version = 9;
  string idempotency_key = 10;
  bytes  payload        = 11;  // Avro/Proto encoded
  map<string, string> attributes = 12;  // routing + policy hints
}
```

| Topic | Producer | Consumers | Partitions | Retention | Compaction |
|---|---|---|---|---|---|
| `safetyos.cv.event.v2` | CV Inference Gateway | Compound Risk, KG, Digital Twin, Audit | 128 (key: `camera_id`) | 7 d | delete |
| `safetyos.cv.violation.v2` | CV Inference Gateway | Incident, PTW, Console BFF, Notification | 64 (key: `site_id`) | 30 d | delete |
| `safetyos.ot.telemetry.v1` | OT Ingestion Bridge | KG, PHM, Compound Risk, Lakehouse | 256 (key: `tag_id`) | 3 d | delete |
| `safetyos.ot.alarm.v1` | OT Alarm Adapter | Alarm Rationalization, Console BFF, Notification | 64 (key: `plant_id`) | 30 d | delete |
| `safetyos.kg.entity.upsert.v1` | KG Service | Digital Twin, RAG Indexer, Search | 32 (key: `entity_id`) | ∞ | compact |
| `safetyos.risk.compound.v2` | Compound Risk Engine | Incident, ER, Console BFF, Notification, Multi-Agent | 32 (key: `site_id`) | 90 d | delete |
| `safetyos.permit.state.v1` | PTW Service | LOTO, Incident, Console BFF, Notification, Lakehouse | 16 (key: `permit_id`) | ∞ | compact |
| `safetyos.loto.state.v1` | LOTO Service | PTW, Incident, Console BFF, Notification, Lakehouse | 16 (key: `loto_id`) | ∞ | compact |
| `safetyos.incident.state.v1` | Incident Service | ER, Notification, Compliance, Insurer Bus, Lakehouse | 16 (key: `incident_id`) | ∞ | compact |
| `safetyos.er.event.v1` | Emergency Response Orchestrator | Console BFF, Mobile BFF, Notification | 8 (key: `site_id`) | ∞ | compact |
| `safetyos.shift.handover.v1` | Shift Handover Service | RAG Indexer, Lakehouse | 8 (key: `site_id`) | ∞ | compact |
| `safetyos.agent.decision.v1` | Multi-Agent Orchestrator | Audit, Lakehouse, Human-in-Loop Broker | 16 (key: `case_id`) | 365 d | delete |
| `safetyos.notification.dispatch.v1` | Notification Router | Audit, Lakehouse | 32 (key: `recipient_id`) | 30 d | delete |
| `safetyos.audit.events` | ALL services | Audit Sink → S3 Object Lock, SIEM | 64 (key: `tenant_id`) | 7 d hot, ∞ WORM | delete |
| `safetyos.contractor.state.v1` | Contractor Service | PTW, Access, Console BFF, Lakehouse | 8 (key: `contractor_id`) | ∞ | compact |
| `safetyos.compliance.finding.v1` | Compliance Service | Notification, Console BFF, Lakehouse | 8 (key: `finding_id`) | ∞ | compact |
| `safetyos.model.lifecycle.v1` | MLOps Control Plane | Edge Distribution, Audit, Lakehouse | 4 (key: `model_id`) | ∞ | compact |
| `safetyos.iot.wearable.v1` | Wearable IoT Bridge | Compound Risk, ER, Lone-Worker Watcher | 64 (key: `wearable_id`) | 7 d | delete |
| `safetyos.dlp.event.v1` | DLP / PII Service | SIEM, Audit, Compliance | 8 (key: `tenant_id`) | 90 d | delete |
| `safetyos.workflow.command.v1` | Workflow Engine | Any service (command routing) | 32 (key: `workflow_id`) | 7 d | delete |

All topics use **Avro with Schema Registry**, forward+backward compatibility mandatory, breaking changes require `.v(n+1)` topic + dual-write migration (documented in WFP-002).

---

## 3. Service Inventory (48 services)

The remainder of the document specifies every microservice. Services are grouped by plane.

---

# PLANE A — EDGE & PERCEPTION

## 3.1 `cv-inference-gateway` (Service #1)

Owns: CV-001 … CV-036 (Computer Vision & Edge Perception module, vNext).

### Responsibilities

- Terminates model inference requests from **edge cameras** and **edge gateways** at regional endpoints (fallback path when edge inference fails or when cloud enrichment is required).
- Fuses on-edge detections with server-side re-scoring (higher-precision models, ensemble, uncertainty quantification per AG-018).
- Publishes `cv.event.v2` and `cv.violation.v2` on the canonical bus.
- Enforces **PPE grace-period** logic (CV-035), **gas-detector fusion** with OT stream (CV-033), **camera cyber-hardening posture** monitoring (CV-036).
- Does NOT store raw video (that is `frame-retention-service`).
- Does NOT decide policy consequences — it only emits observations.

### APIs

Internal gRPC:

```proto
service CvInference {
  rpc SubmitFrame(FrameRequest) returns (InferenceResult);        // synchronous re-scoring
  rpc SubmitBatch(stream FrameRequest) returns (stream InferenceResult);
  rpc GetModelBinding(ModelBindingRequest) returns (ModelBinding); // which model for which camera
  rpc ReportEdgeHealth(EdgeHealthRequest) returns (Ack);
}
```

Public REST (via BFFs):

- `GET /cv/v1/cameras/{id}/latest` — most recent detections
- `POST /cv/v1/violations/{id}/acknowledge` — operator ack
- `GET /cv/v1/models/{model_id}/canary` — canary metrics (CV-025)

### Events

- **Produces**: `safetyos.cv.event.v2`, `safetyos.cv.violation.v2`, `safetyos.audit.events`
- **Consumes**: `safetyos.model.lifecycle.v1` (new model version → hot-swap binding), `safetyos.ot.telemetry.v1` (gas-detector fusion only — filtered subscription on `tag_type=gas_sensor`)

### Databases

- **PostgreSQL 16** (`cv_gateway`): camera registry, model bindings, calibration matrices (CV-024), grace-period state machine.
- **Redis 7** (cluster): 60-second detection cache per `camera_id`, dedupe of near-identical events.
- **ClickHouse** (via lakehouse export, DP-005): inference latency + confidence distributions for RED/USE.
- **S3 (WORM)**: signed edge model bundles (CV-026), 5-year retention.

### Dependencies

- `model-registry` (MLOps), `feature-store` (real-time features), `kg-service` (camera → zone → asset resolution), `policy-engine` (whether a detection is a policy violation), `ot-ingestion-bridge` (gas fusion), `pii-blur-service` (CV-021 edge companion).

### Scaling

- Horizontal, stateless replicas behind Envoy. Shard by `camera_id` mod N for cache locality (soft affinity via consistent hashing).
- Baseline: 30 pods per region, autoscale on `inference_qps` (HPA + KEDA on Kafka lag).
- Peak: 5,000 events/sec/region ingest, p99 gateway latency ≤ 250 ms.

### Retry Policies

- **From edge → gateway**: edge retries 3× with 200ms/1s/5s backoff; on total failure, edge falls back to CV-027 local store-and-forward (up to 24 h buffered) and emits `edge_store_forward_lag_seconds` metric.
- **Gateway → downstream (KG, Compound Risk)**: fire-and-forget via Kafka (no synchronous downstream on hot path).
- **Model registry**: 3× with 500ms base backoff; on failure, keep current model binding (never fall back to expired model).

### Circuit Breakers

- Downstream KG (only used for cold-start camera → zone lookup): open after 50% errors over 30s. Fallback: use cached binding, mark event `context_partial=true`.
- Downstream policy-engine (used for grace-period rules): open on p99 > 200 ms sustained 60s. Fallback: apply last-known-good policy bundle (locally cached, refreshed every 60s).

### Authentication

- Edge devices: X.509 mTLS (device cert issued by SafetyOS PKI, SCEP renewal every 30 d).
- Internal callers: SPIFFE mTLS.
- Human operators (ack endpoints): OIDC JWT.

### Authorization

- Rego policy `data.safetyos.cv.can_view_camera` — checks `principal.site_ids ⊇ camera.site_id` and `principal.zone_grants` for restricted areas (per SEC-007 zone-scoping).
- PII blur enforcement is **not optional** — Rego rule refuses to serve un-blurred frames unless principal has `pii.raw.read` scope + step-up MFA (SEC-002).

### Observability

- RED on `SubmitFrame`, `SubmitBatch`.
- USE on GPU pools (utilization, memory, thermal), separately per model.
- SLO: 99.95% availability, p99 latency ≤ 250 ms (server-side), edge-to-cloud e2e ≤ 2 s at p99 (OBS-003).
- Custom metrics: `cv_confidence_distribution`, `cv_grace_period_active_count`, `cv_model_canary_disagreement_rate`.

### Caching

- **Model binding cache**: Redis, TTL 300s, invalidated by `model.lifecycle.v1` event.
- **Camera → zone/asset cache**: Redis, TTL 600s, invalidated by `kg.entity.upsert.v1`.
- **Detection dedupe**: 5-second sliding window keyed by `hash(camera_id + class + bbox_bucket)`.

### Rate Limiting

- Per-camera: 30 fps hard ceiling (dropped frames counted).
- Per-tenant: 20,000 events/sec (headroom above expected peak).
- Ack endpoint: 100 req/min/user.

### Deployment

- GPU node pool (`g5.2xlarge` or A10G-equivalent), taints + tolerations.
- 3-region active-active (US-East, EU-West, APAC-SE), regional-affinity via GeoDNS.
- Namespace `plane-a-edge`, canary rollout via Argo Rollouts.

### Failure Recovery

- **Edge outage**: CV-027 store-and-forward buffers up to 24 h; on reconnect, replay throttled to 200 events/sec/camera.
- **Gateway outage**: edge fails back to on-device inference only; cloud violations paused, operators notified via `edge_disconnected_minutes` alert.
- **Cascade to Compound Risk down**: Kafka absorbs; no impact on ingest.
- RPO: 0 (edge buffer); RTO: 5 min (gateway restart), 15 min (region failover).

---

## 3.2 `edge-gateway-orchestrator` (Service #2)

Owns: CV-025, CV-026, CV-027, CV-036, and edge-side model lifecycle for OT-032 (edge OT sanitization).

### Responsibilities

- Manages **fleet-wide edge model distribution** (signed bundles), canary & shadow deployments (CV-025), and rollback (AG-020 kill-switch integration).
- Monitors **edge camera cyber-hardening posture** (CV-036): firmware version, open ports, cert expiry, tamper flags.
- Serves as the SCEP + PKI enrollment endpoint for edge devices.
- Publishes edge health to `safetyos.cv.event.v2` (health sub-events) and `safetyos.audit.events`.

### APIs

Internal gRPC:

```proto
service EdgeOrchestrator {
  rpc EnrollDevice(DeviceEnrollRequest) returns (DeviceCredentials);
  rpc DistributeBundle(BundleDistributionRequest) returns (DistributionPlan);
  rpc GetFleetStatus(FleetStatusRequest) returns (FleetStatus);
  rpc TriggerRollback(RollbackRequest) returns (RollbackReceipt);
}
```

Edge-facing REST (mTLS):

- `POST /edge/v1/checkin` — heartbeat + posture report
- `GET  /edge/v1/bundles/next` — next bundle for this device
- `POST /edge/v1/logs` — signed edge logs

### Events

- **Produces**: `safetyos.cv.event.v2` (edge health), `safetyos.audit.events`
- **Consumes**: `safetyos.model.lifecycle.v1`

### Databases

- **PostgreSQL 16**: device registry (200k+ devices at scale), bundle catalog, distribution plans.
- **S3**: signed bundle artifacts (Sigstore/Cosign signed), retention ∞.
- **Redis**: device online-status cache (heartbeat sliding window 60s).

### Dependencies

- Vault (PKI intermediate CA for device certs), `model-registry`, `policy-engine` (which device gets which model class per fleet-cohort rules).

### Scaling

- 15 pods baseline, autoscale on active-device count. Sharded per region.

### Retry Policies

- Distribution to a device: exponential backoff up to 6 h (edge may be offline), no hard failure.
- SCEP renewal: retry every 15 min for 24 h, then human alert.

### Circuit Breakers

- Vault PKI: open on >5% failure over 60s → block new enrollments, allow renewals from cached CA chain for up to 24 h.

### Authentication

- Devices: mTLS (bootstrap cert → operational cert).
- Internal: SPIFFE mTLS.
- Human operators: OIDC + WebAuthn (step-up for rollback / kill-switch).

### Authorization

- Rollback / kill-switch requires `edge.fleet.kill` scope + dual-approval workflow (via `workflow-engine`, WFP-004).

### Observability

- RED on gRPC surface.
- Custom: `edge_device_online_ratio`, `edge_bundle_rollout_progress`, `edge_cert_expiring_7d_count`, `edge_canary_error_delta`.
- SLO: 99.9% availability; bundle rollout completeness ≥ 99% within 24 h.

### Caching

- Bundle metadata cache (Redis, 300s), signed URL cache (60s).

### Rate Limiting

- Device check-in: 1 per 30s per device (edge-side jittered).
- Enrollment: 100/min per site.

### Deployment

- Regional, active-active; namespace `plane-a-edge`.

### Failure Recovery

- Bundle failure detected via canary disagreement → automatic rollback (AG-020) → audit event → SRE paged.
- RPO: 0 (state in Postgres, PITR 15 min); RTO: 15 min.

---

## 3.3 `pii-blur-service` (Service #3)

Owns: CV-021 (edge companion) and cloud-side re-blur for exported clips.

### Responsibilities

- Runs a hardened face/plate blur model on frames that must leave the edge (evidence clips for incidents, RCA video assembly).
- Serves as authorization gate for un-blurred access (double-key + step-up MFA + audit).

### APIs

- gRPC `Blur(BlurRequest) returns (BlurredFrame)`
- gRPC `RequestUnblur(UnblurRequest) returns (UnblurTicket)` — creates dual-approval workflow

### Events

- **Produces**: `safetyos.dlp.event.v1`, `safetyos.audit.events`

### Databases

- Ephemeral only. All processed frames streamed; state in Redis for ticket TTLs.

### Dependencies

- `policy-engine`, `workflow-engine` (dual approval), `frame-retention-service`.

### Scaling

- GPU-backed, 5 pods baseline, autoscale on request rate.

### Retry / CB / RL

- Standard defaults; hard ceiling: 100 req/s per tenant (cost control).

### Auth / Observability / Deployment

- mTLS, WebAuthn step-up for unblur, standard observability, regional deployment.

### Failure Recovery

- Blur failure = hard fail-closed. Unblurred frame is NEVER emitted. RPO/RTO: N/A (stateless).

---

# PLANE B — OT / IOT INGESTION

## 3.4 `ot-ingestion-bridge` (Service #4)

Owns: OT-001 … OT-022, INT-001 (OPC-UA), OT-032 (edge sanitization). Aliased in some docs as `ot-scada-gateway`.

### Responsibilities

- Ingests time-series telemetry from OPC-UA, Modbus/TCP, MQTT, historians (OSIsoft PI, AVEVA, GE Historian) via pluggable connectors.
- **Read-only by contract** — no write-back into control systems (safety boundary; SEC-014).
- Applies edge sanitization (schema validation, unit normalization, tag mapping to KG canonical IDs).
- Publishes to `safetyos.ot.telemetry.v1` at up to 1M samples/sec/region.

### APIs

- Admin REST: `POST /ot/v1/connectors`, `GET /ot/v1/tags`, `POST /ot/v1/tags/{id}/map`.
- Internal gRPC: `GetTagMetadata`, `SubscribeStream` (for real-time consumers that prefer gRPC over Kafka).

### Events

- **Produces**: `safetyos.ot.telemetry.v1`, `safetyos.ot.alarm.v1`
- **Consumes**: `safetyos.kg.entity.upsert.v1` (tag-to-asset re-binding)

### Databases

- **PostgreSQL 16**: connector configs, tag registry (~500k tags per large tenant), tag-to-KG mapping, credential refs (Vault handles).
- **TimescaleDB / InfluxDB** (short-term hot store): 72-hour rolling window for gap-fill; lakehouse Bronze holds the long tail.
- **Redis**: last-value cache per tag (LVC pattern) for downstream queries.

### Dependencies

- Vault (OPC-UA / historian creds), `kg-service` (tag canonicalization), `feature-store` (streaming features).

### Scaling

- Sharded by `connector_id`; per-connector single-writer to preserve monotonic timestamps. 50 pods per region baseline.
- Backpressure: Kafka producer with `acks=all`, `linger.ms=5`, `batch.size=64KB`, `compression=zstd`.

### Retry Policies

- Connector reconnect: exponential 1s → 60s, indefinite. Emit `ot_connector_down_seconds` metric.
- Kafka produce: 5 retries, `max.in.flight=1` on partition to preserve order.

### Circuit Breakers

- Per-connector isolation: one down historian cannot block others (bulkhead thread pool per connector).

### Authentication

- Historian creds: Vault dynamic secrets where supported, static-with-rotation otherwise.
- Internal: SPIFFE mTLS.

### Authorization

- Tag-level RBAC: Rego rule `data.safetyos.ot.can_read_tag` — hides raw pressure / process-safety tags from non-cleared roles (COMP-021 IP protection).

### Observability

- USE per connector, RED on APIs.
- Custom: `ot_lag_seconds`, `ot_tag_stale_count`, `ot_out_of_bounds_count`.
- SLO: 99.99% availability (safety-critical), lag < 2 s at p99.

### Caching

- LVC per tag, TTL = 2× expected update interval, minimum 500ms.
- Metadata cache (tag → KG ID) TTL 300s.

### Rate Limiting

- Producer-side: no rate limit (historian pushes native rates); Kafka partitions absorb burst.
- Admin API: 100 req/min/user.

### Deployment

- Runs partly at edge (edge OT collector, OT-005) and partly in cloud (`ot-ingestion-bridge` cluster). Edge collector uses store-and-forward over the internet-facing MQTT bridge if the cloud is unreachable (OT-020 gap-fill).
- Namespace `plane-b-ot`.

### Failure Recovery

- **Historian outage**: connector marked degraded, gap-fill on reconnect (OT-020).
- **Kafka outage**: local disk buffer 12 h, drop oldest with alert.
- RPO ≤ 5 s (edge buffer); RTO 5 min.

---

## 3.5 `ot-alarm-adapter` (Service #5)

Owns: alarm feed normalization and forwarding, feeding MODULE 14 (Alarm Rationalization).

### Responsibilities

- Subscribes to native alarm feeds (ISA-18.2 compliant + legacy), normalizes to a canonical alarm schema, applies debounce and burst detection.
- Publishes to `safetyos.ot.alarm.v1`.

### APIs

- Admin REST: `POST /ot/v1/alarms/sources`, `GET /ot/v1/alarms/live`.

### Events

- **Produces**: `safetyos.ot.alarm.v1`, `safetyos.audit.events`

### Databases

- **PostgreSQL 16**: alarm source registry, debounce config.
- **Redis**: 60-second alarm state window per source (for burst detection).

### Dependencies

- `ot-ingestion-bridge` (shared connector infra), `alarm-rationalization-service`.

### Scaling

- 10 pods baseline; sharded by alarm source.

### Everything else

- Inherits defaults from `ot-ingestion-bridge`.

---

## 3.6 `iot-wearable-bridge` (Service #6)

Owns: IOT-001 … IOT-018 (wearables, gas monitors, lone-worker beacons, RFID). Feeds CV-015 lone-worker fusion.

### Responsibilities

- Terminates BLE, LoRaWAN, cellular, and Wi-Fi telemetry from wearables (gas monitors, fall-detection watches, RFID/UWB tags, hard-hat sensors).
- Publishes to `safetyos.iot.wearable.v1` and `safetyos.ot.telemetry.v1` (unified telemetry topic for downstream fusion).
- Runs **presence-fusion** — merges CV person tracks with UWB positions (CV-015 lone-worker fusion, IOT-011).

### APIs

- Ingest REST/CoAP: `POST /iot/v1/telemetry` (bulk), MQTT bridge `iot/<tenant>/<device>/telemetry`.
- Admin REST: device management.

### Events / Databases / Scaling

- Similar structure to `ot-ingestion-bridge`; separate cluster for isolation.
- Cassandra 4.1 for high-cardinality device state (10M+ wearables at scale).

### Everything else

- Inherits defaults; note: **wearable-derived location data** is PII → served only to allowed roles + always audit-logged.

---

# PLANE C — SEMANTIC FUSION

## 3.7 `kg-service` (Service #7)

Owns: KG-001 … KG-018 (Knowledge Graph & Semantic Fusion).

### Responsibilities

- Canonical ontology of **assets, zones, personnel, contractors, permits, equipment, hazards, chemicals, procedures**.
- Resolves entities across sources (SAP asset ID, PI tag, contractor badge, camera ID) → single KG node.
- Serves as the substrate for all cross-module joins (a permit references the same asset the camera sees, the historian tag drives, and the twin visualizes).

### APIs

- gRPC:
  ```proto
  service KnowledgeGraph {
    rpc Upsert(UpsertRequest) returns (UpsertResult);
    rpc Resolve(ResolveRequest) returns (Entity);
    rpc Traverse(TraversalRequest) returns (stream Entity);
    rpc CypherQuery(CypherQueryRequest) returns (stream Record); // scoped, read-only
  }
  ```
- REST search: `GET /kg/v1/search?q=...&type=asset`

### Events

- **Produces**: `safetyos.kg.entity.upsert.v1` (compacted — latest state per entity)
- **Consumes**: `safetyos.ot.telemetry.v1` (tag→asset binding hints), `safetyos.contractor.state.v1`, `safetyos.cv.event.v2` (camera→zone hints)

### Databases

- **Neo4j 5 Enterprise** (causal cluster, 3 core + N read replicas): the graph.
- **PostgreSQL 16**: entity master data (ACID authoritative source), ontology versions.
- **OpenSearch 2**: full-text + fuzzy entity search.
- **Redis**: hot entity cache (TTL 300s).

### Dependencies

- `policy-engine`, `dp-lakehouse` (historical entity snapshots via DP-010).

### Scaling

- Read replicas scale horizontally; write throughput bounded (~5k upserts/sec/tenant, batched).
- Sharding: multi-tenant DB isolation for Tier-1 (dedicated Neo4j cluster), shared with strict tenant predicate for others.

### Retry Policies

- Upsert: 3× with 200ms base, backoff; on final failure → DLQ + human review (KG-016 stewardship UI).

### Circuit Breakers

- Cypher endpoint: open on p99 > 2s sustained 60s → serve degraded (cached read-only view).

### Authentication / Authorization

- mTLS + JWT. Rego rules enforce read/write scoping by entity type + site.

### Observability

- RED on APIs, USE on Neo4j.
- Custom: `kg_resolution_confidence_p50`, `kg_orphan_entity_count`.
- SLO: 99.95% availability, p99 read ≤ 100 ms.

### Caching

- Entity cache (Redis) TTL 300s; invalidation on `kg.entity.upsert.v1`.
- Traversal cache (short-lived, 60s) for common queries.

### Rate Limiting

- Cypher: 10 concurrent queries/tenant, 30s query timeout (protects Neo4j).
- Upsert: 5k/sec/tenant.

### Deployment

- Regional-active with async replication of graph snapshots; write master pinned to home region.
- Namespace `plane-c-fusion`.

### Failure Recovery

- Neo4j failover: 60s automatic; RPO ≤ 15s (raft), RTO ≤ 5 min.
- Full rebuild path from lakehouse Bronze in ≤ 6 h (DR runbook).

---

## 3.8 `digital-twin-service` (Service #8)

Owns: DT-001 … DT-024 (Digital Twin & Geospatial).

### Responsibilities

- Ingests plant layouts (IFC / DWG / GeoJSON / point clouds).
- Serves 3D tile streams (Cesium 3D Tiles / glTF) to Console and Mobile.
- Overlays real-time state: CV detections, OT tag values, permit polygons, LOTO isolation zones.
- Enables **spatial queries** (which cameras cover this zone, who is within 10 m of this asset).

### APIs

- REST tile server: `GET /twin/v1/tiles/{z}/{x}/{y}` (auth-scoped).
- gRPC:
  ```proto
  service DigitalTwin {
    rpc SpatialQuery(SpatialQueryRequest) returns (stream Entity);
    rpc ProjectDetection(ProjectDetectionRequest) returns (ProjectionResult);
    rpc ImportLayout(stream LayoutChunk) returns (ImportReceipt);
  }
  ```

### Events

- **Consumes**: `safetyos.cv.event.v2`, `safetyos.ot.telemetry.v1` (filtered), `safetyos.permit.state.v1`, `safetyos.loto.state.v1`, `safetyos.kg.entity.upsert.v1`
- **Produces**: `safetyos.audit.events`

### Databases

- **PostGIS** (PostgreSQL 16 + PostGIS 3.4): spatial index, zone polygons.
- **S3**: 3D tile assets (tileset.json + glb tiles).
- **Redis**: hot spatial query cache.

### Dependencies

- `kg-service`, `cv-inference-gateway`, `ot-ingestion-bridge`.

### Scaling

- Tile server: read-heavy, CDN-fronted (CloudFront / Fastly).
- Spatial query: sharded per site.

### Retry / CB / Auth / Observability

- Standard defaults; SLO 99.9%, p99 spatial query ≤ 300 ms.

### Caching

- Tile CDN with 5-minute TTL for dynamic overlay tiles, ∞ for static geometry.

### Rate Limiting

- Tile requests: 500/s per user, backed by CDN.

### Deployment

- Regional, CDN-fronted; namespace `plane-c-fusion`.

### Failure Recovery

- Layout re-import from S3; RPO 0 for geometry, RTO 30 min.

---

## 3.9 `entity-resolution-service` (Service #9)

Owns: KG-005, KG-013 (entity matching + stewardship).

### Responsibilities

- Runs deterministic + probabilistic matching (Splink/DuckDB) to link identities across source systems.
- Emits merge/split suggestions to a human steward UI (KG-016).

### Everything

- Consumes `kg.entity.upsert.v1`, produces resolution suggestions to internal Kafka topic `safetyos.kg.match_candidates.v1`.
- Postgres + DuckDB for matching, standard defaults elsewhere.

---

# PLANE D — RISK & AI REASONING

## 3.10 `compound-risk-engine` (Service #10)

Owns: CR-001 … CR-027 (Compound Risk Detection Engine, vNext).

### Responsibilities

- Correlates events across CV, OT, KG, wearables, and workflows to detect **compound risk patterns** — configurations that no single sensor would flag but jointly indicate elevated hazard (e.g. "hot work permit active + gas reading rising + wind shift + evacuation route blocked").
- Executes pattern DSL (`CR-DSL v2`, versioned per CR-024) via a streaming rules engine (Flink SQL + custom operators).
- Publishes `safetyos.risk.compound.v2` (versioned event schema).
- Includes new vNext patterns: CR-025 dropped-object, CR-026 pyrophoric-exposure, CR-027 wrong-line-break.

### APIs

- Admin REST: pattern CRUD (with sim/backtest linkage per CR-024).
- gRPC: `EvaluateAdHoc(PatternRequest) returns (PatternResult)` for what-if.

### Events

- **Consumes**: `safetyos.cv.event.v2`, `safetyos.cv.violation.v2`, `safetyos.ot.telemetry.v1` (filtered), `safetyos.ot.alarm.v1`, `safetyos.iot.wearable.v1`, `safetyos.permit.state.v1`, `safetyos.loto.state.v1`, `safetyos.kg.entity.upsert.v1`
- **Produces**: `safetyos.risk.compound.v2`, `safetyos.audit.events`

### Databases

- **Apache Flink 1.19** (managed): stateful stream processing, RocksDB state backend on S3.
- **PostgreSQL 16**: pattern definitions, versions, sim/backtest metadata.
- **Redis**: pattern-execution counters + recent event lookback buffer.
- **Feature Store (Feast)**: real-time features consumed via Redis online store.

### Dependencies

- `kg-service` (context enrichment), `feature-store`, `policy-engine` (pattern activation policy per site/tenant), `sim-backtest-service` (CR-024).

### Scaling

- Flink job graph scales via task-manager replicas; parallelism = 128 per busy tenant.
- Per-tenant job isolation for regulated customers.

### Retry Policies

- Stateful, exactly-once within Flink; downstream Kafka produce with `acks=all` and idempotent producer.

### Circuit Breakers

- Enrichment calls to KG have 100ms timeout with `on_timeout=use_cached_context`; pattern never blocks on external.

### Authentication / Authorization

- Pattern authoring: RBAC via `safety.pattern.author` role. All patterns require sim+backtest before promotion to production (WFP-005 policy gate).

### Observability

- Per-pattern RED: firings/sec, false-positive rate (from labeled feedback), latency p99.
- SLO: 99.95% availability, ingest-to-emit p99 ≤ 5 s (OBS-004).

### Caching

- Enrichment cache (KG) TTL 60s; feature cache from Feast online store.

### Rate Limiting

- Emissions: no hard cap but downstream (Notification) has its own; excessive firing on a pattern triggers automatic circuit-breaker (`pattern.flaky`) with SRE alert.

### Deployment

- Regional; namespace `plane-d-risk`.

### Failure Recovery

- Flink checkpoint every 30 s to S3; restart from checkpoint on failure.
- RPO ≤ 30 s; RTO ≤ 3 min.
- Pattern change causing regression → automatic rollback via feature flag + kill-switch (AG-020).

---

## 3.11 `multi-agent-orchestrator` (Service #11)

Owns: AG-001 … AG-020 (Multi-Agent Reasoning Layer, vNext).

### Responsibilities

- Coordinates specialized LLM agents (**triage agent, investigator, remediation planner, compliance auditor, model-router**) via a durable orchestration graph (Temporal + LangGraph).
- Implements new vNext features: AG-017 (model-router), AG-018 (uncertainty quantification), AG-019 (human-in-loop broker), AG-020 (rollback/kill-switch).
- Every agent decision is a Temporal workflow — replayable, auditable, resumable.

### APIs

- gRPC: `StartCase(CaseRequest) returns (CaseId)`, `GetCaseState(CaseId)`, `RespondToHumanPrompt(...)`.

### Events

- **Consumes**: `safetyos.risk.compound.v2`, `safetyos.incident.state.v1`, `safetyos.cv.violation.v2`
- **Produces**: `safetyos.agent.decision.v1`, `safetyos.audit.events`, `safetyos.workflow.command.v1`

### Databases

- **Temporal** (backed by Cassandra + Elasticsearch): workflow history, WORM-audited.
- **PostgreSQL 16**: agent registry, model bindings, uncertainty thresholds.
- **Vector DB** (pgvector / Qdrant, shared with RAG): episodic memory of past cases.

### Dependencies

- `rag-service`, `policy-engine`, `model-registry`, `feature-store`, `notification-router`.

### Scaling

- Temporal workers auto-scale on task queue depth; per-agent worker pool sizing.

### Retry Policies

- Temporal handles retries natively; per-activity retry policy declared in code (max 5, exponential to 60s).
- LLM calls: 3 retries with model-router fallback (AG-017) to a smaller/different provider.

### Circuit Breakers

- Per-LLM-provider circuit: open on 30% error rate over 60s → route through model-router to alternate provider; if all providers down, escalate to human-in-loop.

### Authentication / Authorization

- All agent actions run under a **synthetic principal** with narrow scopes (least privilege).
- Human-in-loop actions require the actual human's JWT and step-up MFA for consequential actions (PTW auto-close, LOTO override).

### Observability

- Per-agent per-case: decision latency, uncertainty score distribution, human-override rate.
- SLO: 99.9% availability; case-lifecycle p99 ≤ 60 s from event to first useful recommendation.

### Caching

- LLM response cache (Redis) keyed by `hash(prompt + model + context_digest)`, TTL 300s, only for **read-only** advisory calls.

### Rate Limiting

- Global LLM spend budget per tenant per day (cost guardrail, OBS-014).
- Per-user human-prompt rate: 60/min.

### Deployment

- Regional; namespace `plane-d-risk`.

### Failure Recovery

- Temporal history is authoritative; any worker crash is transparent.
- Global kill-switch (AG-020) freezes all agent action within 30 s of activation.

---

## 3.12 `rag-service` (Service #12)

Owns: RAG-001 … RAG-020 (RAG Copilot & Conversational AI).

### Responsibilities

- Retrieval-Augmented Generation over **SOPs, MSDS, permits, incidents, shift logs, regulatory codes**.
- Hybrid retrieval (BM25 + vector) → re-ranker (cross-encoder) → LLM answer with citations.
- Enforces per-user document ACLs (policy-engine gate before retrieval).

### APIs

- REST: `POST /rag/v1/query`, `POST /rag/v1/chat` (streaming SSE).
- gRPC internal for agent orchestrator.

### Events

- **Consumes**: `safetyos.shift.handover.v1`, `safetyos.incident.state.v1`, `safetyos.kg.entity.upsert.v1` (indexer updates)
- **Produces**: `safetyos.audit.events`

### Databases

- **OpenSearch 2**: BM25 index + document store.
- **Qdrant** (or pgvector on Postgres for smaller tenants): vector index.
- **PostgreSQL 16**: query logs, feedback signals.
- **Redis**: response cache.

### Dependencies

- `model-registry` (embedding + LLM models), `policy-engine` (document ACL).

### Scaling

- Read-heavy; retrievers scale horizontally, LLM front bounded by model-server capacity.

### Retry / CB

- Retriever: 3 retries; LLM: model-router fallback (via AG-017).

### Authentication / Authorization

- Every retrieved chunk is re-ACL-checked at answer-time; sources with denied access are dropped and the answer explicitly declares partial context (never silent drop).

### Observability

- Faithfulness scoring (post-hoc via judge model), citation coverage, per-query cost, latency p99.
- SLO: 99.9% availability, p99 non-streaming ≤ 6 s, first-token TTFB ≤ 1.5 s.

### Caching

- Full-response cache (Redis, TTL 600s) keyed by principal-hash + query-hash to preserve ACL correctness.

### Rate Limiting

- 30 queries/min/user; 5 concurrent streams/user.

### Deployment

- Regional; namespace `plane-d-risk`.

### Failure Recovery

- Index rebuild from lakehouse Gold in ≤ 4 h; RPO 15 min for query logs.

---

## 3.13 `phm-service` (Predictive Analytics & PHM — Service #13)

Owns: PRED-001 … PRED-018 (Predictive Analytics & PHM).

### Responsibilities

- Runs prognostics + health-management models (remaining-useful-life, failure-mode classification) on OT streams + maintenance history.
- Publishes predicted-failure events that feed Compound Risk and CMMS work-order creation (via INT-*).

### APIs, Events, DBs

- REST for model dashboards; consumes `safetyos.ot.telemetry.v1`; produces model events into `safetyos.risk.compound.v2` (as pattern input) and its own `safetyos.phm.prediction.v1` for CMMS.
- Feature Store (Feast) primary; PostgreSQL for model registry; Delta Lake for training data.

### Everything else

- Standard defaults; SLO 99.9%, p99 inference ≤ 500 ms.

---

# PLANE E — SAFETY WORKFLOWS

## 3.14 `ptw-service` (Permit-to-Work — Service #14)

Owns: PTW-001 … PTW-022 (Permit-to-Work Workflow).

### Responsibilities

- Lifecycle of permits (draft → JHA → approval chain → issue → active → suspension → close).
- Enforces **hard interlocks** with LOTO (a permit cannot be issued unless required isolations are proved) via Temporal + policy engine.
- Integrates CV violations (auto-suspend on PPE breach in permit zone) and gas readings (auto-suspend on threshold).

### APIs

- REST: full CRUD + state transitions with idempotency keys.
- gRPC internal for high-throughput console queries.

### Events

- **Produces**: `safetyos.permit.state.v1` (compacted per permit), `safetyos.audit.events`
- **Consumes**: `safetyos.loto.state.v1`, `safetyos.cv.violation.v2`, `safetyos.ot.alarm.v1`, `safetyos.contractor.state.v1`

### Databases

- **PostgreSQL 16** (primary, ACID authoritative): permits, JHA, approvals, e-signatures.
- **Temporal**: workflow state (approval chains, timers).
- **S3**: attached JHA PDFs, e-sign artifacts (WORM 7-year, per COMP-018).
- **Redis**: active-permit index (query hot path).

### Dependencies

- `loto-service` (interlock), `contractor-service` (trained/current), `policy-engine`, `notification-router`, `workflow-engine`, `kg-service`.

### Scaling

- Moderate write throughput (~1000 state transitions/sec/tenant peak); horizontal via Postgres read replicas.

### Retry Policies

- All state transitions idempotent by `permit_id + transition_id`.
- Notification dispatch retried by `notification-router`, not by PTW.

### Circuit Breakers

- LOTO service dependency: on failure, permits **cannot be issued** (fail-closed by regulatory requirement). Read-only permit views remain available.

### Authentication / Authorization

- Approver signatures: OIDC + WebAuthn (step-up MFA per COMP-011 e-sign requirements).
- Emergency close: dual approval + audit + break-glass workflow.

### Observability

- RED per state transition.
- Business SLOs: permit-issue p95 ≤ 5 min (human-bound), auto-suspend on violation ≤ 3 s from CV event.
- Custom: `permit_active_count`, `permit_overdue_close_count`, `permit_interlock_fail_count`.

### Caching

- Active-permit hot index in Redis; TTL 60s + explicit invalidation.

### Rate Limiting

- Standard user rate limits; approvals limited to protect against automation abuse.

### Deployment

- Regional-active-passive (single-writer per permit to preserve monotonic history); namespace `plane-e-workflows`. Tier-1 tenants get dedicated Postgres cluster.

### Failure Recovery

- Postgres PITR 15 min; Temporal history is workflow source of truth.
- RPO ≤ 15 s (streaming replication), RTO ≤ 5 min.
- **On disaster**: read-only permit access from lakehouse Silver in ≤ 30 min.

---

## 3.15 `loto-service` (Lockout/Tagout — Service #15)

Owns: LOTO-001 … LOTO-016.

### Responsibilities

- Lifecycle of energy-isolation events (identify sources → apply → verify zero-energy → lock → release).
- Cryptographic proof of isolation (signed by lock owner, IoT lock attestation where available).
- Publishes state to PTW interlock.

### Structure

- Mirrors `ptw-service` closely (Postgres + Temporal + S3 + Redis).
- Distinct topic `safetyos.loto.state.v1`.
- Extra dependency: `iot-wearable-bridge` for smart-lock attestation.

### Everything else

- Same defaults as `ptw-service`; **fail-closed** on any authoritative signal that isolation is uncertain.

---

## 3.16 `shift-handover-service` (Service #16)

Owns: SH-001 … SH-018 (Shift Handover Intelligence).

### Responsibilities

- Structured shift-log capture (voice, text, checklist).
- LLM-assisted summarization of the outgoing shift's open items, incidents, permits, deviations.
- Publishes handover artifacts to RAG index (rich retrieval later).

### APIs / Events / DBs

- REST + WebSocket for voice streaming.
- Produces `safetyos.shift.handover.v1`.
- Postgres + S3 (audio + PDF logs, retention 3 y).

### Everything else

- Standard defaults; SLO 99.9%, summary p95 ≤ 30 s.

---

## 3.17 `incident-service` (Service #17)

Owns: INC-001 … INC-030 (Incident Management & RCA, vNext).

### Responsibilities

- Incident intake, triage, investigation, RCA (5-Why / TapRooT / Bow-Tie), CAPA tracking (**ISO 45001**), external reporting (OSHA, insurer bus).
- Legal-hold enforcement (INC vNext) — freezes retention on incident-related evidence.
- Action-tracker SLA telemetry (vNext INC feature).

### APIs

- REST full CRUD, streaming updates via WebSocket.
- gRPC internal.

### Events

- **Produces**: `safetyos.incident.state.v1`, `safetyos.audit.events`, `safetyos.compliance.finding.v1` (regulatory-triggering ones)
- **Consumes**: `safetyos.risk.compound.v2`, `safetyos.cv.violation.v2`, `safetyos.er.event.v1`

### Databases

- **PostgreSQL 16**: incidents, actions, findings.
- **S3 (WORM Object Lock)**: evidence bundle, retention 7–30 y jurisdiction-dependent (COMP-018).
- **Temporal**: investigation workflow + CAPA follow-ups.
- **Neo4j (shared with KG)**: causal graphs for RCA.

### Dependencies

- `kg-service`, `policy-engine`, `notification-router`, `dp-lakehouse`, external insurer bus (via `integration-hub`).

### Scaling

- Moderate; investigation workflow may be long-lived (months).

### Retry / CB / Auth / Observability

- Standard defaults.
- SLO 99.95% availability, incident-create p99 ≤ 2 s.

### Rate Limiting / Caching / Deployment / Recovery

- Standard defaults; **legal-hold documents are hard-immutable** (S3 Object Lock).

---

## 3.18 `emergency-response-orchestrator` (Service #18)

Owns: ER-001 … ER-018 (Emergency Response Orchestrator, MODULE 18).

### Responsibilities

- Detects emergency triggers, activates ER plans (evacuation, muster, hazmat, medical).
- Coordinates notifications, muster reconciliation (who's checked in, who's missing).
- Bridges to external (911, plant fire brigade radio, mass-notification providers).

### APIs / Events / DBs

- REST + WebSocket + gRPC.
- Produces `safetyos.er.event.v1`.
- Postgres + Temporal + Redis (fast muster count) + S3.

### SLO

- **99.99% availability** (life-safety), p99 trigger-to-first-broadcast ≤ 5 s.
- Multi-region **active-active** with quorum-write; if one region unreachable, others carry full load.

### Circuit Breakers

- External SMS providers: primary + 2 fallbacks (Twilio + AWS SNS + on-prem paging), automatic failover.

### Failure Recovery

- Every ER event fully replayable from Kafka + Temporal history.
- RPO 0 (synchronous multi-region write for triggers), RTO ≤ 60 s.

---

# PLANE F — COMMAND & CONTROL

## 3.19 `console-bff-service` (HMI/ISA-101 — Service #19)

Owns: UI-001 … UI-032 (Command Console & HMI BFF).

### Responsibilities

- Backend-for-frontend for the web Command Console. Aggregates queries across CV, OT, KG, workflows, compound risk into ISA-101-compliant HMI views.
- Manages user preferences, dashboard layouts, ack-flow state.

### APIs

- REST + WebSocket (SSE for live streams).
- GraphQL federation gateway (schema-stitched over gRPC service graph, no direct DB access).

### Events

- **Consumes**: broad — subscribes to most `safetyos.*` topics for real-time UI push (via Kafka Streams → WebSocket bridge).
- **Produces**: `safetyos.audit.events` (user actions).

### Databases

- **PostgreSQL 16**: user prefs, saved views, ack state.
- **Redis**: session state, WS connection registry.

### Dependencies

- Every upstream service via gRPC; policy-engine on every request.

### Scaling

- WebSocket fan-out: dedicated `ws-fanout` sidecar (redis-pubsub backed) to avoid per-pod state; supports 50k concurrent WS/pod.

### Retry / CB

- Per-upstream circuit; UI degrades panel-by-panel — never a full outage from a single dependency.

### Authentication / Authorization

- OIDC + WebAuthn; every panel query re-authorized (defense in depth).

### Observability

- Per-panel latency (RUM + server-side).
- SLO: 99.95% availability, panel-load p95 ≤ 2 s.

### Caching

- Aggressive short-TTL caching (5–30s) per user per query hash.

### Rate Limiting

- 300 req/min/user across all panels (UI is bursty on tab-switch; burst allowance 60s window).

### Deployment

- Regional-active, CDN-fronted static; namespace `plane-f-console`.

### Failure Recovery

- Stateless; RPO 0 (state in downstream services), RTO ≤ 2 min.

---

## 3.20 `mobile-bff-service` (Service #20)

Owns: MOB-001 … MOB-024 (Mobile & Field Application BFF).

### Responsibilities

- BFF for iOS/Android app (native + Flutter). Offline-first sync (JHA drafts, permit steps, incident capture with photos).
- Handles field-heavy flows: torch-lit low-bandwidth photo compression, delta-sync, background upload.

### APIs

- REST (delta-sync + pull-refresh) + push notifications (FCM/APNs via `notification-router`).

### Events

- **Produces**: `safetyos.audit.events`, delegates business events to underlying services.

### Databases

- **PostgreSQL 16**: mobile session, sync watermarks, device registry.
- **S3**: photo + voice-memo staging.
- **Redis**: outbox for offline-drafted writes (write-through on reconnect).

### Dependencies

- ptw, loto, incident, shift-handover, notification, policy-engine, cv (for muster QR scans), pii-blur (for evidence upload).

### Scaling

- Regional, moderate load.

### Retry / CB

- Client-side: exponential backoff for offline; server tracks device sync state.

### Authentication / Authorization

- OIDC + biometric device unlock; step-up (WebAuthn / device biometrics) for permit approvals in the field.

### Observability

- SLO 99.9%, sync p95 ≤ 3 s on LTE.
- Custom: `mobile_offline_hours_p95`, `mobile_sync_conflict_rate`.

### Caching

- Aggressive local device cache; server-side thin.

### Rate Limiting

- Standard per-user; per-device photo upload 100/hour default (evidence bursts).

### Deployment

- Regional-active; namespace `plane-f-console`.

### Failure Recovery

- Offline queue on device (up to 30 days); server-side delta rebuild from lakehouse if metadata is lost.

---

## 3.21 `alarm-rationalization-service` (Service #21)

Owns: AL-001 … AL-024 (Alarm Rationalization, ISA-18.2).

### Responsibilities

- ISA-18.2 alarm master-database management (priority, deadband, delay).
- Alarm-flood detection, stale-alarm nagging, MOC integration for changes.
- KPI dashboards (annunciated/hour/operator, standing alarms, chattering).

### APIs / Events / DBs

- REST + WebSocket for live console.
- Consumes `safetyos.ot.alarm.v1`; produces derived stats to lakehouse.
- Postgres (master DB) + ClickHouse (KPI aggregates) + Redis (live counts).

### Everything else

- Standard defaults; SLO 99.95% (feeds ISA-18.2 regulatory reporting).

---

# PLANE G — COMPLIANCE, CONTRACTOR, NOTIFICATIONS

## 3.22 `compliance-service` (Service #22)

Owns: COMP-001 … COMP-030.

### Responsibilities

- Framework library (OSHA VPP, ISO 45001, IEC 61511, ISA-84, PSM, regional codes) mapped to controls, controls to evidence.
- Automated evidence collection from all other services.
- Audit-package generation (WORM bundle + notarized hash).
- Regulatory event emission to insurer / regulator buses.

### APIs / Events / DBs

- REST for framework CRUD, evidence explorer.
- Consumes broad audit + state topics; produces `safetyos.compliance.finding.v1`.
- Postgres + S3 (evidence, Object Lock).

### Auth / Observability

- Reg-grade audit; SLO 99.95%.

### Failure Recovery

- Evidence is redundantly stored (S3 CRR across regions); RPO 15 min.

---

## 3.23 `contractor-service` (Service #23)

Owns: CON-001 … CON-022 (Contractor & Workforce Management).

### Responsibilities

- Contractor registry, insurance certs, training records, medicals, badge issuance, gate check-in.
- Blocks unqualified contractors from PTW assignment (published to `safetyos.contractor.state.v1`).

### APIs / Events / DBs

- Standard REST; Postgres + S3 (docs) + Redis.

### Everything else

- Standard defaults; PII treatment enforced by `data-governance-service`.

---

## 3.24 `notification-router` (Service #24)

Owns: NOT-001 … NOT-020 (Notifications, Alerting & Comms).

### Responsibilities

- Multi-channel notification dispatch (SMS, voice-call, email, mobile push, WebSocket, PA-system, in-app, radio bridge).
- Recipient-preference + on-call schedule resolution.
- Delivery-receipt tracking; escalation trees (unack in 5 min → next tier).

### APIs

- gRPC `Dispatch(NotificationRequest)`; REST admin.

### Events

- **Consumes**: `safetyos.risk.compound.v2`, `safetyos.cv.violation.v2`, `safetyos.incident.state.v1`, `safetyos.er.event.v1`, `safetyos.ot.alarm.v1`, `safetyos.permit.state.v1`, `safetyos.compliance.finding.v1`
- **Produces**: `safetyos.notification.dispatch.v1`, `safetyos.audit.events`

### Databases

- **PostgreSQL 16**: preferences, on-call schedules, dispatch log.
- **Redis**: rate-limiter state, dedupe.

### Dependencies

- External: Twilio, AWS SNS/Pinpoint, SendGrid, FCM, APNs, on-prem paging.

### Scaling

- 20 pods baseline; horizontal.

### Retry Policies

- Per-channel retries with provider-native semantics (SMS 3 attempts, email 5 with SPF/DKIM).
- Escalate to next channel/tier on failure.

### Circuit Breakers

- Per-provider CB with automatic failover to secondary (Twilio → SNS → on-prem).

### Authentication / Authorization

- Callers must have `notification.dispatch` scope on the target audience.

### Observability

- Per-channel delivery-rate, ack-rate, e2e latency, cost.
- SLO 99.95%, p99 dispatch ≤ 3 s.
- ER escalations track additional 99.99% SLO tier.

### Caching

- Recipient-preference cache (Redis, 60s TTL).
- On-call schedule cache (5-minute).

### Rate Limiting

- Per-recipient hourly cap (fatigue prevention) — configurable per notification class, ER exempt.
- Provider-level throttles honored.

### Deployment

- Regional-active-active; namespace `plane-g-comms`.

### Failure Recovery

- Dispatch log is authoritative; on service crash, in-flight dispatches replayable from Kafka.
- RPO ≤ 15 s, RTO ≤ 2 min.

---

# PLANE H — SECURITY & GOVERNANCE

## 3.25 `identity-service` (Service #25)

Owns: SEC-001 … SEC-006 (Zero-Trust identity, MFA, break-glass).

### Responsibilities

- Frontend to Keycloak/Okta (Kong OIDC provider); adds SafetyOS-specific attribute mapping (site, role, contractor).
- Manages step-up (WebAuthn), break-glass tokens (short TTL + dual approval), delegated admin.

### APIs / Events / DBs

- OIDC standard + REST for admin. Postgres for local mapping. Vault for secret material.

### Everything else

- SLO 99.99% (login-blocker); regional-active-passive with instant DNS failover.

---

## 3.26 `policy-engine` (Service #26 — MODULE 26, WFP-003)

Owns: WFP-003, and consumed by every service.

### Responsibilities

- OPA Bundle Server + evaluation service (sidecar + centralized fallback).
- Serves signed Rego bundles to service sidecars; central endpoint for heavy queries.
- Policy authoring UI + policy CI/CD pipeline (tested → signed → published → distributed).

### APIs

- REST `POST /policy/v1/evaluate` (fallback / non-sidecar cases).
- gRPC internal.

### Events

- **Produces**: `safetyos.audit.events` (policy evaluations for regulated flows).

### Databases

- **PostgreSQL 16**: policy metadata, versions, signatures.
- **S3**: signed bundles (Cosign).
- **Redis**: decision cache (short TTL, 30s).

### Dependencies

- Vault (signing keys).

### Scaling

- Bundle server: read-heavy CDN-friendly. Central evaluator: horizontal, cache-heavy.

### Retry / CB

- Sidecar strategy means every service has a local fallback; central failure never blocks a service.

### Authentication / Authorization

- Only `policy.admin` role can publish; every publish signed + reviewed.

### Observability

- Per-rule eval rate, denial rate, latency; SLO 99.99% (sidecar) / 99.95% (central).

### Caching

- Decisions cacheable for **read** evaluations only (short TTL). Writes always uncached.

### Rate Limiting

- Central evaluator: 10k eval/s/pod cap.

### Deployment

- Sidecar in every namespace + central deployment `plane-h-security`.

### Failure Recovery

- Sidecar caches last-known-good bundle indefinitely; on total central outage, systems continue using cached policies with `policy_stale_seconds` metric alerting.

---

## 3.27 `data-governance-service` (Service #27)

Owns: SEC-007 … SEC-022 (PII, DLP, DSR, retention, WORM).

### Responsibilities

- PII discovery and classification across data stores.
- DLP scanning on outbound (email, export, RAG answers).
- Data subject request (DSR) orchestration (GDPR/CCPA erase, export).
- Retention policy execution across S3, Postgres, Kafka.

### APIs / Events / DBs

- REST admin + gRPC scanner endpoints.
- Produces `safetyos.dlp.event.v1`.

### Everything else

- Standard defaults; SLO 99.9%. DSR SLA: erase ≤ 30 days per regulation.

---

## 3.28 `audit-sink-service` (Service #28)

Owns: SEC-018 (WORM audit), OBS-002.

### Responsibilities

- Consumes `safetyos.audit.events` from all services.
- Writes to S3 Object Lock (compliance mode, retention 7 y default, 30 y for regulated jurisdictions).
- Provides indexed search over the WORM store (OpenSearch mirror).

### Databases

- **S3 Object Lock** (WORM, authoritative).
- **OpenSearch** (searchable mirror, non-authoritative).

### Everything else

- Standard defaults; SLO 99.99% ingest (no audit loss tolerated); RPO 0 via synchronous multi-AZ write.

---

# PLANE I — PLATFORM SUBSTRATE

## 3.29 `workflow-engine` (Service #29 — MODULE 26, WFP-001, WFP-004)

Owns: WFP-001 (Temporal control plane), WFP-004 (approval workflow substrate).

### Responsibilities

- Managed Temporal cluster (or Temporal Cloud) with SafetyOS-specific wrappers: standard activity libraries, retry defaults, per-namespace quotas.
- Approval workflow substrate (parallel/serial approvals, timeouts, escalations) reusable by PTW, LOTO, INC, ER.

### APIs

- Temporal-native (gRPC) + SafetyOS SDK.

### Events

- Bridges to Kafka via `safetyos.workflow.command.v1` for cross-service commands.

### Databases

- Cassandra (Temporal state) + Elasticsearch (visibility).

### Everything else

- SLO 99.99% (foundational); RPO 0 (multi-region Cassandra); RTO 2 min.

---

## 3.30 `rule-engine-service` (Service #30 — MODULE 26)

Owns: WFP-006 (business-rule engine — DMN + custom DSL for non-OPA rules like alarm-priority calculations).

### Responsibilities

- Executes business rules that are not access-control (OPA's job) but data-transformation / decision.
- Used by Alarm Rationalization, PHM, Compliance evidence scoring.

### Everything else

- Standard defaults; horizontal, PostgreSQL for rule storage, Redis for hot cache.

---

## 3.31 `feature-flag-service` (Service #31)

Owns: WFP-008, PLT-* rollout gates.

### Responsibilities

- Serves feature flags (kill-switches, canary gates, tenant-scoped enable) to all services.
- Every feature declares its flag in code; changing a flag emits `safetyos.audit.events`.

### Everything else

- Flagsmith backend, Redis + Postgres, SLO 99.99% (kill-switch reliability).

---

## 3.32 `tenant-service` (Service #32)

Owns: PLT-001 … PLT-018 (multi-tenant isolation, tenant lifecycle, quotas).

### Responsibilities

- Tenant provisioning (namespaces, DBs, Kafka topics, IAM).
- Quota enforcement (storage, event rate, LLM budget).

### Everything else

- Standard defaults; SLO 99.95%.

---

## 3.33 `integration-hub` (Service #33)

Owns: INT-001 … INT-024 (SAP, Oracle EAM, Maximo, ServiceNow, IBM iEHS, Salesforce, insurer bus, regulator bus).

### Responsibilities

- Adapter pattern: each integration is a plugin with a canonical inbound/outbound schema.
- Handles auth (OAuth 2.0 client credentials + mTLS-bound tokens per RFC 8705), backfill, delta sync, dead-letter recovery.

### APIs / Events / DBs

- REST admin, gRPC internal, Postgres + Redis.
- Consumes many topics for outbound sync, produces its own inbound topic `safetyos.integration.inbound.v1`.

### Retry / CB

- Per-integration bulkheads. Aggressive CB on external providers.

### Everything else

- Standard defaults; SLO 99.9%.

---

## 3.34 `devx-service` (Service #34)

Owns: PLT-015 … PLT-018 (developer portal, API keys, webhooks).

### Responsibilities

- Developer portal (self-service API keys, webhook endpoints, sandbox tenants).
- SDK distribution (npm, PyPI, Maven).

### Everything else

- Standard defaults; SLO 99.9%.

---

# PLANE J — DATA PLATFORM & OBSERVABILITY

## 3.35 `lakehouse-service` (Service #35 — MODULE 25, DP-001 … DP-016)

Owns: DP-001 … DP-016 (Data Platform, Lakehouse & MLOps Control Plane).

### Responsibilities

- Bronze / Silver / Gold lakehouse zones (Delta Lake on S3).
- Kafka → Bronze ingestion (Debezium + Kafka Connect + custom Flink jobs).
- Silver: cleansed, conformed. Gold: business-ready marts (safety-KPI, incident-analytics, compliance-evidence).
- Serves BI (via Trino) and ML training (via Spark).

### APIs

- Trino SQL endpoint (ANSI SQL over lakehouse).
- REST admin (job status, backfills).

### Events

- **Consumes**: essentially all `safetyos.*` topics (Bronze ingestion).
- **Produces**: none (terminal sink; downstream is BI/ML).

### Databases

- **S3** (Delta Lake tables), **Hive Metastore** or **Unity Catalog**.
- **Trino** cluster for query.
- **Spark on Kubernetes** for batch jobs.

### Dependencies

- Kafka, Schema Registry, `feature-store` (co-tenant).

### Scaling

- Auto-scaling Spark + Trino clusters; per-tenant workload isolation.

### Retry / CB

- Kafka Connect handles retries; DLQ per source topic.

### Authentication / Authorization

- Trino: OIDC + Ranger-based row/column-level ACLs; every query authorized against KG data-classification tags.

### Observability

- Job lag, table freshness, cost per query, per-table SLAs (freshness ≤ 1 h Silver, ≤ 4 h Gold).

### Caching

- Result-set caching in Trino (short TTL).

### Rate Limiting

- Concurrent-query cap per tenant; long-running-query kill switch.

### Deployment

- Regional; namespace `plane-j-data`.

### Failure Recovery

- Bronze is append-only + immutable — recoverable from Kafka retention or from replicated S3.
- Silver/Gold re-buildable from Bronze in ≤ 24 h.
- RPO 15 min (Kafka replication), RTO 4 h for query availability.

---

## 3.36 `mlops-control-plane` (Service #36 — MODULE 25)

Owns: DP-005 … DP-012 (model registry, training orchestration, canary, kill-switch, drift monitoring).

### Responsibilities

- Registry of all models (CV, PHM, RAG embedders, LLMs — proprietary + third-party).
- Training pipelines (Airflow / Argo Workflows + Spark / Ray).
- Canary + shadow deployment orchestration (partners with `cv-inference-gateway` and `edge-gateway-orchestrator`).
- Drift monitoring (feature + prediction drift → automatic retrain or human alert).
- Cost + governance dashboards.

### APIs

- REST + gRPC.

### Events

- **Produces**: `safetyos.model.lifecycle.v1` (model version → deployment binding).
- **Consumes**: `safetyos.agent.decision.v1` (feedback loop), lakehouse-derived drift signals.

### Databases

- MLflow (registry) + Postgres + S3 (model artifacts, signed with Cosign).

### Everything else

- Standard defaults; SLO 99.9%; kill-switch reliability tracked separately at 99.99%.

---

## 3.37 `feature-store-service` (Service #37 — MODULE 25)

Owns: DP-013 … DP-016 (Feast-based feature store).

### Responsibilities

- Online (Redis) + offline (Delta) feature stores.
- Feature-definition registry; point-in-time correctness for training.
- Serves realtime features to CV, Compound Risk, PHM, RAG.

### APIs

- gRPC + REST.

### Everything else

- Standard defaults; SLO 99.95%, p99 online read ≤ 20 ms.

---

## 3.38 `observability-platform-service` (Service #38 — MODULE 27, OBS-001 … OBS-014)

Owns: OBS-001 … OBS-014 (Observability, SLO & Reliability Engineering).

### Responsibilities

- Prometheus + Mimir metrics.
- Loki logs.
- Tempo traces.
- Nobl9 / self-hosted SLO service (error budget tracking).
- Alertmanager routing → PagerDuty + Notification Router.

### APIs

- Grafana + APIs; internal.

### Everything else

- Standard defaults; SLO 99.99% (visibility during outages is essential).

---

## 3.39 `sim-backtest-service` (Service #39 — CR-024, MODULE 25)

Owns: CR-024 (pattern simulation & backtest linkage), PRED backtest.

### Responsibilities

- Replays historical Bronze data against candidate compound-risk patterns + PHM models.
- Provides labeled backtest artifacts required by policy for promoting a pattern to production.

### Everything else

- Standard defaults; batch workload, Spark-on-K8s.

---

## 3.40 `frame-retention-service` (Service #40)

Owns: CV-029 (frame retention policy) + evidence lifecycle.

### Responsibilities

- Stores encrypted video segments per-class retention policy.
- Manages legal hold + WORM promotion when an incident is opened.

### Everything else

- S3 Object Lock, Postgres index, standard defaults; SLO 99.95%.

---

## 3.41 `human-in-loop-broker` (Service #41 — AG-019, MODULE 12)

Owns: AG-019 (human-in-loop broker), the shared surface for any agent needing human confirmation.

### Responsibilities

- Presents agent-generated recommendations to on-shift humans via console + mobile.
- Times out non-response; escalates via notification-router.
- Records decision + rationale.

### Everything else

- Standard defaults; SLO 99.95%; latency-sensitive.

---

## 3.42 `search-service` (Service #42)

Owns: cross-module search (permits, incidents, contractors, assets).

### Responsibilities

- Unified search index (OpenSearch) with ACL enforcement.

### Everything else

- Standard defaults; SLO 99.9%.

---

## 3.43 `report-service` (Service #43)

Owns: canned reports (safety KPIs, permit throughput, compliance evidence) + scheduled distribution.

### Responsibilities

- Queries lakehouse Gold + Postgres, renders PDF/XLSX via headless Chromium + xlsxwriter, distributes via notification-router.

### Everything else

- Standard defaults; SLO 99.9%.

---

## 3.44 `esign-service` (Service #44)

Owns: COMP-011 (e-signature, 21 CFR Part 11-adjacent).

### Responsibilities

- Cryptographic e-signature (JWS over document hash + WebAuthn attestation).
- Manifests, signed with SafetyOS PKI, retained WORM.

### Everything else

- Standard defaults; SLO 99.95%; used by PTW, LOTO, INC.

---

## 3.45 `credentialing-service` (Service #45)

Owns: CON-005 … CON-014 (training records, badge, medicals).

### Responsibilities

- Verifies training currency, medical validity, insurance certs. Publishes `contractor.state.v1` deltas.

### Everything else

- Standard defaults; Postgres + S3 (docs) + integration to LMS via `integration-hub`.

---

## 3.46 `map-tile-service` (Service #46)

Owns: DT-005 (geospatial tile serving).

### Responsibilities

- CDN-fronted tile server for 2D basemaps + 3D overlays (companion to `digital-twin-service`).

### Everything else

- Standard defaults; heavy caching, SLO 99.9%.

---

## 3.47 `webhook-service` (Service #47)

Owns: EXT-* (external webhooks to customer systems).

### Responsibilities

- Delivers outbound webhooks with HMAC signing, exponential retry (30d envelope), replay UI.

### Everything else

- Standard defaults; SLO 99.9%.

---

## 3.48 `sre-runbook-service` (Service #48 — OBS-013)

Owns: OBS-013 (runbook automation).

### Responsibilities

- Executable runbooks (Rundeck-like) for common incident response (Kafka lag, DB failover, cert rotation).

### Everything else

- Standard defaults; break-glass only, dual-approval for destructive actions.

---

## 4. Dependency Graph (Summary)

```
                       ┌─────────────────────────────┐
                       │        policy-engine        │
                       │  (called by every service)  │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
   ┌──────────┐   ┌───────────┐   ┌─────────┐   ┌──────────────┐
   │  edge    │──▶│ cv-inference│─▶│ compound │─▶│ multi-agent  │
   │ gateway  │   │  gateway    │ │  risk    │  │ orchestrator │
   │ orchestr.│   └────┬────┬──┘  └────┬─────┘   └──────┬───────┘
   └──────────┘        │    │           │                │
                       ▼    ▼           ▼                ▼
                ┌───────┐ ┌──────┐  ┌──────────┐  ┌────────────┐
                │  KG   │ │ Twin │  │ Notif.   │  │  RAG       │
                └───┬───┘ └──────┘  │ Router   │  └──────┬─────┘
                    │               └──────────┘         │
     ┌──────────────┼─────────────────────────────┐      │
     ▼              ▼                             ▼      ▼
 ┌────────┐   ┌────────┐   ┌────────┐   ┌────────────┐   ┌──────────┐
 │  PTW   │─▶ │  LOTO  │   │Shift H.│   │ Incident   │   │Workflow  │
 └────────┘   └────────┘   └────────┘   └─────┬──────┘   │ Engine   │
                                              │           │ (Temporal│
                                              ▼           └──────────┘
                                        ┌────────────┐
                                        │ Emergency  │
                                        │ Response   │
                                        └────────────┘
                                              │
                                              ▼
                                   ┌───────────────────┐
                                   │  audit-sink /     │
                                   │  compliance /     │
                                   │  lakehouse (data) │
                                   └───────────────────┘
```

All services also depend on: `identity-service`, `feature-flag-service`, `tenant-service`, `observability-platform-service`, `audit-sink-service`.

---

## 5. Global SLO Tiers

| Tier | Availability | Latency (p99) | Services |
|---|---|---|---|
| **Tier 0 — Life-safety** | 99.99% | Function-specific | `emergency-response-orchestrator`, `notification-router` (ER path), `policy-engine` (sidecar path), `audit-sink-service` |
| **Tier 1 — Regulated** | 99.95% | ≤ 2 s | `ptw-service`, `loto-service`, `incident-service`, `compliance-service`, `esign-service`, `cv-inference-gateway`, `ot-ingestion-bridge`, `console-bff-service` |
| **Tier 2 — Core** | 99.9% | ≤ 3 s | Most others |
| **Tier 3 — Analytical** | 99.5% | ≤ 30 s | `lakehouse-service`, `sim-backtest-service`, `report-service` |

Every service declares its tier in its Helm chart (`slo.tier` label) and Grafana/Nobl9 auto-generates the SLO dashboard + error budget alerting from that label (OBS-006).

---

## 6. Global Deployment Topology

- **Regions**: 3 primary (US-East, EU-West, APAC-SE) + on-prem regional gateways for high-security tenants.
- **Multi-region posture**:
  - Tier 0 → active-active with quorum writes.
  - Tier 1 → active-passive with ≤15 s replication, automatic promotion on 60 s health failure.
  - Tier 2/3 → regional with warm DR (backup restore).
- **Namespaces per plane**: `plane-a-edge`, `plane-b-ot`, `plane-c-fusion`, `plane-d-risk`, `plane-e-workflows`, `plane-f-console`, `plane-g-comms`, `plane-h-security`, `plane-i-platform`, `plane-j-data`.
- **Service mesh**: Istio with mTLS enforced everywhere; east-west traffic locked to same-region unless explicit cross-region policy (data-locality per COMP-023).
- **Cluster sizing** (typical Fortune-500 tenant): ~2,000 vCPU / 8 TB RAM per region; GPU pool of 40 × A10G for CV + RAG; separate GPU pool of 8 × A100 for LLM serving.

---

## 7. Global Failure Recovery Playbook

| Scenario | Detection | Automated Response | Human Escalation |
|---|---|---|---|
| Kafka broker down | Producer lag alert (OBS-008) | Partition reassignment (auto); producer retries absorb | SRE paged if lag > 5 min |
| Kafka topic corrupt | Schema-validation errors | Consumer route to DLQ | SRE + owning-service team paged |
| Postgres primary down | Replication lag → Patroni failover | Failover in ≤ 30 s | SRE paged post-recovery |
| Region isolation | Multi-region health probe | GSLB drains region; Tier 0 auto-fails-over | SRE + Incident Commander paged |
| LLM provider outage | Model-router health signal | AG-017 routes to fallback | Product manager alert if degraded > 1 h |
| Policy bundle bad publish | Rego test failures at publish gate | Publish blocked | Policy admin paged |
| Model canary regression | CV-025 / DP-011 disagreement metric | AG-020 kill-switch → rollback | ML team paged |
| Certificate expiry approaching | 14/7/1-day alerts | Auto-renewal via cert-manager + SCEP | SRE paged on failure |
| S3 Object Lock write failure | Compliance alert | Retry with backoff; if persistent, dispatch WORM incident | Compliance + SRE paged, regulator disclosure timer starts |

---

## 8. Appendix — Service ↔ Feature ID Mapping (abbreviated)

| Service | Owning Feature IDs |
|---|---|
| cv-inference-gateway | CV-001 … CV-036 |
| edge-gateway-orchestrator | CV-025, CV-026, CV-027, CV-036 |
| pii-blur-service | CV-021 |
| ot-ingestion-bridge | OT-001 … OT-022, INT-001 |
| ot-alarm-adapter | (feeds AL-*) |
| iot-wearable-bridge | IOT-001 … IOT-018 |
| kg-service | KG-001 … KG-018 |
| digital-twin-service | DT-001 … DT-024 |
| entity-resolution-service | KG-005, KG-013 |
| compound-risk-engine | CR-001 … CR-027 |
| multi-agent-orchestrator | AG-001 … AG-020 |
| rag-service | RAG-001 … RAG-020 |
| phm-service | PRED-001 … PRED-018 |
| ptw-service | PTW-001 … PTW-022 |
| loto-service | LOTO-001 … LOTO-016 |
| shift-handover-service | SH-001 … SH-018 |
| incident-service | INC-001 … INC-030 |
| emergency-response-orchestrator | ER-001 … ER-018 |
| console-bff-service | UI-001 … UI-032 |
| mobile-bff-service | MOB-001 … MOB-024 |
| alarm-rationalization-service | AL-001 … AL-024 |
| compliance-service | COMP-001 … COMP-030 |
| contractor-service | CON-001 … CON-022 |
| notification-router | NOT-001 … NOT-020 |
| identity-service | SEC-001 … SEC-006 |
| policy-engine | WFP-003 |
| data-governance-service | SEC-007 … SEC-022 |
| audit-sink-service | SEC-018, OBS-002 |
| workflow-engine | WFP-001, WFP-004 |
| rule-engine-service | WFP-006 |
| feature-flag-service | WFP-008 |
| tenant-service | PLT-001 … PLT-018 |
| integration-hub | INT-001 … INT-024 |
| devx-service | PLT-015 … PLT-018 |
| lakehouse-service | DP-001 … DP-016 |
| mlops-control-plane | DP-005 … DP-012 |
| feature-store-service | DP-013 … DP-016 |
| observability-platform-service | OBS-001 … OBS-014 |
| sim-backtest-service | CR-024 |
| frame-retention-service | CV-029 |
| human-in-loop-broker | AG-019 |
| search-service | (cross-module) |
| report-service | (cross-module) |
| esign-service | COMP-011 |
| credentialing-service | CON-005 … CON-014 |
| map-tile-service | DT-005 |
| webhook-service | EXT-* |
| sre-runbook-service | OBS-013 |

---

**END OF BACKEND SERVICE SPECIFICATION v1.0**
