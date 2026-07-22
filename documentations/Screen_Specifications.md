
# Screen_Specifications

## 1. Purpose and Scope
This document is the implementation-ready screen specification for **SafetyOS**, derived from the uploaded Design System, Information Architecture, Master Feature Specifications, and vNext patch. It covers the global shells, every canonical route in the product IA, and the specialist child surfaces and vNext control-plane pages implied by the feature set.

The specification assumes a modern implementation stack of **Next.js 15**, **React 19**, **Tailwind CSS 4**, **Radix UI**, **shadcn/ui**, **Framer Motion / Motion**, **React Flow**, **deck.gl**, and selectively **Three.js** for the Digital Twin.

## 2. Global Conventions
- **Route grammar:** `/<module>/<section>/<object-id>/<sub-object>?<scope-params>` with workspace inheritance `Organization → Site → Area → Unit → Zone → Asset`.
- **Layout taxonomy:** `layout.command`, `layout.workflow`, `layout.analytics`, `layout.geospatial`, `layout.mobile`, `layout.admin`, `layout.auth`.
- **Permission model:** OPA-backed RBAC + ABAC with confidential 404-shaped denials when discoverability is not allowed.
- **Visual system:** grayscale-first, quiet-by-default, OKLCH tokenized colors only, 4px spacing lattice, Inter Variable + JetBrains Mono, dark mode elevation via surface lightening, no zebra tables, no ornamental color.
- **Motion system:** 120–240ms default transitions, no distracting loops except sanctioned live indicators / Halo Orb / catastrophic alerts, mandatory reduced-motion fallback.
- **State model:** every screen must define empty, loading, and error behavior; all data states preserve scope, timestamps, and actionable next steps.
- **AI contract:** all alert-derived or AI-assisted surfaces show citations/evidence, confidence, and a reasoning/trace model; no black-box recommendations on safety-critical tasks.
- **API naming:** use `/api/v1/{domain}` REST and event-driven updates; long-running orchestration and streaming may also use WebSocket/gRPC internally.
- **Event naming:** `{domain}.{entity}.{action}.v1` unless canonical source names are mandated (for example `CompoundRisk.v2`, `cv.event.v2`).
- **Component ID syntax:** `{screenNamespace}.{region}.{component}[.{state}]`, stable across releases and usable in Playwright, analytics, and telemetry.
- **Accessibility:** WCAG 2.2 AA globally, AAA intent for safety-critical command surfaces, keyboard parity, strong focus, and motion reduction.

## 3. Coverage Approach
The **Information Architecture** is treated as the canonical route inventory. The **Master Feature Specification** and **vNext** extend that inventory with child builders, specialist workspaces, model governance, workflow/policy pages, and observability surfaces required to fully expose the platform capabilities.

## 4. Screen Index

