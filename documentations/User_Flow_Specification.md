# User Flow Specification — SafetyOS

**Document Version:** 1.0
**Status:** Canonical User Flow Reference — Engineering & Design Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0
**Owners:** Principal UX Architect, Senior Product Design
**Classification:** Confidential — Product Blueprint
**Last Reviewed:** 2026-07-21

---

## 0. How to Read This Document

This User Flow Specification defines the end-to-end interaction sequences that bind SafetyOS personas, screens, backend services, agents, and events into deliverable user experiences. Every flow is directly traceable to:

- **Feature IDs** from Master Feature Specifications v1.0 + vNext (CV-, OT-, KG-, CR-, PTW-, LOTO-, SH-, INC-, ER-, DT-, RAG-, AG-, PRED-, AL-, UI-, MOB-, CON-, COMP-, IOT-, SEC-, ML-, NOT-, ADM-, EXT-, DP-, WFP-, OBS-)
- **Screens / Workspaces** from the Information Architecture (UI-*, MOB-*)
- **Personas** from PRSD §5 (Anita, Sanjay, Deepak, Kavya, Ravi, Vikram, Neha, Arjun, Priya, Meena, Contractor Rep, HR, ER Team, CSO, Auditor, Regulator)
- **Event contracts** from MODULE 26 §WFP-002 Canonical Event Catalog
- **AI governance** from AG-003 Governance Agent, AG-004 Capability Tokens, AG-018 Uncertainty Service, AG-019 HITL Broker, AG-020 Kill-Switch

Each flow is described using the canonical schema:

```
Flow ID · Flow Name
├─ Actors (personas + system agents)
├─ Preconditions
├─ Trigger
├─ Step-by-step interaction (primary/happy path)
├─ Alternate paths
├─ Error paths
├─ AI interactions
├─ Backend services
├─ APIs
├─ Events (Consumes / Produces)
├─ Success criteria
└─ Failure states
```

**Flow ID Convention:** `UF-<CATEGORY>-<NNN>` where category codes match the workflow taxonomy in §1.

---

## 1. Flow Taxonomy & Index

| Category | Prefix | Flows |
|---|---|---|
| Authentication & Session | AUTH | UF-AUTH-001…005 |
| Onboarding | ONB | UF-ONB-001…004 |
| Dashboard | DASH | UF-DASH-001…003 |
| Permit Creation | PTWC | UF-PTWC-001…004 |
| Permit Approval | PTWA | UF-PTWA-001…003 |
| LOTO | LOTO | UF-LOTO-001…004 |
| Incident Reporting | INC | UF-INC-001…005 |
| Emergency Response | ER | UF-ER-001…004 |
| AI Copilot | COP | UF-COP-001…004 |
| Knowledge Search | KS | UF-KS-001…003 |
| Digital Twin | DT | UF-DT-001…003 |
| Notifications | NOT | UF-NOT-001…003 |
| Analytics | ANA | UF-ANA-001…003 |
| Contractor Workflow | CON | UF-CON-001…003 |
| Audit Workflow | AUD | UF-AUD-001…003 |
| Compliance Workflow | COMP | UF-COMP-001…003 |
| Admin Workflow | ADM | UF-ADM-001…004 |
| AI Explanations | AIX | UF-AIX-001…003 |
| Mobile Workflows | MOB | UF-MOB-001…005 |

Total: **68 primary flows**.

---

# PART A — AUTHENTICATION & ONBOARDING

---

## UF-AUTH-001 · Enterprise SSO Sign-In (Web Console)

- **Actors:** Anita (Control Room Operator), Sanjay (HSE Supervisor), Deepak (Plant HSE Manager), Vikram (Ops Excellence Head), Neha (CISO), Corporate IdP, `iam-service`, `session-service`, AG-003 Governance Agent
- **Preconditions:**
  - Tenant `SEC-002` SSO/SAML/OIDC bindings provisioned against enterprise IdP (Azure AD / Okta / Ping).
  - User account provisioned via SCIM (`SEC-003`) with role assignments (`SEC-005` RBAC).
  - Device MDM posture check passing for privileged roles.
- **Trigger:** User navigates to `https://<tenant>.safetyos.app` (routes to UI-001 Login Splash).
- **Primary Path:**
  1. Login page (UI-001) displays tenant-branded SSO CTA. No password fields are exposed for SSO-bound tenants.
  2. User clicks **Sign in with SSO**. Browser redirects to IdP with signed SAML/OIDC request.
  3. IdP authenticates (may include MFA, WebAuthn, conditional access).
  4. IdP posts SAML assertion / OIDC token to `iam-service` callback.
  5. `iam-service` validates signature, extracts claims (email, roles, groups, tenant_id), calls `session-service` to mint a short-lived access token + refresh token bound to device fingerprint.
  6. Session cookie set (HttpOnly, SameSite=Strict, Secure). Client receives JWT + refresh token in secure store.
  7. Client fetches `GET /v2/me` → returns profile, effective roles, feature flags (`PLT-004`), tenant policy, capability tokens (`AG-004`).
  8. Governance Agent (`AG-003`) evaluates login-time capability set; forbidden capabilities (e.g., `actuate_equipment`, `biometric_identify_face`) are stripped from token.
  9. Client routes to **UF-DASH-001 Role-Contextual Landing**.
- **Alternate Paths:**
  - **A1 — First-time device:** Additional step-up MFA required; workflow suspends until user confirms.
  - **A2 — Break-glass account:** If IdP unreachable, tenant-designated break-glass account (backed by hardware token) available via UI-001 secondary link, gated by `SEC-004` and audited via `SEC-011` WORM log.
  - **A3 — SCIM mismatch:** If claims don't match a provisioned user, session issuance fails; user routed to UI-001 error state with "Contact admin" CTA and correlation ID.
- **Error Paths:**
  - **E1 — IdP signature invalid:** `iam-service` rejects; client shows generic auth error; security event `auth.signature_invalid.v1` fires, threshold triggers SOC alert (`SEC-013`).
  - **E2 — Session mint failure:** `session-service` degraded — client shows retry with backoff; SRE paged via `OBS-013`.
  - **E3 — Kill-switch active (`AG-020`) at tenant scope:** Login succeeds but AI-facing surfaces show "AI paused" banner.
- **AI interactions:** AG-003 evaluates capability token at login; AG-004 injects forbidden-capability list.
- **Backend services:** `iam-service`, `session-service`, `capability-token-service`, `feature-flag-service`, `governance-agent`.
- **APIs:** `POST /v2/auth/sso/callback` · `GET /v2/me` · `POST /v2/session/refresh` · `POST /v2/session/logout`
- **Events:** Produces `auth.login.success.v1`, `session.issued.v1`; on failure `auth.login.failure.v1`.
- **Success criteria:** p95 total sign-in ≤ 4s excluding IdP round-trip; zero unauthorized capability grants; 100% events landed on WORM log.
- **Failure states:** Locked account (repeated failures), tenant suspended, IdP outage, kill-switch global.

---

## UF-AUTH-002 · Mobile Biometric Sign-In (Field App)

- **Actors:** Ravi (Operator), Sanjay (Supervisor), Contractor Worker, `iam-service`, `mobile-attest-service`, MDM.
- **Preconditions:**
  - Mobile device enrolled in MDM (`MOB-002`), attestation passing.
  - User has completed UF-ONB-002 mobile pairing (device bound to identity).
  - Biometric enrolled locally on device (Face ID / fingerprint).
- **Trigger:** User launches SafetyOS mobile app.
- **Primary Path:**
  1. App checks local secure enclave for refresh token; if present and unexpired, prompts biometric.
  2. Biometric unlocks the refresh token; app calls `POST /v2/mobile/session/refresh` with device attestation.
  3. `mobile-attest-service` validates hardware attestation, MDM posture, jailbreak/root check.
  4. `iam-service` issues short-lived access token (30 min).
  5. App fetches user profile, active shift, active permits (via `PTW-021`), assigned zones.
  6. App lands on **MOB-001 Home** (see UF-MOB-001).
- **Alternate Paths:**
  - **A1 — Refresh token expired:** Fallback to SSO web-view sign-in (mirrors UF-AUTH-001).
  - **A2 — Offline mode:** Cached credentials allow read-only + queued-writes for ≤ 24h (`MOB-004`). All queued writes marked `pending_sync`.
- **Error Paths:**
  - **E1 — Attestation failure (jailbroken):** Session denied; device auto-quarantined via MDM; security event `mobile.attestation.failed.v1`.
  - **E2 — Biometric locked out:** Fallback PIN + WebAuthn.
- **AI interactions:** None at auth time (deliberate — no biometric identification of face; encoded in AG-004).
- **Backend services:** `iam-service`, `mobile-attest-service`, `capability-token-service`.
- **APIs:** `POST /v2/mobile/session/refresh` · `POST /v2/mobile/pair` · `POST /v2/mobile/quarantine`
- **Events:** `mobile.session.issued.v1`, `mobile.attestation.failed.v1`.
- **Success criteria:** p95 unlock ≤ 1.5s; zero session issuance on failed attestation.
- **Failure states:** Device quarantined, MDM detached, offline > 24h (forces re-auth).

---

## UF-AUTH-003 · Step-Up Authentication for Sensitive Actions

- **Actors:** Deepak, Neha, CSO, `iam-service`, `hitl-broker` (AG-019).
- **Preconditions:** User is signed in with a base session.
- **Trigger:** User attempts a sensitive action: PTW dual-sign, LOTO group-lock removal, AG-020 kill-switch, tenant policy change, legal-hold placement (`INC-017`), CAPA closure sign-off, model promotion.
- **Primary Path:**
  1. Client detects action requires step-up (declared in `capability_requirements`).
  2. Server returns HTTP 401 with `WWW-Authenticate: step-up realm="webauthn"`.
  3. Client prompts WebAuthn/hardware token.
  4. User completes challenge; token returned to server.
  5. `iam-service` upgrades session assurance level for 5 minutes.
  6. Action retries automatically with elevated token.
- **Alternate Paths:** Delegated approval → routed via AG-019 HITL Broker to designated approver.
- **Error Paths:** Timeout (5 min), token rejected, hardware key not present → action aborted, audit event fired.
- **AI interactions:** AG-019 orchestrates approver selection if step-up cannot be self-served.
- **Events:** `auth.stepup.requested.v1`, `auth.stepup.completed.v1`, `auth.stepup.timeout.v1`.
- **Success criteria:** 100% sensitive actions gated; step-up assurance valid ≤ 5 min.
- **Failure states:** Token replay attempt → session invalidated; SOC alert.

