# Frontend Architecture — SafetyOS

## The Canonical Implementation Architecture for the AI-Powered Industrial Safety Intelligence Platform

**Document Version:** 1.0
**Status:** Canonical Frontend Architecture — Engineering Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0 + User Flow Specification v1.0 + Design System v1.0 + Screen Specifications v1.0 + API Specification v1.0 + Backend Service Specification v1.0 + Database Specification v1.0
**Owners:** Principal Frontend Architect, Staff Frontend Engineers, Design Systems Lead, UX Architecture
**Classification:** Confidential — Engineering Blueprint
**Target Stack:** Next.js 15 · React 19 · Tailwind CSS 4 · Radix UI · shadcn/ui · Framer Motion · React Flow · deck.gl · Three.js (constrained) · TanStack Query v5 · TanStack Table · TanStack Router · Zustand · Zod · pnpm · Turborepo
**Last Reviewed:** 2026-07-22

---

## Table of Contents

1. [Engineering Philosophy](#1-engineering-philosophy)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Apps](#3-apps)
4. [Standard App Structure](#4-standard-app-structure)
5. [Services](#5-services)
6. [Packages](#6-packages)
7. [Repository Dependency Rules](#7-repository-dependency-rules)
8. [Component Architecture](#8-component-architecture)
9. [State Management](#9-state-management)
10. [Routing](#10-routing)
11. [Data Fetching](#11-data-fetching)
12. [Forms](#12-forms)
13. [Performance](#13-performance)
14. [Accessibility](#14-accessibility)
15. [Security](#15-security)
16. [Testing](#16-testing)
17. [Build System](#17-build-system)
18. [Coding Standards](#18-coding-standards)
19. [Repository Conventions](#19-repository-conventions)

---

## 1. Engineering Philosophy

### 1.1 Architecture Principles

SafetyOS is a **life-critical industrial intelligence platform** where frontend decisions carry safety consequences. The architecture is governed by seven immovable principles derived from the PRSD §5 Product Principles and the Design System §2 Halo Principles:

1. **Safety-first rendering.** The frontend must never suppress, delay, or visually obscure a safety-critical alert. `--intent-critical` and `--intent-catastrophic` events take rendering priority over all other UI updates. React concurrent rendering priorities are configured to never defer life-safety event handlers.

2. **Offline-first for field users.** Mobile and field PWA surfaces must function fully during network partitions (PRSD §5.6, MOB-004). CRDT-based sync on recovery, local event queue with idempotency keys, and read-only cached credentials for ≤24 h are architectural requirements, not features.

3. **Edge-first data flow.** The frontend never assumes cloud availability for safety-critical data. BFF layers aggregate edge-first inference results (CV-027 store-and-forward) and degrade gracefully when cloud enrichment is unavailable.

4. **Explainability at the pixel level.** Every AI-generated recommendation, compound risk score, or agent decision surfaces citations, confidence, and a reasoning trace (PRSD §5.3, AG-018). No black-box UI patterns are permitted in safety-critical contexts.

5. **ISA-101 compliance by construction.** The Display Hierarchy (L1 Plant-wide → L2 Unit → L3 Equipment → L4 Diagnostics) governs all drill-down paths. Grayscale-first rendering reserves color for semantic signal. The frontend encodes ISA-101 as a layout system, not a cosmetic guideline.

6. **Zero-trust rendering.** Every route, component, and data query evaluates OPA-backed RBAC+ABAC policies. Unauthorized routes render 404-shaped responses. Row-level data never leaks to the DOM. Token storage follows the principle of least privilege.

7. **Regulation-aware governance.** EU AI Act Article 14 (AG-020 kill-switch), GDPR/DPDP face blur (CV-021), WCAG 2.2 AA/AAA, and ISA-18.2 alarm rationalization are enforced at the component level, not bolted on.

### 1.2 Scalability

**Horizontal scaling dimensions:**

- **Module count:** 27 modules (466+ features) with independent feature-flag rollouts per tenant, per site, per camera, per zone. The architecture supports 50+ modules without architectural changes.
- **Persona count:** 10+ canonical personas (Ravi, Priya, Sanjay, Anita, Deepak, Vikram, Meena, Kavya, Arjun, Neha) with persona-adaptive navigation, layout selection, and capability-token-gated feature surfaces.
- **Concurrent users per site:** ≥500 simultaneous WebSocket connections per site scope, with backpressure-aware message prioritization (`life-safety` > `critical` > `normal` > `low`).
- **Multi-tenancy:** Tenant isolation at the routing layer (subdomain: `<tenant>.safetyos.app`), BFF data partitioning, and OPA policy evaluation on every API call.
- **Data density:** Command Console screens render 30+ KPIs, 200-row incident tables, 12-camera video walls, and real-time geospatial overlays without frame drops below 60 fps.

**Code-splitting strategy:**

- Route-based splitting at the module level. Each of the 27 modules is a lazy-loaded route chunk.
- Component-level splitting for heavy visualization libraries (Three.js, deck.gl, React Flow, Visx).
- Worker-based offloading for CRDT sync, WebSocket message processing, and offline queue management.

### 1.3 Maintainability

- **Monorepo with strict dependency graph.** Turborepo + pnpm workspaces enforce unidirectional dependencies: apps → packages → design tokens. No circular imports. No cross-app imports.
- **Shared packages as contracts.** `@safetyos/ui`, `@safetyos/api-client`, `@safetyos/shared-types`, `@safetyos/validation` are the only approved integration surfaces between teams.
- **Feature-flag-gated delivery.** Every new feature ships behind a `@safetyos/config` flag (PLT-004 feature flags). Flag evaluation is server-side with client hydration.
- **Automated architectural fitness functions.** ESLint rules + custom Turborepo pipeline constraints enforce dependency boundaries, import restrictions, and naming conventions on every CI run.

### 1.4 Performance

**Performance budget (non-negotiable):**

| Metric | Target | Enforcement |
|---|---|---|
| Largest Contentful Paint (LCP) | ≤ 1.2s (SSR pages), ≤ 2.0s (CSR heavy) | Lighthouse CI gate |
| First Input Delay (FID) | ≤ 50ms | Web Vitals reporting |
| Cumulative Layout Shift (CLS) | ≤ 0.05 | Lighthouse CI gate |
| Interaction to Next Paint (INP) | ≤ 100ms | Web Vitals reporting |
| Time to Interactive (TTI) | ≤ 3.0s on 3G throttled | Lighthouse CI gate |
| Bundle size (initial JS) | ≤ 200 KB gzipped per app entry | Bundlewatch CI gate |
| WebSocket message-to-render | ≤ 50ms for `life-safety` class | Custom telemetry |
| Digital Twin frame rate | ≥ 60 fps at 100K triangles + 500 dynamic entities | Three.js perf monitor |
| Command Palette open time | ≤ 100ms | Custom telemetry |

### 1.5 Accessibility

**Non-negotiable compliance:**

- **WCAG 2.2 AA** globally across all surfaces.
- **WCAG 2.2 AAA** for safety-critical command surfaces: Command Console (all levels), Emergency Response, Alarm Management, LOTO verification, PTW approval, and the AI Kill-Switch.
- **ISA-101 compliance:** control-room displays readable at 3 meters, operable with gloves, triage-able within 2 seconds.
- **Keyboard parity:** every mouse action has a keyboard equivalent. Command Palette (⌘K/Ctrl+K) is the primary keyboard interface.
- **Screen reader optimization:** ARIA landmarks, live regions for real-time data, and semantic HTML structure.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables all animation except life-safety indicators. Animations fallback to ≤120ms fades.
- **Color independence:** alerts of severity ≥ Critical pair color with iconography + motion. Never color alone.
- **High contrast support:** all text/background pairs meet minimum contrast ratios. Intent colors tested for deuteranopia, protanopia, tritanopia.

### 1.6 Security

**Frontend security posture (aligned with SEC-* module, zero-trust architecture):**

- **Token storage:** Short-lived JWT access tokens (10 min) stored in memory only. Refresh tokens (24 h) in HttpOnly, SameSite=Strict, Secure cookies. No `localStorage` for tokens.
- **XSS mitigation:** React's built-in escaping + strict Content Security Policy. No `dangerouslySetInnerHTML` without sanitization via DOMPurify. CSP headers enforced at the CDN/gateway level.
- **CSRF protection:** SameSite cookies + double-submit CSRF token pattern for state-changing requests.
- **Subresource Integrity (SRI):** All CDN-served assets include integrity hashes.
- **Step-up authentication:** UI enforces step-up WebAuthn challenge for sensitive actions (UF-AUTH-003): PTW dual-sign, LOTO group-lock removal, AI kill-switch, model promotion.
- **Break-glass UI:** Dedicated secondary login path for IdP-unreachable scenarios (SEC-004), audited via WORM log.
- **PII handling:** Face-blurred frames only (CV-021). No raw biometric data rendered in the DOM. PII markers in the Knowledge Graph trigger automatic UI masking.

### 1.7 Offline Support

**Offline architecture (MOB-004, CV-027):**

- **Service Worker strategy:** Stale-while-revalidate for static assets; network-first for API data with cache fallback.
- **IndexedDB persistence:** Active permits, LOTO tags, assigned zones, shift context, and user profile cached locally.
- **Offline queue:** All write operations (hazard reports, permit check-ins, LOTO verifications) enqueue in IndexedDB with `Idempotency-Key` headers for deduplication on sync.
- **CRDT sync:** Conflict resolution for concurrent edits during partition. Last-write-wins for metadata; operation-based CRDTs for collaborative forms.
- **Offline banner:** Persistent `<OfflineBanner>` component across all mobile layouts. Sync queue status visible at `/mobile/sync`.
- **Cache budget:** ≤50 MB IndexedDB per user. Eviction policy: LRU by access time, safety-critical data exempt from eviction.

### 1.8 Microfrontend Strategy

**SafetyOS does NOT use runtime microfrontends.** The architecture uses a **monorepo with compile-time module boundaries** instead.

**Rationale:**
- Runtime microfrontend overhead (module federation, shared dependency negotiation, CSS isolation) introduces latency incompatible with safety-critical rendering targets.
- The 27 SafetyOS modules share a deep cross-module navigation graph (IA §15: Alarm → Compound Risk → Twin, Permit Suspension by Compound Risk, Incident → RCA → Knowledge Graph) that requires shared state and type safety across module boundaries.
- The Halo design system mandates pixel-perfect consistency across all surfaces. Runtime CSS isolation breaks this guarantee.

**Instead, module isolation is achieved through:**
- Route-based code splitting (each module is a lazy-loaded chunk).
- Package-level dependency boundaries enforced by Turborepo.
- Feature-flag-gated rendering per module, per tenant, per site.
- CODEOWNERS per module directory for team ownership.
- Independent deploy pipelines per app (dashboard-web, admin-portal, mobile-app, ai-copilot, docs-site) while sharing packages at build time.

---

## 2. Monorepo Architecture

### 2.1 Root Structure

```
SafetyOS/
├── apps/                          # Deployable applications
│   ├── dashboard-web/             # Primary Command Console + all 27 module surfaces
│   ├── admin-portal/              # Administration, Security, Platform Config
│   ├── mobile-app/                # React Native + PWA field application
│   ├── ai-copilot/                # Standalone AI workspace (embeddable)
│   └── docs-site/                 # Developer portal + API docs + design system docs
├── packages/                      # Shared libraries consumed by apps
│   ├── ui/                        # Halo Design System component library
│   ├── design-tokens/             # OKLCH tokens → CSS vars, Tailwind theme, Figma vars
│   ├── icons/                     # Halo Icons (900+ glyphs, Lucide-extended)
│   ├── shared-types/              # TypeScript types mirroring backend Protobuf/OpenAPI
│   ├── api-client/                # Generated REST/gRPC/GraphQL/WebSocket clients
│   ├── validation/                # Zod schemas shared between frontend and BFF
│   ├── hooks/                     # Shared React hooks (auth, scope, permissions, i18n)
│   ├── utils/                     # Pure utility functions (date, format, crypto, CRDT)
│   ├── config/                    # Feature flags, environment config, tenant config
│   ├── analytics/                 # Telemetry SDK, Web Vitals, event tracking
│   ├── i18n/                      # Internationalization framework + locale bundles
│   └── test-utils/                # Shared test fixtures, MSW handlers, render helpers
├── services/                      # Backend-for-Frontend (BFF) services
│   ├── console-bff/               # GraphQL federation BFF for Command Console
│   ├── mobile-bff/                # REST BFF for mobile delta-sync
│   └── edge-bff/                  # SSE/WebSocket relay for edge device streams
├── database/                      # Database schema artifacts (referenced, not owned)
│   ├── migrations/                # Prisma/Drizzle migration scripts for BFF-local state
│   ├── seeds/                     # Development seed data generators
│   └── schemas/                   # Shared schema definitions (Prisma schema files)
├── ai/                            # AI/ML frontend integration artifacts
│   ├── prompt-registry/           # Versioned prompt templates for RAG Copilot UI
│   ├── agent-schemas/             # Agent tool schemas for UI rendering
│   ├── confidence-calibration/    # Confidence display calibration models
│   └── streaming-protocols/       # SSE/WebSocket protocol definitions for LLM streaming
├── infrastructure/                # Infrastructure-as-code for frontend deployment
│   ├── terraform/                 # CDN, edge functions, WAF, CSP rules
│   ├── docker/                    # Container definitions for BFF services
│   ├── k8s/                       # Kubernetes manifests for BFF + SSR pods
│   ├── cdn/                       # Cloudflare/CloudFront distribution configs
│   └── monitoring/                # Grafana dashboards, Prometheus rules for frontend SLOs
├── tooling/                       # Developer tooling and code generation
│   ├── generators/                # Plop/Hygen generators for components, hooks, pages
│   ├── codemods/                  # AST-based migration scripts
│   ├── eslint-config/             # Shared ESLint configuration
│   ├── prettier-config/           # Shared Prettier configuration
│   ├── tsconfig/                  # Shared TypeScript configurations
│   ├── storybook-config/          # Shared Storybook configuration
│   └── scripts/                   # CI/CD helper scripts, release automation
├── docs/                          # Engineering documentation
│   ├── architecture/              # Architecture Decision Records (ADRs)
│   ├── guides/                    # Onboarding, contribution, deployment guides
│   ├── runbooks/                  # Incident response runbooks for frontend services
│   ├── rfcs/                      # Request for Comments for architectural changes
│   └── api/                       # Generated API documentation (OpenAPI, GraphQL SDL)
├── .github/                       # GitHub Actions, PR templates, CODEOWNERS
│   ├── workflows/                 # CI/CD pipeline definitions
│   ├── CODEOWNERS                 # Per-module ownership mapping
│   └── pull_request_template.md   # PR checklist (a11y, perf, security)
├── turbo.json                     # Turborepo pipeline configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── package.json                   # Root package.json (scripts, devDependencies)
├── tsconfig.base.json             # Base TypeScript configuration
├── .eslintrc.base.js              # Base ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .commitlintrc.js               # Commitlint configuration
├── .husky/                        # Git hooks (pre-commit, commit-msg)
├── .env.example                   # Environment variable template
└── README.md                      # Repository overview and quick start
```

### 2.2 Folder-by-Folder Explanation

#### `apps/`

Contains the five deployable frontend applications. Each app is independently buildable, testable, and deployable. Apps consume packages but never import from other apps. Each app maps to a distinct deployment target (Vercel/CloudFront for SSR, CDN for static, app stores for mobile).

#### `packages/`

Contains shared libraries that form the integration contract between apps and teams. Packages are versioned together (monorepo single-version policy) and published to a private npm registry for potential external consumption. Every package has its own `package.json`, `tsconfig.json`, build script, and test suite.

#### `services/`

Contains the Backend-for-Frontend (BFF) services that sit between the frontend apps and the 48 backend microservices. BFFs aggregate, transform, and optimize API responses for specific frontend use cases. They are Node.js services deployed as containers in the same Kubernetes cluster as the backend, behind the Kong API Gateway.

#### `database/`

Contains database artifacts specific to BFF-local state (session cache, offline queue metadata, persisted queries). This is NOT the canonical database schema (that lives in the backend repo per Database Specification v1.0). These are BFF-specific persistence needs.

#### `ai/`

Contains AI integration artifacts that bridge the multi-agent reasoning layer (MODULE 12, AG-*) with the frontend rendering surface. Prompt templates, agent tool schemas, confidence calibration parameters, and LLM streaming protocol definitions ensure consistent AI rendering across all apps.

#### `infrastructure/`

Contains infrastructure-as-code for frontend deployment targets. CDN configuration, edge function definitions (for ISR/SSG), WAF rules (XSS, bot protection), CSP header policies, and Kubernetes manifests for BFF services. Monitored by Grafana dashboards tracking frontend-specific SLOs (LCP, FID, CLS, INP).

#### `tooling/`

Contains developer experience infrastructure. Code generators produce boilerplate for new components, hooks, and pages following the Halo design system conventions. Codemods automate large-scale refactors. Shared ESLint/Prettier/TypeScript configurations enforce coding standards across all apps and packages.

#### `docs/`

Contains engineering documentation, Architecture Decision Records (ADRs), onboarding guides, deployment runbooks, and generated API documentation. RFCs govern architectural changes. This folder is the source for the docs-site app.

---

## 3. Apps

### 3.1 `dashboard-web`

**Purpose:** The primary SafetyOS web application. Renders all 27 module surfaces, 7 layout families, and 80+ canonical screens defined in the Screen Specifications. This is the application used by Sanjay (Shift Supervisor), Anita (Control Room Operator), Deepak (HSE Manager), Vikram (Safety Officer), Meena (Plant Head), Kavya (Auditor), and all desktop personas.

**Responsibilities:**
- Renders the App Shell (56px topbar, 64/240px left rail, 360px contextual panel, 12-column content grid).
- Implements all 7 layout families: `layout.command`, `layout.workflow`, `layout.analytics`, `layout.geospatial`, `layout.mobile`, `layout.admin`, `layout.auth`.
- Persona-adaptive navigation (IA §4.3): dynamic tab set, curated left-rail subset, and quick-action palette per persona role.
- Real-time WebSocket subscriptions for Command Console, alarms, compound risk, emergency broadcasts, and muster status.
- SSE streaming for RAG Copilot responses and agent narration.
- Digital Twin 2D/3D rendering with deck.gl + Three.js.
- Wall Display mode (`/console/wall`) with chrome-suppressed kiosk rendering.
- Split View Workspace for cross-module workflows.

**Dependencies:**
- `@safetyos/ui` — Halo component library
- `@safetyos/design-tokens` — CSS variables, Tailwind theme
- `@safetyos/icons` — 900+ icon glyphs
- `@safetyos/api-client` — REST, GraphQL, WebSocket, SSE clients
- `@safetyos/shared-types` — TypeScript domain types
- `@safetyos/validation` — Zod schemas for form validation
- `@safetyos/hooks` — Auth, scope, permissions, i18n hooks
- `@safetyos/utils` — Date, format, crypto utilities
- `@safetyos/config` — Feature flag evaluation, environment config
- `@safetyos/analytics` — Telemetry, Web Vitals tracking
- `@safetyos/i18n` — Internationalization
- `console-bff` — GraphQL federation BFF (runtime dependency via API)

**Technology:**
- Next.js 15 (App Router, React Server Components, Streaming SSR)
- React 19 (Concurrent Features, Server Components, use() hook)
- Tailwind CSS 4 (JIT, design token integration)
- Radix UI (accessible primitives)
- shadcn/ui (component foundation)
- Framer Motion (motion system)
- TanStack Query v5 (server state)
- TanStack Table (data grids)
- Zustand (client state)
- deck.gl (geospatial layers)
- Three.js + React Three Fiber (Digital Twin 3D)
- MapLibre GL (2D maps with custom Halo basemap)
- Visx (custom D3-based charts)
- Recharts (standard business charts)
- React Flow (workflow visualization)

**Folder structure:** See §4 Standard App Structure.

---

### 3.2 `admin-portal`

**Purpose:** The platform administration and security management application. Used by Arjun (IT/OT Engineer), Neha (CISO), super-admins, and tenant administrators. Renders Band E (Platform) surfaces plus security and governance modules.

**Responsibilities:**
- Tenant management (PLT-001): create/configure/suspend tenants, data residency, feature bundles.
- Site onboarding wizard (ADM-*): sites, areas, units, zones, assets, camera fleet.
- Identity and access management (SEC-*): users, groups, roles, policies, sessions, API keys.
- OPA policy bundle management (WFP-003): policy editor, approval workflows.
- Feature flag console (PLT-004): per-tenant, per-site, per-camera flag overrides.
- System health and SLO monitoring (OBS-*): SLO dashboards, error budget tracking.
- Model registry and MLOps control plane (DP-004, DP-015): model cards, canary deployments, bias panels.
- Marketplace and developer portal (EXT-*): app catalog, webhook management, API key issuance.
- AI Kill-Switch (AG-020): global, tenant, and model-scope AI circuit breakers.
- Security audit log (SEC-011): immutable WORM log viewer with search and export.
- Deployment management: release channels, canary rollout controls, rollback triggers.

**Dependencies:**
- `@safetyos/ui`, `@safetyos/design-tokens`, `@safetyos/icons`, `@safetyos/api-client`, `@safetyos/shared-types`, `@safetyos/validation`, `@safetyos/hooks`, `@safetyos/utils`, `@safetyos/config`, `@safetyos/analytics`, `@safetyos/i18n`

**Technology:**
- Next.js 15 (App Router, SSR for audit log pages)
- React 19
- Tailwind CSS 4
- Radix UI + shadcn/ui
- TanStack Query v5 + TanStack Table
- Zustand
- React Flow (workflow visualization, policy graph)
- Monaco Editor (OPA/Rego policy editing)

**Folder structure:**
```
admin-portal/
├── app/                           # Next.js App Router pages
│   ├── (auth)/                    # Auth layout group
│   │   ├── signin/
│   │   └── mfa/
│   ├── (platform)/                # Platform layout group
│   │   ├── tenants/
│   │   ├── sites/
│   │   ├── zones/
│   │   ├── assets/
│   │   ├── features/
│   │   ├── health/
│   │   ├── deployment/
│   │   └── backup/
│   ├── (security)/                # Security layout group
│   │   ├── identities/
│   │   ├── roles/
│   │   ├── policies/
│   │   ├── sessions/
│   │   ├── audit-log/
│   │   ├── keys/
│   │   └── privacy/
│   ├── (data)/                    # Data platform layout group
│   │   ├── lakehouse/
│   │   ├── streams/
│   │   ├── models/
│   │   ├── labeling/
│   │   └── contracts/
│   ├── (workflows)/               # Workflow engine layout group
│   │   ├── temporal/
│   │   ├── policies/
│   │   └── approvals/
│   ├── (marketplace)/             # Marketplace layout group
│   │   ├── catalog/
│   │   ├── installed/
│   │   ├── webhooks/
│   │   └── developer/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── hooks/
├── providers/
├── store/
├── services/
├── lib/
├── types/
└── tests/
```

---

### 3.3 `mobile-app`

**Purpose:** The field application for Ravi (Field Operator), Priya (Contractor), and Sanjay (in-field Supervisor). Delivers offline-first permit check-in, hazard reporting, LOTO tag management, SOS, and Digital Twin navigation on mobile devices.

**Responsibilities:**
- PWA + React Native dual-target: web PWA for broad device support, native shell for iOS/Android push notifications, NFC, and biometric auth.
- Bottom tab bar navigation (5 slots): Home · Permits · Report · Twin · Me. Passport replaces Twin for contractors.
- Offline-first data synchronization (MOB-004): IndexedDB/AsyncStorage for local state, queued writes with idempotency keys, CRDT conflict resolution.
- Glove-mode interaction: ≥44px touch targets, swipe-to-action rows, voice-first input.
- SOS floating action button (always visible): dual-confirm emergency declaration.
- Camera integration: hazard photo capture, QR permit scan, LOTO tag scan.
- Push notification routing to canonical entity deep links.
- Biometric authentication (UF-AUTH-002): Face ID / fingerprint unlock with device attestation.
- Worker Safety Passport (CON-*): certifications, onboarding progress, site orientation.

**Dependencies:**
- `@safetyos/ui` (React Native compatible subset)
- `@safetyos/design-tokens` (native JSON format)
- `@safetyos/icons` (SVG/React Native SVG)
- `@safetyos/api-client` (mobile BFF REST client)
- `@safetyos/shared-types`
- `@safetyos/validation`
- `@safetyos/hooks`
- `@safetyos/utils`
- `@safetyos/config`
- `mobile-bff` (runtime dependency via REST API)

**Technology:**
- React Native 0.76+ (New Architecture: Fabric, TurboModules)
- Expo (managed workflow for OTA updates, push, camera, NFC)
- React Navigation (native stack + bottom tabs)
- TanStack Query v5 (with offline persistence plugin)
- Zustand (client state)
- WatermelonDB / MMKV (offline persistence)
- MapLibre GL Native (Digital Twin 2D)
- React Native Reanimated (motion)

**Folder structure:**
```
mobile-app/
├── app/                           # Expo Router file-based routing
│   ├── (tabs)/                    # Bottom tab navigator
│   │   ├── home/
│   │   ├── permits/
│   │   ├── report/
│   │   ├── twin/
│   │   └── me/
│   ├── (auth)/
│   │   ├── signin/
│   │   └── biometric/
│   ├── (modals)/
│   │   ├── sos/
│   │   ├── scan/
│   │   └── sync/
│   ├── permits/[permitId]/
│   ├── loto/[isolationId]/
│   ├── incidents/new/
│   ├── passport/
│   └── _layout.tsx
├── components/
│   ├── field/                     # Glove-mode field components
│   ├── camera/                    # Camera capture + QR scan
│   ├── sync/                      # Offline sync status
│   └── sos/                       # SOS composer
├── hooks/
│   ├── use-offline-queue.ts
│   ├── use-biometric-auth.ts
│   ├── use-nfc-scan.ts
│   └── use-location.ts
├── providers/
│   ├── offline-provider.tsx
│   ├── sync-provider.tsx
│   └── push-provider.tsx
├── store/
│   ├── offline-store.ts
│   └── sync-queue-store.ts
├── services/
│   ├── mobile-bff-client.ts
│   ├── offline-db.ts
│   └── push-service.ts
├── lib/
├── types/
├── assets/
└── tests/
```

---

### 3.4 `ai-copilot`

**Purpose:** A standalone AI workspace that can run independently or embed within the dashboard-web right panel. Implements the RAG Copilot (MODULE 11), Multi-Agent Reasoning UI (MODULE 12), and the Halo Orb surface.

**Responsibilities:**
- Halo Orb rendering with 9 animated states (idle, listening, thinking, streaming, executing tool, confident, uncertain, error — Design System §28).
- Reasoning timeline: vertical step display (Observed → Retrieved → Reasoned → Called tool → Responded) with streaming updates.
- SSE-streamed LLM response rendering with markdown, code blocks, charts, entity chips, and action buttons.
- Confidence chips per factual claim (High/Medium/Low with citation links).
- Tool trace expandable panels: `kg.query`, `predictive.risk_score`, `cv.frame_lookup`.
- Citation deep-links to Knowledge Graph entities, SOPs, regulations.
- Human-in-loop decision cards (AG-019): approve/reject/escalate inline.
- AI Kill-Switch UI (AG-020): global, tenant, model scope toggles with CISO step-up auth.
- Prompt library management: saved prompts, task templates.
- Thread management: persistent conversation threads with source context.

**Dependencies:**
- `@safetyos/ui`, `@safetyos/design-tokens`, `@safetyos/icons`, `@safetyos/api-client`, `@safetyos/shared-types`, `@safetyos/hooks`, `@safetyos/utils`, `@safetyos/config`, `@safetyos/analytics`

**Technology:**
- Next.js 15 (lightweight, embeddable via iframe or Web Component)
- React 19
- Framer Motion + GSAP (Halo Orb cinematic animations)
- Vercel AI SDK (SSE streaming, tool rendering)
- TanStack Query v5
- Zustand (conversation state)

**Folder structure:**
```
ai-copilot/
├── app/
│   ├── page.tsx                   # Standalone copilot workspace
│   ├── threads/[threadId]/
│   ├── sources/
│   ├── prompts/
│   ├── agents/
│   │   ├── [agentId]/
│   │   ├── hitl/
│   │   └── kill-switch/
│   └── layout.tsx
├── components/
│   ├── orb/                       # Halo Orb (9 states, GSAP animation)
│   │   ├── halo-orb.tsx
│   │   ├── orb-states.ts
│   │   └── orb-shaders.ts
│   ├── reasoning/                 # Reasoning timeline
│   │   ├── reasoning-timeline.tsx
│   │   ├── step-card.tsx
│   │   └── tool-trace.tsx
│   ├── streaming/                 # SSE response rendering
│   │   ├── stream-renderer.tsx
│   │   ├── markdown-renderer.tsx
│   │   └── confidence-chip.tsx
│   ├── citations/                 # Citation rendering + deep links
│   ├── hitl/                      # Human-in-loop decision cards
│   └── kill-switch/               # AI kill-switch controls
├── hooks/
├── providers/
├── store/
├── services/
├── lib/
├── types/
└── tests/
```

---

### 3.5 `docs-site`

**Purpose:** The developer portal, API documentation site, and design system documentation. Used by internal engineers, third-party integration developers, and the SafetyOS ecosystem.

**Responsibilities:**
- Design system documentation: all 37 chapters of the Halo design language with live component playgrounds.
- API documentation: OpenAPI 3.1 interactive reference, gRPC schema browser, GraphQL SDL explorer, WebSocket protocol reference.
- Developer guides: SDK quickstart, authentication flows, webhook integration, sandbox environment.
- Architecture documentation: rendered ADRs, system diagrams, dependency graphs.
- Component storybook: embedded Storybook for Halo component library.
- Changelog and migration guides.
- Search across all documentation (Algolia DocSearch or equivalent).

**Dependencies:**
- `@safetyos/ui`, `@safetyos/design-tokens`, `@safetyos/icons`, `@safetyos/shared-types`

**Technology:**
- Next.js 15 (SSG for documentation pages, ISR for changelog)
- MDX (Markdown with React components)
- Fumadocs or Nextra (documentation framework)
- Shiki (code syntax highlighting)
- Storybook 8 (embedded component playground)
- Mermaid (architecture diagrams)

**Folder structure:**
```
docs-site/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── design-system/             # Halo design system docs
│   │   ├── foundations/
│   │   ├── components/
│   │   ├── patterns/
│   │   └── motion/
│   ├── api/                       # API reference
│   │   ├── rest/
│   │   ├── grpc/
│   │   ├── graphql/
│   │   ├── websocket/
│   │   └── sse/
│   ├── guides/                    # Developer guides
│   │   ├── getting-started/
│   │   ├── authentication/
│   │   ├── webhooks/
│   │   └── sdk/
│   ├── architecture/              # Architecture docs
│   │   ├── adrs/
│   │   └── diagrams/
│   ├── changelog/
│   └── layout.tsx
├── content/                       # MDX content files
├── components/
│   ├── playground/                # Live component playgrounds
│   ├── api-explorer/              # Interactive API reference
│   └── diagram/                   # Mermaid renderers
├── lib/
├── types/
└── public/
```

---

## 4. Standard App Structure

Every Next.js app within the monorepo follows this canonical folder structure. Deviations require an ADR.

```
<app-name>/
├── app/                           # Next.js App Router (file-based routing)
│   ├── (auth)/                    # Route group: unauthenticated layouts
│   ├── (<domain>)/                # Route groups per domain module
│   ├── api/                       # API routes (BFF endpoints if colocated)
│   ├── layout.tsx                 # Root layout (providers, fonts, analytics)
│   ├── loading.tsx                # Root loading UI (shell skeleton)
│   ├── error.tsx                  # Root error boundary
│   ├── not-found.tsx              # 404 page (404-shaped for zero-trust)
│   └── global-error.tsx           # Unrecoverable error boundary
├── components/                    # App-specific components
│   ├── domain/                    # Domain-specific components (per module)
│   │   ├── console/               # Command Console components
│   │   ├── permits/               # PTW workflow components
│   │   ├── loto/                  # LOTO components
│   │   ├── incidents/             # Incident management components
│   │   ├── emergency/             # Emergency response components
│   │   ├── risk/                  # Compound risk components
│   │   ├── alarms/                # Alarm rationalization components
│   │   ├── twin/                  # Digital Twin components
│   │   ├── vision/                # Computer Vision components
│   │   ├── copilot/               # AI Copilot components
│   │   ├── workforce/             # Contractor/workforce components
│   │   ├── compliance/            # Compliance/audit components
│   │   ├── predictive/            # Predictive analytics components
│   │   ├── ot/                    # OT/SCADA components
│   │   ├── iot/                   # IoT/wearables components
│   │   ├── knowledge/             # Knowledge Graph components
│   │   ├── notifications/         # Notification components
│   │   └── data/                  # Data platform components
│   ├── shell/                     # App shell components
│   │   ├── topbar.tsx
│   │   ├── left-rail.tsx
│   │   ├── context-panel.tsx
│   │   ├── scope-selector.tsx
│   │   ├── offline-banner.tsx
│   │   └── toast-stack.tsx
│   └── shared/                    # App-shared but not package-worthy
├── hooks/                         # App-specific hooks
│   ├── use-scope.ts               # Current workspace scope
│   ├── use-persona.ts             # Current persona context
│   ├── use-permissions.ts         # OPA policy evaluation
│   ├── use-realtime.ts            # WebSocket subscription manager
│   ├── use-keyboard-shortcuts.ts  # Global keyboard shortcut registry
│   └── use-feature-flag.ts        # Feature flag evaluation
├── providers/                     # React context providers
│   ├── auth-provider.tsx          # Authentication state + token refresh
│   ├── scope-provider.tsx         # Workspace scope (Org → Site → Area → Unit → Zone)
│   ├── persona-provider.tsx       # Persona-adaptive rendering context
│   ├── permission-provider.tsx    # OPA policy cache + evaluation
│   ├── realtime-provider.tsx      # WebSocket connection manager
│   ├── theme-provider.tsx         # Dark/light mode + density preference
│   ├── i18n-provider.tsx          # Internationalization context
│   ├── analytics-provider.tsx     # Telemetry + Web Vitals
│   ├── offline-provider.tsx       # Offline detection + sync queue
│   └── feature-flag-provider.tsx  # Feature flag context
├── layouts/                       # Layout components (ISA-101 aligned)
│   ├── command-layout.tsx         # layout.command — Console, wall display
│   ├── workflow-layout.tsx        # layout.workflow — PTW, LOTO, Incident
│   ├── analytics-layout.tsx       # layout.analytics — Reports, compliance
│   ├── geospatial-layout.tsx      # layout.geospatial — Digital Twin
│   ├── admin-layout.tsx           # layout.admin — Admin, security
│   ├── auth-layout.tsx            # layout.auth — Sign-in, MFA
│   └── mobile-layout.tsx          # layout.mobile — Mobile responsive
├── store/                         # Client-side state (Zustand)
│   ├── shell-store.ts             # Rail state, panel state, density
│   ├── scope-store.ts             # Active scope hierarchy
│   ├── notification-store.ts      # Unread count, notification queue
│   ├── realtime-store.ts          # WebSocket subscription state
│   ├── command-palette-store.ts   # Palette open/query state
│   └── split-view-store.ts        # Split view configuration
├── services/                      # API service layer
│   ├── auth-service.ts            # Auth API calls
│   ├── scope-service.ts           # Scope hierarchy API
│   ├── navigation-service.ts      # Navigation + persona tabs API
│   ├── notification-service.ts    # Notification API
│   ├── search-service.ts          # Federated search API
│   ├── websocket-service.ts       # WebSocket connection + subscription
│   └── sse-service.ts             # SSE stream management
├── utils/                         # App-specific utilities
│   ├── route-helpers.ts           # Route construction with scope params
│   ├── permission-helpers.ts      # Permission expression evaluation
│   ├── date-helpers.ts            # ISA-standard date formatting
│   └── telemetry-helpers.ts       # Custom telemetry event helpers
├── lib/                           # Third-party library wrappers
│   ├── query-client.ts            # TanStack Query client configuration
│   ├── three-config.ts            # Three.js scene configuration
│   ├── deckgl-config.ts           # deck.gl layer configuration
│   └── maplibre-config.ts         # MapLibre + Halo basemap config
├── types/                         # App-specific TypeScript types
│   ├── navigation.ts
│   ├── layout.ts
│   ├── scope.ts
│   └── persona.ts
├── assets/                        # Static assets
│   ├── fonts/                     # Inter Variable, JetBrains Mono Variable
│   ├── images/                    # Static images, empty state illustrations
│   └── lottie/                    # Lottie animations (Halo Orb, spinners)
├── tests/                         # Test suites
│   ├── unit/                      # Component unit tests (Vitest + RTL)
│   ├── integration/               # Integration tests (MSW + RTL)
│   ├── e2e/                       # End-to-end tests (Playwright)
│   ├── visual/                    # Visual regression tests (Chromatic)
│   ├── a11y/                      # Accessibility tests (axe-core + Playwright)
│   └── fixtures/                  # Test data fixtures
├── public/                        # Static public assets
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   └── favicon.ico
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration (tokens import)
├── tsconfig.json                  # TypeScript configuration (extends base)
├── package.json                   # App-specific dependencies
└── vitest.config.ts               # Vitest configuration
```

### 4.1 Folder Explanations

| Folder | Purpose | Rules |
|---|---|---|
| `app/` | File-based routing. Route groups (`(domain)`) map to SafetyOS modules. Each module's routes mirror the canonical URL grammar from IA §5.1. | One `page.tsx` per route. `layout.tsx` per route group selects the appropriate ISA-101 layout family. `loading.tsx` renders Halo skeleton screens. `error.tsx` isolates failures per module. |
| `components/domain/` | Components owned by a single module. Not reused across modules. | If a component is needed by 2+ modules, it moves to `components/shared/` or to `@safetyos/ui`. |
| `components/shell/` | App shell components that form the persistent chrome. | Must be render-stable — no layout shift during route transitions. |
| `hooks/` | App-specific React hooks. Shared hooks live in `@safetyos/hooks`. | Hooks that depend on app-level providers (scope, persona, permissions) live here. Pure utility hooks go in `@safetyos/hooks`. |
| `providers/` | React context providers that wrap the app tree. | Provider composition order matters: `AuthProvider > ScopeProvider > PersonaProvider > PermissionProvider > ThemeProvider > RealtimeProvider > FeatureFlagProvider > I18nProvider > AnalyticsProvider > OfflineProvider`. |
| `layouts/` | Layout components implementing the 7 ISA-101 layout families. | Each layout component defines the shell configuration (rail width, panel presence, header variant) for its layout family. Route groups in `app/` select layouts via `layout.tsx`. |
| `store/` | Zustand stores for client-side state that doesn't come from the server. | Server state uses TanStack Query. Zustand is for UI state (panel open/close, split view, theme, density). |
| `services/` | API integration layer. Wraps `@safetyos/api-client` with app-specific configuration. | Services handle request/response transformation, error mapping, and retry logic. They are the only layer that imports `@safetyos/api-client` directly. |
| `lib/` | Third-party library configuration and wrappers. | Isolates third-party API surfaces behind SafetyOS abstractions. Enables library replacement without app-wide changes. |
| `types/` | App-specific TypeScript types. | Domain types live in `@safetyos/shared-types`. App types cover navigation, layout, and UI-specific shapes. |
| `tests/` | Test suites organized by category. | Every component has a unit test. Every user flow has an integration test. Every critical path has an E2E test. Every component has an accessibility test. |

---

## 5. Services

### 5.1 Frontend-to-Backend Communication Architecture

SafetyOS uses a **BFF (Backend-for-Frontend) pattern** to mediate between the five frontend apps and the 48 backend microservices. The BFF layer is architecturally mandated — frontend apps NEVER call backend microservices directly.

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend Apps                                               │
│  dashboard-web · admin-portal · mobile-app · ai-copilot      │
│  docs-site                                                   │
└──────────────┬────────────────────┬──────────────────────────┘
               │                    │
    ┌──────────▼──────────┐  ┌──────▼──────────┐
    │  Kong API Gateway    │  │  CDN / Edge      │
    │  (rate limit, WAF,   │  │  (static, ISR,   │
    │   auth, routing)     │  │   edge functions) │
    └──────────┬──────────┘  └─────────────────┘
               │
    ┌──────────▼──────────────────────────────────┐
    │  BFF Layer                                    │
    │  ┌──────────────┐ ┌──────────┐ ┌──────────┐ │
    │  │ console-bff  │ │mobile-bff│ │ edge-bff │ │
    │  │ (GraphQL     │ │ (REST    │ │ (SSE/WS  │ │
    │  │  federation) │ │  delta-  │ │  relay)  │ │
    │  │              │ │  sync)   │ │          │ │
    │  └──────┬───────┘ └────┬─────┘ └────┬─────┘ │
    └─────────┼──────────────┼────────────┼────────┘
              │              │            │
    ┌─────────▼──────────────▼────────────▼────────┐
    │  48 Backend Microservices (gRPC + Kafka)       │
    │  (Plane A–J per Backend Service Specification) │
    └──────────────────────────────────────────────┘
```

### 5.2 Communication Protocols

#### REST (Mobile BFF, Admin APIs)

**When used:** Mobile app data fetching, admin CRUD operations, third-party integrations.

**Implementation:**
- `@safetyos/api-client` generates typed REST clients from OpenAPI 3.1 specs using `openapi-typescript` + `openapi-fetch`.
- Request interceptors inject `Authorization`, `X-SafetyOS-Tenant-Id`, `X-SafetyOS-Trace-Id`, `Idempotency-Key` headers.
- Response interceptors handle 401 (token refresh), 403 (permission denied toast), 429 (backoff), and 5xx (retry with exponential backoff).
- Pagination: cursor-based by default. Client uses `useInfiniteQuery` from TanStack Query.
- Filtering: AIP-160 filter DSL constructed by filter UI components.

```typescript
// @safetyos/api-client — generated typed client
import { createClient } from '@safetyos/api-client/rest';

const api = createClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  headers: () => ({
    'Authorization': `Bearer ${getAccessToken()}`,
    'X-SafetyOS-Tenant-Id': getTenantId(),
    'X-SafetyOS-Trace-Id': generateTraceId(),
  }),
});

// Typed endpoint call
const { data } = await api.GET('/ptw/v1/permits', {
  params: {
    query: {
      page_size: 100,
      filter: 'status:active AND zone.site_id:"site-123"',
      order_by: 'created_at:desc',
    },
  },
});
```

#### GraphQL (Console BFF)

**When used:** Command Console and dashboard-web complex data aggregation where multiple backend services contribute to a single screen render.

**Implementation:**
- Apollo Router federation at the `console-bff` layer, stitching subgraphs from perception, workflows, risk, command, and platform planes.
- Frontend uses `@apollo/client` with persisted queries (signed hash allowlist — no ad-hoc queries in production per API Specification §1.4).
- Depth limit 12, complexity limit 10,000, max aliases 20 enforced by Apollo Router.
- `@safetyos/api-client` generates typed GraphQL hooks from SDL using `graphql-codegen`.
- Introspection disabled in production. Schema downloaded from registry at build time.

```typescript
// Generated typed GraphQL hook
import { useConsoleOverviewQuery } from '@safetyos/api-client/graphql';

const { data, loading } = useConsoleOverviewQuery({
  variables: { siteId: scope.siteId },
  pollInterval: 30_000, // complement with WebSocket for real-time
});
```

#### gRPC-Web (Internal tools, high-throughput)

**When used:** Admin portal direct-to-service calls for high-throughput operations (bulk imports, model registry operations, KG traversal).

**Implementation:**
- `grpc-web` transport over HTTP/2 via Envoy proxy.
- Protobuf schemas compiled to TypeScript via `buf` + `protobuf-es`.
- Streaming RPCs for KG traversal, edge inference batches, and telemetry ingestion.
- Deadline enforcement: every RPC call includes a client-side deadline.

#### WebSocket (Real-time push)

**When used:** Command Console live updates, alarm streams, compound risk events, emergency broadcasts, muster status, presence tracking.

**Implementation:**
- Single WebSocket connection per app instance, multiplexed across channels.
- Subprotocol `safetyos.v1` negotiated in handshake (API Specification §1.5).
- Channel subscription model: `safetyos:tenant:{tid}:site:{sid}:panel:{name}`.
- Backpressure: server drops `low` priority messages first; `life-safety` messages never dropped and trigger out-of-band notification as backup.
- Reconnect: exponential backoff 1s → 30s with 20% jitter. Client tracks `resume_token` every 100 messages for gap-fill replay.
- Message processing offloaded to a Web Worker to avoid blocking the main thread.

```typescript
// @safetyos/api-client — WebSocket manager
import { SafetyOSSocket } from '@safetyos/api-client/websocket';

const socket = new SafetyOSSocket({
  url: process.env.NEXT_PUBLIC_WS_URL,
  subprotocol: 'safetyos.v1',
  reconnect: { baseDelay: 1000, maxDelay: 30000, jitter: 0.2 },
  worker: new Worker('./ws-worker.ts'), // offload to Web Worker
});

socket.subscribe(
  `safetyos:tenant:${tenantId}:site:${siteId}:panel:alarms`,
  (message) => {
    queryClient.setQueryData(['alarms', siteId], (old) => merge(old, message));
  },
  { priority: 'life-safety' }
);
```

#### SSE (Server-Sent Events — LLM streaming)

**When used:** RAG Copilot response streaming, multi-agent narration, log tails.

**Implementation:**
- `POST /rag/v1/chat` returns `text/event-stream; charset=utf-8`.
- Heartbeat `:heartbeat\n\n` every 15 s; client disconnects on 45 s silence.
- Each event carries `id` (monotonic ULID), `event`, `data` fields.
- Resume via `Last-Event-ID` header.
- Vercel AI SDK `useChat` / `useCompletion` hooks handle stream parsing, token rendering, and tool invocations.

```typescript
// AI Copilot SSE streaming
import { useChat } from 'ai/react';

const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/copilot/chat',
  headers: {
    'X-SafetyOS-Tenant-Id': tenantId,
    'X-SafetyOS-Trace-Id': traceId,
  },
  onToolCall: async ({ toolCall }) => {
    // Render tool execution in reasoning timeline
    addReasoningStep({ type: 'tool', name: toolCall.toolName, args: toolCall.args });
  },
});
```

### 5.3 BFF Service Specifications

#### `console-bff`

**Owner:** Command Console Frontend Squad.
**Purpose:** GraphQL federation BFF that aggregates data from perception, workflows, risk, command, and platform planes into optimized payloads for Command Console screens.
**Technology:** Node.js + Apollo Router + Apollo Server subgraphs.
**APIs exposed:**
- GraphQL endpoint: `/graphql` (persisted queries only in production)
- WebSocket relay: `/ws` (multiplexed channel subscriptions)
- Health: `/health`, `/ready`
**Scaling:** Horizontal, stateless, 3+ replicas per region, auto-scaled on WebSocket connection count.

#### `mobile-bff`

**Owner:** Mobile Squad.
**Purpose:** REST BFF optimized for mobile delta-sync patterns. Returns minimal payloads with `ETag`-based conditional responses. Supports offline resumption via delta tokens.
**Technology:** Node.js + Fastify.
**APIs exposed:**
- REST: `/mobile/v1/*` (delta-sync endpoints with `If-None-Match`)
- Health: `/health`, `/ready`
**Scaling:** Horizontal, stateless, auto-scaled on request rate.

#### `edge-bff`

**Owner:** Edge Platform Squad.
**Purpose:** SSE/WebSocket relay that bridges edge device streams (camera health, inference results, edge node fleet status) to frontend apps. Handles fan-out from Kafka topics to WebSocket channels.
**Technology:** Node.js + µWebSockets.js.
**APIs exposed:**
- WebSocket: `/edge/ws` (edge fleet telemetry)
- SSE: `/edge/sse` (log tails, model deployment status)
- Health: `/health`, `/ready`
**Scaling:** Horizontal, stateless, auto-scaled on connection count.

---

## 6. Packages

### 6.1 `@safetyos/ui`

**Purpose:** The Halo Design System component library. Implements every component specified in Design System §13–§28: buttons, inputs, form controls, dropdowns, selects, comboboxes, tables, data grids, charts, maps, digital twin widgets, cards, forms, modals, dialogs, sheets, notifications, toasts, sidebars, topbars, command palette, Halo Orb, empty states, loading states, error states.

**Ownership:** Design Systems Squad. Changes require design review + a11y audit.

**Technology:** React 19, Radix UI primitives, shadcn/ui foundation, Tailwind CSS 4, Framer Motion, class-variance-authority (CVA) for variant management.

**Export structure:**
```
@safetyos/ui/
├── primitives/          # Radix-based accessible primitives
├── components/          # Composed Halo components
│   ├── button/
│   ├── input/
│   ├── select/
│   ├── combobox/
│   ├── data-table/
│   ├── data-grid/
│   ├── chart/
│   ├── card/
│   ├── modal/
│   ├── dialog/
│   ├── sheet/
│   ├── toast/
│   ├── notification/
│   ├── command-palette/
│   ├── topbar/
│   ├── sidebar/
│   ├── breadcrumb/
│   ├── chip/
│   ├── avatar/
│   ├── badge/
│   ├── skeleton/
│   ├── spinner/
│   ├── progress/
│   ├── slider/
│   ├── switch/
│   ├── checkbox/
│   ├── radio/
│   ├── tabs/
│   ├── accordion/
│   ├── tooltip/
│   ├── popover/
│   ├── context-menu/
│   ├── dropdown-menu/
│   ├── date-picker/
│   ├── time-picker/
│   ├── file-upload/
│   ├── signature-pad/
│   ├── stepper/
│   ├── timeline/
│   ├── kpi-card/
│   ├── metric-card/
│   ├── status-card/
│   ├── ai-insight-card/
│   ├── incident-card/
│   ├── permit-card/
│   ├── asset-card/
│   ├── risk-matrix/
│   ├── confidence-chip/
│   ├── empty-state/
│   └── error-boundary/
├── layouts/             # Layout primitives for ISA-101 families
├── patterns/            # Compound patterns (filter bar, bulk actions, etc.)
└── index.ts             # Public API barrel export
```

### 6.2 `@safetyos/design-tokens`

**Purpose:** Single source of truth for all design tokens. Authored in Style Dictionary, emitted as CSS custom properties, Tailwind CSS theme, React Native JSON, and Figma variables. Implements the three-tier token architecture (Core → Semantic → Component) from Design System §3.

**Ownership:** Design Systems Squad.

**Outputs:**
- `tokens.css` — CSS custom properties for web
- `tailwind.theme.ts` — Tailwind CSS 4 theme extension
- `tokens.json` — Platform-agnostic JSON
- `tokens.native.json` — React Native compatible values
- `figma-variables.json` — Figma import format

**Token categories:** Surface, text, border, intent, brand, data-viz, spacing, radius, typography, shadow, duration, easing, z-index, blur (Design System §3).

### 6.3 `@safetyos/icons`

**Purpose:** The Halo Icons library — 900+ glyphs extending Lucide with industrial safety domains: Safety, Industrial, OT/SCADA, Digital Twin/CV, Permit/LOTO, Emergency (Design System §10.1). Four styles: Line (default), Solid, Duotone, Animated (Lottie).

**Ownership:** Design Systems Squad.

**Export:** Named exports per icon, tree-shakeable. React components wrapping SVGs with `currentColor` inheritance.

### 6.4 `@safetyos/shared-types`

**Purpose:** TypeScript types that mirror the backend domain model. Generated from OpenAPI 3.1 specs and Protobuf schemas. Every entity from Database Specification §3 (Org, Site, Zone, Equipment, Worker, Permit, LotoOrder, Incident, CompoundRisk, CvEvent, etc.) has a corresponding TypeScript type.

**Ownership:** Platform Squad. Auto-generated by CI pipeline; manual edits prohibited.

**Generation pipeline:**
- OpenAPI 3.1 → `openapi-typescript` → REST types
- Protobuf → `protobuf-es` → gRPC types
- GraphQL SDL → `graphql-codegen` → GraphQL types
- Shared domain types → manually curated cross-cutting types

### 6.5 `@safetyos/api-client`

**Purpose:** Generated API clients for all six communication surfaces (REST, GraphQL, gRPC-Web, WebSocket, SSE, Kafka consumer). Provides typed, interceptor-aware clients with built-in retry, circuit breaking, and telemetry.

**Ownership:** Platform Squad.

**Submodules:**
- `@safetyos/api-client/rest` — OpenAPI-generated REST client
- `@safetyos/api-client/graphql` — GraphQL codegen hooks
- `@safetyos/api-client/grpc` — gRPC-Web typed clients
- `@safetyos/api-client/websocket` — WebSocket manager with channel subscriptions
- `@safetyos/api-client/sse` — SSE stream consumer with resume support
- `@safetyos/api-client/interceptors` — Auth, tenant, trace, idempotency interceptors

### 6.6 `@safetyos/validation`

**Purpose:** Zod schemas shared between frontend form validation and BFF request validation. Every form in the product (PTW draft, incident report, LOTO verification, site onboarding) has a corresponding Zod schema.

**Ownership:** Shared between Domain Squads (schema authoring) and Platform Squad (validation infrastructure).

**Structure:** Schemas organized by module prefix: `ptw.schemas.ts`, `loto.schemas.ts`, `inc.schemas.ts`, `adm.schemas.ts`, etc.

### 6.7 `@safetyos/hooks`

**Purpose:** Shared React hooks that are app-agnostic. Hooks that depend on specific app providers (scope, persona) live in app-level `hooks/` folders.

**Ownership:** Platform Squad.

**Hooks:**
- `useMediaQuery` — responsive breakpoint detection (Design System §6.1 breakpoints)
- `useReducedMotion` — `prefers-reduced-motion` detection
- `useColorScheme` — dark/light mode detection
- `useDebouncedValue` — debounced state for search inputs
- `useIntersectionObserver` — lazy loading, virtualization triggers
- `useCopyToClipboard` — clipboard interaction with toast feedback
- `useLocalStorage` / `useSessionStorage` — typed browser storage hooks
- `useEventListener` — type-safe event listener management
- `usePrevious` — previous value tracking for animations
- `useInterval` / `useTimeout` — timer hooks for polling and auto-refresh
- `useLockBodyScroll` — modal/sheet body scroll lock
- `useIsomorphicLayoutEffect` — SSR-safe layout effect

### 6.8 `@safetyos/utils`

**Purpose:** Pure utility functions with zero React dependency. Used by both frontend apps and BFF services.

**Ownership:** Platform Squad.

**Modules:**
- `date` — ISO 8601 formatting, timezone handling, relative time, shift-aware date math
- `format` — Number formatting (tabular-nums rules), unit conversion (`ppm`, `°C`, `%LEL`)
- `crypto` — Client-side ULID generation, HMAC for idempotency keys, SRI hash computation
- `crdt` — CRDT primitives for offline conflict resolution
- `filter` — AIP-160 filter expression builder/parser
- `scope` — Scope hierarchy utilities (Org → Site → Area → Unit → Zone → Asset)
- `permission` — Permission expression evaluation helpers
- `url` — Route construction with scope query parameters
- `string` — Truncation, slug generation, search highlighting

### 6.9 `@safetyos/config`

**Purpose:** Feature flag evaluation, environment configuration, and tenant configuration. Integrates with Flagsmith (PLT-004) for server-side flag evaluation with client-side hydration.

**Ownership:** Platform Squad.

**Exports:**
- `evaluateFlag(flagKey, context)` — Evaluates a feature flag with tenant/site/camera/zone context
- `getEnvConfig()` — Environment-specific configuration
- `getTenantConfig(tenantId)` — Tenant-specific configuration (data residency, feature bundle, capability caps)

### 6.10 `@safetyos/analytics`

**Purpose:** Telemetry SDK for Web Vitals reporting, custom event tracking, and performance monitoring. Feeds data to Prometheus/Mimir (MODULE 27, OBS-*).

**Ownership:** SRE Squad.

**Capabilities:**
- Web Vitals (LCP, FID, CLS, INP, TTFB) auto-reporting
- Custom events: `ui.*.v1` event taxonomy from Screen Specifications
- Performance marks/measures for custom metrics (command palette open time, WebSocket message-to-render)
- Error tracking with correlation IDs
- Session replay sampling (1% in production, 100% on error paths)

### 6.11 `@safetyos/i18n`

**Purpose:** Internationalization framework with locale bundles. SafetyOS supports English, Hindi, Arabic (RTL), Malay, Portuguese, and Mandarin for initial deployment markets.

**Ownership:** Localization Squad.

**Implementation:** `next-intl` for Next.js apps, `i18next` for React Native. ICU MessageFormat for pluralization, gender, and date formatting.

### 6.12 `@safetyos/test-utils`

**Purpose:** Shared test infrastructure. MSW (Mock Service Worker) handlers for all API endpoints, render helpers with provider wrappers, test data factories using `@faker-js/faker`, and accessibility assertion helpers.

**Ownership:** Platform Squad.

---

## 7. Repository Dependency Rules

### 7.1 Dependency Graph

```
┌────────────────────────────────────────────────────────┐
│  Layer 3: Apps (deploy targets)                         │
│  dashboard-web · admin-portal · mobile-app ·            │
│  ai-copilot · docs-site                                 │
│                                                         │
│  ✅ May import: packages/* (any)                        │
│  ✅ May call at runtime: services/* (via API)           │
│  ❌ Must NOT import: other apps                         │
│  ❌ Must NOT import: services/* code                    │
│  ❌ Must NOT import: infrastructure/*                   │
│  ❌ Must NOT import: database/*                         │
│  ❌ Must NOT import: ai/* (except agent-schemas)        │
└───────────────────────┬────────────────────────────────┘
                        │ imports
┌───────────────────────▼────────────────────────────────┐
│  Layer 2: Packages (shared libraries)                   │
│  ui · design-tokens · icons · shared-types · api-client │
│  validation · hooks · utils · config · analytics ·      │
│  i18n · test-utils                                      │
│                                                         │
│  ✅ May import: other packages (acyclic)                │
│  ❌ Must NOT import: apps/*                             │
│  ❌ Must NOT import: services/*                         │
│  ❌ Must NOT import: infrastructure/*                   │
└───────────────────────┬────────────────────────────────┘
                        │ imports
┌───────────────────────▼────────────────────────────────┐
│  Layer 1: Foundation (zero internal dependencies)       │
│  design-tokens · shared-types · utils                   │
│                                                         │
│  ✅ May import: external npm packages only              │
│  ❌ Must NOT import: any SafetyOS package               │
└────────────────────────────────────────────────────────┘
```

### 7.2 Package Import Rules

| Source | Can Import | Cannot Import |
|---|---|---|
| `@safetyos/ui` | `design-tokens`, `icons`, `hooks`, `utils`, `shared-types` | `api-client`, `validation`, `config`, `analytics` (no server/API concerns in UI) |
| `@safetyos/api-client` | `shared-types`, `utils`, `config` | `ui`, `hooks`, `validation` (no React dependency) |
| `@safetyos/validation` | `shared-types`, `utils` | `ui`, `api-client`, `hooks` |
| `@safetyos/hooks` | `utils`, `shared-types` | `ui`, `api-client`, `validation` |
| `@safetyos/config` | `shared-types`, `utils` | `ui`, `api-client`, `hooks` |
| `@safetyos/analytics` | `utils`, `config` | `ui`, `api-client`, `hooks`, `shared-types` |
| `@safetyos/design-tokens` | (none — leaf node) | all |
| `@safetyos/icons` | (none — leaf node) | all |
| `@safetyos/shared-types` | (none — leaf node, auto-generated) | all |
| `@safetyos/utils` | (none — leaf node) | all |

### 7.3 Enforcement

- **Turborepo `dependsOn` declarations** in `turbo.json` enforce build order.
- **ESLint `no-restricted-imports` rules** in `@safetyos/eslint-config` block prohibited import paths.
- **Custom ESLint plugin** (`eslint-plugin-safetyos-architecture`) validates the dependency graph on every CI run.
- **CODEOWNERS** requires Design Systems Squad approval for `@safetyos/ui` changes, Platform Squad for `@safetyos/api-client` changes.

---

## 8. Component Architecture

### 8.1 Atomic Design Hierarchy

SafetyOS follows a modified Atomic Design system tailored for industrial safety interfaces:

| Level | Name | Description | Location | Examples |
|---|---|---|---|---|
| L0 | **Tokens** | Design decisions expressed as CSS custom properties | `@safetyos/design-tokens` | `--surface-raised`, `--intent-critical`, `--space-4` |
| L1 | **Primitives** | Accessible, unstyled interaction primitives (Radix UI) | `@safetyos/ui/primitives` | Dialog, Popover, Toggle, Tooltip |
| L2 | **Atoms** | Smallest styled components with a single concern | `@safetyos/ui/components` | Button, Input, Badge, Chip, Avatar, Icon |
| L3 | **Molecules** | Composed atoms forming a reusable pattern | `@safetyos/ui/components` | SearchInput, SelectCombobox, DatePicker, ConfidenceChip, KpiCard |
| L4 | **Organisms** | Complex, domain-aware components | `@safetyos/ui/components` or `apps/*/components/domain/` | DataTable, DataGrid, CommandPalette, ReasoningTimeline, RiskMatrix |
| L5 | **Templates** | Layout components defining page structure | `apps/*/layouts/` | CommandLayout, WorkflowLayout, AnalyticsLayout |
| L6 | **Pages** | Route-level compositions | `apps/*/app/` | `ConsoleL1Page`, `PermitDetailPage`, `IncidentRCAPage` |

### 8.2 Smart vs. Dumb Components

**Dumb (Presentational) Components** — live in `@safetyos/ui`:
- Accept data via props. No API calls. No state management hooks.
- Fully controlled: state managed by parent.
- Fully testable in isolation (Storybook + Vitest).
- Must satisfy all Design System rules (tokens, spacing, motion, a11y).

**Smart (Container) Components** — live in `apps/*/components/domain/`:
- Wire up data fetching (TanStack Query hooks), state management (Zustand), and permission evaluation.
- Compose dumb components with domain logic.
- Handle loading/error/empty states per Design System §29–§31.
- Emit telemetry events per Screen Specifications §Component IDs.

```typescript
// DUMB: @safetyos/ui — pure presentation
export function PermitCard({ permit, onApprove, onSuspend }: PermitCardProps) {
  return (
    <Card variant="status" intent={mapPermitStatusToIntent(permit.status)}>
      <CardHeader>
        <PermitTypeIcon type={permit.type} />
        <CardTitle>{permit.canonicalId}</CardTitle>
        <StatusChip status={permit.status} />
      </CardHeader>
      <CardBody>
        <MetricRow label="Zone" value={permit.zone.name} />
        <MetricRow label="Expires" value={formatRelativeTime(permit.expiresAt)} />
      </CardBody>
      <CardFooter>
        <Button variant="ghost" onClick={onSuspend}>Suspend</Button>
        <Button variant="primary" onClick={onApprove}>Approve</Button>
      </CardFooter>
    </Card>
  );
}

// SMART: apps/dashboard-web/components/domain/permits — wires data + logic
export function PermitCardContainer({ permitId }: { permitId: string }) {
  const { data: permit, isLoading, error } = usePermitQuery(permitId);
  const { canApprove, canSuspend } = usePermitPermissions(permitId);
  const approveMutation = usePermitApprove();
  const suspendMutation = usePermitSuspend();

  if (isLoading) return <PermitCardSkeleton />;
  if (error) return <PermitCardError error={error} />;
  if (!permit) return <PermitCardEmpty />;

  return (
    <PermitCard
      permit={permit}
      onApprove={canApprove ? () => approveMutation.mutate(permitId) : undefined}
      onSuspend={canSuspend ? () => suspendMutation.mutate(permitId) : undefined}
    />
  );
}
```

### 8.3 Composition Patterns

**Compound Components** — for complex interactive components (Tables, Forms, Command Palette):
```typescript
<DataTable data={incidents} columns={columns}>
  <DataTable.Toolbar>
    <DataTable.Search />
    <DataTable.FilterChips />
    <DataTable.BulkActions />
  </DataTable.Toolbar>
  <DataTable.Header />
  <DataTable.Body />
  <DataTable.Pagination />
</DataTable>
```

**Render Props** — for components that need layout flexibility:
```typescript
<ObjectPeek entityId={entityId}>
  {({ entity, actions, isLoading }) => (
    <PopoverContent>
      <EntitySummary entity={entity} />
      <ActionList actions={actions} />
    </PopoverContent>
  )}
</ObjectPeek>
```

**Slots** — for layout components with injection points:
```typescript
<WorkflowLayout
  header={<PermitHeader permit={permit} />}
  timeline={<WorkflowTimeline states={permit.stateHistory} />}
  content={<PermitDetailForm permit={permit} />}
  actions={<PermitActionBar permit={permit} />}
  related={<RelatedModulesRail entityId={permit.id} />}
/>
```

### 8.4 Reusable Component Registry

The following domain-agnostic components are mandated for reuse across all modules:

| Component | Package | Usage |
|---|---|---|
| `ObjectPeek` | `@safetyos/ui` | Hover any entity ID → popover with summary + 3 quick actions (IA §4.5) |
| `RelatedModulesRail` | `@safetyos/ui` | Right rail showing linked entities across modules |
| `ExplainabilityTrace` | `@safetyos/ui` | "Why?" button modal showing fusion path (CV → KG → CR → alert) |
| `DecisionCard` | `@safetyos/ui` | Universal HITL decision card (AG-019 broker) |
| `ConfidenceChip` | `@safetyos/ui` | AI confidence display (High/Medium/Low) with citation link |
| `StatusChip` | `@safetyos/ui` | Intent-colored status badge |
| `ScopeSelector` | `@safetyos/ui` | Org → Site → Area → Unit → Zone breadcrumb pills |
| `CommandPalette` | `@safetyos/ui` | ⌘K fuzzy command/search/AI palette |
| `HaloOrb` | `@safetyos/ui` | AI assistant orb with 9 animated states |
| `EvidenceModal` | `@safetyos/ui` | Face-blurred frame viewer with bounding box overlays |
| `FilterChipBar` | `@safetyos/ui` | AIP-160 filter expression UI |
| `EmptyState` | `@safetyos/ui` | Four archetypes: zero-state, no results, awaiting data, permission denied |

---

## 9. State Management

### 9.1 State Categories

SafetyOS separates state into five categories, each with a designated management strategy:

| Category | Tool | Persistence | Examples |
|---|---|---|---|
| **Server state** | TanStack Query v5 | In-memory cache + `staleTime` | Permits, incidents, alarms, assets, workers, KG entities |
| **Client UI state** | Zustand | In-memory (ephemeral) | Rail collapsed, panel open, active tab, split view config |
| **Server-pushed state** | WebSocket → TanStack Query | In-memory, WebSocket-refreshed | Live alarm counts, compound risk scores, muster status |
| **Form state** | React Hook Form + Zod | In-memory + autosave to server | PTW draft, incident report, LOTO checklist, site onboarding |
| **Offline state** | IndexedDB + Zustand | Persistent (IndexedDB) | Queued writes, cached permits, cached LOTO tags, offline scope |

### 9.2 Server State (TanStack Query v5)

**Configuration:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s — data considered fresh
      gcTime: 5 * 60_000,          // 5min — garbage collection
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        // Global error handler: toast + telemetry
        if (error.status === 401) triggerTokenRefresh();
        if (error.status === 403) showPermissionDeniedToast();
        trackError('mutation_error', error);
      },
    },
  },
});
```

**Query Key Convention:**

```typescript
// Module-scoped query keys
const permitKeys = {
  all: ['permits'] as const,
  lists: () => [...permitKeys.all, 'list'] as const,
  list: (filters: PermitFilters) => [...permitKeys.lists(), filters] as const,
  details: () => [...permitKeys.all, 'detail'] as const,
  detail: (id: string) => [...permitKeys.details(), id] as const,
  riskAssessment: (id: string) => [...permitKeys.detail(id), 'risk-assessment'] as const,
  conflictCheck: (id: string) => [...permitKeys.detail(id), 'conflict-check'] as const,
};
```

### 9.3 Caching Strategy

| Data Class | `staleTime` | `gcTime` | Refetch | Rationale |
|---|---|---|---|---|
| Alarms / compound risk (life-safety) | 0 (always stale) | 60s | WebSocket push | Must be real-time; never serve stale safety data |
| Permits / LOTO (workflow) | 30s | 5min | On window focus | Balance freshness with request volume |
| Incidents (investigation) | 60s | 10min | On window focus | Lower update frequency during RCA |
| Assets / equipment (reference) | 5min | 30min | Manual refetch | Rarely changes; high reuse |
| KG entities (reference) | 10min | 60min | Manual refetch | Slowly changing dimension |
| User profile / preferences | 30min | 60min | On session refresh | User-specific, low change rate |
| Feature flags | 5min | 30min | On scope change | Must pick up rollout changes |

### 9.4 Optimistic Updates

Optimistic updates are used for user-initiated state changes that should feel instant:

```typescript
const approveMutation = useMutation({
  mutationFn: (permitId: string) => api.POST('/ptw/v1/permits/{permit_id}:issue', {
    params: { path: { permit_id: permitId } },
    headers: { 'Idempotency-Key': generateIdempotencyKey() },
  }),
  onMutate: async (permitId) => {
    await queryClient.cancelQueries({ queryKey: permitKeys.detail(permitId) });
    const previous = queryClient.getQueryData(permitKeys.detail(permitId));
    queryClient.setQueryData(permitKeys.detail(permitId), (old) => ({
      ...old,
      status: 'issued',
      issuedAt: new Date().toISOString(),
    }));
    return { previous };
  },
  onError: (err, permitId, context) => {
    queryClient.setQueryData(permitKeys.detail(permitId), context?.previous);
    showErrorToast('Failed to issue permit. Changes reverted.');
  },
  onSettled: (data, error, permitId) => {
    queryClient.invalidateQueries({ queryKey: permitKeys.detail(permitId) });
    queryClient.invalidateQueries({ queryKey: permitKeys.lists() });
  },
});
```

### 9.5 Offline Queue

```typescript
// Offline queue with idempotency
interface OfflineQueueItem {
  id: string;                      // ULID
  idempotencyKey: string;          // HMAC-signed
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  createdAt: string;               // ISO 8601
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

// Queue persisted in IndexedDB, synced on reconnect
const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [] as OfflineQueueItem[],
      enqueue: (item) => set((s) => ({ queue: [...s.queue, item] })),
      dequeue: (id) => set((s) => ({ queue: s.queue.filter((i) => i.id !== id) })),
      syncAll: async () => {
        const pending = get().queue.filter((i) => i.status === 'pending');
        for (const item of pending) {
          try {
            set((s) => ({
              queue: s.queue.map((i) =>
                i.id === item.id ? { ...i, status: 'syncing' } : i
              ),
            }));
            await api[item.method](item.endpoint, {
              body: item.payload,
              headers: { 'Idempotency-Key': item.idempotencyKey },
            });
            get().dequeue(item.id);
          } catch (error) {
            set((s) => ({
              queue: s.queue.map((i) =>
                i.id === item.id ? { ...i, status: 'failed', retryCount: i.retryCount + 1 } : i
              ),
            }));
          }
        }
      },
    }),
    { name: 'safetyos-offline-queue', storage: createIndexedDBStorage() }
  )
);
```

---

## 10. Routing

### 10.1 Route Architecture

SafetyOS uses Next.js App Router with file-based routing. Route groups map to SafetyOS modules. The URL grammar follows the canonical pattern from IA §5.1:

```
/<module>/<section>/<object-id>/<sub-object>?<scope-params>
```

### 10.2 Nested Routes

```
app/
├── (auth)/                        # layout.auth
│   ├── layout.tsx                 # AuthLayout — centered card, unauthenticated
│   ├── signin/page.tsx
│   ├── mfa/page.tsx
│   ├── sso/callback/page.tsx
│   └── kiosk/page.tsx
├── (dashboard)/                   # layout.command (default)
│   ├── layout.tsx                 # DashboardLayout — authenticated shell
│   ├── home/page.tsx              # Persona-adaptive home
│   ├── console/                   # Command Console — layout.command
│   │   ├── page.tsx               # L1 Plant-wide overview
│   │   ├── site/[siteId]/page.tsx
│   │   ├── area/[areaId]/page.tsx
│   │   ├── unit/[unitId]/page.tsx
│   │   ├── asset/[assetId]/page.tsx
│   │   ├── diagnostics/[objectId]/page.tsx
│   │   ├── portfolio/page.tsx
│   │   └── wall/page.tsx
│   ├── permits/                   # PTW — layout.workflow
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Permit register
│   │   ├── new/page.tsx           # AI-assisted draft
│   │   ├── templates/page.tsx
│   │   └── [permitId]/
│   │       ├── page.tsx           # Permit detail
│   │       ├── risk-assessment/page.tsx
│   │       ├── conflict-check/page.tsx
│   │       ├── signatures/page.tsx
│   │       ├── check-in/page.tsx
│   │       └── suspend/page.tsx
│   ├── loto/                      # LOTO — layout.workflow
│   │   ├── page.tsx               # LOTO board
│   │   ├── library/page.tsx
│   │   └── isolations/[isolationId]/
│   │       ├── page.tsx
│   │       ├── points/page.tsx
│   │       ├── verification/page.tsx
│   │       └── release/page.tsx
│   ├── twin/                      # Digital Twin — layout.geospatial
│   │   ├── layout.tsx
│   │   ├── page.tsx               # 2D map
│   │   ├── 3d/page.tsx
│   │   ├── replay/page.tsx
│   │   ├── layers/page.tsx
│   │   ├── assets/[assetId]/page.tsx
│   │   └── plume/[eventId]/page.tsx
│   └── ... (all 27 modules follow same pattern)
```

### 10.3 Protected Routes

All routes under `(dashboard)/` are protected by the `AuthGuard` middleware:

```typescript
// middleware.ts — Next.js middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('safetyos-session');
  const pathname = request.nextUrl.pathname;

  // Public routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // No session → redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Validate token (lightweight check — full validation at BFF)
  if (isTokenExpired(token.value)) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Inject tenant from subdomain
  const tenantSlug = request.headers.get('host')?.split('.')[0];
  const response = NextResponse.next();
  response.headers.set('X-SafetyOS-Tenant-Slug', tenantSlug || '');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 10.4 Permission-Gated Routes

Every route evaluates OPA permissions before rendering. Unauthorized routes render a 404-shaped response (zero-trust per IA §8):

```typescript
// Permission-gated page wrapper
export default async function PermitDetailPage({
  params,
}: {
  params: { permitId: string };
}) {
  const session = await getServerSession();
  const hasPermission = await evaluateOpaPolicy('ptw.permit.read', {
    principal: session.principal,
    resource: { type: 'permit', id: params.permitId },
    tenant: session.tenantId,
  });

  if (!hasPermission) {
    notFound(); // 404-shaped denial — does not reveal existence
  }

  const permit = await fetchPermit(params.permitId);
  return <PermitDetail permit={permit} />;
}
```

### 10.5 Dynamic Routes

All entity detail routes use dynamic segments with the canonical entity ID format:

| Pattern | Example | Entity |
|---|---|---|
| `/permits/[permitId]` | `/permits/PTW-2026-04812` | Permit |
| `/loto/isolations/[isolationId]` | `/loto/isolations/LOTO-2026-00341` | LOTO Order |
| `/incidents/[incidentId]` | `/incidents/INC-2026-00089` | Incident |
| `/twin/assets/[assetId]` | `/twin/assets/AST-CDU1-P-201` | Equipment |
| `/vision/cameras/[cameraId]` | `/vision/cameras/CAM-CON-042` | Camera |
| `/vision/events/[eventId]` | `/vision/events/CVE-2026-71923` | CV Event |
| `/copilot/threads/[threadId]` | `/copilot/threads/THR-abc123` | Chat Thread |

### 10.6 Scope Persistence

Every workspace-scoped route carries scope as query parameters (IA §3):

```
/permits?org=acme&site=refA&area=coke-n&unit=cdu1
```

- Last-active scope stored per user per device in `localStorage`.
- Deep links without scope resolve to the user's default scope.
- Cross-scope navigation preserves the current page type when possible.
- ABAC evaluates on every scope change; unreachable scopes grayed out.

---

## 11. Data Fetching

### 11.1 SSR (Server-Side Rendering)

**Used for:** Initial page loads requiring authenticated data, SEO-relevant pages (docs-site), and pages where LCP depends on data availability.

```typescript
// Server Component with data fetching
export default async function PermitRegisterPage({
  searchParams,
}: {
  searchParams: PermitFilters;
}) {
  const session = await getServerSession();
  const permits = await fetchPermits(session.tenantId, searchParams);

  return (
    <Suspense fallback={<PermitTableSkeleton />}>
      <PermitRegisterTable permits={permits} />
    </Suspense>
  );
}
```

### 11.2 ISR (Incremental Static Regeneration)

**Used for:** Slowly-changing reference data pages — asset catalogs, compliance framework matrices, SOP libraries, model registry, and all docs-site pages.

```typescript
// ISR with 5-minute revalidation
export const revalidate = 300;

export default async function ComplianceFrameworkPage({
  params,
}: {
  params: { frameworkId: string };
}) {
  const framework = await fetchFramework(params.frameworkId);
  return <FrameworkMatrix framework={framework} />;
}
```

### 11.3 CSR (Client-Side Rendering)

**Used for:** Interactive pages with high user-input frequency — PTW drafting, incident RCA workspace, Digital Twin interaction, alarm management, real-time dashboards.

```typescript
// CSR with TanStack Query
'use client';

export function AlarmList() {
  const scope = useScope();
  const { data, isLoading, error } = useQuery({
    queryKey: alarmKeys.list(scope),
    queryFn: () => fetchAlarms(scope),
    staleTime: 0, // Always refetch — safety critical
    refetchInterval: false, // Use WebSocket for updates
  });

  // WebSocket integration
  useRealtimeAlarms(scope, (alarm) => {
    queryClient.setQueryData(alarmKeys.list(scope), (old) =>
      mergeAlarm(old, alarm)
    );
  });

  if (isLoading) return <AlarmListSkeleton rows={12} />;
  if (error) return <AlarmListError error={error} />;

  return <AlarmDataTable data={data} />;
}
```

### 11.4 Streaming SSR

**Used for:** Pages with mixed-latency data requirements — Command Console (fast shell + slow KPIs), Incident Detail (fast metadata + slow evidence bundle).

```typescript
// Streaming with React Suspense boundaries
export default async function ConsoleL1Page() {
  const session = await getServerSession();

  return (
    <CommandLayout>
      {/* Fast: render immediately */}
      <Suspense fallback={<KpiStripSkeleton />}>
        <KpiStrip siteId={session.siteId} />
      </Suspense>

      {/* Medium: stream when ready */}
      <Suspense fallback={<AlarmSummarySkeleton />}>
        <AlarmSummary siteId={session.siteId} />
      </Suspense>

      {/* Slow: stream last */}
      <Suspense fallback={<RiskHeatmapSkeleton />}>
        <CompoundRiskHeatmap siteId={session.siteId} />
      </Suspense>
    </CommandLayout>
  );
}
```

### 11.5 Suspense Boundaries

Every module route defines at least three Suspense boundaries:
1. **Shell Suspense** — renders the layout skeleton immediately.
2. **Primary Data Suspense** — renders the main content area data.
3. **Secondary Data Suspense** — renders side panels, related entities, AI context.

```
┌─ Shell (immediate) ────────────────────────────────────┐
│  ┌─ Primary Suspense ──────────┐ ┌─ Secondary ───────┐ │
│  │  Main content data loading  │ │  Side panel data   │ │
│  │  (skeleton)                 │ │  loading (skeleton) │ │
│  └─────────────────────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Forms

### 12.1 Form Architecture

All forms use **React Hook Form** with **Zod** resolvers from `@safetyos/validation`:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { permitDraftSchema } from '@safetyos/validation';

const form = useForm({
  resolver: zodResolver(permitDraftSchema),
  defaultValues: {
    type: 'hot_work',
    zone: '',
    description: '',
    workers: [],
    jsa: null,
  },
});
```

### 12.2 Validation Strategy

- **Client-side:** real-time on blur or on change once field has been touched. Debounce 400 ms (Design System §21.3).
- **Server-side:** on submit. Server errors surface both inline (per field) and as a form-level banner.
- **Zod schemas** shared between frontend forms and BFF request validation (`@safetyos/validation`).
- Errors display in `--intent-critical-700` text + `--intent-critical-500` border + error icon.

### 12.3 Multi-Step Wizard Forms

Used for PTW issuance, incident logging, site onboarding, LOTO procedure creation (Design System §21.4):

```typescript
const [step, setStep] = useState(0);
const steps = [
  { title: 'Type & Location', component: PermitTypeStep },
  { title: 'Risk Assessment', component: JsaStep },
  { title: 'Workers & Equipment', component: WorkersStep },
  { title: 'Conflicts', component: ConflictCheckStep },
  { title: 'Review & Submit', component: ReviewStep },
];

// Autosave every 15s while form is dirty
useAutosave(form, {
  interval: 15_000,
  endpoint: '/ptw/v1/permits/draft',
  idempotencyKey: draftId,
});
```

### 12.4 Optimistic Form Submission

For non-destructive form submissions, the UI reflects success immediately while the server confirms:

```typescript
const submitMutation = useMutation({
  mutationFn: submitPermit,
  onMutate: () => {
    showToast({ type: 'loading', message: 'Submitting permit...' });
  },
  onSuccess: (data) => {
    showToast({ type: 'success', message: `Permit ${data.canonicalId} submitted` });
    router.push(`/permits/${data.id}`);
  },
  onError: (error) => {
    showToast({ type: 'error', message: 'Submission failed. Please retry.' });
    // Focus first invalid field, scroll into view
    const firstError = Object.keys(error.fieldErrors)[0];
    form.setFocus(firstError);
  },
});
```

---

## 13. Performance

### 13.1 Code Splitting

- **Route-level splitting:** Each of the 27 modules is a lazy-loaded Next.js route chunk. Initial load only includes the shell + active module.
- **Component-level splitting:** Heavy visualization libraries dynamically imported:

```typescript
const DigitalTwin3D = dynamic(() => import('./digital-twin-3d'), {
  loading: () => <TwinSkeleton />,
  ssr: false, // Three.js requires browser APIs
});

const RiskMatrix = dynamic(() => import('./risk-matrix'), {
  loading: () => <RiskMatrixSkeleton />,
});
```

### 13.2 Image Optimization

- Next.js `<Image>` component with automatic WebP/AVIF conversion.
- `priority` prop on above-the-fold images (KPI hero numbers, logo).
- `loading="lazy"` on all below-the-fold images.
- CV evidence frames served from the BFF with face-blur applied server-side (CV-021).
- Responsive `srcSet` for camera thumbnails (240w, 480w, 720w).

### 13.3 Lazy Loading

- **Virtual scrolling** for all lists >50 rows (TanStack Virtual).
- **Intersection Observer** triggers for chart rendering (charts render only when scrolled into view).
- **Deferred hydration** for below-the-fold sections using React 19 `use()`.

### 13.4 Prefetching

- **Route prefetch:** Next.js `<Link prefetch>` on visible navigation items.
- **Data prefetch:** TanStack Query `prefetchQuery` on hover for likely navigation targets (permit detail from permit list row).
- **Module prefetch:** Background prefetch of commonly accessed modules based on persona navigation patterns.

### 13.5 Caching

- **Static assets:** Immutable `Cache-Control` with content-hash filenames. CDN edge caching.
- **API responses:** `Cache-Control` headers from BFF; TanStack Query in-memory cache as secondary layer.
- **Service Worker:** Stale-while-revalidate for static assets; network-first for API data.

### 13.6 Virtualization

- **DataTable/DataGrid:** TanStack Virtual for 200+ row tables. Row height stable to prevent layout thrash.
- **Camera wall:** Virtual grid for 12+ camera feeds. Only visible cameras render WebRTC/HLS streams.
- **Timeline:** Virtual scroll for incident timelines with 1000+ events.
- **Digital Twin:** LOD (Level of Detail) swap on distance for 3D meshes. Instanced rendering for repeated equipment.

---

## 14. Accessibility

### 14.1 WCAG 2.2 AA Baseline

Every surface in SafetyOS meets WCAG 2.2 AA. This includes:

- **Perceivable:** All non-text content has text alternatives. Color is not the sole means of conveying information. Text contrast ≥ 4.5:1 (body), ≥ 3:1 (large text, UI components). Content is adaptable and distinguishable.
- **Operable:** All functionality available from keyboard. No keyboard traps. Timing is adjustable (except safety alerts). No content that flashes >3 times/second. Multiple ways to navigate (navigation, search, sitemap). Focus visible on all interactive elements.
- **Understandable:** Language identified. Consistent navigation. Consistent identification. Input assistance (error identification, labels, suggestions, prevention).
- **Robust:** Content parseable. Name, role, value exposed. Status messages use ARIA live regions.

### 14.2 WCAG 2.2 AAA for Safety-Critical Surfaces

The following surfaces require AAA compliance:
- Command Console (L1–L4)
- Emergency Response (declare, active, muster)
- Alarm Management (live list, flood detector)
- LOTO Verification (zero-energy confirmation)
- PTW Approval (multi-role sign-off)
- AI Kill-Switch (AG-020)

AAA requirements include:
- Enhanced contrast ratios: ≥ 7:1 for normal text.
- Sign language interpretation for video content.
- Extended audio descriptions.
- No interruptions for critical tasks.
- Re-authentication preserves data.

### 14.3 Keyboard Navigation

- **Focus management:** `focusTrap` on modals, sheets, and command palette (Radix UI primitives).
- **Skip links:** "Skip to main content" link at the top of every page.
- **Focus ring:** 2px inset + 2px outer glow (`--shadow-focus`), visible only on `:focus-visible`.
- **Arrow key navigation:** Data tables, sidebars, menu items.
- **Keyboard shortcut registry:** Documented shortcuts per Screen Specifications. Conflicts resolved by scope (modal shortcuts override page shortcuts).

### 14.4 Screen Reader Optimization

- **ARIA landmarks:** `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>` on every page.
- **Live regions:** `aria-live="polite"` for data updates, `aria-live="assertive"` for safety alerts.
- **Accessible names:** Every interactive element has a programmatically determinable name.
- **Chart alternatives:** Every chart renders a hidden `<table>` with `aria-describedby` for screen reader data access.
- **Agent narration:** AI streaming responses announced politely with configurable verbosity.

### 14.5 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* Exception: life-safety indicators still animate */
  .life-safety-indicator { animation-duration: 120ms !important; }
}
```

---

## 15. Security

### 15.1 XSS Prevention

- **React escaping:** All dynamic content rendered through React's built-in JSX escaping. No `dangerouslySetInnerHTML` without `DOMPurify.sanitize()`.
- **Content Security Policy:**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.safetyos.app;
  connect-src 'self' https://*.safetyos.app wss://*.safetyos.app;
  font-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

- **Trusted Types:** Enforced for DOM sink operations where supported.

### 15.2 CSRF Protection

- **SameSite cookies:** `SameSite=Strict` on session cookies prevents cross-origin cookie sending.
- **Double-submit pattern:** CSRF token in a cookie + request header for state-changing operations.
- **Origin validation:** BFF validates `Origin` and `Referer` headers against allowed origins.

### 15.3 Token Storage

```
┌─────────────────────────────────────────────────────────┐
│  Token Storage Architecture                              │
│                                                          │
│  Access Token (10 min JWT):                              │
│    → Stored in memory (JavaScript variable)              │
│    → Passed via Authorization header                     │
│    → Lost on page refresh (re-obtained via refresh flow) │
│                                                          │
│  Refresh Token (24 h):                                   │
│    → Stored in HttpOnly, Secure, SameSite=Strict cookie  │
│    → Sent only to /v2/session/refresh endpoint           │
│    → Rotating: each use issues a new refresh token       │
│                                                          │
│  Tenant ID:                                              │
│    → Derived from subdomain at middleware level           │
│    → Not stored client-side                              │
│                                                          │
│  NEVER stored in:                                        │
│    → localStorage                                        │
│    → sessionStorage                                      │
│    → URL query parameters                                │
│    → Non-HttpOnly cookies                                │
└─────────────────────────────────────────────────────────┘
```

### 15.4 Secrets Management

- **No secrets in frontend bundles.** All API keys, signing keys, and service credentials are server-side only (BFF or backend).
- **Environment variables:** Only `NEXT_PUBLIC_*` variables are exposed to the client bundle. These contain only public identifiers (API URL, Sentry DSN, analytics key).
- **Build-time validation:** CI pipeline validates that no secret patterns appear in client-accessible code.

### 15.5 Dependency Security

- **Automated dependency scanning:** Snyk/GitHub Dependabot on every PR.
- **Lock file integrity:** `pnpm-lock.yaml` committed and verified by CI.
- **SRI hashes:** All CDN-loaded scripts include `integrity` attributes.
- **License audit:** Only OSI-approved licenses permitted. GPL/AGPL dependencies blocked by CI.

---

## 16. Testing

### 16.1 Test Pyramid

```
                    ┌───────────┐
                    │   E2E     │   10% — Critical user flows
                    │ Playwright│   (UF-AUTH-001, UF-PTWC-001, UF-ER-001)
                    ├───────────┤
                    │  Visual   │   15% — Component visual regression
                    │ Chromatic │   (every @safetyos/ui component)
                    ├───────────┤
                  │ Integration │   25% — Component + API integration
                  │  MSW + RTL  │   (data fetching, mutations, WebSocket)
                  ├─────────────┤
              │    Unit Tests    │   50% — Component logic, hooks, utils
              │   Vitest + RTL   │   (every exported function/component)
              └──────────────────┘
```

### 16.2 Unit Tests

**Tool:** Vitest + React Testing Library.
**Coverage target:** ≥80% statement coverage per package, ≥90% for `@safetyos/validation` and `@safetyos/utils`.
**Convention:** Test files colocated: `component.tsx` → `component.test.tsx`.

### 16.3 Integration Tests

**Tool:** Vitest + React Testing Library + MSW (Mock Service Worker).
**Coverage:** Every user-facing data flow has an integration test verifying:
- Loading state renders skeleton.
- Error state renders error boundary with correlation ID.
- Empty state renders appropriate empty state archetype.
- Data state renders correct content.
- Mutation triggers optimistic update and server sync.

### 16.4 Visual Regression Tests

**Tool:** Chromatic (Storybook visual testing).
**Coverage:** Every `@safetyos/ui` component variant × state × theme (light/dark) × density (comfortable/compact).
**Approval workflow:** Design Systems Squad must approve visual diffs before merge.

### 16.5 End-to-End Tests

**Tool:** Playwright.
**Coverage:** The 68 primary user flows from User Flow Specification (UF-AUTH-*, UF-PTWC-*, UF-LOTO-*, UF-ER-*, UF-INC-*, UF-COP-*, etc.) each have a corresponding E2E test.
**Component IDs:** All interactive elements use stable component IDs from Screen Specifications (e.g., `shell.topbar`, `command.input`, `permit.detail.approve.btn`) as Playwright locators.

### 16.6 Accessibility Tests

**Tool:** axe-core (automated) + Playwright (keyboard navigation) + manual screen reader audit.
**Coverage:**
- Every page runs `axe-core` assertions in CI (zero violations at AA level).
- Safety-critical pages run enhanced assertions at AAA level.
- Keyboard navigation tests verify tab order, focus management, and shortcut functionality.
- Quarterly manual screen reader audit (NVDA, VoiceOver, JAWS).

---

## 17. Build System

### 17.1 Package Manager — pnpm

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
  - 'tooling/*'
```

- **Strict mode:** `pnpm install --frozen-lockfile` in CI.
- **Content-addressable storage:** Shared dependency deduplication across all workspaces.
- **Overrides:** Centralized dependency version pinning in root `package.json`.

### 17.2 Build Orchestration — Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "env": ["NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["test-results/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "storybook:build": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"]
    }
  }
}
```

- **Remote caching:** Turborepo remote cache (Vercel or self-hosted) for CI/CD build acceleration.
- **Affected-only builds:** Only packages changed in a PR rebuild; dependencies propagate.

### 17.3 TypeScript

- **Strict mode:** `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Project references:** Each package has a `tsconfig.json` extending `tsconfig.base.json`.
- **Path aliases:** `@safetyos/*` mapped to workspace packages.
- **Incremental builds:** `tsBuildInfoFile` for incremental type checking.

### 17.4 ESLint

```javascript
// tooling/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/strict',
    'plugin:import/typescript',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  plugins: ['safetyos-architecture'],
  rules: {
    // Architecture enforcement
    'safetyos-architecture/no-cross-app-imports': 'error',
    'safetyos-architecture/no-direct-api-calls': 'error', // Must use @safetyos/api-client
    'safetyos-architecture/no-hardcoded-tokens': 'error', // Must use design tokens
    'safetyos-architecture/no-unsafe-innerhtml': 'error',
    'safetyos-architecture/require-component-id': 'error', // Screen Spec component IDs
    'safetyos-architecture/require-error-boundary': 'error',
    'safetyos-architecture/require-loading-state': 'error',
    'safetyos-architecture/require-empty-state': 'error',

    // Accessibility
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/aria-props': 'error',

    // Import order
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [{ pattern: '@safetyos/**', group: 'internal' }],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
  },
};
```

### 17.5 Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 17.6 Husky + Commitlint

```bash
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit $1
```

```javascript
// .commitlintrc.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'ui', 'tokens', 'icons', 'types', 'api-client', 'validation',
      'hooks', 'utils', 'config', 'analytics', 'i18n', 'test-utils',
      'dashboard', 'admin', 'mobile', 'copilot', 'docs',
      'console-bff', 'mobile-bff', 'edge-bff',
      'infra', 'tooling', 'ci',
    ]],
    'type-enum': [2, 'always', [
      'feat', 'fix', 'perf', 'refactor', 'docs', 'test',
      'build', 'ci', 'chore', 'revert', 'style', 'a11y', 'security',
    ]],
  },
};
```

### 17.7 lint-staged

```json
// package.json (root)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"],
    "*.{ts,tsx}": ["vitest related --run"]
  }
}
```

---

## 18. Coding Standards

### 18.1 Folder Naming

- **kebab-case** for all folders: `compound-risk/`, `shift-handover/`, `data-table/`.
- **No abbreviations** except canonical module prefixes (CV, OT, KG, CR, PTW, LOTO).
- **Flat over nested:** Prefer `components/permit-card.tsx` over `components/permits/card/card.tsx` unless the component has co-located tests, stories, and styles.

### 18.2 File Naming

- **Components:** `kebab-case.tsx` — `permit-card.tsx`, `alarm-data-table.tsx`, `halo-orb.tsx`.
- **Hooks:** `use-kebab-case.ts` — `use-scope.ts`, `use-realtime-alarms.ts`, `use-permit-query.ts`.
- **Providers:** `kebab-case-provider.tsx` — `auth-provider.tsx`, `scope-provider.tsx`.
- **Stores:** `kebab-case-store.ts` — `shell-store.ts`, `notification-store.ts`.
- **Types:** `kebab-case.ts` — `permit.ts`, `incident.ts`, `compound-risk.ts`.
- **Tests:** `kebab-case.test.tsx` — colocated with source file.
- **Stories:** `kebab-case.stories.tsx` — colocated with component.
- **Utilities:** `kebab-case.ts` — `date-helpers.ts`, `scope-utils.ts`.

### 18.3 Import Rules

```typescript
// 1. External dependencies
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. SafetyOS packages (alphabetical)
import { Button, Card, DataTable } from '@safetyos/ui';
import { permitSchema } from '@safetyos/validation';
import type { Permit } from '@safetyos/shared-types';

// 3. App-internal (relative)
import { usePermitPermissions } from '@/hooks/use-permit-permissions';
import { PermitActionBar } from '@/components/domain/permits/permit-action-bar';
```

### 18.4 Component Naming

- **PascalCase** for React components: `PermitCard`, `HaloOrb`, `CommandPalette`.
- **Props interface:** `{ComponentName}Props` — `PermitCardProps`, `HaloOrbProps`.
- **Compound components:** `DataTable.Header`, `DataTable.Body`, `DataTable.Pagination`.
- **Container suffix:** `{Component}Container` for smart wrappers — `PermitCardContainer`.
- **Skeleton suffix:** `{Component}Skeleton` for loading states — `PermitCardSkeleton`.
- **Error suffix:** `{Component}Error` for error states — `PermitCardError`.

### 18.5 Hook Naming

- **`use` prefix:** All hooks start with `use`.
- **Query hooks:** `use{Entity}Query` — `usePermitQuery`, `useAlarmListQuery`.
- **Mutation hooks:** `use{Entity}{Action}` — `usePermitApprove`, `usePermitSuspend`.
- **Subscription hooks:** `useRealtime{Entity}` — `useRealtimeAlarms`, `useRealtimeMuster`.
- **Permission hooks:** `use{Entity}Permissions` — `usePermitPermissions`.

### 18.6 Provider Naming

- **`{Domain}Provider` suffix:** `AuthProvider`, `ScopeProvider`, `PersonaProvider`.
- **Context naming:** `{Domain}Context` — `AuthContext`, `ScopeContext`.
- **Hook for context:** `use{Domain}` — `useAuth`, `useScope`, `usePersona`.

### 18.7 Component ID Convention

Per Screen Specifications §2: `{screenNamespace}.{region}.{component}[.{state}]`

```typescript
// Stable component IDs for Playwright, analytics, and telemetry
<Button data-component-id="permit.detail.approve.btn" />
<DataTable data-component-id="incidents.register.table" />
<CommandPalette data-component-id="command.input" />
<HaloOrb data-component-id="global.ai.orb" />
```

---

## 19. Repository Conventions

### 19.1 Complete Production Repository Tree

```
SafetyOS/
│
├── apps/
│   │
│   ├── dashboard-web/                          # PRIMARY WEB APPLICATION
│   │   │   Purpose: Renders all 27 module surfaces, 7 ISA-101 layout families,
│   │   │   80+ screens. Used by Sanjay, Anita, Deepak, Vikram, Meena, Kavya.
│   │   │   Technology: Next.js 15, React 19, Tailwind CSS 4
│   │   │
│   │   ├── app/                                # Next.js App Router
│   │   │   ├── (auth)/                         # Unauthenticated layout group
│   │   │   │   ├── layout.tsx                  # AuthLayout (centered card)
│   │   │   │   ├── signin/page.tsx             # UF-AUTH-001 SSO sign-in
│   │   │   │   ├── mfa/page.tsx                # UF-AUTH-003 step-up MFA
│   │   │   │   ├── sso/callback/page.tsx       # OIDC/SAML callback handler
│   │   │   │   └── kiosk/page.tsx              # Contractor onboarding kiosk
│   │   │   │
│   │   │   ├── (dashboard)/                    # Authenticated layout group
│   │   │   │   ├── layout.tsx                  # DashboardLayout (app shell)
│   │   │   │   ├── home/page.tsx               # Persona-adaptive home (IA §9)
│   │   │   │   │
│   │   │   │   ├── console/                    # MODULE 15: Command Console (ISA-101)
│   │   │   │   │   ├── layout.tsx              # layout.command
│   │   │   │   │   ├── page.tsx                # L1 Plant-wide overview
│   │   │   │   │   ├── site/[siteId]/page.tsx  # L1 Site scoped
│   │   │   │   │   ├── area/[areaId]/page.tsx  # L2 Area scoped
│   │   │   │   │   ├── unit/[unitId]/page.tsx  # L2/L3 Unit scoped
│   │   │   │   │   ├── asset/[assetId]/page.tsx # L3 Asset detail
│   │   │   │   │   ├── diagnostics/[objectId]/page.tsx # L4 Diagnostics
│   │   │   │   │   ├── portfolio/page.tsx      # Executive portfolio (Meena)
│   │   │   │   │   └── wall/page.tsx           # Wall display kiosk mode
│   │   │   │   │
│   │   │   │   ├── twin/                       # MODULE 10: Digital Twin
│   │   │   │   │   ├── layout.tsx              # layout.geospatial
│   │   │   │   │   ├── page.tsx                # 2D site map (deck.gl + MapLibre)
│   │   │   │   │   ├── 3d/page.tsx             # 3D scene (Three.js)
│   │   │   │   │   ├── replay/page.tsx         # Time-scrub replay
│   │   │   │   │   ├── layers/page.tsx         # Layer manager
│   │   │   │   │   ├── assets/[assetId]/page.tsx
│   │   │   │   │   └── plume/[eventId]/page.tsx # Gas plume simulation
│   │   │   │   │
│   │   │   │   ├── permits/                    # MODULE 5: Permit-to-Work
│   │   │   │   │   ├── layout.tsx              # layout.workflow
│   │   │   │   │   ├── page.tsx                # Permit register
│   │   │   │   │   ├── new/page.tsx            # AI-assisted draft
│   │   │   │   │   ├── templates/page.tsx      # Permit templates
│   │   │   │   │   └── [permitId]/
│   │   │   │   │       ├── page.tsx            # Permit detail
│   │   │   │   │       ├── risk-assessment/page.tsx # JSA/HIRA
│   │   │   │   │       ├── conflict-check/page.tsx  # Spatial+temporal conflicts
│   │   │   │   │       ├── signatures/page.tsx      # Multi-role sign-off
│   │   │   │   │       ├── check-in/page.tsx        # NFC/geofence check-in
│   │   │   │   │       └── suspend/page.tsx         # Suspension workflow
│   │   │   │   │
│   │   │   │   ├── loto/                       # MODULE 6: Lockout/Tagout
│   │   │   │   │   ├── layout.tsx              # layout.workflow
│   │   │   │   │   ├── page.tsx                # LOTO board
│   │   │   │   │   ├── library/page.tsx        # Isolation procedures
│   │   │   │   │   └── isolations/[isolationId]/
│   │   │   │   │       ├── page.tsx            # Isolation detail
│   │   │   │   │       ├── points/page.tsx     # Isolation-point checklist
│   │   │   │   │       ├── verification/page.tsx # Zero-energy verification
│   │   │   │   │       └── release/page.tsx    # Controlled release
│   │   │   │   │
│   │   │   │   ├── handover/                   # MODULE 7: Shift Handover
│   │   │   │   │   ├── layout.tsx              # layout.workflow
│   │   │   │   │   ├── page.tsx                # Handover queue
│   │   │   │   │   ├── history/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── [handoverId]/
│   │   │   │   │       ├── page.tsx            # Handover packet
│   │   │   │   │       ├── quiz/page.tsx       # Comprehension quiz
│   │   │   │   │       └── acknowledge/page.tsx # Sign-off
│   │   │   │   │
│   │   │   │   ├── incidents/                  # MODULE 8: Incident Management
│   │   │   │   │   ├── layout.tsx              # layout.workflow
│   │   │   │   │   ├── page.tsx                # Incident register
│   │   │   │   │   ├── new/page.tsx            # Rapid capture
│   │   │   │   │   └── [incidentId]/
│   │   │   │   │       ├── page.tsx            # Incident summary
│   │   │   │   │       ├── timeline/page.tsx   # Auto-assembled timeline
│   │   │   │   │       ├── evidence/page.tsx   # Evidence bundle
│   │   │   │   │       ├── rca/page.tsx        # Root-cause workspace
│   │   │   │   │       ├── actions/page.tsx    # CAPA tracker
│   │   │   │   │       └── report/page.tsx     # Regulatory report drafter
│   │   │   │   │
│   │   │   │   ├── emergency/                  # MODULE 9: Emergency Response
│   │   │   │   │   ├── layout.tsx              # layout.command (crisis mode)
│   │   │   │   │   ├── page.tsx                # Readiness dashboard
│   │   │   │   │   ├── declare/page.tsx        # Declare emergency (dual-confirm)
│   │   │   │   │   ├── active/[incidentId]/page.tsx # Live command surface
│   │   │   │   │   ├── playbooks/page.tsx      # Playbook library
│   │   │   │   │   ├── muster/page.tsx         # Muster status + headcount
│   │   │   │   │   ├── drills/page.tsx         # Drill scheduler
│   │   │   │   │   └── broadcasts/page.tsx     # PA/mass-notify composer
│   │   │   │   │
│   │   │   │   ├── risk/                       # MODULE 4: Compound Risk
│   │   │   │   │   ├── layout.tsx              # layout.command
│   │   │   │   │   ├── page.tsx                # Live compound-risk heatmap
│   │   │   │   │   ├── rules/page.tsx          # Rule library
│   │   │   │   │   ├── rules/[ruleId]/page.tsx # Rule detail + backtest
│   │   │   │   │   ├── events/page.tsx         # Active + historical events
│   │   │   │   │   ├── events/[eventId]/page.tsx # Event detail + fusion trace
│   │   │   │   │   ├── simulator/page.tsx      # What-if simulator
│   │   │   │   │   ├── patterns/page.tsx       # Pattern registry (vNext)
│   │   │   │   │   ├── patterns/new/page.tsx   # Pattern authoring
│   │   │   │   │   └── shadow-mode/page.tsx    # Shadow mode dashboard
│   │   │   │   │
│   │   │   │   ├── alarms/                     # MODULE 14: Alarm Rationalization
│   │   │   │   │   ├── layout.tsx              # layout.command
│   │   │   │   │   ├── page.tsx                # Live alarm list
│   │   │   │   │   ├── floods/page.tsx         # Alarm flood detector
│   │   │   │   │   ├── shelved/page.tsx        # Shelved alarms
│   │   │   │   │   ├── rationalization/page.tsx # Rationalization workshop
│   │   │   │   │   └── kpis/page.tsx           # ISA-18.2 KPIs
│   │   │   │   │
│   │   │   │   ├── predictive/                 # MODULE 13: Predictive Analytics
│   │   │   │   │   ├── layout.tsx              # layout.analytics
│   │   │   │   │   ├── page.tsx                # Prediction hub
│   │   │   │   │   ├── gas/page.tsx            # Gas concentration forecasts
│   │   │   │   │   ├── rul/page.tsx            # Remaining Useful Life
│   │   │   │   │   ├── fatigue/page.tsx        # Worker fatigue index
│   │   │   │   │   └── models/page.tsx         # Model performance
│   │   │   │   │
│   │   │   │   ├── vision/                     # MODULE 1: Computer Vision
│   │   │   │   │   ├── layout.tsx              # layout.admin
│   │   │   │   │   ├── page.tsx                # Vision operations dashboard
│   │   │   │   │   ├── cameras/page.tsx        # Camera fleet
│   │   │   │   │   ├── cameras/[cameraId]/page.tsx
│   │   │   │   │   ├── cameras/[cameraId]/calibration/page.tsx # CV-024
│   │   │   │   │   ├── cameras/[cameraId]/zones/page.tsx       # Zone editor
│   │   │   │   │   ├── cameras/fairness/page.tsx               # CV-030
│   │   │   │   │   ├── cameras/transparency/page.tsx           # CV-031
│   │   │   │   │   ├── events/page.tsx         # CV event stream
│   │   │   │   │   ├── events/[eventId]/page.tsx
│   │   │   │   │   ├── models/page.tsx         # Deployed model roster
│   │   │   │   │   ├── zones/page.tsx          # Detection zones editor
│   │   │   │   │   └── privacy/page.tsx        # Face blur + PII controls
│   │   │   │   │
│   │   │   │   ├── ot/                         # MODULE 2: OT/SCADA Integration
│   │   │   │   │   ├── layout.tsx              # layout.admin
│   │   │   │   │   ├── page.tsx                # OT integration health
│   │   │   │   │   ├── connectors/page.tsx     # Connector inventory
│   │   │   │   │   ├── connectors/[connectorId]/page.tsx
│   │   │   │   │   ├── connectors/[connectorId]/resolve/page.tsx # Tag resolver
│   │   │   │   │   ├── connectors/[connectorId]/backfill/page.tsx
│   │   │   │   │   ├── connectors/simulator/page.tsx # SCADA simulator
│   │   │   │   │   ├── tags/page.tsx           # Tag browser
│   │   │   │   │   ├── tags/[tagId]/page.tsx
│   │   │   │   │   ├── normalization/page.tsx  # Unit/schema normalization
│   │   │   │   │   └── quality/page.tsx        # Data-quality watchdogs
│   │   │   │   │
│   │   │   │   ├── iot/                        # MODULE 19: Wearables & IoT
│   │   │   │   │   ├── layout.tsx              # layout.admin
│   │   │   │   │   ├── page.tsx                # IoT dashboard
│   │   │   │   │   ├── devices/page.tsx        # Device inventory
│   │   │   │   │   ├── devices/[deviceId]/page.tsx
│   │   │   │   │   ├── telemetry/[workerId]/page.tsx # Worker telemetry
│   │   │   │   │   └── geofences/page.tsx      # Geofence editor
│   │   │   │   │
│   │   │   │   ├── knowledge/                  # MODULE 3: Knowledge Graph
│   │   │   │   │   ├── layout.tsx              # layout.analytics
│   │   │   │   │   ├── page.tsx                # KG overview
│   │   │   │   │   ├── browse/page.tsx         # Graph explorer (React Flow)
│   │   │   │   │   ├── browse/ontology/page.tsx # Ontology editor
│   │   │   │   │   ├── browse/import/page.tsx  # Bulk entity importer
│   │   │   │   │   ├── entities/[entityId]/page.tsx
│   │   │   │   │   ├── queries/page.tsx        # Saved SPARQL/Cypher
│   │   │   │   │   └── lineage/[entityId]/page.tsx
│   │   │   │   │
│   │   │   │   ├── copilot/                    # MODULES 11-12: RAG + Agents
│   │   │   │   │   ├── layout.tsx              # AI-native layout
│   │   │   │   │   ├── page.tsx                # Chat workspace
│   │   │   │   │   ├── threads/[threadId]/page.tsx
│   │   │   │   │   ├── sources/page.tsx        # Source library
│   │   │   │   │   ├── prompts/page.tsx        # Prompt library
│   │   │   │   │   ├── citations/[citationId]/page.tsx
│   │   │   │   │   └── agents/
│   │   │   │   │       ├── page.tsx            # Agent roster
│   │   │   │   │       ├── [agentId]/page.tsx  # Agent card
│   │   │   │   │       ├── [agentId]/runs/[runId]/page.tsx
│   │   │   │   │       ├── hitl/page.tsx       # Human-in-loop inbox
│   │   │   │   │       └── kill-switch/page.tsx # AG-020
│   │   │   │   │
│   │   │   │   ├── workforce/                  # MODULE 17: Contractors
│   │   │   │   │   ├── layout.tsx              # layout.analytics
│   │   │   │   │   ├── page.tsx                # Workforce overview
│   │   │   │   │   ├── contractors/page.tsx
│   │   │   │   │   ├── contractors/[companyId]/page.tsx
│   │   │   │   │   ├── workers/[workerId]/page.tsx
│   │   │   │   │   ├── workers/[workerId]/passport/page.tsx
│   │   │   │   │   ├── onboarding/page.tsx
│   │   │   │   │   └── certifications/page.tsx
│   │   │   │   │
│   │   │   │   ├── compliance/                 # MODULE 18: Compliance & Audit
│   │   │   │   │   ├── layout.tsx              # layout.analytics
│   │   │   │   │   ├── page.tsx                # Compliance dashboard
│   │   │   │   │   ├── frameworks/page.tsx
│   │   │   │   │   ├── frameworks/[frameworkId]/page.tsx
│   │   │   │   │   ├── controls/[controlId]/page.tsx
│   │   │   │   │   ├── evidence/page.tsx       # Immutable evidence explorer
│   │   │   │   │   ├── audits/page.tsx
│   │   │   │   │   ├── audits/[auditId]/page.tsx
│   │   │   │   │   ├── auditor/page.tsx        # Auditor portal (vNext)
│   │   │   │   │   └── reports/page.tsx
│   │   │   │   │
│   │   │   │   ├── notifications/              # MODULE 22: Notifications
│   │   │   │   │   ├── page.tsx                # Inbox
│   │   │   │   │   ├── preferences/page.tsx
│   │   │   │   │   ├── rules/page.tsx          # Routing rules
│   │   │   │   │   ├── channels/page.tsx
│   │   │   │   │   ├── templates/page.tsx
│   │   │   │   │   └── history/page.tsx
│   │   │   │   │
│   │   │   │   ├── search/page.tsx             # Global search results
│   │   │   │   └── me/                         # User profile
│   │   │   │       ├── page.tsx
│   │   │   │       ├── profile/page.tsx
│   │   │   │       ├── preferences/page.tsx
│   │   │   │       ├── sessions/page.tsx
│   │   │   │       └── devices/page.tsx
│   │   │   │
│   │   │   ├── api/                            # API routes (if BFF colocated)
│   │   │   │   └── health/route.ts
│   │   │   ├── layout.tsx                      # Root layout
│   │   │   ├── loading.tsx                     # Root skeleton
│   │   │   ├── error.tsx                       # Root error boundary
│   │   │   ├── not-found.tsx                   # 404 (zero-trust denial)
│   │   │   └── global-error.tsx                # Unrecoverable error
│   │   │
│   │   ├── components/
│   │   │   ├── domain/                         # Per-module domain components
│   │   │   │   ├── console/                    # Command Console components
│   │   │   │   │   ├── kpi-strip.tsx
│   │   │   │   │   ├── alarm-summary.tsx
│   │   │   │   │   ├── risk-heatmap.tsx
│   │   │   │   │   ├── camera-wall.tsx
│   │   │   │   │   └── wall-display.tsx
│   │   │   │   ├── permits/
│   │   │   │   │   ├── permit-register-table.tsx
│   │   │   │   │   ├── permit-draft-wizard.tsx
│   │   │   │   │   ├── permit-detail-form.tsx
│   │   │   │   │   ├── conflict-check-panel.tsx
│   │   │   │   │   └── signature-pad.tsx
│   │   │   │   ├── loto/
│   │   │   │   │   ├── loto-board.tsx
│   │   │   │   │   ├── isolation-checklist.tsx
│   │   │   │   │   └── zero-energy-verification.tsx
│   │   │   │   ├── incidents/
│   │   │   │   │   ├── incident-register.tsx
│   │   │   │   │   ├── incident-timeline.tsx
│   │   │   │   │   ├── rca-workspace.tsx
│   │   │   │   │   ├── evidence-bundle.tsx
│   │   │   │   │   └── capa-tracker.tsx
│   │   │   │   ├── emergency/
│   │   │   │   │   ├── emergency-declare.tsx
│   │   │   │   │   ├── muster-status.tsx
│   │   │   │   │   ├── playbook-executor.tsx
│   │   │   │   │   └── broadcast-composer.tsx
│   │   │   │   ├── risk/
│   │   │   │   │   ├── risk-heatmap.tsx
│   │   │   │   │   ├── fusion-trace-modal.tsx
│   │   │   │   │   ├── pattern-editor.tsx
│   │   │   │   │   └── what-if-simulator.tsx
│   │   │   │   ├── twin/
│   │   │   │   │   ├── twin-viewport.tsx
│   │   │   │   │   ├── twin-3d-scene.tsx
│   │   │   │   │   ├── layer-panel.tsx
│   │   │   │   │   ├── time-scrubber.tsx
│   │   │   │   │   └── equipment-card-3d.tsx
│   │   │   │   ├── alarms/
│   │   │   │   │   ├── alarm-data-table.tsx
│   │   │   │   │   ├── alarm-flood-detector.tsx
│   │   │   │   │   └── isa-18-2-kpis.tsx
│   │   │   │   ├── vision/
│   │   │   │   │   ├── camera-fleet-grid.tsx
│   │   │   │   │   ├── camera-detail.tsx
│   │   │   │   │   ├── cv-event-stream.tsx
│   │   │   │   │   ├── bounding-box-overlay.tsx
│   │   │   │   │   └── homography-calibrator.tsx
│   │   │   │   ├── copilot/
│   │   │   │   │   ├── copilot-dock.tsx
│   │   │   │   │   ├── halo-orb-trigger.tsx
│   │   │   │   │   └── reasoning-panel.tsx
│   │   │   │   ├── knowledge/
│   │   │   │   │   ├── graph-explorer.tsx
│   │   │   │   │   ├── entity-detail.tsx
│   │   │   │   │   └── ontology-editor.tsx
│   │   │   │   ├── workforce/
│   │   │   │   │   ├── contractor-scorecard.tsx
│   │   │   │   │   ├── safety-passport.tsx
│   │   │   │   │   └── certification-matrix.tsx
│   │   │   │   ├── compliance/
│   │   │   │   │   ├── framework-matrix.tsx
│   │   │   │   │   ├── evidence-explorer.tsx
│   │   │   │   │   └── audit-workspace.tsx
│   │   │   │   ├── predictive/
│   │   │   │   │   ├── prediction-hub.tsx
│   │   │   │   │   ├── gas-forecast-chart.tsx
│   │   │   │   │   └── rul-board.tsx
│   │   │   │   ├── ot/
│   │   │   │   │   ├── connector-inventory.tsx
│   │   │   │   │   ├── tag-browser.tsx
│   │   │   │   │   └── data-quality-monitor.tsx
│   │   │   │   ├── iot/
│   │   │   │   │   ├── device-inventory.tsx
│   │   │   │   │   ├── worker-telemetry.tsx
│   │   │   │   │   └── geofence-editor.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── notification-inbox.tsx
│   │   │   │   │   ├── routing-rules-editor.tsx
│   │   │   │   │   └── escalation-ladder.tsx
│   │   │   │   └── data/
│   │   │   │       ├── lakehouse-browser.tsx
│   │   │   │       ├── model-registry.tsx
│   │   │   │       └── feature-store.tsx
│   │   │   │
│   │   │   ├── shell/                          # App shell components
│   │   │   │   ├── topbar.tsx
│   │   │   │   ├── left-rail.tsx
│   │   │   │   ├── context-panel.tsx
│   │   │   │   ├── scope-selector.tsx
│   │   │   │   ├── persona-tabs.tsx
│   │   │   │   ├── offline-banner.tsx
│   │   │   │   ├── toast-stack.tsx
│   │   │   │   ├── emergency-beacon.tsx
│   │   │   │   └── split-view.tsx
│   │   │   │
│   │   │   └── shared/                         # App-shared components
│   │   │       ├── object-peek.tsx
│   │   │       ├── related-modules-rail.tsx
│   │   │       ├── explainability-trace.tsx
│   │   │       ├── decision-inbox.tsx
│   │   │       └── workflow-timeline.tsx
│   │   │
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── layouts/
│   │   ├── store/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── assets/
│   │   ├── tests/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── vitest.config.ts
│   │
│   ├── admin-portal/                           # ADMIN & PLATFORM APPLICATION
│   │   │   Purpose: Tenant mgmt, security, MLOps, marketplace. Used by Arjun, Neha.
│   │   │   Technology: Next.js 15, Monaco Editor, React Flow
│   │   │
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (platform)/                     # Admin, sites, features, health
│   │   │   ├── (security)/                     # Identity, policies, audit
│   │   │   ├── (data)/                         # Lakehouse, models, labeling
│   │   │   ├── (workflows)/                    # Temporal, policies, approvals
│   │   │   ├── (marketplace)/                  # Catalog, webhooks, developer
│   │   │   └── (observability)/                # SLOs, edge health, AI cost
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── store/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   └── tests/
│   │
│   ├── mobile-app/                             # MOBILE FIELD APPLICATION
│   │   │   Purpose: Offline-first field ops. Used by Ravi, Priya, Sanjay (in-field).
│   │   │   Technology: React Native, Expo, WatermelonDB
│   │   │
│   │   ├── app/                                # Expo Router
│   │   │   ├── (tabs)/                         # Bottom tab navigator
│   │   │   ├── (auth)/
│   │   │   ├── (modals)/
│   │   │   ├── permits/[permitId]/
│   │   │   ├── loto/[isolationId]/
│   │   │   ├── incidents/new/
│   │   │   └── passport/
│   │   ├── components/
│   │   │   ├── field/
│   │   │   ├── camera/
│   │   │   ├── sync/
│   │   │   └── sos/
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── store/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── assets/
│   │   └── tests/
│   │
│   ├── ai-copilot/                             # AI COPILOT APPLICATION
│   │   │   Purpose: Standalone AI workspace, embeddable. Halo Orb, reasoning, HITL.
│   │   │   Technology: Next.js 15, GSAP, Vercel AI SDK
│   │   │
│   │   ├── app/
│   │   │   ├── threads/[threadId]/
│   │   │   ├── sources/
│   │   │   ├── prompts/
│   │   │   └── agents/
│   │   ├── components/
│   │   │   ├── orb/
│   │   │   ├── reasoning/
│   │   │   ├── streaming/
│   │   │   ├── citations/
│   │   │   ├── hitl/
│   │   │   └── kill-switch/
│   │   ├── hooks/
│   │   ├── providers/
│   │   ├── store/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   └── tests/
│   │
│   └── docs-site/                              # DEVELOPER PORTAL & DOCS
│       │   Purpose: API docs, design system docs, developer guides.
│       │   Technology: Next.js 15, MDX, Fumadocs, Storybook
│       │
│       ├── app/
│       │   ├── design-system/
│       │   ├── api/
│       │   ├── guides/
│       │   ├── architecture/
│       │   └── changelog/
│       ├── content/
│       ├── components/
│       ├── lib/
│       ├── types/
│       └── public/
│
├── packages/
│   │
│   ├── ui/                                     # HALO DESIGN SYSTEM LIBRARY
│   │   │   Purpose: All 37 chapters of Halo implemented as React components.
│   │   │   Ownership: Design Systems Squad
│   │   │
│   │   ├── src/
│   │   │   ├── primitives/                     # Radix UI accessible primitives
│   │   │   ├── components/                     # Composed Halo components (50+)
│   │   │   ├── layouts/                        # Layout primitives
│   │   │   ├── patterns/                       # Compound patterns
│   │   │   └── index.ts                        # Public API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   ├── design-tokens/                          # DESIGN TOKEN PIPELINE
│   │   │   Purpose: OKLCH tokens → CSS vars, Tailwind, RN JSON, Figma.
│   │   │   Ownership: Design Systems Squad
│   │   │
│   │   ├── src/
│   │   │   ├── core/                           # Primitive values
│   │   │   ├── semantic/                       # Role-based aliases
│   │   │   └── component/                      # Component-scoped tokens
│   │   ├── dist/
│   │   │   ├── tokens.css
│   │   │   ├── tailwind.theme.ts
│   │   │   ├── tokens.json
│   │   │   └── tokens.native.json
│   │   ├── style-dictionary.config.js
│   │   └── package.json
│   │
│   ├── icons/                                  # HALO ICONS (900+ GLYPHS)
│   │   │   Purpose: Lucide-extended icons for industrial safety.
│   │   │   Ownership: Design Systems Squad
│   │   │
│   │   ├── src/
│   │   │   ├── line/                           # Line style (default)
│   │   │   ├── solid/                          # Solid style (active states)
│   │   │   ├── duotone/                        # Duotone (empty states)
│   │   │   └── animated/                       # Lottie animations
│   │   └── package.json
│   │
│   ├── shared-types/                           # TYPESCRIPT DOMAIN TYPES
│   │   │   Purpose: Auto-generated types from OpenAPI + Protobuf + GraphQL.
│   │   │   Ownership: Platform Squad (auto-generated, no manual edits)
│   │   │
│   │   ├── src/
│   │   │   ├── rest/                           # OpenAPI-generated types
│   │   │   ├── grpc/                           # Protobuf-generated types
│   │   │   ├── graphql/                        # GraphQL codegen types
│   │   │   └── domain/                         # Cross-cutting domain types
│   │   ├── codegen.config.ts
│   │   └── package.json
│   │
│   ├── api-client/                             # GENERATED API CLIENTS
│   │   │   Purpose: Typed clients for REST, GraphQL, gRPC, WS, SSE.
│   │   │   Ownership: Platform Squad
│   │   │
│   │   ├── src/
│   │   │   ├── rest/                           # openapi-fetch client
│   │   │   ├── graphql/                        # Apollo typed hooks
│   │   │   ├── grpc/                           # gRPC-Web clients
│   │   │   ├── websocket/                      # WS manager + Web Worker
│   │   │   ├── sse/                            # SSE consumer + resume
│   │   │   └── interceptors/                   # Auth, tenant, trace, idempotency
│   │   └── package.json
│   │
│   ├── validation/                             # ZOD SCHEMAS
│   │   │   Purpose: Shared validation between frontend forms and BFF.
│   │   │   Ownership: Domain Squads + Platform Squad
│   │   │
│   │   ├── src/
│   │   │   ├── ptw.schemas.ts
│   │   │   ├── loto.schemas.ts
│   │   │   ├── inc.schemas.ts
│   │   │   ├── er.schemas.ts
│   │   │   ├── adm.schemas.ts
│   │   │   ├── sec.schemas.ts
│   │   │   └── common.schemas.ts
│   │   └── package.json
│   │
│   ├── hooks/                                  # SHARED REACT HOOKS
│   │   │   Purpose: App-agnostic React hooks.
│   │   │   Ownership: Platform Squad
│   │   │
│   │   ├── src/
│   │   │   ├── use-media-query.ts
│   │   │   ├── use-reduced-motion.ts
│   │   │   ├── use-debounced-value.ts
│   │   │   ├── use-intersection-observer.ts
│   │   │   ├── use-copy-to-clipboard.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-event-listener.ts
│   │   │   ├── use-previous.ts
│   │   │   ├── use-interval.ts
│   │   │   └── use-lock-body-scroll.ts
│   │   └── package.json
│   │
│   ├── utils/                                  # PURE UTILITY FUNCTIONS
│   │   │   Purpose: Zero-React-dependency utilities.
│   │   │   Ownership: Platform Squad
│   │   │
│   │   ├── src/
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   ├── crypto.ts
│   │   │   ├── crdt.ts
│   │   │   ├── filter.ts
│   │   │   ├── scope.ts
│   │   │   ├── permission.ts
│   │   │   ├── url.ts
│   │   │   └── string.ts
│   │   └── package.json
│   │
│   ├── config/                                 # FEATURE FLAGS & ENV CONFIG
│   │   │   Purpose: Flagsmith integration, env config, tenant config.
│   │   │   Ownership: Platform Squad
│   │   │
│   │   ├── src/
│   │   │   ├── feature-flags.ts
│   │   │   ├── env-config.ts
│   │   │   └── tenant-config.ts
│   │   └── package.json
│   │
│   ├── analytics/                              # TELEMETRY SDK
│   │   │   Purpose: Web Vitals, custom events, perf monitoring.
│   │   │   Ownership: SRE Squad
│   │   │
│   │   ├── src/
│   │   │   ├── web-vitals.ts
│   │   │   ├── events.ts
│   │   │   ├── performance.ts
│   │   │   └── error-tracking.ts
│   │   └── package.json
│   │
│   ├── i18n/                                   # INTERNATIONALIZATION
│   │   │   Purpose: Locale bundles, ICU MessageFormat.
│   │   │   Ownership: Localization Squad
│   │   │
│   │   ├── src/
│   │   │   ├── locales/
│   │   │   │   ├── en/
│   │   │   │   ├── hi/
│   │   │   │   ├── ar/
│   │   │   │   ├── ms/
│   │   │   │   ├── pt/
│   │   │   │   └── zh/
│   │   │   └── framework.ts
│   │   └── package.json
│   │
│   └── test-utils/                             # SHARED TEST INFRASTRUCTURE
│       │   Purpose: MSW handlers, render helpers, test factories.
│       │   Ownership: Platform Squad
│       │
│       ├── src/
│       │   ├── msw-handlers/                   # Per-module mock handlers
│       │   ├── render-helpers.tsx              # Provider-wrapped render
│       │   ├── factories/                      # Test data factories
│       │   └── a11y-helpers.ts                 # Accessibility assertions
│       └── package.json
│
├── services/
│   │
│   ├── console-bff/                            # GRAPHQL FEDERATION BFF
│   │   │   Purpose: Aggregates 48 backend services for Command Console.
│   │   │   Ownership: Console Frontend Squad
│   │   │
│   │   ├── src/
│   │   │   ├── subgraphs/                     # Apollo federated subgraphs
│   │   │   │   ├── perception/                # CV, OT, IoT
│   │   │   │   ├── workflows/                 # PTW, LOTO, Incident, ER
│   │   │   │   ├── risk/                      # Compound Risk, Alarms
│   │   │   │   ├── command/                   # Console, Twin
│   │   │   │   └── platform/                  # Admin, Security, Compliance
│   │   │   ├── resolvers/
│   │   │   ├── directives/
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   ├── schema/                             # GraphQL SDL files
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mobile-bff/                             # REST DELTA-SYNC BFF
│   │   │   Purpose: Optimized REST for mobile offline-first patterns.
│   │   │   Ownership: Mobile Squad
│   │   │
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── delta-sync/                    # ETag-based delta computation
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── edge-bff/                               # SSE/WEBSOCKET RELAY
│       │   Purpose: Edge device stream relay to frontend.
│       │   Ownership: Edge Platform Squad
│       │
│       ├── src/
│       │   ├── ws-relay/
│       │   ├── sse-relay/
│       │   ├── kafka-consumer/
│       │   └── server.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── database/
│   │
│   ├── migrations/                             # BFF-LOCAL SCHEMA MIGRATIONS
│   │   │   Purpose: Migrations for BFF-owned local state (sessions, cache).
│   │   │   NOT the canonical database (that's in backend repo).
│   │   │
│   │   └── *.sql
│   │
│   ├── seeds/                                  # DEVELOPMENT SEED DATA
│   │   │   Purpose: Realistic seed data for local development.
│   │   │
│   │   ├── tenants.ts
│   │   ├── sites.ts
│   │   ├── permits.ts
│   │   ├── incidents.ts
│   │   └── workers.ts
│   │
│   └── schemas/                                # SHARED SCHEMA DEFINITIONS
│       │   Purpose: Prisma/Drizzle schema files for BFF persistence.
│       │
│       └── schema.prisma
│
├── ai/
│   │
│   ├── prompt-registry/                        # VERSIONED PROMPT TEMPLATES
│   │   │   Purpose: Prompt templates for RAG Copilot UI rendering.
│   │   │
│   │   ├── safety-briefing.prompt.md
│   │   ├── incident-summary.prompt.md
│   │   ├── permit-draft.prompt.md
│   │   ├── rca-analysis.prompt.md
│   │   └── compliance-report.prompt.md
│   │
│   ├── agent-schemas/                          # AGENT TOOL UI SCHEMAS
│   │   │   Purpose: JSON schemas for rendering agent tool invocations in UI.
│   │   │
│   │   ├── kg-query.schema.json
│   │   ├── risk-score.schema.json
│   │   ├── frame-lookup.schema.json
│   │   └── permit-create.schema.json
│   │
│   ├── confidence-calibration/                 # CONFIDENCE DISPLAY CONFIG
│   │   │   Purpose: Calibration params for AG-018 uncertainty rendering.
│   │   │
│   │   ├── calibration-model.json
│   │   └── threshold-config.json
│   │
│   └── streaming-protocols/                    # LLM STREAMING DEFINITIONS
│       │   Purpose: SSE/WS protocol definitions for AI streaming.
│       │
│       ├── sse-protocol.md
│       └── ws-agent-protocol.md
│
├── infrastructure/
│   │
│   ├── terraform/                              # INFRASTRUCTURE AS CODE
│   │   │   Purpose: CDN, edge functions, WAF, CSP, DNS.
│   │   │
│   │   ├── cdn/
│   │   │   ├── cloudfront.tf
│   │   │   └── edge-functions.tf
│   │   ├── waf/
│   │   │   └── rules.tf
│   │   ├── dns/
│   │   │   └── records.tf
│   │   └── main.tf
│   │
│   ├── docker/                                 # CONTAINER DEFINITIONS
│   │   │   Purpose: Docker images for BFF services.
│   │   │
│   │   ├── console-bff.Dockerfile
│   │   ├── mobile-bff.Dockerfile
│   │   └── edge-bff.Dockerfile
│   │
│   ├── k8s/                                    # KUBERNETES MANIFESTS
│   │   │   Purpose: K8s deployment for BFF services + SSR pods.
│   │   │
│   │   ├── console-bff/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── ingress.yaml
│   │   ├── mobile-bff/
│   │   ├── edge-bff/
│   │   └── dashboard-web/                      # SSR pods for Next.js
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   │
│   ├── cdn/                                    # CDN DISTRIBUTION CONFIGS
│   │   │   Purpose: CDN caching rules, invalidation, geo-routing.
│   │   │
│   │   ├── cache-policy.json
│   │   └── invalidation-rules.json
│   │
│   └── monitoring/                             # FRONTEND OBSERVABILITY
│       │   Purpose: Grafana dashboards, Prometheus rules for frontend SLOs.
│       │
│       ├── dashboards/
│       │   ├── web-vitals.json
│       │   ├── api-latency.json
│       │   ├── websocket-health.json
│       │   └── error-budget.json
│       └── alerts/
│           ├── lcp-regression.yaml
│           ├── error-rate.yaml
│           └── ws-connection-drop.yaml
│
├── tooling/
│   │
│   ├── generators/                             # CODE GENERATORS
│   │   │   Purpose: Plop/Hygen templates for new components, hooks, pages.
│   │   │
│   │   ├── component/
│   │   │   ├── component.tsx.hbs
│   │   │   ├── component.test.tsx.hbs
│   │   │   ├── component.stories.tsx.hbs
│   │   │   └── index.ts.hbs
│   │   ├── hook/
│   │   ├── page/
│   │   └── plopfile.js
│   │
│   ├── codemods/                               # AST-BASED MIGRATIONS
│   │   │   Purpose: Automated large-scale refactors.
│   │   │
│   │   └── *.ts
│   │
│   ├── eslint-config/                          # SHARED ESLINT CONFIG
│   │   │   Purpose: Architecture enforcement rules.
│   │   │
│   │   ├── index.js
│   │   ├── rules/
│   │   │   ├── no-cross-app-imports.js
│   │   │   ├── no-direct-api-calls.js
│   │   │   ├── no-hardcoded-tokens.js
│   │   │   ├── require-component-id.js
│   │   │   ├── require-error-boundary.js
│   │   │   └── require-loading-state.js
│   │   └── package.json
│   │
│   ├── prettier-config/                        # SHARED PRETTIER CONFIG
│   │   ├── index.js
│   │   └── package.json
│   │
│   ├── tsconfig/                               # SHARED TYPESCRIPT CONFIGS
│   │   ├── base.json
│   │   ├── react.json
│   │   ├── react-native.json
│   │   └── node.json
│   │
│   ├── storybook-config/                       # SHARED STORYBOOK CONFIG
│   │   ├── main.ts
│   │   ├── preview.ts
│   │   └── decorators/
│   │
│   └── scripts/                                # CI/CD HELPER SCRIPTS
│       ├── check-bundle-size.ts
│       ├── generate-types.ts
│       ├── validate-tokens.ts
│       └── release.ts
│
├── docs/
│   │
│   ├── architecture/                           # ARCHITECTURE DECISION RECORDS
│   │   │   Purpose: ADRs for every architectural decision.
│   │   │
│   │   ├── adr-001-monorepo-strategy.md
│   │   ├── adr-002-bff-pattern.md
│   │   ├── adr-003-no-microfrontends.md
│   │   ├── adr-004-state-management.md
│   │   ├── adr-005-offline-strategy.md
│   │   └── adr-006-token-storage.md
│   │
│   ├── guides/                                 # ENGINEERING GUIDES
│   │   ├── onboarding.md
│   │   ├── contributing.md
│   │   ├── deployment.md
│   │   ├── testing.md
│   │   └── design-system-usage.md
│   │
│   ├── runbooks/                               # INCIDENT RESPONSE RUNBOOKS
│   │   ├── websocket-connection-drop.md
│   │   ├── bff-degradation.md
│   │   ├── lcp-regression.md
│   │   └── offline-sync-failure.md
│   │
│   ├── rfcs/                                   # REQUEST FOR COMMENTS
│   │   └── rfc-template.md
│   │
│   └── api/                                    # GENERATED API DOCS
│       ├── openapi/
│       ├── graphql/
│       └── protobuf/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                              # Lint + test + typecheck + build
│   │   ├── e2e.yml                             # Playwright E2E tests
│   │   ├── visual.yml                          # Chromatic visual regression
│   │   ├── deploy-preview.yml                  # PR preview deployments
│   │   ├── deploy-staging.yml                  # Staging deployment
│   │   ├── deploy-production.yml               # Production deployment
│   │   ├── security-scan.yml                   # Snyk + license audit
│   │   └── generate-types.yml                  # OpenAPI/Protobuf type generation
│   │
│   ├── CODEOWNERS                              # Per-module ownership mapping
│   └── pull_request_template.md                # PR checklist
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .eslintrc.base.js
├── .prettierrc
├── .commitlintrc.js
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .env.example
└── README.md
```

### 19.2 Why Each Folder Exists

| Folder | Reason for Existence |
|---|---|
| `apps/dashboard-web/` | The primary deployment target for 10+ desktop personas across 27 modules. Renders all ISA-101 layouts, all screen specifications, and all real-time surfaces. |
| `apps/admin-portal/` | Separation of concerns: platform administration is a distinct security boundary from operational use. Arjun and Neha operate in a different trust context than Anita and Ravi. Independent deployment cadence. |
| `apps/mobile-app/` | React Native + PWA dual-target for field workers. Fundamentally different runtime (mobile OS), interaction model (glove-mode, voice-first), and data architecture (offline-first, CRDT sync). Cannot share a deployment target with dashboard-web. |
| `apps/ai-copilot/` | The Halo Orb and reasoning timeline are embeddable components that must work standalone (for AI team development) and embedded (in dashboard-web right panel). Separate app enables independent iteration on AI surfaces without risking safety-critical rendering paths. |
| `apps/docs-site/` | Developer portal is SSG-first with different build/deploy characteristics. External developers access it without SafetyOS credentials. Separate deployment target and security perimeter. |
| `packages/ui/` | The Halo design system is the single source of truth for all visual components. Shared across 5 apps. Changes require design review + a11y audit. Must be independently versioned and documented. |
| `packages/design-tokens/` | Tokens are consumed by UI components, Tailwind configs, React Native styles, and Figma. They are the foundation layer — everything depends on them, they depend on nothing. |
| `packages/icons/` | 900+ industrial safety icons are a significant asset. Independent versioning allows icon additions without UI library releases. |
| `packages/shared-types/` | Auto-generated types ensure frontend-backend contract synchronization. Manual edits prohibited to prevent drift. |
| `packages/api-client/` | Generated API clients centralize authentication, retry logic, telemetry, and error handling. Prevents each app from re-implementing API integration. |
| `packages/validation/` | Zod schemas shared between frontend forms and BFF request validation ensure consistent validation rules. Prevents client-server validation drift. |
| `packages/hooks/` | Shared hooks reduce duplication. App-agnostic hooks (media query, intersection observer) belong here; app-specific hooks (scope, persona) stay in apps. |
| `packages/utils/` | Pure utilities with zero React dependency. Usable in BFF services and frontend apps. |
| `packages/config/` | Feature flag evaluation centralized to ensure consistent rollout behavior across all apps. |
| `packages/analytics/` | Telemetry SDK shared across apps ensures consistent event taxonomy and Web Vitals reporting. |
| `packages/i18n/` | Centralized locale bundles and formatting rules ensure consistent internationalization. |
| `packages/test-utils/` | Shared MSW handlers, render helpers, and factories prevent test infrastructure duplication and ensure consistent test quality. |
| `services/console-bff/` | GraphQL federation BFF optimizes data aggregation for the Command Console's complex multi-service screens. Avoids N+1 API calls from the browser. |
| `services/mobile-bff/` | REST BFF with delta-sync patterns optimized for mobile's bandwidth constraints and offline-first requirements. Different API contract than console-bff. |
| `services/edge-bff/` | WebSocket/SSE relay bridges Kafka event streams to frontend WebSocket channels. Handles fan-out, backpressure, and reconnection. |
| `database/` | BFF-local persistence (session cache, offline queue metadata). Clearly separated from the canonical backend database to prevent confusion. |
| `ai/` | AI integration artifacts (prompts, agent schemas, confidence calibration) bridge the multi-agent layer with frontend rendering. Versioned independently from model code. |
| `infrastructure/` | Frontend deployment infrastructure (CDN, WAF, CSP, K8s for BFF/SSR) is owned by the frontend platform team. Separated from backend infrastructure. |
| `tooling/` | Developer experience infrastructure (generators, codemods, linting rules) is critical for maintaining consistency across 5 apps and 12 packages at Fortune 500 scale. |
| `docs/` | Engineering documentation, ADRs, runbooks, and RFCs are the institutional memory of architectural decisions. Source content for the docs-site app. |

---

*This document is the canonical frontend architecture for SafetyOS. Every implementation decision must trace back to a specification in this document or one of its baseline documents. Deviations require an Architecture Decision Record (ADR) approved by the Principal Frontend Architect.*
