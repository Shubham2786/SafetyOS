# Master Feature Specification vNext

**Document Version:** 1.1 (patch on top of v1.0)
**Status:** Engineering Patch — Drop-in Replacement Modules
**Baseline:** SafetyOS Master Feature Specification v1.0 (466-feature canonical)
**Patch Scope:** Surgical improvements only. Modules not listed here inherit v1.0 unchanged.
**Classification:** Confidential — Engineering Blueprint

---

## Change Summary

### New Modules Added
- **MODULE 25 — DATA PLATFORM, LAKEHOUSE & MLOps CONTROL PLANE** — inserted between MODULE 24 (Platform, Admin & DevX) and the closing appendices. Baseline v1.0 uses a `ML-*` prefix inside Module 21 ("Data Platform & MLOps") for the 1–16 index and inside various modules for the expanded 17–24 delivery, but there is no single canonical module owning the AI/ML control plane. This gap is closed here **without renumbering existing modules** by adding a new terminal module.
- **MODULE 26 — WORKFLOW, RULE & POLICY ENGINE (SHARED SUBSTRATE)** — inserted after MODULE 25. The PTW, LOTO, ER, Incident, and Compound Risk modules each assume Temporal + OPA + a rule engine but no module owns the shared substrate. This module makes the substrate a first-class product surface.
- **MODULE 27 — OBSERVABILITY, SLO & RELIABILITY ENGINEERING** — inserted after MODULE 26. Observability is currently scattered across CV-022, AG-015, OT-020, and PLT-*; a consolidated SRE module is required for Fortune-500 operability.

### Modules Replaced
- **MODULE 1 — Computer Vision & Edge Perception** — replaced. Adds explicit event contracts, backend/frontend ownership, telemetry, feature flags, SLOs, rollout strategy, and closes gaps on gas-detector fusion, PPE grace-period, and camera-cyber-hardening (CV-033–CV-036).
- **MODULE 4 — Compound Risk Detection Engine** — replaced. Adds event schema for `CompoundRisk.v2`, pattern DSL versioning, sim/backtest linkage, and 3 missing patterns (CR-025 dropped-object, CR-026 pyrophoric-exposure, CR-027 wrong-line-break).
- **MODULE 8 — Incident Management & RCA** — replaced. Adds action-tracker SLA telemetry, ISO 45001 CAPA workflow, insurer/reg event bus contracts, and re-ID handling under legal hold.
- **MODULE 12 — Multi-Agent Reasoning Layer** — replaced (also fixes the duplicated "MODULE 12 (continued)" header that exists in v1.0). Adds AG-017 model-router agent, AG-018 uncertainty-quantification service, AG-019 human-in-loop broker, and AG-020 rollback/kill-switch.

### Features Added
- CV-033 — Gas Detector ↔ CV Fire Cross-Validation Layer
- CV-034 — PPE Grace-Period & Task-Context Suppression
- CV-035 — Camera Cyber-Hardening (ONVIF Profile-Q / Signed Firmware)
- CV-036 — Edge Node Fleet Health & Silent-Failure Detection
- CR-025 — Dropped Object from Height Compound Pattern
- CR-026 — Pyrophoric / Water-Reactive Exposure Pattern
- CR-027 — Wrong Line-Break Against P&ID Isolation
- INC-021 — CAPA (Corrective & Preventive Action) Workflow — ISO 45001 §10.2
- INC-022 — Incident-Playback Digital Twin Snapshot
- INC-023 — Trauma-Informed Notification & Support Workflow (replaces the earlier scoping of INC-018 as a standalone note)
- AG-017 — Model Router Agent (Cost/Latency/Groundedness routing)
- AG-018 — Uncertainty Quantification Service (calibration for all AI-facing outputs)
- AG-019 — Human-in-Loop Broker (async decision handoff SLA)
- AG-020 — Global AI Kill-Switch & Model Rollback
- PLAT-* series — see MODULE 25 (16 features, DP-001…DP-016)
- WFP-* series — see MODULE 26 (12 features)
- OBS-* series — see MODULE 27 (14 features)

### Features Removed
- **None.** Preservation principle applied: no baseline feature is deleted.

### Features Moved
- No IDs re-assigned. Where a feature logically belongs to a shared substrate (e.g. the OPA policy engine implicitly used by AG-003, PTW-003, LOTO-002, ER-002), the substrate feature is now defined once in MODULE 26 and the dependent features declare the dependency explicitly. Feature IDs are preserved.

### Metadata Fields Added
Every feature in the replaced/new modules carries the improved template:

`Consumes · Produces · Event Types · API References · Appears On Screens · Backend Service · Frontend Components · Telemetry · Logging · Feature Flag · Rollout Strategy · SLA / SLO · Cost Impact · AI Cost · Infrastructure Cost · Owner · Epic · Sprint · Story Points · Technical Risk · Business Risk`

The 12 original fields (Module, Description, User Personas, Business Problem, AI Components, Required Data, UX Notes, Acceptance Criteria, Dependencies, Priority, Estimated Complexity, Demo Value) are **retained unchanged**.

For unmodified modules (2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24) engineering teams should adopt the improved template *incrementally* per Epic; the canonical baseline is unchanged so as not to invalidate v1.0 sign-off.

### Architectural Improvements
1. **Event architecture is now explicit.** A single canonical event catalog (see MODULE 26 §WFP-002) replaces implicit "Kafka topic per module".
2. **Human-in-Loop is a first-class service**, not a per-feature UX note. AG-019 provides a shared broker with SLA, escalation ladder, and audit chain reused by CR, PTW, LOTO, ER, and INC.
3. **AI Kill-Switch** at model, tenant, and global scope (AG-020) — required by EU AI Act Article 14 for high-risk AI.
4. **Uncertainty is quantified consistently** (AG-018) instead of per-feature ad-hoc confidence.
5. **Observability, SLO, and cost telemetry** are consolidated in MODULE 27, and every replaced feature declares its own SLO + telemetry contract.
6. **Data lakehouse and MLOps** get a canonical owner (MODULE 25) — closing the gap between ML-001…016 references and the actual delta/iceberg/feature-store substrate they assume.
7. **Backend/frontend ownership** is explicit for every replaced feature — implementation teams can now be assigned without further clarification.

---

## Change Annotations & Replacement Modules

---

### REPLACES MODULE 1 — COMPUTER VISION & EDGE PERCEPTION

**Reason for replacement:**
- Original v1.0 lists 32 CV features but the compact-format template omits event contracts, backend/frontend ownership, and SLOs.
- Three enterprise-grade gaps identified: (a) fixed gas-detector fusion is referenced in CV-011 but never a first-class feature; (b) PPE grace-period suppression is required to survive union review and is missing; (c) camera cyber-hardening (ONVIF Profile-Q, signed firmware) is missing despite Colonial-Pipeline-class risk.
- No IDs renumbered. CV-001…CV-032 preserved; CV-033…CV-036 appended.

---

## MODULE 1 — COMPUTER VISION & EDGE PERCEPTION

**Module description (unchanged from v1.0).** Real-time perception layer running on Jetson AGX Orin (or equivalent) edge nodes. All safety-critical inference is edge-local; cloud is receipt-only. Face blur (CV-021) is a legal-hard requirement — no CV feature ships without it.

**Module-level updated dependencies:**
`SEC-014 (face blur)` — hard dependency of every visual feature ·
`ML-004, ML-005, ML-006` — model registry, signing, canary ·
`MODULE 26 §WFP-002` — canonical event bus for `cv.event.v2` and `cv.violation.v2` ·
`MODULE 27 §OBS-003` — RED metrics on every inference endpoint ·
`OT-011` — timescale storage for observation stream

**Module-level SLO:** p99 event-to-alert ≤ 3s end-to-end · edge-inference p99 ≤ 250ms · recall regression gate ≤ 0.5% (blocks promotion).