---

## UF-AUTH-004 · Session Renewal & Idle Timeout

- **Actors:** Any user, `session-service`.
- **Preconditions:** Active session.
- **Trigger:** Access token nearing expiry OR 15 min idle in control-room console.
- **Primary Path:**
  1. Silent refresh via `POST /v2/session/refresh` using rotating refresh token.
  2. Client renews token in-place, no user disruption.
- **Alternate Paths:** Idle > 15 min for privileged roles → lock screen with biometric/PIN re-auth (control-room roles configurable via ADM console).
- **Error Paths:** Refresh token revoked (admin-forced logout, password reset upstream) → full re-auth.
- **Events:** `session.refreshed.v1`, `session.revoked.v1`.
- **Success criteria:** No silent session drops; idle lock enforced.

---

## UF-AUTH-005 · Sign-Out (Explicit + Forced)

- **Actors:** User, admin, `session-service`.
- **Trigger:** User clicks Sign Out; or admin invalidates session; or emergency purge triggered by `SEC-013` on compromise.
- **Primary Path:**
  1. Client posts `POST /v2/session/logout`.
  2. Server revokes refresh token, adds JWT to deny-list cache.
  3. All open WebSocket subscriptions torn down.
  4. Redirect to UI-001.
- **Alternate Paths:** Global forced logout (kill-switch) invalidates all sessions in ≤ 30s.
- **Events:** `session.logout.v1`, `session.forced_logout.v1`.
- **Success criteria:** Session fully invalidated ≤ 5s.

---

## UF-ONB-001 · Tenant Onboarding (Enterprise)

- **Actors:** Vikram (customer sponsor), Neha (CISO), Deepak (HSE lead), SafetyOS CSM, `tenant-provisioning-service`, `iam-service`, `sec-baseline-service`.
- **Preconditions:** Signed order; DPIA completed (`COMP-010`); data residency selected.
- **Trigger:** CSM initiates tenant creation via internal Admin console.
- **Primary Path:**
  1. CSM completes tenant wizard: legal name, region (US-East / EU-Central / IN-Mum / ME-Bah), industry vertical, contract seats, feature bundle.
  2. `tenant-provisioning-service` orchestrates: create tenant namespace in K8s, provision lakehouse partition (`DP-001`), create Kafka topic namespace, seed KG tenant graph, generate cosign key pair, seed default OPA policies (`WFP-003`).
  3. IdP binding wizard: customer admin uploads SAML metadata / configures OIDC; SCIM endpoint issued.
  4. Break-glass account created; hardware token shipped.
  5. Data residency and encryption keys provisioned (BYOK if requested).
  6. Compliance baseline auto-generated: ISO 45001, EU AI Act Annex IV skeleton, IEC 62443 zone map placeholder (`DP-015`, `COMP-*`).
  7. Site & unit hierarchy imported from CSV (or created manually in UI-014).
  8. First admin user seeded → invited via email → completes UF-AUTH-001 with mandatory MFA enrollment.
  9. CSM schedules **UF-ONB-003 Site Bring-Up**.
- **Alternate Paths:**
  - **A1 — On-prem deployment:** Extra step for K3s cluster bootstrap, GPU node validation (`DP-012`).
  - **A2 — Federated tenant** (multi-country): Sub-tenants provisioned with residency isolation.
- **Error Paths:** DPIA missing → provisioning blocked; region unavailable → route to alternate region with customer approval.
- **AI interactions:** None (deliberately human-driven for legal defensibility).
- **Backend services:** `tenant-provisioning-service`, `iam-service`, `kg-service`, `lakehouse-platform`, `policy-repo`, `model-registry`.
- **APIs:** `POST /v2/admin/tenants` · `POST /v2/admin/tenants/{id}/idp` · `POST /v2/admin/tenants/{id}/residency`
- **Events:** `tenant.created.v1`, `tenant.baseline.applied.v1`.
- **Success criteria:** Tenant reaches "READY_FOR_SITE_ONBOARDING" state within 48h.
- **Failure states:** Provisioning partial → rollback saga (`WFP-009`).

---

## UF-ONB-002 · User Onboarding (First-Time User)

- **Actors:** New user (any persona), `iam-service`, `training-service`.
- **Preconditions:** User provisioned via SCIM; role assigned.
- **Trigger:** User clicks activation link from invitation email.
- **Primary Path:**
  1. User signs in via UF-AUTH-001 with temporary credentials or SSO.
  2. First-time flow presents:
     - **Consent screen:** Privacy notice, data-processing consent, monitoring disclosure (union-transparent for operators via `CV-031`).
     - **MFA enrollment** (if not enforced upstream by IdP).
     - **Mobile pairing prompt** (QR to install app, complete UF-ONB-002 mobile pairing).
     - **Role-based training assignment:** e.g., Anita → "Control Room Console 101"; Sanjay → "PTW Approver Path"; Ravi → "Field Reporting on Mobile".
  3. User completes role-based interactive tour (UI-tour framework) with checkmarks stored to profile.
  4. User lands on UF-DASH-001.
- **Alternate Paths:** Contractor onboarding routes to UF-CON-001.
- **Error Paths:** Consent declined → account remains inactive with grace period.
- **AI interactions:** AI Copilot (`RAG-*`) surfaces contextual tutorial cards; groundedness ≥ 95%.
- **Events:** `user.activated.v1`, `user.training.completed.v1`.
- **Success criteria:** ≥ 90% users complete onboarding without support ticket.

---

## UF-ONB-003 · Site Bring-Up (Cameras, OT, IOT, KG)

- **Actors:** Arjun (Integration Engineer), Deepak (HSE Lead), Neha (CISO), integration partners.
- **Preconditions:** Tenant onboarded (UF-ONB-001); site hierarchy created.
- **Trigger:** Site added; bring-up wizard initiated in UI-014 Admin > Sites.
- **Primary Path:**
  1. **Camera onboarding:** Import inventory CSV or discover via ONVIF; each camera enters "PROVISIONING" → certificate issued (`CV-035`), signed firmware verified, ONVIF Profile-Q secured onboarding completes → "HARDENED" state → assigned to zone in DT-002.
  2. **Homography calibration** (`CV-024`): For each camera, user completes on-screen calibration; bundle signed.
  3. **Model bundle push** (`CV-026`): Edge node fetches signed cosign bundle; verification enforced; per-camera flags default to `shadow`.
  4. **Shadow mode** (`CV-025`): 7-day minimum; fairness panel (`CV-030`) collects metrics; edge fleet health (`CV-036`) monitors silent failures.
  5. **OT/SCADA integration** (`OT-*`): Historian bridge (`OT-001`), tag mapping (`OT-002`), OPC-UA (`OT-003`), MQTT sparkplug (`OT-004`); Neha reviews IEC 62443 zone-conduit mapping (`OT-016`).
  6. **IOT beacons / RTLS** (`IOT-*`): BLE / UWB anchors surveyed; DT geometry updated.
  7. **KG ingest:** P&IDs, MSDS, SOPs, PHA/HAZOP, OSHA logs imported (`KG-001…KG-010`); ontology mapped.
  8. **Rule library seeded:** CR patterns loaded in shadow (`CR-019`).
  9. **Go-live gate:** Deepak signs off HSE checklist; Neha signs security baseline; CV-030 fairness pass; CV-025 shadow pass → tenant policy flips `site.live.enabled`.
- **Alternate Paths:**
  - **A1 — Partial bring-up:** Some cameras remain in shadow beyond go-live; explicit allow-list.
  - **A2 — OT air-gapped site:** Historian bridge deploys with data-diode enforcement.
- **Error Paths:** Firmware unsigned → camera rejected; fairness fails → promotion blocked; KG conflicts → surfaced in KG-014 conflict review.
- **AI interactions:** CV bias fairness panel (`CV-030`), KG conflict resolution assistant (`KG-011`).
- **Events:** `camera.hardening.state.v1`, `edge.telemetry.v1`, `site.live.v1`.
- **Success criteria:** Site reaches "LIVE" ≤ 4 weeks for a mid-size unit.
- **Failure states:** Cameras stuck in shadow; fairness gate blocks GA.

---

## UF-ONB-004 · Contractor Onboarding (Individual)

See UF-CON-001 for full detail (referenced here for taxonomy completeness).

---

# PART B — DASHBOARD

---

## UF-DASH-001 · Role-Contextual Landing

- **Actors:** Any authenticated user.
- **Preconditions:** Session valid (UF-AUTH-001/002).
- **Trigger:** Post-login redirect, or user clicks SafetyOS logo.
- **Primary Path:**
  1. Client evaluates `me.role_bundle` and routes:
     - **Anita (Control Room Operator)** → **UI-006 Live Compound Risk Feed** with L2 Unit Overview panel; latest CompoundRisk.v2 events streamed via WebSocket subscription to `wss/compound-risks/{site}`.
     - **Sanjay (HSE Supervisor)** → **UI-004 Supervisor Console** with permit approval inbox, active LOTOs, worker roll-call, open field reports.
     - **Deepak (Plant HSE Manager)** → **UI-002 Executive Board** (SIF/LTI trends, CAPA aging, audit readiness) + shortcuts to UI-005 RCA, UI-020 Compliance.
     - **Vikram (Ops Excellence)** → **UI-002 Executive Board** with cross-site rollup.
     - **Neha (CISO)** → **UI-019 Auditor / Security Portal** with SEC-* dashboards, model kill-switch, camera hardening state.
     - **Ravi (Operator)** → Mobile lands on **MOB-001 Field Home** (see UF-MOB-001).
     - **Kavya (Auditor)** → **UI-019 Auditor Portal** in read-only WORM mode.
     - **Regulator** → **UI-019** with regulator-scoped filters.
  2. Dashboard shell loads persistent chrome: global search (Cmd+K → UF-KS-001), Copilot side-panel (UF-COP-001), notification tray (UF-NOT-001), user menu.
  3. Widgets stream via SSE / WebSocket; each carries a "last updated" timestamp and provenance link.
- **Alternate Paths:**
  - **A1 — Custom landing:** User pinned a workspace (UI-016 Personal Workspace) → routes there instead.
  - **A2 — Emergency mode:** If any `emergency.trigger.confirmed.v1` active for user's site, dashboard chrome is dimmed and UI-008 Emergency Command Console is presented as overlay.
