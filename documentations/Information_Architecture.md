# Information Architecture — SafetyOS

**Document Version:** 1.0
**Status:** Canonical Navigation Reference — Engineering & Design Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–26)
**Owners:** UX Architecture, Enterprise Information Architecture
**Classification:** Confidential — Product Blueprint
**Last Reviewed:** 2026-07-21

---

## 0. How to Read This Document

This IA is derived directly from the canonical PRSD and Master Feature Specifications. It is **not a redesign** — every route, page, workspace and permission node here maps back to a feature ID (CV-, OT-, KG-, CR-, PTW-, LOTO-, SH-, INC-, ER-, DT-, RAG-, AG-, PRED-, AL-, UI-, MOB-, CON-, COMP-, IOT-, SEC-, ML-, NOT-, ADM-, EXT-, DP-, WFP-) or a persona journey defined in the source documents.

Where the source documents describe a capability but not a page-level surface, this IA proposes the minimum viable page inventory required to expose that capability to the correct persona at the correct ISA-101 display level (L1 Plant-wide → L2 Unit → L3 Equipment/Permit → L4 Diagnostics/RCA).

**Design substrate the IA respects:**

- **ISA-101 Display Hierarchy** — L1 → L2 → L3 → L4 governs all vertical drill paths.
- **ISA-18.2 Alarm Rationalization** — alarm surfaces are consolidated, not duplicated.
- **Grayscale-first, deviation-only color** — navigation chrome is neutral; color is reserved for status badges.
- **Explainability-first** — every alert-derived page must expose a "Why?" panel.
- **Offline-first mobile** — mobile IA is a strict subset with sync semantics.
- **Zero-trust + OPA-backed RBAC/ABAC** — every route carries a permission expression.
- **Tenancy** — Organization → Site → Area → Unit → Zone → Asset. Every workspace-scoped page inherits this scope chain.

---

## 1. Global Layouts

SafetyOS defines seven global layouts. Every page in the sitemap declares which layout it uses.

### 1.1 `layout.command` — Command Console Layout (Anita, Sanjay, Meena)
Grayscale wall-display grid. Persistent left rail (module switcher, compact), full-width status header (site → area → unit selector + SIF exposure index + active permit count + open incidents), main canvas is a 12-column ISA-101 mimic grid, right rail for AI Copilot dock.

### 1.2 `layout.workflow` — Workflow Layout (PTW, LOTO, Incident, Handover)
Two-pane: left = state machine timeline / step navigator, right = form + evidence + related signals. Bottom sticky action bar (approve, reject, escalate, sign, delegate). Breadcrumb always shows workflow instance ID.

### 1.3 `layout.analytics` — Analytics & Reporting Layout (Deepak, Kavya, Meena)
Filter rail (left, collapsible) + KPI card strip + tabbed content (Charts / Table / Narrative / Export). Time-range and scope pickers pinned to header.

### 1.4 `layout.geospatial` — Digital Twin Layout (all site-aware personas)
Full-bleed 2D/3D canvas, floating layer panel (top-right), floating detail drawer (right side, contextual), floating clock/scrubber (bottom) for replay. Left rail collapses to icon-only.

### 1.5 `layout.mobile` — Mobile Field Layout (Ravi, Priya, Sanjay-in-field)
Bottom tab bar (5 slots max: Home, Permits, Report, Twin, Me), swipe-to-action rows, glove-mode large targets, offline banner, SOS floating action button always visible.

### 1.6 `layout.admin` — Admin & Platform Layout (Arjun, Neha, tenant admins)
Split left rail (Sections → Sub-sections). Right pane uses SAP-Fiori-style object-list ↔ object-detail pattern. Audit ribbon persistent at top.

### 1.7 `layout.auth` — Unauthenticated / Bootstrapping Layout
Full-viewport centered card. Used for sign-in, MFA challenge, contractor onboarding kiosk, and disaster-recovery bootstrap.

---

## 2. Top-Level Sitemap

```
/  (SafetyOS Root — resolves per persona home)
│
├── /home                              ......... Persona-adaptive Home
├── /console                           ......... Command Console (L1/L2/L3/L4)
├── /twin                              ......... Digital Twin & Geospatial
├── /permits                           ......... Permit-to-Work (PTW)
├── /loto                              ......... Lockout/Tagout
├── /handover                          ......... Shift Handover Intelligence
├── /incidents                         ......... Incident Management & RCA
├── /emergency                         ......... Emergency Response Orchestrator
├── /risk                              ......... Compound Risk Detection
├── /alarms                            ......... Alarm Rationalization (ISA-18.2)
├── /predictive                        ......... Predictive Analytics & PHM
├── /vision                            ......... Computer Vision Operations
├── /ot                                ......... OT / SCADA Integration
├── /iot                               ......... Wearables & IoT
├── /knowledge                         ......... Knowledge Graph & Semantic Fusion
├── /copilot                           ......... RAG Copilot & Agents
├── /workforce                         ......... Contractor & Workforce Management
├── /compliance                        ......... Compliance & Audit Intelligence
├── /notifications                     ......... Notifications & Comms Center
├── /mobile                            ......... Mobile Field App (PWA entry)
├── /data                              ......... Data Platform, Lakehouse & MLOps
├── /workflows                         ......... Workflow, Rule & Policy Engine
├── /admin                             ......... Administration, Config & Deployment
├── /security                          ......... Security, Identity & Access
├── /marketplace                       ......... Platform Extensibility & Ecosystem
├── /search                            ......... Global Search results surface
├── /me                                ......... User profile, preferences, sessions
└── /auth                              ......... Sign-in, MFA, SSO callback, bootstrap
```

---

## 3. Workspace Hierarchy

SafetyOS is a **workspace-scoped product**. Every non-platform page inherits scope from the workspace chain. The scope selector is a first-class element in the top navigation.

```
Organization (Tenant)
  └── Site               (e.g., "Refinery A", "Steel B")
        └── Area          (e.g., "Coke Oven North")
              └── Unit    (e.g., "CDU-1")
                    └── Zone      (spatial polygon)
                          └── Asset (equipment, camera, sensor)
```

**Scope Selector Behavior**

- Pinned to global header. Displays current scope as a breadcrumb pill.
- Cross-scope navigation preserves the current page type when possible (e.g., moving from Site → Site keeps `/console` view).
- ABAC evaluates on every scope change; unreachable scopes are grayed out with reason ("no jurisdiction").
- Executive personas (Meena) get a **Portfolio** pseudo-scope that federates KPIs across sites.

**Workspace Persistence**

- Last-active workspace is stored per user per device.
- URL always carries scope as query params: `?org=acme&site=refA&area=coke-n&unit=cdu1`.
- Deep links without scope resolve to the user's default scope.

---

## 4. Navigation Hierarchy

### 4.1 Top Navigation (Desktop)

The top nav is a single 56px bar. Left → right:

1. **Logo / Home** — clicks to `/home`.
2. **Scope Selector** — Org → Site → Area → Unit → Zone pill breadcrumb (§3).
3. **Primary Section Switcher** — six persona-adaptive tabs (see §4.3).
4. **Global Search** — center-aligned, ⌘K / Ctrl-K shortcut, opens Command Palette (§14).
5. **AI Copilot Toggle** — opens the right-rail Copilot dock.
6. **Notifications Bell** — badge count of unread + escalated (§16).
7. **Emergency Beacon** — always-red button; opens `/emergency/declare` with dual-confirm.
8. **Persona Menu** — avatar → `/me`, sessions, theme, sign-out.

### 4.2 Sidebar Structure (Desktop)

A **two-tier collapsible left rail**. Tier 1 = module icons (always visible, 64px). Tier 2 = section list within that module (240px, collapsible to zero).

Module rail is grouped into five semantic bands with subtle dividers:

- **Band A — Operations Live:** Home, Console, Twin, Alarms, Risk, Emergency
- **Band B — Work & Workflows:** Permits, LOTO, Handover, Incidents, Predictive
- **Band C — Intelligence:** Vision, OT, IoT, Knowledge, Copilot
- **Band D — Governance:** Workforce, Compliance, Notifications
- **Band E — Platform:** Data, Workflows Engine, Admin, Security, Marketplace

The band a user sees depends on their persona template (§9). Bands never disappear entirely — un-permitted items render as locked with a "Request Access" affordance to preserve discoverability.

### 4.3 Primary Section Switcher (Persona-Adaptive)

Six tabs surfaced next to the scope selector. The set differs by persona:

| Persona | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 | Tab 6 |
|---|---|---|---|---|---|---|
| Ravi (Operator) | Home | Permits | Report | Twin | Handover | Me |
| Sanjay (Supervisor) | Console | Permits | LOTO | Handover | Incidents | Risk |
| Anita (Control Room) | Console | Alarms | Risk | Emergency | Twin | Incidents |
| Deepak (HSE) | Compliance | Incidents | Risk | Workforce | Analytics | Console |
| Vikram (Safety Officer / RCA) | Incidents | Twin | Knowledge | Copilot | Compliance | Analytics |
| Meena (Plant Head) | Portfolio | Console | Compliance | Incidents | Predictive | Emergency |
| Priya (Contractor) | Home | Passport | Permits | Twin | Report | Me |
| Kavya (Auditor) | Compliance | Evidence | Incidents | Workforce | Reports | Copilot |
| Arjun (IT/OT) | Admin | OT | Vision | IoT | Data | Workflows |
| Neha (CISO) | Security | Compliance | Data | Admin | Audit Log | Console |