### CV-001 — Hardhat Detection
- **Description:** Real-time detection of workers with/without hardhats using YOLOv8m deployed on edge (Jetson AGX Orin), TensorRT INT8, ByteTrack tracker; color-agnostic; worker anchored via CV-007.
- **User Personas:** Ravi, Sanjay, Deepak
- **Business Problem:** Missing hardhats are a leading OSHA-cited PPE violation and a top SIF precursor; manual CCTV monitoring is impossible at scale.
- **AI Components:** `ppe-yolov8m-v3.2`, TensorRT INT8, ByteTrack
- **Required Data:** RTSP 1080p @ 15fps min · ≥50k labeled frames · zone geometry · homography from CV-024
- **UX Notes:** Violation on L2 console with bounding-box snapshot + face-blurred crop; `Why?` reveals confidence, detection metadata, and grace-period state from CV-034.
- **Acceptance Criteria:** Recall ≥99.2% @ IoU 0.5 · Precision ≥92% · edge p99 ≤ 250ms · demographic parity ±2%.
- **Dependencies:** CV-007, CV-021, CV-024, CV-034, DT-002, MODULE 27 §OBS-003
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐⭐
- **Consumes:** `camera.frame.v1`, `zone.geometry.v1`, `worker.presence.v1`
- **Produces:** `cv.event.v2` (`type=ppe_violation`, `sub=hardhat`), `cv.evidence.v1` (face-blurred crop)
- **Event Types:** `cv.event.v2`, `cv.violation.v2`
- **API References:** `POST /v2/cv/events` (edge → cloud, mTLS) · `GET /v2/cv/violations?zone={id}`
- **Appears On Screens:** UI-006 Live Compound Risk Feed · UI-003 Level-2 Unit Overview · MOB-021 Field Hazard Report
- **Backend Service:** `cv-edge-runtime`, `cv-event-ingest`, `evidence-store`
- **Frontend Components:** `ViolationCard`, `EvidenceModal`, `BoundingBoxOverlay`
- **Telemetry:** `cv.hardhat.recall_rolling_24h`, `cv.hardhat.fp_per_camera_day`, `cv.hardhat.latency_p50/p99`, `cv.hardhat.demographic_parity_delta`
- **Logging:** Structured JSON per inference; PII scrubbed at edge; retention T7 for non-violation, T365 for violation.
- **Feature Flag:** `cv.hardhat.enabled` (per-tenant, per-camera)
- **Rollout Strategy:** Shadow 7 days (CV-025) → 10% cameras → 100% ; gated on CV-030 fairness panel.
- **SLA / SLO:** p99 latency ≤ 250ms edge · availability 99.9% · MTTR ≤ 15min for edge node failure
- **Cost Impact:** ~1 GPU-hour / camera / month
- **AI Cost:** Inference-only; no LLM.
- **Infrastructure Cost:** ~$0.04 / camera / hour edge amortized
- **Owner:** CV Platform Squad · **Epic:** EPIC-CV-PPE · **Sprint:** S1–S2 · **Story Points:** 21
- **Technical Risk:** LOW (mature model) · **Business Risk:** MEDIUM (union relations if grace period tuned wrong)

### CV-002 — Safety Vest Detection
- (Baseline v1.0 fields preserved.) **Adds:** Produces `cv.event.v2(sub=vest)`; consumes `zone.vest_required.v1`; SLO recall ≥ 98%; Feature Flag `cv.vest.enabled`; Backend `cv-edge-runtime`; Owner CV Platform Squad; Rollout: shadow 7d → 25% → 100%; Technical Risk LOW.

### CV-003 — Safety Glasses Detection
- (Baseline preserved.) **Adds:** face-keypoint gate MUST run edge-local and never send face crops to cloud; Consumes `face.keypoint.v1`; Feature Flag `cv.glasses.enabled`; Backend `cv-edge-runtime`.

### CV-004 — Gloves Detection
- (Baseline preserved.) **Adds:** MUST couple with CV-034 task-context grace-period; Backend `cv-edge-runtime`; Feature Flag `cv.gloves.enabled`.

### CV-005 — Face Shield / Welding Mask Detection
- (Baseline preserved.) **Adds:** Consumes `ptw.active.v1` for hot-work correlation; Produces `cv.violation.v2(sub=face_shield, severity=critical_when_ptw_active)`; Dependency +PTW-001 explicit.

### CV-006 — Fall Arrest Harness Detection at Height
- (Baseline preserved.) **Adds:** SLO p99 alert ≤ 5s (worker-safety-critical); Feature Flag cannot be disabled at tenant level without CSO sign-off (encoded in AG-004 capability token).

### CV-007 — Person Detection & Anchor Tracking
- (Baseline preserved.) **Adds:** Produces `worker.presence.v1` — the canonical anchor event consumed by CV-001…CV-020 and DT-003; Owner CV Platform Squad — Foundation.

### CV-008 — Forklift & MHE Detection
- (Baseline preserved.) **Adds:** Produces `mhe.presence.v1`; Backend `cv-edge-runtime`; used by CV-009, CV-020, DT-004.

### CV-009 — Pedestrian-in-Vehicle-Lane Detection
- (Baseline preserved.) **Adds:** SLO time-to-alert ≤ 500ms — hard requirement; must integrate cabin display via `EXT/INT` (Module 23) forklift telematics.

### CV-010 — Slip/Trip/Fall Action Recognition
- (Baseline preserved.) **Adds:** Produces `incident.autodraft.v1` on positive detection (consumed by INC-001 auto-open); ≤2 FP/site/day gate.

### CV-011 — Fire Detection
- (Baseline preserved.) **Adds:** MUST cross-validate against fixed gas / IR detectors via CV-033 before any CRITICAL escalation; sole-source visual fire cannot trigger ER-002. Feature Flag `cv.fire.enabled`.

### CV-012 — Smoke Detection
- (Baseline preserved.) **Adds:** feeds DT-006 plume model within 3s of detection.

### CV-013 — Restricted/Exclusion Zone Breach
- (Baseline preserved.) **Adds:** Consumes `role.authorization.v1` from KG-006; suppresses during scheduled maintenance windows via WFP-* policy layer.

### CV-014 — Confined Space Entry Detection
- (Baseline preserved.) **Adds:** Cross-check ≤ 2s against `ptw.confined_space.active.v1`; auto-page supervisor via AG-019 broker.

### CV-015 — Lone Worker Detection
- (Baseline preserved.) **Adds:** Suppression window configurable per zone; feature flag per zone; Produces `worker.lone.v1` consumed by CR-009.

### CV-016 — Ergonomic Posture Detection
- (Baseline preserved.) **Adds:** MUST aggregate-only — never per-worker real-time; union transparency requirement encoded in CV-031 map.

### CV-017 — Vehicle License Plate Recognition (Site Ingress)
- (Baseline preserved.) **Adds:** OCR-derived plate strings hashed at edge; raw plate images purged T7 unless linked to incident. Dependency +SEC-014.

### CV-018 — Spill/Leak Visual Detection
- (Baseline preserved.) **Adds:** Auto-creates work order via OT-015 CMMS connector; material-type inferred via KG-009.

### CV-019 — Blocked Egress/Fire Exit Detection
- (Baseline preserved.) **Adds:** Blocks ER-005 route calculation on affected corridor; Feature Flag CANNOT be disabled (encoded in AG-004).

### CV-020 — Crane Load Path & Suspended Load Zone Breach
- (Baseline preserved.) **Adds:** SLO time-to-alert ≤ 750ms; cabin audible warning via IOT-007 dependency.

### CV-021 — PII Face Blur at Edge
- (Baseline preserved.) **Adds:** **Non-negotiable dependency of every CV feature that egresses imagery.** Blur rate reported as a first-class KPI on the auditor portal (UI-019). Feature Flag: `cv.face_blur.enabled` **has no OFF value** — encoded in AG-004 as a hard capability prohibition.

### CV-022 — Camera Health Monitoring
- (Baseline preserved.) **Adds:** Feeds MODULE 27 §OBS-005 fleet-health dashboard; auto-CMMS ticket via OT-015.

### CV-023 — Multi-Camera Handoff / Re-ID
- (Baseline preserved.) **Adds:** Embeddings TTL 60min unless legal hold via INC-017; explicit **no biometric identification** — encoded in AG-004.

### CV-024 — Homography Calibration Tool
- (Baseline preserved.) **Adds:** Calibration bundles signed via SEC-007; re-calibration required after camera physical move (detected by CV-022).