- **Error Paths:** Widget failure isolated to widget; degraded state banner; other widgets continue.
- **AI interactions:** AG-018 uncertainty rendered on every score/tile; AI Copilot proactive card ("3 risks trending upward — inspect?").
- **Backend services:** `dashboard-service`, `event-bus-gateway`, `governance-agent`.
- **APIs:** `GET /v2/dashboard/{role}` · `WS /v2/stream/compound-risks/{site}`
- **Events:** Consumes `CompoundRisk.v2`, `ptw.state.v1`, `loto.state.v1`, `incident.*`, `emergency.trigger.confirmed.v1`.
- **Success criteria:** First meaningful paint ≤ 1.5s p95; widget stream ≤ 500ms latency p95.
- **Failure states:** Dashboard service down → cached last-known snapshot + prominent "Live data unavailable" banner.

---

## UF-DASH-002 · Executive Board (Deepak / Vikram)

- **Actors:** Deepak, Vikram, CSO.
- **Preconditions:** Analytics gold-layer refreshed (`DP-001`).
- **Trigger:** Navigate to UI-002 Executive Board.
- **Primary Path:**
  1. Board loads: KPI strip (TRIR, LTIFR, near-miss reporting rate, CAPA closure %, PTW cycle time, MTBF for critical assets).
  2. Cross-site heatmap (UI-002 tile) drilldown to UI-020 Compliance and UI-005 RCA.
  3. Risk trend chart with 30/90/365-day toggle.
  4. Copilot narrative: "TRIR improved 12% QoQ; leading indicator (near-miss rate) up 34% — you are surfacing hazards earlier, sustained by CR-002 hot-work pattern maturation."
  5. Export → generates board pack (PDF) with signed provenance (`SEC-007`).
- **Alternate Paths:** Filter by BU, site, contractor, month.
- **Error Paths:** Data freshness > SLA → warning banner ("Data as of 14:22Z; freshness SLA breached").
- **AI interactions:** RAG-* narrative summary with citations (`RAG-002`); AG-018 confidence bands on forecasts.
- **APIs:** `GET /v2/analytics/executive` · `POST /v2/reports/executive/export`
- **Events:** Produces `report.executive.exported.v1`.
- **Success criteria:** Board loads ≤ 2s p95; narrative groundedness ≥ 95%.
- **Failure states:** Stale data warning; export failure retried via WFP-009 saga.

---

## UF-DASH-003 · Live Compound Risk Feed (Anita)

- **Actors:** Anita, `cr-engine`, `hitl-broker` (AG-019).
- **Preconditions:** CR patterns in GA; live streams healthy.
- **Trigger:** Anita clocks into shift; UI-006 opens.
- **Primary Path:**
  1. Feed renders newest `CompoundRisk.v2` at top with severity color-band, pattern badge (e.g., CR-002), confidence + uncertainty band (AG-018), lead-time to potential incident (CR-015), 30-word plain-language summary.
  2. Anita clicks a CRITICAL risk → **Risk Detail Drawer** opens with:
     - Evidence chain (each event id + source + timestamp + chain-of-custody link).
     - Counterfactual (CR-017): "If LEL had stayed <5%, this would be MONITOR only."
     - Regulatory citation (CR-024).
     - Recommended action panel with AG-019 "Approve suspension of PTW-4472" primary CTA.
  3. Anita clicks **Approve suspension** → step-up auth (UF-AUTH-003) → `hitl-broker` records decision → PTW-4472 transitions to SUSPENDED → notification fires to permit holder + Sanjay.
  4. Anita's action feeds AG-006 telemetry agent; audit trail updated.
- **Alternate Paths:**
  - **A1 — Decision timeout:** If Anita does not act within SLA (severity-dependent), `hitl-broker` escalates to Sanjay → Deepak (AG-019 escalation ladder).
  - **A2 — False positive:** Anita clicks **Not a risk** → optionally provides reason → feeds active-learning label (`DP-009`).
- **Error Paths:** Governance Agent (AG-003) blocks action → reason surfaced → escalate to admin.
- **AI interactions:** CR pattern reasoning, AG-018 uncertainty, AG-019 broker, RAG-002 citation, CR-017 counterfactual.
- **Backend services:** `cr-engine`, `hitl-broker`, `event-bus-gateway`, `governance-agent`.
- **APIs:** `GET /v2/compound-risks?site={id}&severity=critical` · `POST /v2/decisions/{id}/approve`
- **Events:** Consumes `CompoundRisk.v2`; produces `decision.approved.v1`, `ptw.suspended.v1`, `feedback.label.v1`.
- **Success criteria:** p99 detection-to-render ≤ 3s; ≥ 8 min median lead time (CR-015 gate).
- **Failure states:** Feed disconnected → visible offline banner; auto-reconnect with backfill.

---

# PART C — PERMIT TO WORK

---

## UF-PTWC-001 · Permit Creation (Standard Hot-Work / Confined-Space / Work-at-Height / Line-Break)

- **Actors:** Kavya (Permit Requestor / Turnaround Planner), Sanjay (Area Owner), Sanjay/Deepak (Approvers), AG-007 Permit Agent, `ptw-service`, `hitl-broker`.
- **Preconditions:** Requestor role has `ptw.request` capability; equipment / area exists in KG-005.
- **Trigger:** User selects **New Permit** on UI-009 PTW Workspace or MOB-005 mobile.
- **Primary Path:**
  1. Wizard step 1 — **Permit Type**: Hot-work, confined-space, work-at-height, line-break, excavation, radiography, energized-electrical, generic. Selection loads type-specific form.
  2. Wizard step 2 — **Scope & Location**: search / select equipment tag → KG expands hierarchy → auto-loads P&ID, MSDS, adjacent hazards, historical incidents on that equipment (KG-002/003/010).
  3. Wizard step 3 — **Task & Team**: Description; task categories (task-context taxonomy for CV-034); worker list (with certifications validated live against KG-006).
  4. Wizard step 4 — **Hazards & Controls**: AG-007 auto-suggests hazards & controls (JSA library) with citations (RAG-002) and confidence (AG-018).
  5. Wizard step 5 — **Overlap check**: AG-007 runs cross-permit spatial-temporal overlap (`CR-012`); shows any adjacent hot-work / line-breaks / confined-space entries within blast radius.
  6. Wizard step 6 — **Pre-conditions checklist**: gas test (must include calibration validity — CR-006), inert purge (CR-026 for pyrophoric lines), isolation verification (LOTO linkage), rescue plan for confined-space.
  7. Wizard step 7 — **Review**: side-by-side of requested vs. AI-suggested; requestor can accept, edit, or override with justification (captured).
  8. Submit → `POST /v2/ptw` → `ptw-service` persists as `DRAFT_SUBMITTED` → triggers UF-PTWA-001.
- **Alternate Paths:**
  - **A1 — Standing / recurring permit** (turnaround): Kavya schedules across days with per-day pre-conditions.
  - **A2 — Contractor-requested:** Extra field for contractor company, insurance validity, LSR training currency.
  - **A3 — Mobile creation** (Ravi/Sanjay in field): MOB-005 offers same wizard optimized for glove-touch; offline draft supported (`MOB-004`).
  - **A4 — Voice draft:** AI Copilot voice-to-permit (RAG-*), user reviews.
- **Error Paths:**
  - **E1 — Missing certification:** Worker on team lacks required cert → blocking error, offers replacement suggestions.
  - **E2 — Pyrophoric line without purge:** CR-026 blocks submission until purge event ingested.
  - **E3 — Overlap conflict:** CR-012 downgrades to warning if adjacent permit is compatible; blocks if hazardous.
  - **E4 — KG conflict:** Equipment tag ambiguous → user prompted to disambiguate.
- **AI interactions:** AG-007 Permit Agent (suggestion + overlap), RAG-002 (citations), AG-018 (uncertainty), CR-025/026/027 pre-checks.
- **Backend services:** `ptw-service`, `permit-agent`, `kg-service`, `cr-engine`, `hitl-broker`.
- **APIs:** `POST /v2/ptw` · `GET /v2/ptw/overlap?equipment_id=&window=` · `GET /v2/ptw/suggestions?type=`
- **Events:** Produces `ptw.draft.v1`, `ptw.submitted.v1`; consumes `worker.cert.v1`, `equipment.state.v1`.
- **Success criteria:** Median permit creation time ≤ 8 min (PRSD target 60% reduction vs. paper baseline); overlap FN = 0 in fault-injection tests.
- **Failure states:** Submission stuck → saga retries; if `ptw-service` degraded, requestor sees "Draft saved locally" and auto-retry.

---

## UF-PTWC-002 · Permit Amendment (Scope / Duration / Team Change)

- **Actors:** Permit holder, Sanjay, AG-007, `ptw-service`, `hitl-broker`.
- **Preconditions:** Permit is in `ACTIVE` or `APPROVED_NOT_STARTED`.
- **Trigger:** Holder taps **Amend** on UI-009 or MOB-005.
- **Primary Path:**
  1. Amendment modal opens with editable subset (scope, duration, team, controls). Original locked as immutable baseline.
  2. AG-007 re-evaluates: new overlap check, new cert check, new CR pattern check.
  3. Approval routes back through UF-PTWA-001 with **delta view** so approvers see only the change.
  4. On approval, permit `state=ACTIVE` retained; amendment record appended.
- **Alternate Paths:** Minor amendment (typo) may be flagged `no-reapproval` if within policy; else escalates.
- **Error Paths:** Amendment introduces critical hazard → CR pattern blocks approval.
- **Events:** `ptw.amendment.requested.v1`, `ptw.amendment.approved.v1`, `ptw.amendment.rejected.v1`.
- **Success criteria:** Median amendment cycle ≤ 5 min.

---

## UF-PTWC-003 · Permit Close-Out

- **Actors:** Permit holder, area owner, AG-007.
- **Preconditions:** Permit `ACTIVE`; end-of-work reached OR permit expiring.
- **Trigger:** Holder taps **Close** on MOB-005; or auto-close at expiry.
- **Primary Path:**
  1. Close-out checklist: work complete, site restored, LOTOs removed (LOTO linkage), waste disposed, no injuries.
  2. Attach photos (face-blurred at edge via `CV-021`), notes.
  3. Area owner signs off (biometric).
  4. Permit → `CLOSED`; final PTW record archived; any linked LOTOs must also close (UF-LOTO-003).
- **Alternate Paths:** Auto-expire without close-out → auto-flags for supervisor review (`CR-*` block on new permit for same equipment until closed).
- **Error Paths:** Site restoration not confirmed → cannot close.
- **Events:** `ptw.close.requested.v1`, `ptw.closed.v1`, `ptw.auto_expired.v1`.
- **Success criteria:** ≥ 95% permits closed on-time.

---