### 4.4 Breadcrumb Hierarchy

Every page below root shows a breadcrumb of the form:

```
[Scope Pill]  ›  [Module]  ›  [Sub-section]  ›  [Object]  ›  [Sub-object]
```

Rules:

- Breadcrumbs never omit levels; if a level is implicit, it is rendered inactive-gray.
- Object nodes (permits, incidents, assets) display their canonical ID and short title.
- Right-truncation with tooltip; the current node is never truncated.
- Clicking any node navigates; hover shows a peek popover with the parent's KPIs.

Example:
```
Refinery-A › Coke-Oven-North › CDU-1 › Permits › PTW-2026-04812 › Conflict Check
```

### 4.5 Cross-Module Navigation

Cross-module jumps happen through five explicit patterns. Consistency here is the single largest UX lever in the system.

- **Object Peek** — hover any linked entity ID (permit, incident, asset, worker, camera) → popover with summary + 3 quick actions.
- **Related Modules Rail** — every object detail page has a right rail "Related" section listing linked entities across modules (e.g., a Permit shows its LOTO tag, its Zone in Twin, its Compound Risk score).
- **Explainability Trace** — the "Why?" button on any alert opens a modal that lists the fusion path (CV event → KG assertion → CR rule → alert) with clickable jumps to each source.
- **Workflow Handoff** — workflow state transitions can spawn a linked object in another module (Incident → PTW suspension). The originating and derived objects link bidirectionally.
- **Copilot Deep Link** — the RAG Copilot returns citations that are deep links into the canonical page for that entity.

---

## 5. Module Hierarchy and Route Map

The 26 modules map to the following canonical routes and sub-sections. All routes are versioned under `/v1` at the API layer but user-facing URLs omit the version.

### 5.1 URL Grammar

```
/<module>/<section>/<object-id>/<sub-object>?<scope-params>
```

- `<module>` — kebab-case module slug (see §2).
- `<section>` — noun phrase representing a list, dashboard, or workflow stage.
- `<object-id>` — canonical entity ID (e.g., `PTW-2026-04812`).
- `<sub-object>` — nested resource (e.g., `evidence`, `signatures`, `conflict-check`).
- Scope params always present for tenant-safe deep links.

Reserved segments: `new`, `draft`, `search`, `settings`, `history`, `export`, `explain`.

### 5.2 Module Route Table

**Module 1 — Computer Vision & Edge Perception (CV)** → `/vision`
- `/vision` — Vision operations dashboard
- `/vision/cameras` — Camera fleet
- `/vision/cameras/:cameraId` — Camera detail (feed, calibration, health)
- `/vision/cameras/:cameraId/calibration` — Calibration workflow
- `/vision/events` — CV event stream
- `/vision/events/:eventId` — Event detail with clip + explain
- `/vision/models` — Deployed model roster (links to `/data/models`)
- `/vision/zones` — Detection zones editor
- `/vision/privacy` — Face blur & PII controls (co-owned with `/security`)

**Module 2 — OT/SCADA Integration & Ingestion (OT)** → `/ot`
- `/ot` — OT integration health dashboard
- `/ot/connectors` — Connector inventory (OPC-UA, Modbus, MQTT)
- `/ot/connectors/:connectorId` — Connector detail
- `/ot/tags` — Tag browser (searchable across historians)
- `/ot/tags/:tagId` — Tag detail with trend + subscribers
- `/ot/normalization` — Unit/schema normalization rules
- `/ot/quality` — Data-quality watchdogs

**Module 3 — Knowledge Graph & Semantic Fusion (KG)** → `/knowledge`
- `/knowledge` — KG overview & health
- `/knowledge/browse` — Interactive graph explorer
- `/knowledge/entities/:entityId` — Entity detail
- `/knowledge/ontology` — Ontology editor (governed)
- `/knowledge/queries` — Saved SPARQL/Cypher queries
- `/knowledge/lineage/:entityId` — Provenance & lineage view

**Module 4 — Compound Risk Detection Engine (CR)** → `/risk`
- `/risk` — Live compound-risk heatmap
- `/risk/rules` — Rule library
- `/risk/rules/:ruleId` — Rule detail + backtest
- `/risk/events` — Active + historical compound-risk events
- `/risk/events/:eventId` — Event detail with signal fusion trace
- `/risk/simulator` — What-if simulator (KG-backed)

**Module 5 — Permit-to-Work (PTW)** → `/permits`
- `/permits` — Permit list (filters by state, zone, type, contractor)
- `/permits/new` — AI-assisted draft
- `/permits/:permitId` — Permit detail (workflow layout)
- `/permits/:permitId/risk-assessment` — JSA / HIRA
- `/permits/:permitId/conflict-check` — Spatial + temporal conflict inspector
- `/permits/:permitId/signatures` — Multi-role sign-off
- `/permits/:permitId/check-in` — NFC / geofence check-in log
- `/permits/:permitId/suspend` — Suspension reason capture
- `/permits/templates` — Permit templates (Hot Work, Confined Space, Working at Height…)

**Module 6 — Lockout/Tagout (LOTO)** → `/loto`
- `/loto` — LOTO board (per unit)
- `/loto/isolations/:isolationId` — Isolation detail
- `/loto/isolations/:isolationId/points` — Isolation-point checklist
- `/loto/isolations/:isolationId/verification` — Zero-energy verification (CV + OT fused)
- `/loto/isolations/:isolationId/release` — Controlled release workflow
- `/loto/library` — Isolation procedures library (per asset)

**Module 7 — Shift Handover Intelligence (SH)** → `/handover`
- `/handover` — Handover queue for current shift
- `/handover/:handoverId` — Handover packet
- `/handover/:handoverId/quiz` — Comprehension quiz
- `/handover/:handoverId/acknowledge` — Sign-off
- `/handover/history` — Handover archive
- `/handover/settings` — Per-unit handover configuration

**Module 8 — Incident Management & RCA (INC)** → `/incidents`
- `/incidents` — Incident register
- `/incidents/new` — Rapid capture (mobile-friendly)
- `/incidents/:incidentId` — Incident summary
- `/incidents/:incidentId/timeline` — Auto-assembled timeline (evidence, CV, OT, comms)
- `/incidents/:incidentId/evidence` — Evidence bundle
- `/incidents/:incidentId/rca` — Root-cause workspace (5-Whys, Bowtie, TapRoot)
- `/incidents/:incidentId/actions` — Corrective/preventive actions
- `/incidents/:incidentId/report` — Regulatory report drafter (IR-1, OSHA 301)

**Module 9 — Emergency Response Orchestrator (ER)** → `/emergency`
- `/emergency` — Readiness dashboard
- `/emergency/declare` — Declare emergency (dual-confirm)
- `/emergency/active/:incidentId` — Live command surface (First-10-Minute Playbook)
- `/emergency/playbooks` — Playbook library
- `/emergency/muster` — Muster point status & headcount
- `/emergency/drills` — Drill scheduler & scorecards
- `/emergency/broadcasts` — PA / mass-notify composer

**Module 10 — Digital Twin & Geospatial (DT)** → `/twin`
- `/twin` — Site twin (2D map by default)
- `/twin/3d` — 3D scene
- `/twin/layers` — Layer manager (permits, personnel, gas plume, cameras…)
- `/twin/assets/:assetId` — Asset detail in twin context
- `/twin/replay` — Time-scrub replay
- `/twin/plume/:eventId` — Plume simulation viewer

**Module 11 — RAG Copilot & Conversational AI (RAG)** → `/copilot`
- `/copilot` — Persistent chat surface (also as global right-rail dock)
- `/copilot/threads/:threadId` — Thread detail
- `/copilot/sources` — Curated source library (SOPs, regs, PSSRs)
- `/copilot/prompts` — Prompt/task library
- `/copilot/citations/:citationId` — Deep-link resolver for cited fragments

**Module 12 — Multi-Agent Reasoning Layer (AG)** → `/copilot/agents`
- `/copilot/agents` — Agent roster
- `/copilot/agents/:agentId` — Agent card + tools + traces
- `/copilot/agents/:agentId/runs/:runId` — Run trace with tool calls
- `/copilot/agents/hitl` — Human-in-loop inbox (Decision Cards, WFP-012)
- `/copilot/agents/kill-switch` — Global AI kill-switch (AG-020, CISO-only)

**Module 13 — Predictive Analytics & PHM (PRED)** → `/predictive`
- `/predictive` — Prediction hub
- `/predictive/gas` — Gas-concentration forecasts
- `/predictive/rul` — Remaining Useful Life boards
- `/predictive/fatigue` — Worker fatigue index
- `/predictive/models` — Model performance summary (links to `/data/models`)

**Module 14 — Alarm Rationalization ISA-18.2 (AL)** → `/alarms`
- `/alarms` — Live alarm list (filtered, prioritized)
- `/alarms/floods` — Alarm-flood detector
- `/alarms/shelved` — Shelved alarms
- `/alarms/rationalization` — Rationalization workshop (analyst tool)
- `/alarms/kpis` — ISA-18.2 KPIs (avg/hour, standing, chattering)

**Module 15 — Command Console & HMI ISA-101 (UI)** → `/console`
- `/console` — L1 Plant-wide overview
- `/console/site/:siteId` — L1 Site
- `/console/area/:areaId` — L2 Area
- `/console/unit/:unitId` — L2/L3 Unit
- `/console/asset/:assetId` — L3 Asset detail
- `/console/diagnostics/:objectId` — L4 Diagnostics
- `/console/wall` — Wall-display mode (fullscreen, chrome-suppressed)
- `/console/portfolio` — Executive portfolio (Meena)