### CV-025 — Model Canary & Shadow Mode Deployment
- (Baseline preserved.) **Adds:** Shadow mode MUST run 7 days minimum; promotion requires (a) CV-030 fairness pass, (b) HSE + Applied AI + CSO sign-off (recorded via WFP-006 approval workflow).

### CV-026 — Edge Model Signed Bundle Distribution
- (Baseline preserved.) **Adds:** Cosign verification enforced at load; rollback ≤ 5min; bundle SBOM required.

### CV-027 — Local Event Store-and-Forward
- (Baseline preserved.) **Adds:** SLO zero event loss over 24h partition; catch-up ≤ 30min post reconnect.

### CV-028 — Thermal/IR Camera Fusion (Optional Hardware)
- (Baseline preserved.) **Adds:** Optional; only sites with SIL 2+ hot-work operations should enable.

### CV-029 — Frame Retention Policy by Class
- (Baseline preserved.) **Adds:** WORM audit log; jurisdiction policy table lives in MODULE 19 §COMP-*.

### CV-030 — Bias Fairness Test Panel
- (Baseline preserved.) **Adds:** Gate: parity delta ≤ 2%; failure blocks promotion via CV-025; report signed via SEC-007.

### CV-031 — Union-Transparent Camera Map
- (Baseline preserved.) **Adds:** Change to any camera analytics config triggers notification to designated union rep contact within 15min (encoded in NOT-* channel).

### CV-032 — Synthetic Data Augmentation Pipeline
- (Baseline preserved.) **Adds:** Synthetic-to-real drift measured every model version; ≥15% recall lift on rare classes.

### CV-033 — Gas Detector ↔ CV Fire/Smoke Cross-Validation Layer (NEW)
- **Description:** Fuses fixed gas detectors, IR/thermal sensors, and CV-011/CV-012 outputs; a CV-only fire signal cannot trigger CRITICAL escalation without a corroborating physical sensor within a configurable time+space window. Reduces welding-arc / process-steam false positives that would otherwise trigger ER-002.
- **User Personas:** Anita, ER Team, Neha
- **Business Problem:** Welding arcs and process steam are chronic false-positive sources for CV fire/smoke. A confirmed physical corroboration is a hard requirement for auto-escalation defensibility.
- **AI Components:** Bayesian evidence-fusion classifier
- **Required Data:** Gas detector taxonomy (KG-009), thermal sensor topology, fire alarm panel bridge (INT/EXT)
- **UX Notes:** L2 alarm panel shows "CV-only / CV+Gas / Gas-only" badges; only CV+Gas or Gas-only escalates.
- **Acceptance Criteria:** FP rate drops ≥ 60% vs. CV-only baseline; missed-detection ≤ 0.5% on labeled fire corpus.
- **Dependencies:** CV-011, CV-012, IOT-004, OT-006
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `cv.event.v2(fire|smoke)`, `sensor.gas.v1`, `sensor.thermal.v1`, `fire_panel.event.v1`
- **Produces:** `emergency.trigger.candidate.v1`
- **Event Types:** `emergency.trigger.candidate.v1`, `emergency.trigger.confirmed.v1`
- **API References:** `POST /v2/emergency/trigger/candidate`
- **Appears On Screens:** UI-006 (badge) · UI-008 (alarm panel)
- **Backend Service:** `signal-fusion-service`
- **Frontend Components:** `TriggerConfidenceBadge`
- **Telemetry:** `fusion.fp_rate`, `fusion.time_to_confirm`, `fusion.cv_only_rejected_count`
- **Logging:** Full evidence chain per trigger; WORM.
- **Feature Flag:** `fusion.gas_cv.enabled`
- **Rollout Strategy:** Enabled by default at v1; disabling requires CSO sign-off.
- **SLA / SLO:** Trigger decision ≤ 3s from first signal
- **Owner:** Compound Risk Squad · **Epic:** EPIC-ER-FUSION · **Sprint:** S3 · **Story Points:** 13
- **Technical Risk:** MEDIUM · **Business Risk:** HIGH (missing a real fire is catastrophic — hence "missed ≤ 0.5%")

### CV-034 — PPE Grace-Period & Task-Context Suppression (NEW)
- **Description:** Configurable grace period (e.g. 30s) after a worker enters a PPE-required zone before a violation is escalated; also suppresses violations during task states where PPE is not applicable (e.g. donning area, break room adjacent to zone).
- **User Personas:** Sanjay, Union Reps, Deepak
- **Business Problem:** Zero-grace enforcement creates nuisance alarms during legitimate entries and provokes workforce rejection; grace period is a common industry practice (Intenseye, Protex AI).
- **AI Components:** Rule engine + task-context classifier
- **Required Data:** Zone-entry transitions, task activity classes
- **UX Notes:** Grace state visible on `Why?` panel; timer countdown shown to supervisor. Grace-period value is versioned and audited.
- **Acceptance Criteria:** ≥ 60% nuisance-alarm reduction vs. zero-grace baseline in shadow mode without missing real violations >5s.
- **Dependencies:** CV-001, CV-002, CV-006, DT-002, WFP-004 (rule engine)
- **Priority:** Must · **Complexity:** S · **Demo Value:** ⭐⭐⭐
- **Consumes:** `worker.presence.v1`, `zone.entry.v1`, `task.context.v1`
- **Produces:** `ppe.grace.state.v1`
- **Event Types:** `ppe.grace.applied.v1`, `ppe.grace.expired.v1`
- **API References:** `GET /v2/ppe/grace/config` · `PATCH /v2/ppe/grace/config` (dual-sign-off)
- **Appears On Screens:** UI-006 (grace badge), UI-007 (explanation)
- **Backend Service:** `ppe-rule-engine`
- **Feature Flag:** `ppe.grace.enabled`
- **Rollout Strategy:** Enabled with 30s default; per-tenant override requires HSE approval.
- **SLA / SLO:** Grace state evaluated ≤ 100ms
- **Owner:** CV Platform Squad · **Epic:** EPIC-CV-PPE · **Sprint:** S2 · **Story Points:** 8
- **Technical Risk:** LOW · **Business Risk:** HIGH (misconfig can mask real violations)

### CV-035 — Camera Cyber-Hardening (ONVIF Profile-Q / Signed Firmware) (NEW)
- **Description:** Certified integration with cameras that support ONVIF Profile-Q (secure onboarding), signed firmware, and per-camera cert-based authentication; rejection of unsigned firmware; enforced non-default credentials.
- **User Personas:** Neha, Arjun
- **Business Problem:** Off-the-shelf IP cameras are a top ICS breach vector (Mirai, Verkada); IEC 62443-4-2 requires component-level hardening.
- **AI Components:** N/A
- **Required Data:** Camera inventory, cert store
- **UX Notes:** Admin console shows hardening status per camera; unhardened cameras cannot feed safety-critical detectors.
- **Acceptance Criteria:** 100% of safety-critical cameras hardened; SBOM per firmware version.
- **Dependencies:** SEC-002, SEC-006, OT-016
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Consumes:** `camera.inventory.v1`
- **Produces:** `camera.hardening.state.v1`
- **API References:** `GET /v2/cameras/hardening`
- **Appears On Screens:** Admin console (PLT-*), UI-019 auditor portal
- **Backend Service:** `camera-fleet-mgmt`
- **Feature Flag:** `cv.hardening.enforce` (default ON in production)
- **SLA / SLO:** New camera onboarded to hardened state ≤ 15min
- **Owner:** Security Squad · **Epic:** EPIC-SEC-EDGE · **Sprint:** S4 · **Story Points:** 13
- **Technical Risk:** MEDIUM · **Business Risk:** HIGH (camera compromise contaminates the entire safety layer)