## UF-PTWC-004 · Recurring / Standing Permit (Turnaround)

- **Actors:** Kavya, Vikram, AG-007.
- **Preconditions:** Turnaround plan approved.
- **Trigger:** Planner creates standing template.
- **Primary Path:**
  1. Template defines base scope + daily pre-conditions.
  2. Each day, an instance is auto-materialized with fresh pre-condition checks (gas test, purge, LOTO verification).
  3. Each instance follows UF-PTWA-001 with expedited approval if daily checks pass without deviation.
- **Alternate Paths:** Deviation on day N → auto-escalate to full re-approval.
- **Success criteria:** Turnaround throughput ↑ ≥ 25%.

---

## UF-PTWA-001 · Standard Approval (Single or Dual Signature)

- **Actors:** Sanjay (Area Owner), Deepak (Escalated Approver), AG-019 HITL Broker, `ptw-service`, `hitl-broker`.
- **Preconditions:** Permit is `DRAFT_SUBMITTED`.
- **Trigger:** Event `ptw.submitted.v1` fires; HITL Broker creates Decision Card.
- **Primary Path:**
  1. Decision Card appears in Sanjay's Decision Inbox (UI-004) and MOB-005 push.
  2. Sanjay opens permit → sees AI overlap analysis, KG-005 context, requested scope, controls, workers.
  3. Sanjay approves → step-up auth (UF-AUTH-003) → biometric → `hitl-broker` records approval → if permit type requires dual-sign (hot-work / confined-space / high-risk), routes to Deepak.
  4. Deepak's Decision Card arrives; second approval → permit → `APPROVED`.
  5. Notifications fire to holder + workers; permit visible on their MOB-005.
- **Alternate Paths:**
  - **A1 — Approve with conditions:** Approver adds conditions (e.g., "second fire-watch required") → permit updated → holder acknowledges.
  - **A2 — Reject:** Approver rejects with reason → holder can revise & resubmit.
  - **A3 — Delegate:** Approver on leave → OOO delegation active → next approver in chain.
- **Error Paths:**
  - **E1 — SLA timeout:** No approver responds → escalation to Deepak → then CSO (encoded in AG-019 escalation ladder).
  - **E2 — Cert lapse detected mid-approval:** Blocked, message shown.
  - **E3 — Kill-switch active on Permit Agent:** Approval reverts to fully manual path with AI panel hidden.
- **AI interactions:** AG-007 pre-approval briefing, AG-019 broker, AG-018 confidence.
- **Backend services:** `ptw-service`, `hitl-broker`, `notification-service`.
- **APIs:** `POST /v2/decisions/{id}/approve` · `POST /v2/decisions/{id}/reject` · `POST /v2/ptw/{id}/conditions`
- **Events:** `decision.approved.v1`, `decision.rejected.v1`, `ptw.approved.v1`.
- **Success criteria:** Median approval SLA ≤ 15 min for standard; ≤ 5 min for pre-briefed turnaround instances.
- **Failure states:** Rejection loop, expiring approval window, delegated approver unreachable.

---

## UF-PTWA-002 · Emergency / After-Hours Approval

- **Actors:** On-call HSE, `hitl-broker`, AG-019.
- **Preconditions:** After-hours; only critical work justifies.
- **Trigger:** Requestor flags "urgent" — additional step-up justification captured.
- **Primary Path:**
  1. On-call rotation lookup via OBS-012 → Decision Card push + SMS + voice fallback.
  2. On-call approves with mandatory reason.
  3. Post-shift review flagged to Deepak for QA next business day.
- **Success criteria:** After-hours approval ≤ 20 min median.

---

## UF-PTWA-003 · AI-Blocked Approval (Compound Risk Veto)

- **Actors:** Approver, AG-009 Compound Risk Agent, AG-019.
- **Preconditions:** Approval requested with active CR block (CR-006, CR-012, CR-026, etc.).
- **Trigger:** Approver attempts approval.
- **Primary Path:**
  1. UI shows red banner: "Cannot approve — CR-026 blocks: pyrophoric line without inert purge confirmation." + evidence chain.
  2. Approver either (a) resolves underlying condition (e.g., ingest purge event via OT-006) or (b) rejects permit.
  3. Once condition clears, approver retries.
- **Alternate Paths:** CSO override with dual-sign + auditable reason (rare).
- **Success criteria:** 100% high-severity CR blocks respected without override in normal operations.

---

# PART D — LOCKOUT / TAGOUT

---

## UF-LOTO-001 · LOTO Isolation Planning

- **Actors:** LOTO Planner (Sanjay / senior tech), AG-008 LOTO Agent, `loto-service`, KG-005 P&ID graph.
- **Preconditions:** Linked PTW is `APPROVED` (or `DRAFT_SUBMITTED` with LOTO-first policy); equipment in scope.
- **Trigger:** From UI-010 LOTO Workspace, user clicks **New Isolation**.
- **Primary Path:**
  1. Equipment tag selected → KG graph traversal identifies energy sources (electrical, hydraulic, pneumatic, chemical, thermal, mechanical stored energy).
  2. AG-008 generates isolation plan: recommended lockout points, sequence, verification tests (bump test, zero-energy validation).
  3. Planner reviews plan; adds/removes points, sets responsible authorized workers.
  4. Group lock configuration: lock box, individual worker padlocks, tag IDs.
  5. Plan saved → `LOTO_PLAN` state → routes to LOTO approval (UF-LOTO-002).
- **Alternate Paths:** Complex isolation → multi-planner collaboration; SME review requested.
- **Error Paths:** P&ID conflict → block; CR-027 wrong-line check pre-runs.
- **AI interactions:** AG-008 planning, RAG-002 citations to isolation standard.
- **Events:** Produces `loto.plan.created.v1`.

---

## UF-LOTO-002 · LOTO Approval & Application

- **Actors:** Authorized worker, Sanjay, AG-008, AG-019.
- **Preconditions:** LOTO plan approved.
- **Trigger:** Field team ready to apply locks.
- **Primary Path:**
  1. Worker opens MOB-006 → LOTO plan checklist appears in sequence.
  2. For each isolation point: worker scans equipment QR (`MOB-012`) → app validates location matches P&ID → worker applies lock → photographs → verifies zero-energy (voltage test / valve stem position).
  3. State transitions per point: `PENDING → APPLIED → VERIFIED`.
  4. Once all points `VERIFIED`, LOTO → `ACTIVE`; linked PTW transitions to executable.
  5. CR-027 wrong-line-break monitor runs continuously.
- **Alternate Paths:**
  - **A1 — Group lock:** Lock box sealed; each worker adds personal lock via MOB-006.
  - **A2 — Partial isolation:** Explicit approval required; higher-risk state.
- **Error Paths:** QR scan mismatch (wrong equipment) → block; missing verification photo → cannot advance; energy still present → block with critical alert.
- **AI interactions:** CR-027 verification; AG-008 confirmation.
- **Backend services:** `loto-service`, `cr-engine`.
- **APIs:** `POST /v2/loto/{id}/points/{pt}/apply` · `POST /v2/loto/{id}/points/{pt}/verify`
- **Events:** `loto.state.v1`, `loto.applied.v1`, `loto.verified.v1`.
- **Success criteria:** 100% verification photos captured; zero un-verified `ACTIVE` states.
- **Failure states:** Verification failed → escalates to Sanjay via AG-019.

---

## UF-LOTO-003 · LOTO Removal (Group + Personal Locks)

- **Actors:** Authorized worker(s), Sanjay, AG-008.
- **Preconditions:** LOTO `ACTIVE`; linked PTW closed or work paused.
- **Trigger:** Worker taps **Remove Lock** on MOB-006.
- **Primary Path:**
  1. Worker scans lock QR → identity match required → biometric confirm.
  2. Removes personal lock; app updates state.
  3. When all personal locks removed AND authorized worker confirms zero-personnel-at-risk, group lock removal enabled.
  4. Authorized worker removes group lock → LOTO → `RELEASED`; equipment restored.
- **Alternate Paths:**
  - **A1 — Forgotten lock (worker off-site):** Emergency lock removal procedure (LOTO-013) → dual-sign approval + contact worker.
- **Error Paths:** Attempt to remove another worker's lock → hard block.
- **AI interactions:** AG-019 broker mediates any override.
- **Events:** `loto.removed.v1`, `loto.emergency_removal.v1`.
- **Success criteria:** Zero unauthorized lock removals.

---

## UF-LOTO-004 · CR-004 Violation — LOTO Removed + Equipment Command Detected

- **Actors:** CR engine, AG-019, Anita, on-call HSE.
- **Preconditions:** LOTO plan `ACTIVE`.
- **Trigger:** DCS command detected on equipment while LOTO active (event `dcs.command.v1`).
- **Primary Path:**
  1. CR-004 fires → CompoundRisk.v2 CRITICAL → Anita receives Decision Card.
  2. Automatic mitigations: DCS block if IEC 62443 zone allows; ER-001 emergency assessment triggered if severity warrants.
  3. Anita confirms threat → escalates to full ER (UF-ER-001) or resolves as spurious.
- **Success criteria:** Detection ≤ 2s; zero missed events in shadow tests.

---

# PART E — INCIDENT REPORTING & RCA

---

## UF-INC-001 · Native Incident Reporting (Web / Mobile)

- **Actors:** Reporter (any user), Sanjay, Deepak, AG-011 Incident Intelligence Agent, `incident-service`.
- **Preconditions:** User has incident-report capability.
- **Trigger:** User clicks **Report Incident** on UI-012 or MOB-008.
- **Primary Path:**
  1. Form loads with severity ladder (First-Aid → Medical → LTI → SIF), incident type (injury / near-miss / process safety / environmental / fire / release / dropped object / other).
  2. Auto-fields prefilled from geolocation + active PTW/LOTO context.
  3. Reporter fills: when, where (map picker), who (worker list with role), what happened (structured + free text), immediate actions taken.
  4. Attach photos/videos (face-blurred at edge via CV-021), witness list.
  5. INC-003 auto-assembly: system links to CV events, sensor readings, active permits, KG asset context.
  6. Submit → `POST /v2/incidents` → `incident-service` persists as `REPORTED` → triggers UF-INC-002 severity classification + UF-INC-004 initial notification.
- **Alternate Paths:**
  - **A1 — Near-miss fast-capture** (INC-002): One-tap 30-sec form for near-misses.
  - **A2 — Anonymous whistleblower** (INC-014): Zero-PII channel; cryptographic anonymity via SEC-004.
  - **A3 — Auto-drafted by CV** (CV-010 slip/trip/fall detection): CV creates incident.autodraft.v1; supervisor reviews & confirms.