**Module 16 — Mobile & Field Application (MOB)** → `/mobile`
The PWA reuses several modules under a mobile layout. The routes below are the ones exclusive to the mobile surface; permit/LOTO/incident routes reuse core paths under `layout.mobile`.
- `/mobile` — Field home
- `/mobile/report` — Rapid hazard / near-miss report
- `/mobile/sos` — SOS composer
- `/mobile/passport` — My safety passport
- `/mobile/checklist/:checklistId` — Field checklist
- `/mobile/sync` — Offline queue status

**Module 17 — Contractor Management & Passport (CON)** → `/workforce`
- `/workforce` — Workforce overview
- `/workforce/contractors` — Contractor company list
- `/workforce/contractors/:companyId` — Company profile & scorecard
- `/workforce/workers/:workerId` — Worker profile (employee or contractor)
- `/workforce/workers/:workerId/passport` — Safety passport
- `/workforce/onboarding` — Onboarding queue
- `/workforce/certifications` — Certification registry & expiry

**Module 18 — Compliance & Audit Intelligence (COMP)** → `/compliance`
- `/compliance` — Continuous-compliance dashboard
- `/compliance/frameworks` — ISO 45001 / OSHA / DGMS / PSM frameworks
- `/compliance/frameworks/:frameworkId` — Framework matrix
- `/compliance/controls/:controlId` — Control detail with evidence
- `/compliance/evidence` — Evidence explorer (immutable)
- `/compliance/audits` — Audit workspace
- `/compliance/audits/:auditId` — Audit run
- `/compliance/reports` — Report library (SIF, LTI, TRIR, near-miss)

**Module 19 — Wearables & IoT Integration (IOT)** → `/iot`
- `/iot` — IoT dashboard
- `/iot/devices` — Device inventory
- `/iot/devices/:deviceId` — Device detail
- `/iot/telemetry/:workerId` — Worker telemetry (HR, gas exposure)
- `/iot/geofences` — Geofence editor

**Module 20 — Security, Identity & Access (SEC)** → `/security`
- `/security` — Security posture
- `/security/identities` — Users, groups, service accounts
- `/security/roles` — Role library
- `/security/policies` — OPA policy bundles
- `/security/sessions` — Active sessions
- `/security/audit-log` — Immutable audit log
- `/security/keys` — Secrets, HSM, signing keys
- `/security/privacy` — PII / face-blur / data-residency controls

**Module 21 — Data Platform & MLOps (ML)** → `/data`
Merged with vNext **Module 25 — Data Platform, Lakehouse & MLOps Control Plane (DP)**.
- `/data` — Platform overview
- `/data/lakehouse` — Lakehouse browser (Delta/Iceberg)
- `/data/streams` — Kafka streams & schema registry
- `/data/features` — Feature store (Feast)
- `/data/models` — Model registry (MLflow)
- `/data/models/:modelId` — Model card + canary + drift
- `/data/labeling` — Labeling & active-learning console
- `/data/contracts` — Data-contract registry
- `/data/gpu` — On-prem LLM GPU fleet
- `/data/retention` — Retention & right-to-erasure

**Module 22 — Notifications & Communications (NOT)** → `/notifications`
- `/notifications` — Inbox
- `/notifications/preferences` — Channel preferences (per-user)
- `/notifications/rules` — Routing & escalation rules
- `/notifications/channels` — Integrations (SMS, WhatsApp, Push, Teams, Email, PA)
- `/notifications/templates` — Message templates
- `/notifications/history` — Delivery ledger

**Module 23 — Administration, Configuration & Deployment (ADM)** → `/admin`
- `/admin` — Admin overview
- `/admin/tenants` — Tenants (super-admin only)
- `/admin/sites` — Sites, areas, units
- `/admin/zones` — Zone / geofence editor
- `/admin/assets` — Asset registry
- `/admin/features` — Feature-flag console
- `/admin/health` — System health & SLOs (links to OBS)
- `/admin/deployment` — Release channels, canary
- `/admin/backup` — Backup, DR, restore

**Module 24 — Platform Extensibility & Ecosystem (EXT)** → `/marketplace`
- `/marketplace` — Ecosystem catalog
- `/marketplace/apps/:appId` — App detail
- `/marketplace/installed` — Installed apps & permissions
- `/marketplace/webhooks` — Webhooks
- `/marketplace/api-keys` — API keys & OAuth clients
- `/marketplace/developer` — Developer portal (SDK, docs, sandbox)

**Module 26 — Workflow, Rule & Policy Engine (WFP)** → `/workflows`
- `/workflows` — Workflow engine overview
- `/workflows/temporal` — Temporal workflow visualizer
- `/workflows/temporal/:workflowId` — Workflow run detail
- `/workflows/events` — Canonical event catalog
- `/workflows/policies` — OPA / Rego policy repo
- `/workflows/rules` — Rules engine (Drools / CEL)
- `/workflows/approvals` — Approval workflow templates
- `/workflows/hitl` — Human-in-loop UX kit
- `/workflows/sla` — SLA & timeout monitor

---

## 6. Menu Grouping (Full Sidebar Enumeration)

The complete grouped left-rail (desktop) with the persona bands introduced in §4.2:

### Band A — Operations Live
- **Home** → `/home`
- **Command Console** → `/console`
  - Portfolio · Site · Area · Unit · Asset · Diagnostics · Wall Mode
- **Digital Twin** → `/twin`
  - 2D · 3D · Layers · Replay · Plume
- **Alarms** → `/alarms`
  - Live · Floods · Shelved · Rationalization · KPIs
- **Compound Risk** → `/risk`
  - Heatmap · Rules · Events · Simulator
- **Emergency** → `/emergency`
  - Readiness · Active · Playbooks · Muster · Drills · Broadcasts

### Band B — Work & Workflows
- **Permits (PTW)** → `/permits`
  - Active · Draft · Templates · Suspended · Archive
- **LOTO** → `/loto`
  - Board · Procedures Library · History
- **Shift Handover** → `/handover`
  - Queue · Archive · Settings
- **Incidents** → `/incidents`
  - Register · New · RCA Workspace · Actions · Reports
- **Predictive** → `/predictive`
  - Gas · RUL · Fatigue · Models

### Band C — Intelligence
- **Computer Vision** → `/vision`
  - Cameras · Events · Zones · Models · Privacy
- **OT / SCADA** → `/ot`
  - Connectors · Tags · Normalization · Quality
- **IoT & Wearables** → `/iot`
  - Devices · Telemetry · Geofences
- **Knowledge Graph** → `/knowledge`
  - Browse · Entities · Ontology · Queries · Lineage
- **AI Copilot** → `/copilot`
  - Chat · Threads · Sources · Prompts · Agents · HITL

### Band D — Governance
- **Workforce & Contractors** → `/workforce`
  - Contractors · Workers · Onboarding · Certifications
- **Compliance & Audit** → `/compliance`
  - Dashboard · Frameworks · Evidence · Audits · Reports
- **Notifications** → `/notifications`
  - Inbox · Rules · Channels · Templates · History

### Band E — Platform
- **Data Platform** → `/data`
  - Lakehouse · Streams · Features · Models · Labeling · Contracts · GPU · Retention
- **Workflow Engine** → `/workflows`
  - Temporal · Events · Policies · Rules · Approvals · HITL · SLA
- **Administration** → `/admin`
  - Tenants · Sites · Zones · Assets · Feature Flags · Health · Deployment · Backup
- **Security & Identity** → `/security`
  - Posture · Identities · Roles · Policies · Sessions · Audit Log · Keys · Privacy
- **Marketplace & Developer** → `/marketplace`
  - Catalog · Installed · Webhooks · API Keys · Developer

---

## 7. Route Hierarchy (Consolidated Tree)