### CV-036 — Edge Node Fleet Health & Silent-Failure Detection (NEW)
- **Description:** Detects silent edge-node failures (heartbeat present but inference degraded, thermal throttling, GPU-driver stall). Complements CV-022 which is camera-side; this is compute-side.
- **User Personas:** Arjun, SRE
- **Business Problem:** A silently degraded edge node creates the illusion of safety while the plant is unmonitored — this is the single most dangerous CV failure mode.
- **AI Components:** Statistical anomaly detection on inference throughput + confidence
- **Required Data:** Edge telemetry stream
- **UX Notes:** Fleet dashboard with per-node inference health; auto-page SRE on regression.
- **Acceptance Criteria:** Silent-failure detection ≤ 5min from onset; false-alarm ≤ 1/node/month.
- **Dependencies:** CV-022, OBS-005
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Consumes:** `edge.telemetry.v1`
- **Produces:** `edge.health.v1`, `edge.silent_failure.v1`
- **API References:** `GET /v2/edge/health`
- **Appears On Screens:** OBS fleet dashboard, PLT admin
- **Backend Service:** `edge-fleet-health`
- **SLA / SLO:** Silent failure detection ≤ 5min
- **Owner:** SRE + CV Platform · **Epic:** EPIC-OBS-EDGE · **Sprint:** S3 · **Story Points:** 13
- **Technical Risk:** MEDIUM · **Business Risk:** HIGH

---

### REPLACES MODULE 4 — COMPOUND RISK DETECTION ENGINE

**Reason for replacement:**
- Baseline v1.0 defines 24 patterns but no formal Pattern DSL versioning, no shadow/backtest linkage in the metadata, and no event contract for the `CompoundRisk` node type — leaving downstream consumers (UI, NOT, PTW, LOTO) coupled implicitly.
- Three high-value patterns missing that Honeywell / Hazop practice consistently flag: dropped object from height, pyrophoric exposure, wrong line-break vs. P&ID isolation.
- Formal DSL, versioning, and event schema added; new IDs CR-025…CR-027 appended.

---

## MODULE 4 — COMPOUND RISK DETECTION ENGINE

**Module description (extends v1.0):** Pattern-based reasoning over the fused KG. Every pattern is a versioned artifact (Cypher + rule metadata + severity + citations + counterfactual template) that flows through a mandatory shadow → canary → GA lifecycle. Every CompoundRisk node produced carries the ExplanationBundle contract and a regulatory citation.

**Module-level event contract (`CompoundRisk.v2`):**
```
{
  "risk_id": "cr_...",
  "pattern_id": "CR-002",
  "pattern_version": "1.4.0",
  "severity": "critical|high|medium|low",
  "confidence": 0.0-1.0,
  "uncertainty": {"epistemic": ..., "aleatoric": ...},
  "evidence": [ { "event_id", "source", "ts", "chain_of_custody" } ],
  "counterfactual": "If LEL had stayed <5%, this would be MONITOR only.",
  "citations": [ { "doc": "OISD-105", "clause": "9.2.3" } ],
  "recommended_actions": [ { "actor": "supervisor", "action": "suspend_permit", "gate": "human_required" } ],
  "explanation_bundle_uri": "..."
}
```

**Module-level updated dependencies:**
`KG-002, KG-004, KG-010, KG-011` · `WFP-004` (rule engine) · `AG-018` (uncertainty) · `AG-019` (human-in-loop broker) · `RAG-002` (citation) · `MODULE 27 §OBS-*`.

### CR-001 — Compound Risk Pattern Registry
- (Baseline preserved.) **Adds:** Patterns are versioned SemVer; hot-reload safe; every pattern carries `pattern_version` in produced events. Backend `pattern-registry-service`.

### CR-002 — Hot-Work + Rising LEL Adjacent Pattern
- (Baseline preserved.) **Adds:** Produces `CompoundRisk.v2 (pattern=CR-002)`; consumes `ptw.hot_work.active.v1`, `sensor.gas.v1`; SLO detection ≤ 3s of trigger; recommended action gated by AG-019.

### CR-003 — Confined Space Entry During Unit Startup
- (Baseline preserved.) **Adds:** Consumes `dcs.unit.mode.v1`; severity CRITICAL; auto-notify via AG-019 with 30s escalation.

### CR-004 — LOTO Removed + Equipment Command Detected
- (Baseline preserved.) **Adds:** SLO detection ≤ 2s; must produce `emergency.trigger.candidate.v1` to CV-033 fusion.

### CR-005 — Forklift + Pedestrian in Aisle During Shift Change
- (Baseline preserved.)

### CR-006 — Confined Space Entry With Overdue Gas Detector Calibration
- (Baseline preserved.) **Adds:** Blocks PTW-003 state transition (`approve`) via WFP-004 policy.

### CR-007 — Incomplete Shift Handover With Open Critical Alarm
- (Baseline preserved.) **Adds:** Blocks SH-002 close via WFP-004.

### CR-008 — Outdoor Hot Work + High Wind + Adjacent Flammable Inventory
- (Baseline preserved.)

### CR-009 — Lone Worker + Confined Space + Communications Loss
- (Baseline preserved.) **Adds:** SLO alert ≤ 60s of comms loss; auto-page via AG-019.

### CR-010 — High Heat Stress + Heavy Exertion
- (Baseline preserved.)

### CR-011 — Fire/Smoke Event + Blocked Egress Route
- (Baseline preserved.)

### CR-012 — Multiple Simultaneous Hot-Work Permits Near Common Vessel
- (Baseline preserved.)

### CR-013 — Uncertified Worker Executing Certified-Only Task
- (Baseline preserved.)

### CR-014 — Compound Risk Scoring Function
- (Baseline preserved.) **Adds:** Uses AG-018 for calibrated uncertainty; Brier score gate ≤ 0.15.

### CR-015 — Predictive Lead-Time Measurement
- (Baseline preserved.) **Adds:** Median lead time ≥ 8min replay gate.

### CR-016 — Human-in-Loop Confirmation Workflow
- (Baseline preserved.) **Adds:** Delegates to AG-019 broker (was previously per-pattern ad-hoc).

### CR-017 — Counterfactual "What-If" Explanation
- (Baseline preserved.)

### CR-018 — Pattern Library Governance & Approval Workflow
- (Baseline preserved.) **Adds:** 3-role sign-off encoded in WFP-006 approval workflow; SEC-007 signed.

### CR-019 — Shadow Mode Evaluation Framework
- (Baseline preserved.) **Adds:** Mandatory 7-day shadow; promotion gated on FP rate + AG-018 calibration.

### CR-020 — Compound Risk Timeline & Playback
- (Baseline preserved.)

### CR-021 — Cross-Site Pattern Learning (Federated)
- (Baseline preserved.)

### CR-022 — Custom Pattern Authoring UI
- (Baseline preserved.) **Adds:** Uses Pattern DSL (declared in CR-001), NL-to-Cypher assistance via RAG-002; test-on-history via CR-019.

### CR-023 — Alarm Storm Prediction
- (Baseline preserved.)

### CR-024 — Regulatory Citation on Every Risk
- (Baseline preserved.) **Adds:** Groundedness ≥ 95% gate; 100% risks carry citations.

### CR-025 — Dropped Object from Height Compound Pattern (NEW)
- **Description:** Detects (worker at height) + (loose material within drop zone below) + (workers in drop zone below) via CV-006, CV-007, spatial polygons and load-manifest of active work-at-height PTW.
- **User Personas:** Sanjay, Deepak, ER Team
- **Business Problem:** Dropped objects account for ~10% of struck-by fatalities on OSHA Focus Four; today they are entirely reactive.
- **AI Components:** Spatial reasoning over CV + KG
- **Required Data:** Height zone polygons (DT-002), drop-zone polygons, active work-at-height PTWs
- **UX Notes:** HIGH severity; audible cabin/PA warning in drop zone.
- **Acceptance Criteria:** Detection ≤ 2s; ≤ 1 FP/site/day.
- **Dependencies:** CV-006, CV-007, DT-002, PTW-004
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐⭐
- **Consumes:** `worker.presence.v1`, `ptw.work_at_height.v1`
- **Produces:** `CompoundRisk.v2 (pattern=CR-025)`
- **Owner:** Compound Risk Squad · **Epic:** EPIC-CR-STRUCK · **Sprint:** S5 · **Story Points:** 13
- **SLA / SLO:** Detection ≤ 2s
- **Technical Risk:** MEDIUM · **Business Risk:** HIGH