- **Error Paths:** Location mismatch (GPS outside site) → warning; submission still allowed with justification.
- **AI interactions:** AG-011 auto-populates likely causes; RAG-002 similar incidents; INC-006 GNN RCA later.
- **Backend services:** `incident-service`, `evidence-service`, `kg-service`, `cv-event-store`.
- **APIs:** `POST /v2/incidents` · `POST /v2/incidents/{id}/attachments` · `GET /v2/incidents/similar?text=`
- **Events:** Produces `incident.created.v1`; consumes `cv.event.v2`, `sensor.gas.v1`, `ptw.active.v1`.
- **Success criteria:** Time-to-file ≤ 5 min median; near-miss reporting rate ≥ 3× baseline.

---

## UF-INC-002 · Severity Classification & Auto-Notification

- **Actors:** AG-011, Sanjay, Deepak, HR, `incident-service`, `notification-service`.
- **Preconditions:** Incident just reported (`incident.created.v1`).
- **Trigger:** Event received.
- **Primary Path:**
  1. AG-011 classifies severity from structured + text + attachments (INC-004); AG-018 confidence.
  2. If suspected SIF/LTI: auto-notify Deepak, site leadership within 15 min; CSO within 30 min.
  3. Auto-notify next-of-kin workflow **routed through UF-INC-005 Trauma-Informed Notification** (INC-023) — no automated message delivery.
  4. Regulatory clock starts for OSHA 8-hour / 24-hour reporting (INC-011).
- **Error Paths:** Classification uncertain → routes to human via AG-019 for verification.
- **Events:** `incident.severity_classified.v1`, `incident.sif.confirmed.v1` (after human verify), `regulatory.clock.started.v1`.
- **Success criteria:** SIF notification ≤ 15 min p95; regulatory draft ready ≤ 90s.

---

## UF-INC-003 · Evidence Bundle Assembly & Chain-of-Custody

- **Actors:** `evidence-service`, INC-017 legal hold, INC-022 twin snapshot.
- **Preconditions:** Incident record exists.
- **Trigger:** `incident.created.v1` fires.
- **Primary Path:**
  1. Service pulls: CV frames (face-blurred), sensor timeseries (T-30 min to T+30 min), permits active, LOTOs active, roll-call state, weather, DT snapshot (INC-022).
  2. Bundle signed with cosign (`SEC-007`) → WORM store.
  3. Access controlled; download requires step-up + audit.
- **Alternate Paths:** Legal hold placed → INC-017 override on retention (CV-023 embeddings preserved).
- **Error Paths:** Missing CV data → gap noted; bundle nonetheless assembled.
- **Events:** `evidence.bundle.v1`, `evidence.twin_snapshot.v1`.
- **Success criteria:** Bundle ≤ 5 min from incident report.

---

## UF-INC-004 · RCA Investigation (5-Why / Bowtie / GNN-Assisted)

- **Actors:** Deepak (Investigation Lead), Sanjay, subject experts, AG-011, `rca-service`.
- **Preconditions:** Incident `REPORTED`; evidence bundle ready.
- **Trigger:** Deepak opens UI-005 RCA Workspace.
- **Primary Path:**
  1. Workspace loads: evidence bundle browser, timeline, DT playback (via INC-022 snapshot), similar incidents (INC-009).
  2. Investigation team invited (multi-user real-time collaboration).
  3. Template selected: 5-Why, Bowtie, TapRooT, Ishikawa.
  4. GNN-based hypothesis generator (INC-006) proposes ranked causes with confidence bands; team accepts/rejects/adds.
  5. Root causes finalized; each linked to CAPA (UF-COMP-002).
  6. RCA signed off → `RCA_COMPLETE`.
- **Alternate Paths:** Insurer / regulator observer invited in read-only.
- **AI interactions:** INC-006 GNN, AG-018 uncertainty, INC-010 precursor patterns.
- **Backend services:** `rca-service`, `gnn-service`, `dt-playback-service`.
- **APIs:** `POST /v2/rca/{id}/hypotheses` · `POST /v2/rca/{id}/root-causes`
- **Events:** `rca.hypothesis.v1`, `rca.completed.v1`.
- **Success criteria:** RCA cycle time ↓ ≥ 40% vs. baseline.

---

## UF-INC-005 · Trauma-Informed Notification & Support (INC-023)

- **Actors:** HR, Occupational Health, Deepak; **no AI automation** by design (AG-004 forbidden capability `deliver_family_notification`).
- **Preconditions:** SIF confirmed.
- **Trigger:** `incident.sif.confirmed.v1`.
- **Primary Path:**
  1. HR receives templated **checklist** + **script** — human delivers every message.
  2. Next-of-kin contact retrieved from HRIS integration; multiple contact methods surfaced.
  3. Return-to-work coordinator assigned; EAP resources surfaced for team.
  4. Workforce mental-health resources routed to affected shift.
  5. Each step signed off in workflow.
- **Alternate Paths:** International worker → consulate contact protocol.
- **Error Paths:** Contact unreachable → escalation ladder.
- **AI interactions:** **None deliberately** — encoded in AG-004.
- **Events:** `hr.notification.task.v1`, `hr.contact.completed.v1`.
- **Success criteria:** HR contact ≤ 2h post SIF confirmation; 100% humanly delivered.

---

# PART F — EMERGENCY RESPONSE

---

## UF-ER-001 · Emergency Detection & Confirmation (Fusion-Verified)

- **Actors:** Anita, ER Team, CV-033 fusion service, AG-010 Emergency Response Agent, `signal-fusion-service`, `hitl-broker`.
- **Preconditions:** Fire, gas, spill, or other detectors + CV active.
- **Trigger:** Any of: CV-011 fire, CV-012 smoke, gas alarm, fire panel signal, thermal spike.
- **Primary Path:**
  1. CV-033 fusion evaluates evidence: CV-only? Gas-only? CV+Gas?
  2. CV-only ⇒ MONITOR; CV+Gas or Gas-only ⇒ `emergency.trigger.candidate.v1` created.
  3. UI-008 Emergency Command Console lights up with candidate badge.
  4. Anita reviews evidence chain; approves → `emergency.trigger.confirmed.v1` → **UF-ER-002 activated**.
- **Alternate Paths:** Auto-confirm if Gas-only + panel alarm (site policy).
- **Error Paths:** False positive → Anita rejects → feedback to CV-033 fusion.
- **AI interactions:** CV-033 Bayesian fusion, AG-010 pre-briefing, AG-019 broker.
- **Events:** `emergency.trigger.candidate.v1`, `emergency.trigger.confirmed.v1`.
- **Success criteria:** Trigger decision ≤ 3s; FP rate ↓ ≥ 60% vs. CV-only.

---

## UF-ER-002 · Emergency Activation & Command

- **Actors:** ER Commander (Deepak / designated), ER Team, Anita, AG-010.
- **Preconditions:** `emergency.trigger.confirmed.v1`.
- **Trigger:** Event received.
- **Primary Path:**
  1. UI-008 Emergency Command Console takes over screens for ER roles; site-wide siren + PA + mobile push activated.
  2. Auto-actions: HVAC shutdown for affected zone (if IEC 62443 zone permits), permit auto-suspension for area (all impacted PTWs), LOTO status frozen, DCS advisories.
  3. AG-010 recommends response playbook (matched from KG-emergency library, RAG-002 citations).
  4. Commander confirms playbook or overrides.
  5. Roll-call activated (mobile push to all workers, must acknowledge safety at assembly point).
- **Alternate Paths:** Multiple simultaneous emergencies → command console splits into zones.
- **Error Paths:** Playbook missing → generic evacuation.
- **AI interactions:** AG-010 playbook recommendation, RAG-002 citations.
- **Backend services:** `emergency-service`, `notification-service`, `dcs-integration`, `roll-call-service`.
- **APIs:** `POST /v2/emergency/{id}/activate` · `POST /v2/emergency/{id}/playbook/select`
- **Events:** `emergency.activated.v1`, `permits.auto_suspended.v1`, `roll_call.started.v1`.
- **Success criteria:** Activation ≤ 10s from confirmation; siren ≤ 15s.

---

## UF-ER-003 · Roll-Call & Muster Verification

- **Actors:** All on-site workers, Commander, `roll-call-service`, MOB-009.
- **Preconditions:** Emergency activated.
- **Trigger:** `roll_call.started.v1`.
- **Primary Path:**
  1. Every worker mobile receives push: "Emergency: proceed to Assembly Point A. Acknowledge when safe."
  2. Worker taps **I am safe** at muster point → app validates GPS + BLE anchor at muster.
  3. Commander sees live tally on UI-008: accounted / missing / delayed.
  4. Missing workers surfaced with last-known location (from CV + BLE), photograph (face-blurred), assigned zone.
- **Alternate Paths:**
  - **A1 — Manual roll-call:** Muster leader marks workers manually if mobile unavailable.
  - **A2 — Injured worker:** Marks **Need help** → immediate ER Team dispatch.
- **Error Paths:** GPS mismatch → warn; muster leader can override with manual confirm.
- **AI interactions:** ER-005 dynamic evacuation routes with CV-019 blocked-egress awareness.
- **Backend services:** `roll-call-service`, `rtls-service`, `route-service`.
- **APIs:** `POST /v2/rollcall/{id}/checkin` · `GET /v2/rollcall/{id}/status`
- **Events:** `worker.checked_in.v1`, `worker.missing.v1`.
- **Success criteria:** 100% accounted within 10 min (typical site drill target).

---

## UF-ER-004 · Emergency Stand-Down & After-Action

- **Actors:** Commander, Deepak.
- **Preconditions:** Threat cleared.
- **Trigger:** Commander clicks **Stand Down**.
- **Primary Path:**
  1. Stand-down broadcast; sirens off; area re-classified.
  2. Auto-generated After-Action Report draft: timeline, actions taken, communication effectiveness, worker feedback.
  3. Post-emergency review scheduled; feeds into CAPA (INC-021) if lessons emerge.
- **Events:** `emergency.standdown.v1`, `after_action.drafted.v1`.
- **Success criteria:** After-Action draft ≤ 4h post stand-down.

---

# PART G — AI COPILOT

---

## UF-COP-001 · Contextual AI Copilot (Side Panel)