```
/home
/console
  ├── /site/:siteId
  ├── /area/:areaId
  ├── /unit/:unitId
  ├── /asset/:assetId
  ├── /diagnostics/:objectId
  ├── /portfolio
  └── /wall
/twin
  ├── /3d
  ├── /layers
  ├── /replay
  ├── /assets/:assetId
  └── /plume/:eventId
/permits
  ├── /new
  ├── /templates
  ├── /:permitId
  │     ├── /risk-assessment
  │     ├── /conflict-check
  │     ├── /signatures
  │     ├── /check-in
  │     └── /suspend
  └── /search
/loto
  ├── /library
  └── /isolations/:isolationId
        ├── /points
        ├── /verification
        └── /release
/handover
  ├── /history
  ├── /settings
  └── /:handoverId
        ├── /quiz
        └── /acknowledge
/incidents
  ├── /new
  └── /:incidentId
        ├── /timeline
        ├── /evidence
        ├── /rca
        ├── /actions
        └── /report
/emergency
  ├── /declare
  ├── /playbooks
  ├── /muster
  ├── /drills
  ├── /broadcasts
  └── /active/:incidentId
/risk
  ├── /rules
  ├── /rules/:ruleId
  ├── /events
  ├── /events/:eventId
  └── /simulator
/alarms
  ├── /floods
  ├── /shelved
  ├── /rationalization
  └── /kpis
/predictive
  ├── /gas
  ├── /rul
  ├── /fatigue
  └── /models
/vision
  ├── /cameras
  ├── /cameras/:cameraId
  ├── /cameras/:cameraId/calibration
  ├── /events
  ├── /events/:eventId
  ├── /models
  ├── /zones
  └── /privacy
/ot
  ├── /connectors
  ├── /connectors/:connectorId
  ├── /tags
  ├── /tags/:tagId
  ├── /normalization
  └── /quality
/iot
  ├── /devices
  ├── /devices/:deviceId
  ├── /telemetry/:workerId
  └── /geofences
/knowledge
  ├── /browse
  ├── /entities/:entityId
  ├── /ontology
  ├── /queries
  └── /lineage/:entityId
/copilot
  ├── /threads/:threadId
  ├── /sources
  ├── /prompts
  ├── /citations/:citationId
  └── /agents
        ├── /:agentId
        ├── /:agentId/runs/:runId
        ├── /hitl
        └── /kill-switch
/workforce
  ├── /contractors
  ├── /contractors/:companyId
  ├── /workers/:workerId
  ├── /workers/:workerId/passport
  ├── /onboarding
  └── /certifications
/compliance
  ├── /frameworks
  ├── /frameworks/:frameworkId
  ├── /controls/:controlId
  ├── /evidence
  ├── /audits
  ├── /audits/:auditId
  └── /reports
/notifications
  ├── /preferences
  ├── /rules
  ├── /channels
  ├── /templates
  └── /history
/mobile
  ├── /report
  ├── /sos
  ├── /passport
  ├── /checklist/:checklistId
  └── /sync
/data
  ├── /lakehouse
  ├── /streams
  ├── /features
  ├── /models
  ├── /models/:modelId
  ├── /labeling
  ├── /contracts
  ├── /gpu
  └── /retention
/workflows
  ├── /temporal
  ├── /temporal/:workflowId
  ├── /events
  ├── /policies
  ├── /rules
  ├── /approvals
  ├── /hitl
  └── /sla
/admin
  ├── /tenants
  ├── /sites
  ├── /zones
  ├── /assets
  ├── /features
  ├── /health
  ├── /deployment
  └── /backup
/security
  ├── /identities
  ├── /roles
  ├── /policies
  ├── /sessions
  ├── /audit-log
  ├── /keys
  └── /privacy
/marketplace
  ├── /apps/:appId
  ├── /installed
  ├── /webhooks
  ├── /api-keys
  └── /developer
/search
/me
  ├── /profile
  ├── /preferences
  ├── /sessions
  └── /devices
/auth
  ├── /signin
  ├── /mfa
  ├── /sso/callback
  └── /kiosk
```

---

## 8. Permission Matrix

SafetyOS uses **OPA-backed RBAC + ABAC**. Every route declares a policy expression of the shape `role ∈ R ∧ scope ⊆ S ∧ attr(a=v)`. The matrix below shows the coarse role-to-module intent; the fine-grained per-page permissions are declared in the Page Registry (§13).

Legend: **F** = Full, **W** = Write, **R** = Read, **A** = Approve, **–** = Denied

| Module | Field Op (Ravi) | Contractor (Priya) | Supervisor (Sanjay) | Control Room (Anita) | Safety Officer (Vikram) | HSE Mgr (Deepak) | Plant Head (Meena) | Auditor (Kavya) | IT/OT (Arjun) | CISO (Neha) | Super-Admin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /home | F | F | F | F | F | F | F | F | F | F | F |
| /console | R | – | W | W | R | R | R | R | R | R | F |
| /twin | R | R | W | W | W | R | R | R | R | R | F |
| /permits | W (own) | W (own) | A | R | R | R | R | R | – | – | F |
| /loto | W (own) | W (own) | A | R | R | R | R | R | R | – | F |
| /handover | W (own shift) | – | W+A | R | R | R | R | R | – | – | F |
| /incidents | W (report) | W (report) | W | W | F | F | R | R | R | R | F |
| /emergency | R | R | W | F | W | W | A | R | R | R | F |
| /risk | R | – | W | W | W | R | R | R | R | R | F |
| /alarms | – | – | R | F | R | R | R | R | W | R | F |
| /predictive | R | – | R | R | R | R | R | R | W | – | F |
| /vision | R | – | R | R | R | R | R | R | F | R (privacy) | F |
| /ot | – | – | R | R | – | R | R | R | F | R | F |
| /iot | R (self) | R (self) | R | R | R | R | R | R | F | R | F |
| /knowledge | R | – | R | R | W | R | R | R | W | R | F |
| /copilot | R | R | R | R | F | F | R | R | R | R | F |
| /copilot/agents/kill-switch | – | – | – | – | – | – | R | – | – | F | F |
| /workforce | R (self) | R (self) | W (crew) | R | R | F | R | R | – | – | F |
| /compliance | – | – | R | R | R | F | R | F | – | R | F |
| /notifications | R (self) | R (self) | W | W | W | F | R | R | W | R | F |
| /mobile | F | F | F | R | R | R | R | R | – | – | F |
| /data | – | – | – | – | – | R | R | R | F | R | F |
| /workflows | – | – | R | R | R | R | R | R | F | R | F |
| /admin | – | – | R (scope) | – | – | R | R | R | F | R | F |
| /admin/tenants | – | – | – | – | – | – | – | – | – | R | F |
| /security | – | – | – | – | – | R | R | R | R | F | F |
| /marketplace | – | – | R | R | R | R | R | R | W | R | F |

**ABAC dimensions applied on top:**

- `scope.site`, `scope.area`, `scope.unit` — must be within the user's assigned scope tree.
- `jurisdiction` — regulatory scope (e.g., OSHA-US, DGMS-IN).
- `certification.valid` — required certs for approving certain permit types.
- `contractor.company` — contractors can only see their own company's records.
- `sensitivity.class` — face imagery, PII, and biometric data require an additional privacy claim.
- `time.window` — some approvals only valid during the assigned shift.

Every denied route renders a **404-shaped** response for confidentiality (per zero-trust posture), except where a "Request Access" affordance is intentionally surfaced for discoverability.

---

## 9. Persona-Based Navigation

Each persona has a **navigation template** that composes: a persona home layout, a primary section switcher (§4.3), a curated left-rail sub-set, and a set of pinned quick actions in the command palette.

### 9.1 Ravi — Field Operator
- **Home:** `/mobile` — Today's permits, my LOTO tags, active zone alerts.
- **Rail:** Home, Permits, LOTO, Report, Twin, Handover, Passport, Me.
- **Quick actions:** Report a hazard, Check-in to permit, Show my LOTO tags, Nearest muster, SOS.
- **Layout:** `layout.mobile`.

### 9.2 Priya — Contractor
- **Home:** `/mobile/passport` — Onboarding progress, valid certs, today's site orientation.
- **Rail:** Home, Passport, Permits (own), Twin (read), Report, Me.
- **Quick actions:** Complete orientation quiz, Scan permit QR, Report a hazard, SOS.
- **Layout:** `layout.mobile`.

### 9.3 Sanjay — Shift Supervisor
- **Home:** `/console/unit/:unitId` — Unit KPIs, my crew, open permits, active alarms.
- **Rail:** Console, Permits, LOTO, Handover, Incidents, Risk, Alarms, Workforce.
- **Quick actions:** Approve permit, Draft handover, Suspend permit, Escalate alarm.
- **Layout:** `layout.command`.

### 9.4 Anita — Control Room Operator
- **Home:** `/console/wall` — Wall-display L1 or L2 auto-selected.
- **Rail:** Console, Alarms, Risk, Emergency, Twin, Incidents.
- **Quick actions:** Acknowledge alarm flood, Confirm compound risk, Declare emergency, Broadcast PA.
- **Layout:** `layout.command`.

### 9.5 Deepak — HSE Manager
- **Home:** `/compliance` — Framework heatmap, open findings, incident trend, contractor scorecards.
- **Rail:** Compliance, Incidents, Risk, Workforce, Analytics (Reports), Notifications, Copilot.
- **Quick actions:** Open latest audit, Run compliance report, Assign action, Ask Copilot.
- **Layout:** `layout.analytics`.

### 9.6 Vikram — Safety Officer / RCA Analyst
- **Home:** `/incidents` — Register with new + assigned filter.
- **Rail:** Incidents, Twin, Knowledge, Copilot, Compliance, Reports.
- **Quick actions:** Open RCA workspace, Ask Copilot with citations, Replay twin timeline.
- **Layout:** `layout.workflow` for RCA; `layout.geospatial` for twin replay.

### 9.7 Meena — Plant Head
- **Home:** `/console/portfolio` — Portfolio KPIs across sites, SIF exposure index, executive briefings.
- **Rail:** Portfolio, Console, Compliance, Incidents, Predictive, Emergency.
- **Quick actions:** Weekly briefing, Escalation review, Approve major CAPA, Declare emergency.
- **Layout:** `layout.analytics` + `layout.command` split.

### 9.8 Kavya — Compliance Auditor
- **Home:** `/compliance/evidence` — Immutable evidence explorer with saved audit filters.
- **Rail:** Compliance, Evidence, Incidents, Workforce, Reports, Copilot.
- **Quick actions:** Open audit run, Export evidence bundle, Ask Copilot with citations.
- **Layout:** `layout.analytics`; **read-only** enforced by RBAC.