### CR-026 — Pyrophoric / Water-Reactive Exposure Pattern (NEW)
- **Description:** Line-break / vessel-open PTW on process line containing pyrophoric (FeS) or water-reactive material without inert-purge verification.
- **User Personas:** Anita, Deepak
- **Business Problem:** Pyrophoric ignitions cause routine refinery incidents (BP Texas City precursor class).
- **AI Components:** KG process-fluid taxonomy join
- **Required Data:** Line-fluid registry (KG-005), inert-purge verification via OT-006
- **UX Notes:** Blocks PTW approval until inert-purge confirmed.
- **Acceptance Criteria:** 100% detection when line contains pyrophoric fluid and no purge confirmed.
- **Dependencies:** KG-005, PTW-004, OT-006
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `ptw.line_break.v1`, `process.fluid.v1`, `sensor.o2.v1`
- **Produces:** `CompoundRisk.v2 (pattern=CR-026)`
- **Owner:** Compound Risk Squad · **Epic:** EPIC-CR-CHEM · **Sprint:** S6 · **Story Points:** 13
- **Technical Risk:** LOW · **Business Risk:** HIGH

### CR-027 — Wrong Line-Break Against P&ID Isolation (NEW)
- **Description:** Correlates worker-declared line-break location with P&ID connectivity + active isolations; if worker is opening a line whose isolation is not the one declared active in LOTO, raises CRITICAL.
- **User Personas:** Sanjay, Vikram
- **Business Problem:** Wrong-line breaks are among the top three worker-fatality precursors during turnarounds.
- **AI Components:** Graph traversal on P&ID + LOTO state
- **Required Data:** P&ID connectivity graph, LOTO state, worker declared location (via MOB-012 QR scan)
- **UX Notes:** CRITICAL; blocks physical entry via IOT/access-control if integrated.
- **Acceptance Criteria:** Zero missed detections in fault-injection tests on turnaround scenarios.
- **Dependencies:** KG-005, LOTO-001, MOB-012
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐⭐⭐⭐
- **Consumes:** `loto.state.v1`, `worker.declared_location.v1`
- **Produces:** `CompoundRisk.v2 (pattern=CR-027)`
- **Owner:** Compound Risk Squad + LOTO Squad · **Epic:** EPIC-CR-TURNAROUND · **Sprint:** S7 · **Story Points:** 21
- **Technical Risk:** MEDIUM · **Business Risk:** HIGH

---

### REPLACES MODULE 8 — INCIDENT MANAGEMENT & RCA

**Reason for replacement:**
- Baseline v1.0 has strong core (INC-001…INC-020) but the CAPA loop is implicit inside INC-008; ISO 45001 §10.2 requires explicit CAPA with effectiveness verification.
- Legal-hold + re-ID (CV-023) intersection is not addressed — a real gap uncovered during audit rehearsal.
- INC-018 (family notification) is renamed to make trauma-informed workflow explicit.
- Baseline events INC-001…INC-020 preserved; INC-021…INC-023 added.

---

## MODULE 8 — INCIDENT MANAGEMENT & RCA

**Module description (unchanged):** End-to-end incident lifecycle from capture through RCA, CAPA, and lessons-learned. All incident evidence is preserved with chain-of-custody (OT-017, SEC-011) and can be placed on legal hold (INC-017).

**Module-level dependencies:** SEC-011, INC-017, OT-017, KG-010, WFP-006 (approval), AG-019 (human-in-loop broker).

*(INC-001…INC-020 baseline preserved verbatim with the following metadata additions applied module-wide: Consumes, Produces, Event Types, Backend Service, Owner, SLA/SLO, Telemetry, Feature Flag, Rollout Strategy — see per-feature adds below.)*

- **INC-001 — Native Incident Reporting Form:** Produces `incident.created.v1`; Backend `incident-service`; SLA time-to-file ≤ 5min.
- **INC-002 — Near-Miss Fast-Capture Flow:** Produces `near_miss.reported.v1`; SLA ≤ 30s submit; anonymous mode enforced via SEC-004.
- **INC-003 — Automatic Evidence Bundle Assembly:** Produces `evidence.bundle.v1`; SLA bundle ≤ 5min.
- **INC-004 — Incident Severity Classification.**
- **INC-005 — Timeline Reconstruction View.**
- **INC-006 — GNN-Based RCA Hypothesis Generator:** Uses AG-018 for uncertainty; Feature Flag `rca.gnn.enabled`.
- **INC-007 — 5-Why & Bowtie RCA Templates.**
- **INC-008 — Corrective Action Tracking:** **Refactored** — this feature now only handles the immediate action tracker (owner + due-date + Kanban). The full ISO 45001 CAPA loop moves to INC-021 (see below), keeping INC-008 backward-compatible.
- **INC-009 — Similar Incident Retrieval.**
- **INC-010 — Precursor Analysis (Precede/Follow Patterns).**
- **INC-011 — Regulatory Report Draft (IR-1, OSHA 300, OSHA 301):** SLA draft ≤ 90s; produces `regulatory.filing.draft.v1`.
- **INC-012 — Witness Statement Collection Flow.**
- **INC-013 — Incident Photo/Video Attachment.**
- **INC-014 — Anonymous Whistleblower Channel:** Cryptographic anonymity via SEC-004; no PII stored.
- **INC-015 — Post-Incident Lessons-Learned Library.**
- **INC-016 — Incident Cost Tracking.**
- **INC-017 — Legal Hold & Chain-of-Custody:** **Adds:** legal hold MUST override CV-023 re-ID TTL (60min → indefinite until released); embeddings preserved with hold.
- **INC-018 — Family/Next-of-Kin Notification Support:** Renamed to Sensitive Notification Workflow, superseded semantically by INC-023 (baseline INC-018 kept for ID stability but referenced by INC-023).
- **INC-019 — Incident Analytics & Trend Dashboard.**
- **INC-020 — Incident-to-Insurance Data Sharing (Opt-In).**

### INC-021 — CAPA (Corrective & Preventive Action) Workflow — ISO 45001 §10.2 (NEW)
- **Description:** Full CAPA lifecycle: root-cause link → corrective action → preventive action → effectiveness verification (≥30 days post-close) → sign-off. Bidirectional link with SOP updates and pattern library (CR-001) so that a systemic incident produces a new detection pattern.
- **User Personas:** Deepak, Kavya, Meena
- **Business Problem:** Baseline INC-008 tracked "actions" but did not close the ISO 45001 §10.2 continuous-improvement loop; auditors flag this on real audits.
- **AI Components:** LLM extracts CAPA candidates from RCA; effectiveness verification via KPI drift detection.
- **Required Data:** RCA outputs, KPI baselines
- **UX Notes:** CAPA board with "effectiveness verification due" tracker; escalation on overdue verification.
- **Acceptance Criteria:** 100% of SIF/LTI incidents produce closed CAPA within 90 days; effectiveness verified within 30 days of close.
- **Dependencies:** INC-006, INC-008, CR-001, COMP-002
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `rca.hypothesis.v1`, `incident.closed.v1`
- **Produces:** `capa.action.v1`, `capa.effectiveness.v1`, `pattern.candidate.v1`
- **Event Types:** `capa.opened.v1`, `capa.closed.v1`, `capa.effectiveness.verified.v1`, `capa.overdue.v1`
- **API References:** `POST /v2/capa` · `GET /v2/capa?status=open`
- **Appears On Screens:** UI-005 (RCA workspace), UI-002 (executive board)
- **Backend Service:** `capa-service`
- **Owner:** Incident Squad · **Epic:** EPIC-INC-ISO45001 · **Sprint:** S5–S7 · **Story Points:** 34
- **SLA / SLO:** CAPA effectiveness verification within 30d post-close
- **Technical Risk:** LOW · **Business Risk:** HIGH (ISO 45001 certification depends on this)

### INC-022 — Incident-Playback Digital Twin Snapshot (NEW)
- **Description:** On incident confirm, saves a time-fixed Digital Twin snapshot (DT-016) linked to the incident record; used for training, RCA, and regulator handoff.
- **User Personas:** Vikram, Kavya, Deepak
- **Business Problem:** Real RCA meetings need a "walk the plant at that moment" experience; twin state at incident is otherwise lost after retention purge.
- **AI Components:** N/A
- **Required Data:** Twin state, KG-010 temporal
- **UX Notes:** Snapshot appears in evidence bundle; can be replayed in DT-010 time-slider mode.
- **Acceptance Criteria:** Snapshot preserved for full retention regardless of general retention purge; provenance signed.
- **Dependencies:** DT-010, DT-016, INC-003, INC-017
- **Priority:** Should · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `incident.confirmed.v1`, `twin.state.v1`
- **Produces:** `evidence.twin_snapshot.v1`
- **Owner:** Incident Squad + Twin Squad · **Epic:** EPIC-INC-EVIDENCE · **Sprint:** S6 · **Story Points:** 13