- **Actors:** Any user, RAG-*, AG-018, AG-020 (kill-switch), `copilot-service`.
- **Preconditions:** User signed in; not blocked by kill-switch at tenant scope.
- **Trigger:** User clicks Copilot icon (persistent right-edge chrome) OR keyboard shortcut Cmd+/.
- **Primary Path:**
  1. Side panel opens; carries current screen context (workspace + selected entity + filters).
  2. User types or speaks question: "Show me all hot-work permits near vessel V-201 today with LEL trend."
  3. `copilot-service` routes via AG-017 model router (cost/latency/groundedness) → composed answer.
  4. Response streams with citations (RAG-002), uncertainty bar (AG-018), suggested follow-ups.
  5. User clicks a citation → jumps to source document / permit / event.
- **Alternate Paths:**
  - **A1 — Voice input** on mobile (MOB-*): STT via on-prem model.
  - **A2 — Action-taking:** "Suspend PTW-4472" → Copilot doesn't act directly; routes via AG-019 Decision Card.
- **Error Paths:**
  - **E1 — Kill-switch:** Panel shows "AI paused" banner; input disabled.
  - **E2 — Low groundedness:** Response withheld, user informed.
  - **E3 — Off-scope query:** Governance Agent (AG-003) blocks (e.g., "Who is the person in this camera?" — biometric identification forbidden).
- **AI interactions:** AG-003 governance, AG-017 routing, AG-018 uncertainty, RAG-002 citation, AG-020 kill.
- **Backend services:** `copilot-service`, `model-router`, `rag-service`, `governance-agent`.
- **APIs:** `POST /v2/copilot/query` · `WS /v2/copilot/stream`
- **Events:** `copilot.query.v1`, `copilot.answer.v1`, `governance.blocked.v1`.
- **Success criteria:** p95 first token ≤ 2s; groundedness ≥ 95%; zero forbidden-capability invocations.
- **Failure states:** Model timeout, router degraded → fallback model with reduced quality banner.

---

## UF-COP-002 · Proactive Copilot Insight Cards

- **Actors:** Copilot, user.
- **Preconditions:** Sufficient data for insight; user has permission.
- **Trigger:** Time-based (start of shift) or event-based (KPI drift).
- **Primary Path:**
  1. Copilot posts insight card on dashboard: "Near-miss rate ↑ 34% this month, mostly PPE hardhat category — 3 candidate CAPAs available."
  2. User can accept / dismiss / route into a CAPA workflow.
- **Alternate Paths:** Executive digest via email (opt-in).
- **Success criteria:** ≥ 30% insight cards result in a follow-up action.

---

## UF-COP-003 · Copilot for Regulatory Draft

- **Actors:** Deepak, AG-013 Compliance Agent, RAG-002.
- **Preconditions:** Incident closed OR audit prep OR reporting deadline.
- **Trigger:** User selects **Draft OSHA 300** / **IR-1** / **Annex IV**.
- **Primary Path:**
  1. Copilot compiles draft with citations; user reviews; edits; signs.
  2. Submission to regulator via authenticated channel (Regulator connector).
- **Success criteria:** Draft ≤ 90s; groundedness ≥ 95%; regulator acceptance rate ↑.

---

## UF-COP-004 · Copilot Debug View (Applied AI / Auditor)

- **Actors:** Applied AI lead, Kavya (auditor).
- **Preconditions:** Role has `copilot.debug.view`.
- **Trigger:** From Copilot toolbar, click **Show reasoning**.
- **Primary Path:**
  1. Debug drawer shows: retrieved chunks, model chosen (AG-017), prompt template version, token cost (OBS-010), uncertainty (AG-018), guardrails triggered.
- **Success criteria:** 100% AI interactions inspectable in retention window.

---

# PART H — KNOWLEDGE SEARCH

---

## UF-KS-001 · Universal Search (Cmd+K)

- **Actors:** Any user, `search-service`.
- **Preconditions:** User signed in.
- **Trigger:** User presses Cmd+K or clicks search bar.
- **Primary Path:**
  1. Palette opens with recent + suggested; typing filters across permits, equipment, incidents, workers (respecting privacy per SEC-004), documents (SOPs, MSDS, PHA), CompoundRisks, KG entities.
  2. Results grouped by type; each card carries context and confidence.
  3. Enter navigates to entity workspace.
- **Alternate Paths:** Voice search (mobile).
- **Error Paths:** No results → suggests query reformulation via Copilot.
- **AI interactions:** Hybrid retrieval (BM25 + vector); AG-003 governance filters PII.
- **APIs:** `GET /v2/search?q=&types=` · `GET /v2/search/suggest`
- **Success criteria:** p95 first result ≤ 300ms.

---

## UF-KS-002 · Deep Knowledge Query (RAG)

- **Actors:** Any user, RAG-*.
- **Preconditions:** Knowledge corpus indexed.
- **Trigger:** Question posed via Copilot side panel or KS-002 dedicated workspace.
- **Primary Path:**
  1. RAG service retrieves top-k chunks across SOP / PHA / MSDS / OSHA / OISD / internal wiki.
  2. Synthesizes answer with inline citations.
  3. User can pin answer to a workspace or export.
- **Alternate Paths:** Multi-turn refinement.
- **Error Paths:** Groundedness < threshold → withhold; suggest human expert.
- **Success criteria:** Groundedness ≥ 95%; user thumbs-up ≥ 70%.

---

## UF-KS-003 · Document Ingest & Governance

- **Actors:** Deepak, Kavya, Content Admin.
- **Preconditions:** Admin role.
- **Trigger:** Upload new SOP / PHA / MSDS.
- **Primary Path:**
  1. Admin uploads to UI-018 Knowledge Console.
  2. Ingest pipeline: parse → chunk → embed → KG mapping (KG-009) → policy classification (public / internal / restricted).
  3. Version tagged; older version deprecated but retrievable.
- **Success criteria:** Ingest ≤ 2 min; RAG retrieval hits new content within 5 min.

---

# PART I — DIGITAL TWIN

---

## UF-DT-001 · Live Twin View (UI-011)

- **Actors:** Anita, Sanjay, Deepak, `dt-service`.
- **Preconditions:** DT geometry synced; live event streams healthy.
- **Trigger:** Click UI-011.
- **Primary Path:**
  1. 3D scene loads (DT-001 geometry) with layers toggleable: workers (anchored via CV-007), MHE (CV-008), zones, hazards, sensors, permits, LOTOs, CompoundRisks.
  2. Clicking a worker (avatar) shows role, cert, current PTW, PPE state (aggregated per CV-016 policy).
  3. Sensor overlays pulse in color to indicate reading vs. threshold.
- **Alternate Paths:**
  - **A1 — VR/AR view:** For training or immersive review.
- **Error Paths:** Data lag → banner.
- **AI interactions:** DT-006 plume model, DT-004 MHE path prediction.
- **Backend services:** `dt-service`, `event-bus-gateway`.
- **APIs:** `GET /v2/twin/state?site=` · `WS /v2/twin/stream?site=`
- **Events:** Consumes worker/MHE/sensor/CR events.
- **Success criteria:** Twin state refresh ≤ 1s p95.

---

## UF-DT-002 · Time-Slider Playback (INC-022 / DT-010)

- **Actors:** Investigator (Deepak), auditor, regulator.
- **Preconditions:** Snapshot or historical range in retention.
- **Trigger:** From incident record, click **Play scene**.
- **Primary Path:**
  1. Twin renders scene at incident time (INC-022 snapshot); slider scrubs -30/+30 minutes.
  2. Events overlay in temporal sequence.
- **Alternate Paths:** Multi-camera synchronized video overlay (face-blurred).
- **Success criteria:** Playback ≤ 3s to first frame.

---

## UF-DT-003 · Twin Scenario Simulation (DT-006 plume)

- **Actors:** Deepak, ER planner.
- **Preconditions:** Twin healthy.
- **Trigger:** Click **Simulate scenario** in DT.
- **Primary Path:**
  1. Choose scenario: gas leak from vessel V-201, wind 8 m/s SW.
  2. Plume model runs; predicted concentration overlays; evacuation routes recomputed.
  3. Save as tabletop exercise.
- **Success criteria:** Scenario runs ≤ 30s.

---

# PART J — NOTIFICATIONS

---

## UF-NOT-001 · Notification Tray & Real-Time Alerts

- **Actors:** Any user, `notification-service`.
- **Preconditions:** User has preferences configured.
- **Trigger:** Event lands on subscribed channel.
- **Primary Path:**
  1. New alert appears in tray badge; toast for critical.
  2. Clicking alert deep-links to source (risk, permit, incident, decision card).
  3. User can snooze, mark read, escalate.
- **Alternate Paths:** Do Not Disturb schedule per user; on-call override.
- **Error Paths:** Delivery failure → retry with backoff; SMS / voice fallback for critical.
- **AI interactions:** AG-011 deduplication; alert fatigue metric (OBS-011).
- **Backend services:** `notification-service`.
- **APIs:** `GET /v2/notifications` · `POST /v2/notifications/{id}/ack`
- **Success criteria:** p95 delivery ≤ 5s for critical; alert fatigue score under threshold.

---

## UF-NOT-002 · Multi-Channel Escalation

- **Actors:** `notification-service`, on-call rotation (OBS-012), AG-019 broker.
- **Preconditions:** Decision Card SLA at risk of breach.
- **Trigger:** SLA threshold approaching.
- **Primary Path:**
  1. Escalation ladder invoked: in-app → mobile push → SMS → voice call.
  2. If no acknowledgment, next tier in on-call rotation notified.
- **Alternate Paths:** Group channel (Teams / Slack) integration.
- **Success criteria:** Zero unacked critical alerts beyond SLA.

---

## UF-NOT-003 · Union-Transparent Camera Change Notification (CV-031)

- **Actors:** Camera admin, Union Rep contact.
- **Preconditions:** Camera analytics configuration change requested.
- **Trigger:** Save on camera config.
- **Primary Path:**
  1. Change queued; notification to Union Rep within 15 min (NOT channel dedicated).
  2. Change goes live per policy (may include cooling-off period).
- **Success criteria:** 100% analytics config changes notified.

---

# PART K — ANALYTICS

---

## UF-ANA-001 · Executive Analytics (UI-002)

Covered in UF-DASH-002; here we detail deep drill:
- **Primary path additions:** Drilldown from KPI → cohort (site / unit / contractor) → feature-level metrics; export to board pack.
- **Success criteria:** 100% KPIs traceable to raw event.

---

## UF-ANA-002 · Investigator Analytics (UI-005 RCA)

- **Actors:** Deepak, Meena (Analyst).
- **Trigger:** From incident, click **Analytics**.
- **Primary Path:**
  1. Cohort of similar incidents; leading indicators; precursor patterns (INC-010); CR patterns that fired in vicinity.
  2. Regression / trend analysis of contributing factors.