### 9.9 Arjun — IT / OT Engineer
- **Home:** `/admin/health` — System SLOs, connector health, edge fleet status.
- **Rail:** Admin, OT, Vision, IoT, Data, Workflows, Marketplace, Security (read).
- **Quick actions:** Restart connector, Recalibrate camera, Rollback release, Inspect workflow run.
- **Layout:** `layout.admin`.

### 9.10 Neha — CISO
- **Home:** `/security` — Posture, active sessions, privacy signals.
- **Rail:** Security, Compliance, Data, Admin, Audit Log, Console (read).
- **Quick actions:** Trigger AI kill-switch, Rotate key, Investigate audit event, Freeze session.
- **Layout:** `layout.admin`.

---

## 10. Desktop Navigation

Desktop is the canonical surface for command, workflow, analytics, and admin personas.

- **Resolution baseline:** 1440×900 min; 1920×1080 target; wall displays up to 3840×2160.
- **Chrome:** 56px top bar + 64px collapsed / 240px expanded left rail + 40px breadcrumb + main canvas.
- **Copilot dock:** 380px right rail, toggleable, remembers state per module.
- **Split view:** any module route can be duplicated in a right-pane split for cross-module workflows (e.g., Incident + Twin).
- **Wall mode:** `/console/wall` suppresses chrome entirely; kiosk-oriented; controlled by a physical key or IdP claim.
- **Keyboard-first:** every primary action has a documented shortcut; global palette on ⌘K / Ctrl-K.
- **Density:** Comfortable / Compact toggle; wall mode forces Compact.

---

## 11. Mobile Navigation

Mobile is defined by MOB-* features and is designed for glove-use, voice-first, and offline-first.

- **Structure:** Bottom tab bar (5 slots), top scope-lock header (site pill only; scope changes require re-auth on mobile), floating SOS FAB.
- **Tabs (default):** Home · Permits · Report · Twin · Me. Passport replaces Twin for contractors.
- **Gestures:** Swipe-left on list item → quick actions (check-in, sign, suspend). Long-press on twin object → context menu.
- **Voice:** Push-to-talk in header; supported for reporting, permit check-in, and Copilot Q&A.
- **Offline:** All views show an "Offline" banner; queued actions listed under `/mobile/sync` with idempotency guarantees (WFP-008).
- **Camera:** Deep integration for hazard photo, QR permit scan, LOTO tag scan.
- **Push:** Notifications route to the module's canonical route with the correct scope.

**Mobile-only routes** live under `/mobile/*` (see §5.2 Module 16); other module routes render with `layout.mobile` when the device is a mobile client.

---

## 12. Command Palette Navigation

The command palette is the primary keyboard interface (⌘K / Ctrl-K) and is treated as a first-class navigation surface.

### 12.1 Categories

1. **Navigate to…** — fuzzy route resolver across the sitemap.
2. **Open object…** — resolves any entity ID (`PTW-`, `INC-`, `ASSET-`, worker badge, camera).
3. **Actions** — persona-scoped actions (draft permit, suspend permit, declare emergency, acknowledge alarm flood, run compliance report).
4. **Ask Copilot** — routes free-text to RAG Copilot with current scope pre-attached.
5. **Filters** — saved filters library (e.g., "Open hot-work permits in Coke-Oven-North").
6. **Recents** — last 20 objects and pages, per user.
7. **System** — sign out, switch tenant, toggle theme, keyboard shortcuts help.

### 12.2 Palette Behavior

- Global keybind ⌘K / Ctrl-K; also invoked from top-nav search focus.
- Prefixed searches: `>` action, `#` object, `?` Copilot, `@` person, `~` filter.
- Actions execute inline where safe; destructive actions open a confirm sheet.
- Palette results respect ABAC — no result leaks unauthorized entities.
- Voice-invoked variant on mobile shares the same intent grammar.

---

## 13. Search Architecture

Search spans navigation, entities, documents, evidence, and Copilot answers.

### 13.1 Layers

- **L0 — Local Palette:** in-memory routes, recents, saved filters (§12).
- **L1 — Entity Index:** OpenSearch-backed, indexed by module ETL from KG (Permits, LOTO, Incidents, Assets, Workers, Alarms, CV Events, OT Tags).
- **L2 — Document Index:** SOPs, PSSRs, regulations, procedures — vectorized for RAG (RAG-* features).
- **L3 — Evidence Index:** immutable evidence bundles for compliance (COMP-* features), with legal-hold flags.
- **L4 — Copilot Layer:** RAG-grounded answer generation with citations that deep-link to L1/L2/L3.

### 13.2 Global Search Page — `/search`

- Facets: Module, Scope, Type, State, Date, Sensitivity, Owner.
- Result cards show provenance (which index, which permission class, when indexed).
- Every result exposes a "Why this result?" affordance (search explainability parallel to alert explainability).
- Saved searches become notification rules (NOT-*) with one click.

### 13.3 Contextual Search

- Every list page has a scoped search that queries the same index with the module + scope prefiltered.
- Twin search returns spatial results (zones, assets) with map-jump.
- KG search offers ontology-typed autocompletion.

### 13.4 Search Governance

- ABAC applied at query time; filtered documents count is surfaced ("12 results hidden by policy") without leaking titles.
- Query audit log (SEC-*) tracks who searched what — reviewable by CISO.

---

## 14. Notification Architecture

Notifications compose module-emitted events, WFP canonical event bus (WFP-002), routing rules (NOT-*), and delivery channels.

### 14.1 Sources

- Alarm module (AL-*)
- Compound risk (CR-*)
- Emergency (ER-*)
- Permit / LOTO state transitions (PTW-*, LOTO-*)
- Incident lifecycle (INC-*)
- Workflow SLA breaches (WFP-007)
- Predictive threshold crossings (PRED-*)
- IoT device / wearable alerts (IOT-*)
- Admin system alerts (ADM-*, OBS-*)
- Compliance findings & audit events (COMP-*)

### 14.2 Routing Model

```
Event → Canonical Event Bus (WFP-002)
      → Routing Rules (NOT/rules) evaluate scope + severity + persona + jurisdiction
      → Channel Adapter (SMS, WhatsApp, Push, Teams, Email, PA, Wearable Buzz)
      → Delivery Ledger (immutable) with retries + escalation
```

### 14.3 UI Surfaces

- **Global Bell** (top nav) — badge count of unread + escalated.
- **Notification Center** — `/notifications` inbox, filters by module, severity, state.
- **Toast Layer** — non-blocking transient toasts for low-severity events.
- **Banner Layer** — persistent per-scope banners for site-wide critical events (e.g., emergency declared).
- **Wall Display Ticker** — dedicated ticker line on `/console/wall`.
- **Mobile Push** — routed to canonical entity route with deep link + scope preserved.
- **Wearable Haptic** — for immediate-action alerts to field workers (IOT-*).

### 14.4 Escalation

- Every rule has an SLA. Missed acknowledgements escalate up the org tree per role.
- Escalation ladder is visualized on the notification detail page.
- CISO and Plant Head receive digest summaries of unacknowledged critical alerts.

### 14.5 Preferences

- Per-user preferences under `/notifications/preferences`.
- Do-not-disturb windows respect on-shift status (ABAC attribute).
- Critical safety alerts (LSE — Life-Safety Escalation) cannot be muted.

---

## 15. Cross-Module Navigation Patterns (Explicit Contracts)

Because SafetyOS is a fusion product, cross-module hops are the majority of expert-user journeys. Each is contracted below with entry, exit, and the object identity that carries context.

### 15.1 Alarm → Compound Risk → Twin
Entry: `/alarms` row click.
Path: `/alarms/:alarmId` → "See fusion" → `/risk/events/:eventId` → "Locate" → `/twin?event=:eventId&layers=personnel,gas`.
Context: alarm + fusion trace + spatial layer preselection.

### 15.2 Permit Suspension by Compound Risk
Trigger: CR rule fires on active PTW.
Path: `/risk/events/:eventId` → "Affected permits" list → `/permits/:permitId/suspend` (pre-filled reason with CR-event link).
Bidirectional: permit detail's Related rail links back to the CR event.

### 15.3 Incident → RCA → Knowledge Graph
Entry: `/incidents/:incidentId`.
Path: → `/incidents/:incidentId/rca` → click an entity in evidence → `/knowledge/entities/:entityId` → back-link preserved.

### 15.4 Emergency Declaration Broadcast Fan-out
Entry: `/emergency/declare`.
Path: creates an Incident (`/incidents/:incidentId`), spawns `/emergency/active/:incidentId`, opens `/emergency/broadcasts` composer, and pushes to `/notifications` mass channels.

### 15.5 Shift Handover Comprehension Loop
Entry: `/handover/:handoverId`.
Path: authoring supervisor → `/handover/:handoverId/acknowledge` (outgoing sign) → incoming operator receives push → `/handover/:handoverId/quiz` → back to `/console/unit/:unitId`.

### 15.6 Vision Event → Privacy Review
Entry: `/vision/events/:eventId`.
Path: contains PII? → `/vision/privacy` policy panel → `/security/privacy` control confirmation → back to event with masking applied.

### 15.7 Copilot Citation → Canonical Object
Any Copilot answer returns citations that deep-link to `/copilot/citations/:citationId` which redirects to the entity's canonical route with a highlight anchor.

### 15.8 Compliance Evidence → Source
`/compliance/evidence` row → jumps to `/incidents/:incidentId`, `/permits/:permitId`, or `/vision/events/:eventId` depending on evidence class. Return breadcrumb preserved.