### Shared Surfaces
- [App Shell](#app-shell) — `global`
- [Topbar & Scope Selector](#topbar---scope-selector) — `global/topbar`
- [Left Rail & Persona Tabs](#left-rail---persona-tabs) — `global/navigation`
- [Right Context Panel](#right-context-panel) — `global/context-panel`
- [Command Palette](#command-palette) — `/search?mode=command`
- [Global Search](#global-search) — `/search`
- [Notification Center](#notification-center) — `global/notifications`
- [Halo Orb & AI Dock](#halo-orb---ai-dock) — `global/ai-dock`
- [Related Modules Rail & Object Peek](#related-modules-rail---object-peek) — `global/object-links`
- [Decision Inbox](#decision-inbox) — `global/decisions`
- [Universal Decision Card](#universal-decision-card) — `contextual`
- [Split View Workspace](#split-view-workspace) — `global/split-view`
- [Unauthorized / Request Access State](#unauthorized---request-access-state) — `confidential`
- [Wall Display Shell](#wall-display-shell) — `/console/wall`
- [Mobile Shell](#mobile-shell) — `/mobile/*`
### Auth & Utility
- [Sign-in](#sign-in) — `/auth/signin`
- [MFA Challenge](#mfa-challenge) — `/auth/mfa`
- [Onboarding Kiosk](#onboarding-kiosk) — `/auth/kiosk`
- [Persona-Adaptive Home](#persona-adaptive-home) — `/home`
- [User Profile & Preferences](#user-profile---preferences) — `/me`
### Operations Live
- [Command Console L1](#command-console-l1) — `/console`
- [Scoped Site / Area / Unit Console](#scoped-site---area---unit-console) — `/console/site/:id · /console/area/:id · /console/unit/:id`
- [Asset Detail Console](#asset-detail-console) — `/console/asset/:id`
- [Diagnostics Workspace](#diagnostics-workspace) — `/console/diagnostics/:id`
- [Executive Portfolio Console](#executive-portfolio-console) — `/console/portfolio`
- [Digital Twin 2D](#digital-twin-2d) — `/twin`
- [Digital Twin 3D](#digital-twin-3d) — `/twin/3d`
- [Twin Replay](#twin-replay) — `/twin/replay`
- [Plume Simulation](#plume-simulation) — `/twin/plume/:id`
- [Live Alarm List](#live-alarm-list) — `/alarms`
- [Alarm Flood Detector](#alarm-flood-detector) — `/alarms/floods`
- [Compound Risk Heatmap](#compound-risk-heatmap) — `/risk`
- [Emergency Declare](#emergency-declare) — `/emergency/declare`
- [Emergency Active Command Surface](#emergency-active-command-surface) — `/emergency/active/:id`
- [Emergency Muster Status](#emergency-muster-status) — `/emergency/muster`
### Work & Workflows
- [Permit Register](#permit-register) — `/permits`
- [Permit Draft](#permit-draft) — `/permits/new`
- [Permit Detail](#permit-detail) — `/permits/:id`
- [Permit Risk Assessment](#permit-risk-assessment) — `/permits/:id/risk-assessment`
- [Permit Conflict Check](#permit-conflict-check) — `/permits/:id/conflict-check`
- [LOTO Board](#loto-board) — `/loto`
- [Zero-Energy Verification](#zero-energy-verification) — `/loto/isolations/:id/verification`
- [Shift Handover Queue](#shift-handover-queue) — `/handover`
- [Incident Register](#incident-register) — `/incidents`
- [RCA Workspace](#rca-workspace) — `/incidents/:id/rca`
- [Predictive Hub](#predictive-hub) — `/predictive`
### Intelligence
- [Camera Fleet](#camera-fleet) — `/vision/cameras`
- [Vision Privacy Controls](#vision-privacy-controls) — `/vision/privacy`
- [OT Connectors](#ot-connectors) — `/ot/connectors`
- [Knowledge Graph Explorer](#knowledge-graph-explorer) — `/knowledge/browse`
- [Copilot Workspace](#copilot-workspace) — `/copilot`
- [AI Kill-Switch](#ai-kill-switch) — `/copilot/agents/kill-switch`
- [Worker Telemetry Detail](#worker-telemetry-detail) — `/iot/telemetry/:id`
### Governance & Platform
- [Safety Passport](#safety-passport) — `/workforce/passport`
- [Compliance Evidence Explorer](#compliance-evidence-explorer) — `/compliance/evidence`
- [Notification Routing Rules](#notification-routing-rules) — `/notifications/rules`
- [Data Lakehouse](#data-lakehouse) — `/data/lakehouse`
- [Workflow Visualizer](#workflow-visualizer) — `/workflows/temporal`
- [Tenant Management](#tenant-management) — `/admin/tenants`
- [Security Audit Log](#security-audit-log) — `/security/audit-log`
- [Marketplace](#marketplace) — `/marketplace`
### Specialist & vNext
- [Zone Geometry Editor](#zone-geometry-editor) — `/vision/cameras/:id/zones`
- [Homography Calibration](#homography-calibration) — `/vision/cameras/:id/calibration`
- [Bias & Fairness Panel](#bias---fairness-panel) — `/vision/cameras/fairness`
- [Union-Transparent Camera Map](#union-transparent-camera-map) — `/vision/cameras/transparency`
- [Tag-to-Entity Resolver](#tag-to-entity-resolver) — `/ot/connectors/:id/resolve`
- [Historian Backfill](#historian-backfill) — `/ot/connectors/:id/backfill`
- [SCADA Simulator](#scada-simulator) — `/ot/connectors/simulator`
- [Ontology Editor](#ontology-editor) — `/knowledge/browse/ontology`
- [Bulk Entity Importer](#bulk-entity-importer) — `/knowledge/browse/import`
- [Risk Pattern Registry & Authoring](#risk-pattern-registry---authoring) — `/risk/patterns · /risk/patterns/new`
- [Risk Shadow Mode Dashboard](#risk-shadow-mode-dashboard) — `/risk/shadow-mode`
- [Permit Library & Analytics](#permit-library---analytics) — `/permits/library · /permits/analytics`
- [Isolation Registry, Guided Sequence & Group Lockout](#isolation-registry--guided-sequence---group-lockout) — `/loto/registry · /loto/isolations/:id/sequence · /loto/groups/:id`
- [Handover Packet & Comprehension Quiz](#handover-packet---comprehension-quiz) — `/handover/:id · /handover/:id/quiz`
- [Incident Report, Timeline & CAPA Workspace](#incident-report--timeline---capa-workspace) — `/incidents/new · /incidents/:id/timeline · /incidents/:id/capa`
- [Model Registry, Contracts, Labeling & EU AI Act Pack](#model-registry--contracts--labeling---eu-ai-act-pack) — `/data/lakehouse/models · /data/lakehouse/contracts · /data/lakehouse/labeling · /data/lakehouse/models/:id/compliance`
- [Policy Editor & Approval Workflow Builder](#policy-editor---approval-workflow-builder) — `/workflows/temporal/policies · /workflows/temporal/approvals`
- [Observability Stack](#observability-stack) — `/observability/slos · /observability/edge · /observability/ai-cost · /status`
- [Auditor Portal & PII Discovery](#auditor-portal---pii-discovery) — `/compliance/auditor · /security/privacy`
- [Site Onboarding Wizard](#site-onboarding-wizard) — `/admin/sites/new`
### Mobile
- [Mobile Field Home](#mobile-field-home) — `/mobile`
- [Mobile Hazard Report](#mobile-hazard-report) — `/mobile/report`
- [Mobile SOS](#mobile-sos) — `/mobile/sos`
- [Mobile Passport](#mobile-passport) — `/mobile/passport`
- [Mobile Sync Queue](#mobile-sync-queue) — `/mobile/sync`

## 5. Screen Specifications


### 1. App Shell

#### Purpose
Defines the persistent SafetyOS frame, workspace scope inheritance, and visual rules applied to all authenticated pages.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `global`
- **Surface Type:** page-shell
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Topbar; left icon rail; collapsible section rail; content viewport; contextual right panel slot; skip link; toast stack; offline banner region.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Scope selector; theme; density; reduced-motion preference.

#### Search
Module jump search via command palette only.

#### Actions
Expand/collapse rail; change scope; open split view; dismiss banner; pin/unpin right panel.

#### Keyboard Shortcuts
Cmd/Ctrl+B toggles rail; Alt+Shift+R toggles right panel; Cmd/Ctrl+\ enters split view.

#### Permissions
All authenticated users; shell features adapt by role and current scope.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Halo Orb anchor point, confidence chip mount point, and AI dock slot are defined here but instantiated by consuming pages.

#### Backend APIs
GET /api/v1/me; GET /api/v1/scopes; GET /api/v1/navigation; GET /api/v1/preferences; PATCH /api/v1/preferences.

#### Events
ui.shell.loaded.v1; ui.scope.changed.v1; ui.layout.mode.changed.v1.

#### Analytics / Telemetry
Track rail collapse rate, scope-switch latency, right-panel open frequency, and split-view adoption.

#### Component IDs
- `shell.topbar`
- `shell.nav.primary`
- `shell.nav.secondary`
- `shell.scope.selector`
- `shell.context.panel`
- `shell.toast.stack`

#### Dependencies / Cross-links
Topbar; Left Rail; Right Context Panel; Notification Center; Split View.


### 2. Topbar & Scope Selector

#### Purpose
Hosts breadcrumbs, persona tabs, workspace scope selector, global search entry, notifications, user menu, and Halo Orb.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `global/topbar`
- **Surface Type:** persistent region
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Breadcrumb pill; persona-adaptive tabs; workspace scope chip chain; quick-create button; notification bell; user avatar menu; Halo Orb trigger.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Scope chips; quick date window when supported by child pages.

#### Search
Incremental object lookup; route lookup; recent items.

#### Actions
Change scope; open notifications; open profile; launch quick create; open AI dock.

#### Keyboard Shortcuts
Alt+1..6 switches persona tabs; S focuses scope selector.

#### Permissions
Tab visibility and quick-create actions vary by role and scoped capabilities.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Topbar can preview AI recommendations relevant to current scope without obscuring primary tasks.

#### Backend APIs
GET /api/v1/navigation/tabs; GET /api/v1/scopes/tree; GET /api/v1/notifications/unread-count.

#### Events
ui.topbar.tab.changed.v1; ui.scope.pill.opened.v1; ui.quickcreate.opened.v1.

#### Analytics / Telemetry
Track scope-switch abandon rate, notification CTR, and tab usage by persona.

#### Component IDs
- `topbar.breadcrumbs`
- `topbar.scope.chain`
- `topbar.tab.ops`
- `topbar.global.search`
- `topbar.notifications`
- `topbar.haloOrb`

#### Dependencies / Cross-links
App Shell; Home; all workspace-scoped pages.


### 3. Left Rail & Persona Tabs

#### Purpose
Provides semantic-band navigation across Operations, Work, Intelligence, Governance, and Platform with persona-aware section lists.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `global/navigation`
- **Surface Type:** persistent region
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Icon rail; section rail; active accent bar; band headers; pin favorite routes; recent routes group.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Favorites; band; recently used.

#### Search
Route title fuzzy search in collapsed mode.

#### Actions
Open route; pin/unpin favorite; collapse/expand; switch band.

#### Keyboard Shortcuts
Alt+[ / Alt+] cycles band groups.

#### Permissions
Modules hidden when capability or scope is unavailable.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI may suggest likely next route based on active workflow or incident context.

#### Backend APIs
GET /api/v1/navigation/modules; POST /api/v1/navigation/favorites.

#### Events
ui.nav.band.changed.v1; ui.nav.favorite.toggled.v1.

#### Analytics / Telemetry
Track depth-to-destination, favorite adoption, and collapsed-mode efficiency.

#### Component IDs
- `nav.iconRail`
- `nav.sectionRail`
- `nav.favorite.list`
- `nav.activeAccent`
- `nav.recent.list`

#### Dependencies / Cross-links
App Shell; Command Palette.


### 4. Right Context Panel

#### Purpose
Houses filters, AI reasoning, related objects, details, and inline decision support without forcing page navigation.

#### Users / Personas
All authenticated personas; content varies by page.

#### Route / Surface Type
- **Route / Surface:** `global/context-panel`
- **Surface Type:** persistent region
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Tabbed panel container; filter groups; evidence cards; related modules list; decision mini-cards; pinned notes.

#### Tables
Compact contextual tables when page defines them.

#### Charts / Visualizations
Mini trend sparkline or confidence gauge when relevant.

#### Filters
Context-specific filters injected by host page.

#### Search
Contextual object search when host page supports it.

#### Actions
Pin/unpin panel; switch tab; pop out into split view.

#### Keyboard Shortcuts
Alt+Shift+1..4 switches context tabs.

#### Permissions
Panel content inherits host page permissions and redacts cross-scope objects.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Preferred location for Why traces, AI evidence bundles, and agent tool traces.

#### Backend APIs
GET host-page contextual endpoints; GET /api/v1/related-modules/:objectId.

#### Events
ui.context.opened.v1; ui.context.tab.changed.v1.

#### Analytics / Telemetry
Measure filter engagement, AI evidence opens, and cross-module jump conversions.

#### Component IDs
- `context.panel`
- `context.tab.filters`
- `context.tab.why`
- `context.tab.related`
- `context.popout`

#### Dependencies / Cross-links
App Shell; Related Modules Rail; Decision Inbox.


### 5. Command Palette

#### Purpose
Keyboard-first command, route, object, and action resolver spanning the entire product.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `/search?mode=command`
- **Surface Type:** modal
- **Layout Family:** ai

#### Layout
AI-first workspace with conversation column, source/evidence panel, tool trace rail, and optional structured result canvas.

#### Visual Hierarchy
Halo Orb presence, streaming typography, reasoning timeline, and confidence treatments make AI feel alive but accountable.

#### Components
Centered command dialog; scoped query tokens; grouped results; recent commands; inline permission explanation; confirm sheet for destructive commands.

#### Tables
Command history list.

#### Charts / Visualizations
none

#### Filters
Scope; module; object type; sensitivity.

#### Search
Primary interaction surface. Supports prefixes like `#` for IDs, `>` for commands, and `!` for AI tasks.

#### Actions
Navigate; execute action; open object in split view; preview permissions; launch AI task.

#### Keyboard Shortcuts
Cmd/Ctrl+K opens; arrows navigate; Enter confirms; Tab autocompletes scope chips.

#### Permissions
Results are filtered by ABAC scope and may omit hidden objects entirely.

#### States
##### Empty States
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Voice-first and bottom-sheet source previews; result cards stack vertically; tool traces compress to timeline chips.

#### Accessibility Notes
Streaming updates announced politely, source links keyboard reachable, and voice controls have text alternatives. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Orb breathing, typing shimmer, and trace reveals are subtle and pause in reduced-motion mode. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Can launch AI copilot threads, summarize an object before navigation, and show “why this result” reasoning.

#### Backend APIs
POST /api/v1/command/resolve; GET /api/v1/search/recent; POST /api/v1/actions/execute-preview.

#### Events
ui.command.opened.v1; ui.command.executed.v1; ui.command.denied.v1.

#### Analytics / Telemetry
Track command latency, command-to-success ratio, and top unresolved intents.

#### Component IDs
- `command.input`
- `command.result.routes`
- `command.result.objects`
- `command.result.actions`
- `command.confirm.sheet`

#### Dependencies / Cross-links
Global Search; Object Peek; Split View.


### 6. Global Search

#### Purpose
Federated search across permits, alarms, incidents, workers, assets, documents, graph entities, and audit evidence.

#### Users / Personas
All authenticated personas with scope-limited results.

#### Route / Surface Type
- **Route / Surface:** `/search`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Search bar; result tabs; facet rail; result cards; evidence snippets; “Why this result?” affordance; save-search action.

#### Tables
Search results table for dense modes, including object type, title, scope, sensitivity, updated-at, and confidence.

#### Charts / Visualizations
Result distribution bar by module; sensitivity breakdown; search latency sparkline.

#### Filters
Module; scope; type; sensitivity; time range; status.

#### Search
Full-text, semantic, and ID-based search across indexed sources.

#### Actions
Open result; save search; export result set; open in split view; inspect why result matched.

#### Keyboard Shortcuts
/ focuses search if no input is active; Cmd/Ctrl+Enter opens top result in split view.

#### Permissions
Sensitive results are masked or hidden based on ABAC, jurisdiction, and legal hold status.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can rewrite queries, summarize result clusters, and explain relevance.

#### Backend APIs
POST /api/v1/search; POST /api/v1/search/explain; POST /api/v1/search/save; GET /api/v1/search/facets.

#### Events
search.query.submitted.v1; search.result.opened.v1; search.saved.v1.

#### Analytics / Telemetry
Track zero-result rate, search-to-open conversion, semantic vs keyword usage, and explanation opens.

#### Component IDs
- `search.input`
- `search.facets.module`
- `search.table.results`
- `search.card.why`
- `search.action.save`

#### Dependencies / Cross-links
Command Palette; Compliance Evidence; Copilot.


### 7. Notification Center

#### Purpose
Aggregates alerts, workflow tasks, escalations, CAPA reminders, and delivery outcomes across modules.

#### Users / Personas
All authenticated personas; content role-specific.

#### Route / Surface Type
- **Route / Surface:** `global/notifications`
- **Surface Type:** sheet
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Bell-triggered sheet; unread groups; escalation ladder; quiet hours controls; acknowledge action; deep links.

#### Tables
Notification log table in “view all” mode with channel, object, severity, recipient outcome, and SLA columns.

#### Charts / Visualizations
Unread by severity donut; delivery failure trend.

#### Filters
Severity; module; status; channel; assignee.

#### Search
Notification subject and object ID search.

#### Actions
Acknowledge; snooze; re-route; open object; mark all read.

#### Keyboard Shortcuts
N marks selected notification read; Shift+N snoozes.

#### Permissions
Only recipients and eligible supervisors can see or act on private notifications.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can bundle related alerts, propose routing changes, and summarize floods.

#### Backend APIs
GET /api/v1/notifications; POST /api/v1/notifications/:id/ack; POST /api/v1/notifications/:id/snooze; GET /api/v1/notifications/routing-preview.

#### Events
notification.delivered.v1; notification.acked.v1; notification.snoozed.v1.

#### Analytics / Telemetry
Track unread age, ack latency, snooze rate, and routing override frequency.

#### Component IDs
- `notify.list`
- `notify.filter.severity`
- `notify.row.ack`
- `notify.escalation.preview`
- `notify.quietHours`

#### Dependencies / Cross-links
Notification Rules; Emergency surfaces.


### 8. Halo Orb & AI Dock

#### Purpose
Persistent AI presence for assistance, reasoning inspection, and context-aware actions.

#### Users / Personas
All authenticated personas; capabilities vary by role and kill-switch state.

#### Route / Surface Type
- **Route / Surface:** `global/ai-dock`
- **Surface Type:** dock
- **Layout Family:** ai

#### Layout
AI-first workspace with conversation column, source/evidence panel, tool trace rail, and optional structured result canvas.

#### Visual Hierarchy
Halo Orb presence, streaming typography, reasoning timeline, and confidence treatments make AI feel alive but accountable.

#### Components
Halo Orb trigger; streaming transcript; confidence chips; reasoning timeline; tool execution list; citations; memory-safe context summary; handoff to full copilot.

#### Tables
Conversation history list.

#### Charts / Visualizations
Confidence trend, tool latency sparkline, and reasoning step timeline.

#### Filters
Conversation scope; source types; confidence threshold.

#### Search
Thread search and citation search.

#### Actions
Ask; interrupt; pin answer; open full Copilot; escalate to Decision Card; copy cited answer.

#### Keyboard Shortcuts
Space starts/stops voice capture when focus is on orb; Cmd/Ctrl+.` opens AI dock.

#### Permissions
Governed by capability tokens, jurisdiction, and AI kill-switch; some actions may be advisory-only.

#### States
##### Empty States
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Voice-first and bottom-sheet source previews; result cards stack vertically; tool traces compress to timeline chips.

#### Accessibility Notes
Streaming updates announced politely, source links keyboard reachable, and voice controls have text alternatives. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Orb breathing, typing shimmer, and trace reveals are subtle and pause in reduced-motion mode. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Primary AI surface. Must show Observed → Retrieved → Reasoned → Called Tool steps and confidence.

#### Backend APIs
POST /api/v1/copilot/threads; POST /api/v1/copilot/respond; GET /api/v1/copilot/threads/:id/tools; POST /api/v1/copilot/interrupt.

#### Events
llm.route.decision.v1; uncertainty.calibrated.v1; decision.escalated.v1.

#### Analytics / Telemetry
Track answer acceptance, citation open rate, intervention rate, and tool-error categories.

#### Component IDs
- `ai.orb`
- `ai.thread.stream`
- `ai.confidence.chip`
- `ai.timeline`
- `ai.tooltrace.list`
- `ai.action.escalate`

#### Dependencies / Cross-links
Copilot; Decision Inbox; AI Kill-Switch.


### 9. Related Modules Rail & Object Peek

#### Purpose
Standardizes cross-module jumps from any object detail, with hover peek summaries and full related-module navigation.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `global/object-links`
- **Surface Type:** popover/rail
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Hover popover; relationship chips; related modules list; open-in-split-view action; pinned object compare.

#### Tables
Mini object attribute table.

#### Charts / Visualizations
Mini relationship graph preview where graph data exists.

#### Filters
Relationship type; status; time range.

#### Search
Object ID and related object search when invoked from dense pages.

#### Actions
Open related object; compare; pin; open neighborhood in graph explorer.

#### Keyboard Shortcuts
O opens peek on focused object; Shift+O pins compare.

#### Permissions
Peek redacts fields unavailable to current role.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize why objects are related and propose likely next module.

#### Backend APIs
GET /api/v1/objects/:id/peek; GET /api/v1/objects/:id/related.

#### Events
ui.object.peek.opened.v1; ui.related.jump.v1.

#### Analytics / Telemetry
Track peek-to-open conversion and related-module effectiveness.

#### Component IDs
- `object.peek.card`
- `object.peek.related`
- `object.peek.compare`
- `object.rail.relatedModules`

#### Dependencies / Cross-links
Knowledge Browse; Permit/Incident/Asset detail pages.


### 10. Decision Inbox

#### Purpose
Queues human-in-the-loop approvals and escalations created by AI, policies, and workflows.

#### Users / Personas
Supervisors, HSE, control room leads, approvers, CISO, designated reviewers.

#### Route / Surface Type
- **Route / Surface:** `global/decisions`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Queue table; priority lanes; SLA chips; evidence preview; approver roster; defer/resign action; bulk triage.

#### Tables
Decision queue table with decision type, object, risk, requester, SLA, confidence, and required sign-off columns.

#### Charts / Visualizations
SLA burn-down chart; decisions by type; confidence distribution.

#### Filters
Priority; workflow type; scope; decision state; sign-off model.

#### Search
Decision ID, object ID, requester, and free text evidence search.

#### Actions
Approve; reject; request more evidence; assign alternate approver; open source object.

#### Keyboard Shortcuts
A approve; R reject; E request evidence; G grabs assignment.

#### Permissions
Visible only to users eligible for the required approval policy. Dual-sign workflows enforce separation of duties.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes rationale and impact summary, but final action remains human-controlled.

#### Backend APIs
GET /api/v1/decisions; POST /api/v1/decisions/:id/approve; POST /api/v1/decisions/:id/reject; POST /api/v1/decisions/:id/request-evidence.

#### Events
decision.escalated.v1; decision.resolved.v1; workflow.awaiting_approval.v1.

#### Analytics / Telemetry
Track queue aging, approval latency, reversals, and evidence-request rates.

#### Component IDs
- `decision.table`
- `decision.row.approve`
- `decision.row.reject`
- `decision.filter.priority`
- `decision.chart.sla`

#### Dependencies / Cross-links
Universal Decision Card; PTW; LOTO; AI Kill-Switch; Workflow approvals.


### 11. Universal Decision Card

#### Purpose
Reusable approval surface for AI recommendations, policy exceptions, emergency triggers, and destructive admin actions.

#### Users / Personas
Approvers and reviewers across all modules.

#### Route / Surface Type
- **Route / Surface:** `contextual`
- **Surface Type:** card/sheet
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Header with object and risk; rationale; evidence list; citations; counterfactual; signer list; action footer; comment box.

#### Tables
Evidence source list only.

#### Charts / Visualizations
Confidence band or threshold gauge when applicable.

#### Filters
none

#### Search
Find evidence snippet within the card.

#### Actions
Approve; reject; defer; request evidence; add note.

#### Keyboard Shortcuts
Y approve; N reject; C comment when card has focus.

#### Permissions
Rendered only when host workflow and reviewer capability allow action.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
Must render confidence, sources, and “what changes if declined” language for explainability.

#### Backend APIs
Host module action endpoints plus POST /api/v1/decisions/:id/* transitions.

#### Events
decision.card.opened.v1; decision.card.action.clicked.v1.

#### Analytics / Telemetry
Track conversion by card origin and time-on-decision.

#### Component IDs
- `decision.card.header`
- `decision.card.evidence`
- `decision.card.counterfactual`
- `decision.card.approve`

#### Dependencies / Cross-links
Decision Inbox; Emergency Declare; Kill-Switch; Workflow Builder.


### 12. Split View Workspace

#### Purpose
Allows any compatible page to open side-by-side with another route for cross-module investigation.

#### Users / Personas
Desktop authenticated users; especially supervisors, HSE, auditors, and engineers.

#### Route / Surface Type
- **Route / Surface:** `global/split-view`
- **Surface Type:** workspace mode
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Primary pane; secondary pane; synchronized scope lock; drag resizer; compare banner; shared command palette context.

#### Tables
Each pane retains its native table surfaces.

#### Charts / Visualizations
Comparison KPIs and diff chips when both panes expose compatible objects.

#### Filters
Linked scope; sync scroll when supported.

#### Search
Pane-local search plus shared global command.

#### Actions
Open current page into other pane; swap; sync/unsync scope; close compare.

#### Keyboard Shortcuts
Cmd/Ctrl+\ toggles split view; Cmd/Ctrl+Shift+Arrow moves focus between panes.

#### Permissions
Second pane cannot reveal data the user cannot access; cross-tenant split is forbidden.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize differences between panes and propose joins.

#### Backend APIs
No unique data API; hosts reuse their native endpoints plus GET /api/v1/layout/split-capabilities.

#### Events
ui.split.opened.v1; ui.split.scope.synced.v1.

#### Analytics / Telemetry
Track compare use cases, pane combinations, and resolution time improvements.

#### Component IDs
- `split.root`
- `split.pane.primary`
- `split.pane.secondary`
- `split.scope.sync`

#### Dependencies / Cross-links
App Shell; Command Palette; Related Modules Rail.


### 13. Unauthorized / Request Access State

#### Purpose
Standard 404-shaped confidential surface for unauthorized routes, with optional request-access affordance where policy allows discovery.

#### Users / Personas
Any user who attempts out-of-scope or forbidden navigation.

#### Route / Surface Type
- **Route / Surface:** `confidential`
- **Surface Type:** state surface
- **Layout Family:** shell

#### Layout
Global application shell with 56px top bar, 64px icon rail, 240px section rail, optional 360px contextual panel, and a 12-column responsive content grid.

#### Visual Hierarchy
Grayscale-first chrome, Halo Blue reserved for active state and AI, generous 4px spacing lattice, Inter Variable for UI, JetBrains Mono for IDs and telemetry.

#### Components
Not-found style hero; safe explanation; request-access CTA; audit note; return-home action.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
none

#### Search
none

#### Actions
Return home; request access; view support article.

#### Keyboard Shortcuts
Esc returns to previous safe route.

#### Permissions
Driven entirely by OPA policy result, capability tokens, and tenant confidentiality settings.

#### States
##### Empty States
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain the frame purpose and next action. Loading uses shell skeletons within 100ms. Errors isolate the failed region while preserving navigation context and show a reference ID. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
On tablet the second rail collapses to sheets; on mobile the shell becomes bottom-tab driven or stacked with full-screen drawers.

#### Accessibility Notes
WCAG 2.2 AA baseline; skip links, visible focus rings, keyboard parity, and reduced-motion support required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
120-200ms fades/slides; hover lift limited to subtle surface lightening; reduced-motion falls back to instant state changes or 120ms fades. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI is absent on strictly confidential denials; optional support suggestion allowed on discoverable pages.

#### Backend APIs
POST /api/v1/access-requests; GET /api/v1/access-policies/explain?route=.

#### Events
ui.unauthorized.rendered.v1; ui.access_request.submitted.v1.

#### Analytics / Telemetry
Track denied route patterns and access-request conversion.

#### Component IDs
- `unauth.hero`
- `unauth.cta.request`
- `unauth.cta.home`

#### Dependencies / Cross-links
App Shell; all gated routes.


### 14. Wall Display Shell

#### Purpose
Chrome-suppressed, high-density wall mode for control rooms and operation centers.

#### Users / Personas
Control room teams, supervisors, incident rooms.

#### Route / Surface Type
- **Route / Surface:** `/console/wall`
- **Surface Type:** page-shell
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
Compact KPI grid; large alarm stream; site status matrix; broadcast-safe clock; no personal controls.

#### Tables
Alarm/event matrix table.

#### Charts / Visualizations
Large-format KPIs, risk matrix, live trend strips, and site tiles.

#### Filters
Scope; time slice; widget pack.

#### Search
none

#### Actions
Change widget pack; acknowledge from paired station only if enabled.

#### Keyboard Shortcuts
W cycles widget packs; F toggles full-screen browser mode.

#### Permissions
Read-only by default; acknowledgment may require paired authenticated console.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI appears only as concise advisory strips and explainability QR links to paired devices.

#### Backend APIs
GET /api/v1/console/wall; GET /api/v1/alarms/live; GET /api/v1/risk/summary.

#### Events
ui.wall.loaded.v1; ui.wall.pack.changed.v1.

#### Analytics / Telemetry
Track uptime, pack usage, and alarm readability from large-format mode.

#### Component IDs
- `wall.grid`
- `wall.kpi.sif`
- `wall.alert.stream`
- `wall.pack.switcher`

#### Dependencies / Cross-links
Command Console; Alarm surfaces; Risk Heatmap.


### 15. Mobile Shell

#### Purpose
Provides field-safe navigation, offline queue visibility, SOS affordance, and scanning/voice entry points for all mobile routes.

#### Users / Personas
Field operators, contractors, supervisors in the field.

#### Route / Surface Type
- **Route / Surface:** `/mobile/*`
- **Surface Type:** page-shell
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Bottom nav; safe-area header; offline banner; sync badge; floating SOS; scan action; voice action.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Offline state; assignment state.

#### Search
Route-local search only.

#### Actions
Open scan; open voice; view sync; trigger SOS entry.

#### Keyboard Shortcuts
Long-press home opens voice shortcuts.

#### Permissions
Capabilities depend on device enrollment, certification, and current offline policy.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI appears as voice helper and contextual suggestions only.

#### Backend APIs
GET /api/v1/mobile/bootstrap; GET /api/v1/mobile/sync/status.

#### Events
mobile.shell.loaded.v1; mobile.sync.badge.viewed.v1.

#### Analytics / Telemetry
Track offline duration, scan usage, and SOS discoverability.

#### Component IDs
- `mobile.nav`
- `mobile.banner.offline`
- `mobile.fab.sos`
- `mobile.action.scan`

#### Dependencies / Cross-links
Mobile routes; Safety Passport; Mobile Sync Queue.


### 16. Sign-in

#### Purpose
Primary authentication screen for SafetyOS users, including enterprise SSO and local fallback where permitted.

#### Users / Personas
Employees, contractors with supported credentials, admins.

#### Route / Surface Type
- **Route / Surface:** `/auth/signin`
- **Surface Type:** page
- **Layout Family:** auth

#### Layout
Centered auth card on `layout.auth` with minimal chrome, legal footer, and optional contextual illustration panel on wide screens.

#### Visual Hierarchy
Premium, calm, near-monochrome surfaces with strong type hierarchy and subtle animated gradients only on non-critical zones.

#### Components
Brand header; email/username field; password or SSO buttons; legal notice; device trust checkbox; support link.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Tenant domain where multi-tenant login is used.

#### Search
none

#### Actions
Sign in; continue with SSO; recover password; switch tenant.

#### Keyboard Shortcuts
Enter submits; Alt+S activates selected SSO provider.

#### Permissions
Unauthenticated only; tenant discovery may precede identity provider routing.

#### States
##### Empty States
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Single-column card, 44px+ targets, virtual keyboard safe areas, and bottom-sheet recovery flows.

#### Accessibility Notes
Password managers, MFA autofill, language expansion, and screen-reader labels are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Card transitions use 160ms fade/scale. Respect reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI absent except optional support article recommendation.

#### Backend APIs
POST /api/v1/auth/signin; POST /api/v1/auth/sso/start; POST /api/v1/auth/recover.

#### Events
auth.signin.submitted.v1; auth.signin.failed.v1; auth.sso.started.v1.

#### Analytics / Telemetry
Track auth conversion, SSO provider use, and recover-flow starts.

#### Component IDs
- `auth.signin.form`
- `auth.signin.email`
- `auth.signin.password`
- `auth.signin.sso`

#### Dependencies / Cross-links
MFA; User Profile.


### 17. MFA Challenge

#### Purpose
Second-factor verification surface supporting TOTP, push, and recovery methods.

#### Users / Personas
Users completing step-up authentication.

#### Route / Surface Type
- **Route / Surface:** `/auth/mfa`
- **Surface Type:** page
- **Layout Family:** auth

#### Layout
Centered auth card on `layout.auth` with minimal chrome, legal footer, and optional contextual illustration panel on wide screens.

#### Visual Hierarchy
Premium, calm, near-monochrome surfaces with strong type hierarchy and subtle animated gradients only on non-critical zones.

#### Components
Challenge selector; code input; push status; device alias; recovery link; timer.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Method type only.

#### Search
none

#### Actions
Verify code; resend; use backup method.

#### Keyboard Shortcuts
Enter verifies; R resends when enabled.

#### Permissions
Shown only after valid primary auth or step-up challenge.

#### States
##### Empty States
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Single-column card, 44px+ targets, virtual keyboard safe areas, and bottom-sheet recovery flows.

#### Accessibility Notes
Password managers, MFA autofill, language expansion, and screen-reader labels are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Card transitions use 160ms fade/scale. Respect reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI absent.

#### Backend APIs
POST /api/v1/auth/mfa/verify; POST /api/v1/auth/mfa/resend; POST /api/v1/auth/mfa/recovery.

#### Events
auth.mfa.verified.v1; auth.mfa.failed.v1.

#### Analytics / Telemetry
Track method success rate and resend frequency.

#### Component IDs
- `auth.mfa.form`
- `auth.mfa.code`
- `auth.mfa.method.switch`

#### Dependencies / Cross-links
Sign-in.


### 18. Onboarding Kiosk

#### Purpose
Field onboarding and contractor check-in flow for shared devices and controlled kiosk stations.

#### Users / Personas
Contractors, visitors, induction staff.

#### Route / Surface Type
- **Route / Surface:** `/auth/kiosk`
- **Surface Type:** page
- **Layout Family:** auth

#### Layout
Centered auth card on `layout.auth` with minimal chrome, legal footer, and optional contextual illustration panel on wide screens.

#### Visual Hierarchy
Premium, calm, near-monochrome surfaces with strong type hierarchy and subtle animated gradients only on non-critical zones.

#### Components
Badge/QR scan; identity capture; orientation progress; certification checks; language selector; device claim strip.

#### Tables
Roster lookup table for staffed kiosk mode.

#### Charts / Visualizations
Onboarding progress ring.

#### Filters
Company; shift; language.

#### Search
Badge ID, worker ID, passport number.

#### Actions
Begin check-in; verify identity; continue orientation; print/issue badge.

#### Keyboard Shortcuts
F8 toggles staffed-search mode on kiosk admin devices.

#### Permissions
Requires signed device claim; contractor self-service restricted by policy.

#### States
##### Empty States
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty is not applicable. Loading uses inline button progress and card skeletons. Errors are inline, precise, and never clear validated fields. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Single-column card, 44px+ targets, virtual keyboard safe areas, and bottom-sheet recovery flows.

#### Accessibility Notes
Password managers, MFA autofill, language expansion, and screen-reader labels are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Card transitions use 160ms fade/scale. Respect reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI may summarize missing prerequisites and recommend orientation content.

#### Backend APIs
POST /api/v1/kiosk/checkin; GET /api/v1/workforce/passport/:id; POST /api/v1/kiosk/badge/issue.

#### Events
kiosk.checkin.started.v1; kiosk.orientation.completed.v1.

#### Analytics / Telemetry
Track queue time, incomplete onboarding causes, and badge issuance time.

#### Component IDs
- `kiosk.scan`
- `kiosk.identity.card`
- `kiosk.progress`
- `kiosk.badge.issue`

#### Dependencies / Cross-links
Safety Passport; Mobile Passport.


### 19. Persona-Adaptive Home

#### Purpose
Personalized landing page showing the most relevant work, risks, insights, and shortcuts for the current persona and scope.

#### Users / Personas
All authenticated personas.

#### Route / Surface Type
- **Route / Surface:** `/home`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Welcome block; today strip; assigned tasks; live alerts; KPI cards; quick links; recently visited; AI briefing card.

#### Tables
Task list table where dense mode is enabled.

#### Charts / Visualizations
Role-specific KPI tiles, mini trends, readiness gauges, and open-work summaries.

#### Filters
Time window; site scope; task ownership.

#### Search
Search recent objects and quick destinations.

#### Actions
Open assigned work; resume draft; acknowledge alert; switch scope; pin widget.

#### Keyboard Shortcuts
1..9 activates home widgets; H returns to home.

#### Permissions
Widgets and datasets vary by persona and scope.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI briefing summarizes shifts, risks, expiring permits, or open CAPA relevant to the user.

#### Backend APIs
GET /api/v1/home; GET /api/v1/tasks/my; GET /api/v1/alerts/relevant; GET /api/v1/home/briefing.

#### Events
home.loaded.v1; home.widget.opened.v1; home.briefing.accepted.v1.

#### Analytics / Telemetry
Track widget engagement, task completion from home, and briefing usefulness.

#### Component IDs
- `home.hero`
- `home.tasks.list`
- `home.kpi.openPermits`
- `home.ai.briefing`

#### Dependencies / Cross-links
Topbar; Notification Center; all task routes.


### 20. User Profile & Preferences

#### Purpose
Self-service profile, sessions, notification preferences, appearance, and trusted-device management.

#### Users / Personas
All authenticated users for self only.

#### Route / Surface Type
- **Route / Surface:** `/me`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Profile card; preference sections; active sessions list; notification channels; accessibility settings; API token or device trust section if allowed.

#### Tables
Sessions table; notification destinations table.

#### Charts / Visualizations
none

#### Filters
Theme; language; notification channel type.

#### Search
Preference field search.

#### Actions
Edit profile; revoke session; change preferences; enroll device.

#### Keyboard Shortcuts
Cmd/Ctrl+S saves edited profile sections.

#### Permissions
Self only; some sections require recent re-authentication.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI may explain a setting’s impact but cannot change security-critical settings automatically.

#### Backend APIs
GET /api/v1/me; PATCH /api/v1/me; GET /api/v1/me/sessions; DELETE /api/v1/me/sessions/:id; PATCH /api/v1/me/preferences.

#### Events
profile.updated.v1; profile.session.revoked.v1.

#### Analytics / Telemetry
Track preference changes, session revocations, and accessibility option adoption.

#### Component IDs
- `me.profile.card`
- `me.pref.notifications`
- `me.sessions.table`
- `me.accessibility.reducedMotion`

#### Dependencies / Cross-links
Sign-in; Notification Center.


### 21. Command Console L1

#### Purpose
Plant-wide live operations command center surfacing safety posture, active work, critical alarms, and high-level unit health.

#### Users / Personas
Control room operators, supervisors, HSE, plant head.

#### Route / Surface Type
- **Route / Surface:** `/console`
- **Surface Type:** page
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
KPI hero strip; active alarm lane; compound risk stream; permit summary; unit status matrix; explainability panel trigger.

#### Tables
Live event table with alarm, permit, and unit-state rows.

#### Charts / Visualizations
KPI counters; unit health tiles; risk matrix; short horizon trend strips.

#### Filters
Scope; unit mode; severity; time slice.

#### Search
Asset, alarm, permit, and event ID search.

#### Actions
Acknowledge alarm; open unit; declare emergency; open split view; pin widget.

#### Keyboard Shortcuts
Shift+1 opens active alarms; Shift+2 opens live risk feed.

#### Permissions
Full control room permissions for ack/escalation; executives typically read-only.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes top deviations and recommended drill-down path, with confidence and citations.

#### Backend APIs
GET /api/v1/console/l1; GET /api/v1/alarms/live; GET /api/v1/risk/live; GET /api/v1/permits/summary.

#### Events
console.l1.loaded.v1; alarm.ack.clicked.v1; risk.drilldown.clicked.v1.

#### Analytics / Telemetry
Track mean time to detect, tile drill-down rate, and ack latency from L1.

#### Component IDs
- `console.l1.kpi.sif`
- `console.l1.tile.units`
- `console.l1.feed.alarms`
- `console.l1.feed.risk`

#### Dependencies / Cross-links
Wall Display Shell; Site/Area/Unit Console; Emergency Declare.


### 22. Scoped Site / Area / Unit Console

#### Purpose
Role-adaptive console family that narrows the live view from site to area to unit, preserving the L1→L4 operational drill path.

#### Users / Personas
Control room operators, supervisors, HSE, plant head.

#### Route / Surface Type
- **Route / Surface:** `/console/site/:id · /console/area/:id · /console/unit/:id`
- **Surface Type:** page family
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
Scoped header; KPI strip; event timeline; unit/asset topology view; permit overlays; right explainability rail.

#### Tables
Live operations table with alarms, running permits, isolation states, and crew presence.

#### Charts / Visualizations
Trend charts, active work heatmap, risk matrix, permit load by zone, and degradation indicators.

#### Filters
Time slice; alarm priority; permit status; crew status; equipment class.

#### Search
Search scoped alarms, assets, permits, and workers.

#### Actions
Acknowledge; shelve if policy allows; open asset detail; open digital twin at matching scope; escalate to emergency.

#### Keyboard Shortcuts
Shift+U opens unit topology; Shift+P opens active permits.

#### Permissions
Action permissions depend on current scope and role; shelving and overrides require additional capability.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can explain why a unit is degraded, surface contributing signals, and propose next best investigation pane.

#### Backend APIs
GET /api/v1/console/scoped?scope=; GET /api/v1/units/:id/topology; GET /api/v1/work/active?scope=.

#### Events
console.scoped.loaded.v1; console.scope.drilled.v1.

#### Analytics / Telemetry
Track drill-down progression, scope retention, and console-to-action conversion.

#### Component IDs
- `console.scoped.header`
- `console.scoped.timeline`
- `console.scoped.topology`
- `console.scoped.why`

#### Dependencies / Cross-links
Command Console L1; Asset Detail; Digital Twin.


### 23. Asset Detail Console

#### Purpose
Equipment-level operational surface showing live telemetry, current work constraints, isolation status, alarms, and evidence.

#### Users / Personas
Operators, supervisors, engineers, HSE, auditors (read-only).

#### Route / Surface Type
- **Route / Surface:** `/console/asset/:id`
- **Surface Type:** page
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
Asset hero; telemetry cards; current alarms; active permits; maintenance state; related modules rail; evidence panel.

#### Tables
Alarm history table; active permit table; recent interventions log.

#### Charts / Visualizations
Sparkline telemetry trends; state timeline; anomaly markers.

#### Filters
Time range; signal group; alarm state; work constraint type.

#### Search
Signal name, alarm ID, permit ID, work order search.

#### Actions
Open diagnostics; open twin focus; link to manual; acknowledge/shelve where allowed.

#### Keyboard Shortcuts
D opens diagnostics; T opens twin focus.

#### Permissions
Read access broad within scope; actuation-adjacent controls remain hidden if capability token forbids them.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize condition, predicted degradation, and permit conflicts tied to the asset.

#### Backend APIs
GET /api/v1/assets/:id; GET /api/v1/assets/:id/telemetry; GET /api/v1/assets/:id/alarms; GET /api/v1/assets/:id/work-context.

#### Events
asset.detail.loaded.v1; asset.telemetry.range.changed.v1.

#### Analytics / Telemetry
Track asset investigation time, diagnostics open rate, and cross-module jumps.

#### Component IDs
- `asset.detail.hero`
- `asset.detail.telemetry`
- `asset.detail.alarms`
- `asset.detail.permits`

#### Dependencies / Cross-links
Diagnostics; Knowledge Browse; Digital Twin.


### 24. Diagnostics Workspace

#### Purpose
L4 diagnostic workspace for root-cause investigation, signal correlation, and maintenance-oriented deep dives.

#### Users / Personas
Technical-role engineers, reliability specialists, advanced supervisors.

#### Route / Surface Type
- **Route / Surface:** `/console/diagnostics/:id`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Multi-signal chart stack; event correlation lane; asset metadata; notebook-like notes; compare-baseline toggle.

#### Tables
Signal/event correlation table; hypothesis notes table.

#### Charts / Visualizations
Overlay trends, anomaly chart, correlation heatmap, event scatterplot.

#### Filters
Time range; sensor family; anomaly class; baseline run.

#### Search
Signal, event, and diagnostic note search.

#### Actions
Compare runs; annotate; export evidence bundle; open incident RCA.

#### Keyboard Shortcuts
C toggles compare baseline; A adds annotation.

#### Permissions
Requires technical-role attribute or delegated access.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests correlated variables, likely failure modes, and links to similar incidents.

#### Backend APIs
GET /api/v1/diagnostics/:id; POST /api/v1/diagnostics/:id/annotations; GET /api/v1/diagnostics/:id/similar-incidents.

#### Events
diagnostics.loaded.v1; diagnostics.annotation.created.v1.

#### Analytics / Telemetry
Track chart-stack use, AI hypothesis acceptance, and export frequency.

#### Component IDs
- `diagnostics.chartstack`
- `diagnostics.correlation.heatmap`
- `diagnostics.table.events`
- `diagnostics.note.add`

#### Dependencies / Cross-links
Asset Detail; Incident RCA; Predictive Hub.


### 25. Executive Portfolio Console

#### Purpose
Cross-site executive rollup for safety, reliability, compliance, and AI impact across the enterprise portfolio.

#### Users / Personas
Plant heads, regional leadership, HSE leadership, CISO.

#### Route / Surface Type
- **Route / Surface:** `/console/portfolio`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Portfolio KPI hero; site comparison cards; compliance posture summary; SIF exposure trend; notable incidents panel.

#### Tables
Site comparison table with safety score, open CAPA, active emergencies, and SLA columns.

#### Charts / Visualizations
Site ranking bar chart; SIF exposure line; compliance heatmap; AI efficiency summary.

#### Filters
Portfolio; region; time range; site cohort.

#### Search
Search sites, incidents, and reports.

#### Actions
Open site console; export board pack; subscribe to summary; compare cohort.

#### Keyboard Shortcuts
E exports board pack; Shift+C opens cohort compare.

#### Permissions
Executive and approved governance roles only.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI creates executive briefings, risk narratives, and recommended board questions with citations.

#### Backend APIs
GET /api/v1/portfolio; GET /api/v1/portfolio/sites; GET /api/v1/portfolio/briefing.

#### Events
portfolio.loaded.v1; portfolio.exported.v1.

#### Analytics / Telemetry
Track briefing usage, site-compare depth, and board-pack exports.

#### Component IDs
- `portfolio.kpi.sif`
- `portfolio.table.sites`
- `portfolio.chart.compliance`
- `portfolio.ai.briefing`

#### Dependencies / Cross-links
Home; Predictive Hub; Compliance Dashboard.


### 26. Digital Twin 2D

#### Purpose
Primary geospatial workspace for plant map overlays, worker positions, equipment status, risk layers, and route-based incident awareness.

#### Users / Personas
Operators, supervisors, HSE, emergency responders.

#### Route / Surface Type
- **Route / Surface:** `/twin`
- **Surface Type:** page
- **Layout Family:** geospatial

#### Layout
`layout.geospatial` with full-bleed 2D/3D canvas, floating layer controls, bottom timeline/scrubber, and anchored detail cards.

#### Visual Hierarchy
Cinematic but functional twin surfaces with matte materials, luminous overlays, restrained bloom, and premium environmental depth.

#### Components
2D map canvas; layer rail; object detail cards; camera locations; permit overlays; risk legend; time status strip.

#### Tables
Layer legend table; selected-object attribute table.

#### Charts / Visualizations
Heatmaps, live marker layers, path traces, hazard polygons.

#### Filters
Layer visibility; time; worker cohort; permit type; hazard class.

#### Search
Asset, worker, permit, and camera search.

#### Actions
Pan/zoom; select object; focus on alert; open 3D; start replay.

#### Keyboard Shortcuts
L toggles layer list; R starts replay from current time range.

#### Permissions
Operational roles within scope; some worker detail masked by privacy policy.

#### States
##### Empty States
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Uses simplified 2D mode, larger layer toggles, and short-session task flows; 3D falls back on unsupported devices.

#### Accessibility Notes
Alternative list/table views for spatial entities, keyboard layer toggles, and high-contrast hazard rendering are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Camera moves are eased and brief; worker/path playback uses smooth interpolation unless reduced motion is enabled. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes probable risk clusters, explains overlay combinations, and suggests next layer set.

#### Backend APIs
GET /api/v1/twin/map; GET /api/v1/twin/layers; GET /api/v1/twin/objects/:id.

#### Events
twin.layer.toggled.v1; twin.object.selected.v1.

#### Analytics / Telemetry
Track layer combinations, object selection depth, and 2D→3D transitions.

#### Component IDs
- `twin2d.canvas`
- `twin2d.layers`
- `twin2d.card.object`
- `twin2d.legend.risk`

#### Dependencies / Cross-links
Digital Twin 3D; Replay; Plume Simulation.


### 27. Digital Twin 3D

#### Purpose
3D spatial visualization for assets, routes, pipelines, incident hotspots, and cinematic-but-functional operational context.

#### Users / Personas
Operators, supervisors, HSE, emergency response, demo/executive audiences.

#### Route / Surface Type
- **Route / Surface:** `/twin/3d`
- **Surface Type:** page
- **Layout Family:** geospatial

#### Layout
`layout.geospatial` with full-bleed 2D/3D canvas, floating layer controls, bottom timeline/scrubber, and anchored detail cards.

#### Visual Hierarchy
Cinematic but functional twin surfaces with matte materials, luminous overlays, restrained bloom, and premium environmental depth.

#### Components
3D scene; camera bookmarks; anchored equipment cards; layer toggles; lighting presets; path playback controls.

#### Tables
Selected-object attribute table only.

#### Charts / Visualizations
3D overlay layers, plume volume preview, risk bloom markers, movement traces.

#### Filters
Scene layer; time; bookmark; worker cohort; severity.

#### Search
Object and bookmark search.

#### Actions
Orbit/fly-to; isolate layer; open object detail; open plume simulation; export still.

#### Keyboard Shortcuts
1..5 switches camera bookmarks; G toggles ground grid.

#### Permissions
3D may be disabled by device capability or policy; fallback to 2D required.

#### States
##### Empty States
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Uses simplified 2D mode, larger layer toggles, and short-session task flows; 3D falls back on unsupported devices.

#### Accessibility Notes
Alternative list/table views for spatial entities, keyboard layer toggles, and high-contrast hazard rendering are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Camera moves are eased and brief; worker/path playback uses smooth interpolation unless reduced motion is enabled. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can narrate scene changes, generate guided camera tours, and explain hot zones.

#### Backend APIs
GET /api/v1/twin/scene3d; GET /api/v1/twin/bookmarks; GET /api/v1/twin/objects/:id.

#### Events
twin3d.loaded.v1; twin3d.bookmark.used.v1.

#### Analytics / Telemetry
Track 3D session length, performance degradation, and object-inspection rate.

#### Component IDs
- `twin3d.scene`
- `twin3d.bookmarks`
- `twin3d.card.asset`
- `twin3d.layer.risk`

#### Dependencies / Cross-links
Digital Twin 2D; Replay; Plume Simulation.


### 28. Twin Replay

#### Purpose
Historical or incident-focused time-scrub playback of plant state, personnel movement, alarms, and equipment telemetry.

#### Users / Personas
Safety officers, investigators, supervisors, HSE.

#### Route / Surface Type
- **Route / Surface:** `/twin/replay`
- **Surface Type:** page
- **Layout Family:** geospatial

#### Layout
`layout.geospatial` with full-bleed 2D/3D canvas, floating layer controls, bottom timeline/scrubber, and anchored detail cards.

#### Visual Hierarchy
Cinematic but functional twin surfaces with matte materials, luminous overlays, restrained bloom, and premium environmental depth.

#### Components
Replay timeline; play controls; synchronized map/scene; event bookmarks; evidence sidebar; compare-current toggle.

#### Tables
Event bookmark table; selected-time object table.

#### Charts / Visualizations
Playback timeline; path traces; state bands; synchronized trend overlays.

#### Filters
Time window; event class; layer set; compare mode.

#### Search
Search bookmark, incident ID, worker ID, asset ID.

#### Actions
Play; pause; scrub; jump to event; export clip/evidence; open RCA.

#### Keyboard Shortcuts
Space play/pause; J/L jump backward/forward.

#### Permissions
Historical data access may be governed by retention and privacy rules.

#### States
##### Empty States
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Uses simplified 2D mode, larger layer toggles, and short-session task flows; 3D falls back on unsupported devices.

#### Accessibility Notes
Alternative list/table views for spatial entities, keyboard layer toggles, and high-contrast hazard rendering are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Camera moves are eased and brief; worker/path playback uses smooth interpolation unless reduced motion is enabled. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can auto-summarize the replay, surface turning points, and generate incident timelines.

#### Backend APIs
GET /api/v1/twin/replay; GET /api/v1/twin/replay/bookmarks; POST /api/v1/twin/replay/export.

#### Events
twin.replay.loaded.v1; twin.replay.bookmark.opened.v1.

#### Analytics / Telemetry
Track replay duration, export usage, and RCA handoff rate.

#### Component IDs
- `twin.replay.timeline`
- `twin.replay.bookmarks`
- `twin.replay.export`

#### Dependencies / Cross-links
Digital Twin 2D; Incident Timeline; RCA Workspace.


### 29. Plume Simulation

#### Purpose
Specialized geospatial simulation for gas dispersion, smoke, fire radiation, or blast scenarios with uncertainty overlays.

#### Users / Personas
HSE, emergency responders, plant leadership.

#### Route / Surface Type
- **Route / Surface:** `/twin/plume/:id`
- **Surface Type:** page
- **Layout Family:** geospatial

#### Layout
`layout.geospatial` with full-bleed 2D/3D canvas, floating layer controls, bottom timeline/scrubber, and anchored detail cards.

#### Visual Hierarchy
Cinematic but functional twin surfaces with matte materials, luminous overlays, restrained bloom, and premium environmental depth.

#### Components
Simulation canvas; scenario inputs; uncertainty legend; affected-zone list; evacuation overlay; timeline slider.

#### Tables
Affected assets/personnel table.

#### Charts / Visualizations
Plume volume, isocontours, wind trend, uncertainty band chart.

#### Filters
Scenario; wind model; threshold; time step.

#### Search
Asset, zone, and worker search inside affected set.

#### Actions
Run scenario; compare scenario; publish to emergency command; export image/report.

#### Keyboard Shortcuts
P toggles plume playback; U toggles uncertainty view.

#### Permissions
Restricted to safety/emergency roles; published scenarios are audited.

#### States
##### Empty States
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty states explain missing site model or permissions. Loading uses tile placeholders and progressive scene hydration. Errors isolate failed layers and expose fallback 2D view. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Uses simplified 2D mode, larger layer toggles, and short-session task flows; 3D falls back on unsupported devices.

#### Accessibility Notes
Alternative list/table views for spatial entities, keyboard layer toggles, and high-contrast hazard rendering are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Camera moves are eased and brief; worker/path playback uses smooth interpolation unless reduced motion is enabled. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI explains main assumptions, confidence intervals, and recommended protective actions.

#### Backend APIs
GET /api/v1/plume/:id; POST /api/v1/plume/:id/run; POST /api/v1/plume/:id/publish.

#### Events
plume.run.started.v1; plume.published.v1.

#### Analytics / Telemetry
Track scenario run time, compare usage, and command-post publish rate.

#### Component IDs
- `plume.canvas`
- `plume.inputs`
- `plume.table.affected`
- `plume.action.publish`

#### Dependencies / Cross-links
Digital Twin; Emergency Active Command Surface.


### 30. Live Alarm List

#### Purpose
ISA-18.2 compliant prioritized alarm list with acknowledgment, shelving, suppression indicators, and causal context.

#### Users / Personas
Control room operators, supervisors, HSE.

#### Route / Surface Type
- **Route / Surface:** `/alarms`
- **Surface Type:** page
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
Alarm table; priority summary; flood indicator; causal context drawer; shelving timer; unit mode badge.

#### Tables
Primary table with priority, state, source, message, duration, ack, shelve, and unit mode columns.

#### Charts / Visualizations
Alarm rate trend; priority distribution; top-chattering sources.

#### Filters
Priority; ack state; source unit; class; shelving status; unit mode.

#### Search
Alarm ID, tag, asset, message search.

#### Actions
Acknowledge; shelve; open asset; open cause trace; open flood detector.

#### Keyboard Shortcuts
A acknowledge; S shelve; Enter opens selected alarm detail.

#### Permissions
Ack/shelve capabilities are role- and state-dependent; some alarms require dual confirmation.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI explains likely cause chains and recommended operator checks; always inspectable via Why panel.

#### Backend APIs
GET /api/v1/alarms; POST /api/v1/alarms/:id/ack; POST /api/v1/alarms/:id/shelve; GET /api/v1/alarms/:id/explain.

#### Events
alarm.acked.v1; alarm.shelved.v1; alarm.opened.v1.

#### Analytics / Telemetry
Track ack latency, shelve misuse, flood transitions, and explanation opens.

#### Component IDs
- `alarms.table`
- `alarms.row.ack`
- `alarms.row.shelve`
- `alarms.drawer.why`

#### Dependencies / Cross-links
Alarm Flood Detector; Asset Detail; Scoped Consoles.


### 31. Alarm Flood Detector

#### Purpose
Monitors alarm density, chatter, nuisance sources, and flood conditions to protect operator cognition.

#### Users / Personas
Control room operators, alarm analysts, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/alarms/floods`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Flood KPI strip; chatter table; causal cluster list; recommended suppression proposals.

#### Tables
Chatter source table; alarm cluster table.

#### Charts / Visualizations
Alarm rate line chart; Pareto chart of sources; flood episode timeline.

#### Filters
Time range; unit; priority; chatter threshold.

#### Search
Alarm source and episode search.

#### Actions
Open flood episode; open source alarm; preview rationalization actions.

#### Keyboard Shortcuts
F toggles episode focus mode.

#### Permissions
Analyst features may require technical or alarm-admin capability.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI clusters nuisance patterns and proposes rationalization candidates with confidence.

#### Backend APIs
GET /api/v1/alarms/floods; GET /api/v1/alarms/chatter; POST /api/v1/alarms/rationalization-preview.

#### Events
alarm.flood.detected.v1; alarm.flood.episode.opened.v1.

#### Analytics / Telemetry
Track flood frequency, nuisance reduction, and proposal acceptance.

#### Component IDs
- `flood.kpi.rate`
- `flood.table.sources`
- `flood.timeline.episodes`

#### Dependencies / Cross-links
Live Alarm List; Workflow Policy Editor.


### 32. Compound Risk Heatmap

#### Purpose
Real-time cross-signal risk surface combining CV, OT, permits, telemetry, and context into live risk scores per zone.

#### Users / Personas
Supervisors, control room, HSE, plant head.

#### Route / Surface Type
- **Route / Surface:** `/risk`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Heatmap canvas or matrix; live feed; pattern chips; explainability panel; recommended interventions; shadow-mode toggle.

#### Tables
Risk feed table with zone, pattern, score, confidence, evidence count, and lead-time columns.

#### Charts / Visualizations
Zone heatmap; score timeline; pattern distribution; confidence distribution.

#### Filters
Scope; score threshold; pattern family; confidence band; time range.

#### Search
Zone, pattern, permit, and asset search.

#### Actions
Open zone; suppress if policy allows; create CAPA/incident; open pattern registry.

#### Keyboard Shortcuts
R focuses risk feed; W toggles Why panel.

#### Permissions
Suppression and publish actions governed by policy and capability tokens.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI is central: must show evidence, counterfactuals, uncertainty, and recommended mitigation steps.

#### Backend APIs
GET /api/v1/risk/live; GET /api/v1/risk/patterns; GET /api/v1/risk/:id/explain.

#### Events
CompoundRisk.v2; risk.suppressed.v1; risk.opened.v1.

#### Analytics / Telemetry
Track early-warning lead time, action-from-risk rate, and explanation trust signals.

#### Component IDs
- `risk.heatmap`
- `risk.feed.table`
- `risk.panel.why`
- `risk.pattern.chips`

#### Dependencies / Cross-links
Pattern Registry; Shadow Mode; Emergency Declare.


### 33. Emergency Declare

#### Purpose
Controlled declaration flow for incidents and emergency states with dual-sign confirmation, scenario typing, and immediate orchestration preview.

#### Users / Personas
Supervisors, control room, HSE.

#### Route / Surface Type
- **Route / Surface:** `/emergency/declare`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Emergency type form; impact scope map; approver panel; orchestration preview; declaration checklist; confirm footer.

#### Tables
Checklist item table; impacted zone table.

#### Charts / Visualizations
Impact map preview; readiness indicators.

#### Filters
Emergency type; impacted area; severity.

#### Search
Search affected zone, muster point, and responder group.

#### Actions
Draft declaration; request co-sign; declare; cancel; convert from risk candidate.

#### Keyboard Shortcuts
Shift+D starts declaration from selected risk.

#### Permissions
Dual confirmation enforced for high-severity scenarios; policy may allow single sign for drills.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can prefill scenario from `emergency.trigger.candidate.v1`, explain evidence, and forecast likely impact.

#### Backend APIs
POST /api/v1/emergency/declarations/draft; POST /api/v1/emergency/declarations/:id/confirm; GET /api/v1/emergency/candidates/:id.

#### Events
emergency.trigger.candidate.v1; emergency.declared.v1.

#### Analytics / Telemetry
Track declaration time, co-sign latency, and false-positive rates.

#### Component IDs
- `emergency.form.type`
- `emergency.map.impact`
- `emergency.approver.card`
- `emergency.action.declare`

#### Dependencies / Cross-links
Decision Card; Active Command Surface; Muster.


### 34. Emergency Active Command Surface

#### Purpose
First-10-minute command post combining live twin, responder coordination, playbook progress, notifications, and missing-person tracking.

#### Users / Personas
Control room, HSE, emergency commanders, plant head (read-only).

#### Route / Surface Type
- **Route / Surface:** `/emergency/active/:id`
- **Surface Type:** page
- **Layout Family:** console

#### Layout
`layout.command` with KPI header strip, live event column, core visualization canvas, and optional right explainability rail.

#### Visual Hierarchy
ISA-101 influenced command density with grayscale-first surfaces; deviations only use intent colors; numeric rhythm uses tabular figures.

#### Components
Incident header; playbook lanes; live twin pane; responder list; message log; task board; external agency panel.

#### Tables
Playbook step table; responder table; missing-person table; message log.

#### Charts / Visualizations
Muster completion ring; plume or hazard chart; resource availability bars.

#### Filters
Task owner; responder status; zone; playbook phase.

#### Search
Search person, responder team, task, asset.

#### Actions
Advance playbook step; send broadcast; assign responder; mark person located; open plume.

#### Keyboard Shortcuts
P advances selected playbook step; M focuses missing-person list.

#### Permissions
Emergency roles only for control actions; observers read-only.

#### States
##### Empty States
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty shows scope mismatch or data-unavailable messaging. Loading uses skeleton KPIs and chart placeholders. Errors preserve last-known-good timestamps and degraded-mode banners. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Desktop-first. Tablet supports priority widgets only. Mobile routes redirect to field-safe summaries rather than full console density.

#### Accessibility Notes
AAA contrast on alarms and critical text; keyboard navigation across tiles; reduced-motion disables nonessential pulses. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Live deltas animate in 120-180ms; counters tick smoothly; catastrophic states may pulse but must pause in reduced motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes evolving situation, recommends next tasks, and flags gaps or contradictory signals.

#### Backend APIs
GET /api/v1/emergency/:id; POST /api/v1/emergency/:id/playbook/:step/advance; POST /api/v1/emergency/:id/broadcast.

#### Events
emergency.playbook.advanced.v1; emergency.broadcast.sent.v1; responder.assigned.v1.

#### Analytics / Telemetry
Track task completion latency, broadcast effectiveness, and missing-person resolution time.

#### Component IDs
- `em.active.playbook`
- `em.active.twin`
- `em.active.table.responders`
- `em.active.table.missing`

#### Dependencies / Cross-links
Plume Simulation; Muster; Mobile SOS.


### 35. Emergency Muster Status

#### Purpose
Personnel accountability surface showing expected vs accounted workers, muster point loads, and missing personnel investigation.

#### Users / Personas
Operational roles, supervisors, HSE, emergency response.

#### Route / Surface Type
- **Route / Surface:** `/emergency/muster`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Muster KPI strip; point cards; accountability table; last-known-location panel.

#### Tables
Accountability table with person, employer, status, last-seen, expected muster, and contact columns.

#### Charts / Visualizations
Muster completion chart; point utilization bars; missing-person time-since-last-seen histogram.

#### Filters
Muster point; employer; crew; accountability state.

#### Search
Search worker, badge ID, contractor company.

#### Actions
Mark accounted; open last known location; export roster; notify supervisor.

#### Keyboard Shortcuts
M focuses muster point selector.

#### Permissions
Personal data may be masked for non-emergency observers.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI clusters likely missing-person paths and recommends search priorities.

#### Backend APIs
GET /api/v1/emergency/muster; POST /api/v1/emergency/muster/:personId/accounted.

#### Events
muster.loaded.v1; muster.person.accounted.v1.

#### Analytics / Telemetry
Track muster completion, manual overrides, and search-priority acceptance.

#### Component IDs
- `muster.kpi.accounted`
- `muster.table.people`
- `muster.card.point`
- `muster.panel.lastKnown`

#### Dependencies / Cross-links
Emergency Active Command Surface; Twin Replay.


### 36. Permit Register

#### Purpose
Master register of permit-to-work instances across states, owners, locations, and work classes.

#### Users / Personas
Contractors, operators, supervisors, HSE.

#### Route / Surface Type
- **Route / Surface:** `/permits`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Register table; status chips; calendar strip; risk summary cards; related conditions drawer.

#### Tables
Permit table with permit ID, type, state, issuer, scope, start/end, SIMOPS flag, and worker count.

#### Charts / Visualizations
Permit volume trend; approvals SLA; conflict density heatmap.

#### Filters
Permit type; state; scope; issuer; contractor; time window; conflict flag.

#### Search
Permit ID, asset, contractor, task description search.

#### Actions
Create permit; bulk assign reviewer; open detail; export; open analytics.

#### Keyboard Shortcuts
N new permit; P focus permit table.

#### Permissions
Contractors see own permits; supervisors/HSE broader scope with approve rights.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can draft permit summaries, highlight missing evidence, and suggest conflict checks.

#### Backend APIs
GET /api/v1/permits; POST /api/v1/permits; GET /api/v1/permits/summary.

#### Events
permit.created.v1; permit.filtered.v1.

#### Analytics / Telemetry
Track register-to-detail conversion, filter usage, and draft creation rate.

#### Component IDs
- `permits.table`
- `permits.action.new`
- `permits.chart.approvalSla`
- `permits.filter.state`

#### Dependencies / Cross-links
Permit Draft; Permit Detail; Permit Analytics.


### 37. Permit Draft

#### Purpose
AI-assisted permit creation flow for hot work, confined space, electrical, and other work classes.

#### Users / Personas
Operators, contractors, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/permits/new`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Type selector; task description; auto-filled scope; AI draft panel; prerequisites checklist; sticky action bar.

#### Tables
Checklist table for prerequisites/evidence.

#### Charts / Visualizations
Completion progress ring; suggested hazard counts.

#### Filters
Permit type; site scope; contractor company.

#### Search
Task description helper search; past similar permits search.

#### Actions
Generate draft; save draft; submit for assessment; attach evidence.

#### Keyboard Shortcuts
Cmd/Ctrl+Enter submits draft; Shift+G regenerates AI draft.

#### Permissions
Creators need permit-create capability; some types require certification checks.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI drafts JSA/HIRA inputs, suggests hazards/PPE, and links similar permits or incidents.

#### Backend APIs
POST /api/v1/permits/draft; POST /api/v1/permits/draft/ai; POST /api/v1/permits/:id/attachments.

#### Events
permit.draft.generated.v1; permit.draft.saved.v1.

#### Analytics / Telemetry
Track AI draft acceptance, manual edits, and abandoned drafts.

#### Component IDs
- `permit.new.type`
- `permit.new.aiDraft`
- `permit.new.checklist`
- `permit.new.submit`

#### Dependencies / Cross-links
Permit Register; Risk Assessment.


### 38. Permit Detail

#### Purpose
Canonical state-machine view of a permit from draft through closure, including evidence, signatures, crew, and adjacent risks.

#### Users / Personas
Issuer, contractor, supervisor, HSE, auditor (read-only).

#### Route / Surface Type
- **Route / Surface:** `/permits/:id`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
State timeline; detail form; crew list; evidence gallery; nearby conditions card; sticky action bar; related modules rail.

#### Tables
Crew table; evidence list; approval history table.

#### Charts / Visualizations
Permit timeline; nearby condition trend; risk score sparkline.

#### Filters
State; evidence status; crew status; nearby risk threshold.

#### Search
Crew, evidence note, and approval log search.

#### Actions
Approve; reject; activate; suspend; close; add crew; add evidence; print safe copy.

#### Keyboard Shortcuts
A approve when allowed; X suspend; C close.

#### Permissions
Actions strictly role/state/policy-gated; signatures may require certification or dual sign-off.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes permit completeness, missing controls, and conflict signals; all suggestions reviewable.

#### Backend APIs
GET /api/v1/permits/:id; POST /api/v1/permits/:id/transition; POST /api/v1/permits/:id/crew; GET /api/v1/permits/:id/nearby-conditions.

#### Events
permit.status.changed.v1; permit.crew.added.v1; permit.suspended.v1.

#### Analytics / Telemetry
Track time-in-state, approval cycle time, and missing-control frequency.

#### Component IDs
- `permit.detail.timeline`
- `permit.detail.action.approve`
- `permit.detail.table.crew`
- `permit.detail.evidence`

#### Dependencies / Cross-links
Risk Assessment; Conflict Check; LOTO.


### 39. Permit Risk Assessment

#### Purpose
Dedicated JSA/HIRA workspace for identifying hazards, controls, PPE, and sign-off prerequisites attached to a permit.

#### Users / Personas
Permit creators, supervisors, HSE.

#### Route / Surface Type
- **Route / Surface:** `/permits/:id/risk-assessment`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Hazard matrix; control library; AI suggestion panel; residual risk calculator; sign-off footer.

#### Tables
Hazard/control table with hazard, consequence, likelihood, severity, controls, residual rating.

#### Charts / Visualizations
Residual risk matrix; hazard-category distribution.

#### Filters
Hazard class; residual risk; control type.

#### Search
Hazard, control, regulation, SOP search.

#### Actions
Add hazard; accept AI suggestion; assign control owner; sign; publish to permit.

#### Keyboard Shortcuts
Shift+A accepts selected AI suggestion.

#### Permissions
Signing may require `cert.jsa=true` or equivalent policy attribute.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes hazards, controls, and regulatory citations using historical and semantic matches.

#### Backend APIs
GET /api/v1/permits/:id/risk-assessment; POST /api/v1/permits/:id/risk-assessment/hazards; POST /api/v1/permits/:id/risk-assessment/sign.

#### Events
jsa.hazard.added.v1; jsa.signed.v1.

#### Analytics / Telemetry
Track AI-suggestion acceptance, residual risk delta, and sign-off duration.

#### Component IDs
- `permit.risk.table`
- `permit.risk.matrix`
- `permit.risk.ai`
- `permit.risk.sign`

#### Dependencies / Cross-links
Permit Detail; Knowledge Browse; Copilot.


### 40. Permit Conflict Check

#### Purpose
Spatial and temporal SIMOPS/conflict inspector for validating work overlap and hazardous combinations before activation.

#### Users / Personas
Supervisors, HSE, permit issuers.

#### Route / Surface Type
- **Route / Surface:** `/permits/:id/conflict-check`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Conflict matrix; timeline; map preview; severity chips; recommended mitigations.

#### Tables
Conflict table with overlapping permit, location, time overlap, conflict type, severity, mitigation.

#### Charts / Visualizations
Timeline overlap/Gantt; spatial overlap heatmap; conflict count by type.

#### Filters
Conflict type; severity; time overlap; location.

#### Search
Permit ID, location, and contractor search.

#### Actions
Resolve conflict; request schedule shift; add control; approve with exception.

#### Keyboard Shortcuts
Shift+R resolves selected conflict.

#### Permissions
Exception approvals require elevated policy path and audit note.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI explains why a conflict exists and recommends schedule or control changes.

#### Backend APIs
GET /api/v1/permits/:id/conflicts; POST /api/v1/permits/:id/conflicts/:cid/resolve.

#### Events
permit.conflict.detected.v1; permit.conflict.resolved.v1.

#### Analytics / Telemetry
Track pre-activation conflict rate, resolution time, and exception usage.

#### Component IDs
- `permit.conflict.matrix`
- `permit.conflict.timeline`
- `permit.conflict.map`

#### Dependencies / Cross-links
Permit Detail; Decision Inbox; Digital Twin.


### 41. LOTO Board

#### Purpose
Overview of active, pending, and released lockout/tagout activities across units and assets.

#### Users / Personas
Operators, supervisors, maintenance, HSE.

#### Route / Surface Type
- **Route / Surface:** `/loto`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Isolation board; state chips; group lock cards; pending verification queue; recent releases.

#### Tables
Isolation table with isolation ID, asset, state, owner, energy type, zero-energy status, and group count.

#### Charts / Visualizations
Isolation state distribution; release trend; overdue verification count.

#### Filters
State; energy type; asset class; owner; overdue.

#### Search
Isolation ID, asset, worker, tag number search.

#### Actions
Create isolation; open sequence; verify zero energy; release when eligible.

#### Keyboard Shortcuts
L opens selected isolation sequence; V opens verification.

#### Permissions
Creation and release are strictly state- and role-gated.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI surfaces missing verification evidence and sequence anomalies.

#### Backend APIs
GET /api/v1/loto; POST /api/v1/loto; GET /api/v1/loto/summary.

#### Events
loto.created.v1; loto.filtered.v1.

#### Analytics / Telemetry
Track isolation cycle time, overdue verification, and grouped work complexity.

#### Component IDs
- `loto.board.table`
- `loto.board.queue.verify`
- `loto.board.card.group`

#### Dependencies / Cross-links
Zero-Energy Verification; Guided Sequence; Group Lockout.


### 42. Zero-Energy Verification

#### Purpose
Verification surface combining OT telemetry and computer-vision evidence to prove safe zero-energy state.

#### Users / Personas
Operators, supervisors, maintenance leads.

#### Route / Surface Type
- **Route / Surface:** `/loto/isolations/:id/verification`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Verification checklist; live gauge stack; CV snapshot strip; sign-off panel; exception banner.

#### Tables
Checklist table; evidence log table.

#### Charts / Visualizations
Pressure/current/voltage gauges; decay trend line; pass/fail indicators.

#### Filters
Energy type; verification status; evidence type.

#### Search
Step, tag, and gauge search.

#### Actions
Verify step; capture evidence; sign; raise exception.

#### Keyboard Shortcuts
Shift+V signs current verification step.

#### Permissions
Requires appropriate isolator or verifier role and sometimes dual witness.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI highlights inconsistent evidence and explains why verification cannot pass yet.

#### Backend APIs
GET /api/v1/loto/:id/verification; POST /api/v1/loto/:id/verification/evidence; POST /api/v1/loto/:id/verification/sign.

#### Events
loto.verification.updated.v1; zero_energy.verified.v1.

#### Analytics / Telemetry
Track verification completion time and evidence retries.

#### Component IDs
- `loto.verify.checklist`
- `loto.verify.gauges`
- `loto.verify.snapshots`
- `loto.verify.sign`

#### Dependencies / Cross-links
LOTO Board; Asset Detail; Vision Cameras.


### 43. Shift Handover Queue

#### Purpose
Queue of incoming/outgoing shift handovers with packet readiness, unresolved hazards, and required acknowledgments.

#### Users / Personas
Supervisors, operators, HSE (read-only).

#### Route / Surface Type
- **Route / Surface:** `/handover`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Queue list; readiness cards; open issues panel; fatigue strip; packet start CTA.

#### Tables
Handover table with shift, outgoing lead, incoming lead, packet state, open permits, open alarms, unresolved risks.

#### Charts / Visualizations
Readiness bar; open-issue trend; fatigue risk indicator.

#### Filters
Shift; site/unit; packet state; fatigue risk.

#### Search
Shift ID, supervisor, packet text search.

#### Actions
Open packet; reassign lead; request completion; launch quiz.

#### Keyboard Shortcuts
Q opens comprehension quiz.

#### Permissions
Write actions reserved for shift leads/supervisors; HSE typically read-only.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI drafts packet summaries and flags unusual carryover items.

#### Backend APIs
GET /api/v1/handover; GET /api/v1/handover/summary; POST /api/v1/handover/:id/request-completion.

#### Events
handover.queue.loaded.v1; handover.packet.requested.v1.

#### Analytics / Telemetry
Track packet completion before shift start and carryover reduction.

#### Component IDs
- `handover.table`
- `handover.readiness.bar`
- `handover.action.openPacket`

#### Dependencies / Cross-links
Handover Packet; Predictive Hub.


### 44. Incident Register

#### Purpose
Central list of incidents, near misses, injuries, hazards, and automatically drafted records.

#### Users / Personas
All for report creation; HSE and safety officers for full handling.

#### Route / Surface Type
- **Route / Surface:** `/incidents`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Register table; severity cards; open CAPA count; draft review lane; evidence ingestion status.

#### Tables
Incident table with incident ID, type, severity, state, site, injured parties count, CAPA count, and created-at.

#### Charts / Visualizations
Severity trend; incidents by type; open-vs-closed split.

#### Filters
Severity; type; state; site; AI autodraft state; date range.

#### Search
Incident ID, worker, asset, narrative, regulation search.

#### Actions
Create incident; open RCA; accept autodraft; export evidence packet.

#### Keyboard Shortcuts
I creates new incident; Shift+R opens RCA.

#### Permissions
Create permission broad, full detail narrower; personally sensitive incidents may be masked.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI clusters similar incidents, drafts narratives, and suggests RCA seeds.

#### Backend APIs
GET /api/v1/incidents; POST /api/v1/incidents; GET /api/v1/incidents/autodrafts.

#### Events
incident.created.v1; incident.autodraft.v1; incident.opened.v1.

#### Analytics / Telemetry
Track draft acceptance, time-to-open RCA, and register search patterns.

#### Component IDs
- `incident.table`
- `incident.action.new`
- `incident.lane.autodrafts`
- `incident.chart.severity`

#### Dependencies / Cross-links
Incident Report; Timeline; RCA; CAPA.


### 45. RCA Workspace

#### Purpose
Root-cause analysis workspace for 5-Whys, bowtie, TapRooT-style reasoning, evidence curation, and corrective actions.

#### Users / Personas
Safety officers, HSE, investigators, technical experts.

#### Route / Surface Type
- **Route / Surface:** `/incidents/:id/rca`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
RCA method tabs; evidence stack; cause graph; hypothesis panel; CAPA linkage; approval footer.

#### Tables
Evidence table; hypothesis ranking table; corrective action table.

#### Charts / Visualizations
Cause graph/Sankey; incident timeline summary; evidence confidence chart.

#### Filters
RCA method; evidence type; hypothesis confidence; CAPA state.

#### Search
Evidence text, witness name, cause node, regulation search.

#### Actions
Add cause; accept/reject hypothesis; create CAPA; finalize RCA.

#### Keyboard Shortcuts
Shift+H adds hypothesis; Shift+C creates CAPA.

#### Permissions
Restricted to incident team and designated reviewers.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes hypotheses with evidence and counterfactuals but cannot finalize RCA alone.

#### Backend APIs
GET /api/v1/incidents/:id/rca; POST /api/v1/incidents/:id/rca/hypotheses; POST /api/v1/incidents/:id/capa.

#### Events
rca.hypothesis.generated.v1; rca.finalized.v1; capa.opened.v1.

#### Analytics / Telemetry
Track hypothesis acceptance, evidence completeness, and RCA cycle time.

#### Component IDs
- `rca.tabs.method`
- `rca.graph.cause`
- `rca.table.hypotheses`
- `rca.action.createCapa`

#### Dependencies / Cross-links
Incident Timeline; CAPA Workspace; Knowledge Browse.


### 46. Predictive Hub

#### Purpose
Analytics hub for gas forecasting, equipment RUL, fatigue risk, and portfolio-level predictive safety indicators.

#### Users / Personas
HSE, plant heads, reliability teams, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/predictive`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Forecast cards; model selector; comparison tabs; alert preview; recommendation cards.

#### Tables
Prediction queue table; model run status table.

#### Charts / Visualizations
Forecast line with confidence bands; RUL distribution; fatigue heatmap; SIF exposure gauge.

#### Filters
Model; horizon; site/unit; confidence threshold; asset class.

#### Search
Asset, model, alert, worker search.

#### Actions
Acknowledge prediction; open asset; create work order or CAPA; compare model.

#### Keyboard Shortcuts
M cycles predictive models; Shift+A acknowledges alert.

#### Permissions
Model visibility may vary by role and data sensitivity.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI insight cards explain drivers, confidence, and recommended interventions.

#### Backend APIs
GET /api/v1/predictive; GET /api/v1/predictive/models; POST /api/v1/predictive/alerts/:id/ack.

#### Events
prediction.generated.v1; prediction.alert.acked.v1.

#### Analytics / Telemetry
Track prediction hit rate, drill-down to action, and model comparison usage.

#### Component IDs
- `predictive.chart.forecast`
- `predictive.gauge.sif`
- `predictive.table.queue`
- `predictive.ai.insight`

#### Dependencies / Cross-links
Asset Detail; Diagnostics; Portfolio Console.


### 47. Camera Fleet

#### Purpose
Fleet management for fixed and edge cameras, analytics status, health, privacy posture, and deployment coverage.

#### Users / Personas
IT/OT, security admins, HSE observers.

#### Route / Surface Type
- **Route / Surface:** `/vision/cameras`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Camera inventory; topology map; analytics badges; health strip; firmware state; preview drawer.

#### Tables
Camera table with camera ID, site, status, analytics, privacy mode, firmware, retention, and hardening columns.

#### Charts / Visualizations
Fleet health bars; analytics coverage chart; offline camera trend.

#### Filters
Site; status; analytic type; privacy mode; vendor.

#### Search
Camera ID, zone, IP alias, analytics profile search.

#### Actions
Add camera; edit config; disable analytics; open zone editor; open transparency map.

#### Keyboard Shortcuts
C creates camera; Z opens zone editor on selected camera.

#### Permissions
Admin write access; observers read-only.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests miscalibrated cameras, coverage gaps, and privacy anomalies.

#### Backend APIs
GET /api/v1/vision/cameras; POST /api/v1/vision/cameras; PATCH /api/v1/vision/cameras/:id; GET /api/v1/vision/cameras/health.

#### Events
camera.hardening.state.v1; cv.event.v2; camera.config.updated.v1.

#### Analytics / Telemetry
Track camera uptime, analytics coverage, and config drift.

#### Component IDs
- `vision.cameras.table`
- `vision.cameras.health`
- `vision.cameras.action.add`
- `vision.cameras.preview`

#### Dependencies / Cross-links
Zone Geometry Editor; Homography Calibration; Vision Privacy.


### 48. Vision Privacy Controls

#### Purpose
Privacy governance for face blur, retention policies, access controls, and union-transparent disclosures.

#### Users / Personas
CISO, IT/OT, privacy officers.

#### Route / Surface Type
- **Route / Surface:** `/vision/privacy`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Policy cards; retention matrix; blur QA samples; access logs; transparency disclosures.

#### Tables
Privacy policy table; blur QA sample table; retention exceptions table.

#### Charts / Visualizations
Blur compliance trend; access violation chart.

#### Filters
Site; camera group; policy type; compliance state.

#### Search
Policy name, camera ID, incident ID search.

#### Actions
Edit policy; review sample; approve exception; export compliance packet.

#### Keyboard Shortcuts
Shift+E edits selected policy.

#### Permissions
Restricted to privacy/security governance roles.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI flags policy drift and sample anomalies but cannot disable blur autonomously.

#### Backend APIs
GET /api/v1/vision/privacy; PATCH /api/v1/vision/privacy/:policyId; GET /api/v1/vision/privacy/audit.

#### Events
privacy.policy.updated.v1; privacy.exception.approved.v1.

#### Analytics / Telemetry
Track exception rate, blur QA failure rate, and audit export frequency.

#### Component IDs
- `vision.privacy.table`
- `vision.privacy.samples`
- `vision.privacy.chart.compliance`

#### Dependencies / Cross-links
Camera Fleet; Auditor Portal; PII Discovery.


### 49. OT Connectors

#### Purpose
Operational technology ingestion console for OPC-UA, Modbus, historian, and other connector health, schemas, and routing.

#### Users / Personas
IT/OT, data engineers, platform admins.

#### Route / Surface Type
- **Route / Surface:** `/ot/connectors`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Connector list; health strip; backlog chart; mapping status; error drawer; create connector CTA.

#### Tables
Connector table with connector ID, protocol, site, health, lag, last payload, mapping status, and owner.

#### Charts / Visualizations
Lag trend; payload throughput; error-class distribution.

#### Filters
Protocol; health; site; mapping status; owner.

#### Search
Connector ID, tag, site, protocol search.

#### Actions
Add connector; pause/resume; open resolver; run backfill; open simulator.

#### Keyboard Shortcuts
Shift+P pauses selected connector.

#### Permissions
Write access limited to OT/data platform roles.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests tag mappings, anomaly root causes, and safer retry windows.

#### Backend APIs
GET /api/v1/ot/connectors; POST /api/v1/ot/connectors; POST /api/v1/ot/connectors/:id/pause; GET /api/v1/ot/connectors/:id/metrics.

#### Events
ot.connector.health.changed.v1; ot.backfill.started.v1.

#### Analytics / Telemetry
Track lag, mapping completion, and error recovery time.

#### Component IDs
- `ot.connectors.table`
- `ot.connectors.chart.lag`
- `ot.connectors.action.add`
- `ot.connectors.drawer.errors`

#### Dependencies / Cross-links
Tag Resolver; Historian Backfill; SCADA Simulator.


### 50. Knowledge Graph Explorer

#### Purpose
Interactive graph and hierarchy explorer for assets, workers, permits, incidents, regulations, and semantic relationships.

#### Users / Personas
Safety officers, engineers, IT/OT, auditors.

#### Route / Surface Type
- **Route / Surface:** `/knowledge/browse`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Graph canvas; entity details; path finder; neighborhood controls; asset hierarchy tree; source citation panel.

#### Tables
Entity attribute table; path result table; citation table.

#### Charts / Visualizations
Force-directed graph; neighborhood statistics; relation-type bars.

#### Filters
Entity type; relationship type; time state; scope.

#### Search
Entity, asset, worker, permit, regulation search.

#### Actions
Open entity; pin neighborhood; compare paths; export citation bundle; open ontology editor.

#### Keyboard Shortcuts
G focuses graph; P starts path finder.

#### Permissions
Visible entities and edges are ABAC filtered and may redact sensitive relationships.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI explains relationship paths, proposes likely relevant entities, and summarizes neighborhoods.

#### Backend APIs
GET /api/v1/knowledge/entities/:id; POST /api/v1/knowledge/query/path; GET /api/v1/knowledge/neighborhood.

#### Events
kg.entity.opened.v1; kg.path.queried.v1.

#### Analytics / Telemetry
Track graph depth, path-query success, and graph-to-action conversions.

#### Component IDs
- `kg.graph.canvas`
- `kg.panel.entity`
- `kg.path.finder`
- `kg.table.citations`

#### Dependencies / Cross-links
Ontology Editor; Bulk Import; Related Modules Rail.


### 51. Copilot Workspace

#### Purpose
Full-screen conversational AI workspace for grounded Q&A, operational assistance, evidence review, and agentic workflows.

#### Users / Personas
All authenticated personas subject to AI policy.

#### Route / Surface Type
- **Route / Surface:** `/copilot`
- **Surface Type:** page
- **Layout Family:** ai

#### Layout
AI-first workspace with conversation column, source/evidence panel, tool trace rail, and optional structured result canvas.

#### Visual Hierarchy
Halo Orb presence, streaming typography, reasoning timeline, and confidence treatments make AI feel alive but accountable.

#### Components
Conversation column; thread list; source panel; tool trace rail; structured result cards; voice controls; citation verifier.

#### Tables
Thread list; source citation list; structured result tables when query demands.

#### Charts / Visualizations
Confidence trend, tool latency sparkline, and reasoning timeline.

#### Filters
Scope; source type; thread owner; confidence threshold.

#### Search
Thread search; citation search; command/object search inside prompts.

#### Actions
Ask; upload context; branch thread; pin answer; escalate to decision; open source route.

#### Keyboard Shortcuts
Cmd/Ctrl+Enter sends; Alt+Up/Down navigates messages.

#### Permissions
Governed by capability tokens, data residency rules, kill-switch, and role-specific tool permissions.

#### States
##### Empty States
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty prompts with high-value starter tasks. Loading is streaming-first with tool execution visualization. Errors distinguish model, policy, tool, and permission failures. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Voice-first and bottom-sheet source previews; result cards stack vertically; tool traces compress to timeline chips.

#### Accessibility Notes
Streaming updates announced politely, source links keyboard reachable, and voice controls have text alternatives. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Orb breathing, typing shimmer, and trace reveals are subtle and pause in reduced-motion mode. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI-native surface with streaming, citations, tool usage, model routing visibility, and confidence.

#### Backend APIs
POST /api/v1/copilot/threads; POST /api/v1/copilot/threads/:id/messages; GET /api/v1/copilot/threads/:id/citations; GET /api/v1/copilot/threads/:id/traces.

#### Events
llm.route.decision.v1; uncertainty.calibrated.v1; copilot.message.sent.v1.

#### Analytics / Telemetry
Track resolution without navigation, citation use, voice-query rate, and model-route mix.

#### Component IDs
- `copilot.thread.list`
- `copilot.message.stream`
- `copilot.panel.sources`
- `copilot.panel.trace`

#### Dependencies / Cross-links
Halo Orb; Kill-Switch; Knowledge Browse.


### 52. AI Kill-Switch

#### Purpose
Emergency administrative surface for pausing or rolling back AI capabilities globally or per capability domain.

#### Users / Personas
CISO only plus dual-signer approver where policy requires.

#### Route / Surface Type
- **Route / Surface:** `/copilot/agents/kill-switch`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Impact summary; scope selector; capability matrix; rollback options; dual-sign panel; audit timeline.

#### Tables
Capability status table; affected workflow table.

#### Charts / Visualizations
Impact bar chart; active AI calls trend; incident timeline.

#### Filters
Capability domain; tenant/site; severity.

#### Search
Capability token and workflow search.

#### Actions
Pause AI; rollback model; scope kill-switch; restore with approval.

#### Keyboard Shortcuts
K opens confirmation panel only for eligible users.

#### Permissions
CISO-only; high-risk actions require dual sign-off and immutable audit.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI is never allowed to self-disable or self-restore; this page only visualizes impact using non-agentic summaries.

#### Backend APIs
GET /api/v1/ai/kill-switch; POST /api/v1/ai/kill-switch/engage; POST /api/v1/ai/kill-switch/restore.

#### Events
ai.killswitch.engaged.v1; ai.killswitch.restored.v1.

#### Analytics / Telemetry
Track trigger causes, affected workflows, and restore time.

#### Component IDs
- `ai.kill.matrix`
- `ai.kill.action.engage`
- `ai.kill.timeline.audit`

#### Dependencies / Cross-links
Decision Inbox; Security Audit Log.


### 53. Worker Telemetry Detail

#### Purpose
Worker-centric telemetry surface for biometrics, exposure, fatigue, location, and alerts.

#### Users / Personas
Worker self-view, supervisors for crew, HSE.

#### Route / Surface Type
- **Route / Surface:** `/iot/telemetry/:id`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Worker profile strip; telemetry tabs; exposure summary; alert history; privacy disclosure.

#### Tables
Exposure event table; alert history table.

#### Charts / Visualizations
Heart-rate/exposure trends; fatigue gauge; route trace mini-map.

#### Filters
Time range; signal type; alert severity.

#### Search
Worker ID, badge, signal search.

#### Actions
Acknowledge alert; request welfare check; export exposure report.

#### Keyboard Shortcuts
W triggers welfare check when permitted.

#### Permissions
Workers can see self; supervisors restricted to crews; health data masking may apply by jurisdiction.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI highlights abnormal trends and recommends safe escalation paths.

#### Backend APIs
GET /api/v1/iot/workers/:id; GET /api/v1/iot/workers/:id/signals; GET /api/v1/iot/workers/:id/alerts.

#### Events
worker.exposure.alerted.v1; worker.welfare_check.requested.v1.

#### Analytics / Telemetry
Track supervisor response time and worker self-review frequency.

#### Component IDs
- `iot.worker.header`
- `iot.worker.chart.exposure`
- `iot.worker.table.alerts`

#### Dependencies / Cross-links
Digital Twin; Emergency Muster; Safety Passport.


### 54. Safety Passport

#### Purpose
Digital worker passport for certifications, inductions, medical/fitness status, training, and site access readiness.

#### Users / Personas
Workers (self), supervisors, HSE, onboarding staff.

#### Route / Surface Type
- **Route / Surface:** `/workforce/passport`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Passport card; cert timeline; site access chips; medical/training panels; renewal reminders.

#### Tables
Certification table; site-access table; training history table.

#### Charts / Visualizations
Expiry timeline; readiness ring; training completion bars.

#### Filters
Worker; employer; certification state; expiry window; site.

#### Search
Worker ID, certificate ID, training title search.

#### Actions
Upload certification; request renewal; approve exception; open kiosk/mobile pass.

#### Keyboard Shortcuts
Shift+U uploads document.

#### Permissions
Workers self-view; HSE full edit; supervisors limited operational view.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes gaps to readiness and suggests next required training.

#### Backend APIs
GET /api/v1/workforce/passports/:id; POST /api/v1/workforce/passports/:id/documents; POST /api/v1/workforce/passports/:id/exceptions.

#### Events
passport.updated.v1; certification.expiring.v1.

#### Analytics / Telemetry
Track readiness rate, renewal lead time, and exception usage.

#### Component IDs
- `passport.card`
- `passport.table.certs`
- `passport.chart.expiry`
- `passport.action.upload`

#### Dependencies / Cross-links
Onboarding Kiosk; Mobile Passport; Home.


### 55. Compliance Evidence Explorer

#### Purpose
Immutable evidence workspace for audits, clause mapping, investigations, and one-click evidence packet generation.

#### Users / Personas
Auditors, HSE, compliance teams, CISO.

#### Route / Surface Type
- **Route / Surface:** `/compliance/evidence`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Evidence search; clause map; evidence bundle builder; hash verification strip; export actions.

#### Tables
Evidence table with evidence ID, source, clause, timestamp, hash status, sensitivity, and object link.

#### Charts / Visualizations
Clause coverage heatmap; evidence freshness trend; missing-evidence count.

#### Filters
Framework; clause; source module; hash status; sensitivity; date range.

#### Search
Evidence ID, incident, permit, clause, worker, asset search.

#### Actions
Build packet; verify hash; open source object; export audit set.

#### Keyboard Shortcuts
V verifies selected hashes; B adds to bundle.

#### Permissions
Auditors/compliance roles only; personal data redaction depends on purpose and jurisdiction.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests likely relevant evidence and draft auditor narratives with citations only.

#### Backend APIs
POST /api/v1/compliance/search; GET /api/v1/compliance/evidence/:id; POST /api/v1/compliance/bundles.

#### Events
evidence.bundle.created.v1; evidence.hash.verified.v1.

#### Analytics / Telemetry
Track packet build time, clause coverage, and source reopen rate.

#### Component IDs
- `comp.search.input`
- `comp.table.evidence`
- `comp.heatmap.clauses`
- `comp.bundle.builder`

#### Dependencies / Cross-links
Auditor Portal; Security Audit Log; Incident RCA.


### 56. Notification Routing Rules

#### Purpose
Administrative interface for escalation logic, quiet hours, channel policy, and delivery fallbacks.

#### Users / Personas
Admins, HSE, notification managers.

#### Route / Surface Type
- **Route / Surface:** `/notifications/rules`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Rule list; visual ladder; channel matrix; simulation pane; delivery logs.

#### Tables
Rule table; recent delivery failure table.

#### Charts / Visualizations
Escalation ladder visualization; delivery failure trend; channel success rate.

#### Filters
Module; severity; channel; active state.

#### Search
Rule name, object type, recipient group search.

#### Actions
Create rule; simulate route; enable/disable; clone rule.

#### Keyboard Shortcuts
Shift+N creates rule.

#### Permissions
Admin-only writes; read-only for auditors if granted.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can suggest routing improvements based on missed SLAs and failed deliveries.

#### Backend APIs
GET /api/v1/notifications/rules; POST /api/v1/notifications/rules; POST /api/v1/notifications/rules/:id/simulate.

#### Events
notification.rule.updated.v1; notification.route.simulated.v1.

#### Analytics / Telemetry
Track rule churn, simulation use, and SLA miss reduction.

#### Component IDs
- `notify.rules.table`
- `notify.rules.ladder`
- `notify.rules.simulate`

#### Dependencies / Cross-links
Notification Center; Workflow Builder.


### 57. Data Lakehouse

#### Purpose
Platform data plane overview for curated domains, storage health, feature data, and analytical assets.

#### Users / Personas
IT/OT, data engineers, ML platform, admins.

#### Route / Surface Type
- **Route / Surface:** `/data/lakehouse`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Domain cards; table browser; lineage preview; freshness strip; model/contract tabs.

#### Tables
Dataset table with domain, owner, freshness, sensitivity, schema version, and row count summaries.

#### Charts / Visualizations
Freshness chart; storage growth trend; lineage mini-graph.

#### Filters
Domain; owner; freshness; sensitivity; schema version.

#### Search
Dataset, feature, contract, model search.

#### Actions
Open dataset; inspect lineage; open model registry; open contracts; start labeling.

#### Keyboard Shortcuts
D focuses dataset browser.

#### Permissions
Platform roles only; sensitive datasets masked or sampled.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize lineage impact and suggest joins or data quality checks.

#### Backend APIs
GET /api/v1/lakehouse/domains; GET /api/v1/lakehouse/datasets; GET /api/v1/lakehouse/freshness.

#### Events
lakehouse.dataset.opened.v1; lakehouse.lineage.viewed.v1.

#### Analytics / Telemetry
Track dataset discoverability, freshness alert handling, and cross-link usage.

#### Component IDs
- `lakehouse.domains`
- `lakehouse.table.datasets`
- `lakehouse.chart.freshness`
- `lakehouse.lineage.preview`

#### Dependencies / Cross-links
Model Registry; Data Contracts; Labeling Console.


### 58. Workflow Visualizer

#### Purpose
Runtime and design-time introspection of long-running workflows, runs, failures, retries, and orchestration graphs.

#### Users / Personas
IT/OT, platform operators, advanced admins.

#### Route / Surface Type
- **Route / Surface:** `/workflows/temporal`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Workflow graph; run list; step trace; retry panel; dead-letter queue card; policy diff strip.

#### Tables
Run table with workflow ID, version, state, owner, latency, retries, and last event.

#### Charts / Visualizations
Run latency trend; failure-rate chart; retry histogram.

#### Filters
Workflow family; version; run state; owner; latency band.

#### Search
Workflow ID, run ID, object ID search.

#### Actions
Open run; retry; terminate; diff version; open policy editor.

#### Keyboard Shortcuts
Shift+T terminates selected run after confirmation.

#### Permissions
Operational/admin roles only; destructive actions tightly controlled.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize failure causes and suggest safe retry or policy changes.

#### Backend APIs
GET /api/v1/workflows/runs; GET /api/v1/workflows/:id/graph; POST /api/v1/workflows/runs/:id/retry.

#### Events
workflow.run.started.v1; workflow.run.failed.v1; workflow.run.retried.v1.

#### Analytics / Telemetry
Track run failure clusters, mean repair time, and version drift.

#### Component IDs
- `wf.graph`
- `wf.table.runs`
- `wf.trace.steps`
- `wf.action.retry`

#### Dependencies / Cross-links
Policy Editor; Approval Builder; Decision Inbox.


### 59. Tenant Management

#### Purpose
Multi-tenant configuration for organizations, sites, scopes, feature flags, branding, and provisioning status.

#### Users / Personas
Super-admin only.

#### Route / Surface Type
- **Route / Surface:** `/admin/tenants`
- **Surface Type:** page
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Tenant list; detail editor; site tree; feature flag panel; provisioning checklist; audit drawer.

#### Tables
Tenant table; site tree table; feature flag table.

#### Charts / Visualizations
Provisioning progress chart; tenant health summary.

#### Filters
Tenant state; region; contract tier; feature flag.

#### Search
Tenant ID, org name, site name search.

#### Actions
Create tenant; add site; change flag; suspend tenant; export config.

#### Keyboard Shortcuts
Shift+T creates tenant.

#### Permissions
Super-admin only with JIT elevation for sensitive actions.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can explain impact of config changes and flag risky flag combinations.

#### Backend APIs
GET /api/v1/admin/tenants; POST /api/v1/admin/tenants; PATCH /api/v1/admin/tenants/:id.

#### Events
tenant.created.v1; tenant.featureflag.changed.v1.

#### Analytics / Telemetry
Track provisioning lead time and config-error rate.

#### Component IDs
- `tenant.table`
- `tenant.tree.sites`
- `tenant.flags.table`
- `tenant.checklist.provision`

#### Dependencies / Cross-links
Site Onboarding Wizard; Security Audit Log.


### 60. Security Audit Log

#### Purpose
Immutable security and governance event log for sessions, policy changes, privileged actions, AI kill-switches, and access anomalies.

#### Users / Personas
CISO, auditors, security operations.

#### Route / Surface Type
- **Route / Surface:** `/security/audit-log`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Log search; event stream; integrity strip; user/session cards; export bundle.

#### Tables
Audit log table with event ID, actor, action, scope, result, source IP/device, and hash verification.

#### Charts / Visualizations
Event volume trend; privileged action breakdown; deny-rate chart.

#### Filters
Actor; action class; result; scope; device; date range.

#### Search
Event ID, user, object, policy bundle search.

#### Actions
Open event; verify chain; export; create investigation.

#### Keyboard Shortcuts
F focuses log filter; X exports current set.

#### Permissions
Security/audit roles only; chain verification mandatory for exports.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI clusters suspicious sequences and proposes investigation pivots without taking action.

#### Backend APIs
GET /api/v1/security/audit-log; GET /api/v1/security/audit-log/:id/verify; POST /api/v1/security/audit-log/export.

#### Events
security.audit.viewed.v1; security.audit.exported.v1; ai.killswitch.engaged.v1.

#### Analytics / Telemetry
Track chain verification rate, export frequency, and investigation pivots.

#### Component IDs
- `sec.audit.table`
- `sec.audit.verify`
- `sec.audit.chart.volume`
- `sec.audit.export`

#### Dependencies / Cross-links
AI Kill-Switch; Compliance Evidence; Tenant Management.


### 61. Marketplace

#### Purpose
App and extension catalog for approved integrations, partner modules, and internal accelerators.

#### Users / Personas
Admins, IT/OT, platform owners.

#### Route / Surface Type
- **Route / Surface:** `/marketplace`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Catalog grid; category filters; detail drawer; install history; approval badges.

#### Tables
Install history table.

#### Charts / Visualizations
Category distribution; install trend.

#### Filters
Category; certification; provider; installed state.

#### Search
App name, provider, capability search.

#### Actions
Open listing; request install; install/update/remove if permitted.

#### Keyboard Shortcuts
I installs selected approved app.

#### Permissions
App operations vary by admin role and tenant policy.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI recommends apps based on current platform gaps or use patterns.

#### Backend APIs
GET /api/v1/marketplace/apps; POST /api/v1/marketplace/apps/:id/install; GET /api/v1/marketplace/history.

#### Events
marketplace.app.installed.v1; marketplace.listing.opened.v1.

#### Analytics / Telemetry
Track install requests, browse-to-install conversion, and certification filter usage.

#### Component IDs
- `market.grid`
- `market.filter.category`
- `market.install.history`
- `market.detail.drawer`

#### Dependencies / Cross-links
Tenant Management; OT Connectors.


### 62. Zone Geometry Editor

#### Purpose
Polygon and lane editor for analytics zones, hazard regions, intrusion boundaries, and permitted work overlays.

#### Users / Personas
IT/OT, CV admins, HSE collaborators.

#### Route / Surface Type
- **Route / Surface:** `/vision/cameras/:id/zones`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Camera frame canvas; polygon tools; layer list; snap/grid controls; validation rail; save bar.

#### Tables
Zone list table with zone name, type, rule binding, and last validated.

#### Charts / Visualizations
Coverage preview only.

#### Filters
Zone type; rule binding; visibility.

#### Search
Zone name and rule search.

#### Actions
Draw polygon; edit points; bind rule; validate; publish.

#### Keyboard Shortcuts
G toggles snap grid; Del deletes selected vertex.

#### Permissions
Editors only; publish may require reviewer.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests likely zone outlines and flags ambiguous or overlapping geometry.

#### Backend APIs
GET /api/v1/vision/cameras/:id/zones; POST /api/v1/vision/cameras/:id/zones; POST /api/v1/vision/cameras/:id/zones/validate.

#### Events
cv.zone.updated.v1; cv.zone.validated.v1.

#### Analytics / Telemetry
Track publish frequency, overlap errors, and AI assist acceptance.

#### Component IDs
- `vision.zone.canvas`
- `vision.zone.table`
- `vision.zone.validate`
- `vision.zone.publish`

#### Dependencies / Cross-links
Camera Fleet; Conflict Check; Twin 2D.


### 63. Homography Calibration

#### Purpose
Calibration workspace aligning camera pixels to plant coordinates for accurate overlay fusion.

#### Users / Personas
CV admins, OT engineers.

#### Route / Surface Type
- **Route / Surface:** `/vision/cameras/:id/calibration`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Frame with control points; floorplan overlay; calibration metrics; preset list; save/revert bar.

#### Tables
Calibration point table.

#### Charts / Visualizations
Residual error chart; alignment score gauge.

#### Filters
Preset; overlay visibility; error threshold.

#### Search
Preset and point label search.

#### Actions
Add point; auto-fit; save preset; publish calibration.

#### Keyboard Shortcuts
H toggles homography overlay; Shift+F runs auto-fit.

#### Permissions
Editors only; publish audited.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes point correspondences and flags drift versus historical calibrations.

#### Backend APIs
GET /api/v1/vision/cameras/:id/calibration; POST /api/v1/vision/cameras/:id/calibration/fit; POST /api/v1/vision/cameras/:id/calibration/publish.

#### Events
cv.calibration.updated.v1; cv.calibration.published.v1.

#### Analytics / Telemetry
Track residual error and time-to-calibrate.

#### Component IDs
- `vision.calib.frame`
- `vision.calib.points`
- `vision.calib.score`
- `vision.calib.publish`

#### Dependencies / Cross-links
Camera Fleet; Twin 2D.


### 64. Bias & Fairness Panel

#### Purpose
Monitoring of model performance slices, false positive disparities, and fairness evidence for computer vision analytics.

#### Users / Personas
Privacy officers, CV admins, auditors.

#### Route / Surface Type
- **Route / Surface:** `/vision/cameras/fairness`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Metric cards; demographic slice controls; drift notes; remediation recommendations.

#### Tables
Slice metric table.

#### Charts / Visualizations
Parity comparison bars; drift timeline; confusion matrix heatmap.

#### Filters
Model; analytic; demographic slice; time window.

#### Search
Model and slice search.

#### Actions
Open metric details; attach remediation note; export report.

#### Keyboard Shortcuts
Shift+E exports fairness report.

#### Permissions
Restricted governance roles only.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI highlights materially significant drift and links model card context.

#### Backend APIs
GET /api/v1/vision/fairness; GET /api/v1/vision/fairness/:modelId/report.

#### Events
cv.fairness.report.opened.v1.

#### Analytics / Telemetry
Track drift acknowledgment and report export cadence.

#### Component IDs
- `vision.fairness.cards`
- `vision.fairness.table`
- `vision.fairness.chart.parity`

#### Dependencies / Cross-links
Vision Privacy; Model Registry; Auditor Portal.


### 65. Union-Transparent Camera Map

#### Purpose
Trust-building map of camera locations, FOV cones, active analytics, and retention disclosure.

#### Users / Personas
Workforce representatives, privacy officers, HSE, auditors.

#### Route / Surface Type
- **Route / Surface:** `/vision/cameras/transparency`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Map; camera cards; FOV cone layer; disclosure panel; filter bar.

#### Tables
Camera disclosure table.

#### Charts / Visualizations
Coverage map and retention-policy summary bars.

#### Filters
Site; analytic type; retention policy; active state.

#### Search
Camera ID, zone, analytic search.

#### Actions
Open disclosure; export map; compare policy.

#### Keyboard Shortcuts
none

#### Permissions
Read-only, disclosure-safe view.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI absent except plain-language policy summarization if allowed.

#### Backend APIs
GET /api/v1/vision/transparency; GET /api/v1/vision/transparency/:cameraId.

#### Events
camera.transparency.viewed.v1.

#### Analytics / Telemetry
Track map usage and disclosure export rate.

#### Component IDs
- `vision.transparency.map`
- `vision.transparency.table`
- `vision.transparency.disclosure`

#### Dependencies / Cross-links
Camera Fleet; Vision Privacy.


### 66. Tag-to-Entity Resolver

#### Purpose
Semantic mapping surface linking raw OT tags to knowledge graph entities, units, and canonical signals.

#### Users / Personas
IT/OT, data engineers.

#### Route / Surface Type
- **Route / Surface:** `/ot/connectors/:id/resolve`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Candidate list; mapping editor; preview values; confidence chips; batch actions; validation rail.

#### Tables
Tag mapping table with raw tag, suggested entity, signal class, confidence, status.

#### Charts / Visualizations
Confidence distribution; unmapped count trend.

#### Filters
Status; confidence; entity type; unit system.

#### Search
Tag and entity search.

#### Actions
Accept suggestion; bulk map; mark ignored; validate.

#### Keyboard Shortcuts
Shift+A accepts selected suggestion.

#### Permissions
Write access limited to OT/data roles.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI is heavily used to suggest entity mappings and normalize naming.

#### Backend APIs
GET /api/v1/ot/connectors/:id/mappings; POST /api/v1/ot/connectors/:id/mappings; POST /api/v1/ot/connectors/:id/mappings/validate.

#### Events
ot.mapping.accepted.v1; ot.mapping.validated.v1.

#### Analytics / Telemetry
Track suggestion acceptance and validation failure rate.

#### Component IDs
- `ot.resolve.table`
- `ot.resolve.confidence`
- `ot.resolve.validate`
- `ot.resolve.bulkAccept`

#### Dependencies / Cross-links
OT Connectors; Knowledge Browse.


### 67. Historian Backfill

#### Purpose
Controlled historical ingestion flow for reprocessing RCA, model training, or data completeness remediation.

#### Users / Personas
IT/OT, data engineers, ML platform.

#### Route / Surface Type
- **Route / Surface:** `/ot/connectors/:id/backfill`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Date-range selector; source preview; cost/volume estimate; run queue; audit note.

#### Tables
Run queue table.

#### Charts / Visualizations
Backfill progress bars; volume estimate chart.

#### Filters
Source; date range; priority; run state.

#### Search
Run ID and source search.

#### Actions
Create backfill; pause; cancel; promote priority.

#### Keyboard Shortcuts
Shift+B starts backfill draft.

#### Permissions
Platform roles only; large jobs may need approval.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI estimates downstream impact and recommends partition sizes.

#### Backend APIs
POST /api/v1/ot/connectors/:id/backfill; GET /api/v1/ot/connectors/:id/backfill/runs.

#### Events
ot.backfill.started.v1; ot.backfill.completed.v1.

#### Analytics / Telemetry
Track backlog age and run success rate.

#### Component IDs
- `ot.backfill.form`
- `ot.backfill.table.runs`
- `ot.backfill.chart.volume`

#### Dependencies / Cross-links
OT Connectors; Data Lakehouse.


### 68. SCADA Simulator

#### Purpose
What-if simulation surface for leaks, alarm floods, and training scenarios using synthetic or replayed process signals.

#### Users / Personas
OT engineers, trainers, advanced admins.

#### Route / Surface Type
- **Route / Surface:** `/ot/connectors/simulator`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Scenario canvas; signal editors; playback controls; impact preview; save scenario dialog.

#### Tables
Scenario parameter table.

#### Charts / Visualizations
Synthetic trend chart; alarm response chart; impact summary.

#### Filters
Scenario type; unit; signal family; save state.

#### Search
Scenario name and signal search.

#### Actions
Run simulation; save template; publish to drill mode; export.

#### Keyboard Shortcuts
Space play/pause; Shift+S saves template.

#### Permissions
Restricted to engineering/training roles; cannot affect live plant controls.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests parameter ranges and likely incident classes for training realism.

#### Backend APIs
POST /api/v1/ot/simulator/run; GET /api/v1/ot/simulator/templates; POST /api/v1/ot/simulator/templates.

#### Events
sim.run.started.v1; sim.template.saved.v1.

#### Analytics / Telemetry
Track template reuse and drill mode adoption.

#### Component IDs
- `sim.canvas`
- `sim.params.table`
- `sim.chart.output`
- `sim.action.run`

#### Dependencies / Cross-links
Diagnostics; Drill mode surfaces.


### 69. Ontology Editor

#### Purpose
Governed editor for entity classes, relationships, constraints, and controlled vocabularies backing the knowledge graph.

#### Users / Personas
Knowledge engineers, platform architects.

#### Route / Surface Type
- **Route / Surface:** `/knowledge/browse/ontology`
- **Surface Type:** page
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Schema tree; relationship editor; constraint panel; diff viewer; publish checklist.

#### Tables
Class/relationship table.

#### Charts / Visualizations
Ontology graph preview; impact summary bars.

#### Filters
Draft state; entity class; relationship type.

#### Search
Class, relation, vocabulary term search.

#### Actions
Add class; edit relation; deprecate term; validate; publish.

#### Keyboard Shortcuts
Shift+P publishes after validation.

#### Permissions
Knowledge-platform roles only; publish may require reviewer.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI proposes synonyms, relation candidates, and impact summaries.

#### Backend APIs
GET /api/v1/knowledge/ontology; POST /api/v1/knowledge/ontology/draft; POST /api/v1/knowledge/ontology/publish.

#### Events
kg.ontology.validated.v1; kg.ontology.published.v1.

#### Analytics / Telemetry
Track diff size, validation failures, and publish cadence.

#### Component IDs
- `ontology.tree`
- `ontology.table.relations`
- `ontology.diff`
- `ontology.publish`

#### Dependencies / Cross-links
Knowledge Graph Explorer; Data Contracts.


### 70. Bulk Entity Importer

#### Purpose
Template-driven import flow for assets, workers, sensors, and reference vocabularies into the knowledge graph.

#### Users / Personas
Deployment teams, data engineers.

#### Route / Surface Type
- **Route / Surface:** `/knowledge/browse/import`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Upload step; schema mapping; validation errors; dedupe preview; import queue.

#### Tables
Validation error table; preview row table.

#### Charts / Visualizations
Import progress bars; error category chart.

#### Filters
Entity type; validation status; duplicate state.

#### Search
Row, external ID, entity name search.

#### Actions
Upload file; map columns; accept dedupe; import; rollback recent import.

#### Keyboard Shortcuts
U uploads file; I starts validated import.

#### Permissions
Deployment roles only.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests column mappings and deduplication matches.

#### Backend APIs
POST /api/v1/knowledge/imports; POST /api/v1/knowledge/imports/:id/map; POST /api/v1/knowledge/imports/:id/commit.

#### Events
kg.import.created.v1; kg.import.completed.v1.

#### Analytics / Telemetry
Track import validation pass rate and rollback frequency.

#### Component IDs
- `kg.import.upload`
- `kg.import.map`
- `kg.import.errors`
- `kg.import.commit`

#### Dependencies / Cross-links
Knowledge Graph Explorer; Tag Resolver.


### 71. Risk Pattern Registry & Authoring

#### Purpose
Library and authoring studio for compound-risk patterns, DSL rules, NL-assisted pattern creation, and version history.

#### Users / Personas
Risk engineers, HSE, advanced supervisors.

#### Route / Surface Type
- **Route / Surface:** `/risk/patterns · /risk/patterns/new`
- **Surface Type:** page family
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Pattern list; editor canvas; rule text; simulation preview; version history; publish workflow.

#### Tables
Pattern table; simulation result table; version history table.

#### Charts / Visualizations
Pattern effectiveness bars; false-positive trend; lead-time comparison.

#### Filters
Pattern family; status; version; confidence.

#### Search
Pattern ID, phrase, linked hazard search.

#### Actions
Create pattern; simulate; publish; retire; clone version.

#### Keyboard Shortcuts
Shift+N new pattern; Shift+P publish validated pattern.

#### Permissions
Authoring restricted to approved roles; publish may require reviewer.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI converts natural language to candidate pattern logic and explains each predicate.

#### Backend APIs
GET /api/v1/risk/patterns; POST /api/v1/risk/patterns; POST /api/v1/risk/patterns/:id/simulate.

#### Events
risk.pattern.created.v1; risk.pattern.published.v1.

#### Analytics / Telemetry
Track pattern precision, false positives, and simulation-before-publish rate.

#### Component IDs
- `risk.pattern.table`
- `risk.pattern.editor`
- `risk.pattern.simulate`
- `risk.pattern.publish`

#### Dependencies / Cross-links
Compound Risk Heatmap; Shadow Mode.


### 72. Risk Shadow Mode Dashboard

#### Purpose
Evaluation dashboard for unpublished patterns or models against historical/live streams without operational action.

#### Users / Personas
Risk engineers, HSE, data scientists.

#### Route / Surface Type
- **Route / Surface:** `/risk/shadow-mode`
- **Surface Type:** page
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Candidate selector; side-by-side live vs shadow feed; precision notes; promotion CTA.

#### Tables
Candidate episode table.

#### Charts / Visualizations
Lead-time comparison; precision/recall summary; false-positive trend.

#### Filters
Candidate; site; time range; confidence.

#### Search
Pattern, episode, and stream search.

#### Actions
Promote candidate; export report; compare with production.

#### Keyboard Shortcuts
Shift+P promotes selected candidate after approval.

#### Permissions
Promotion rights restricted; dashboard otherwise read-mostly.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes trade-offs and recommended thresholds before promotion.

#### Backend APIs
GET /api/v1/risk/shadow-mode; POST /api/v1/risk/shadow-mode/:id/promote.

#### Events
risk.shadow.promoted.v1.

#### Analytics / Telemetry
Track evaluation length and promotion success.

#### Component IDs
- `risk.shadow.compare`
- `risk.shadow.table.episodes`
- `risk.shadow.chart.precision`

#### Dependencies / Cross-links
Pattern Registry; Compound Risk Heatmap.


### 73. Permit Library & Analytics

#### Purpose
Template management and performance analytics for permit types, approvals, suspensions, and incident correlation.

#### Users / Personas
HSE, permit owners, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/permits/library · /permits/analytics`
- **Surface Type:** page family
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Template list; template editor drawer; KPI cards; trend tabs; benchmark panel.

#### Tables
Template table; approval performance table.

#### Charts / Visualizations
Approval SLA trend; suspension trend; incident-correlation chart.

#### Filters
Permit type; site; date range; template status.

#### Search
Template name, permit ID, contractor search.

#### Actions
Edit template; duplicate; retire; export analytics.

#### Keyboard Shortcuts
Shift+T new template.

#### Permissions
Template edits restricted to authorized permit admins.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests missing controls in templates and anomalous approval bottlenecks.

#### Backend APIs
GET /api/v1/permits/templates; PATCH /api/v1/permits/templates/:id; GET /api/v1/permits/analytics.

#### Events
permit.template.updated.v1; permit.analytics.viewed.v1.

#### Analytics / Telemetry
Track template reuse, analytics exports, and SLA improvement.

#### Component IDs
- `permits.lib.table`
- `permits.analytics.chart.sla`
- `permits.template.edit`

#### Dependencies / Cross-links
Permit Register; Permit Detail.


### 74. Isolation Registry, Guided Sequence & Group Lockout

#### Purpose
Detailed LOTO specialist surfaces for isolation-point inventory, stepwise sequencing, and group lock management.

#### Users / Personas
Operators, maintenance, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/loto/registry · /loto/isolations/:id/sequence · /loto/groups/:id`
- **Surface Type:** page family
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Registry table; sequence stepper; group roster; zero-energy snapshot; release gate.

#### Tables
Isolation point table; sequence steps table; group roster table.

#### Charts / Visualizations
Sequence progress ring; energy source distribution; overdue lock timeline.

#### Filters
Energy type; sequence step; group state.

#### Search
Isolation point, tag, worker search.

#### Actions
Add point; proceed step; add/remove participant; release group.

#### Keyboard Shortcuts
Shift+Right advances sequence step.

#### Permissions
Strict step gating and witness policies apply.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI warns when steps are skipped or evidence is inconsistent with release criteria.

#### Backend APIs
GET /api/v1/loto/registry; GET /api/v1/loto/:id/sequence; POST /api/v1/loto/groups/:id/participants.

#### Events
loto.sequence.advanced.v1; loto.group.updated.v1.

#### Analytics / Telemetry
Track sequence deviation and group-lock dwell time.

#### Component IDs
- `loto.registry.table`
- `loto.sequence.stepper`
- `loto.group.roster`

#### Dependencies / Cross-links
LOTO Board; Zero-Energy Verification.


### 75. Handover Packet & Comprehension Quiz

#### Purpose
Detailed handover packet with AI summary, risk carryover, mandatory read receipts, and comprehension verification for incoming shifts.

#### Users / Personas
Outgoing/incoming shift leads, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/handover/:id · /handover/:id/quiz`
- **Surface Type:** page family
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Packet summary; open issue blocks; permit/alarm embeds; read receipt; quiz stepper; sign-off footer.

#### Tables
Embedded issue tables; quiz results table.

#### Charts / Visualizations
Risk carryover score; fatigue indicator; completion progress.

#### Filters
Topic; issue severity; quiz status.

#### Search
Issue ID and packet note search.

#### Actions
Acknowledge packet; answer quiz; sign handover; reopen issue.

#### Keyboard Shortcuts
Shift+Q jumps to quiz.

#### Permissions
Only shift participants and supervisors can sign; quiz required for designated roles.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI drafts packet and adaptive quiz questions from live context.

#### Backend APIs
GET /api/v1/handover/:id; POST /api/v1/handover/:id/ack; POST /api/v1/handover/:id/quiz/submit.

#### Events
handover.quiz.completed.v1; handover.signed.v1.

#### Analytics / Telemetry
Track quiz pass rate and sign-off latency.

#### Component IDs
- `handover.packet.summary`
- `handover.packet.quiz`
- `handover.packet.sign`

#### Dependencies / Cross-links
Handover Queue; Predictive Hub.


### 76. Incident Report, Timeline & CAPA Workspace

#### Purpose
Specialist incident surfaces for structured reporting, timeline reconstruction, and corrective/preventive action management.

#### Users / Personas
All reporters; HSE; safety officers; managers.

#### Route / Surface Type
- **Route / Surface:** `/incidents/new · /incidents/:id/timeline · /incidents/:id/capa`
- **Surface Type:** page family
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Report form; timeline canvas; witness panel; CAPA board; effectiveness verification strip.

#### Tables
Witness table; event table; CAPA table/kanban.

#### Charts / Visualizations
Timeline reconstruction; cause Sankey; CAPA effectiveness trend.

#### Filters
Incident state; witness status; CAPA owner; effectiveness state.

#### Search
Incident, witness, CAPA, asset search.

#### Actions
Submit report; add witness; create CAPA; verify effectiveness; close action.

#### Keyboard Shortcuts
Shift+W adds witness; Shift+K opens CAPA board.

#### Permissions
Sensitive reports may hide personal details; CAPA closure may require approval.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI drafts incident narratives, marks turning points, and suggests CAPA from RCA findings.

#### Backend APIs
POST /api/v1/incidents; GET /api/v1/incidents/:id/timeline; POST /api/v1/incidents/:id/capa/:cid/verify.

#### Events
incident.timeline.opened.v1; capa.effectiveness.verified.v1.

#### Analytics / Telemetry
Track report completion, witness turnaround, and CAPA effectiveness closure time.

#### Component IDs
- `incident.report.form`
- `incident.timeline.canvas`
- `incident.capa.board`
- `incident.capa.verify`

#### Dependencies / Cross-links
Incident Register; RCA Workspace; Twin Replay.


### 77. Model Registry, Contracts, Labeling & EU AI Act Pack

#### Purpose
MLOps control-plane surfaces for model versions, model cards, data contracts, labeling workflows, and compliance documentation.

#### Users / Personas
ML platform, data scientists, auditors, privacy and compliance leads.

#### Route / Surface Type
- **Route / Surface:** `/data/lakehouse/models · /data/lakehouse/contracts · /data/lakehouse/labeling · /data/lakehouse/models/:id/compliance`
- **Surface Type:** page family
- **Layout Family:** admin

#### Layout
`layout.admin` with split rail, list/detail or configuration editor, policy side notes, and immutable activity drawer.

#### Visual Hierarchy
Premium admin surfaces avoid dense legacy forms; use clear sections, code-aware typography, and refined card stacks.

#### Components
Registry table; model card; contract browser; labeling queue; active-learning review; compliance generator.

#### Tables
Model table; contract table; labeling task table.

#### Charts / Visualizations
Model performance trend; data drift chart; labeling throughput; compliance completeness gauge.

#### Filters
Model family; status; contract domain; task state; compliance state.

#### Search
Model ID, contract name, dataset, label task search.

#### Actions
Promote model; freeze version; subscribe to contract; accept labels; generate Annex IV packet.

#### Keyboard Shortcuts
Shift+G generates compliance pack.

#### Permissions
Platform/governance roles only; promotion may require approval and fairness checks.

#### States
##### Empty States
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains setup requirements. Loading uses editor/table skeletons. Errors provide safe rollback and audit references. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Admin tasks are tablet-capable but most destructive actions remain desktop-preferred with read-only mobile fallback.

#### Accessibility Notes
Form labels, code editor narration, keyboard shortcuts, and dual-approval dialogs must be accessible. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Config saves show brief success morphs; drawer transitions 160-200ms; no ornamental animation. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes drift, suggests labeling priorities, and drafts model card prose from metrics.

#### Backend APIs
GET /api/v1/models; GET /api/v1/contracts; GET /api/v1/labeling/tasks; POST /api/v1/models/:id/compliance/generate.

#### Events
model.promoted.v1; contract.subscribed.v1; labeling.task.accepted.v1.

#### Analytics / Telemetry
Track model promotion safety, label throughput, and compliance packet generation time.

#### Component IDs
- `ml.models.table`
- `ml.contracts.table`
- `ml.labels.queue`
- `ml.compliance.generate`

#### Dependencies / Cross-links
Data Lakehouse; Fairness Panel; Auditor Portal.


### 78. Policy Editor & Approval Workflow Builder

#### Purpose
Shared substrate builder for OPA/Rego policies, approval ladders, escalation logic, and capability enforcement.

#### Users / Personas
Platform admins, security, workflow architects, HSE policy owners.

#### Route / Surface Type
- **Route / Surface:** `/workflows/temporal/policies · /workflows/temporal/approvals`
- **Surface Type:** page family
- **Layout Family:** builder

#### Layout
Builder/editor workspace with canvas or structured editor center, validation rail, version history access, and simulation/output pane.

#### Visual Hierarchy
Low-chrome tooling with precise grids, monospace where technical, and premium editor ergonomics.

#### Components
Policy list; code/editor pane; visual approval ladder; test simulator; diff viewer; publish checklist.

#### Tables
Policy table; approval matrix table; test result table.

#### Charts / Visualizations
Approval path graph; policy evaluation stats; denial trend.

#### Filters
Policy family; environment; publish state; capability token.

#### Search
Policy name, rule key, approver group search.

#### Actions
Edit policy; simulate decision; publish; rollback; clone approval chain.

#### Keyboard Shortcuts
Shift+T runs simulation; Shift+P publishes validated bundle.

#### Permissions
Policy publish restricted to delegated admins; rollback audited.

#### States
##### Empty States
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty offers templates. Loading preserves editor layout. Errors annotate invalid nodes, fields, or policies inline. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Read-only or approval-only on mobile unless explicitly field-safe.

#### Accessibility Notes
Keyboard-driven editing, alternative table views for graphs/canvases, and accessible validation summaries are mandatory. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Node, layer, and panel transitions are purposeful and brief. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI explains policy diffs, suggests test cases, and translates natural language requirements into drafts.

#### Backend APIs
GET /api/v1/policies; POST /api/v1/policies/simulate; POST /api/v1/policies/publish; GET /api/v1/approvals.

#### Events
policy.bundle.published.v1; approval.workflow.updated.v1.

#### Analytics / Telemetry
Track simulation-before-publish rate and policy rollback frequency.

#### Component IDs
- `policy.table`
- `policy.editor`
- `policy.sim.results`
- `approval.builder.graph`

#### Dependencies / Cross-links
Workflow Visualizer; Notification Rules; Decision Inbox.


### 79. Observability Stack

#### Purpose
Unified observability surfaces for SLOs, edge fleet health, AI cost, and public/tenant-visible availability.

#### Users / Personas
SRE, platform ops, admins, some tenants for status page.

#### Route / Surface Type
- **Route / Surface:** `/observability/slos · /observability/edge · /observability/ai-cost · /status`
- **Surface Type:** page family
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
SLO cards; error budget trend; edge fleet map; AI cost panels; public status banner/editor.

#### Tables
SLO table; edge node table; model cost table; incident history table.

#### Charts / Visualizations
Burn-down charts; fleet health heatmap; cost waterfall; uptime trend.

#### Filters
Service; tenant; environment; fleet health; incident state; cost center.

#### Search
Service name, node ID, model ID, incident ID search.

#### Actions
Open incident; create maintenance task; export cost report; publish status update.

#### Keyboard Shortcuts
Shift+I creates status incident; Shift+E exports cost report.

#### Permissions
Status page partially public/read-only; other surfaces restricted to ops roles.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes outages, correlates noisy edge failures, and highlights cost anomalies.

#### Backend APIs
GET /api/v1/observability/slos; GET /api/v1/observability/edge; GET /api/v1/observability/ai-cost; GET /api/v1/status.

#### Events
slo.budget.burned.v1; edge.health.degraded.v1; ai.cost.threshold.exceeded.v1; status.incident.published.v1.

#### Analytics / Telemetry
Track burn-rate response, silent-failure detection, and cost optimization actions.

#### Component IDs
- `obs.slo.table`
- `obs.edge.map`
- `obs.aiCost.waterfall`
- `status.incident.feed`

#### Dependencies / Cross-links
Workflow Visualizer; AI Kill-Switch; Camera Fleet.


### 80. Auditor Portal & PII Discovery

#### Purpose
Governance portal for audit-ready posture, face-blur KPIs, camera hardening, privacy risk, and signed compliance exports.

#### Users / Personas
Auditors, CISO, privacy/compliance leads.

#### Route / Surface Type
- **Route / Surface:** `/compliance/auditor · /security/privacy`
- **Surface Type:** page family
- **Layout Family:** analytics

#### Layout
`layout.analytics` with filter rail, KPI strip, tabbed analytic content, and optional comparison side panel.

#### Visual Hierarchy
Storytelling dashboards with animated KPIs, low-glare chart containers, and executive-grade summary cards.

#### Components
Audit status hero; blur KPI cards; hardening checklist; PII findings list; export center.

#### Tables
Finding table; signed report table; privacy exception table.

#### Charts / Visualizations
Blur KPI trend; hardening coverage; PII finding severity bars.

#### Filters
Finding state; site; control domain; privacy risk.

#### Search
Finding ID, camera, dataset, report search.

#### Actions
Open finding; assign owner; export signed report; approve privacy exception.

#### Keyboard Shortcuts
Shift+R exports signed report.

#### Permissions
Governance roles only.

#### States
##### Empty States
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty encourages scope or filter changes. Loading uses chart skeletons and counter placeholders. Errors fall back to last successful query and explain stale data. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Charts become stacked cards; filters move into sheets; tables collapse to card lists with sticky summary metrics.

#### Accessibility Notes
Charts require text summaries, keyboard legend access, and color-independent meaning. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Chart transitions 180-240ms; KPI count-up restrained; reduced motion uses instant value swaps. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI summarizes notable control gaps and suggests next review order.

#### Backend APIs
GET /api/v1/auditor/portal; GET /api/v1/privacy/findings; POST /api/v1/auditor/reports/export.

#### Events
auditor.report.exported.v1; privacy.finding.opened.v1.

#### Analytics / Telemetry
Track control closure and audit packet creation time.

#### Component IDs
- `audit.portal.hero`
- `audit.findings.table`
- `audit.chart.blur`
- `privacy.exceptions.table`

#### Dependencies / Cross-links
Vision Privacy; Fairness Panel; Model Compliance Pack.


### 81. Site Onboarding Wizard

#### Purpose
Guided provisioning flow for bringing a new site online, including scope, assets, connectors, permissions, and validation.

#### Users / Personas
Super-admins, deployment teams, OT/data platform.

#### Route / Surface Type
- **Route / Surface:** `/admin/sites/new`
- **Surface Type:** page
- **Layout Family:** workflow

#### Layout
`layout.workflow` with left progression/timeline pane, main form/evidence pane, sticky action bar, and contextual right sheet for related objects.

#### Visual Hierarchy
Spacious enterprise workflow with crisp forms, low-border containment, semantic badges, and premium step transitions.

#### Components
Stepper; prerequisite checklist; site metadata; connector setup embeds; validation summary; finish panel.

#### Tables
Validation issue table.

#### Charts / Visualizations
Progress ring; readiness checklist summary.

#### Filters
Step; validation status; region.

#### Search
Site name, connector name, asset import search.

#### Actions
Save step; validate; invite stakeholders; finish onboarding.

#### Keyboard Shortcuts
Shift+V validates current step.

#### Permissions
Restricted to deployment/admin roles.

#### States
##### Empty States
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains prerequisites. Loading skeletons preserve form geometry. Errors anchor to invalid fields and show workflow-safe retry semantics. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Converted to stepper or bottom-sheet subflows with persistent primary action and offline-safe draft persistence where needed.

#### Accessibility Notes
Keyboard traversal across steps, error summaries, sign-off accessibility, and focus restoration after modal close are required. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Step transitions 180-220ms; sticky action bar reacts with subtle color/height changes; no distracting springs. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI recommends required modules, connector pack, and missing prerequisites based on site profile.

#### Backend APIs
POST /api/v1/admin/sites; POST /api/v1/admin/sites/:id/validate; POST /api/v1/admin/sites/:id/invite.

#### Events
site.onboarding.started.v1; site.onboarding.completed.v1.

#### Analytics / Telemetry
Track onboarding duration and validation failure categories.

#### Component IDs
- `site.onboard.stepper`
- `site.onboard.validate`
- `site.onboard.summary`

#### Dependencies / Cross-links
Tenant Management; OT Connectors; Knowledge Import.


### 82. Mobile Field Home

#### Purpose
Field landing surface showing today’s permits, active alerts, LOTO tasks, and one-tap actions.

#### Users / Personas
Field operators, contractors, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/mobile`
- **Surface Type:** page
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Today cards; alert banner; permit list; LOTO list; voice and scan quick actions; SOS FAB.

#### Tables
Task card-list instead of dense table.

#### Charts / Visualizations
none

#### Filters
Task type; urgency; assignment.

#### Search
Assigned task and permit search.

#### Actions
Open task; start report; scan asset; voice query; trigger SOS.

#### Keyboard Shortcuts
Swipe right marks task reviewed.

#### Permissions
Assignment-based visibility with offline cache.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests priority task order and summarizes current shift hazards.

#### Backend APIs
GET /api/v1/mobile/home; GET /api/v1/mobile/tasks.

#### Events
mobile.home.loaded.v1; mobile.task.opened.v1.

#### Analytics / Telemetry
Track task completion from home and scan launch rate.

#### Component IDs
- `m.home.cards`
- `m.home.list.tasks`
- `m.home.fab.sos`

#### Dependencies / Cross-links
Mobile Shell; Mobile Report; Mobile Sync.


### 83. Mobile Hazard Report

#### Purpose
Rapid capture of hazards, near misses, and observations using camera, voice, text, and location.

#### Users / Personas
Field workers, contractors, supervisors.

#### Route / Surface Type
- **Route / Surface:** `/mobile/report`
- **Surface Type:** page
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Capture stepper; photo strip; voice transcript; location chip; severity selector; submit footer.

#### Tables
Attachment list only.

#### Charts / Visualizations
none

#### Filters
Severity; category; location autofill.

#### Search
Existing asset/location lookup.

#### Actions
Capture photo; dictate note; scan asset; submit report; save offline draft.

#### Keyboard Shortcuts
Long-press mic to dictate.

#### Permissions
Broad create permission; attachments may be delayed until sync resumes.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI transcribes voice, suggests category/severity, and drafts concise narrative.

#### Backend APIs
POST /api/v1/mobile/reports; POST /api/v1/mobile/reports/:id/attachments.

#### Events
mobile.report.submitted.v1; mobile.report.drafted_offline.v1.

#### Analytics / Telemetry
Track time-to-submit, voice usage, and offline draft rate.

#### Component IDs
- `m.report.capture`
- `m.report.voice`
- `m.report.submit`
- `m.report.attachments`

#### Dependencies / Cross-links
Incident Register; Mobile Sync.


### 84. Mobile SOS

#### Purpose
Guarded emergency initiation flow optimized for one-handed operation and panic conditions.

#### Users / Personas
Any authenticated field user permitted to raise SOS.

#### Route / Surface Type
- **Route / Surface:** `/mobile/sos`
- **Surface Type:** page
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Large emergency selector; location lock; countdown/hold control; confirm state; support text.

#### Tables
none

#### Charts / Visualizations
none

#### Filters
Emergency type only.

#### Search
none

#### Actions
Hold to trigger; cancel within grace period; attach quick note.

#### Keyboard Shortcuts
Press-and-hold required; hardware button mapping optional.

#### Permissions
Available by policy; false-alarm handling audited.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI absent during trigger; post-trigger it can help summarize context.

#### Backend APIs
POST /api/v1/mobile/sos; POST /api/v1/mobile/sos/:id/cancel.

#### Events
mobile.sos.triggered.v1; mobile.sos.canceled.v1.

#### Analytics / Telemetry
Track trigger latency, cancellations, and downstream response time.

#### Component IDs
- `m.sos.hold`
- `m.sos.type`
- `m.sos.confirm`

#### Dependencies / Cross-links
Emergency Declare; Active Command Surface.


### 85. Mobile Passport

#### Purpose
Portable worker credential and readiness view for entry, induction, and supervisor spot-checks.

#### Users / Personas
Workers self-view; gate/check-in staff.

#### Route / Surface Type
- **Route / Surface:** `/mobile/passport`
- **Surface Type:** page
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Digital card; expiry chips; training list; QR/NFC presentation; site-readiness summary.

#### Tables
Certification card-list.

#### Charts / Visualizations
Expiry timeline mini chart.

#### Filters
Site; expiry window; certification type.

#### Search
Certificate title search.

#### Actions
Present QR; open details; request renewal.

#### Keyboard Shortcuts
none

#### Permissions
Self-view primarily; staff may view during verified check process.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI suggests next renewal and plain-language readiness explanation.

#### Backend APIs
GET /api/v1/mobile/passport; GET /api/v1/workforce/passports/:id.

#### Events
mobile.passport.opened.v1.

#### Analytics / Telemetry
Track gate-use frequency and renewal clicks.

#### Component IDs
- `m.passport.card`
- `m.passport.qr`
- `m.passport.certs`

#### Dependencies / Cross-links
Safety Passport; Onboarding Kiosk.


### 86. Mobile Sync Queue

#### Purpose
Offline-first queue for drafts, photos, scans, signatures, and failed submissions awaiting sync.

#### Users / Personas
Field users and support staff.

#### Route / Surface Type
- **Route / Surface:** `/mobile/sync`
- **Surface Type:** page
- **Layout Family:** mobile

#### Layout
`layout.mobile` with bottom navigation or large primary actions, safe-area padding, glove-mode targets, and offline queue affordances.

#### Visual Hierarchy
Condensed but premium field UX with bold state chips, roomy spacing, and minimal text entry where voice or scanning can be used.

#### Components
Queue list; item detail sheet; retry controls; conflict resolution card; connection banner.

#### Tables
Queue item list.

#### Charts / Visualizations
Sync progress bars; failure-category bars.

#### Filters
State; content type; age; conflict.

#### Search
Queue item ID and object ID search.

#### Actions
Retry; discard draft; resolve conflict; view payload summary.

#### Keyboard Shortcuts
R retries selected item.

#### Permissions
User can only inspect own offline payloads unless support mode is explicitly enabled.

#### States
##### Empty States
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Loading
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

##### Errors
Empty explains no assigned work. Loading is lightweight and resilient under poor networks. Errors emphasize offline recovery and safe retry. All states must preserve scope context, expose last-updated timestamps when data is stale, and support localization expansion of at least 30%.

#### Responsive / Mobile Behavior
Primary target device family; tablet expands into split lists and map previews.

#### Accessibility Notes
44px minimum targets, high-contrast text, haptics paired with visual feedback, and voice alternatives for text-heavy tasks. Follow WCAG 2.2 AA globally and AAA for safety-critical screens; support keyboard-only operation, visible focus, screen-reader labels, and reduced-motion.

#### Motion / Micro-interactions
Short sheet slides and swipe confirmations; emergency actions avoid accidental activation and fancy motion. Use Framer Motion or Motion for 120-240ms transitions, avoid heavy shadows, respect `prefers-reduced-motion`, and reserve looping motion for AI orb, live status, or catastrophic alerts only.

#### AI Interactions
AI can summarize conflict reasons and suggest the safest merge choice.

#### Backend APIs
GET /api/v1/mobile/sync; POST /api/v1/mobile/sync/:id/retry; POST /api/v1/mobile/sync/:id/resolve.

#### Events
mobile.sync.retry.v1; mobile.sync.resolved.v1.

#### Analytics / Telemetry
Track offline dwell time, retry success, and conflict incidence.

#### Component IDs
- `m.sync.queue`
- `m.sync.retry`
- `m.sync.progress`
- `m.sync.conflict`

#### Dependencies / Cross-links
Mobile Shell; Mobile Report; Field Home.

## 6. Coverage Matrix

### 6.1 Canonical IA Routes
| Route | Covered By |
|---|---|
| `/` | Topbar & Scope Selector, Left Rail & Persona Tabs, Right Context Panel, Command Palette, Global Search, Notification Center, Halo Orb & AI Dock, Related Modules Rail & Object Peek, Decision Inbox, Split View Workspace, Wall Display Shell, Mobile Shell, Sign-in, MFA Challenge, Onboarding Kiosk, Persona-Adaptive Home, User Profile & Preferences, Command Console L1, Scoped Site / Area / Unit Console, Asset Detail Console, Diagnostics Workspace, Executive Portfolio Console, Digital Twin 2D, Digital Twin 3D, Twin Replay, Plume Simulation, Live Alarm List, Alarm Flood Detector, Compound Risk Heatmap, Emergency Declare, Emergency Active Command Surface, Emergency Muster Status, Permit Register, Permit Draft, Permit Detail, Permit Risk Assessment, Permit Conflict Check, LOTO Board, Zero-Energy Verification, Shift Handover Queue, Incident Register, RCA Workspace, Predictive Hub, Camera Fleet, Vision Privacy Controls, OT Connectors, Knowledge Graph Explorer, Copilot Workspace, AI Kill-Switch, Worker Telemetry Detail, Safety Passport, Compliance Evidence Explorer, Notification Routing Rules, Data Lakehouse, Workflow Visualizer, Tenant Management, Security Audit Log, Marketplace, Zone Geometry Editor, Homography Calibration, Bias & Fairness Panel, Union-Transparent Camera Map, Tag-to-Entity Resolver, Historian Backfill, SCADA Simulator, Ontology Editor, Bulk Entity Importer, Risk Pattern Registry & Authoring, Risk Shadow Mode Dashboard, Permit Library & Analytics, Isolation Registry, Guided Sequence & Group Lockout, Handover Packet & Comprehension Quiz, Incident Report, Timeline & CAPA Workspace, Model Registry, Contracts, Labeling & EU AI Act Pack, Policy Editor & Approval Workflow Builder, Observability Stack, Auditor Portal & PII Discovery, Site Onboarding Wizard, Mobile Field Home, Mobile Hazard Report, Mobile SOS, Mobile Passport, Mobile Sync Queue |
| `/home` | Persona-Adaptive Home |
| `/search` | Command Palette, Global Search |
| `/me` | User Profile & Preferences |
| `/auth/signin` | Sign-in |
| `/auth/mfa` | MFA Challenge |
| `/auth/kiosk` | Onboarding Kiosk |
| `/console` | Wall Display Shell, Command Console L1, Scoped Site / Area / Unit Console, Asset Detail Console, Diagnostics Workspace, Executive Portfolio Console |
| `/console/site/:id` | Scoped Site / Area / Unit Console |
| `/console/area/:id` | Scoped Site / Area / Unit Console |
| `/console/unit/:id` | Scoped Site / Area / Unit Console |
| `/console/asset/:id` | Asset Detail Console |
| `/console/diagnostics/:id` | Diagnostics Workspace |
| `/console/portfolio` | Executive Portfolio Console |
| `/console/wall` | Wall Display Shell |
| `/twin` | Digital Twin 2D, Digital Twin 3D, Twin Replay, Plume Simulation |
| `/twin/3d` | Digital Twin 3D |
| `/twin/replay` | Twin Replay |
| `/twin/plume/:id` | Plume Simulation |
| `/alarms` | Live Alarm List, Alarm Flood Detector |
| `/alarms/floods` | Alarm Flood Detector |
| `/risk` | Compound Risk Heatmap, Permit Risk Assessment, Risk Pattern Registry & Authoring, Risk Shadow Mode Dashboard |
| `/emergency/declare` | Emergency Declare |
| `/emergency/active/:id` | Emergency Active Command Surface |
| `/emergency/muster` | Emergency Muster Status |
| `/permits` | Permit Register, Permit Draft, Permit Detail, Permit Risk Assessment, Permit Conflict Check, Permit Library & Analytics |
| `/permits/new` | Permit Draft |
| `/permits/:id` | Permit Detail, Permit Risk Assessment, Permit Conflict Check |
| `/permits/:id/risk-assessment` | Permit Risk Assessment |
| `/permits/:id/conflict-check` | Permit Conflict Check |
| `/loto` | LOTO Board, Zero-Energy Verification, Isolation Registry, Guided Sequence & Group Lockout |
| `/loto/isolations/:id/verification` | Zero-Energy Verification |
| `/handover` | Shift Handover Queue, Handover Packet & Comprehension Quiz |
| `/incidents` | Incident Register, RCA Workspace, Incident Report, Timeline & CAPA Workspace |
| `/incidents/:id/rca` | RCA Workspace |
| `/predictive` | Predictive Hub |
| `/vision/cameras` | Camera Fleet, Zone Geometry Editor, Homography Calibration, Bias & Fairness Panel, Union-Transparent Camera Map |
| `/vision/privacy` | Vision Privacy Controls |
| `/ot/connectors` | OT Connectors, Tag-to-Entity Resolver, Historian Backfill, SCADA Simulator |
| `/knowledge/browse` | Knowledge Graph Explorer, Ontology Editor, Bulk Entity Importer |
| `/copilot` | Copilot Workspace, AI Kill-Switch |
| `/copilot/agents/kill-switch` | AI Kill-Switch |
| `/iot/telemetry/:id` | Worker Telemetry Detail |
| `/workforce/passport` | Safety Passport |
| `/compliance/evidence` | Compliance Evidence Explorer |
| `/notifications/rules` | Notification Routing Rules |
| `/data/lakehouse` | Data Lakehouse, Model Registry, Contracts, Labeling & EU AI Act Pack |
| `/workflows/temporal` | Workflow Visualizer, Policy Editor & Approval Workflow Builder |
| `/admin/tenants` | Tenant Management |
| `/security/audit-log` | Security Audit Log |
| `/marketplace` | Marketplace |
| `/mobile` | Mobile Shell, Mobile Field Home, Mobile Hazard Report, Mobile SOS, Mobile Passport, Mobile Sync Queue |
| `/mobile/report` | Mobile Hazard Report |
| `/mobile/sos` | Mobile SOS |
| `/mobile/passport` | Mobile Passport |
| `/mobile/sync` | Mobile Sync Queue |

### 6.2 Specialist / vNext Surfaces
| Surface Cluster | Covered By |
|---|---|
| CV zoning / calibration / fairness / transparency | Zone Geometry Editor, Homography Calibration, Bias & Fairness Panel, Union-Transparent Camera Map |
| OT semantic mapping / backfill / simulator | Tag-to-Entity Resolver, Historian Backfill, SCADA Simulator |
| KG governance / import | Ontology Editor, Bulk Entity Importer |
| Risk authoring / shadow mode | Risk Pattern Registry & Authoring, Risk Shadow Mode Dashboard |
| Permit templates / analytics | Permit Library & Analytics |
| Detailed LOTO specialist surfaces | Isolation Registry, Guided Sequence & Group Lockout |
| Detailed handover specialist surfaces | Handover Packet & Comprehension Quiz |
| Incident report / timeline / CAPA | Incident Report, Timeline & CAPA Workspace |
| MLOps control plane | Model Registry, Contracts, Labeling & EU AI Act Pack |
| Workflow/policy shared substrate | Policy Editor & Approval Workflow Builder, Workflow Visualizer, Decision Inbox, Universal Decision Card |
| Observability / SRE / status | Observability Stack |
| Auditor / PII governance | Auditor Portal & PII Discovery |
| Site provisioning | Site Onboarding Wizard |