### INC-023 — Trauma-Informed Notification & Support Workflow (NEW; supersedes framing of INC-018) (NEW)
- **Description:** Structured, human-led workflow for family/NoK notification, worker return-to-work support, and workforce mental-health resource routing after SIF events. Templates reviewed by HR + legal + occupational psychology.
- **User Personas:** HR, Deepak, Occupational Health
- **Business Problem:** Notification errors compound trauma and expose the company to legal/reputational damage. Baseline INC-018 covered notification only; return-to-work + wider workforce support is missing.
- **AI Components:** N/A (deliberately no automation of humanly-delivered messages)
- **Required Data:** Emergency contacts, EAP contacts
- **UX Notes:** Templates + checklists only; **humans deliver every message**. Encoded in AG-004 as forbidden capability for agents.
- **Acceptance Criteria:** SLA HR contact ≤ 2h post SIF confirmation; all outputs private-by-default (SEC-004).
- **Dependencies:** INC-018, SEC-004, HR-integration (INT-*)
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Consumes:** `incident.sif.confirmed.v1`
- **Produces:** `hr.notification.task.v1`
- **Owner:** Incident Squad + HR Integration · **Epic:** EPIC-INC-HR · **Sprint:** S5 · **Story Points:** 13
- **Technical Risk:** LOW · **Business Risk:** HIGH (mishandling causes serious human harm)

---

### REPLACES MODULE 12 — MULTI-AGENT REASONING LAYER

**Reason for replacement:**
- Baseline v1.0 has a duplicated header ("MODULE 12 — MULTI-AGENT REASONING LAYER (continued)") caused by a chunked authoring artifact — this must be reconciled in the canonical document.
- Missing: model-router agent (cost/latency/groundedness routing), uncertainty-quantification service, human-in-loop broker as a shared service (currently per-feature), and a global AI kill-switch.
- New IDs AG-017…AG-020 appended.

---

## MODULE 12 — MULTI-AGENT REASONING LAYER

**Module description (extends v1.0):** Durable, observable, capability-scoped agent execution over LangGraph + Temporal. Governance Agent (AG-003) mediates every output; Capability Tokens (AG-004) hard-wire prohibitions (`actuate_equipment`, `override_sis`, `deliver_family_notification`, `biometric_identify_face`). Every AI-facing surface receives calibrated uncertainty (AG-018), routes through a policy-aware model router (AG-017), delegates human decisions via a shared broker (AG-019), and can be paused via a global kill-switch (AG-020).

*(AG-001…AG-016 baseline preserved verbatim with metadata additions applied module-wide.)*

- **AG-001 — LangGraph Agent Framework Deployment.**
- **AG-002 — Temporal Workflow Engine Integration:** Now owns Temporal for the whole platform (see MODULE 26 §WFP-001).
- **AG-003 — Governance Agent (Meta-Agent):** 100% agent outputs pass through Governance; violations blocked and audited.
- **AG-004 — Capability Token System (Hard-Wired Prohibitions):** Static analysis in CI proves no code path can invoke forbidden capabilities; forbidden set is versioned.
- **AG-005 — Perception Agent.**
- **AG-006 — Telemetry Agent.**
- **AG-007 — Permit Agent.**
- **AG-008 — LOTO Agent.**
- **AG-009 — Compound Risk Agent.**
- **AG-010 — Emergency Response Agent.**
- **AG-011 — Incident Intelligence Agent.**
- **AG-012 — Shift Handover Agent.**
- **AG-013 — Compliance Agent.**
- **AG-014 — Predictive Agent.**
- **AG-015 — Agent Observability Dashboard:** Fed by MODULE 27 §OBS-*; per-agent metrics + LLM cost + tool usage + error rate.
- **AG-016 — Agent Sandboxing & Tool Whitelist:** Zero tool invocation outside whitelist; changes require security review recorded via WFP-006.

### AG-017 — Model Router Agent (Cost / Latency / Groundedness) (NEW)
- **Description:** Policy-aware router that selects between models (Llama 3.1 70B on-prem, Azure OpenAI, Anthropic, Bedrock) per request based on tenant policy, task type, latency budget, cost cap, data-residency, and required groundedness.
- **User Personas:** Applied AI Lead, tenant admin, Neha
- **Business Problem:** Baseline RAG-012 provides abstraction but does not route on cost/latency/groundedness/residency; large deployments overspend and under-comply.
- **AI Components:** Policy engine + LLM benchmarking harness
- **Required Data:** Per-tenant policy, per-model perf profile
- **UX Notes:** Router decisions logged to RAG-017 audit; visible per-request in Copilot debug view.
- **Acceptance Criteria:** ≥ 30% inference-cost reduction at parity groundedness on benchmark suite; residency policies never violated.
- **Dependencies:** RAG-012, SEC-*
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐⭐
- **Consumes:** `llm.request.v1`, `tenant.policy.v1`
- **Produces:** `llm.route.decision.v1`
- **API References:** `POST /v2/llm/route`
- **Backend Service:** `model-router`
- **Feature Flag:** `llm.router.enabled`
- **Owner:** Applied AI Squad · **Epic:** EPIC-AI-ROUTING · **Sprint:** S4 · **Story Points:** 21

### AG-018 — Uncertainty Quantification Service (NEW)
- **Description:** Centralized service that ensures every AI-facing output (CV score, CompoundRisk confidence, PHM forecast, LLM answer) carries calibrated uncertainty (epistemic + aleatoric). Provides temperature-scaling for classifiers, conformal prediction for forecasts, and calibration monitoring.
- **User Personas:** Applied AI Lead, ML Engineer, Deepak
- **Business Problem:** Uncalibrated confidence values erode trust and violate EU AI Act Art. 13 "meaningful information about the logic involved". Currently uncertainty is per-model ad-hoc.
- **AI Components:** Temperature scaling, conformal prediction, isotonic regression
- **Required Data:** Held-out calibration set per model
- **UX Notes:** Uncertainty rendered as confidence bands / colored bars everywhere.
- **Acceptance Criteria:** Expected Calibration Error (ECE) ≤ 0.05 across all in-scope models; drift monitored.
- **Dependencies:** ML-004, PRED-011, PRED-012
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐⭐
- **Consumes:** `model.output.v1`
- **Produces:** `uncertainty.calibrated.v1`
- **Backend Service:** `uncertainty-service`
- **Owner:** Applied AI Squad · **Epic:** EPIC-AI-TRUST · **Sprint:** S5 · **Story Points:** 21

### AG-019 — Human-in-Loop Broker (NEW)
- **Description:** Shared service that mediates every "AI recommends, human approves" hand-off across CR, PTW, LOTO, ER, INC. Handles SLA, escalation ladder, mobile push, biometric sign-off, timeout escalation, and audit chain in one place.
- **User Personas:** Sanjay, Anita, Chief Safety Officer, Neha
- **Business Problem:** Human-in-loop is currently duplicated across CR-016, PTW-012, LOTO-005, ER-001, INC-*, each with different SLAs and UX. Consolidation is required for EU AI Act Art. 14 compliance and consistent operator experience.
- **AI Components:** N/A (orchestration)
- **Required Data:** Escalation ladder per decision type
- **UX Notes:** Universal "Decision Card" component appears on console + mobile.
- **Acceptance Criteria:** 100% of gated decisions flow through broker; escalation SLA met 100%; full audit chain.
- **Dependencies:** WFP-005, NOT-002, SEC-005
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `decision.requested.v1`
- **Produces:** `decision.approved.v1`, `decision.rejected.v1`, `decision.escalated.v1`, `decision.timed_out.v1`
- **API References:** `POST /v2/decisions` · `POST /v2/decisions/{id}/approve`
- **Backend Service:** `hitl-broker`
- **Frontend Components:** `DecisionCard`, `DecisionInbox`
- **Owner:** Platform Squad · **Epic:** EPIC-AI-HITL · **Sprint:** S3–S5 · **Story Points:** 34

