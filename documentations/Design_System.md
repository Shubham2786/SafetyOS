# SafetyOS Design System

## The Enterprise Design Language for AI-Powered Industrial Safety Intelligence

**Document Version:** 1.0
**Status:** Approved — Engineering & Design Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0 + User Flow Specification v1.0
**Owners:** Principal Design Systems Architect, Design Engineering, UX Architecture
**Classification:** Confidential — Product Blueprint
**Codename:** *Halo* — the SafetyOS visual language
**Target stack:** Next.js 15 · React 19 · Tailwind CSS 4 · Radix UI · shadcn/ui · Framer Motion · React Flow · deck.gl · Three.js (constrained)
**Last Reviewed:** 2026-07-21

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Principles](#2-design-principles)
3. [Foundations — Design Tokens](#3-foundations--design-tokens)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Grid System](#6-grid-system)
7. [Spacing & Layout](#7-spacing--layout)
8. [Elevation & Shadows](#8-elevation--shadows)
9. [Radius, Borders & Strokes](#9-radius-borders--strokes)
10. [Iconography](#10-iconography)
11. [Motion & Animation](#11-motion--animation)
12. [Micro-Interactions](#12-micro-interactions)
13. [Buttons](#13-buttons)
14. [Inputs & Form Controls](#14-inputs--form-controls)
15. [Dropdowns, Selects & Comboboxes](#15-dropdowns-selects--comboboxes)
16. [Tables & Data Grids](#16-tables--data-grids)
17. [Charts & Data Visualization](#17-charts--data-visualization)
18. [Maps & Geospatial](#18-maps--geospatial)
19. [Digital Twin Widgets](#19-digital-twin-widgets)
20. [Cards](#20-cards)
21. [Forms](#21-forms)
22. [Modals, Dialogs & Sheets](#22-modals-dialogs--sheets)
23. [Notifications](#23-notifications)
24. [Toasts](#24-toasts)
25. [Sidebars](#25-sidebars)
26. [Topbars](#26-topbars)
27. [Command Palette](#27-command-palette)
28. [AI Assistant Surface (Halo Orb)](#28-ai-assistant-surface-halo-orb)
29. [Empty States](#29-empty-states)
30. [Loading States](#30-loading-states)
31. [Error States](#31-error-states)
32. [Accessibility](#32-accessibility)
33. [Keyboard Shortcuts](#33-keyboard-shortcuts)
34. [Responsive Rules](#34-responsive-rules)
35. [Dark Mode & Theming](#35-dark-mode--theming)
36. [Voice, Content & Localization](#36-voice-content--localization)
37. [Governance & Contribution](#37-governance--contribution)

---

## 1. Design Philosophy

SafetyOS operates in environments where design mistakes cost lives. Halo, the SafetyOS design language, is engineered against three simultaneous constraints that most enterprise design systems never resolve together:

1. **Life-critical clarity** — an operator in a control room at 03:00, wearing gloves, viewing a screen 3 meters away, must correctly triage a Level-4 alert within 2 seconds.
2. **Executive-grade polish** — a CSO briefing the board must feel that SafetyOS is the most premium software they own, on par with Palantir Foundry and Tesla Fleet.
3. **AI-native fluidity** — the platform is agentic. Reasoning, streaming, tool use, and confidence must be *legible* at the pixel level, not hidden behind chatbot bubbles.

Halo resolves these constraints through the following philosophy:

- **Quiet by default, loud when it matters.** The interface remains near-monochrome and calm during nominal operations. Color, motion and elevation are *saved* for signal — a rising risk, a streaming agent, a permit expiring.
- **Physics of trust.** Every surface obeys a consistent elevation model, every animation obeys the same easing family, every color obeys the same perceptual scale. Consistency *is* the trust signal.
- **Density with dignity.** Industrial operators need dense information (30+ KPIs, 200-row incident tables, 12-camera walls). Halo achieves density through typographic rhythm, hairline dividers, and a 4-pt spacing lattice — never through crowding.
- **Cinematic when cinematic earns it.** The Digital Twin, the Halo Orb, and Situation Room dashboards use cinematic motion and lighting. Everywhere else, motion is invisible — measured in 120–240 ms.
- **Zero-harm typography and contrast.** Every text/background pair meets WCAG 2.2 AA at minimum, AAA where a decision may affect human life (alerts, LOTO, PTW, ER).

Halo is not a rebrand of Material or Fluent. It is a first-principles enterprise language derived from perceptual psychology, control-room ergonomics, and 2026-era product craft.

---

## 2. Design Principles

The seven Halo principles. Every design review question maps back to one of these:

1. **Signal over ornament.** If a visual element does not carry meaning (state, hierarchy, causality, affordance), remove it.
2. **Progressive intensity.** Nominal → attention → warning → critical must be perceptually monotonic in hue, luminance *and* motion.
3. **Legibility beats density; density beats scrolling.** In that priority order.
4. **Reveal the agent.** When AI acts, the user sees what it saw, what it decided, and how sure it is.
5. **Every state is a designed state.** Empty, loading, partial, error, offline, degraded, throttled — no state is left to the browser default.
6. **Keyboard-parity.** Every mouse action has a keyboard path. Command palette + focus rings are first-class citizens.
7. **Consistent physics.** One elevation model, one motion curve family, one type ramp, one spacing lattice — across web, tablet, mobile, wearable, and control-room video wall.

---

## 3. Foundations — Design Tokens

Tokens are the single source of truth. They are authored in **Style Dictionary** and emitted as CSS variables, Tailwind theme, iOS/Android JSON, and Figma variables. Three tiers:

- **Core (primitive)** — raw values: `color.gray.900`, `size.4`, `duration.fast`. Never used directly by product code.
- **Semantic** — role-based aliases: `--surface-canvas`, `--text-primary`, `--intent-critical`, `--elevation-2`. Product code consumes these.
- **Component** — component-scoped: `--btn-primary-bg`, `--table-row-hover-bg`. Overridable per theme.

**Naming convention:** `--{category}-{role}-{state?}-{modifier?}`
Examples: `--surface-raised`, `--text-secondary`, `--intent-warning-bg`, `--border-focus-strong`.

**Token categories:**

| Category | Prefix | Examples |
|---|---|---|
| Color — surface | `--surface-*` | canvas, sunken, raised, overlay |
| Color — text | `--text-*` | primary, secondary, tertiary, on-accent, disabled |
| Color — border | `--border-*` | subtle, default, strong, focus |
| Color — intent | `--intent-*` | info, success, warning, critical, catastrophic |
| Color — brand | `--brand-*` | halo, deep, accent |
| Color — data-viz | `--dv-*` | cat-1 … cat-12, seq-1 … seq-9, div-neg-4 … div-pos-4 |
| Spacing | `--space-*` | 0, 0.5, 1, 1.5, 2, 3 … 40 (4-pt lattice) |
| Radius | `--radius-*` | none, xs, sm, md, lg, xl, 2xl, pill, circle |
| Typography | `--font-*`, `--text-*` | family, size, weight, leading, tracking |
| Shadow | `--shadow-*` | 0 … 5, focus, glow-brand, glow-critical |
| Duration | `--duration-*` | instant, fast, moderate, slow, deliberate |
| Easing | `--ease-*` | standard, entrance, exit, emphasized, spring |
| Z-index | `--z-*` | base, sticky, drawer, modal, toast, palette, orb |
| Blur | `--blur-*` | 0, sm, md, lg, xl (for glassmorphism) |

Tokens ship as **`@safetyos/tokens`** — a versioned NPM package. Product code must never hardcode hex, px, or ms values.

---

## 4. Color System

### 4.1 Color model

Halo is authored in **OKLCH** (perceptually uniform) and compiled to sRGB + Display-P3. Every color step differs by a constant ΔL* so that "one step darker" is visually consistent across hues.

### 4.2 Neutral scale — *Graphite*

The workhorse of the interface. 12 stops, tuned for low-glare control-room monitors.

| Token | OKLCH (approx) | Light hex | Dark hex | Usage |
|---|---|---|---|---|
| `--gray-0` | 99% / 0 | `#FCFCFD` | — | Page canvas (light) |
| `--gray-50` | 97% / 0 | `#F6F7F9` | `#0A0B0D` | Sunken surface |
| `--gray-100` | 94% / 0.005 | `#EEF0F3` | `#101216` | Raised surface (dark canvas) |
| `--gray-200` | 89% / 0.008 | `#DDE1E7` | `#181B21` | Divider, border-subtle |
| `--gray-300` | 82% / 0.01 | `#C4CAD3` | `#22262E` | Border-default |
| `--gray-400` | 72% / 0.012 | `#9AA3AF` | `#2F343D` | Border-strong, disabled text |
| `--gray-500` | 60% / 0.014 | `#6B7280` | `#3F4650` | Icon-tertiary |
| `--gray-600` | 50% / 0.014 | `#4B5563` | `#565E6B` | Text-tertiary |
| `--gray-700` | 40% / 0.014 | `#374151` | `#8A93A1` | Text-secondary |
| `--gray-800` | 27% / 0.012 | `#1F2937` | `#C0C6D0` | Text-primary (inverted) |
| `--gray-900` | 18% / 0.01 | `#111827` | `#E4E7ED` | Text-primary |
| `--gray-1000` | 8% / 0.008 | `#050609` | `#F5F7FA` | Absolute text (rare) |

### 4.3 Brand — *Halo Blue*

Halo Blue is not a corporate blue — it is a **luminous cyan-indigo** that reads as "AI intelligence" without slipping into generic tech-blue.

| Token | Value (sRGB) | Usage |
|---|---|---|
| `--brand-50` | `#EBF3FF` | Subtle brand tint bg |
| `--brand-100` | `#D6E6FF` | Hover on tinted surface |
| `--brand-200` | `#ADCCFF` | Focus ring soft |
| `--brand-300` | `#7AA9FF` | Illustration accent |
| `--brand-400` | `#4A85FA` | Secondary accent |
| `--brand-500` | `#2563EB` | **Primary brand** (buttons, links) |
| `--brand-600` | `#1D4ED8` | Primary hover |
| `--brand-700` | `#1E40AF` | Primary active/pressed |
| `--brand-800` | `#1E3A8A` | Text on tinted bg |
| `--brand-900` | `#172554` | Dark-mode brand text |
| `--brand-halo` | `#5AA0FF → #7C6CFF` (gradient) | Halo Orb, hero surfaces |
| `--brand-deep` | `#0B1220` | Executive dark canvas |

### 4.4 Intent (semantic status)

Intent colors are the **only** colors that carry safety meaning. They are perceptually stepped so *severity is felt, not read*.

| Intent | Meaning | 500 (core) | 100 (bg) | 700 (text on tint) |
|---|---|---|---|---|
| `--intent-info` | Informational | `#0EA5E9` sky | `#E0F2FE` | `#075985` |
| `--intent-success` | Nominal / compliant | `#10B981` emerald | `#D1FAE5` | `#065F46` |
| `--intent-warning` | Attention / trending | `#F59E0B` amber | `#FEF3C7` | `#92400E` |
| `--intent-critical` | Immediate action | `#EF4444` red | `#FEE2E2` | `#991B1B` |
| `--intent-catastrophic` | Life-threat / evac | `#B91C1C` deep red + pulse | `#7F1D1D` (dark) | `#FEE2E2` (on dark) |
| `--intent-neutral` | Unknown / degraded | `--gray-500` | `--gray-100` | `--gray-700` |

**Do not** use intent colors for aesthetic reasons. `--intent-critical` on a button that isn't destructive is a spec violation.

### 4.5 Data visualization palettes

Three coordinated palettes, all colorblind-tested (deuteranopia, protanopia, tritanopia) and colorblind-distinguishable at all pair combinations.

**Categorical (up to 12 series):**
`#2563EB #10B981 #F59E0B #A855F7 #06B6D4 #EC4899 #14B8A6 #F97316 #6366F1 #84CC16 #E11D48 #0EA5E9`

**Sequential (single-hue ramp — Halo Blue):** 9 steps from `#EBF3FF` to `#0C1E4A`. Used for heatmaps, density maps, risk gradients.

**Diverging (bipolar risk — cool→neutral→hot):** 9 steps `#1E40AF ↔ #F5F7FA ↔ #B91C1C`. Used for anomaly deltas, deviation-from-baseline plots.

### 4.6 Color usage rules

- **Never** use pure `#000` or pure `#FFF` for text. Use `--gray-900` / `--gray-0`.
- **Never** apply brand color to destructive actions.
- Two intent colors adjacent must have ≥3:1 contrast against each other (WCAG non-text).
- Digital Twin overlays use **alpha-blended intent** (`rgba(intent-500, 0.35)`) over the base 3D scene, not solid fills.
- Alerts of severity ≥ Critical must pair color with **iconography + motion** (never color alone — accessibility).

---

## 5. Typography

### 5.1 Type families

| Role | Family | Fallback | Notes |
|---|---|---|---|
| Display / UI | **Inter Variable** (`InterVariable.woff2`) | `system-ui, -apple-system, "Segoe UI", Roboto` | Optical sizing enabled; `font-feature-settings: "cv11","ss01","ss03"` |
| Monospace | **JetBrains Mono Variable** | `ui-monospace, "SF Mono", Consolas` | Logs, code, tag IDs, coordinates |
| Numeric (tabular) | **Inter** with `font-variant-numeric: tabular-nums` | — | KPIs, tables, timestamps |
| Data / dense tables | **Inter** at `-0.003em` tracking, 13/16 | — | Grid rows |
| Editorial (rare, marketing surfaces only) | **Söhne** or **GT America** licensed | Inter | Not in-app |

### 5.2 Type ramp

Modular scale of **1.125 (Major Second)**, anchored at 16 px base. All sizes ship as `--text-*` tokens; all leading as `--leading-*`.

| Token | Size / Leading | Weight | Tracking | Usage |
|---|---|---|---|---|
| `display-2xl` | 56 / 60 | 600 | -0.03em | Keynote hero (marketing only) |
| `display-xl` | 44 / 52 | 600 | -0.025em | Situation Room hero KPI |
| `display-lg` | 36 / 44 | 600 | -0.02em | Dashboard hero number |
| `heading-xl` | 30 / 38 | 600 | -0.015em | Page title |
| `heading-lg` | 24 / 32 | 600 | -0.01em | Section title |
| `heading-md` | 20 / 28 | 600 | -0.005em | Card / panel title |
| `heading-sm` | 18 / 26 | 600 | 0 | Subsection |
| `heading-xs` | 16 / 24 | 600 | 0 | Inline heading, dialog title |
| `body-lg` | 16 / 24 | 400 | 0 | Long-form reading |
| `body-md` | 14 / 20 | 400 | 0 | **Default body** |
| `body-sm` | 13 / 18 | 400 | 0.003em | Dense tables, secondary |
| `body-xs` | 12 / 16 | 400 | 0.005em | Metadata, tags, timestamps |
| `caption` | 11 / 14 | 500 | 0.02em, UPPERCASE | Labels, chip captions |
| `code-md` | 13 / 20 | 450 | 0 | Monospace inline |
| `code-sm` | 12 / 18 | 450 | 0 | Log viewer |
| `kpi-xl` | 64 / 64 | 500 | -0.03em, tabular-nums | Hero KPI number |
| `kpi-lg` | 40 / 44 | 500 | -0.025em, tabular-nums | Widget KPI |
| `kpi-md` | 28 / 32 | 500 | -0.02em, tabular-nums | Compact KPI |

### 5.3 Typographic rules

- **Line length** — 60–75 characters for body text. Never exceed 90.
- **Weights allowed** — 400 (regular), 500 (medium), 600 (semibold). No 700+ except in Display roles.
- **Numbers are always tabular** in tables, KPIs, timestamps, log viewers. `font-variant-numeric: tabular-nums slashed-zero`.
- **Uppercase** used only for `caption` role and chip labels. Never for headings.
- **Italics** used only for citations, foreign terms, and log source names. Never for emphasis (use weight).
- **Hyphenation** off by default; on for `<p>` in RTL and CJK auto-wrapped documents.

---

## 6. Grid System

Halo uses a **12-column responsive grid** for content layout and a **4-point lattice** for micro-spacing.

### 6.1 Breakpoints

| Token | Min width | Target | Cols | Gutter | Margin |
|---|---|---|---|---|---|
| `xs` | 0 | Phone portrait | 4 | 16 | 16 |
| `sm` | 480 | Phone landscape | 4 | 16 | 20 |
| `md` | 768 | Tablet portrait | 8 | 20 | 24 |
| `lg` | 1024 | Tablet landscape / small laptop | 12 | 24 | 32 |
| `xl` | 1280 | Laptop | 12 | 24 | 40 |
| `2xl` | 1536 | Desktop | 12 | 32 | 48 |
| `3xl` | 1920 | Large desktop / control room | 12 | 32 | 64 |
| `4xl` | 2560 | Video wall / SOC | 16 | 40 | 80 |

### 6.2 Application shell grid

The SafetyOS shell is a **three-region grid** at `lg+`:

```
┌───────────────────────────────────────────────────────┐
│  Topbar                                    56 px       │
├──────┬─────────────────────────────────┬─────────────┤
│      │                                 │             │
│ Nav  │        Content region           │  Contextual │
│ 240 →│        (fluid, min 720)         │  panel      │
│ 64   │                                 │  360 (opt.) │
│      │                                 │             │
└──────┴─────────────────────────────────┴─────────────┘
```

- **Nav rail** collapses to 64 px icon-only at `md-` and below.
- **Contextual panel** (details, AI reasoning, filter) collapses into a bottom sheet at `md-`.

### 6.3 Content grid

Inside the content region, cards flow on a **12-col sub-grid** with the same gutter as the outer grid. Widget spans use `span-3`, `span-4`, `span-6`, `span-8`, `span-12`. Widgets never span an odd fraction of 12 (avoid `span-5`, `span-7`).

---

## 7. Spacing & Layout

### 7.1 4-point lattice

All spacing derives from a 4 px unit. 2 px is permitted only for optical adjustments on icons and 1 px hairlines.

| Token | px | Typical use |
|---|---|---|
| `space-0` | 0 | Reset |
| `space-0.5` | 2 | Optical only, icon offsets |
| `space-1` | 4 | Icon-to-label, chip padding |
| `space-1.5` | 6 | Compact input padding |
| `space-2` | 8 | Inline gap, button padding-y |
| `space-3` | 12 | Card body padding compact |
| `space-4` | 16 | **Default gap** |
| `space-5` | 20 | Card padding |
| `space-6` | 24 | Section internal spacing |
| `space-8` | 32 | Card outer margin |
| `space-10` | 40 | Section between-card spacing |
| `space-12` | 48 | Page section spacing |
| `space-16` | 64 | Hero padding |
| `space-20` | 80 | Wide layout margins |
| `space-24` | 96 | Video-wall margins |
| `space-32` | 128 | Marketing hero only |

### 7.2 Layout rules

- **Card padding** — 20 px default, 16 px compact, 24 px featured.
- **Modal padding** — 24 px header/footer, 24 px body (32 px on `lg+`).
- **Table cell padding** — 12 px vertical / 16 px horizontal (comfortable), 8 px / 12 px (dense).
- **Form field vertical rhythm** — 20 px between fields, 32 px between field groups, 40 px before submit.
- **Nesting** — a container's inner padding never equals the parent's; step down by one level (16 inside 24, etc.).

---

## 8. Elevation & Shadows

Halo uses **six elevation planes**. Elevation is expressed by **shadow + border + surface tint + optional blur**, not by shadow alone. In dark mode elevation is primarily a *surface lightening*, not a shadow.

| Plane | Token | Use | Light shadow | Dark treatment |
|---|---|---|---|---|
| 0 (canvas) | `--elevation-0` | Page background | none | none, `--gray-50` surface |
| 1 (sunken) | `--elevation-1` | Inset areas, code blocks | inset 0 1 2 rgba(15,23,42,.03) | inset, surface `--gray-100` |
| 2 (raised) | `--elevation-2` | Cards, panels | 0 1 2 rgba(15,23,42,.04), 0 1 1 rgba(15,23,42,.02) | surface `--gray-100`, border `--gray-200` |
| 3 (overlay) | `--elevation-3` | Dropdowns, popovers | 0 4 12 rgba(15,23,42,.08), 0 1 3 rgba(15,23,42,.05) | surface `--gray-200`, border `--gray-300` |
| 4 (modal) | `--elevation-4` | Dialogs, sheets | 0 16 40 rgba(15,23,42,.12), 0 4 8 rgba(15,23,42,.06) | surface `--gray-200`, backdrop blur 12 |
| 5 (cinematic) | `--elevation-5` | Halo Orb, hero widgets | 0 32 64 rgba(15,23,42,.16), inner glow | surface `--gray-100` + gradient border |

### 8.1 Shadow tokens

```
--shadow-0:  none;
--shadow-1:  0 1px 2px rgba(15,23,42,.04);
--shadow-2:  0 2px 6px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);
--shadow-3:  0 8px 20px rgba(15,23,42,.08), 0 2px 4px rgba(15,23,42,.04);
--shadow-4:  0 16px 40px rgba(15,23,42,.12), 0 4px 8px rgba(15,23,42,.06);
--shadow-5:  0 32px 64px rgba(15,23,42,.16), 0 8px 16px rgba(15,23,42,.08);
--shadow-focus:      0 0 0 3px rgba(37,99,235,.35);
--shadow-focus-danger: 0 0 0 3px rgba(239,68,68,.35);
--shadow-glow-brand:  0 0 24px rgba(90,160,255,.35);
--shadow-glow-critical: 0 0 24px rgba(239,68,68,.45);
```

### 8.2 Rules

- **Never** stack more than two elevated surfaces (modal-in-modal is banned; use a sheet inside a modal).
- Shadows never exceed `--shadow-4` except on the Halo Orb and cinematic hero widgets.
- Hover elevation is **one plane above**, and only if the element is interactive.

---

## 9. Radius, Borders & Strokes

### 9.1 Radius scale

| Token | px | Use |
|---|---|---|
| `radius-none` | 0 | Tables, data grids, log rows |
| `radius-xs` | 2 | Chips, tags |
| `radius-sm` | 4 | Small inputs, checkboxes |
| `radius-md` | 6 | **Buttons, inputs** |
| `radius-lg` | 10 | Cards |
| `radius-xl` | 14 | Modals, sheets, large panels |
| `radius-2xl` | 20 | Hero widgets, Halo Orb container |
| `radius-pill` | 999 | Pills, avatars-inline, chips-round |
| `radius-circle` | 50% | Avatars, Orb |

Nested radius: inner radius = outer − padding. Cards (10) with 20 px padding → inner elements 4–6.

### 9.2 Border weights

- **Hairline** — 1 px, `--border-subtle` — dividers.
- **Default** — 1 px, `--border-default` — inputs, cards.
- **Strong** — 1 px, `--border-strong` — active states.
- **Focus** — 2 px inner, plus 2 px outer glow (see focus ring).
- Halo does not use 2 px+ borders for aesthetic weight — weight comes from typography and elevation.

---

## 10. Iconography

### 10.1 Icon library

**Halo Icons** — a 900+ glyph library derived from **Lucide** (base 24 × 24, 1.5 px stroke) with SafetyOS-specific extensions for industrial safety domains:

- **Safety** — hard-hat, PPE glove, gas-mask, harness, eyewash, AED, fire-extinguisher-A/B/C/D, spill-kit
- **Industrial** — valve-gate, valve-ball, pump-centrifugal, compressor, heat-exchanger, flare-stack, cooling-tower
- **OT / SCADA** — PLC, RTU, HMI, DCS-node, Modbus, OPC-UA, MQTT
- **Digital Twin / CV** — camera-PTZ, camera-fixed, thermal, LiDAR, RFID-tag, geofence, hazard-zone
- **Permit / LOTO** — permit-hot-work, permit-confined-space, permit-height, lockout-tag, tryout
- **Emergency** — muster-point, evac-route, siren, gas-detector, H2S, CO, LEL

### 10.2 Grid & construction

- **24 × 24** primary grid, 2 px keyline padding, 1.5 px stroke, rounded joins/caps.
- **20 × 20** compact variant for dense tables and toolbars, 1.25 px stroke.
- **16 × 16** micro variant for inputs and chips, 1 px stroke.
- **32 × 32** feature variant for empty states and marketing, 2 px stroke.

### 10.3 Icon styles

- **Line** (default) — outlined, monochrome, inherits `currentColor`.
- **Solid** — used only for active states in nav rails and severity indicators.
- **Duotone** — used only in empty states and onboarding illustrations.
- **Animated** — Lottie for orb, spinner, and streaming indicators (see §11).

### 10.4 Rules

- Icons must never appear alone in critical actions unless a tooltip or label accompanies them via `aria-label`.
- Icons inherit text color unless explicitly semantic (intent icons).
- Never mix line and solid styles in the same toolbar.
- SafetyOS icons for regulated equipment (fire, gas, PPE) follow **ISO 7010** conventions where applicable.

---

## 11. Motion & Animation

### 11.1 Duration tokens

| Token | ms | Use |
|---|---|---|
| `duration-instant` | 0 | State swaps that must not animate (screen readers, seizure risk) |
| `duration-fast` | 120 | Hovers, focus, small state changes |
| `duration-moderate` | 200 | Dropdowns, tooltips, small panels |
| `duration-slow` | 320 | Modals, sheets, page transitions |
| `duration-deliberate` | 480 | Onboarding, cinematic reveals |
| `duration-orbit` | 2400 | Halo Orb ambient loop |

### 11.2 Easing tokens

```
--ease-standard:    cubic-bezier(0.2, 0, 0, 1);       /* default */
--ease-entrance:    cubic-bezier(0, 0, 0, 1);          /* enter */
--ease-exit:        cubic-bezier(0.4, 0, 1, 1);        /* leave */
--ease-emphasized:  cubic-bezier(0.2, 0, 0, 1.2);      /* attention */
--ease-spring:      spring(1, 320, 24, 0);             /* physical */
--ease-orbit:       linear;                             /* ambient loops */
```

### 11.3 Motion vocabulary

Every animation in SafetyOS is one of nine primitives. Combining primitives is allowed; inventing new ones is not.

1. **Fade** — opacity 0↔1, 120–200 ms, `ease-standard`.
2. **Slide** — translate on one axis, 200–320 ms, `ease-standard`.
3. **Scale** — 0.96↔1 for modals, 0.98↔1 for cards, `ease-emphasized`.
4. **Reveal** — clip-path expansion (used for command palette, expandable widgets).
5. **Morph** — width/height/border-radius interpolation (panel↔drawer, chip↔card).
6. **Streamline** — SVG path drawing (agent reasoning timeline, digital twin flows).
7. **Pulse** — 2-step scale + opacity (alerts, live indicators). Max 2 cycles unless critical intent.
8. **Shimmer** — moving gradient across skeletons.
9. **Ambient** — continuous, imperceptible motion (Halo Orb, live-status dot).

### 11.4 Rules

- Nothing loops indefinitely except: Halo Orb, live-status dots, streaming spinners, catastrophic alerts.
- No animation exceeds 480 ms except onboarding cinematics.
- All motion respects `prefers-reduced-motion: reduce` — reduced to fades ≤120 ms or none.
- Parallax is subtle (≤ 8 px travel) and only on hero surfaces.
- Framer Motion is the default; GSAP is used only for Halo Orb, Situation Room hero, and Digital Twin cinematics.

### 11.5 Page transitions

Route changes fade at 160 ms; nested route changes cross-fade at 120 ms; no slide-in unless the new page is a *modal-route* (details drawer, incident detail).

---

## 12. Micro-Interactions

Every interactive element must respond within **50 ms** perceptually. Halo defines the canonical micro-interactions:

- **Hover** — background tint (`+4% luminance` on light, `-4%` on dark) + optional elevation +1 for cards. 120 ms.
- **Press** — scale to `0.98` + darker tint. 80 ms in, spring back.
- **Focus** — 2 px inset ring + 2 px outer glow (`--shadow-focus`). Never removed except with `:focus-visible`.
- **Toggle** — 200 ms slide of knob + fade of track color. Sound off by default; optional confirm sound on critical toggles.
- **Ripple** — used only in the mobile app and PWA (touch surfaces); never on desktop.
- **Magnetic** — buttons ≥ 44 px in Situation Room and marketing get a 6 px cursor magnetism within 24 px radius. Not used in production forms.
- **Card lift** — hover raises card by 1 plane (shadow-2 → shadow-3) and translates Y by `-2 px`.
- **Chip pop** — new chips enter with scale 0.9→1 + fade, 160 ms.
- **Counter tick** — numeric changes animate through intermediate digits at 240 ms, `ease-emphasized`.
- **Skeleton→content** — content fades in (120 ms) as skeleton fades out (80 ms), staggered 60 ms per child.
- **Live dot** — 8 px circle, 2-second ambient pulse, `--intent-success` (nominal) / `--intent-warning` (degraded).
- **AI thinking** — three glyph shimmer, 1200 ms cycle, `--ease-orbit`.

Micro-interaction anti-patterns: bouncing, wobbling, elastic overshoots > 8%, springs > 500 ms, unavoidable auto-playing motion.

---

## 13. Buttons

### 13.1 Variants

| Variant | Purpose | Visual |
|---|---|---|
| **Primary** | Main action per view | Brand-500 bg, white text |
| **Secondary** | Alt action | `--gray-100` bg, `--gray-900` text, subtle border |
| **Tertiary / Ghost** | Low-emphasis | Transparent bg, `--gray-700` text |
| **Outline** | Framed alt | Transparent bg, `--border-strong`, `--gray-900` text |
| **Destructive** | Delete, force-stop, override | `--intent-critical-500` bg, white text |
| **Destructive Ghost** | Non-primary destructive | Transparent bg, red text |
| **AI / Halo** | Invoke AI assistant / action | Halo gradient bg, white text, subtle inner glow |
| **Icon** | Icon-only | Square, 32/40/48 px, tooltip required |
| **Split** | Primary + dropdown | Primary style + divider + caret |
| **Segmented group** | Toggle among 2–5 states | Grouped, only one active |

### 13.2 Sizes

| Size | Height | Padding X | Font | Icon | Use |
|---|---|---|---|---|---|
| `xs` | 24 | 8 | 12/16 | 14 | Chips, inline actions |
| `sm` | 32 | 12 | 13/18 | 16 | Toolbars, dense tables |
| `md` | 36 | 14 | 14/20 | 16 | **Default** |
| `lg` | 44 | 18 | 15/22 | 18 | Primary CTA, control-room-safe |
| `xl` | 56 | 24 | 16/24 | 20 | Hero, marketing, mobile ops |

Control-room use requires ≥ `lg` for any action reachable by a gloved operator.

### 13.3 States

Every button ships all of: `default`, `hover`, `active/pressed`, `focus-visible`, `disabled`, `loading`, `success` (transient), `error` (transient).

- **Loading** — leading spinner replaces icon; label unchanged; button is `aria-busy="true"`.
- **Success/Error transient** — 800 ms swap of icon + tint; then returns to default (or navigates).
- **Disabled** — 40% alpha, cursor `not-allowed`, focus still receivable if tooltip present.

### 13.4 Rules

- One Primary per view region (not per page — a modal has its own primary).
- Destructive actions in modals require a **confirmation phrase** (see §22).
- No underline on button text.
- Buttons never wrap to a second line; use icon-only or shorter label.
- Halo buttons never mix icon-right in LTR unless indicating "external" or "menu" (caret).

---

## 14. Inputs & Form Controls

### 14.1 Text input

- Height 36 (md), 32 (sm), 44 (lg).
- Radius 6.
- Border `--border-default`, focus 2 px `--brand-500` + 2 px glow.
- Padding 12 px horizontal, 8 px vertical.
- Prefix/suffix slots (icon, unit, action button).
- Label above input, 6 px gap. Placeholder is not a label.
- Helper text 12/16 below input, 6 px gap. Error text replaces helper text in `--intent-critical-700`.
- Character counter right-aligned in helper row when `maxLength` present.

### 14.2 Textarea

- Min-height 96, auto-grow up to 320. Resize handle visible only on hover.
- Same visual language as text input.

### 14.3 Number input

- Tabular-nums, right-aligned by default in tables, left in forms.
- Increment/decrement steppers only on hover/focus.
- Unit suffix (`ppm`, `°C`, `%LEL`) rendered in `--text-tertiary`.

### 14.4 Search input

- Height 36, radius 8, leading search icon, trailing clear button.
- Debounced 150 ms; loading spinner replaces search icon after 300 ms.
- Supports scope prefix (`in:incidents`, `assignee:me`) rendered as inline chips.

### 14.5 Checkbox, Radio, Switch

- **Checkbox** — 16 × 16, radius 4, 1.5 px border, brand-500 fill when checked, animated check-draw 160 ms.
- **Radio** — 16 × 16, radius 50%, 1.5 px border, brand-500 dot scale-in 160 ms.
- **Switch** — 32 × 20, knob 16 × 16, radius pill, track color transitions 200 ms. Uses labels ON/OFF for critical toggles (LOTO enable, evacuation broadcast).

### 14.6 File input & upload

- Drop zone with dashed border `--border-strong`, radius 10, min-height 128.
- On drag-over: border becomes solid brand-500, background `--brand-50`, icon animates.
- Progress: linear bar per file, thumbnail preview, virus-scan status chip.

### 14.7 Date, time, and duration pickers

- Date: calendar popover, 320 wide, month/year switcher, keyboard-navigable, ISO 8601 output.
- Time: 24-hour by default (industrial), 12-hour selectable; timezone chip.
- Duration: dual-column (value + unit); supports "1d 4h 30m" free-text parsing.
- Range: two calendars side-by-side (`lg+`), stacked (`md-`).

### 14.8 Slider

- Track 4 px, thumb 16 × 16, radius 50%.
- Tick marks optional; labeled step markers for critical parameters.
- Dual-thumb for ranges.
- Screen reader announces value + unit.

### 14.9 Rules

- All inputs must be reachable and operable via keyboard.
- Autocomplete tokens set correctly (`current-password`, `one-time-code`, etc.).
- Inline validation debounced 400 ms; server errors on blur/submit.
- Required fields marked with an asterisk *and* an `aria-required`; do not rely on color alone.

---

## 15. Dropdowns, Selects & Comboboxes

### 15.1 Select (single)

- Trigger visually identical to text input, with trailing caret.
- Menu opens 4 px below trigger, `--elevation-3`, radius 10.
- Menu max-height `min(60vh, 480 px)`, virtualized above 50 items.
- Item height 32 (dense) / 36 (default) / 44 (touch).
- Keyboard: `↑ ↓` navigate, `Enter` select, `Esc` close, typeahead search.

### 15.2 Multi-select

- Selected values render inside trigger as chips; overflow shows `+N`.
- Menu shows checkboxes leading each option.
- "Select all" and "Clear" actions in menu header.

### 15.3 Combobox (searchable)

- Filters options as user types (fuzzy match with prefix boost).
- Empty result state shows "No matches — refine or [Request new]".
- Supports async loading with skeleton items and loading tail.

### 15.4 Menu (contextual / actions)

- Right-click, kebab, chevron triggers.
- Sections with dividers, section labels in `caption` role.
- Destructive items grouped at the bottom with red icon and text.
- Shortcut hints right-aligned in `--text-tertiary`.
- Nested submenus open on hover 150 ms delay; disable in touch mode.

### 15.5 Rules

- Dropdowns must trap focus while open (Radix Popover).
- Never open on hover for click-triggered menus.
- Portal to `<body>` to avoid clipping inside overflow containers.

---

## 16. Tables & Data Grids

Tables are the workhorse of SafetyOS — Incident Registers, Permit Queues, Asset Inventories, Audit Logs. Halo defines two table classes.

### 16.1 Data Table (read + light interaction)

- Row height 44 (default), 36 (dense), 56 (comfortable).
- Header row 40 px, `--text-secondary`, `caption` casing, sticky by default.
- Alternating row shading is **off** by default. Use hairline dividers `--border-subtle` between rows.
- Row hover: background `--gray-50` (light) / `--gray-100` (dark) — no lift.
- Selected row: 3 px left accent bar in `--brand-500`, tinted background `--brand-50`.
- Numeric cells right-aligned, tabular-nums.
- Timestamp cells monospace, ISO short (`2026-07-21 14:32`) with tooltip → full ISO with tz.
- Status cells use intent chips (§20).
- Row actions: kebab menu at row end; up to 3 pinned actions on hover.

### 16.2 Data Grid (spreadsheet-like)

Built on TanStack Table + virtualized. Adds:

- Cell selection, range selection, copy/paste, keyboard nav.
- Column resize (drag handle right edge of header).
- Column reorder (drag column header).
- Column pin (left/right).
- Row grouping with collapsible group rows.
- Inline edit (double-click to edit, `Esc` to cancel, `Enter` to commit).
- Formula bar (optional, for audit-log query views).

### 16.3 Filters & sort

- Filter chip bar above table: `[+ Add filter]` inline.
- Each chip is `field operator value` with dropdown edit.
- Sort by column header click (asc → desc → none). Shift-click adds secondary sort.
- Server-side filtering for > 500 rows.

### 16.4 Empty, loading, error

- **Loading** — 12 skeleton rows, staggered shimmer 80 ms.
- **Empty** — centered illustration + copy + primary action (e.g., "Log first incident").
- **Filtered empty** — different copy: "No matches — try clearing filters" + `Clear all filters` button.
- **Error** — inline error banner top of table with retry.

### 16.5 Bulk actions

- Selection checkbox column left-most (32 px wide).
- Selecting rows spawns a **floating action bar** anchored bottom-center of table region: `[N selected]` + action buttons + `[X]` clear.
- Bulk destructive actions require confirmation modal.

### 16.6 Rules

- Never truncate life-critical data (asset tag, incident ID, PPE type). Use tooltip + wrap.
- Row density defaults to `default`; user preference persisted.
- CSV/XLSX export always available in table header.

---

## 17. Charts & Data Visualization

Halo uses **Visx** (React + D3) for custom charts, **Recharts** for standard business charts, and **deck.gl** for geospatial. Chart tokens live under `--chart-*`.

### 17.1 Chart chrome

- Chart title `heading-md`, subtitle `body-sm` in `--text-secondary`.
- Axis labels `body-xs` in `--text-tertiary`, tabular-nums.
- Gridlines 1 px `--border-subtle`, horizontal only by default.
- Zero baseline emphasized 1 px `--border-default`.
- Legend right-aligned above chart or below (mobile); chips clickable to toggle series.
- Tooltip: dark surface `--gray-900`, white text, radius 8, `--shadow-3`, sub-values in `--text-tertiary`.

### 17.2 Standard chart types

- **Line** — 2 px stroke, no fill by default. Multi-series uses categorical palette. Smoothing off in scientific contexts (raw data), monotone-cubic in KPI storytelling.
- **Area** — used only for cumulative or bounded metrics (SLA %, uptime). Fill 20% alpha of stroke color.
- **Bar** — 8–24 px bar width, 4 px gap. Rounded top corners 3 px. Threshold line overlay for target.
- **Column (stacked)** — segments in stacked palette, hover isolates segment.
- **Pie / Donut** — used sparingly, max 5 slices. Donut preferred with center KPI.
- **Radial gauge** — used for single-value bounded metrics (LEL %, tank fill). 240° arc, animated fill 480 ms.
- **Histogram / distribution** — for anomaly detection views. Overlay median + p95 markers.
- **Scatter** — for correlation views (sensor drift, near-miss vs incident). Size and color as third/fourth dimensions.
- **Boxplot** — for shift analytics, near-miss distributions per site.

### 17.3 Advanced chart types (SafetyOS-specific)

- **Risk Matrix (5×5 heatmap)** — Likelihood × Severity, cells colored via diverging palette, active cell highlighted, drill-down on click.
- **Timeline / Gantt** — for permit windows, LOTO tag lifecycles, incident investigations. Rows are entities, bars are time-windows. Milestones as diamonds, dependencies as thin curves.
- **Sankey** — for cause-chain analysis (contributing factors → incidents → outcomes). Node hover isolates flow.
- **Network / force-directed** — for knowledge graph traversal, asset dependency, personnel reachability.
- **Heatmap (calendar)** — near-miss frequency per shift per day.
- **Sparkline** — inline mini-chart in tables and KPI cards, 60 × 20, no axes.

### 17.4 Interaction primitives

- **Hover crosshair** — vertical line + point marker on all series, tooltip anchored top-right.
- **Brush / zoom** — drag on X-axis to zoom; `Esc` or double-click resets.
- **Series toggle** — click legend entry.
- **Time-range playback** — Digital Twin and event streams support a play/pause scrubber (see §19).
- **Drill-down** — clicking a chart element navigates to filtered detail view.
- **Compare mode** — toggle overlays previous period as dashed line at 50% alpha.

### 17.5 Motion

- Initial mount: axes fade in (120 ms), then series draws (line: path draw 320 ms; bar: stagger scale-Y 40 ms/bar; area: fill sweep).
- Data updates: animate along the value axis only, 240 ms.
- Never animate axes on data update (jitter).

### 17.6 Accessibility for charts

- Every chart has an accessible name, description, and data-table alternative (`aria-describedby` linking to a hidden `<table>`).
- Screen readers read title + summary sentence ("Line chart, near-misses per week, currently trending down 12% vs prior period").
- Keyboard: `Tab` to focus chart, `← →` to move crosshair, `Enter` to drill.

---

## 18. Maps & Geospatial

Halo maps use **MapLibre GL** (open) with a **custom Halo basemap style**, and **deck.gl** for high-density layers.

### 18.1 Halo basemap

- Two variants: **Halo Light** (near-white, `#F6F7F9` land, `#E4EAF2` water) and **Halo Dark** (`#0A0B0D` land, `#0F1520` water).
- Labels in Inter, size-clamped 11–14, opacity ramp with zoom.
- Roads/rail/pipelines colored on desaturated ramp so operational overlays dominate.
- Buildings extruded at zoom ≥ 15 with 20% alpha to preserve overlay clarity.

### 18.2 Layers

- **Sites** — clustered circles, cluster count in center, cluster color by aggregate risk.
- **Assets** — pin icons with intent color; hover expands to preview card.
- **Personnel** — small avatars, live position (WebSocket updates every 5 s).
- **Geofences / hazard zones** — filled polygons at 20% alpha, 2 px stroke.
- **Evac routes** — animated dashed lines (marching ants) in `--intent-success`.
- **Incidents** — pulsing markers, size scaled by severity.
- **Heat layers** — near-miss density, gas concentration, thermal.
- **Wind / plume** — vector field animation for gas dispersion simulations.

### 18.3 Controls

- Top-right: zoom in/out, compass, tilt, layer picker.
- Bottom-left: attribution, scale bar, coordinate readout (WGS84 + local grid).
- Left rail: layer legend, time scrubber, filter chips.

### 18.4 Rules

- Never use only color to distinguish overlay categories — pair with shape/icon.
- Cluster expand animates 240 ms; never instantly.
- Panning respects reduced-motion (snap instead of inertial).

---

## 19. Digital Twin Widgets

The Digital Twin is the SafetyOS visual centerpiece — a live 2.5D/3D representation of sites, equipment, personnel, and hazards. Built on **Three.js** with a **custom Halo shader pipeline**, wrapped in a React scene graph.

### 19.1 Scene composition

- **Base geometry** — CAD/BIM-imported meshes, matte PBR material, `--gray-200` (light) / `--gray-100` (dark) base albedo.
- **Overlays** — semi-transparent extrusions colored by state or risk.
- **Flow lines** — animated dashed textures along pipelines showing direction, speed proportional to flow rate.
- **Halo highlight** — hovered/selected equipment gets a 3 px outline glow in `--brand-halo`.
- **Ambient light** — soft top-down key + cool rim; cinematic but low-contrast to preserve overlay legibility.

### 19.2 Widgets

- **Twin Viewport** — the main 3D canvas. Camera presets, view-cube top-right, mini-map bottom-right, layer rail left, time scrubber bottom-center.
- **Equipment Card (in-scene)** — anchored to a mesh; opens as a floating 240 × 140 card with KPI + status + primary action.
- **Live Sensor Ring** — a radial gauge overlay attached to an asset; updates continuously.
- **Worker Chip** — 32 × 32 avatar with PPE-status indicator and live position.
- **Hazard Zone Overlay** — colored volume + label; click for details.
- **Alert Bloom** — pulsing sphere at incident location, size = severity.
- **Path Ribbon** — worker movement traces, past 15 min, fading tail.
- **Camera Frustum** — visualizes CV camera coverage cones; hover shows live feed thumbnail.
- **AI Reasoning Overlay** — when an agent is analyzing the scene, its inference nodes float above the scene, connected by animated lines (see Halo Orb §28).

### 19.3 Time-travel

- Scrubber below viewport spans the current time window (default: last 1 h, up to 90 days).
- Playback controls: `⏮ ⏯ ⏭`, speed selector (0.25× → 32×), sync-to-live toggle.
- Timeline shows event markers (incidents, permits, LOTO tags) as colored ticks.
- Scrub replays sensor states, personnel positions, and overlays in-sync.

### 19.4 Performance

- Target 60 fps on 2019+ mid-tier GPU with up to 100 k triangles + 500 dynamic entities.
- LOD swap on distance; instanced mesh for repeated equipment.
- Fallback 2D floor plan view for GPU-limited devices.

### 19.5 Rules

- Never use realistic photo-textures on base geometry — the twin is a *diagram*, not a rendering.
- Never occlude critical alerts with 3D geometry; alerts render in a screen-space overlay pass.
- All in-scene text uses SDF text with min screen size 12 px.
- Reduced-motion: animated flows freeze, ambient rotations disabled, scrubber snaps to keyframes.

---

## 20. Cards

Cards are the primary containment pattern. Halo defines a card taxonomy.

### 20.1 Card anatomy

```
┌─────────────────────────────────────────┐
│ [icon] Title                    [action]│  ← header (40)
│ Subtitle / metadata                     │
├─────────────────────────────────────────┤
│                                         │
│ Body — KPI / chart / list / form        │
│                                         │
├─────────────────────────────────────────┤
│ [footer meta]              [primary btn]│  ← footer (48) opt.
└─────────────────────────────────────────┘
```

- Surface `--surface-raised`, border `--border-subtle`, radius 10, shadow-2.
- Header padding 16 × 20; body padding 20; footer padding 16 × 20.
- Optional accent bar (3 px left) in intent color for status framing.

### 20.2 Card variants

- **KPI Card** — hero number, sparkline, delta chip, trend arrow. Hover reveals `View details →`.
- **Metric Card** — smaller, 3–6 metrics stacked or grid.
- **Status Card** — intent-framed with status chip and action.
- **Chart Card** — chart-first, minimal chrome, optional legend in header.
- **List Card** — top-N list with rows; last row = "See all →".
- **Media Card** — camera feed thumbnail with live indicator.
- **AI Insight Card** — Halo-gradient accent, "AI-generated" chip, reasoning link.
- **Incident Card** — intent-framed, severity chip, timestamp, assignee avatar, quick actions.
- **Permit Card** — status chip (Draft/Issued/Active/Closed), permit type icon, expiry countdown.
- **Asset Card** — asset tag, criticality, last inspection, live sensor readout.

### 20.3 Chips (used inside cards)

- Height 20/24/28 (xs/sm/md), radius pill, padding 8/10/12.
- Types: neutral, brand, intent-{info|success|warning|critical}, tag (user-defined color).
- Removable variant: trailing `×` at 12 px.
- Chips never contain more than 24 chars; overflow truncates with tooltip.

### 20.4 Card motion

- Enter: fade + translateY(4 px) at 200 ms, stagger 40 ms across a grid.
- Hover: elevation +1, translateY(-2 px), 120 ms.
- Expand: morph height with content, 320 ms, `ease-emphasized`.

---

## 21. Forms

### 21.1 Layout

- **Single-column** by default (max 640 wide). Multi-column allowed for pairs like start/end date, city/postcode.
- **Section headings** `heading-sm`, followed by 12 px gap.
- **Field vertical rhythm** 20 px between fields, 32 px between sections.
- **Field grid** — 12-col sub-grid inside forms; field spans documented.

### 21.2 Field composition

Every field: `[Label*] [Helper] [Control] [Inline error / status]`. Label always above control. Helper text 12/16 in `--text-tertiary`. Required marked with `*` and `aria-required`.

### 21.3 Validation

- **Client-side** — real-time on blur, or on change once field has been touched. Debounce 400 ms.
- **Server-side** — on submit; server errors surface both inline and as a form-level banner.
- Errors use `--intent-critical-700` text + `--intent-critical-500` border + error icon.
- Success state used only for irreversible actions (e.g., password reset OTP verified).

### 21.4 Multi-step / wizard forms

Used for Permit-to-Work issuance, Incident logging, Onboarding.

- Progress rail at top: stepper with step number, title, and completion state (checked, current, pending).
- `Next` primary, `Back` tertiary, `Save as draft` ghost.
- Autosave every 15 s while form is dirty; toast on autosave.
- Step navigation is non-linear if all prior steps valid; otherwise disabled with tooltip.

### 21.5 Complex form patterns

- **Repeater** — array of subforms with add/remove/reorder.
- **Conditional fields** — show/hide with 200 ms fade + height morph.
- **Dependent selects** — child select clears + shows loading skeleton when parent changes.
- **Signature** — canvas pad, clear + accept buttons, produces PNG + hash for audit trail.
- **PPE checklist** — icons per PPE type, tap to toggle, requires all mandatory checked to submit.

### 21.6 Submit behavior

- Primary button becomes `aria-busy` and shows spinner on submit.
- On success: toast + navigate to record detail or close modal.
- On error: focus first invalid field, scroll into view, expand section if collapsed.

---

## 22. Modals, Dialogs & Sheets

### 22.1 Modal

- Centered, max-width 560 (sm) / 720 (md) / 960 (lg).
- Backdrop `rgba(15,23,42,.48)` with 4 px blur.
- Enter: scale 0.98→1 + fade, 240 ms. Exit: scale 1→0.98 + fade, 160 ms.
- Header: title `heading-md`, close `×` top-right.
- Body: 24 px padding, scrollable if content exceeds `70vh`.
- Footer: sticky, right-aligned action group.
- Focus trapped; `Esc` closes unless action in progress.

### 22.2 Dialog (confirmation)

- Max-width 440.
- Icon top-left (intent color for destructive), title, description, actions.
- Destructive dialogs require **typed confirmation** (e.g., type `DELETE`) for irreversible bulk actions and for LOTO removal.

### 22.3 Sheet (side drawer)

- Attached right (default) or bottom (mobile). Width 480/640/960; height 60/85vh (bottom).
- Enter: translateX from +32 px + fade, 320 ms.
- Sheet is preferred over modal for detail views (Incident details, Asset details) — preserves list context.
- Multiple sheets not allowed; a new sheet replaces the current with a lateral slide.

### 22.4 Popover

- `--elevation-3`, radius 10, max-width 320.
- Anchored to trigger, auto-flip to keep in viewport.
- Enter: fade + translate 4 px toward trigger, 160 ms.

### 22.5 Rules

- Never open a modal from a modal — use sheet-in-modal or nested step.
- Modals do not contain complex data grids; use a full page or sheet instead.
- Never auto-open modals on page load (except critical alerts that require ACK).

---

## 23. Notifications

Notifications in SafetyOS have three tiers. Do not confuse them.

### 23.1 Inline banner

- Full-width strip at top of page or section.
- Intent-colored background 10% alpha, 1 px border, intent icon, dismiss.
- Used for: system status, degraded mode, upcoming maintenance windows, permit expiring.

### 23.2 Notification Center (bell)

- Bell icon in Topbar with unread count badge.
- Panel opens as a right sheet (400 wide) grouped by day.
- Each item: intent icon, title, description, timestamp, source module, actions.
- Filters: All / Alerts / Mentions / System.
- Bulk mark-as-read + snooze.

### 23.3 Critical Alert (interstitial)

Reserved for `--intent-critical` and `--intent-catastrophic` events (evac, gas alarm, catastrophic incident).

- Full-viewport takeover; backdrop pulses red.
- Siren waveform icon animates.
- ACK button ≥ `xl` size; requires hold-to-confirm (500 ms progress ring) to prevent misclick.
- Cannot be dismissed with `Esc`.
- Persists on all connected devices until ACK'd by a role with permission.

### 23.4 Motion & sound

- Notification arrival: 200 ms slide-in + soft chime (user-configurable).
- Critical alerts: audible siren + haptic on mobile + optional room speaker via device integration.
- All sounds respect user preference and site-wide quiet hours.

---

## 24. Toasts

Toasts are ephemeral non-blocking feedback.

### 24.1 Anatomy

- Position: bottom-right (desktop), top-center (mobile).
- Width 360 desktop, full-width minus 32 mobile.
- Anatomy: intent icon · title · optional description · optional action · close.
- Radius 10, shadow-3, surface `--surface-raised`.

### 24.2 Variants

- **Info** — neutral, 4 s auto-dismiss.
- **Success** — green, 4 s.
- **Warning** — amber, 6 s.
- **Error** — red, sticky until dismissed or action taken.
- **Loading** — spinner, sticky, transforms into success/error on resolution.
- **Undo** — includes `Undo` action button, 8 s.

### 24.3 Rules

- Max 3 toasts stacked; new toasts push oldest out with 160 ms fade.
- Toasts never block interaction and never appear over modals — inside a modal, use inline banners.
- Never use toasts for critical safety alerts (use §23.3).
- Toast text ≤ 100 chars.

---

## 25. Sidebars

### 25.1 Primary nav rail (left)

- Width 240 (expanded) / 64 (collapsed).
- Background `--surface-canvas` or `--surface-sunken` depending on theme.
- Logo top, workspace switcher below, primary nav sections, spacer, user chip bottom.
- Sections: **Command Center** · **Operations** · **Assets** · **Incidents & ER** · **Permits & LOTO** · **Compliance** · **Analytics** · **Admin**. Sections match Information Architecture v1.0.
- Section labels in `caption` casing; items 32 px height, 12 px icon left, label, right-align chevron if submenu.
- Active item: 3 px left accent `--brand-500`, tinted bg `--brand-50`, icon solid variant.
- Hover: bg `--gray-50`, 120 ms.
- Expand/collapse animates width 200 ms, labels fade 120 ms.

### 25.2 Contextual sidebar (right)

- Width 360.
- Used for: filters, details, AI reasoning panel, activity log.
- Can be pinned (persistent) or ephemeral (auto-close on outside click on `md-`).
- Tabs at top when multiple contextual panels available.

### 25.3 Rules

- Nav rail is always visible on `lg+`. On `md-` it collapses into a hamburger drawer.
- Contextual sidebar collapses to bottom sheet on `md-`.
- Both sidebars support keyboard nav (`Tab`, arrow keys within groups).

---

## 26. Topbars

### 26.1 Anatomy

Height 56 (default), 64 (executive dashboards), 48 (mobile). Sticky.

```
┌ Logo/Workspace ─ Breadcrumb ─────── Global Search ─── Bell ─ AI ─ Avatar ┐
```

- **Logo/Workspace switcher** left. Switching workspaces animates a 160 ms cross-fade of content.
- **Breadcrumb** shows hierarchy from IA (Site › Area › Asset › Tab); collapsible with `…` when long.
- **Global Search** (⌘K) — center, expands from 320 to 640 on focus, opens Command Palette.
- **Live status pill** — small pill showing "All systems nominal" / "3 degraded" / "Critical". Click opens System Health.
- **Notification bell** with badge (§23).
- **AI Halo Orb button** — see §28.
- **User avatar** — 32 × 32, opens user menu (profile, prefs, sign-out, theme).

### 26.2 Behavior

- Elevation is 0 by default; on scroll, gains `--shadow-2` and a hairline bottom border.
- Never hides on scroll (safety-critical context always visible).
- On `md-`, breadcrumb collapses to page title + back chevron.

---

## 27. Command Palette

The Command Palette (⌘K / Ctrl+K) is the power-user primary surface, inspired by Linear, Raycast, and Superhuman.

### 27.1 Anatomy

- Centered overlay, 640 wide × dynamic height, max 70vh.
- Backdrop 40% blur, 30% dim.
- Enter: scale 0.98→1 + fade, 200 ms, from top-16px.
- Input at top, 44 px height, no border, transparent background, placeholder "Search commands, incidents, assets, people…".
- Results grouped by section: Commands · Navigation · Incidents · Assets · People · AI Actions · Recent.
- Item row: leading icon + primary label + secondary metadata + trailing shortcut.
- Selected row highlighted with `--brand-50` tint + 3 px left accent + subtle scale 1.005.

### 27.2 Behavior

- Fuzzy search with prefix boost and recency boost.
- `↑ ↓` navigate, `Enter` execute, `Tab` expand action into sub-palette (e.g., "Assign to…" opens people search inline).
- `Esc` closes; `⌘⇧K` opens with last query preserved.
- Scoped search: type `>` to switch to command mode, `#` for tags, `@` for people, `!` for AI.
- Every command has an entry: navigation, creation ("New incident"), toggles ("Toggle dark mode"), AI actions ("Summarize this shift").

### 27.3 AI integration

- `!` prefix routes the query to the Halo agent.
- Agent responses stream inline in the palette; supports follow-up.
- "Explain this alert", "Draft PTW for confined space", "Show risk trend for Site 3 last 30 d" all executable from the palette.

### 27.4 Motion

- Result list stagger 20 ms on filter change.
- Command execution: palette fades out 160 ms; success toast confirms.

---

## 28. AI Assistant Surface (Halo Orb)

The Halo Orb is the anthropomorphic surface for the SafetyOS agent. It must feel *alive without being cute*.

### 28.1 Orb visual

- 48 × 48 (idle, Topbar), 64 × 64 (expanded), 96 × 96 (hero on empty-state onboarding).
- Composition: 3-layer radial gradient (`--brand-halo` outer, `--brand-500` mid, translucent white core).
- Ambient motion: 2.4 s slow rotation of inner gradient (imperceptible), subtle 3 px scale breathe every 4 s.
- Idle glow: `--shadow-glow-brand` at 40% opacity.
- Reduced-motion: static gradient with no rotation or breathe.

### 28.2 States

- **Idle** — ambient loop.
- **Listening** — 2 concentric ripples pulse outward every 900 ms while microphone active.
- **Thinking** — orb rotates faster (1.6 s cycle), particles orbit orb (3 particles, 240° arc).
- **Streaming** — orb steady, dot-trail emanates toward the response surface.
- **Executing tool** — small tool icon (spanner, magnifier, DB) overlays orb bottom-right, 120 ms enter.
- **Confident** — subtle green tint added to core.
- **Uncertain** — subtle amber tint + slower ambient loop.
- **Error** — red tint + 1 shake (8 px, once).

### 28.3 Assistant panel

Opening the Orb (click or `⌘J`) opens a right sheet:

- **Header** — orb (small) + agent name + status pill.
- **Reasoning timeline** — vertical timeline of steps: `Observed`, `Retrieved`, `Reasoned`, `Called tool`, `Responded`. Each step expandable. Streams as agent thinks.
- **Response surface** — streamed markdown, code, and interactive components (charts, chip pills for entities, action buttons "Create incident from this").
- **Confidence chip** — shown alongside each factual claim: `High 92%`, `Medium 71%`, `Low 44%`. Click for citations.
- **Tool traces** — expandable "Used: `kg.query`, `predictive.risk_score`, `cv.frame_lookup`".
- **Citations** — inline superscripts linking to source documents in the Knowledge Graph.
- **Actions bar** — copy, regenerate, share, save to Notes, escalate to human.

### 28.4 Rules

- The Orb never lies about certainty. Confidence is model-emitted, not decorative.
- Tool executions that affect state (create PTW, dispatch responder) require human confirmation.
- Reasoning is inspectable; no black-box responses in safety-critical contexts.
- The Orb dims to 20% when the user is in a hands-on control-room task requiring undivided attention.

---

## 29. Empty States

Empty states are opportunities, not failures. Halo defines four archetypes.

### 29.1 Zero-state (first use)

- Centered illustration (duotone, 200 × 160).
- Heading `heading-md`, description `body-md` in `--text-secondary`, 2 lines max.
- Primary action button + secondary "Learn more" link.
- Optional 3-step onboarding checklist below.

### 29.2 No results (search / filter)

- Compact, no illustration, or small 96 × 96 icon.
- Heading "No matches for '{query}'".
- Suggestions: "Clear filters", "Search everywhere", "Ask Halo about this".

### 29.3 Awaiting data

- Sensor / integration not yet reporting.
- Icon + "Waiting for first data from {integration}".
- Link to integration setup.

### 29.4 Access restricted

- Lock icon + "You don't have access to this view".
- Contact-admin action or request-access button (creates approval workflow).

---

## 30. Loading States

Loading in SafetyOS is a *communication* about what is happening, not a spinner default.

### 30.1 Skeleton screens

- Skeletons mirror the shape of incoming content: cards, table rows, chart axes.
- Base color `--gray-100`, shimmer `--gray-200`, 1.6 s cycle, `ease-orbit`.
- Skeletons never remain longer than **4 s**; after that, show a progress indicator with cause ("Fetching from OT gateway…").

### 30.2 Spinners

- **Ring spinner** — 16/20/24 px, 1200 ms rotation, brand color.
- **Dot spinner** — 3 dots, staggered scale, used for AI thinking inline.
- **Bar spinner** — linear progress indeterminate, top of page during route transitions.

### 30.3 Progress indicators

- **Linear** — determinate, 4 px height, radius pill.
- **Radial** — determinate, 32/48/64 px ring, percentage inside.
- **Stepper progress** — for multi-step processes (wizard forms, bulk actions).

### 30.4 Rules

- Show a skeleton within 100 ms of a request.
- Show a spinner within 300 ms; a message within 1 s; a cause within 3 s.
- Never a full-page spinner unless the entire viewport is genuinely empty of content.

---

## 31. Error States

Errors in industrial contexts must be *precise, honest, and actionable*.

### 31.1 Error taxonomy

| Class | Example | Surface |
|---|---|---|
| **Input error** | Field validation | Inline under field |
| **Action error** | Save failed | Toast + inline retry |
| **Section error** | Widget failed to load | Card-level error state |
| **Page error** | Route not found | Full-page error |
| **System error** | Backend outage | Global inline banner |
| **Security error** | Session expired | Modal, forces re-auth |
| **Safety error** | OT gateway lost | Interstitial critical alert (§23.3) |

### 31.2 Error content

Every error message contains:

1. **What happened** — plain language, no jargon.
2. **Why (if known)** — 1 sentence, technical cause.
3. **What the user can do** — retry, contact support, alternate path.
4. **Reference ID** — copyable UUID for support.

Example:
> **We couldn't save this permit.**
> The OT gateway at Site-3 didn't respond within 10 s. Your changes are preserved locally.
> [Retry] [Save as draft] · Ref: `err_01H8Y…`

### 31.3 Visual

- Section error: card body replaced with red icon, heading, description, retry.
- Page error: centered illustration + heading + description + primary action + support link.
- Global banner: full-width, `--intent-critical-100` bg, red left border, critical icon.

### 31.4 Rules

- Never blame the user.
- Never show raw stack traces to end users; capture to Sentry + expose only ref ID.
- Errors in critical workflows (PTW, LOTO, Incident, Evac) must offer an offline-safe fallback.

---

## 32. Accessibility

SafetyOS targets **WCAG 2.2 AA** globally, **AAA** for all safety-critical surfaces (PTW, LOTO, Incident, ER, Alerts).

### 32.1 Color & contrast

- Text ≥ 4.5:1 against background (AA), 7:1 for safety-critical (AAA).
- Large text (≥ 24 px or 19 px bold) ≥ 3:1.
- Non-text (borders, icons carrying meaning) ≥ 3:1.
- Never rely on color alone — pair with icon, label, shape, motion.

### 32.2 Keyboard

- Every interactive element focusable via `Tab`.
- Focus order matches visual order.
- `:focus-visible` ring always visible (2 px inner + 2 px outer glow, `--brand-500`).
- Focus never trapped except within modals/palette.
- Skip links first tab stop: "Skip to main", "Skip to nav".

### 32.3 Screen readers

- Semantic HTML first; ARIA as reinforcement, not replacement.
- Live regions:
  - Toasts → `role="status"` (polite).
  - Critical alerts → `role="alert"` (assertive).
  - AI streaming responses → `role="log"` (polite).
- All charts have hidden `<table>` alternative + `aria-describedby`.
- Every icon-only button has `aria-label`.

### 32.4 Motion

- Respect `prefers-reduced-motion: reduce` globally: durations clamped to ≤120 ms or none; no parallax; no ambient loops.
- No animation that flashes > 3 Hz.

### 32.5 Cognitive

- Reading level target: 8th grade for operator UI, plain-language variants for high-stress alerts.
- Time-out warnings 60 s before expiry with extend option.
- Undo available for all reversible actions.
- Confirmation for destructive/irreversible actions.

### 32.6 Assistive contexts

- **High-contrast theme** — separate token layer, 21:1 contrast target.
- **Colorblind modes** — deuteranopia/protanopia/tritanopia palette swaps for intent + data-viz.
- **Voice control** — every button has a visible label (no icon-only without text) in the "Ops Voice" mode.
- **Screen magnifier** — components stay usable up to 400% zoom.

---

## 33. Keyboard Shortcuts

Halo defines a global shortcut map. Modifiers: `⌘` (macOS) / `Ctrl` (Windows/Linux).

### 33.1 Global

| Shortcut | Action |
|---|---|
| `⌘K` | Open Command Palette |
| `⌘⇧K` | Open Palette with last query |
| `⌘J` | Toggle Halo AI assistant |
| `⌘/` | Show keyboard shortcuts sheet |
| `⌘,` | Open preferences |
| `⌘\` | Toggle nav rail |
| `⌘⇧D` | Toggle dark mode |
| `⌘⇧N` | Toggle notification center |
| `⌘.` | Snooze all non-critical notifications 15 min |
| `g` then `d` | Go to Dashboard |
| `g` then `i` | Go to Incidents |
| `g` then `p` | Go to Permits |
| `g` then `l` | Go to LOTO |
| `g` then `t` | Go to Digital Twin |
| `g` then `c` | Go to Compliance |
| `?` | Contextual help |
| `Esc` | Close top-most overlay |

### 33.2 Navigation

| Shortcut | Action |
|---|---|
| `[` / `]` | Previous / next record in list |
| `⌘[` / `⌘]` | Back / forward in history |
| `⌘↑` / `⌘↓` | Jump to top/bottom of list |

### 33.3 Table

| Shortcut | Action |
|---|---|
| `↑ ↓ ← →` | Move focus |
| `Enter` | Open row detail |
| `Space` | Toggle row selection |
| `⌘A` | Select all (visible) |
| `⌘⇧A` | Select all (matching filter) |
| `⌘F` | Filter this column |
| `⌘E` | Export selection |

### 33.4 Incident / PTW / LOTO

| Shortcut | Action |
|---|---|
| `n` | New incident/permit |
| `a` | Assign |
| `s` | Change status |
| `c` | Comment |
| `⌘⏎` | Submit form |
| `⌘⇧⏎` | Submit & create another |

### 33.5 AI

| Shortcut | Action |
|---|---|
| `⌘I` | Ask Halo about selection/context |
| `⌘⇧I` | Explain this alert |
| `⌘⇧S` | Summarize current view |

### 33.6 Rules

- Shortcuts are discoverable in Command Palette (each command shows its shortcut).
- User can customize non-global shortcuts in preferences.
- Never assign shortcuts that conflict with browser or OS defaults.
- Show shortcut hints in tooltips after 800 ms hover.

---

## 34. Responsive Rules

### 34.1 Layout adaptation matrix

| Region | xs / sm | md | lg | xl / 2xl / 3xl | 4xl |
|---|---|---|---|---|---|
| Topbar | 48 h, hamburger | 56 h, condensed | 56 h, full | 56 h, full | 64 h |
| Nav rail | Drawer | Rail 64 icon-only | Rail 240 | Rail 240 | Rail 280 |
| Content | Single col, cards stack | 8-col | 12-col | 12-col | 16-col |
| Contextual panel | Bottom sheet | Bottom sheet | Right 360, ephemeral | Right 360, pinnable | Right 400, pinnable |
| Tables | Card-list (row → card) | Horizontal scroll | Full table | Full table | Full table w/ pinned cols |
| Charts | Full-width, simplified | Full-width | Grid | Grid | Grid + comparison overlay |
| Digital Twin | 2D floor plan | 2D + selective 3D | Full 3D | Full 3D | Full 3D + multi-viewport |

### 34.2 Adaptive patterns

- **Card-list transformation** — tables become card-lists on mobile, with primary field as title.
- **Sheet substitution** — right sheets become bottom sheets on mobile.
- **Bottom nav** on mobile PWA: 5-item bar (Home, Twin, Incidents, Scan, More).
- **Sticky action bar** on mobile for primary form action.
- **Reachability** — critical actions in mobile forms placed in bottom third.

### 34.3 Touch adaptations

- Min tap target 44 × 44.
- Increased spacing (16 → 20) in field groups.
- Long-press replaces right-click.
- Swipe gestures: swipe-right archive, swipe-left ack (never destructive without confirm).

### 34.4 Video wall (4xl+)

- Multi-viewport dashboards support 4× / 6× / 9× tile layouts.
- Higher type ramp (Display sizes) for legibility at distance.
- Reduced interactivity — video wall is read-primarily.

---

## 35. Dark Mode & Theming

### 35.1 Dark mode

Dark mode is the **default** for control-room and 24/7 operator surfaces. Light mode is default for admin, analytics, and executive contexts.

- Achieved via a full swap of semantic tokens (not just color inversion).
- Canvas: `--gray-50` in dark (`#0A0B0D`).
- Elevation in dark uses *surface lightening* + subtle border, not shadow.
- Brand colors shift: `--brand-500` in dark = `#4A85FA` (brighter to compensate for luminance).
- Intent colors desaturate 10% and lighten 5% for dark mode legibility.
- Images and illustrations swap to dark-mode variants.
- Charts use dark-mode categorical palette (slightly brighter, lower saturation).

### 35.2 Theming architecture

- Themes are token layers: `light`, `dark`, `high-contrast`, `daltonized-{deutan|protan|tritan}`, `night-shift` (warm-shifted for 22:00–06:00 shifts).
- Theme is chosen via `data-theme="…"` attribute on `<html>`. Tokens are re-mapped in CSS via `[data-theme=dark] { --surface-canvas: …; }`.
- User preference persisted in profile + local storage. System preference `prefers-color-scheme` is the initial default.
- Per-workspace theme lock available for regulated sites.

### 35.3 Rules

- Never hardcode colors — every color must go through a token.
- Every screenshot in docs must exist in both themes.
- Test contrast in both themes on every PR.
- Halo Orb, alerts, and Digital Twin overlays are tuned per theme; never use the same asset.

### 35.4 Night-shift theme

- Warm color temperature shift (reduce blue channel 15%).
- Elevated contrast for tired eyes (+5% luminance delta).
- Auto-activates on user preference or time-of-day if enabled.

---

## 36. Voice, Content & Localization

### 36.1 Voice

Halo voice is **calm, precise, direct**. Sentences are short. Verbs are active. Jargon is contextual — used with subject-matter operators, avoided with executives.

- Alerts: imperative — "Evacuate Zone 3 now."
- Confirmations: outcome-first — "Permit issued. 4 signatures received."
- Errors: honest — "We couldn't save this. Try again or save as draft."
- AI: hedged when uncertain — "I'm 71% confident this is a false alarm."

### 36.2 Content rules

- **No exclamation marks** except in critical alerts.
- **Numbers**: use digits (5, not "five"); tabular in tables and KPIs; SI units by default.
- **Dates**: ISO 8601 in UI (`2026-07-21`), long-form when contextual ("Jul 21, 2026").
- **Times**: 24-hour default; user-selectable; always with timezone chip in cross-site views.
- **Capitalization**: Sentence case for headings, titles, buttons. Title Case only for proper nouns.
- **Truncation**: Never truncate safety-critical identifiers.

### 36.3 Localization

- English (en-US) is source. Priority locales: en-GB, es-419, pt-BR, fr-FR, de-DE, ja-JP, ko-KR, zh-CN, ar-SA, hi-IN.
- All strings via `i18next` ICU MessageFormat.
- Layouts tested for +30% string expansion (German, French).
- RTL support (Arabic, Hebrew): mirrored layout, mirrored icons where directional, LTR-preserved for code, coordinates, numbers.
- Date/time/number formatting via `Intl` APIs.
- Safety-critical translations require domain-expert review before ship.

---

## 37. Governance & Contribution

### 37.1 Repository

- Monorepo: `@safetyos/design-system`
  - `packages/tokens` — Style Dictionary source + emitted platforms
  - `packages/react` — React + Radix primitives + shadcn/ui extensions
  - `packages/icons` — SVG library + generated React components
  - `packages/motion` — Framer Motion presets
  - `packages/charts` — Visx-based chart primitives
  - `packages/twin` — Three.js twin primitives
  - `apps/docs` — living documentation (Storybook + MDX)
  - `apps/figma-plugin` — token sync + component publish

### 37.2 Versioning

- Semantic Versioning. Breaking token changes require RFC and 2-minor-cycle deprecation.
- Component API changes documented in `CHANGELOG.md` per package.

### 37.3 Contribution process

1. RFC in `/rfcs` for any new component, new token category, or breaking change.
2. Prototype in Figma → component in Storybook → RFC review → PR → automated tests (visual regression + a11y + contrast + Chromatic) → merge.
3. All components must ship with: docs, Storybook stories (all states), a11y report, RTL check, dark-mode check, motion-reduced check.

### 37.4 Definition of Done

A component is Done when it has:

- Design tokens applied (no hardcoded values)
- All documented states implemented and tested
- Keyboard, screen reader, high-contrast, reduced-motion tested
- Storybook stories with interaction tests
- Visual regression baseline
- Dark + light + high-contrast variants
- RTL variant
- Localization keys extracted
- Motion honoring reduced-motion preference
- Public docs page with usage, do/don't, code sample, live playground
- Owner assigned in `CODEOWNERS`

### 37.5 Metrics

The design system health dashboard tracks:

- Token adoption % across product code
- Component reuse rate (new component vs reuse)
- A11y issue count (target: 0 P0, < 5 P1 open at any time)
- Visual regression flake rate
- Time from RFC to GA
- User-reported UX incidents linked to design system

---

## Appendix A — Token Sample (CSS)

```css
:root {
  /* Surfaces */
  --surface-canvas: var(--gray-0);
  --surface-sunken: var(--gray-50);
  --surface-raised: #FFFFFF;
  --surface-overlay: rgba(255,255,255,0.72);

  /* Text */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-700);
  --text-tertiary: var(--gray-500);
  --text-on-accent: #FFFFFF;
  --text-disabled: var(--gray-400);

  /* Borders */
  --border-subtle: var(--gray-100);
  --border-default: var(--gray-200);
  --border-strong: var(--gray-300);
  --border-focus: var(--brand-500);

  /* Intent */
  --intent-info-500: #0EA5E9;
  --intent-success-500: #10B981;
  --intent-warning-500: #F59E0B;
  --intent-critical-500: #EF4444;
  --intent-catastrophic-500: #B91C1C;

  /* Brand */
  --brand-500: #2563EB;
  --brand-halo: linear-gradient(135deg, #5AA0FF 0%, #7C6CFF 100%);

  /* Radius */
  --radius-md: 6px;
  --radius-lg: 10px;

  /* Motion */
  --duration-fast: 120ms;
  --duration-moderate: 200ms;
  --duration-slow: 320ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Shadow */
  --shadow-2: 0 2px 6px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);
  --shadow-focus: 0 0 0 3px rgba(37,99,235,.35);

  /* Z */
  --z-modal: 1000;
  --z-toast: 1100;
  --z-palette: 1200;
  --z-orb: 1300;
  --z-critical: 1400;
}

[data-theme="dark"] {
  --surface-canvas: #0A0B0D;
  --surface-sunken: #050609;
  --surface-raised: #101216;
  --surface-overlay: rgba(16,18,22,0.72);
  --text-primary: #E4E7ED;
  --text-secondary: #C0C6D0;
  --text-tertiary: #8A93A1;
  --border-subtle: #181B21;
  --border-default: #22262E;
  --border-strong: #2F343D;
  --brand-500: #4A85FA;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-moderate: 0ms;
    --duration-slow: 0ms;
    --duration-deliberate: 0ms;
  }
}
```

---

## Appendix B — Component Import Sample (React)

```tsx
import { Button, Card, DataTable, HaloOrb } from "@safetyos/react";
import { IncidentSeverityChip } from "@safetyos/react/incidents";
import { RiskMatrix } from "@safetyos/charts";
import { TwinViewport } from "@safetyos/twin";

export function IncidentDetailHeader({ incident }) {
  return (
    <Card variant="incident" intent={incident.severity}>
      <Card.Header>
        <Card.Title>{incident.title}</Card.Title>
        <IncidentSeverityChip severity={incident.severity} />
      </Card.Header>
      <Card.Body>
        <RiskMatrix likelihood={incident.likelihood} severity={incident.severity} />
      </Card.Body>
      <Card.Footer>
        <Button variant="secondary">Reassign</Button>
        <Button variant="primary">Open investigation</Button>
      </Card.Footer>
    </Card>
  );
}
```

---

## Appendix C — Cross-References

- **PRSD v1.0** — product goals, personas, module scope
- **Master Feature Specifications v1.0 + vNext** — 466 features across Modules 1–27
- **Information Architecture v1.0** — canonical routes, page inventory, permissions
- **User Flow Specification v1.0** — end-to-end interaction sequences

Every visual decision in this document maps back to a feature ID, persona, or flow in those documents. When a conflict arises, PRSD > Feature Spec > IA > User Flow > Design System.

---

*End of Document — SafetyOS Design System v1.0*
*"Signal over ornament. Physics of trust. Reveal the agent."*