- **Success criteria:** Insight-to-hypothesis time ↓ 50%.

---

## UF-ANA-003 · Custom Query (Self-Service)

- **Actors:** Meena (analyst).
- **Preconditions:** Role has `analytics.query`.
- **Trigger:** Open Query Studio (UI-021).
- **Primary Path:**
  1. Natural-language → SQL (via Copilot) or direct SQL over Trino on gold layer.
  2. Results saved as dashboards; sharing respects RBAC.
- **Alternate paths:** Governed query (row-level security by tenant + site + role).
- **Success criteria:** Query < 5s for 90-day scope.

---

# PART L — CONTRACTOR WORKFLOW

---

## UF-CON-001 · Contractor Individual Onboarding (Site Visit Prep)

- **Actors:** Contractor Rep (company), Contractor Worker, Sanjay, `contractor-service`.
- **Preconditions:** Contractor company MSA active; PO issued.
- **Trigger:** Contractor Rep invites worker via portal.
- **Primary Path:**
  1. Rep enters worker profile: name, role, docs (medical, insurance), certifications, training.
  2. Worker receives invite; completes site-specific safety orientation e-learning + quiz (CON-002).
  3. Worker uploads photo (face-blurred by CV-021 downstream if surfaced), biometric enrolled to on-device only (never sent to cloud, per AG-004 no-biometric-identification).
  4. Site badge issued (QR + optional RFID) via CON-003.
  5. Worker enrolled in on-site RTLS / access-control.
- **Alternate Paths:** Bulk import for turnaround crews.
- **Error Paths:** Expired cert → onboarding blocked.
- **AI interactions:** RAG-* orientation Q&A; cert validity check via KG-006.
- **APIs:** `POST /v2/contractors/workers` · `POST /v2/contractors/workers/{id}/orient`
- **Events:** `contractor.worker.onboarded.v1`.
- **Success criteria:** Onboarding ≤ 30 min per worker.

---

## UF-CON-002 · Contractor Daily Sign-In & PTW Alignment

- **Actors:** Contractor Worker, Site Security, MOB-*.
- **Preconditions:** Onboarded; site day access issued.
- **Trigger:** Worker arrives at gate.
- **Primary Path:**
  1. Gate scan (RFID/QR) → validates: badge active, medical/cert current, active PTW covers scheduled work, LSR training current.
  2. Worker receives day briefing on mobile; must acknowledge.
- **Alternate Paths:** Emergency contact updated at gate.
- **Error Paths:** Cert lapsed → denied entry; auto-notify rep.
- **Events:** `contractor.entry.v1`, `contractor.denied.v1`.
- **Success criteria:** Gate processing ≤ 30s per worker.

---

## UF-CON-003 · Contractor Performance & Compliance Score

- **Actors:** Deepak, Contractor Rep.
- **Preconditions:** History of interactions.
- **Trigger:** Open Contractor Console (UI-017).
- **Primary Path:**
  1. Scorecard: violations, near-misses, PTW quality, LOTO adherence, training currency.
  2. Trend line; risk band.
  3. Deepak / procurement uses in vendor review.
- **AI interactions:** Copilot narrative summary.
- **Success criteria:** Scorecard drives measurable vendor improvement.

---

# PART M — AUDIT WORKFLOW

---

## UF-AUD-001 · Auditor Onboarding & Scoped Access

- **Actors:** Kavya (Auditor), Regulator, Deepak (sponsor), `iam-service`.
- **Preconditions:** Audit engagement authorized.
- **Trigger:** Sponsor issues audit invite.
- **Primary Path:**
  1. Auditor account provisioned via SCIM with `audit_read` role.
  2. Time-boxed access window (e.g., 30 days) scoped to site(s).
  3. Auditor lands on UI-019 Auditor Portal — WORM read view with signed provenance on every artifact.
- **Alternate Paths:** External regulator identity via federated SSO.
- **Error Paths:** Scope drift → denied with audit log.
- **Success criteria:** 100% auditor actions logged; zero unauthorized reads.

---

## UF-AUD-002 · Evidence Retrieval & Export

- **Actors:** Kavya, `evidence-service`.
- **Preconditions:** Access valid.
- **Trigger:** Auditor queries records (permits, incidents, CAPAs, model cards).
- **Primary Path:**
  1. Query returns signed evidence bundles (SEC-007).
  2. Export produces cryptographically signed zip / PDF with SHA + provenance.
  3. Every export logged with justification.
- **Alternate Paths:** Live walkthrough via UI-011 Digital Twin snapshots.
- **Success criteria:** Export ≤ 30s per bundle.

---

## UF-AUD-003 · Model & AI Audit Trail

- **Actors:** Kavya, Regulator.
- **Preconditions:** EU AI Act / audit request.
- **Trigger:** Auditor selects a model version.
- **Primary Path:**
  1. Portal shows model card (DP-015 Annex IV), training data hash, evaluation, fairness (CV-030), drift (DP-007), rollouts (CV-025), kill-switch history (AG-020), governance blocks (AG-003).
  2. Every AI decision traceable to a reproducibility bundle (DP-014).
- **Success criteria:** Complete Annex IV pack retrievable ≤ 30s.

---

# PART N — COMPLIANCE WORKFLOW

---

## UF-COMP-001 · Regulatory Reporting Draft & Submission

- **Actors:** Deepak, AG-013 Compliance Agent, `compliance-service`.
- **Preconditions:** Incident or scheduled report due.
- **Trigger:** Deadline approaches OR event triggers OSHA clock.
- **Primary Path:**
  1. AG-013 drafts report (OSHA 300/301, IR-1, DGMS, Bureau Veritas, EU AI Act Annex IV).
  2. Deepak reviews; edits; signs with step-up.
  3. Submits via regulator connector; acknowledgment stored.
- **Alternate Paths:** Multi-jurisdiction routing (EU-DE + EU-FR).
- **Error Paths:** Regulator API down → queued with retry.
- **AI interactions:** AG-013, RAG-002, AG-018.
- **APIs:** `POST /v2/compliance/report/draft` · `POST /v2/compliance/report/submit`
- **Events:** `regulatory.filing.drafted.v1`, `regulatory.filing.submitted.v1`.
- **Success criteria:** ≥ 95% reports submitted before deadline.

---

## UF-COMP-002 · CAPA Lifecycle (INC-021)

- **Actors:** Deepak, action owners, Meena.
- **Preconditions:** RCA complete; CAPA opened.
- **Trigger:** RCA closes with root causes.
- **Primary Path:**
  1. AG-011 extracts CAPA candidates from RCA; owner assigned; due date set.
  2. Actions tracked on CAPA board; overdue escalates.
  3. Effectiveness verification scheduled ≥ 30 days post-close; KPI drift detection confirms.
  4. Systemic causes feed CR-001 pattern candidate (new detection pattern proposed).
- **Alternate Paths:** External regulator-required CAPA fed by INC-011.
- **Error Paths:** Effectiveness fails → CAPA reopened.
- **AI interactions:** AG-011 extraction, AG-018 confidence, KPI drift.
- **Success criteria:** 100% SIF/LTI CAPAs closed ≤ 90d; effectiveness verified ≤ 30d post-close.

---

## UF-COMP-003 · ISO 45001 / EU AI Act Continuous Assurance

- **Actors:** Compliance officer, CSO, Kavya.
- **Preconditions:** Certification cycle.
- **Trigger:** Scheduled review OR external audit.
- **Primary Path:**
  1. UI-020 Compliance Console shows live coverage against ISO 45001 clauses, EU AI Act Annex IV, IEC 62443 controls.
  2. Gaps flagged with owner and due date.
  3. Evidence auto-linked from platform.
- **Success criteria:** Continuous audit readiness (no scramble before certifier arrives).

---

# PART O — ADMIN WORKFLOWS

---

## UF-ADM-001 · Tenant Configuration & Feature Flag Governance

- **Actors:** Tenant Admin, Neha, PLT-004 flag service.
- **Preconditions:** Admin role.
- **Trigger:** Admin opens UI-014.
- **Primary Path:**
  1. Admin toggles features per policy; each toggle logged with reason.
  2. Forbidden toggles (e.g., `cv.face_blur.enabled` OFF) blocked by AG-004 capability.
  3. Change goes through WFP-005 approval framework for high-impact toggles.
- **APIs:** `PATCH /v2/tenants/{id}/flags`
- **Success criteria:** 100% flag changes audited.

---

## UF-ADM-002 · User & Role Management

- **Actors:** Tenant Admin.
- **Preconditions:** Admin role.
- **Trigger:** Add user / modify roles.
- **Primary Path:**
  1. SCIM-provisioned users listed; local user creation limited.
  2. Role bundles assigned (Anita-type, Sanjay-type, etc.); custom bundles reviewed by security.
- **Error Paths:** Role bundle violates least-privilege → warning.
- **Success criteria:** Median provisioning ≤ 5 min.

---

## UF-ADM-003 · Model Lifecycle Console (DP-004 / AG-020)

- **Actors:** Applied AI lead, Neha, CSO.
- **Preconditions:** Model registered.
- **Trigger:** Ops event (drift, retraining, incident).
- **Primary Path:**
  1. Console shows models with versions, canary status, drift, calibration (AG-018), fairness (CV-030).
  2. Actions: promote, rollback, kill-switch (per-model, per-tenant, global).
  3. Kill / rollback requires dual-sign (WFP-005).
- **APIs:** `POST /v2/models/{id}/kill` · `POST /v2/models/{id}/promote`
- **Events:** `model.rolled_back.v1`, `model.disabled.v1`.
- **Success criteria:** Kill ≤ 30s global; rollback ≤ 5 min.

---

## UF-ADM-004 · Policy-as-Code Publish (WFP-006)

- **Actors:** Neha, Policy owner.
- **Preconditions:** Policy repo access.
- **Trigger:** PR merged in policy repo.
- **Primary Path:**
  1. CI signs release; publishes to OPA (WFP-003).
  2. Change surfaces on UI-019 with diff.
- **Success criteria:** Policy propagation ≤ 60s across services.

---

# PART P — AI EXPLANATIONS

---

## UF-AIX-001 · "Why?" Panel on Any AI Output

- **Actors:** Any user.
- **Preconditions:** AI output present.
- **Trigger:** User clicks **Why?** on a card / row / alert.
- **Primary Path:**
  1. Panel shows: evidence chain (event ids + timestamps + provenance), model version, confidence + uncertainty (AG-018), guardrails, citations (RAG-002), counterfactual where applicable (CR-017).
  2. Link to model card (DP-015) for deep dive.