### 15.9 Workflow Engine Introspection
Every workflow-driven page (PTW, LOTO, Incident, ER) exposes a "View runtime" link that opens `/workflows/temporal/:workflowId` for engineers (Arjun) — hidden by policy for other roles.

---

## 16. Page Registry

For every page in the sitemap, the following spec is provided: **Purpose, Parent, Children, Related Modules, Required Permissions, Entry Points, Exit Points, Connected Workflows**. Entries are grouped by module.

> Notation: `perm(...)` uses the OPA expression form. `role` is the RBAC role; `scope` is the ABAC scope; `attr` denotes additional attributes.

### 16.1 Root & Persona Home

**Page: `/home`**
- **Purpose:** Persona-adaptive landing; resolves to the persona home defined in §9.
- **Parent:** — (root)
- **Children:** none directly; delegates.
- **Related modules:** all (Band A–E depending on persona).
- **Required permissions:** `role ∈ any authenticated`.
- **Entry points:** sign-in redirect; logo click; ⌘K → "Home".
- **Exit points:** to persona primary destination.
- **Connected workflows:** none directly; dispatches to persona.

### 16.2 Command Console

**Page: `/console`** — L1 Plant-wide overview.
- **Purpose:** High-performance HMI at ISA-101 Level 1: units status, major alarms, SIF exposure index.
- **Parent:** `/home`.
- **Children:** `/console/site/:siteId`, `/console/portfolio`, `/console/wall`.
- **Related modules:** UI, AL, CR, DT, INC.
- **Permissions:** `role ∈ {supervisor, control_room, hse, plant_head, ciso, admin} ∧ scope ⊆ user.scope`.
- **Entry points:** persona home; top nav Console tab; ⌘K "L1".
- **Exit points:** drill to `/console/site/:siteId`, jumps to `/alarms`, `/risk`, `/twin`.
- **Connected workflows:** alarm ack, compound-risk confirm.

**Page: `/console/site/:siteId`, `/console/area/:areaId`, `/console/unit/:unitId`, `/console/asset/:assetId`, `/console/diagnostics/:objectId`** — L1→L4 drill.
- **Purpose:** Progressive detail from site to diagnostics.
- **Parent:** the parent level in the L1→L4 chain.
- **Children:** the next level down.
- **Related modules:** AL, CR, PTW, LOTO, PRED, OT, CV.
- **Permissions:** scope-restricted; L4 requires `attr(technical_role=true)` for RCA and IT/OT personas.
- **Entry points:** breadcrumb drill; twin asset click; alarm-row jump; predictive alert.
- **Exit points:** to `/twin/assets/:assetId`, `/loto`, `/permits`, `/incidents`.
- **Connected workflows:** any workflow bound to the scope object.

**Page: `/console/portfolio`** — Executive rollup.
- **Purpose:** Cross-site portfolio KPIs, SIF exposure, incident trend.
- **Parent:** `/console`.
- **Permissions:** `role ∈ {plant_head, hse, ciso, admin}`.
- **Entry points:** persona home for Meena.
- **Exit points:** drill into any site's `/console/site/:siteId`.

**Page: `/console/wall`** — Wall-display mode.
- **Purpose:** Chrome-suppressed L1/L2 rendering for control-room walls.
- **Parent:** `/console`.
- **Permissions:** `role ∈ {control_room, supervisor} ∧ attr(kiosk=true)`.
- **Entry points:** kiosk auto-launch; supervisor toggle.
- **Exit points:** ESC to `/console`.

### 16.3 Digital Twin

**Page: `/twin`** — 2D twin.
- **Purpose:** Live geospatial view of the site with layers.
- **Parent:** `/home`.
- **Children:** `/twin/3d`, `/twin/layers`, `/twin/replay`, `/twin/assets/:assetId`, `/twin/plume/:eventId`.
- **Related modules:** DT, CV, IOT, KG, PRED, ER.
- **Permissions:** `role ∈ any_operational ∧ scope ⊆ user.scope`.
- **Entry points:** top nav; console asset click; incident locate; emergency muster.
- **Exit points:** to `/console/asset/:assetId`, `/vision/cameras/:cameraId`, `/emergency/muster`.
- **Connected workflows:** emergency evacuation, plume simulation, permit spatial conflict visualization.

**Page: `/twin/3d`, `/twin/layers`, `/twin/replay`, `/twin/assets/:assetId`, `/twin/plume/:eventId`** — Sub-views inheriting the twin canvas with mode-specific overlays.

### 16.4 Permit-to-Work

**Page: `/permits`** — Permit register.
- **Purpose:** List of permits by state, type, zone, contractor.
- **Parent:** `/home`.
- **Children:** `/permits/new`, `/permits/templates`, `/permits/:permitId`.
- **Related modules:** PTW, LOTO, KG, CR, CON, MOB, WFP.
- **Permissions:** `role ∈ any_operational`; contractor scope filtered to own company.
- **Entry points:** top nav; console unit; mobile home; command palette.
- **Exit points:** to permit detail, to `/loto` for linked LOTO, to `/risk/events/:eventId`.
- **Connected workflows:** PTW state machine (Draft → Risk Assessment → Conflict Check → Approval → Active → Closed / Suspended / Cancelled).

**Page: `/permits/new`**
- **Purpose:** AI-assisted permit draft.
- **Parent:** `/permits`.
- **Children:** `/permits/:permitId` on save.
- **Related modules:** RAG, KG, CR.
- **Permissions:** `role ∈ {operator, contractor, supervisor}`.
- **Entry points:** register CTA; palette "Draft permit"; mobile FAB.
- **Exit points:** to draft permit detail.
- **Connected workflows:** PTW draft; auto-classification.

**Page: `/permits/:permitId`** — Permit detail.
- **Purpose:** Canonical permit surface; state machine + sub-tabs.
- **Parent:** `/permits`.
- **Children:** `/risk-assessment`, `/conflict-check`, `/signatures`, `/check-in`, `/suspend`.
- **Related modules:** PTW, LOTO, KG, CR, DT, MOB, WFP, COMP.
- **Permissions:** issuer + affected supervisors + HSE (approve); contractor (own).
- **Entry points:** register row; palette object; twin overlay; notification.
- **Exit points:** to LOTO tag, to Twin zone, to Compound Risk event.
- **Connected workflows:** approval chain (WFP-005), NFC check-in, suspension.

**Sub-pages** (each declared with parent `/permits/:permitId`):

- `/permits/:permitId/risk-assessment` — JSA/HIRA workspace. Related: KG, RAG. Perms: same as parent + `attr(cert.jsa=true)` for sign.
- `/permits/:permitId/conflict-check` — Spatial + temporal conflict inspector. Related: DT, KG, CR. Perms: supervisor + HSE read.
- `/permits/:permitId/signatures` — Multi-role sign-off. Related: SEC, WFP. Perms: role-bound signers.
- `/permits/:permitId/check-in` — NFC/geofence check-in log. Related: MOB, IOT. Perms: operator/contractor self.
- `/permits/:permitId/suspend` — Suspension capture with CR link. Related: CR, WFP. Perms: supervisor, HSE, control_room.

**Page: `/permits/templates`** — Template library (Hot Work, Confined Space, WAH, etc.). Perms: HSE write; supervisor read; admin governance.

### 16.5 Lockout / Tagout

**Page: `/loto`** — LOTO board.
- **Purpose:** Per-unit isolation state, active tags, verification status.
- **Parent:** `/home`.
- **Children:** `/loto/isolations/:isolationId`, `/loto/library`.
- **Related modules:** LOTO, PTW, CV, OT, KG, WFP.
- **Permissions:** operator/contractor own; supervisor unit; HSE read.
- **Entry points:** top nav; console unit; permit detail linked.
- **Exit points:** to isolation detail, back to permit.
- **Connected workflows:** LOTO isolate → verify → release; unauthorized re-energization detection.

**Sub-pages:**
- `/loto/isolations/:isolationId` — parent detail.
- `/loto/isolations/:isolationId/points` — checklist. Related: KG.
- `/loto/isolations/:isolationId/verification` — CV+OT zero-energy verification.
- `/loto/isolations/:isolationId/release` — controlled release.
- `/loto/library` — procedures per asset.

### 16.6 Shift Handover

**Page: `/handover`** — Queue.
- **Purpose:** Handover packets for the current shift boundary.
- **Parent:** `/home`.
- **Children:** `/handover/:handoverId`, `/handover/history`, `/handover/settings`.
- **Related modules:** SH, KG, AL, INC, RAG.
- **Permissions:** supervisor + operator (own crew); HSE read.
- **Entry points:** persona home; console unit; notification at shift boundary.
- **Exit points:** to packet detail; back to console.
- **Connected workflows:** handover assembly (AI draft) → sign-out → sign-in → quiz → acknowledge.

**Sub-pages:**
- `/handover/:handoverId` — Packet detail.
- `/handover/:handoverId/quiz` — Comprehension quiz.
- `/handover/:handoverId/acknowledge` — Sign-in sign-off.
- `/handover/history` — Archive; auditor-visible.
- `/handover/settings` — Per-unit config; admin/HSE.

### 16.7 Incident Management & RCA

**Page: `/incidents`** — Register.
- **Purpose:** Central incident register (safety, near-miss, environmental, security).
- **Parent:** `/home`.
- **Children:** `/incidents/new`, `/incidents/:incidentId`.
- **Related modules:** INC, ER, CR, DT, KG, COMP, RAG, WFP.
- **Permissions:** operator/contractor report; supervisor/HSE/safety officer full.
- **Entry points:** top nav; mobile FAB; emergency creates one; notification.
- **Exit points:** to detail; to Twin replay; to Compliance evidence.
- **Connected workflows:** capture → auto-timeline → RCA → actions → report → close.