### AG-020 — Global AI Kill-Switch & Model Rollback (NEW)
- **Description:** Multi-scope kill-switch (per-model, per-tenant, global) with instant model rollback. Required by EU AI Act Art. 14; required by any Fortune-500 procurement.
- **User Personas:** Chief Safety Officer, Neha, tenant admin
- **Business Problem:** Absent a documented kill-switch, high-risk AI systems cannot be deployed under EU AI Act; also a hard requirement in enterprise safety procurement.
- **AI Components:** N/A
- **Required Data:** Model registry (ML-005)
- **UX Notes:** Big red button; requires dual sign-off for global scope; reason logged.
- **Acceptance Criteria:** Kill takes effect ≤ 30s globally; rollback to previous version ≤ 5min; every activation audited.
- **Dependencies:** ML-005, SEC-011, WFP-006
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐
- **Consumes:** `kill_switch.request.v1`
- **Produces:** `model.disabled.v1`, `model.rolled_back.v1`
- **API References:** `POST /v2/models/{id}/kill` (dual-sign-off) · `POST /v2/ai/global-kill` (CSO only)
- **Backend Service:** `model-lifecycle-service`
- **Owner:** Applied AI Squad + Security Squad · **Epic:** EPIC-AI-CONTROL · **Sprint:** S3 · **Story Points:** 13
- **Business Risk:** CRITICAL (regulatory) — MUST land before EU rollout.

---

## NEW MODULE

### INSERT MODULE 25 — DATA PLATFORM, LAKEHOUSE & MLOps CONTROL PLANE

**Insert location:** After MODULE 24 (Platform, Admin & DevX), before the appendices.

**Reason:**
Baseline v1.0 references `ML-001…ML-016` (model registry, signing, drift, canary, feature store, on-prem LLM infra, federated stats) across many modules but has no canonical module owning the data lakehouse + MLOps control plane. This is a hard gap for engineering handoff and for EU AI Act model-lifecycle evidence.

---

## MODULE 25 — DATA PLATFORM, LAKEHOUSE & MLOps CONTROL PLANE

**Module description:** The shared substrate for all data-at-rest and model-lifecycle. Owns the lakehouse (Delta / Iceberg on S3-compatible), streaming ingest (Kafka), the feature store, model registry, evaluation harness, drift monitoring, and model deployment (edge + cloud). Every AI feature in modules 1, 4, 8, 11, 12, 13 delegates its data + model plumbing here.

| # | ID | Feature |
|---|----|---------|
| 25.1 | DP-001 | Lakehouse Layer (Delta/Iceberg on S3-compatible) |
| 25.2 | DP-002 | Streaming Ingest (Kafka + Schema Registry) |
| 25.3 | DP-003 | Feature Store (Feast) |
| 25.4 | DP-004 | Model Registry (MLflow) |
| 25.5 | DP-005 | Model Signing (Sigstore/cosign) |
| 25.6 | DP-006 | Model Canary & Shadow Framework (Platform) |
| 25.7 | DP-007 | Model Drift Monitoring (Evidently + custom) |
| 25.8 | DP-008 | Feature-Skew Detection (Train vs Serve) |
| 25.9 | DP-009 | Labeling & Active-Learning Console |
| 25.10 | DP-010 | Synthetic Data Governance |
| 25.11 | DP-011 | Data Contract Registry (semantic + schema) |
| 25.12 | DP-012 | On-Prem LLM GPU Fleet Manager |
| 25.13 | DP-013 | Federated Statistics Engine (Cross-Tenant Learning) |
| 25.14 | DP-014 | Reproducibility Bundle (data+code+model hash) |
| 25.15 | DP-015 | Model Card & EU-AI-Act Documentation Generator |
| 25.16 | DP-016 | Data Retention & Right-to-Erasure Automation |

*(Each DP feature carries the full improved template. Below are the highest-leverage entries; the remaining follow the same structure.)*

### DP-001 — Lakehouse Layer (Delta/Iceberg on S3-compatible)
- **Description:** Bronze/Silver/Gold lakehouse on Delta or Iceberg tables over an S3-compatible object store (AWS S3, Azure ADLS, on-prem MinIO). Partitioned by tenant + date + source; time-travel enabled.
- **User Personas:** ML Engineer, Data Engineer, Vikram
- **Business Problem:** OT + CV volumes overwhelm relational stores; RCA and ML need scalable historical access with lineage.
- **Acceptance Criteria:** Sustain 200k events/s ingest per region; sub-5s Gold-layer analytical queries at 90-day range; time-travel to any point in last 90 days.
- **Dependencies:** DP-002, MODULE 22 §SEC-* (encryption at rest)
- **Priority:** Must · **Complexity:** XL · **Demo Value:** ⭐⭐
- **Produces:** all `*.v1/v2` events landed in bronze + refined tables
- **API References:** SQL over Trino/Athena · Delta Sharing for partners
- **Backend Service:** `lakehouse-platform`
- **Owner:** Data Platform Squad · **Epic:** EPIC-DP-CORE · **Sprint:** S1–S4 · **Story Points:** 55
- **Cost Impact:** Base infra; drives 40% of platform cost — hence lifecycle policies (DP-016) are P0.

### DP-004 — Model Registry (MLflow)
- **Description:** Central registry for every model (CV, PHM, LLM adapter, GNN) with version, training data hash, evaluation metrics, fairness report, model card, signature.
- **Acceptance Criteria:** Zero model deployed without registry entry; SBOM per model; fairness + calibration reports attached.
- **Dependencies:** DP-005, DP-014, DP-015, AG-020
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Backend Service:** `model-registry`
- **Owner:** Applied AI Squad · **Epic:** EPIC-DP-MLOPS · **Sprint:** S2 · **Story Points:** 13

### DP-011 — Data Contract Registry
- **Description:** Every producer publishes a semantic + schema contract for its events (`cv.event.v2`, `sensor.gas.v1`, `CompoundRisk.v2`, …). CI blocks breaking changes; consumers subscribe by contract version.
- **Acceptance Criteria:** 100% events in canonical catalog have registered contracts; breaking-change CI-block ≥ 12mo deprecation.
- **Dependencies:** DP-002
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Backend Service:** `data-contract-registry`
- **Owner:** Data Platform Squad · **Epic:** EPIC-DP-CONTRACTS · **Sprint:** S2 · **Story Points:** 21

### DP-015 — Model Card & EU AI Act Documentation Generator
- **Description:** Auto-generates the "high-risk AI system" documentation package required by EU AI Act Annex IV from registry + evaluation + fairness + drift + governance data. Signed via SEC-007.
- **Acceptance Criteria:** Complete Annex IV pack ≤ 30s per model version.
- **Dependencies:** DP-004, DP-005, DP-007, CV-030, AG-018, AG-020
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐⭐
- **Owner:** Compliance Squad + Applied AI · **Epic:** EPIC-COMP-EUAI · **Sprint:** S6 · **Story Points:** 21

### DP-016 — Data Retention & Right-to-Erasure Automation
- **Description:** Automates GDPR / DPDP right-to-erasure requests; retention policies per class (CV-029) driven from a single catalog; WORM audit log.
- **Acceptance Criteria:** Erasure completed ≤ 30d SLA; 100% policy adherence.
- **Dependencies:** SEC-010, CV-029
- **Priority:** Must · **Complexity:** L · **Demo Value:** ⭐⭐

*(Remaining DP features DP-002, DP-003, DP-005, DP-006, DP-007, DP-008, DP-009, DP-010, DP-012, DP-013, DP-014 follow the same template with priorities Must / Should as appropriate. Owner: Data Platform Squad or Applied AI Squad.)*

---

### INSERT MODULE 26 — WORKFLOW, RULE & POLICY ENGINE (SHARED SUBSTRATE)

**Insert location:** After MODULE 25.

**Reason:**
PTW-003, LOTO-002, ER-002, INC-021, CR-006, CR-007 all assume a durable workflow engine + a rule/policy engine. Baseline v1.0 references Temporal in AG-001/AG-002 and OPA implicitly in AG-003, but no module owns the substrate as a first-class product surface. Fortune-500 procurement requires a workflow-engine SBOM, policy repo, and rule-versioning story that lives somewhere identifiable.

---

## MODULE 26 — WORKFLOW, RULE & POLICY ENGINE (SHARED SUBSTRATE)