- **Alternate Paths:** Feedback thumbs up/down → active learning label (DP-009).
- **Success criteria:** 100% AI outputs have Why? panel; median panel load ≤ 500ms.

---

## UF-AIX-002 · Counterfactual Explanation ("What if?")

- **Actors:** Sanjay, Deepak, auditor.
- **Preconditions:** CompoundRisk or PHM forecast has counterfactual template.
- **Trigger:** User clicks **What if?**.
- **Primary Path:**
  1. Panel poses counterfactual (e.g., "If LEL stayed <5%, this would be MONITOR only").
  2. User can toggle variables and see decision boundary shift.
- **Success criteria:** Counterfactuals produced for 100% CR patterns.

---

## UF-AIX-003 · Fairness & Bias Transparency (CV-030)

- **Actors:** Union Rep, Deepak, auditor.
- **Preconditions:** Fairness panel available.
- **Trigger:** User opens Fairness view.
- **Primary Path:**
  1. Per-model demographic parity delta shown; drilldown by role/shift/subgroup.
  2. Any promotion gated on parity delta ≤ 2%.
- **Success criteria:** Parity metrics current and human-readable.

---

# PART Q — MOBILE WORKFLOWS

---

## UF-MOB-001 · Field Home & Task Feed

- **Actors:** Ravi, Contractor Worker.
- **Preconditions:** UF-AUTH-002 complete.
- **Trigger:** App launch.
- **Primary Path:**
  1. Home shows shift status, active PTWs assigned, LOTO tasks, notifications, big red **Report Hazard** button.
  2. Cards optimized for gloved touch (≥ 60pt targets).
- **Alternate Paths:** Offline mode (MOB-004) with cached data + queued writes.
- **Success criteria:** First interactive ≤ 1s cold-start on mid-tier Android.

---

## UF-MOB-002 · Hazard / Near-Miss Report (Fast Capture)

- **Actors:** Any worker.
- **Preconditions:** MOB-001.
- **Trigger:** Tap **Report Hazard**.
- **Primary Path:**
  1. One-tap: photo → auto-blur face at edge (CV-021 mobile lite) → location auto-filled → category chip.
  2. Optional voice note (STT).
  3. Submit → INC-002 near-miss record.
- **Alternate Paths:** Anonymous (MOB-020) → routes to INC-014.
- **Error Paths:** Offline → queued locally (encrypted at rest); sync on reconnect.
- **AI interactions:** Auto-category suggestion; hazard-type classifier.
- **Events:** `near_miss.reported.v1`.
- **Success criteria:** ≤ 30s to submit; reporting rate ↑ ≥ 3× baseline.

---

## UF-MOB-003 · Permit Field Execution (MOB-005)

- **Actors:** Permit holder, workers.
- **Preconditions:** Active PTW.
- **Trigger:** Worker taps permit on home.
- **Primary Path:**
  1. Permit detail with pre-work checklist, gas test capture, buddy sign-in, timer.
  2. QR scan of work location validates match (CR-027 wrong-line pre-check).
  3. During work: periodic re-checks (gas, weather).
  4. Close-out via UF-PTWC-003.
- **Alternate Paths:** Amend on-mobile.
- **Success criteria:** ≥ 90% permit closeouts done from field.

---

## UF-MOB-004 · LOTO Field Application (MOB-006)

Covered in UF-LOTO-002; here we highlight mobile specifics:
- Sequential checklist, QR/NFC scan per point, photo mandatory, biometric per lock, offline resilient (queued state changes reconcile at reconnect).
- **Success criteria:** Zero verification skips.

---

## UF-MOB-005 · Emergency Roll-Call Mobile Response (MOB-009)

Covered in UF-ER-003; mobile specifics:
- Big buttons: **I am safe** / **Need help**; screen reader friendly for accessibility.
- Battery-critical mode: minimal UI on low battery.
- **Success criteria:** 100% workers reachable when device on-network.

---

# APPENDIX A — Event Catalog (Excerpt, canonical in WFP-002)

| Event | Producer | Consumer | Contract |
|---|---|---|---|
| `cv.event.v2` | `cv-edge-runtime` | `cr-engine`, `dt-service`, `dashboard-service` | DP-011 |
| `cv.violation.v2` | `cv-edge-runtime` | `dashboard-service`, `notification-service` | DP-011 |
| `CompoundRisk.v2` | `cr-engine` | dashboard, notification, ptw, loto | DP-011 |
| `ptw.submitted.v1` | `ptw-service` | `hitl-broker`, notification | DP-011 |
| `ptw.approved.v1` | `ptw-service` | notification, mobile | DP-011 |
| `loto.state.v1` | `loto-service` | cr-engine, dashboard | DP-011 |
| `emergency.trigger.candidate.v1` | `signal-fusion-service` | emergency console | DP-011 |
| `emergency.trigger.confirmed.v1` | `emergency-service` | all subscribers | DP-011 |
| `incident.created.v1` | `incident-service` | rca, notification, evidence | DP-011 |
| `capa.opened.v1` | `capa-service` | dashboard, notification | DP-011 |
| `decision.approved.v1` | `hitl-broker` | source workflow | DP-011 |
| `model.disabled.v1` | `model-lifecycle-service` | dependent services | DP-011 |
| `hr.notification.task.v1` | `incident-service` | HR integration | DP-011 |
| `worker.presence.v1` | `cv-edge-runtime` | cr-engine, dt-service | DP-011 |
| `ppe.grace.applied.v1` | `ppe-rule-engine` | dashboard | DP-011 |

---

# APPENDIX B — Cross-Flow AI Governance Invariants

Every flow above obeys the following invariants:

1. **Face blur (CV-021) is unconditional** — no CV feature that egresses imagery may run with face blur disabled. Encoded in AG-004 capability tokens.
2. **AG-019 owns every "AI recommends, human approves"** hand-off. No workflow implements its own HITL UX outside the broker.
3. **AG-020 kill-switch is respected globally in ≤ 30s.** All AI-facing UI honors the disabled state with a visible banner.
4. **AG-018 uncertainty must accompany every AI-facing score** — no naked confidence.
5. **RAG-002 citations are mandatory** for any narrative or recommendation with regulatory / safety implications.
6. **AG-004 forbidden capabilities** (`actuate_equipment`, `override_sis`, `deliver_family_notification`, `biometric_identify_face`) are hard-blocked; CI static-analysis proves no code path can reach them.
7. **WFP-005 approval workflows** own every dual-sign / n-role decision — PTW dual-sign, LOTO emergency removal, kill-switch, policy publish, CAPA sign-off.
8. **OBS-002 SLO catalog** is the single source of truth for latency / availability / freshness commitments.
9. **DP-011 data contracts** are the single source of truth for event schemas — no ad-hoc topics.
10. **INC-023 trauma-informed workflow is human-delivered end-to-end** — no automation.

---

# APPENDIX C — Traceability Matrix (Flow → Feature IDs)

| Flow | Feature IDs |
|---|---|
| UF-AUTH-001 | SEC-002, SEC-003, SEC-005, AG-003, AG-004, PLT-004 |
| UF-AUTH-002 | MOB-002, MOB-004, SEC-004, AG-004 |
| UF-AUTH-003 | SEC-004, AG-019, WFP-005 |
| UF-ONB-001 | SEC-002, SEC-003, DP-001, DP-015, WFP-003, WFP-006, COMP-010 |
| UF-ONB-003 | CV-024, CV-025, CV-026, CV-030, CV-035, CV-036, OT-001…OT-004, IOT-*, KG-001…KG-011, CR-019 |
| UF-DASH-001 | UI-002, UI-004, UI-006, UI-008, UI-019, AG-003, AG-018, AG-020 |
| UF-PTWC-001 | PTW-001…PTW-004, PTW-021, KG-005, KG-006, CR-012, CR-025, CR-026, CR-027, AG-007, RAG-002, AG-018 |
| UF-PTWA-001 | PTW-012, WFP-005, AG-019, AG-007 |
| UF-LOTO-002 | LOTO-001…LOTO-005, CR-004, CR-027, MOB-006, MOB-012 |
| UF-INC-001 | INC-001, INC-002, INC-003, INC-014, CV-010, CV-021 |
| UF-INC-004 | INC-005, INC-006, INC-007, INC-010, INC-022, DT-010 |
| UF-INC-005 | INC-018, INC-023, SEC-004, AG-004 |
| UF-ER-001 | CV-011, CV-012, CV-033, IOT-004, OT-006, AG-019 |
| UF-ER-002 | ER-001, ER-002, ER-005, AG-010, RAG-002, WFP-005 |
| UF-ER-003 | ER-005, IOT-*, MOB-009, CV-019 |
| UF-COP-001 | RAG-001, RAG-002, RAG-012, RAG-017, AG-003, AG-004, AG-017, AG-018, AG-020, OBS-010 |
| UF-KS-001 | KG-*, RAG-001 |
| UF-DT-001 | DT-001…DT-010, CV-007, CV-008 |
| UF-NOT-001 | NOT-001, NOT-002, OBS-011, OBS-012, AG-019 |
| UF-ANA-001 | UI-002, DP-001, RAG-*, AG-018 |
| UF-CON-001 | CON-001, CON-002, CON-003, KG-006, AG-004 |
| UF-AUD-001 | SEC-011, SEC-007, UI-019 |
| UF-AUD-003 | DP-004, DP-005, DP-014, DP-015, CV-030, AG-020 |
| UF-COMP-001 | COMP-*, INC-011, AG-013, RAG-002 |
| UF-COMP-002 | INC-006, INC-008, INC-021, CR-001 |
| UF-ADM-003 | DP-004, DP-006, DP-007, AG-020, WFP-005 |
| UF-AIX-001 | AG-003, AG-018, RAG-002, CR-017, DP-015 |
| UF-MOB-001 | MOB-001, MOB-002, MOB-003, MOB-004 |
| UF-MOB-002 | MOB-020, INC-002, INC-014, CV-021 |

---

**— End of User Flow Specification v1.0 —**

*This specification renders every canonical workflow of SafetyOS in a form directly implementable by engineering & design. It preserves the AI-governance invariants (face blur, HITL broker, kill-switch, uncertainty, citations, forbidden capabilities), aligns to the IA screen inventory, honors the vNext patch (Modules 25–27), and is fully traceable to the 466-feature master specification. No workflow relies on undocumented features; every event, service, and API named here corresponds to a canonical registry entry (WFP-002, DP-011, OBS-002).*