**Sub-pages:**
- `/incidents/new` — Rapid capture.
- `/incidents/:incidentId` — Summary.
- `/incidents/:incidentId/timeline` — Auto-assembled evidence timeline.
- `/incidents/:incidentId/evidence` — Evidence bundle (immutable when locked).
- `/incidents/:incidentId/rca` — Root-cause workspace.
- `/incidents/:incidentId/actions` — CAPA tracker.
- `/incidents/:incidentId/report` — Regulatory report (IR-1, OSHA 301).

### 16.8 Emergency Response

**Page: `/emergency`** — Readiness.
- **Purpose:** Preparedness posture, drill status, playbook coverage.
- **Parent:** `/home`.
- **Children:** `/emergency/declare`, `/emergency/active/:incidentId`, `/emergency/playbooks`, `/emergency/muster`, `/emergency/drills`, `/emergency/broadcasts`.
- **Related modules:** ER, INC, DT, IOT, NOT, WFP.
- **Permissions:** supervisor/control_room/HSE write; plant_head approve; auditor read.
- **Entry points:** top nav; emergency beacon; alarm flood escalation.
- **Exit points:** to active surface, muster board, incident.
- **Connected workflows:** First-10-Minute Playbook; PA broadcast; muster headcount.

### 16.9 Compound Risk

**Page: `/risk`** — Heatmap.
- **Purpose:** Live compound-risk score per zone.
- **Parent:** `/home`.
- **Children:** `/risk/rules`, `/risk/events`, `/risk/simulator`.
- **Related modules:** CR, KG, CV, OT, PTW, AG.
- **Permissions:** supervisor/control_room/HSE.
- **Entry points:** console rail; alarm fusion; emergency dashboard.
- **Exit points:** to event detail; twin overlay; permit suspend.
- **Connected workflows:** CR rule evaluation; permit suspension; supervisor confirm.

**Sub-pages:**
- `/risk/rules`, `/risk/rules/:ruleId` — Rule library and detail (backtest).
- `/risk/events`, `/risk/events/:eventId` — Fusion event detail with signal trace.
- `/risk/simulator` — KG-backed scenario simulator.

### 16.10 Alarm Rationalization

**Page: `/alarms`** — Live list.
- **Purpose:** ISA-18.2 rationalized alarm surface.
- **Parent:** `/home`.
- **Children:** `/alarms/floods`, `/alarms/shelved`, `/alarms/rationalization`, `/alarms/kpis`.
- **Related modules:** AL, OT, CR, WFP.
- **Permissions:** control_room full; supervisor unit; HSE read.
- **Entry points:** console; wall ticker; notification.
- **Exit points:** to fusion event; to OT tag; to asset console.
- **Connected workflows:** ack, shelve, escalate, rationalize.

### 16.11 Predictive

**Page: `/predictive`** — Prediction hub.
- **Purpose:** Forecasts across gas, RUL, fatigue.
- **Parent:** `/home`.
- **Children:** `/predictive/gas`, `/predictive/rul`, `/predictive/fatigue`, `/predictive/models`.
- **Related modules:** PRED, ML, DP, OT, IOT.
- **Permissions:** HSE/supervisor/plant_head read; IT/OT write on models.
- **Entry points:** console; notification threshold breach.
- **Exit points:** to model detail; to twin plume; to alarm rule.

### 16.12 Computer Vision

**Page: `/vision`** — Vision ops.
- **Purpose:** Camera fleet, model roster, event triage.
- **Children:** `/vision/cameras`, `/vision/events`, `/vision/models`, `/vision/zones`, `/vision/privacy`.
- **Related modules:** CV, DP, KG, SEC.
- **Permissions:** IT/OT full; HSE/supervisor read; CISO privacy controls.
- **Connected workflows:** calibration, event review, PII masking review.

**Sub-pages:** as enumerated in §5.2 Module 1.

### 16.13 OT / SCADA

**Page: `/ot`** — Health.
- **Purpose:** Integration health, connector status, tag browser.
- **Children:** `/ot/connectors`, `/ot/tags`, `/ot/normalization`, `/ot/quality`.
- **Related modules:** OT, KG, DP, AL.
- **Permissions:** IT/OT full; HSE read; supervisor read.
- **Connected workflows:** connector lifecycle; tag subscription; normalization publish.

### 16.14 IoT & Wearables

**Page: `/iot`** — Dashboard.
- **Children:** `/iot/devices`, `/iot/telemetry/:workerId`, `/iot/geofences`.
- **Related modules:** IOT, KG, PRED, DT.
- **Permissions:** worker self; supervisor crew; HSE read; IT/OT write.

### 16.15 Knowledge Graph

**Page: `/knowledge`** — Overview.
- **Children:** `/knowledge/browse`, `/knowledge/entities/:entityId`, `/knowledge/ontology`, `/knowledge/queries`, `/knowledge/lineage/:entityId`.
- **Related modules:** KG, RAG, CV, OT, COMP.
- **Permissions:** analyst/safety officer read; IT/OT + HSE write on ontology (governed).
- **Connected workflows:** entity resolution, ontology change control (WFP approval).

### 16.16 RAG Copilot & Agents

**Page: `/copilot`** — Chat.
- **Purpose:** Grounded Q&A over regs, SOPs, plant state.
- **Children:** `/copilot/threads/:threadId`, `/copilot/sources`, `/copilot/prompts`, `/copilot/citations/:citationId`, `/copilot/agents`.
- **Related modules:** RAG, AG, KG, DP, COMP.
- **Permissions:** all authenticated with scope-aware answers; HITL + kill-switch restricted.
- **Connected workflows:** RAG retrieval, agent tool-use, HITL decision cards, kill-switch.

**Agents sub-tree:**
- `/copilot/agents` list.
- `/copilot/agents/:agentId` card.
- `/copilot/agents/:agentId/runs/:runId` trace.
- `/copilot/agents/hitl` decision inbox (WFP-012).
- `/copilot/agents/kill-switch` CISO-only (AG-020).

### 16.17 Workforce & Contractors

**Page: `/workforce`** — Overview.
- **Children:** `/workforce/contractors`, `/workforce/contractors/:companyId`, `/workforce/workers/:workerId`, `/workforce/workers/:workerId/passport`, `/workforce/onboarding`, `/workforce/certifications`.
- **Related modules:** CON, COMP, MOB, SEC.
- **Permissions:** HSE full; supervisor crew; contractor own company.
- **Connected workflows:** onboarding, orientation quiz, cert renewal, scorecard update.

### 16.18 Compliance & Audit

**Page: `/compliance`** — Dashboard.
- **Children:** `/compliance/frameworks`, `/compliance/frameworks/:frameworkId`, `/compliance/controls/:controlId`, `/compliance/evidence`, `/compliance/audits`, `/compliance/audits/:auditId`, `/compliance/reports`.
- **Related modules:** COMP, INC, PTW, LOTO, SH, SEC, DP.
- **Permissions:** HSE + auditor full; plant_head read; contractor none.
- **Connected workflows:** continuous compliance evaluation, audit run, evidence sealing.

### 16.19 Notifications

**Page: `/notifications`** — Inbox.
- **Children:** `/notifications/preferences`, `/notifications/rules`, `/notifications/channels`, `/notifications/templates`, `/notifications/history`.
- **Related modules:** NOT, WFP, SEC.
- **Permissions:** self (inbox, preferences); HSE + admin (rules, channels, templates); auditor read history.
- **Connected workflows:** routing rule authoring, escalation ladder configuration.

### 16.20 Mobile

**Page: `/mobile`** — Field home. See §11 for structure. Sub-pages: `/report`, `/sos`, `/passport`, `/checklist/:checklistId`, `/sync`.

### 16.21 Data Platform (incl. Module 25)

**Page: `/data`** — Platform overview.
- **Children:** `/data/lakehouse`, `/data/streams`, `/data/features`, `/data/models`, `/data/models/:modelId`, `/data/labeling`, `/data/contracts`, `/data/gpu`, `/data/retention`.
- **Related modules:** ML, DP, KG, SEC.
- **Permissions:** IT/OT + data engineer; HSE read for model cards; CISO read for retention.
- **Connected workflows:** model registry → canary → drift, active-learning, EU-AI-Act documentation, right-to-erasure automation.

### 16.22 Workflow Engine (Module 26)

**Page: `/workflows`** — Overview.
- **Children:** `/workflows/temporal`, `/workflows/temporal/:workflowId`, `/workflows/events`, `/workflows/policies`, `/workflows/rules`, `/workflows/approvals`, `/workflows/hitl`, `/workflows/sla`.
- **Related modules:** WFP, all workflow-emitting modules (PTW, LOTO, INC, ER, CR).
- **Permissions:** IT/OT + platform engineer full; HSE read; auditor read on policies + approvals.
- **Connected workflows:** hosts every long-running workflow; introspected from module-level pages.

### 16.23 Administration

**Page: `/admin`** — Overview.
- **Children:** `/admin/tenants`, `/admin/sites`, `/admin/zones`, `/admin/assets`, `/admin/features`, `/admin/health`, `/admin/deployment`, `/admin/backup`.
- **Related modules:** ADM, SEC, DP, WFP.
- **Permissions:** admin full; tenants restricted to super-admin; CISO read on health.
- **Connected workflows:** tenant provisioning, site onboarding, asset lifecycle, release management, DR.