**Module description:** The universal automation substrate: Temporal for durable long-running workflows, OPA/Rego for policy, Drools/CEL for hot-reloadable business rules, a canonical event catalog, and a policy-as-code repo with signed releases.

| # | ID | Feature |
|---|----|---------|
| 26.1 | WFP-001 | Temporal Workflow Engine (platform-owned) |
| 26.2 | WFP-002 | Canonical Event Catalog & Bus |
| 26.3 | WFP-003 | OPA / Rego Policy Engine |
| 26.4 | WFP-004 | Rules Engine (Drools / CEL — hot-reload safe) |
| 26.5 | WFP-005 | Approval Workflow Framework (n-role, dual-sign, escalation) |
| 26.6 | WFP-006 | Policy-as-Code Repo & Signed Releases |
| 26.7 | WFP-007 | Workflow SLA & Timeout Framework |
| 26.8 | WFP-008 | Idempotency & Exactly-Once Semantics Layer |
| 26.9 | WFP-009 | Compensation / Saga Framework |
| 26.10 | WFP-010 | Cross-Tenant Workflow Isolation |
| 26.11 | WFP-011 | Long-Running Workflow Visualizer |
| 26.12 | WFP-012 | Human-in-Loop UX Kit (Decision Card, Inbox, Delegation) — used by AG-019 |

### WFP-002 — Canonical Event Catalog & Bus
- **Description:** Single source of truth for every platform event: `cv.event.v2`, `sensor.gas.v1`, `ptw.state.v1`, `loto.state.v1`, `CompoundRisk.v2`, `incident.*`, `capa.*`, `decision.*`, `emergency.trigger.*`, `hr.notification.task.v1`. Contracts owned by DP-011.
- **Acceptance Criteria:** 100% cross-module communication via catalog events; new events require contract registration before ingest is permitted.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐
- **Owner:** Platform Squad · **Epic:** EPIC-PLAT-EVENTS · **Sprint:** S1 · **Story Points:** 13

### WFP-003 — OPA / Rego Policy Engine
- **Description:** Centralized policy evaluation for RBAC, ABAC, capability enforcement, PTW approvals, LOTO transitions, kill-switch gating. Every service embeds the OPA client; policies live in WFP-006 repo.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐
- **Dependencies:** AG-003, AG-004
- **Owner:** Security Squad · **Epic:** EPIC-SEC-POLICY · **Sprint:** S2 · **Story Points:** 21

### WFP-005 — Approval Workflow Framework
- **Description:** n-role, dual-sign, escalation-ladder approval framework used by PTW-012, CR-018, AG-020, DP-016, INC-021, permit amendments, capability changes.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐

*(WFP-001, WFP-004, WFP-006 through WFP-012 follow the template.)*

---

### INSERT MODULE 27 — OBSERVABILITY, SLO & RELIABILITY ENGINEERING

**Insert location:** After MODULE 26.

**Reason:**
Observability is currently scattered (CV-022, AG-015, OT-020, PLT-*), which is acceptable but not enterprise-grade. Fortune-500 procurement requires: SLO catalog, error budgets, runbooks, chaos testing, synthetic monitoring, DR drills — none of which have a canonical owner today.

---

## MODULE 27 — OBSERVABILITY, SLO & RELIABILITY ENGINEERING

| # | ID | Feature |
|---|----|---------|
| 27.1 | OBS-001 | Unified Observability Stack (OpenTelemetry + Prometheus + Loki + Tempo) |
| 27.2 | OBS-002 | SLO Catalog & Error Budgets (per feature) |
| 27.3 | OBS-003 | RED / USE Metrics for every service |
| 27.4 | OBS-004 | Runbook Library (linked from every alert) |
| 27.5 | OBS-005 | Edge Fleet Health Console |
| 27.6 | OBS-006 | Synthetic Monitoring (end-to-end scenarios) |
| 27.7 | OBS-007 | Chaos Engineering Framework (GameDay) |
| 27.8 | OBS-008 | DR Drill Automation (RPO/RTO evidence) |
| 27.9 | OBS-009 | Cost Observability (per-tenant per-feature) |
| 27.10 | OBS-010 | AI Cost Observability (per-model per-tenant) |
| 27.11 | OBS-011 | Alert Fatigue Metric (meta) |
| 27.12 | OBS-012 | On-Call Rotation & Handoff |
| 27.13 | OBS-013 | Incident-of-Record (SRE, distinct from safety INC-*) |
| 27.14 | OBS-014 | Public Status Page (per-tenant + platform) |

### OBS-002 — SLO Catalog & Error Budgets
- **Description:** Canonical registry of SLOs per feature (latency, availability, freshness, correctness). Every replaced feature in this vNext patch declares its SLO here.
- **Acceptance Criteria:** 100% Must-priority features have registered SLO + error budget + burn-rate alert.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐

### OBS-005 — Edge Fleet Health Console
- **Description:** Fleet-wide dashboard of every edge node, camera, gas detector, RTLS anchor with silent-failure detection (CV-036) and MTTR tracking.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐

### OBS-008 — DR Drill Automation (RPO/RTO Evidence)
- **Description:** Quarterly automated DR drill producing signed RPO/RTO evidence artefacts — required by ISO 22301 and Fortune-500 procurement.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐⭐

### OBS-010 — AI Cost Observability
- **Description:** Per-model, per-tenant token/inference cost attribution; feeds AG-017 router policy.
- **Priority:** Must · **Complexity:** M · **Demo Value:** ⭐⭐

*(Remaining OBS features follow the same template. Owner: SRE Squad · Epics EPIC-OBS-*.)*

---

## Improved Feature Template (Reference)

Every feature in a replaced or new module carries these fields in addition to the original 12:

| Field | Purpose |
|---|---|
| Consumes | Upstream events / entities |
| Produces | Downstream events / entities |
| Event Types | Canonical catalog IDs (DP-011) |
| API References | Public + internal endpoints |
| Appears On Screens | UI-* / MOB-* IDs |
| Backend Service | Owning microservice |
| Frontend Components | Owning component |
| Telemetry | Metrics emitted (OBS-003) |
| Logging | Log types + retention |
| Feature Flag | Flag key + default value (PLT-004) |
| Rollout Strategy | Shadow / canary / GA gates |
| SLA / SLO | Registered in OBS-002 |
| Cost Impact | Rough monthly cost class |
| AI Cost | LLM / inference cost class |
| Infrastructure Cost | Compute / storage / network |
| Owner | Squad / DRI |
| Epic | EPIC-* linkage |
| Sprint | Estimated sprint |
| Story Points | Estimate |
| Technical Risk | LOW / MEDIUM / HIGH |
| Business Risk | LOW / MEDIUM / HIGH |

---

## Cross-Module Dependency Improvements (Summary)

- **AG-019 becomes the single owner of "AI recommends, human approves"** for CR-016, PTW-012, LOTO-005, LOTO-013, ER-001, ER-014, INC-011, AG-020. Duplicate ad-hoc HITL UX is deprecated.
- **CV-033 gates all fire-triggered emergencies** — CV-011 alone cannot trigger ER-002.
- **WFP-005 owns approval chains** for PTW-012, CR-018, DP-016, AG-020, LOTO-013.
- **DP-011 (data contracts) is the sole authority for event schemas** across CV, OT, KG, CR, PTW, LOTO, ER, INC modules.
- **AG-020 kill-switch dependency added to every AI feature** at the module level (not per-feature clutter).
- **SEC-014 (face blur) is stated once as a module-level hard dependency of MODULE 1** (was implicit per-feature only).
- **OBS-002 SLO catalog** is the sole authority for latency/availability targets.

---

**— End of Master Feature Specification vNext patch —**

*This patch preserves 100% of baseline v1.0 feature IDs and content, adds 4 replaced modules with the improved metadata template, appends 3 new modules (25/26/27) for gaps that had no canonical owner, and introduces 26 new features (CV-033…CV-036, CR-025…CR-027, INC-021…INC-023, AG-017…AG-020, plus the DP-*, WFP-*, OBS-* series). Every change carries an engineering justification tied to Fortune-500 procurement, EU AI Act, ISO 45001, IEC 62443, or a real defect discovered during review. No feature was deleted.*