### 16.24 Security & Identity

**Page: `/security`** — Posture.
- **Children:** `/security/identities`, `/security/roles`, `/security/policies`, `/security/sessions`, `/security/audit-log`, `/security/keys`, `/security/privacy`.
- **Related modules:** SEC, WFP, COMP, DP.
- **Permissions:** CISO full; admin write (identities, roles); auditor read (audit-log).
- **Connected workflows:** identity federation, key rotation, privacy control, session freeze.

### 16.25 Marketplace & Developer

**Page: `/marketplace`** — Catalog.
- **Children:** `/marketplace/apps/:appId`, `/marketplace/installed`, `/marketplace/webhooks`, `/marketplace/api-keys`, `/marketplace/developer`.
- **Related modules:** EXT, SEC, ADM.
- **Permissions:** admin install; IT/OT configure; developer sandbox.
- **Connected workflows:** app install with permission grants, webhook lifecycle, API key rotation.

### 16.26 Cross-cutting Utility Pages

**Page: `/search`** — Global search results (§13).
- **Parent:** — (utility).
- **Related modules:** all.
- **Permissions:** any authenticated; ABAC-filtered results.
- **Entry points:** top-nav search; palette `#` prefix.
- **Exit points:** to entity canonical route.

**Page: `/me`** — User profile & sessions.
- **Children:** `/me/profile`, `/me/preferences`, `/me/sessions`, `/me/devices`.
- **Permissions:** self only.

**Page: `/auth/*`** — Sign-in flows.
- **Children:** `/auth/signin`, `/auth/mfa`, `/auth/sso/callback`, `/auth/kiosk`.
- **Permissions:** unauthenticated allowed; kiosk requires signed device claim.

---

## 17. Entry Points and Exit Points (Aggregate)

The five canonical **entry points** into any page:

1. **Persona Home** → per §9.
2. **Top Navigation** → module tab or scope selector.
3. **Sidebar** → module + section drill.
4. **Command Palette** → fuzzy route / object / action.
5. **Notification** → deep link with scope.

Plus contextual entries: **Twin object click**, **Alarm-row jump**, **Copilot citation**, **Related Modules rail**, **Breadcrumb**, **Split-view target**.

The five canonical **exit points** from any page:

1. **Drill-down** to a child page.
2. **Drill-up** via breadcrumb.
3. **Cross-module jump** via Related Modules rail or Explainability Trace.
4. **Palette** (⌘K) — any target.
5. **Action completion** — workflow transition to another module.

---

## 18. Connected Workflows Map

The following long-running workflows are hosted by the Workflow Engine (WFP-001) and referenced by pages throughout the sitemap. Each is listed with its owning module, participating modules, and canonical entry/exit routes.

| # | Workflow | Owning Module | Participating Modules | Entry Route | Terminal Route |
|---|---|---|---|---|---|
| 1 | PTW Lifecycle | PTW | KG, CR, LOTO, DT, MOB, WFP | `/permits/new` | `/permits/:permitId` (Closed) |
| 2 | LOTO Isolate → Release | LOTO | PTW, CV, OT, KG, WFP | `/loto/isolations/:id` | `/loto/isolations/:id/release` |
| 3 | Shift Handover | SH | KG, AL, INC, RAG, WFP | `/handover/:id` | `/handover/:id/acknowledge` |
| 4 | Incident Capture → RCA → Report | INC | ER, CR, DT, KG, COMP, RAG, WFP | `/incidents/new` | `/incidents/:id/report` |
| 5 | Emergency First-10-Minute Playbook | ER | INC, DT, NOT, IOT, WFP | `/emergency/declare` | `/emergency/active/:id` (Resolved) |
| 6 | Compound Risk Detection → Response | CR | AL, OT, CV, KG, PTW, WFP | `/risk/events/:id` | back to source module or `/permits/:id/suspend` |
| 7 | Alarm Rationalization Cycle | AL | OT, WFP | `/alarms/rationalization` | `/alarms/kpis` |
| 8 | Contractor Onboarding & Passport | CON | COMP, MOB, SEC, WFP | `/workforce/onboarding` | `/workforce/workers/:id/passport` |
| 9 | Continuous Compliance Evaluation | COMP | INC, PTW, LOTO, SH, DP, WFP | `/compliance` | `/compliance/audits/:id` |
| 10 | Model Lifecycle (Train → Canary → Promote) | DP | ML, WFP, SEC | `/data/models` | `/data/models/:id` (Promoted) |
| 11 | Policy Change (Rego) | WFP | SEC, COMP | `/workflows/policies` | `/workflows/policies` (Signed release) |
| 12 | AI Kill-Switch | AG | SEC, WFP | `/copilot/agents/kill-switch` | resumed state via CISO override |
| 13 | HITL Decision | AG | WFP | `/copilot/agents/hitl` | any source workflow resumes |
| 14 | Tenant / Site Onboarding | ADM | SEC, DP, WFP | `/admin/tenants` or `/admin/sites` | site live in `/console` |
| 15 | Right-to-Erasure | DP | SEC, COMP, WFP | `/data/retention` | evidence-sealed erasure certificate |

---

## 19. Global Cross-cutting Concerns

### 19.1 Explainability

Every alert-derived page (`/alarms/*`, `/risk/*`, `/predictive/*`, `/vision/events/*`, `/incidents/*/timeline`) must render a **Why?** panel that shows the fusion path with clickable jumps. This is a hard IA contract, not a soft convention.

### 19.2 Offline Semantics

Mobile routes must declare offline-capability and idempotency class. The `/mobile/sync` page is the canonical queue viewer, and every action-emitting mobile page links here on completion.

### 19.3 Audit Trail

Every write action across the sitemap emits a canonical event to WFP-002 which is durably indexed by SEC's `/security/audit-log`. Auditor persona (Kavya) can locate any historical action from this single surface.

### 19.4 Sensitivity Classes

Face imagery, biometric telemetry, medical fatigue signals, and contractor PII are classed and gated at the ABAC layer. Any page touching these routes is annotated in its Page Registry entry with `sensitivity ∈ {face, bio, med, pii}` and requires an additional privacy claim in the JWT.

### 19.5 Tenancy Isolation

Cross-tenant navigation is impossible from the UI; a super-admin persona switching tenants forces a full re-auth and rebuild of local state. WFP-010 (Cross-Tenant Workflow Isolation) is enforced at the runtime and mirrored at the IA layer.

### 19.6 Localization & Voice

Every user-visible label is i18n-keyed. Voice grammars are defined per language for MOB and Copilot voice invocation. Right-to-left is supported at layout level.

### 19.7 Accessibility

All pages meet WCAG 2.2 AA. Wall-display and mobile-in-glove modes carry additional target-size and contrast requirements.

---

## 20. Appendices

### Appendix A — Feature ID → Route Reverse Index (Selected)

| Feature ID | Primary Route |
|---|---|
| CV-001..CV-032 | `/vision/*` |
| OT-001..OT-022 | `/ot/*` |
| KG-001..KG-018 | `/knowledge/*` |
| CR-001..CR-024 | `/risk/*` |
| PTW-001..PTW-022 | `/permits/*` |
| LOTO-001..LOTO-016 | `/loto/*` |
| SH-001..SH-012 | `/handover/*` |
| INC-001..INC-020 | `/incidents/*` |
| ER-001..ER-018 | `/emergency/*` |
| DT-001..DT-018 | `/twin/*` |
| RAG-001..RAG-018 | `/copilot/*` |
| AG-001..AG-020 | `/copilot/agents/*` |
| PRED-001..PRED-014 | `/predictive/*` |
| AL-001..AL-014 | `/alarms/*` |
| UI-001..UI-022 | `/console/*` |
| MOB-001..MOB-022 | `/mobile/*` |
| CON-001..CON-014 | `/workforce/*` |
| COMP-001..COMP-018 | `/compliance/*` |
| IOT-001..IOT-012 | `/iot/*` |
| SEC-001..SEC-018 | `/security/*` |
| ML-001..ML-016 | `/data/*` |
| NOT-001..NOT-012 | `/notifications/*` |
| ADM-001..ADM-018 | `/admin/*` |
| EXT-001..EXT-016 | `/marketplace/*` |
| DP-001..DP-016 | `/data/*` (merged) |
| WFP-001..WFP-012 | `/workflows/*` |

### Appendix B — Reserved URL Segments

`new`, `draft`, `search`, `settings`, `history`, `export`, `explain`, `wall`, `portfolio`, `active`, `declare`, `suspend`, `release`, `verification`, `acknowledge`, `quiz`, `hitl`, `kill-switch`, `sync`, `sso`, `mfa`, `kiosk`.

### Appendix C — Route Naming Conventions

- Kebab-case for all path segments.
- IDs are opaque strings; entity type is inferable from the parent segment.
- No trailing slashes.
- No verbs in URLs except approved reserved segments.
- No PII in URLs (worker IDs are opaque tokens).

### Appendix D — Change Log

- **1.0 (2026-07-21):** Initial canonical IA derived from PRSD v1.0, Master Feature Specifications v1.0 (466 features / 24 modules), and vNext Patch (Modules 25 & 26). Approved as engineering handoff.

---

*End of Information_Architecture.md*
