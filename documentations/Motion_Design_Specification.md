# Motion Design Specification — SafetyOS

## The Canonical Interaction & Animation Language for the AI-Powered Industrial Safety Intelligence Platform

**Document Version:** 1.0
**Status:** Canonical Motion Reference — Engineering & Design Handoff
**Baseline:** PRSD v1.0 + Master Feature Specifications v1.0 (466 features / 24 modules) + vNext Patch (Modules 25–27) + Information Architecture v1.0 + User Flow Specification v1.0 + Design System v1.0 (Halo) + Screen Specifications v1.0 + Frontend Architecture v1.0 + API Specification v1.0
**Owners:** Motion Design Director, Staff Interaction Engineer, Design Systems Lead, Principal Frontend Architect
**Classification:** Confidential — Product Blueprint
**Codename:** *Kinesis* — the SafetyOS motion language
**Target Stack:** Next.js 15 · React 19 · Framer Motion 12 · Motion (motion.dev) · React Spring 9 (selective) · GSAP 3.12 (premium hero only) · Three.js r170 · React Flow 12 · deck.gl 9 · CSS Transitions · CSS Custom Properties · Tailwind CSS 4 · Radix UI · shadcn/ui
**Last Reviewed:** 2026-07-22

---

## Table of Contents

1. [Motion Philosophy](#1-motion-philosophy)
2. [Motion Design Language](#2-motion-design-language)
3. [Motion Tokens](#3-motion-tokens)
4. [Animation Categories](#4-animation-categories)
5. [Navigation Motion](#5-navigation-motion)
6. [Micro-Interactions](#6-micro-interactions)
7. [AI Motion Language](#7-ai-motion-language)
8. [Dashboard Motion](#8-dashboard-motion)
9. [Digital Twin Motion](#9-digital-twin-motion)
10. [Data Visualization Motion](#10-data-visualization-motion)
11. [Loading Experience](#11-loading-experience)
12. [Empty States](#12-empty-states)
13. [Accessibility](#13-accessibility)
14. [Performance Budget](#14-performance-budget)
15. [Technology Mapping](#15-technology-mapping)
16. [Reusable Motion Components](#16-reusable-motion-components)
17. [Motion Do's and Don'ts](#17-motion-dos-and-donts)
18. [Engineering Guidelines](#18-engineering-guidelines)
19. [Screen-by-Screen Motion Matrix](#19-screen-by-screen-motion-matrix)

---

## 1. Motion Philosophy

### 1.1 The Kinesis Doctrine

SafetyOS operates in environments where a misread signal costs lives. Motion in SafetyOS is not decoration — it is **communication infrastructure**. Every frame rendered, every transition composed, every easing curve selected carries the weight of a design decision that either clarifies or obscures a safety-critical signal.

Kinesis, the SafetyOS motion language, exists to make the platform feel like a **calm, intelligent instrument** — one that an operator trusts at 03:00 in a control room, that a CSO respects in a boardroom, and that an AI agent inhabits with visible reasoning.

Motion in SafetyOS serves exactly four functions:

1. **Spatial orientation** — Where did I come from? Where am I going? What changed?
2. **State communication** — Is this loading? Did it succeed? Is the AI thinking or finished?
3. **Attention direction** — A rising risk score, an incoming alarm, a confidence drop — motion directs the eye before the brain reads the label.
4. **Perceived performance** — Skeletons, staggered reveals, and optimistic updates make the platform feel instantaneous even when the OT gateway takes 3 seconds.

Motion that does not serve one of these four functions is a spec violation and must be removed.

### 1.2 Emotional Signature

The platform must communicate seven qualities simultaneously. Each quality maps to specific motion parameters:

| Quality | Motion Expression | Anti-pattern |
|---|---|---|
| **Confidence** | Decisive transitions; no hesitation; animations commit fully to their end state | Bouncing, wobbling, rubber-banding, overshooting |
| **Intelligence** | AI states stream with visible reasoning; tools light up sequentially; confidence is legible | Opaque spinners; generic "AI is thinking" with no trace |
| **Calmness** | Muted durations (120–320 ms); no parallax beyond 8 px; grayscale-first surfaces stay still | Flashy entrances; gratuitous particle effects; auto-playing video |
| **Precision** | Pixel-snapped endpoints; tabular-nums tick through digits; easing curves land exactly | Springy overshoots > 8%; jittery repositions; layout shift |
| **Safety** | Critical alerts animate instantly (≤80 ms); catastrophic states pulse with intent color; emergency buttons never animate in ways that delay activation | Slow-fading critical alerts; bouncing emergency CTAs; animated loading on SOS |
| **Responsiveness** | Hover responds in ≤50 ms; press responds in ≤80 ms; skeleton appears in ≤100 ms | Delayed hover states; perceptible lag between click and feedback |
| **Premium quality** | Spring physics on the Halo Orb; cinematic camera in Digital Twin; counter-tick animations on KPIs; micro-stagger on card grids | Flat opacity toggles; CSS `display:none` toggles; unstyled FOUC |

### 1.3 Motion Principles

Seven immovable principles govern every animation decision in SafetyOS:

**Principle 1 — Safety-First Rendering**
Motion must never delay, obscure, or suppress a safety-critical signal. `--intent-critical` and `--intent-catastrophic` events override all running animations. Emergency actions (SOS, Evacuate, Declare Emergency) render with zero entry animation — they appear instantly. The hold-to-confirm ring on emergency buttons is functional motion, not decorative.

**Principle 2 — Quiet by Default, Loud When It Matters**
During nominal operations, the interface is nearly still. Cards sit. Tables rest. Charts hold. Motion is *reserved* — banked for the moment a risk score rises, an alarm fires, an AI agent begins reasoning, or a permit expires. This perceptual contrast is the trust signal: when something moves, it means something.

**Principle 3 — Progressive Intensity**
Motion intensity must be perceptually monotonic with severity:
- `nominal` → no motion (static)
- `info` → subtle fade (120 ms)
- `warning` → fade + slight pulse (200 ms, 1 cycle)
- `critical` → immediate appear + 2-cycle pulse (intent-critical glow)
- `catastrophic` → instant appear + continuous pulse + viewport overlay + audible

This progression must never be violated. A warning-level event must never animate more aggressively than a critical-level event.

**Principle 4 — Consistent Physics**
One elevation model. One easing family. One spring configuration set. One duration scale. Across web, tablet, mobile, wearable, and control-room video wall. A card hover on the Command Console feels identical to a card hover on the Executive Portfolio. A modal entrance in Permits feels identical to a modal entrance in Incidents. Users build motor memory from consistency.

**Principle 5 — Reveal the Agent**
When AI acts, the user sees motion that communicates state: idle breathing, active listening ripples, thinking rotation, tool execution overlays, confidence tint shifts, streaming dot-trails. The Halo Orb is the anthropomorphic anchor. Its motion is the AI's body language.

**Principle 6 — Invisible Motion is the Best Motion**
The highest compliment to a motion system is that users don't notice it — they just feel that the product is "smooth" and "responsive." Motion should reduce cognitive load, not add spectacle. If a user can describe the animation they just saw, it was probably too much.

**Principle 7 — Respect the Human**
All motion respects `prefers-reduced-motion: reduce`. All motion avoids flash rates > 3 Hz. All motion provides non-motion alternatives for vestibular-sensitive users. All interactive motion responds within 50 ms. Motion never blocks user input.

---

## 2. Motion Design Language

### 2.1 Animation Hierarchy

SafetyOS defines five tiers of animation, ordered by scope and visual weight. Higher tiers are used less frequently and carry more perceptual significance.

| Tier | Name | Scope | Duration Range | Frequency | Examples |
|---|---|---|---|---|---|
| T1 | **Micro** | Single element | 50–160 ms | Constant (per interaction) | Hover tint, focus ring, press scale, checkbox draw |
| T2 | **Component** | Single component | 120–320 ms | Frequent | Dropdown open, tooltip show, chip enter, toggle slide |
| T3 | **Composition** | Component group | 160–480 ms | Moderate | Card grid stagger, table skeleton reveal, form section expand |
| T4 | **Navigation** | Full viewport | 160–320 ms | On route change | Page fade, sheet slide, modal scale, split-view resize |
| T5 | **Cinematic** | Hero surfaces | 320–2400 ms | Rare | Halo Orb ambient, Digital Twin camera fly, Situation Room KPI reveal, onboarding sequence |

**Rule:** Higher-tier animations must never be interrupted by lower-tier animations. If a T4 page transition is running and a T1 hover fires, the hover responds immediately but the page transition completes uninterrupted. If a T1 safety-critical alert fires during any animation, all running animations are immediately resolved to their end state.

### 2.2 Motion Vocabulary

Every animation in SafetyOS is composed from exactly nine primitives. These primitives may be combined (e.g., fade + slide), but no animation may use a motion type not in this vocabulary.

#### Primitive 1: Fade
- **Property:** `opacity`
- **Range:** `0 ↔ 1`
- **Default duration:** 120–200 ms
- **Default easing:** `--ease-standard`
- **Usage:** Universal entry/exit for overlays, tooltips, content swaps, skeleton→content
- **Reduced motion:** Duration clamped to 0–120 ms

#### Primitive 2: Slide
- **Property:** `translateX` or `translateY`
- **Range:** 8–32 px travel (never more than 32 px for UI elements)
- **Default duration:** 200–320 ms
- **Default easing:** `--ease-standard` (enter: `--ease-entrance`; exit: `--ease-exit`)
- **Usage:** Sheets, drawers, notification slide-in, dropdown menus, panel reveals
- **Reduced motion:** Replace with fade; or reduce travel to 0 px (instant position)

#### Primitive 3: Scale
- **Property:** `scale`
- **Range:** `0.96 ↔ 1` (modals), `0.98 ↔ 1` (cards, buttons), `0.9 ↔ 1` (chips, badges)
- **Default duration:** 160–240 ms
- **Default easing:** `--ease-emphasized`
- **Usage:** Modal enter/exit, button press, card hover, chip pop-in, command palette open
- **Reduced motion:** Replace with fade only

#### Primitive 4: Reveal
- **Property:** `clip-path` or `height` (auto)
- **Range:** Rectangular or inset clip expansion
- **Default duration:** 200–320 ms
- **Default easing:** `--ease-standard`
- **Usage:** Command palette results, accordion expand, expandable widgets, progressive disclosure
- **Reduced motion:** Instant expand with 120 ms fade

#### Primitive 5: Morph
- **Property:** `width`, `height`, `border-radius` (interpolated simultaneously)
- **Range:** Component-specific
- **Default duration:** 240–480 ms
- **Default easing:** `--ease-emphasized`
- **Usage:** Panel↔drawer transitions, chip↔card expansions, sidebar collapse/expand, layout shifts
- **Reduced motion:** Instant state swap

#### Primitive 6: Streamline
- **Property:** SVG `stroke-dashoffset` / path drawing
- **Range:** 0% → 100% path length
- **Default duration:** 320–480 ms
- **Default easing:** `--ease-standard`
- **Usage:** Agent reasoning timeline connections, Digital Twin flow lines, chart line draw, progress paths
- **Reduced motion:** Instant full path reveal

#### Primitive 7: Pulse
- **Property:** `scale` (1 → 1.08 → 1) + `opacity` (1 → 0.7 → 1)
- **Cycle duration:** 800–1200 ms per cycle
- **Max cycles:** 2 for non-critical; unlimited for `--intent-catastrophic`
- **Usage:** Live status indicators, alarm attention, incident markers, alert badges
- **Reduced motion:** Static glow (no animation); `--intent-catastrophic` reduces to 1 Hz blink

#### Primitive 8: Shimmer
- **Property:** Background gradient position (linear sweep)
- **Range:** Left-to-right across element width
- **Cycle duration:** 1600 ms
- **Usage:** Skeleton loading states only
- **Reduced motion:** Static gray fill, no shimmer

#### Primitive 9: Ambient
- **Property:** Varies (rotation, scale breathe, gradient shift)
- **Range:** Imperceptible (≤ 3 px travel, ≤ 3% scale, ≤ 5° rotation)
- **Cycle duration:** 2400–6000 ms
- **Usage:** Halo Orb idle, live-status dot, streaming indicator
- **Reduced motion:** Static state; no ambient motion

**Composition rules:**
- Maximum 2 primitives combined per element (e.g., fade + slide, scale + fade)
- Maximum 3 primitives combined per composition (e.g., staggered fade + slide + scale across a card grid)
- Never combine pulse + shimmer on the same element
- Never combine ambient + pulse on the same element (except Halo Orb in `--intent-catastrophic` state)

### 2.3 Interaction Hierarchy

User interactions are ranked by urgency. Motion response time is governed by this ranking:

| Priority | Interaction Class | Response Latency | Examples |
|---|---|---|---|
| P0 | **Safety-critical action** | ≤ 0 ms (instant, no animation) | SOS, Evacuate, Emergency Declare, AI Kill-Switch |
| P1 | **Alarm acknowledgment** | ≤ 50 ms | Alarm ACK, catastrophic alert dismiss, LOTO verify |
| P2 | **Direct manipulation** | ≤ 50 ms | Hover, press, focus, drag, resize, scroll |
| P3 | **Navigation** | ≤ 100 ms to first frame | Route change, tab switch, breadcrumb click |
| P4 | **Content reveal** | ≤ 200 ms to first frame | Dropdown open, tooltip show, accordion expand |
| P5 | **Data transition** | ≤ 300 ms to first frame | Chart animate, counter tick, table sort |
| P6 | **Ambient/decorative** | Best-effort | Halo Orb breathe, skeleton shimmer |

**Rule:** A lower-priority animation must never delay a higher-priority interaction. If a P5 chart animation is running and the user performs a P2 click, the click handler fires immediately and the chart animation either completes in the background or is cancelled.

### 2.4 Visual Rhythm

Visual rhythm in SafetyOS is governed by **stagger timing** — the delay between sequential animations in a group.

| Context | Stagger Delay | Max Elements Staggered | Total Max Duration |
|---|---|---|---|
| Card grid (dashboard) | 40 ms | 12 | 480 ms |
| Table skeleton rows | 30 ms | 12 | 360 ms |
| Command palette results | 20 ms | 8 | 160 ms |
| Notification list items | 30 ms | 5 | 150 ms |
| Chart series (line draw) | 80 ms | 6 | 480 ms |
| Navigation rail items | 20 ms | 10 | 200 ms |
| Form field reveals | 40 ms | 8 | 320 ms |
| KPI counter cascade | 60 ms | 6 | 360 ms |

**Rule:** Total stagger duration (stagger × count) must never exceed 600 ms. If more elements exist than the max stagger count, remaining elements appear instantly with the last staggered element.

**Rule:** Stagger direction follows reading order: top→bottom, left→right (LTR) or right→left (RTL). Never stagger from center-out except on the Halo Orb particle system.

### 2.5 Perceived Performance

Motion is the primary tool for perceived performance. The following techniques are mandatory:

| Technique | Trigger | Implementation |
|---|---|---|
| **Skeleton-first** | Any data fetch > 100 ms | Show content-shaped skeletons with shimmer within 100 ms of request |
| **Optimistic update** | Any user write action with > 90% success rate | Immediately reflect the expected outcome; revert on failure with error toast |
| **Progressive reveal** | Page with > 3 async data sources | Render shell → skeleton regions → staggered content as each source resolves |
| **Streaming UI** | AI responses, search results | Render tokens/results as they arrive; never wait for full payload |
| **Background refresh** | Stale data on focus/visibility change | Silently refetch; cross-fade new data over old (120 ms); show "Updated just now" chip |
| **Instant feedback** | All buttons, toggles, checkboxes | Visual state change within 50 ms of interaction; async confirmation follows |

### 2.6 Spatial Continuity

Users must always understand *where they are* in the spatial model. Motion reinforces this through:

- **Directional consistency:** Drilling down (L1→L2→L3→L4) always moves *inward* — content slides left or scales down. Drilling up always moves *outward* — content slides right or scales up.
- **Shared element transitions:** When navigating from a card to a detail view, the card morphs into the detail header (shared element transition via `layoutId` in Framer Motion). This anchors spatial memory.
- **Breadcrumb animation:** Each breadcrumb segment slides in from right on drill-down, slides out to right on drill-up (120 ms, `--ease-standard`).
- **Modal/sheet origin:** Modals scale from the trigger element's position. Sheets slide from their attached edge. The user always knows *what spawned* the overlay.
- **Split view:** Opening split view morphs the content area — the divider slides in, and the second pane fades in from the split edge (200 ms).

### 2.7 Temporal Continuity

Users must always understand *when they are* relative to data freshness:

- **Live indicators:** A 2-second ambient-pulse dot (8 px, `--intent-success`) on any surface receiving real-time WebSocket data.
- **Stale indicators:** Data older than the configured SLA shows a subtle desaturation (10% opacity overlay) and a "Last updated {time}" chip that fades in (120 ms) below the content.
- **Time-travel scrubber:** In replay modes, all scene elements interpolate smoothly to the scrubbed timestamp. Motion speed matches scrub speed.
- **Counter interpolation:** When a KPI value updates via real-time feed, the number interpolates through intermediate digits (240 ms, `--ease-emphasized`, tabular-nums) rather than jumping.

### 2.8 Motion Consistency

The following consistency rules are absolute:

- **Same component, same animation.** A `<Card>` hover effect is identical everywhere it appears — Command Console, Permit Register, Incident List, or Dashboard.
- **Same action, same feedback.** Every "Save" action produces the same button→spinner→success sequence. Every "Delete" action produces the same confirmation→fade-out sequence.
- **Same elevation change, same shadow transition.** Hover-lifting a card from elevation-2 to elevation-3 always uses the same shadow interpolation (120 ms, `--ease-standard`).
- **Same severity, same urgency motion.** A `--intent-critical` chip entering on the Alarm List animates identically to a `--intent-critical` chip entering on the Risk Heatmap.

### 2.9 Motion Accessibility

Motion accessibility is not optional. It is architecturally enforced:

- **`prefers-reduced-motion: reduce`** — All CSS transitions reduce to ≤120 ms or 0 ms. All Framer Motion `animate` calls read from a `useReducedMotion()` hook that remaps all spring/tween configs to `{ duration: 0.12 }` or `{ duration: 0 }`.
- **`prefers-reduced-motion: no-preference`** — Full motion language applies.
- **User override** — SafetyOS user preferences (`/me` → Accessibility → Reduce Motion) override system preference and persist server-side.
- **Exceptions under reduced motion:**
  - `--intent-catastrophic` alerts retain a 1 Hz blink (not eliminated entirely — safety requires attention direction)
  - Halo Orb retains static gradient (no rotation, no breathe)
  - Live-status dots retain static color (no pulse)
  - Progress indicators (linear, radial) retain determinate animation (functional, not decorative)
  - Hold-to-confirm rings retain fill animation (functional)

### 2.10 Cognitive Load Reduction

Motion reduces cognitive load through:

- **Spatial anchoring:** Shared element transitions prevent the user from losing context during navigation.
- **State persistence:** Exiting and re-entering a page restores scroll position and open/closed states with no animation (instant restore).
- **Batched updates:** Multiple real-time data changes within a 100 ms window are batched into a single visual update to avoid flicker.
- **Change highlighting:** When a value changes in a table or KPI, the cell background briefly flashes `--brand-50` (200 ms fade-in, 600 ms hold, 400 ms fade-out) to draw the eye without disrupting reading flow.
- **Predictive preload:** When the user hovers a navigation item for > 200 ms, the target route begins prefetching. If they click, the transition feels instant.

### 2.11 Progressive Disclosure

Progressive disclosure uses motion to manage complexity:

- **Accordion:** Content height morphs open (280 ms, `--ease-emphasized`) with content fading in (120 ms delay, 160 ms duration). Closing reverses: content fades out (80 ms), then height morphs closed (200 ms).
- **Expandable cards:** Cards expand by morphing height; internal content cross-fades from summary to detail (200 ms).
- **Drill-down transitions:** Clicking a chart element to drill down cross-fades the chart view (160 ms out, 160 ms in) while the filter bar animates new filter chips (scale 0.9→1 + fade, 160 ms).
- **Conditional form fields:** Fields that appear based on a prior selection fade in + height-morph (200 ms combined). Fields that disappear fade out + height-morph (160 ms combined).
- **"Show more" reveals:** Content below the fold slides into view with a 200 ms slide-down + fade, staggered 30 ms per item.

---

## 3. Motion Tokens

All motion values are consumed via CSS custom properties and JavaScript constants exported from `@safetyos/design-tokens`. No hardcoded duration, easing, or animation values are permitted in product code.

### 3.1 Duration Tokens

```css
:root {
  /* Core durations */
  --duration-instant:     0ms;      /* State swaps under reduced motion; safety-critical alerts */
  --duration-micro:       80ms;     /* Press feedback, ripple start */
  --duration-fast:        120ms;    /* Hover, focus, small state changes */
  --duration-moderate:    200ms;    /* Dropdowns, tooltips, small panels, content swaps */
  --duration-steady:      280ms;    /* Sheet partials, accordion, medium panels */
  --duration-slow:        320ms;    /* Modals, sheets, page transitions */
  --duration-deliberate:  480ms;    /* Onboarding reveals, chart line draws, cinematic */
  --duration-cinematic:   640ms;    /* Digital Twin camera moves, hero KPI reveals */
  --duration-epic:        960ms;    /* Situation Room hero sequence (rare) */
  --duration-orbit:       2400ms;   /* Halo Orb ambient cycle */
  --duration-breathe:     4000ms;   /* Halo Orb scale breathe cycle */

  /* Functional durations */
  --duration-skeleton:    1600ms;   /* Skeleton shimmer cycle */
  --duration-counter:     240ms;    /* Number interpolation tick */
  --duration-live-pulse:  2000ms;   /* Live-status dot ambient pulse */
  --duration-hold-confirm: 500ms;  /* Hold-to-confirm ring fill (emergency) */
  --duration-toast-info:  4000ms;   /* Toast auto-dismiss: info */
  --duration-toast-warn:  6000ms;   /* Toast auto-dismiss: warning */
  --duration-toast-undo:  8000ms;   /* Toast auto-dismiss: undo */
  --duration-toast-error: 0ms;      /* Toast auto-dismiss: error (sticky) */
  --duration-success-flash: 800ms;  /* Transient success state on buttons */
  --duration-change-highlight: 1200ms; /* Cell change highlight (200 in + 600 hold + 400 out) */

  /* Stagger delays */
  --stagger-card:         40ms;     /* Card grid stagger */
  --stagger-table-row:    30ms;     /* Table skeleton row stagger */
  --stagger-palette:      20ms;     /* Command palette result stagger */
  --stagger-notification: 30ms;     /* Notification list stagger */
  --stagger-chart-series: 80ms;     /* Chart series draw stagger */
  --stagger-nav-item:     20ms;     /* Navigation rail item stagger */
  --stagger-form-field:   40ms;     /* Form field reveal stagger */
  --stagger-kpi:          60ms;     /* KPI counter cascade stagger */
  --stagger-skeleton:     60ms;     /* Skeleton child stagger */
}
```

### 3.2 Delay Tokens

```css
:root {
  /* Interaction delays */
  --delay-none:           0ms;      /* Immediate response */
  --delay-hover-intent:   150ms;    /* Submenu/nested hover delay (prevents misfire) */
  --delay-tooltip:        400ms;    /* Tooltip show delay */
  --delay-tooltip-shortcut: 800ms;  /* Tooltip with shortcut hint delay */
  --delay-skeleton-show:  100ms;    /* Time before skeleton appears */
  --delay-spinner-show:   300ms;    /* Time before spinner replaces skeleton */
  --delay-message-show:   1000ms;   /* Time before loading message appears */
  --delay-cause-show:     3000ms;   /* Time before loading cause message appears */
  --delay-prefetch:       200ms;    /* Hover-to-prefetch delay */
  --delay-debounce-input: 150ms;    /* Search input debounce */
  --delay-debounce-validation: 400ms; /* Form validation debounce */
  --delay-autosave:       15000ms;  /* Form autosave interval */
  --delay-stale-badge:    0ms;      /* Stale indicator (immediate if past SLA) */
}
```

### 3.3 Easing Tokens

```css
:root {
  /* Cubic-bezier easings */
  --ease-standard:    cubic-bezier(0.2, 0, 0, 1);        /* Default: smooth deceleration */
  --ease-entrance:    cubic-bezier(0, 0, 0, 1);           /* Elements entering the viewport */
  --ease-exit:        cubic-bezier(0.4, 0, 1, 1);         /* Elements leaving the viewport */
  --ease-emphasized:  cubic-bezier(0.2, 0, 0, 1.2);       /* Attention-drawing (slight overshoot) */
  --ease-linear:      linear;                              /* Ambient loops, progress fills */
  --ease-sharp:       cubic-bezier(0.4, 0, 0.2, 1);       /* Snappy micro-interactions */

  /* Named compositions (for documentation — resolved to cubic-bezier in code) */
  /* --ease-spring: Implemented via Framer Motion spring() — see §3.4 */
  /* --ease-orbit: linear — for continuous ambient rotation */
  /* --ease-counter: --ease-emphasized — for number interpolation */
}
```

### 3.4 Spring Presets

Spring presets are defined as Framer Motion `spring` configurations and exported from `@safetyos/design-tokens` as JavaScript constants.

```typescript
// @safetyos/design-tokens/motion/springs.ts

export const SPRING_PRESETS = {
  /** Default interactive spring — buttons, cards, small elements */
  default: {
    type: "spring",
    stiffness: 320,
    damping: 24,
    mass: 1,
    restDelta: 0.001,
  },

  /** Gentle spring — modals, sheets, large surfaces */
  gentle: {
    type: "spring",
    stiffness: 200,
    damping: 28,
    mass: 1,
    restDelta: 0.001,
  },

  /** Snappy spring — tooltips, popovers, small overlays */
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.8,
    restDelta: 0.001,
  },

  /** Bouncy spring — chip pop-in, badge enter, emphasis only */
  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 18,
    mass: 0.8,
    restDelta: 0.001,
  },

  /** Heavy spring — sidebar morph, layout resize, large element transforms */
  heavy: {
    type: "spring",
    stiffness: 260,
    damping: 32,
    mass: 1.4,
    restDelta: 0.001,
  },

  /** Orb spring — Halo Orb state changes */
  orb: {
    type: "spring",
    stiffness: 180,
    damping: 20,
    mass: 1.2,
    restDelta: 0.0005,
  },

  /** Critical spring — instant settle, no overshoot, safety contexts */
  critical: {
    type: "spring",
    stiffness: 600,
    damping: 40,
    mass: 0.6,
    restDelta: 0.01,
  },
} as const;
```

### 3.5 Opacity Transitions

```typescript
export const OPACITY = {
  entry: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
  exit: {
    exit: { opacity: 0 },
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  },
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 0.48 },
    exit: { opacity: 0 },
    transition: { duration: 0.24, ease: [0.2, 0, 0, 1] },
  },
  subtle: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.12, ease: [0.2, 0, 0, 1] },
  },
  skeleton: {
    exit: { opacity: 0 },
    transition: { duration: 0.08, ease: "linear" },
  },
  content: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.12, delay: 0.06, ease: [0.2, 0, 0, 1] },
  },
} as const;
```

### 3.6 Blur Transitions

```typescript
export const BLUR = {
  backdrop: {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(4px)" },
    exit: { backdropFilter: "blur(0px)" },
    transition: { duration: 0.24 },
  },
  glassSurface: {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(12px)" },
    transition: { duration: 0.32 },
  },
  commandPalette: {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(16px)" },
    exit: { backdropFilter: "blur(0px)" },
    transition: { duration: 0.2 },
  },
  /** Reduced-motion: no blur transition — instant */
  reducedMotion: {
    initial: { backdropFilter: "blur(4px)" },
    animate: { backdropFilter: "blur(4px)" },
    exit: { backdropFilter: "blur(0px)" },
    transition: { duration: 0 },
  },
} as const;
```

### 3.7 Scale Transitions

```typescript
export const SCALE = {
  modal: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 },
    enterTransition: { duration: 0.24, ease: [0.2, 0, 0, 1] },
    exitTransition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  card: {
    hover: { scale: 1, y: -2, boxShadow: "var(--shadow-3)" },
    rest: { scale: 1, y: 0, boxShadow: "var(--shadow-2)" },
    transition: { duration: 0.12, ease: [0.2, 0, 0, 1] },
  },
  button: {
    press: { scale: 0.98 },
    rest: { scale: 1 },
    transition: { type: "spring", ...SPRING_PRESETS.snappy },
  },
  chip: {
    enter: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1.2] },
  },
  commandPalette: {
    initial: { scale: 0.98, opacity: 0, y: -16 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.98, opacity: 0, y: -8 },
    enterTransition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
    exitTransition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  popover: {
    initial: { scale: 0.98, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.98, opacity: 0 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
  palettePressEffect: {
    press: { scale: 1.005 },
    rest: { scale: 1 },
  },
} as const;
```

### 3.8 Rotation Tokens

```typescript
export const ROTATION = {
  orbIdle: {
    animate: { rotate: 360 },
    transition: { duration: 2.4, ease: "linear", repeat: Infinity },
  },
  orbThinking: {
    animate: { rotate: 360 },
    transition: { duration: 1.6, ease: "linear", repeat: Infinity },
  },
  spinnerRing: {
    animate: { rotate: 360 },
    transition: { duration: 1.2, ease: "linear", repeat: Infinity },
  },
  refreshIcon: {
    animate: { rotate: 360 },
    transition: { duration: 0.8, ease: [0.2, 0, 0, 1] },
  },
  chevronExpand: {
    open: { rotate: 180 },
    closed: { rotate: 0 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  sortIndicator: {
    asc: { rotate: 0 },
    desc: { rotate: 180 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
} as const;
```

### 3.9 Hover Tokens

```css
:root {
  /* Hover surface changes */
  --hover-tint-light: +4%;       /* Luminance increase on light surfaces */
  --hover-tint-dark: -4%;        /* Luminance decrease on dark surfaces */
  --hover-elevation-lift: -2px;  /* translateY on hover for cards */
  --hover-shadow-from: var(--shadow-2);
  --hover-shadow-to: var(--shadow-3);
  --hover-duration: var(--duration-fast);  /* 120ms */
  --hover-easing: var(--ease-standard);

  /* Hover magnetic (Situation Room only) */
  --hover-magnetic-radius: 24px;
  --hover-magnetic-pull: 6px;
}
```

### 3.10 Focus Tokens

```css
:root {
  /* Focus ring */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--brand-500);
  --focus-ring-shadow: var(--shadow-focus);     /* 0 0 0 3px rgba(37,99,235,.35) */
  --focus-ring-danger: var(--shadow-focus-danger); /* 0 0 0 3px rgba(239,68,68,.35) */
  --focus-duration: 0ms;  /* Focus ring appears instantly — never animated */
  --focus-fade-out: var(--duration-fast);  /* 120ms fade when focus leaves */
}
```

### 3.11 Exit Tokens

```typescript
export const EXIT = {
  /** Default exit — fade out */
  fade: {
    exit: { opacity: 0 },
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  },
  /** Slide exit — slide + fade */
  slideRight: {
    exit: { x: 32, opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
  slideLeft: {
    exit: { x: -32, opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
  slideDown: {
    exit: { y: 16, opacity: 0 },
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  slideUp: {
    exit: { y: -16, opacity: 0 },
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  /** Scale exit — shrink + fade (modals, overlays) */
  scale: {
    exit: { scale: 0.96, opacity: 0 },
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  /** Collapse exit — height to 0 */
  collapse: {
    exit: { height: 0, opacity: 0, overflow: "hidden" },
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
  /** Toast exit — slide right + fade */
  toast: {
    exit: { x: 120, opacity: 0 },
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] },
  },
  /** Notification exit — slide up + fade */
  notification: {
    exit: { y: -8, opacity: 0 },
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  },
  /** Destructive — item being deleted fades to red tint then collapses */
  destructive: {
    exit: { backgroundColor: "var(--intent-critical-100)", opacity: 0, height: 0 },
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  },
} as const;
```

### 3.12 Entry Tokens

```typescript
export const ENTRY = {
  /** Default entry — fade in */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
  /** Slide from right */
  slideFromRight: {
    initial: { x: 32, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.32, ease: [0.2, 0, 0, 1] },
  },
  /** Slide from left */
  slideFromLeft: {
    initial: { x: -32, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.32, ease: [0.2, 0, 0, 1] },
  },
  /** Slide from bottom */
  slideFromBottom: {
    initial: { y: 16, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  /** Slide from top */
  slideFromTop: {
    initial: { y: -16, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  /** Scale in — modals, command palette */
  scaleIn: {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.24, ease: [0.2, 0, 0, 1] },
  },
  /** Chip pop — badges, tags, filter chips */
  chipPop: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.16, ease: [0.2, 0, 0, 1.2] },
  },
  /** Card enter — staggered card in grids */
  card: {
    initial: { y: 4, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.2, ease: [0.2, 0, 0, 1] },
  },
  /** Toast enter */
  toast: {
    initial: { x: 120, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 30 },
  },
  /** Expand — accordion, conditional fields */
  expand: {
    initial: { height: 0, opacity: 0, overflow: "hidden" },
    animate: { height: "auto", opacity: 1, overflow: "visible" },
    transition: { duration: 0.28, ease: [0.2, 0, 0, 1] },
  },
  /** Critical alert — instant, no animation */
  critical: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    transition: { duration: 0 },
  },
} as const;
```

### 3.13 Shared Motion Variables

```typescript
// @safetyos/design-tokens/motion/index.ts

export { SPRING_PRESETS } from "./springs";
export { OPACITY } from "./opacity";
export { BLUR } from "./blur";
export { SCALE } from "./scale";
export { ROTATION } from "./rotation";
export { EXIT } from "./exit";
export { ENTRY } from "./entry";

/** Master motion config consumed by MotionProvider */
export const MOTION_CONFIG = {
  /** Global reduced-motion flag — set by MotionProvider based on media query + user pref */
  reducedMotion: false,

  /** Maximum animation duration cap (ms) */
  maxDuration: 480,

  /** Maximum animation duration cap under reduced motion (ms) */
  maxDurationReduced: 120,

  /** Maximum stagger total (ms) */
  maxStaggerTotal: 600,

  /** Frame rate target */
  targetFPS: 60,

  /** Force-cancel threshold: if an animation exceeds this, it resolves to end state */
  forceCancelMs: 1000,

  /** Safety-critical override: all animations resolve instantly when active */
  safetyCriticalOverride: false,
} as const;
```

---

## 4. Animation Categories

### 4.1 Page Transitions

| Behavior | Entry | Exit | Duration | Easing | Reduced Motion |
|---|---|---|---|---|---|
| **Same-module navigation** | Cross-fade (opacity) | Cross-fade (opacity) | 160 ms | `--ease-standard` | Instant swap |
| **Cross-module navigation** | Fade in (opacity) | Fade out (opacity) | 200 ms (80 ms out, 120 ms in) | `--ease-exit` / `--ease-entrance` | Instant swap |
| **Drill-down (L1→L2→L3→L4)** | Slide from right + fade | Slide to left + fade | 200 ms | `--ease-standard` | Instant swap |
| **Drill-up (L4→L3→L2→L1)** | Slide from left + fade | Slide to right + fade | 200 ms | `--ease-standard` | Instant swap |
| **Modal route** | Scale 0.96→1 + fade + backdrop | Scale 1→0.96 + fade + backdrop | 240 ms entry / 160 ms exit | `--ease-entrance` / `--ease-exit` | Fade only, 120 ms |
| **Tab switch (same page)** | Cross-fade content region | Cross-fade content region | 120 ms | `--ease-standard` | Instant swap |
| **Auth flow** | Fade + scale 0.98→1 | Fade | 160 ms | `--ease-standard` | Instant swap |

**Implementation:** Framer Motion `<AnimatePresence mode="wait">` wrapping the route `<Outlet>`. Route key derived from pathname. Linear progress bar (`4 px`, `--brand-500`) at viewport top during route transition.

### 4.2 Layout Transitions

| Behavior | Animation | Duration | Easing | Reduced Motion |
|---|---|---|---|---|
| **Sidebar collapse (240→64 px)** | Width morph + label fade | 200 ms width, 120 ms fade | `--ease-standard` | Instant width swap |
| **Sidebar expand (64→240 px)** | Width morph + label fade-in (after width settles) | 200 ms width, 120 ms fade (40 ms delay) | `--ease-standard` | Instant width swap |
| **Right panel open** | Slide from right edge + content width morph | 280 ms | `--ease-standard` | Instant appear |
| **Right panel close** | Slide to right edge + content width morph | 200 ms | `--ease-exit` | Instant disappear |
| **Split view open** | Divider slide in + secondary pane fade | 240 ms | `--ease-standard` | Instant appear |
| **Split view close** | Divider slide out + secondary pane fade | 200 ms | `--ease-exit` | Instant disappear |
| **Content reflow (filter rail toggle)** | Width morph | 200 ms | `--ease-standard` | Instant |

### 4.3 Card Transitions

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Card enter (page load)** | `translateY(4px)` → 0 + fade | 200 ms, stagger 40 ms | `--ease-entrance` |
| **Card hover** | Elevation 2→3, `translateY(-2px)` | 120 ms | `--ease-standard` |
| **Card press** | `scale(0.98)`, darker tint | 80 ms in, spring back | `SPRING_PRESETS.snappy` |
| **Card expand (inline)** | Height morph + content cross-fade | 320 ms | `--ease-emphasized` |
| **Card collapse** | Content fade → height morph | 80 ms fade + 200 ms morph | `--ease-exit` |
| **Card remove (deleted)** | Fade to `--intent-critical-100` → height collapse | 320 ms | `--ease-exit` |
| **Card reorder (drag)** | Spring position + scale 1.02 while dragging | Spring `default` | `SPRING_PRESETS.default` |
| **Card skeleton→content** | Skeleton fades (80 ms), content fades in (120 ms) | Stagger 60 ms per card | `--ease-standard` |

### 4.4 Panel Transitions

| Panel Type | Entry | Exit | Duration |
|---|---|---|---|
| **Right context panel** | `translateX(32px)` → 0 + fade | `translateX(32px)` + fade | 280 ms / 200 ms |
| **Filter rail** | Width morph 0→280 + content fade | Width morph 280→0 + content fade | 200 ms |
| **AI reasoning panel** | Slide from right + fade | Slide right + fade | 320 ms / 200 ms |
| **Evidence panel** | Slide from right + fade | Slide right + fade | 280 ms / 200 ms |

### 4.5 Sidebar

| State | Animation | Duration | Easing |
|---|---|---|---|
| **Collapsed → Expanded** | Width 64→240 px morph; labels fade in at 60% of morph progress | 200 ms | `--ease-standard` |
| **Expanded → Collapsed** | Labels fade out (80 ms); width 240→64 px morph | 200 ms total | `--ease-standard` |
| **Active item change** | 3 px accent bar slides vertically; tinted bg cross-fades | 120 ms | `--ease-standard` |
| **Hover item** | Background tint `--gray-50` | 120 ms | `--ease-standard` |
| **Section expand** | Height morph + items stagger fade (20 ms) | 200 ms | `--ease-standard` |
| **Section collapse** | Items fade (80 ms) + height morph | 160 ms | `--ease-exit` |
| **Mobile drawer open** | Slide from left edge + backdrop | 280 ms | `--ease-entrance` |
| **Mobile drawer close** | Slide to left edge + backdrop | 200 ms | `--ease-exit` |

### 4.6 Topbar

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Scroll shadow appear** | `--shadow-2` + hairline border fade in | 120 ms | `--ease-standard` |
| **Scope selector change** | Chip chain cross-fade; content region cross-fade | 160 ms | `--ease-standard` |
| **Breadcrumb drill-down** | New segment slides from right + fade | 120 ms | `--ease-entrance` |
| **Breadcrumb drill-up** | Last segment slides out right + fade | 120 ms | `--ease-exit` |
| **Notification badge update** | Scale 0.9→1 + value swap | 160 ms | `--ease-emphasized` |
| **Status pill change** | Cross-fade text + intent color transition | 200 ms | `--ease-standard` |

**Rule:** The topbar never hides on scroll. It is always visible for safety-critical context.

### 4.7 Dialogs

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Modal open** | Backdrop fade (0→48% opacity) + dialog scale 0.96→1 + fade | 240 ms | `--ease-entrance` |
| **Modal close** | Dialog scale 1→0.96 + fade → backdrop fade | 160 ms | `--ease-exit` |
| **Confirmation dialog open** | Same as modal but with intent-colored icon pulse (1 cycle) | 240 ms | `--ease-entrance` |
| **Destructive confirmation** | Red-tinted backdrop + dialog | 240 ms | `--ease-entrance` |
| **Hold-to-confirm (emergency)** | Radial progress ring fills clockwise over 500 ms; release resets; completion triggers action | 500 ms (linear fill) | `--ease-linear` |

**Rule:** No modal-in-modal. If a second surface is needed inside a modal, use a sheet-within-modal or an inline stepper.

### 4.8 Drawers / Sheets

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Right sheet open** | `translateX(32px)` → 0 + fade + backdrop | 320 ms | `SPRING_PRESETS.gentle` |
| **Right sheet close** | `translateX(32px)` + fade + backdrop | 200 ms | `--ease-exit` |
| **Bottom sheet open (mobile)** | `translateY(100%)` → 0 + backdrop | 320 ms | `SPRING_PRESETS.gentle` |
| **Bottom sheet close (mobile)** | `translateY(100%)` + backdrop | 200 ms | `--ease-exit` |
| **Sheet replace (lateral)** | Current sheet slides further right + fade; new sheet slides in from right | 280 ms cross-transition | `--ease-standard` |
| **Sheet snap points (mobile)** | Spring to nearest snap point | Spring `gentle` | `SPRING_PRESETS.gentle` |
| **Sheet drag dismiss** | Velocity-based dismiss threshold (> 500 px/s); spring to closed | Spring `default` | `SPRING_PRESETS.default` |

### 4.9 Tabs

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Tab switch** | Active indicator slides horizontally (matches tab position) | 200 ms | `SPRING_PRESETS.snappy` |
| **Tab content change** | Cross-fade content region | 120 ms | `--ease-standard` |
| **Tab hover** | Text color transition | 120 ms | `--ease-standard` |
| **Tab overflow scroll** | Fade mask on overflow edges (left/right gradient masks) | Persistent (CSS) | N/A |

**Implementation:** Framer Motion `layoutId` on the active indicator underline enables smooth sliding between tab positions regardless of width.

### 4.10 Accordion

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Expand** | Height morph (0 → auto) + content fade in (120 ms delay) + chevron rotate 0→180° | 280 ms | `--ease-emphasized` |
| **Collapse** | Content fade out (80 ms) + height morph (auto → 0) + chevron rotate 180→0° | 200 ms | `--ease-exit` |
| **Multiple open** | Independent; expanding one does not collapse others (unless `single` mode) | Per-item | Per-item |
| **Single mode** | Collapsing item starts simultaneously with expanding item | 280 ms | `--ease-emphasized` |

### 4.11 Timeline

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Timeline entry** | Items stagger from top, fade + slideY(8px) | 200 ms, stagger 40 ms | `--ease-entrance` |
| **New event append (live)** | New item slides in from top + fade; existing items shift down | 200 ms | `SPRING_PRESETS.default` |
| **Event expand** | Detail region height-morphs open + fade | 280 ms | `--ease-emphasized` |
| **Scrubber drag** | All timeline markers cross-fade/reposition in real time | 0 ms (direct manipulation) | `--ease-linear` |
| **Playback (auto-advance)** | Cursor sweeps along timeline at playback speed; events highlight as cursor passes | Continuous | `--ease-linear` |

### 4.12 Forms

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Field focus** | Focus ring appears instantly (0 ms); border color transitions | 0 ms ring / 120 ms border | N/A / `--ease-standard` |
| **Inline validation error** | Error text slides down + fades in; border turns critical | 200 ms | `--ease-entrance` |
| **Error → valid** | Error text slides up + fades out; border returns to default | 160 ms | `--ease-exit` |
| **Conditional field show** | Height morph + fade in | 200 ms | `--ease-standard` |
| **Conditional field hide** | Fade out + height morph | 160 ms | `--ease-exit` |
| **Multi-step: step forward** | Current step slides left + fades; new step slides from right + fades in | 240 ms | `--ease-standard` |
| **Multi-step: step back** | Current step slides right + fades; previous step slides from left + fades in | 240 ms | `--ease-standard` |
| **Stepper progress** | Completed step check-draw (160 ms SVG path) + fill transition | 200 ms | `--ease-standard` |
| **Submit → loading** | Button text fades out; spinner fades in; button width may morph | 120 ms | `--ease-standard` |
| **Submit → success** | Spinner → check icon + green tint (800 ms hold) → return or navigate | 200 ms transition | `--ease-standard` |
| **Submit → error** | Spinner → ✕ icon + red tint (800 ms hold) → return to default; focus first error | 200 ms transition | `--ease-standard` |
| **Autosave indicator** | Subtle "Saving…" chip fades in → "Saved" + check → fades out | 120 ms in, 200 ms hold, 400 ms out | `--ease-standard` |

### 4.13 Buttons

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Hover** | Background color shift (+4% luminance light / -4% dark) | 120 ms | `--ease-standard` |
| **Press** | `scale(0.98)` + darker background | 80 ms in, spring back | `SPRING_PRESETS.snappy` |
| **Focus** | Focus ring instant appear | 0 ms | N/A |
| **Loading** | Leading icon → spinner; `aria-busy=true`; pointer-events disabled | 120 ms swap | `--ease-standard` |
| **Success (transient)** | Icon → check; bg → `--intent-success-500`; hold 800 ms; revert | 200 ms in, 200 ms out | `--ease-standard` |
| **Error (transient)** | Icon → ✕; bg → `--intent-critical-500`; hold 800 ms; revert | 200 ms in, 200 ms out | `--ease-standard` |
| **Disabled** | 40% opacity; no hover/press motion | Instant | N/A |
| **Split button caret** | Caret rotates 180° on open | 200 ms | `--ease-standard` |
| **Segmented group** | Active indicator slides horizontally (layoutId) | 200 ms | `SPRING_PRESETS.snappy` |
| **AI/Halo button** | Subtle gradient shimmer on hover (600 ms cycle, 1 cycle) | 600 ms | `--ease-linear` |

### 4.14 Dropdowns

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Open** | Scale 0.98→1 + fade; appears 4 px below trigger | 160 ms | `--ease-entrance` |
| **Close** | Fade out | 120 ms | `--ease-exit` |
| **Item hover** | Background tint | 80 ms | `--ease-standard` |
| **Item select** | Brief flash of `--brand-50` → close | 80 ms flash + 120 ms close | `--ease-standard` |
| **Search filter (combobox)** | Results cross-fade on each keystroke (debounced 150 ms) | 120 ms | `--ease-standard` |
| **Nested submenu** | Slide from parent edge + fade; 150 ms hover delay before open | 160 ms | `--ease-entrance` |
| **Loading items** | 3 skeleton items with shimmer | 1600 ms shimmer cycle | `--ease-linear` |
| **Empty state** | Cross-fade to "No matches" message | 120 ms | `--ease-standard` |

### 4.15 Tooltips

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Show** | Fade in + translate 4 px toward trigger | 160 ms, after 400 ms delay | `--ease-entrance` |
| **Hide** | Fade out | 80 ms | `--ease-exit` |
| **Reposition (viewport edge)** | Instant flip (no animation — positional, not decorative) | 0 ms | N/A |
| **Shortcut tooltip** | Same as show but 800 ms delay | 160 ms | `--ease-entrance` |
| **Interactive tooltip** | Same show; stays open while pointer is within tooltip bounds | 160 ms | `--ease-entrance` |

### 4.16 Search

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Search input focus** | Width morph 320→640 px (desktop); leading icon becomes active color | 200 ms | `--ease-standard` |
| **Search blur (empty)** | Width morph 640→320 px | 200 ms | `--ease-standard` |
| **Results appear** | Staggered fade + slide, 20 ms per group | 160 ms per item | `--ease-entrance` |
| **Result filter change** | Cross-fade result set | 120 ms | `--ease-standard` |
| **Loading (> 300 ms)** | Search icon → spinner | 120 ms swap | `--ease-standard` |
| **No results** | Cross-fade to empty state message | 120 ms | `--ease-standard` |

### 4.17 Tables

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Initial load** | 12 skeleton rows, stagger 30 ms, shimmer | Row stagger 30 ms | `--ease-standard` |
| **Skeleton → content** | Skeleton fade (80 ms) → content fade (120 ms), stagger 60 ms | Per-row | `--ease-standard` |
| **Row hover** | Background `--gray-50` (light) / `--gray-100` (dark) | 80 ms | `--ease-standard` |
| **Row select** | 3 px left accent bar + tinted bg fade in | 120 ms | `--ease-standard` |
| **Sort change** | Sort indicator rotates; rows cross-fade to new order | 200 ms | `--ease-standard` |
| **Filter change** | Table content cross-fades to filtered set | 160 ms | `--ease-standard` |
| **Column resize** | Real-time width morph (direct manipulation) | 0 ms | N/A |
| **Column reorder** | Dragged column shows ghost; drop target highlighted; spring settle | Spring `default` | `SPRING_PRESETS.default` |
| **Inline edit activate** | Cell border appears + focus ring | 80 ms | `--ease-standard` |
| **Bulk action bar** | Slides up from bottom-center + fade | 200 ms | `--ease-entrance` |
| **Bulk action bar dismiss** | Slides down + fade | 160 ms | `--ease-exit` |
| **Row delete** | Row fades to `--intent-critical-100` → height collapses | 320 ms | `--ease-exit` |
| **Real-time cell update** | Cell bg flashes `--brand-50` (200 ms in, 600 ms hold, 400 ms out) | 1200 ms total | `--ease-standard` |
| **Pagination** | Content cross-fade | 120 ms | `--ease-standard` |

### 4.18 Charts

Detailed in §10 (Data Visualization Motion). Summary:

| Behavior | Duration | Easing |
|---|---|---|
| **Initial mount** | Axes fade 120 ms → series draw 320 ms (stagger 80 ms per series) | `--ease-standard` |
| **Data update** | Value axis interpolation only, 240 ms | `--ease-standard` |
| **Drill-down** | Cross-fade views, 160 ms | `--ease-standard` |

### 4.19 Maps

Detailed in §9.4 (Digital Twin) and §10.11 (Geospatial). Summary:

| Behavior | Duration | Easing |
|---|---|---|
| **Cluster expand** | Animated spread 240 ms | `SPRING_PRESETS.default` |
| **Fly-to** | Camera eased move 480–640 ms | `--ease-emphasized` |
| **Layer toggle** | Fade 200 ms | `--ease-standard` |
| **Pan/zoom** | Direct manipulation (inertial; snap under reduced motion) | 0 ms + inertia | N/A |

### 4.20 Notifications

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Notification sheet open** | Slide from right + fade | 280 ms | `SPRING_PRESETS.gentle` |
| **Notification sheet close** | Slide right + fade | 200 ms | `--ease-exit` |
| **New notification arrival** | Slide down + fade in; badge scale-pulse | 200 ms | `--ease-entrance` |
| **Notification dismiss** | Slide right + fade | 160 ms | `--ease-exit` |
| **Mark all read** | All items cross-fade to read state | 200 ms | `--ease-standard` |
| **Notification badge count** | Cross-fade number + subtle scale (0.95→1) | 160 ms | `--ease-emphasized` |
| **Critical alert interstitial** | Instant full-viewport appear; backdrop pulses red; siren icon animates | 0 ms appear; 1200 ms pulse cycle | N/A / `--ease-linear` |
| **Alert ACK (hold-to-confirm)** | Radial ring fills (500 ms, linear); dismiss on complete | 500 ms | `--ease-linear` |

### 4.21 Toasts

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Enter (desktop)** | Slide from right (120 px) + spring settle (bottom-right) | Spring `snappy` | `SPRING_PRESETS.snappy` |
| **Enter (mobile)** | Slide from top + spring settle (top-center) | Spring `snappy` | `SPRING_PRESETS.snappy` |
| **Auto-dismiss** | Fade out + slide right | 160 ms | `--ease-exit` |
| **Manual dismiss** | Fade out + slide right | 120 ms | `--ease-exit` |
| **Stack push** | Existing toasts spring-translate down to accommodate new | Spring `default` | `SPRING_PRESETS.default` |
| **Loading → success** | Spinner cross-fades to check icon; bg tint green | 200 ms | `--ease-standard` |
| **Loading → error** | Spinner cross-fades to ✕ icon; bg tint red | 200 ms | `--ease-standard` |
| **Progress (undo timer)** | Linear progress bar fills over auto-dismiss duration | 8000 ms (undo) | `--ease-linear` |
| **Max stack (> 3)** | Oldest toast fade out + slide right; replaced by new | 160 ms | `--ease-exit` |

### 4.22 Context Menus

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Open (right-click)** | Scale 0.98→1 + fade, origin at cursor position | 120 ms | `--ease-entrance` |
| **Open (kebab click)** | Scale 0.98→1 + fade, origin at trigger | 160 ms | `--ease-entrance` |
| **Close** | Fade out | 80 ms | `--ease-exit` |
| **Item hover** | Background tint | 60 ms | `--ease-standard` |
| **Nested submenu** | Slide from parent edge, 150 ms hover intent delay | 160 ms | `--ease-entrance` |

### 4.23 Command Palette

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Open (⌘K)** | Backdrop blur + dim; palette scale 0.98→1 + fade from top-16 px | 200 ms | `--ease-entrance` |
| **Close (Esc)** | Palette fade + scale 1→0.98; backdrop fade | 160 ms | `--ease-exit` |
| **Result list update** | Cross-fade with 20 ms stagger per group | 120 ms per group | `--ease-standard` |
| **Selected row** | `--brand-50` tint + 3 px left accent + subtle `scale(1.005)` | 80 ms | `--ease-standard` |
| **Row navigation (↑↓)** | Instant highlight move (no animation — speed is paramount) | 0 ms | N/A |
| **Command execute** | Palette fades out 160 ms; success toast confirms | 160 ms | `--ease-exit` |
| **AI inline response** | Streaming text reveal; reasoning steps stagger in | Per-token / 40 ms stagger | `--ease-standard` |
| **Sub-palette (Tab)** | Cross-fade result set to sub-context | 120 ms | `--ease-standard` |

---

## 5. Navigation Motion

### 5.1 Page Entry

| Context | Entry Animation | Duration | Trigger |
|---|---|---|---|
| **First load (SSR)** | No entry animation — content renders server-side; hydration is invisible | 0 ms | Initial page load |
| **Client navigation (same module)** | Content cross-fade | 160 ms | Route change within module |
| **Client navigation (cross-module)** | Content fade-out (80 ms) → fade-in (120 ms) | 200 ms total | Route change across modules |
| **Drill-down entry** | Content slides from right (16 px) + fades in | 200 ms | L1→L2, L2→L3, L3→L4 |
| **Return from drill-down** | Content slides from left (16 px) + fades in | 200 ms | L4→L3, L3→L2, L2→L1 |
| **Modal route entry** | Full modal transition (§4.7) | 240 ms | Detail routes opening as overlays |
| **Auth → Authenticated** | Full cross-fade to shell + staggered content | 320 ms total | Post-login redirect |
| **Deep link (direct URL)** | Same as first load — no entry animation | 0 ms | Direct URL navigation |
| **History restoration** | Instant render at cached scroll position | 0 ms | Browser back/forward |

### 5.2 Page Exit

| Context | Exit Animation | Duration |
|---|---|---|
| **Navigate away (same module)** | Fade out | 80 ms |
| **Navigate away (cross-module)** | Fade out | 80 ms |
| **Drill-down exit** | Slide left + fade out | 120 ms |
| **Drill-up exit** | Slide right + fade out | 120 ms |
| **Modal route close** | Modal exit transition (§4.7) | 160 ms |
| **Sign out** | Full page fade to white → redirect to auth | 200 ms |

### 5.3 Shared Element Transitions

Shared element transitions use Framer Motion `layoutId` to morph an element from its position in the source view to its position in the target view.

| Transition | Source Element | Target Element | Properties Interpolated |
|---|---|---|---|
| **Card → Detail page** | KPI/Incident/Permit card | Detail page header | Position, size, border-radius, background |
| **Table row → Detail sheet** | Table row accent bar | Sheet header bar | Position, width, height |
| **Map marker → Detail card** | Map pin | Floating detail card | Position, size |
| **Breadcrumb → Page title** | Breadcrumb last segment | Page title | Position, font-size |
| **Alarm chip → Alarm detail** | Alarm chip in console feed | Alarm detail header | Position, size, color |

**Duration:** 240 ms using `SPRING_PRESETS.default`
**Reduced motion:** Instant swap (no interpolation)
**Rule:** Shared element transitions are used only for primary navigation actions (clicking a card to open its detail), never for secondary or passive actions.

### 5.4 Route Transitions

Route transitions are orchestrated by the `<PageTransition>` wrapper component:

```
1. User clicks navigation target
2. Top progress bar begins (indeterminate, --brand-500, 4px)
3. Data prefetch begins
4. Current page fades out (80ms)
5. If data resolves < 200ms: new page fades in immediately
6. If data resolves > 200ms: skeleton fades in (120ms), then content replaces skeleton
7. Top progress bar completes and fades (120ms)
```

### 5.5 Nested Layouts

SafetyOS uses nested layouts (shell → module layout → page). Each nesting level animates independently:

- **Shell (topbar + sidebar):** Never animates on route change — persistent
- **Module layout (filter rail, KPI strip):** Cross-fades only when module changes (160 ms)
- **Page content:** Animates per §5.1 and §5.2
- **Right panel:** Animates independently per §4.4

**Rule:** Nested animations never compound. If the module layout is cross-fading and the page content is fading in, they run concurrently, not sequentially. Total perceived transition time must not exceed 320 ms.

### 5.6 Modal Navigation

Modal routes (e.g., `/permits/:id` opening as a sheet over `/permits`) use the following pattern:

1. Background page remains visible but dims (backdrop 48% opacity, 4 px blur)
2. Modal/sheet enters per §4.7/§4.8
3. URL updates to the modal route
4. Closing the modal returns the URL and dismisses the overlay
5. The background page never unmounts — scroll position and state are preserved

### 5.7 Split View

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Open split** | Content width morphs from 100% to ~50%; divider slides in; secondary pane fades from split edge | 240 ms | `--ease-standard` |
| **Close split** | Secondary pane fades; divider slides out; content morphs to 100% | 200 ms | `--ease-exit` |
| **Resize (drag divider)** | Direct manipulation; no animation — real-time width changes | 0 ms | N/A |
| **Swap panes** | Cross-fade content in both panes | 160 ms | `--ease-standard` |
| **Sync scope** | Both panes cross-fade to new scope simultaneously | 200 ms | `--ease-standard` |

### 5.8 Back Navigation

- **Browser back:** Instantly restores previous page at cached scroll position. No exit animation on the current page; no entry animation on the restored page.
- **In-app back (breadcrumb click):** Standard drill-up animation (slide from left, §5.1).
- **Modal back (Esc or close):** Modal exit animation (§4.7/§4.8); background page already visible.
- **Form back (unsaved changes):** Confirmation dialog appears before any navigation; no exit animation until user confirms.

### 5.9 History Restoration

When a user navigates back (browser back, `⌘[`), the target page restores:
- Scroll position (instant, no animation)
- Open/closed accordion states (instant)
- Selected tab (instant)
- Filter state (instant)
- Table sort/column state (instant)

No animation is applied to restored state. The page appears exactly as the user left it.

---

## 6. Micro-Interactions

### 6.1 Buttons

| State | Visual Change | Timing | Notes |
|---|---|---|---|
| **Rest → Hover** | Background lightens/darkens 4% | 120 ms, `--ease-standard` | Cursor change is instant |
| **Hover → Rest** | Background returns | 120 ms, `--ease-standard` | |
| **Hover → Press** | `scale(0.98)` + deeper tint | 80 ms in | Spring back on release |
| **Press → Release** | Spring back to `scale(1)` | `SPRING_PRESETS.snappy` | ~150 ms settle |
| **Rest → Focus** | Focus ring appears instantly; no scale change | 0 ms | `:focus-visible` only |
| **Focus → Blur** | Focus ring fades | 120 ms | |
| **Any → Loading** | Icon → spinner swap; text unchanged; `aria-busy` | 120 ms cross-fade | No width change if possible |
| **Loading → Success** | Spinner → ✓; bg → green; hold 800 ms; revert | 200 ms in + 800 ms hold + 200 ms out | Optional navigate on complete |
| **Loading → Error** | Spinner → ✕; bg → red; hold 800 ms; revert | 200 ms in + 800 ms hold + 200 ms out | Focus error source |
| **Any → Disabled** | 40% opacity; no hover/press | Instant | `cursor: not-allowed` |
| **Destructive hover** | `--intent-critical-600` bg | 120 ms | |
| **AI/Halo hover** | Gradient shimmer (1 cycle, 600 ms) | 600 ms | `--ease-linear` |

**Ripple (mobile/PWA only):**
- Touch-initiated radial fill from touch point
- Color: white at 20% opacity
- Duration: 400 ms expand + 200 ms fade
- Never used on desktop

### 6.2 Card Lift

| State | Visual Change | Timing |
|---|---|---|
| **Rest** | `--shadow-2`, `translateY(0)` | — |
| **Hover** | `--shadow-3`, `translateY(-2px)` | 120 ms, `--ease-standard` |
| **Press** | `--shadow-2`, `translateY(0)`, `scale(0.99)` | 80 ms |
| **Release** | Spring back to hover state | `SPRING_PRESETS.snappy` |
| **Leave** | Return to rest | 120 ms, `--ease-standard` |

Cards with `variant="status"` (intent-framed) lift with the intent accent bar scaling from 3 px to 4 px on hover.

### 6.3 Selection

| Element | Selected State | Animation | Duration |
|---|---|---|---|
| **Table row** | 3 px left accent `--brand-500` + tinted bg | Accent bar slides in from left; bg fades | 120 ms |
| **Card** | Accent border or check overlay | Border transition | 120 ms |
| **Checkbox** | Check-draw SVG path animation | 160 ms path draw | `--ease-standard` |
| **List item** | Tinted bg + left accent | Fade + accent slide | 120 ms |
| **Map marker** | Scale 1→1.3 + glow ring | 200 ms spring | `SPRING_PRESETS.default` |
| **Twin object** | Halo glow outline + detail card | 200 ms | `--ease-standard` |

### 6.4 Checkbox

| State | Animation | Duration |
|---|---|---|
| **Unchecked → Checked** | Check SVG path draws from bottom-left to top-right; fill transitions to `--brand-500` | 160 ms |
| **Checked → Unchecked** | Check path fades (80 ms); fill transitions to transparent | 120 ms |
| **Indeterminate** | Dash draws horizontally | 120 ms |
| **Focus** | Focus ring instant | 0 ms |
| **Disabled** | 40% opacity | Instant |

### 6.5 Switch / Toggle

| State | Animation | Duration | Easing |
|---|---|---|---|
| **Off → On** | Knob slides right (16 px); track color transitions to `--brand-500` | 200 ms | `SPRING_PRESETS.snappy` |
| **On → Off** | Knob slides left; track color transitions to `--gray-300` | 200 ms | `SPRING_PRESETS.snappy` |
| **Critical toggle (LOTO, Evac)** | Same motion but with haptic feedback (mobile); ON/OFF labels visible | 200 ms | `SPRING_PRESETS.snappy` |
| **Focus** | Focus ring on track | 0 ms | N/A |

### 6.6 Slider

| Behavior | Animation | Duration |
|---|---|---|
| **Thumb drag** | Direct manipulation; value label follows thumb | 0 ms |
| **Thumb release** | Value commits; no additional animation | 0 ms |
| **Programmatic value set** | Thumb slides to new position | 200 ms, `--ease-standard` |
| **Range selection** | Active track fill follows thumb positions | 0 ms (real-time) |
| **Tick snap** | Thumb springs to nearest tick | `SPRING_PRESETS.snappy` |

### 6.7 Drag

| Behavior | Animation | Duration |
|---|---|---|
| **Drag start** | Element scales to 1.02; shadow deepens to `--shadow-4`; cursor: grabbing | 80 ms |
| **During drag** | Element follows pointer with spring lag (2-3 frame lag for physicality) | Real-time + spring |
| **Drop zone highlight** | Target zone tints `--brand-50` + dashed border transitions to `--brand-500` | 120 ms |
| **Drop (valid)** | Element springs to drop position; shadow returns to `--shadow-2` | `SPRING_PRESETS.default` |
| **Drop (invalid)** | Element springs back to origin | `SPRING_PRESETS.default` |
| **Cancel (Esc)** | Element springs back to origin | `SPRING_PRESETS.default` |

### 6.8 Resize

| Behavior | Animation | Duration |
|---|---|---|
| **Drag handle hover** | Cursor → col-resize/row-resize; handle highlights | 80 ms |
| **During resize** | Direct manipulation; content reflows in real-time | 0 ms |
| **Release** | No additional animation | 0 ms |
| **Double-click (auto-fit)** | Column width morphs to fit content | 200 ms, `--ease-standard` |

### 6.9 Sort

| Behavior | Animation | Duration |
|---|---|---|
| **Sort activate** | Sort indicator arrow appears (fade + slide) | 120 ms |
| **Sort direction change** | Arrow rotates 180° | 160 ms, `--ease-standard` |
| **Table rows reorder** | Cross-fade to new order (not individual row movement) | 200 ms |
| **Sort clear** | Arrow fades out | 80 ms |

### 6.10 Upload

| Behavior | Animation | Duration |
|---|---|---|
| **Drag over zone** | Border: dashed `--border-strong` → solid `--brand-500`; bg: → `--brand-50`; icon scales up | 120 ms |
| **File drop** | Icon bounce (subtle, 1 cycle); file card enters with chip-pop | 160 ms |
| **Upload progress** | Linear progress bar per file, determinate | Real-time |
| **Upload complete** | Progress bar → green; check icon; thumbnail fades in | 200 ms |
| **Upload error** | Progress bar → red; ✕ icon; retry action | 200 ms |
| **Virus scan** | Scanning chip with dot-pulse; → result chip (safe/unsafe) | 2000 ms pulse, 200 ms result |

### 6.11 Loading Indicators

| Type | Animation | Duration | When |
|---|---|---|---|
| **Ring spinner** | 360° rotation | 1200 ms per revolution | Inline loading (buttons, cells) |
| **Dot pulse** | 3 dots staggered scale (1→1.3→1) | 1200 ms cycle, 200 ms stagger | AI thinking inline |
| **Top bar progress** | Indeterminate linear progress sweep | ~2000 ms per sweep | Route transitions |
| **Determinate bar** | Width fills proportionally | Real-time | File upload, step progress |
| **Determinate ring** | Arc fills clockwise; percentage in center | Real-time | Circular progress, hold-to-confirm |
| **Skeleton shimmer** | Gradient sweeps left→right | 1600 ms per sweep | Content loading |

### 6.12 Empty, Error, Success States

| State | Entry Animation | Duration | Notes |
|---|---|---|---|
| **Empty (zero-state)** | Illustration fades in + slides from bottom (8 px) | 200 ms | Illustration uses duotone icon style |
| **Empty (no results)** | Cross-fade from loading/previous content | 160 ms | Compact; no illustration or 96×96 icon |
| **Empty (awaiting data)** | Icon + message fades in | 160 ms | Links to integration setup |
| **Empty (access restricted)** | Lock icon + message fades in | 160 ms | Request-access CTA |
| **Error (section)** | Cross-fade from content/skeleton to error state | 160 ms | Retry button; ref ID copyable |
| **Error (page)** | Cross-fade to full-page error | 200 ms | Illustration + action |
| **Error (global banner)** | Slide from top + fade | 200 ms | `--intent-critical-100` bg; persistent |
| **Success (transient)** | Flash green bg (200 ms in, 800 ms hold, 400 ms out) | 1400 ms total | Toast or inline |
| **Success (redirect)** | Page fades out after 600 ms hold | 200 ms fade | Navigate to success target |

### 6.13 Hover Previews (Object Peek)

| Behavior | Animation | Duration |
|---|---|---|
| **Hover entity ID/link** | After 400 ms hover intent, popover fades + slides (4 px) from trigger | 160 ms |
| **Leave** | Popover fades out after 200 ms delay (grace period for pointer to enter popover) | 120 ms |
| **Click inside popover** | Navigate; popover fades out | 80 ms |
| **Loading content** | Skeleton card inside popover | Shimmer 1600 ms |

### 6.14 Interactive Tooltips

Same as tooltip (§4.15) but remain open while pointer is within tooltip bounds. Additional:

| Behavior | Animation | Duration |
|---|---|---|
| **Enter interactive tooltip** | Maintains visibility | — |
| **Leave interactive tooltip** | 200 ms grace period; then fade out | 120 ms |
| **Click link inside** | Navigate; tooltip fades | 80 ms |

### 6.15 Contextual Hints

| Behavior | Animation | Duration |
|---|---|---|
| **First-use hint (spotlight)** | Backdrop dims to 60%; target element highlighted with ring; hint card fades in | 320 ms |
| **Hint dismiss** | Backdrop + card fades out | 200 ms |
| **Hint step (multi-step tour)** | Cross-fade between hint positions; ring slides to new target | 280 ms |

---

## 7. AI Motion Language

### 7.1 Design Intent

The AI in SafetyOS must feel **alive, accountable, and intelligent** — never cute, never opaque, never like a chatbot. The Halo Orb is the physical embodiment of the AI agent. Its motion is the agent's body language.

The AI motion language communicates three things at all times:
1. **What the AI is doing** (observing, retrieving, reasoning, executing, responding)
2. **How confident the AI is** (high, medium, low, uncertain)
3. **Whether the AI needs the human** (waiting for approval, escalating, error)

### 7.2 Halo Orb

The Halo Orb is a 48×48 px (topbar), 64×64 px (expanded dock), or 96×96 px (hero) multi-layered radial gradient element with ambient motion.

#### 7.2.1 Orb Visual Composition
- **Layer 1 (outer):** Radial gradient from `--brand-halo` outer (`#5AA0FF → #7C6CFF`) — ambient rotation
- **Layer 2 (mid):** Solid `--brand-500` disc — scale breathe
- **Layer 3 (core):** Translucent white (30% opacity) — static center
- **Glow:** `--shadow-glow-brand` at 40% opacity — pulsates with breathe

**Implementation:** GSAP for the outer rotation (performance-critical continuous animation); Framer Motion for state transitions; Three.js shader optional for hero-sized orb (96 px) on onboarding surfaces.

#### 7.2.2 Orb States

| State | Visual Behavior | Motion | Duration/Cycle | Transition In |
|---|---|---|---|---|
| **Idle** | Ambient: Layer 1 slow rotation; Layer 2 scale breathe (1→1.03→1); subtle glow pulse | Continuous | Rotation: 2400 ms/rev; Breathe: 4000 ms/cycle | From any state: 400 ms cross-fade |
| **Listening** | 2 concentric ripple rings pulse outward from orb center; orb brightens 10% | Ripple expand + fade | 900 ms per ripple; staggered by 450 ms | 200 ms transition |
| **Thinking** | Rotation accelerates (2400→1600 ms/rev); 3 particle dots orbit at 240° arc | Particles orbit + rotation speed-up | 1600 ms/rev; particles: 1200 ms orbit | 300 ms ease-in on rotation |
| **Reasoning** | Same as Thinking + inner core pulses with data-flow texture (subtle grid lines) | Core texture animation | 800 ms core pulse cycle | Additive to Thinking |
| **Planning** | Rotation maintains; particles consolidate inward; orb scale increases 1.05 | Consolidation + scale | 600 ms consolidation | 200 ms |
| **Executing** | Small tool icon (16 px) appears bottom-right of orb with `scale(0.8→1)` + fade; orb holds steady | Icon enter | 120 ms icon enter; hold during execution | 120 ms |
| **Streaming** | Orb stabilizes (no rotation); dot-trail emanates from orb toward response surface (3 dots, staggered, moving in arc) | Dot path animation | 800 ms per dot traversal | 200 ms transition from any active state |
| **Confident** | Subtle green tint (`--intent-success-500` at 15%) blends into core | Color blend | 400 ms tint transition | Additive |
| **Uncertain** | Subtle amber tint (`--intent-warning-500` at 15%) blends into core; rotation slows | Color blend + deceleration | 400 ms tint; rotation: 3200 ms/rev | Additive |
| **Waiting (human approval)** | Orb pauses rotation; single ring pulses at orb edge (attention request); icon overlay shows approval symbol | Pause + ring pulse | 1500 ms ring cycle | 300 ms transition |
| **Error** | Red tint (`--intent-critical-500` at 20%) + single horizontal shake (8 px, once) | Shake + tint | 400 ms shake; 600 ms tint hold | Immediate |
| **Recovery** | Red tint fades → amber → returns to idle | Color sequence | 800 ms total | Linear color fade |
| **Interrupt** | Rotation immediately stops; brief compression (scale 0.95) then spring back | Stop + compress + spring | 200 ms compress; spring 300 ms | Immediate |
| **Dimmed** | Orb reduces to 20% opacity; no rotation; no breathe | Static | 400 ms fade to dim | When user is in hands-on task |

#### 7.2.3 Reduced Motion Orb
Under `prefers-reduced-motion`:
- No rotation, no breathe, no particles
- Static gradient (no animation)
- State changes via color tint only (400 ms cross-fade)
- `--intent-catastrophic` retains 1 Hz blink
- Tool icon appears/disappears with fade only (120 ms)

### 7.3 Agent Collaboration

When multiple agents collaborate (e.g., Safety Agent + Compliance Agent + Risk Agent):

| Behavior | Animation | Duration |
|---|---|---|
| **Agent handoff** | Orb briefly shows passing-arc between agent icons (120 ms) | 120 ms |
| **Parallel agents** | Orb shows split-gradient (half per active agent); rotation maintains | Continuous |
| **Agent complete** | Agent's portion of gradient fades to idle; remaining agents continue | 400 ms |

### 7.4 Tool Execution

When the AI calls a tool (e.g., `kg.query`, `predictive.risk_score`, `cv.frame_lookup`):

| Behavior | Animation | Duration |
|---|---|---|
| **Tool call start** | Tool icon (16 px) appears at orb bottom-right with scale + fade | 120 ms |
| **Tool executing** | Icon has subtle pulse (2 cycles) | 800 ms per cycle |
| **Tool complete (success)** | Icon cross-fades to ✓; then fades out | 120 ms ✓; 200 ms fade |
| **Tool complete (error)** | Icon cross-fades to ✕ (red); then fades out | 120 ms ✕; 400 ms hold; 200 ms fade |
| **Tool trace (reasoning panel)** | Step appears in vertical timeline: icon + label + expandable detail; streamline connecting line draws | 280 ms line draw; 200 ms step enter |

### 7.5 Memory Retrieval

| Behavior | Animation | Duration |
|---|---|---|
| **Memory search start** | Orb core shows brief radial sweep (search animation) | 400 ms |
| **Memory found** | Core brightens (10%); micro-flash | 200 ms |
| **Memory not found** | Core dims slightly; orb continues to next tool | 200 ms |

### 7.6 Knowledge Graph Traversal

In the Knowledge Graph Explorer and when AI traverses the graph:

| Behavior | Animation | Duration |
|---|---|---|
| **Node visit** | Visited node scales 1→1.2 + glow ring; connecting edge draws | 200 ms node; 320 ms edge |
| **Path highlight** | Sequential edge glow along traversal path | 80 ms per edge |
| **Graph settle** | Force-directed layout spring-settles after new nodes added | `SPRING_PRESETS.default` |
| **Citation link** | Superscript number in response → line draws from number to source node in graph | 320 ms |

### 7.7 Workflow Execution

When AI executes a workflow step (e.g., auto-drafting a PTW):

| Behavior | Animation | Duration |
|---|---|---|
| **Step start** | Workflow step in reasoning timeline highlights with `--brand-50` tint | 120 ms |
| **Step in progress** | Dot pulse (3 dots) inside step cell | 1200 ms cycle |
| **Step complete** | Check icon draws (160 ms); tint → `--intent-success-100` | 200 ms |
| **Step failed** | ✕ icon; tint → `--intent-critical-100`; retry affordance | 200 ms |
| **Step requires approval** | Decision card morphs in from step cell with `--ease-emphasized` | 320 ms |

### 7.8 Confidence Visualization

| Confidence Level | Visual Treatment | Motion |
|---|---|---|
| **High (≥ 85%)** | `--intent-success-500` chip; solid fill | Static; no animation |
| **Medium (60–84%)** | `--intent-warning-500` chip; solid fill | Static; no animation |
| **Low (40–59%)** | `--intent-warning-700` chip; dashed border | Subtle pulse (1 cycle, 1200 ms) to draw attention |
| **Very Low (< 40%)** | `--intent-critical-500` chip; dashed border; ⚠ icon | 2-cycle pulse |
| **Increasing** | Chip fill sweeps left→right to new width | 400 ms |
| **Decreasing** | Chip fill recedes right→left | 400 ms |
| **Click** | Chip expands into citation popover | 200 ms |

### 7.9 Reasoning Timeline

The reasoning timeline is a vertical stepper that streams as the AI thinks:

| Behavior | Animation | Duration |
|---|---|---|
| **Step appear** | Fade + slide from bottom (8 px) | 200 ms, stagger 40 ms |
| **Step label** | Text types in (character-by-character simulation) | ~50 ms per character |
| **Connecting line** | SVG path draws downward (streamline primitive) | 280 ms |
| **Step expand** | Height morph + detail content fade | 280 ms |
| **Step collapse** | Detail fade → height morph | 200 ms |
| **Active step** | Dot pulses; connecting line is dashed-animated (marching ants) | 1200 ms cycle |
| **Completed step** | Dot fills solid; connecting line becomes solid | 200 ms |

### 7.10 Streaming Response Rendering

AI responses stream token-by-token. Motion rules:

| Behavior | Animation | Duration |
|---|---|---|
| **Token appear** | Each token (word) fades in with opacity 0→1 | 60 ms per token |
| **Line complete** | Line settles into static state | Immediate on last token |
| **Code block** | Syntax-highlighted code streams line-by-line | 40 ms per line |
| **Inline citation** | Superscript number pops in (chip-pop: scale 0.9→1 + fade) | 160 ms |
| **Action button** | Button fades in after stream completes (not during) | 200 ms after stream end |
| **Chart/table embed** | Container morphs open after stream completes; chart animates per §10 | 280 ms morph + chart animation |
| **Error mid-stream** | Streaming stops; error chip appears inline; red tint on orb | 200 ms |
| **Interrupt (user)** | Streaming stops immediately; last partial token completes; "[Interrupted]" chip | 0 ms stop; 120 ms chip |

### 7.11 Context Switching

When the user changes scope/context while AI is active:

| Behavior | Animation | Duration |
|---|---|---|
| **Scope change** | AI dock cross-fades context; previous thread available in history | 200 ms |
| **Page change** | Orb state resets to idle; dock content cross-fades | 200 ms |
| **Return to active thread** | Thread restores from history; scroll position restored | 0 ms |

### 7.12 Conversation Transitions

| Behavior | Animation | Duration |
|---|---|---|
| **New conversation** | Previous thread slides up + fades; new thread slides up from bottom | 200 ms |
| **Switch thread** | Cross-fade thread content | 160 ms |
| **Thread close** | Thread slides down + fades | 160 ms |
| **Thread pin** | Pin icon scale-pops (0.9→1); thread card gets accent border | 160 ms |

---

## 8. Dashboard Motion

### 8.1 Animated KPIs

KPI cards are the primary information surface on dashboards. Their motion must feel cinematic but never distracting.

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Initial mount** | Cards stagger in (fade + translateY 4 px); numbers count up from 0 to value | 200 ms card; 240 ms counter | Card: `--ease-entrance`; Counter: `--ease-emphasized` |
| **Value update (real-time)** | Number interpolates through intermediate values; delta chip flashes | 240 ms interpolation; 1200 ms delta flash | `--ease-emphasized` |
| **Trend change** | Sparkline redraws with path-draw animation | 320 ms | `--ease-standard` |
| **Delta chip appear** | Scale 0.9→1 + fade (chip-pop) | 160 ms | `--ease-emphasized` |
| **KPI hover** | Elevation +1, "View details →" fades in | 120 ms | `--ease-standard` |

### 8.2 Animated Counters

All numeric values that change over time use the `<AnimatedNumber>` component:

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Count up (initial)** | Digits tick through intermediate values from 0 | 240 ms | `--ease-emphasized` |
| **Value change** | Digits tick through intermediate values (shortest path) | 240 ms | `--ease-emphasized` |
| **Thousands separator** | Comma appears when digit count crosses boundary | 80 ms fade | `--ease-standard` |
| **Decimal precision** | Decimal values interpolate smoothly | 240 ms | `--ease-emphasized` |
| **Reduced motion** | Instant value swap (no interpolation) | 0 ms | N/A |

**Rule:** Counter animation uses `font-variant-numeric: tabular-nums` to prevent layout shift during digit changes.

### 8.3 Real-Time Updates

| Behavior | Animation | Duration |
|---|---|---|
| **WebSocket value arrive** | Value interpolates (§8.2); cell/card flashes `--brand-50` bg | 240 ms value; 1200 ms flash |
| **Batch update (≤ 100 ms window)** | All values in batch update simultaneously (no stagger) | 240 ms |
| **Connection lost** | Live-status dot fades from green to amber; "Reconnecting…" chip | 200 ms |
| **Connection restored** | Dot fades to green; chip fades out; data refreshes | 200 ms |
| **Stale data** | 10% opacity overlay + "Last updated" chip fades in | 200 ms |

### 8.4 Number Interpolation

The `<AnimatedNumber>` component interpolates between values using the following algorithm:

1. Calculate the difference between old and new values
2. Choose interpolation frames: `Math.min(Math.ceil(Math.abs(delta) / 10), 12)` intermediate steps
3. Distribute steps across 240 ms using `--ease-emphasized`
4. Each digit column animates independently (slot-machine effect for integers)
5. `font-variant-numeric: tabular-nums` prevents layout shift
6. Under reduced motion: instant swap

### 8.5 Gauge Updates

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Initial render** | Arc draws from 0 to value (clockwise) | 480 ms | `--ease-emphasized` |
| **Value update** | Arc interpolates to new position | 320 ms | `--ease-standard` |
| **Threshold cross** | Arc color transitions (e.g., green → amber → red) | 200 ms | `--ease-standard` |
| **Center label** | Number interpolates (§8.2) | 240 ms | `--ease-emphasized` |
| **Reduced motion** | Instant fill; no draw animation | 0 ms | N/A |

### 8.6 Progress Rings

| Behavior | Animation | Duration |
|---|---|---|
| **Determinate progress** | Arc fills proportionally; percentage label updates | Real-time |
| **Indeterminate** | Arc segment rotates (1200 ms/rev) with varying length | 1200 ms/rev |
| **Complete** | Full ring briefly pulses green (1 cycle); check icon appears | 400 ms |
| **Error** | Ring turns red; ✕ icon | 200 ms |

### 8.7 Heatmaps

| Behavior | Animation | Duration |
|---|---|---|
| **Initial render** | Cells fade in with stagger (row-major order, 20 ms per cell, max 12 rows) | Max 240 ms |
| **Value update** | Cell color interpolates to new value | 200 ms |
| **Cell hover** | Border highlight + tooltip | 80 ms |
| **Zoom/drill** | Cross-fade to zoomed view | 200 ms |

### 8.8 Risk Cards

Risk cards follow standard card motion (§4.3) plus:

| Behavior | Animation | Duration |
|---|---|---|
| **Risk score change** | Number interpolates; accent bar color transitions | 240 ms value; 200 ms color |
| **Risk escalation** | Card border flashes `--intent-critical-500` (2 cycles); elevated shadow | 1200 ms flash |
| **Risk de-escalation** | Smooth color transition; no flash | 400 ms |
| **Contributing factor chips** | New factors pop in (chip-pop); removed factors fade out | 160 ms in; 120 ms out |

### 8.9 Timeline Playback

| Behavior | Animation | Duration |
|---|---|---|
| **Play** | Cursor sweeps along timeline; events highlight as cursor crosses | Continuous at playback speed |
| **Pause** | Cursor stops; all synchronized elements freeze | 0 ms |
| **Scrub** | Direct manipulation; all synced elements update in real-time | 0 ms |
| **Jump to event** | Cursor springs to event position; scene cross-fades to event state | 200 ms spring; 200 ms scene |
| **Speed change** | Speed indicator cross-fades; cursor speed adjusts | 120 ms indicator |
| **Event marker hover** | Marker scales 1→1.3; tooltip shows event summary | 120 ms |

### 8.10 Live Alerts

| Behavior | Animation | Duration |
|---|---|---|
| **New alert entry** | Alert card slides in from top of feed + fade; other items spring-shift down | 200 ms entry; spring shift |
| **Alert acknowledge** | Card cross-fades to acknowledged state (muted colors) | 200 ms |
| **Alert shelve** | Card slides right + fades out | 200 ms |
| **Critical alert** | Entry same; plus 2-cycle pulse on severity chip | 1200 ms pulse |
| **Catastrophic alert** | Full-viewport interstitial (§4.20); no feed entry animation | 0 ms |

### 8.11 Expandable Analytics

| Behavior | Animation | Duration |
|---|---|---|
| **Card expand** | Height morph; summary cross-fades to detailed view; chart animates | 320 ms morph; chart per §10 |
| **Card collapse** | Detail fades (80 ms); height morphs closed | 280 ms |
| **Drill-down** | Cross-fade chart view; filter chips animate | 160 ms chart; 160 ms chips |

### 8.12 Widget Rearrangement

| Behavior | Animation | Duration |
|---|---|---|
| **Enter edit mode** | Widgets jiggle subtly (iOS-style, ±1°, 400 ms); add/remove handles appear | 200 ms handles; continuous jiggle |
| **Drag widget** | Widget lifts (scale 1.02, shadow-4); follows pointer with spring lag | Spring real-time |
| **Widget reorder** | Other widgets spring-reposition to accommodate | `SPRING_PRESETS.default` |
| **Drop** | Widget springs into grid position; shadow returns | `SPRING_PRESETS.default` |
| **Widget add** | New widget scales from 0.8→1 + fades in from center | 240 ms |
| **Widget remove** | Widget scales 1→0.8 + fades; gap collapses with spring | 200 ms fade; spring collapse |
| **Exit edit mode** | Jiggle stops; handles fade out | 200 ms |

### 8.13 AI Insight Cards

| Behavior | Animation | Duration |
|---|---|---|
| **Insight appear** | Card enters with Halo gradient accent shimmer (1 cycle) + standard card enter | 200 ms card + 600 ms shimmer |
| **"AI-generated" chip** | Chip pops in (scale 0.9→1) | 160 ms |
| **Reasoning link click** | Card morphs to expanded reasoning view | 320 ms |
| **Dismiss insight** | Card fades + collapses | 200 ms |
| **Accept recommendation** | Card border flashes green (1 cycle); action button → success state | 200 ms flash; 800 ms success hold |

---

## 9. Digital Twin Motion

### 9.1 Camera Transitions

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Fly-to bookmark** | Camera position + rotation interpolates along bezier curve | 640 ms | `--ease-emphasized` |
| **Orbit (user drag)** | Direct manipulation; follows pointer with slight inertial lag | 0 ms + 200 ms inertia decay | `--ease-exit` decay |
| **Zoom (scroll)** | Direct manipulation; smooth zoom toward cursor | 0 ms per tick | N/A |
| **Zoom to object** | Camera flies to frame selected object with 20% padding | 480 ms | `--ease-emphasized` |
| **Reset camera** | Camera returns to default bookmark | 480 ms | `--ease-standard` |
| **L1→L2 drill camera** | Camera flies from plant overview to focused unit | 640 ms | `--ease-emphasized` |
| **L2→L3 drill camera** | Camera pushes into unit, centering on equipment | 480 ms | `--ease-emphasized` |
| **Reduced motion** | All camera transitions snap instantly (no fly animation) | 0 ms | N/A |

**Implementation:** Three.js `OrbitControls` with custom damping; GSAP `gsap.to()` for smooth camera animations (only approved GSAP use in Digital Twin).

### 9.2 Equipment Animation

| Behavior | Animation | Duration |
|---|---|---|
| **Equipment select** | 3 px outline glow (`--brand-halo`); detail card anchored to mesh | 200 ms glow; 200 ms card |
| **Equipment deselect** | Glow fades; card fades + slides out | 160 ms |
| **Equipment state change** | Material color transitions (e.g., nominal→warning→critical) | 400 ms |
| **Equipment hover** | Subtle brightening (+10% emissive) + cursor change | 120 ms |
| **Equipment alarm** | Pulsing sphere at equipment location (see Alert Bloom, §9.6) | 1200 ms cycle |

### 9.3 Pipeline Flow

| Behavior | Animation | Duration |
|---|---|---|
| **Flow direction** | Animated dashed texture moves along pipe UV in flow direction | Continuous; speed ∝ flow rate |
| **Flow rate change** | Texture speed interpolates | 400 ms |
| **Flow stop** | Texture freezes (no animation); pipe desaturates | 400 ms desaturation |
| **Highlight pipe** | Pipe emissive increases; selection glow | 200 ms |

### 9.4 Sensors / Live Telemetry

| Behavior | Animation | Duration |
|---|---|---|
| **Sensor ring update** | Radial gauge arc interpolates to new value | 320 ms |
| **Sensor threshold cross** | Ring color transitions (intent colors); alert bloom if critical | 200 ms color; 200 ms bloom |
| **Sensor hover** | Value label appears above ring | 120 ms |

### 9.5 Workers / Personnel

| Behavior | Animation | Duration |
|---|---|---|
| **Position update** | Worker chip interpolates to new position (smooth, 5 s WebSocket interval) | 500 ms interpolation |
| **Worker hover** | Name/PPE status card appears | 160 ms |
| **PPE violation** | Worker chip border flashes red (2 cycles) | 1200 ms |
| **Path trace** | Trail ribbon draws behind worker (last 15 min); fading tail | Continuous |

### 9.6 Hazards / Alert Bloom

| Behavior | Animation | Duration |
|---|---|---|
| **Hazard zone overlay** | Semi-transparent extrusion fades in; 2 px stroke border | 200 ms |
| **Alert bloom (incident)** | Pulsing sphere at incident location; size ∝ severity | 1200 ms cycle; continuous |
| **Alarm flash** | Equipment mesh flashes intent color (2 cycles for critical; continuous for catastrophic) | 800 ms/cycle |
| **Risk overlay** | Alpha-blended intent color overlay on zones; opacity ∝ risk score | 400 ms fade in/transition |

### 9.7 Incident Playback

| Behavior | Animation | Duration |
|---|---|---|
| **Enter replay mode** | "Live" indicator → "Replay" indicator; timeline scrubber appears | 200 ms |
| **Scrub** | All scene elements interpolate to scrubbed timestamp | Real-time |
| **Event marker** | Diamond marker on timeline; hover shows summary | 120 ms hover |
| **Compare-current toggle** | Scene cross-fades between replay state and live state | 400 ms |
| **Exit replay** | Scene transitions to live; "Replay" → "Live" indicator | 200 ms |

### 9.8 AI Overlays in Twin

| Behavior | Animation | Duration |
|---|---|---|
| **AI analysis start** | Inference nodes float above relevant equipment (screen-space) | 200 ms fade + float |
| **Inference connections** | Animated lines (streamline) connect nodes | 320 ms per connection |
| **AI annotation** | Label card appears near relevant object | 200 ms |
| **AI analysis complete** | Nodes consolidate → summary card; connections fade | 400 ms |

---

## 10. Data Visualization Motion

### 10.1 Line Charts

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Initial mount** | Axes fade in (120 ms) → line paths draw from left to right (streamline) | 120 ms axes; 320 ms per series; stagger 80 ms | `--ease-standard` |
| **Data update** | Points interpolate along Y-axis to new values; line morphs | 240 ms | `--ease-standard` |
| **Hover crosshair** | Vertical line appears + point markers on all series + tooltip | 0 ms (follows pointer) | N/A |
| **Series toggle** | Toggled series fades out/in; remaining series repositions if scale changes | 200 ms fade; 240 ms rescale | `--ease-standard` |
| **Zoom (brush)** | Selected range smoothly expands to fill chart area | 320 ms | `--ease-emphasized` |
| **Zoom reset** | Chart smoothly returns to full range | 320 ms | `--ease-emphasized` |
| **Compare overlay** | Previous period line fades in at 50% opacity with dashed style | 200 ms | `--ease-standard` |

**Rule:** Never animate axes on data update. Axis repositioning is instant (prevents jitter).

### 10.2 Area Charts

Same as line charts plus:

| Behavior | Animation | Duration |
|---|---|---|
| **Area fill** | Fill sweeps down from line path to baseline | 320 ms (matches line draw) |
| **Fill opacity** | 20% alpha of stroke color | Static |

### 10.3 Bar Charts

| Behavior | Animation | Duration | Easing |
|---|---|---|---|
| **Initial mount** | Bars scale from 0 height at baseline; stagger 40 ms per bar | 240 ms per bar; stagger 40 ms | `--ease-emphasized` |
| **Data update** | Bar heights interpolate to new values | 240 ms | `--ease-standard` |
| **Bar hover** | Bar brightens; tooltip appears; other bars dim to 40% | 120 ms | `--ease-standard` |
| **Threshold line** | Dashed line fades in after bars settle | 160 ms | `--ease-standard` |
| **Sort change** | Bars spring-reposition horizontally | `SPRING_PRESETS.default` | Spring |

### 10.4 Stacked Charts

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Segments scale from baseline; stagger bottom→top per bar | 240 ms per bar |
| **Segment hover** | Hovered segment brightens; others dim; tooltip isolates segment | 120 ms |
| **Data update** | Segment heights interpolate | 240 ms |

### 10.5 Heatmaps

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Cells fade in row-major, stagger 20 ms per cell (max 12 rows) | Max 240 ms |
| **Cell value update** | Cell color interpolates | 200 ms |
| **Cell hover** | Border highlight + tooltip with full value | 80 ms |
| **Row/column sort** | Cells spring-reposition | `SPRING_PRESETS.default` |

### 10.6 Treemaps

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Rectangles morph from 0 area to final layout | 320 ms |
| **Drill-down** | Clicked cell expands to fill; children rectangles morph in | 320 ms |
| **Drill-up** | Reverse: children collapse; parent shrinks to cell | 320 ms |
| **Value update** | Rectangle sizes interpolate to new layout | 240 ms |

### 10.7 Network Graphs

| Behavior | Animation | Duration |
|---|---|---|
| **Initial layout** | Nodes fade in; then force-directed simulation runs for ~60 frames | 200 ms fade; ~1000 ms simulation |
| **Edge draw** | Edges draw as connecting lines after nodes settle (streamline) | 320 ms |
| **Node hover** | Node scales 1→1.3; connected nodes highlight; unconnected nodes dim | 200 ms |
| **Node drag** | Direct manipulation; simulation continues with dragged node as fixed | 0 ms drag; real-time simulation |
| **Add node** | New node pops in (scale 0→1); edges draw; simulation resettles | 200 ms pop; 320 ms edges; ~500 ms settle |
| **Remove node** | Node + edges fade out; simulation resettles | 200 ms fade; ~500 ms settle |
| **Zoom** | Camera zoom (direct manipulation) | 0 ms |
| **Fit-to-view** | Camera animates to fit all nodes | 480 ms |

### 10.8 Knowledge Graph

Same as network graphs (§10.7) plus:

| Behavior | Animation | Duration |
|---|---|---|
| **Entity type color coding** | Nodes colored by type; legend chips pop in | 160 ms |
| **Relationship label** | Labels fade in on edge hover | 120 ms |
| **Path highlight** | Sequential edge glow from source to target | 80 ms per edge |
| **Neighborhood expand** | New nodes pop in around selected node; edges draw | 200 ms nodes; 320 ms edges |
| **AI traversal overlay** | Visited nodes glow sequentially as AI reasons | 200 ms per node visit |

### 10.9 React Flow (Workflow Visualizer)

| Behavior | Animation | Duration |
|---|---|---|
| **Initial render** | Nodes stagger fade-in; edges draw | 200 ms nodes (stagger 30 ms); 320 ms edges |
| **Node drag** | Direct manipulation; edges follow | 0 ms |
| **Edge creation** | Line draws from source handle to cursor/target | Real-time |
| **Workflow execution highlight** | Active node glows `--brand-500`; completed nodes show check | 200 ms |
| **Zoom/pan** | Direct manipulation with inertial scrolling | 0 ms + inertia |
| **Minimap sync** | Viewport indicator follows main canvas in real-time | 0 ms |

### 10.10 Force-Directed Graphs

See §10.7 (Network Graphs). Additional for Sankey:

### 10.10.1 Sankey Diagrams

| Behavior | Animation | Duration |
|---|---|---|
| **Initial render** | Nodes fade in left→right; flows draw (streamline) | 200 ms nodes; 480 ms flows |
| **Node hover** | Connected flows highlight; unconnected flows dim to 20% | 200 ms |
| **Flow hover** | Flow brightens; tooltip shows value | 120 ms |
| **Value update** | Flow widths interpolate | 240 ms |

### 10.11 Geospatial Maps

| Behavior | Animation | Duration |
|---|---|---|
| **Map load** | Tiles progressive-load; markers fade in after tiles | Tile load + 200 ms markers |
| **Marker cluster expand** | Cluster splits into individual markers with spring physics | 240 ms, `SPRING_PRESETS.default` |
| **Marker cluster collapse** | Markers consolidate into cluster | 200 ms |
| **Fly-to location** | Camera eases to target coordinates | 480–640 ms |
| **Layer toggle** | Layer fades in/out | 200 ms |
| **Evac route marching ants** | Animated dashed line (`--intent-success`) with configurable speed | Continuous |
| **Incident pulse marker** | Marker pulses with size ∝ severity | 1200 ms cycle |
| **Worker position update** | Marker interpolates to new position | 500 ms |
| **Heat layer update** | Color values interpolate | 400 ms |
| **Wind/plume animation** | Vector field particle animation | Continuous |

### 10.12 Scatter Plots

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Points pop in with stagger (chip-pop: scale 0.9→1) | 160 ms per point; stagger 10 ms (max 100) |
| **Data update** | Points interpolate position | 240 ms |
| **Point hover** | Point scales 1→1.5; tooltip | 120 ms |
| **Brush selection** | Drag rectangle; points inside highlight; outside dim | Real-time |

### 10.13 Bubble Charts

Same as scatter plus:

| Behavior | Animation | Duration |
|---|---|---|
| **Size transition** | Bubble radius interpolates | 240 ms |
| **Color transition** | Bubble color interpolates (categorical → intent if crossing threshold) | 200 ms |

### 10.14 Radar Charts

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Axes fade in; polygon draws from center outward | 120 ms axes; 320 ms polygon |
| **Data update** | Polygon vertices interpolate to new positions | 240 ms |
| **Series overlay** | Second polygon fades in at 50% alpha | 200 ms |

### 10.15 Risk Matrices (5×5)

| Behavior | Animation | Duration |
|---|---|---|
| **Initial mount** | Grid fades in; cells fill with color stagger (row-major, 20 ms) | 200 ms |
| **Active cell highlight** | Active cell border + glow + scale 1.02 | 200 ms |
| **Value change** | Cell color interpolates; count label cross-fades | 200 ms |
| **Drill-down** | Clicked cell morphs to detailed view | 320 ms |

### 10.16 Animation Duration Limits for Charts

| Chart Type | Max Initial Duration | Max Update Duration | Max Drill Duration |
|---|---|---|---|
| Line/Area | 480 ms (axes + draw) | 240 ms | 320 ms |
| Bar/Column | 480 ms (stagger capped at 12 bars) | 240 ms | 320 ms |
| Heatmap | 320 ms | 200 ms | 280 ms |
| Network | 1500 ms (simulation) | 500 ms (resettle) | N/A |
| Gauge/Ring | 480 ms | 320 ms | N/A |
| Sankey | 680 ms (nodes + flows) | 240 ms | N/A |
| Map layers | 200 ms per layer | 400 ms | 640 ms (fly-to) |
| Scatter/Bubble | 480 ms (max 100 stagger) | 240 ms | N/A |

### 10.17 Reduced Motion for Charts

Under `prefers-reduced-motion`:
- No path draw animations — lines, areas, bars appear instantly
- No stagger — all elements appear simultaneously
- Data updates still interpolate values (120 ms max) — this is functional, not decorative
- Hover crosshairs/tooltips still function normally
- Force-directed simulations still run (but render instantly at final state)
- Map fly-to snaps to destination (no animation)

---

## 11. Loading Experience

### 11.1 Skeletons

Skeleton screens are the primary loading pattern. They appear within 100 ms of any data request.

| Surface | Skeleton Shape | Shimmer | Stagger |
|---|---|---|---|
| **KPI cards** | Rounded rectangles matching card dimensions; number placeholder; sparkline placeholder | Left→right gradient sweep, 1600 ms | 60 ms per card |
| **Table** | 12 rows of alternating-width rectangles matching column layout | Left→right, 1600 ms | 30 ms per row |
| **Chart** | Axis line stubs + rectangular chart area placeholder | Left→right, 1600 ms | N/A |
| **Form** | Label rectangles + input rectangles matching form layout | Left→right, 1600 ms | 40 ms per field |
| **Card grid** | Card-shaped rectangles matching grid | Left→right, 1600 ms | 40 ms per card |
| **Timeline** | Vertical line + circular dots + text blocks | Left→right, 1600 ms | 40 ms per item |
| **Digital Twin** | Rectangular canvas placeholder; floating control skeletons | Left→right, 1600 ms | N/A |
| **Navigation rail** | Icon placeholders + label bars | Left→right, 1600 ms | 20 ms per item |

**Skeleton colors:**
- Light mode: base `--gray-100`, shimmer `--gray-200`
- Dark mode: base `--gray-100` (dark), shimmer `--gray-200` (dark)

**Skeleton→Content transition:**
1. Skeleton fade out: 80 ms, `--ease-exit`
2. Content fade in: 120 ms, `--ease-entrance`, 60 ms delay (overlap with skeleton exit)
3. Stagger between sibling elements: per surface table above

**Rule:** Skeletons must never persist beyond 4 seconds. After 4 s, replace with a progress indicator showing cause ("Loading from OT gateway…").

### 11.2 Progressive Loading

Multi-source pages (e.g., Command Console with KPIs + alarms + risk + permits) load progressively:

1. Shell renders immediately (SSR)
2. Skeleton regions appear per data source (100 ms)
3. Each data source resolves independently; skeleton→content transition per region
4. No region waits for any other region
5. Error in one region does not block others — failed region shows error state while others load normally

### 11.3 Streaming UI

AI responses and search results use streaming patterns:

| Behavior | Animation |
|---|---|
| **Token stream start** | Cursor blink appears at response start position |
| **Token append** | Each word fades in (60 ms opacity transition) at cursor position; cursor advances |
| **Paragraph break** | Line height expands (80 ms); cursor moves to new line |
| **Stream end** | Cursor fades out (120 ms); action buttons fade in (200 ms, 120 ms delay) |
| **Stream error** | Last token highlighted red; error chip appears inline | 

### 11.4 Placeholder States

| Context | Placeholder Content | Motion |
|---|---|---|
| **Image loading** | Solid `--gray-100` rectangle with image icon | Static; content fades over on load (200 ms) |
| **Video loading** | Solid `--gray-100` rectangle with play icon | Static; video replaces on load (0 ms) |
| **Avatar loading** | Circular `--gray-100` with silhouette | Static; avatar fades over on load (120 ms) |
| **Map tiles loading** | Checkered `--gray-50` / `--gray-100` | Tiles fade in as they load (120 ms per tile) |

### 11.5 Optimistic UI

| Action | Optimistic Response | Rollback on Failure |
|---|---|---|
| **Form submit** | Button → success state immediately; toast "Saved" | Revert button; error toast; re-populate form |
| **Toggle switch** | Switch animates to new state immediately | Spring back to previous state + error toast |
| **Row delete** | Row collapses immediately (with undo toast) | Row restores with spring; error toast |
| **Notification ACK** | Item fades to read state immediately | Item reverts to unread; error toast |
| **Alarm ACK** | Alarm row transitions to ACK state | Row reverts; error banner |

### 11.6 Partial Rendering

| Scenario | Behavior |
|---|---|
| **Virtualized table** | Only visible rows render; rows entering viewport fade in (80 ms); exiting rows unmount |
| **Virtualized grid** | Only visible cards render; cards entering viewport have standard card enter | 
| **Lazy-loaded chart** | Chart component loaded on viewport intersection; skeleton → chart transition |
| **Digital Twin LOD** | Distant meshes use low-poly LOD; swap is instant (no transition) |

### 11.7 Background Refresh

| Behavior | Animation |
|---|---|
| **Tab refocus** | Data silently refetches; new data cross-fades over old (120 ms); "Updated just now" chip appears |
| **Periodic poll** | Data updates without visual indication unless values change; changes use §8.3 real-time update rules |
| **Manual refresh** | Refresh icon rotates 360° (800 ms); content cross-fades | 

### 11.8 Error Recovery

| Behavior | Animation | Duration |
|---|---|---|
| **Retry button press** | Button → loading state | 120 ms |
| **Retry success** | Error state cross-fades to content | 200 ms |
| **Retry failure** | Button → error state; error message updates | 200 ms |
| **Auto-retry (background)** | No visible change until success; then content fades in | 200 ms on success |

### 11.9 Retry Animation

| Behavior | Animation | Duration |
|---|---|---|
| **Retry attempt 1** | Spinner; "Retrying…" | Immediate |
| **Retry attempt 2** | Spinner; "Still trying…" | After 3 s |
| **Retry attempt 3** | Spinner → "Connection issue. Retry or contact support." + manual retry button | After 6 s |
| **Max retries exceeded** | Spinner → error icon; cause message; manual retry | Immediate |

### 11.10 Offline Mode

| Behavior | Animation | Duration |
|---|---|---|
| **Go offline** | `<OfflineBanner>` slides down from top of viewport; "You're offline" | 200 ms |
| **Offline interaction** | Optimistic UI continues; sync queue indicator increments | 120 ms per queue item |
| **Come online** | Banner shows "Reconnecting…" with spinner; then "Back online" (hold 2 s); banner slides up | 200 ms in/out; 2000 ms hold |
| **Sync queue processing** | Queue count decrements with counter-tick animation | 240 ms per tick |
| **Sync conflict** | Conflict card appears in sync queue with resolve action | 200 ms card enter |

---

## 12. Empty States

### 12.1 First Use (Zero State)

| Behavior | Animation | Duration |
|---|---|---|
| **Illustration enter** | Duotone illustration fades in + slides from bottom (8 px) | 200 ms |
| **Heading + description** | Fade in, 80 ms delay after illustration | 160 ms |
| **CTA button** | Fade in, 120 ms delay after text | 160 ms |
| **Onboarding checklist** | Items stagger fade, 40 ms per item | 200 ms per item |
| **Hover illustration** | Subtle scale 1→1.02 (imperceptible life) | 200 ms |

### 12.2 No Data

| Behavior | Animation | Duration |
|---|---|---|
| **Cross-fade from loading** | Skeleton → empty state cross-fade | 160 ms |
| **Icon enter** | Small icon (96×96) fades in | 120 ms |
| **Message** | Fade in, 60 ms delay | 120 ms |
| **Suggestion chips** | Chips pop in, stagger 30 ms | 160 ms |

### 12.3 No Search Results

| Behavior | Animation | Duration |
|---|---|---|
| **Cross-fade from results** | Results → empty cross-fade | 120 ms |
| **Message** | "No matches for '{query}'" fades in | 120 ms |
| **Suggestions** | "Clear filters", "Search everywhere", "Ask Halo" actions fade in | 160 ms, stagger 40 ms |

### 12.4 Permission Denied

| Behavior | Animation | Duration |
|---|---|---|
| **Lock icon** | Fade in + subtle scale (0.95→1) | 160 ms |
| **Message** | Fade in, 60 ms delay | 120 ms |
| **Request access CTA** | Fade in, 120 ms delay | 160 ms |
| **Return home link** | Fade in with CTA | 160 ms |

### 12.5 Offline

| Behavior | Animation | Duration |
|---|---|---|
| **Cloud-off icon** | Fade in | 120 ms |
| **Message** | "You're offline. Cached data shown." | 120 ms |
| **Sync queue link** | Fade in | 120 ms |

### 12.6 Maintenance

| Behavior | Animation | Duration |
|---|---|---|
| **Wrench icon** | Fade in | 120 ms |
| **Maintenance window** | "Scheduled maintenance: {time range}" | 120 ms |
| **ETA countdown** | Counter-tick animation, updates every second | 240 ms tick |
| **Subscribe CTA** | Fade in | 120 ms |

### 12.7 Configuration Missing

| Behavior | Animation | Duration |
|---|---|---|
| **Setup icon** | Fade in | 120 ms |
| **Step list** | Items stagger, 40 ms | 200 ms |
| **Configure CTA** | Fade in | 160 ms |

---

## 13. Accessibility

### 13.1 WCAG 2.2 AA Compliance

All motion conforms to WCAG 2.2 AA. Specific criteria addressed:

| Criterion | Requirement | SafetyOS Implementation |
|---|---|---|
| **2.3.1 Three Flashes** | No content flashes more than 3 times per second | No animation exceeds 3 Hz flash rate. `--intent-catastrophic` pulse is 0.83 Hz (1200 ms cycle). Reduced motion reduces to 1 Hz. |
| **2.3.3 Animation from Interactions** | Motion triggered by interaction can be disabled | `prefers-reduced-motion` respected globally; user override in `/me` preferences |
| **2.2.2 Pause, Stop, Hide** | Moving content can be paused, stopped, or hidden | All ambient motion (Orb, live dots) pausable via reduced-motion. Skeleton shimmer stops when content loads. |

### 13.2 Reduced Motion

When `prefers-reduced-motion: reduce` is active (via system preference OR user setting):

**CSS implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-micro: 0ms;
    --duration-fast: 0ms;
    --duration-moderate: 0ms;
    --duration-steady: 0ms;
    --duration-slow: 120ms;    /* Allow minimal transition for large layout changes */
    --duration-deliberate: 0ms;
    --duration-cinematic: 0ms;
    --duration-epic: 0ms;
    --duration-orbit: 0ms;
    --duration-breathe: 0ms;
    --duration-skeleton: 0ms;  /* No shimmer */
    --duration-counter: 0ms;   /* Instant number swap */
    --duration-live-pulse: 0ms; /* Static dot */
  }

  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

**JavaScript implementation:**
```typescript
// useReducedMotion() hook returns true when reduced motion is active
// All Framer Motion variants check this and remap to instant transitions
const prefersReducedMotion = useReducedMotion();

const transition = prefersReducedMotion
  ? { duration: 0 }
  : SPRING_PRESETS.default;
```

### 13.3 Vestibular Safety

| Risk | Mitigation |
|---|---|
| **Parallax** | Maximum 8 px travel; only on hero surfaces; disabled under reduced motion |
| **Zoom animations** | Camera fly-to in Digital Twin disabled under reduced motion (instant teleport) |
| **Scale animations** | Maximum overshoot 8% (only `--ease-emphasized`); no spring overshoot > 12% |
| **Auto-playing motion** | Only: Halo Orb (disabled under RM), live-status dots (disabled under RM), skeleton shimmer (disabled under RM), catastrophic alert pulse (reduced to 1 Hz under RM) |
| **Full-viewport motion** | Never. Page transitions are opacity-only or minimal slide (16 px max travel) |

### 13.4 Keyboard Navigation

| Requirement | Implementation |
|---|---|
| **Focus ring visibility** | Instant appear (0 ms); never animated on focus-in. Focus ring fades on blur (120 ms) |
| **Focus order** | Matches DOM order; follows visual reading order |
| **Skip links** | First tab stop; transitions page focus without animation |
| **Trapped focus (modal)** | Focus cycles within modal/palette/sheet; no escape except Esc key |
| **Arrow key navigation** | Table cells, timeline items, palette results — instant highlight move (no animation) |

### 13.5 Screen Readers

| Context | ARIA | Motion Behavior |
|---|---|---|
| **Toasts** | `role="status"` (polite) | Announced without interruption |
| **Critical alerts** | `role="alert"` (assertive) | Announced immediately; interrupts other speech |
| **AI streaming** | `role="log"` (polite) | Announced in batches (not per-token) |
| **Chart updates** | `aria-describedby` to hidden table | No announcement on animation; table always current |
| **Counter changes** | `aria-live="polite"` on KPI containers | Announced after value settles (240 ms debounce) |
| **Loading states** | `aria-busy="true"` on loading region | Announced on transition to loaded |

### 13.6 Focus Visibility

- Focus rings use `--brand-500` color with `--shadow-focus` (3 px outer glow)
- Destructive-context focus uses `--shadow-focus-danger`
- High-contrast mode increases ring width to 3 px inner + 3 px outer
- Focus ring never clips behind adjacent elements (z-index managed)

### 13.7 Motion Alternatives

Every animated behavior has a non-motion alternative:

| Animation | Non-Motion Alternative |
|---|---|
| Counter tick | Instant value display |
| Chart path draw | Instant full chart render |
| Card stagger | All cards appear simultaneously |
| Skeleton shimmer | Static gray placeholder |
| Orb rotation | Static gradient |
| Page transition | Instant page swap |
| Notification slide | Instant appear |
| Tooltip fade | Instant appear (still has delay) |

---

## 14. Performance Budget

### 14.1 Maximum Animation Durations

| Category | Max Duration | Exception |
|---|---|---|
| **Micro-interaction (T1)** | 160 ms | None |
| **Component animation (T2)** | 320 ms | None |
| **Composition animation (T3)** | 480 ms | Stagger total may reach 600 ms |
| **Navigation animation (T4)** | 320 ms | None |
| **Cinematic animation (T5)** | 960 ms | Onboarding sequences may reach 2400 ms (Orb) |
| **Any non-cinematic animation** | 480 ms | Absolute cap |
| **Total stagger** | 600 ms | Absolute cap |

### 14.2 GPU Usage

| Constraint | Budget |
|---|---|
| **Animated properties (GPU-composited only)** | `opacity`, `transform` (translate, scale, rotate) only. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, `font-size`, `color`, `background-color` directly (use CSS custom properties or Framer Motion's `style` with GPU-composited equivalents). |
| **GPU layers** | Maximum 20 concurrent promoted layers. The Halo Orb, modal backdrop, and sheet overlay each consume 1 layer. Cards in a grid share a single compositing layer. |
| **Digital Twin GPU** | ≤ 100K triangles + 500 dynamic entities at 60 fps. LOD swap at distance. Fallback to 2D floor plan on GPU-limited devices. |
| **Paint operations** | Backdrop-filter (blur) limited to modal/palette backdrops. Never blur more than 1 surface simultaneously. |

### 14.3 CPU Usage

| Constraint | Budget |
|---|---|
| **JavaScript animation frames** | Maximum 5 concurrent Framer Motion/GSAP animations ticking on `requestAnimationFrame`. Excess animations are batched. |
| **React re-renders during animation** | Animation state changes must not trigger React re-renders of non-animated subtrees. Use `motion.div` values and `useTransform` to keep animations in the compositing layer. |
| **Force-directed simulation** | Knowledge Graph and network graphs run simulation in `requestAnimationFrame` with max 60 iterations. Offload to Web Worker if node count > 200. |
| **Counter interpolation** | `AnimatedNumber` uses `requestAnimationFrame` with a single shared RAF loop for all visible counters. |

### 14.4 Repaint Cost

| Constraint | Budget |
|---|---|
| **Layout-triggering animations** | Strictly prohibited. No animations that change element geometry (`width`, `height`, `margin`, `padding`, `border-width`). Height-morph animations use `max-height` or Framer Motion's `AnimatePresence` with `layout` prop. |
| **Paint-triggering animations** | `background-color`, `box-shadow`, `border-color` transitions are permitted but must not exceed 2 concurrent paint-triggering animations per viewport. |
| **Skeleton shimmer** | Uses `background-position` animation on a fixed gradient — single paint, no layout. |

### 14.5 Layout Shifts

| Constraint | Budget |
|---|---|
| **CLS budget** | ≤ 0.05 per page. Animations must not contribute to CLS. |
| **Content-aware layout** | All skeleton shapes match final content dimensions within 4 px tolerance. |
| **Font loading** | `font-display: swap` with `size-adjust` to eliminate FOUT layout shift. |
| **Image/media** | Aspect ratio preserved via `aspect-ratio` CSS or explicit `width`/`height` attributes. |
| **Dynamic content** | Late-arriving content (lazy-loaded, real-time) must not push existing content. Use reserved space or append-only patterns. |

### 14.6 Frame Drops

| Constraint | Budget |
|---|---|
| **Target frame rate** | 60 fps for all UI animations. 30 fps acceptable for Digital Twin on mid-tier hardware. |
| **Max frame budget** | 16.67 ms per frame. Animations that exceed this trigger a console warning in development. |
| **Janky frame tolerance** | ≤ 2 dropped frames per animation. If an animation consistently drops > 2 frames, it must be simplified or removed. |
| **Monitoring** | `PerformanceObserver` monitors long animation frames in production. Telemetry reports p95 frame durations per animation. |

### 14.7 Memory Usage

| Constraint | Budget |
|---|---|
| **Animation state** | Maximum 2 MB heap for active animation states (Framer Motion + GSAP combined). |
| **Cached animation data** | Counter intermediate values, spring simulations, and gesture state must not exceed 500 KB. |
| **Three.js scene** | ≤ 150 MB GPU memory (textures + geometry + render targets). |
| **Cleanup** | All animation subscriptions, RAF loops, and gesture listeners must be cleaned up on component unmount. Memory leak detection runs in CI via `@testing-library/react` cleanup assertions. |

### 14.8 Three.js Budget

| Constraint | Budget |
|---|---|
| **Triangle count** | ≤ 100K triangles on screen (LOD-managed) |
| **Dynamic entities** | ≤ 500 (workers, vehicles, sensors with live position) |
| **Draw calls** | ≤ 200 per frame (instanced mesh for repeated equipment) |
| **Texture memory** | ≤ 64 MB VRAM for all loaded textures |
| **Shader complexity** | Maximum 2 custom shaders (Halo glow, flow-line); all others use standard PBR |
| **Post-processing** | Single pass: FXAA + ambient occlusion. No bloom except on Halo Orb. |
| **Frame rate** | ≥ 60 fps on 2019+ discrete GPU; ≥ 30 fps on integrated GPU; 2D fallback below 30 fps |

### 14.9 Framer Motion Budget

| Constraint | Budget |
|---|---|
| **Concurrent animations** | ≤ 20 active `motion.div` instances animating simultaneously |
| **Layout animations** | ≤ 5 concurrent `layout` or `layoutId` animations (expensive) |
| **Gesture handlers** | ≤ 10 active `drag`/`whileHover`/`whileTap` listeners |
| **AnimatePresence** | Maximum 3 nested `AnimatePresence` components (page → modal → tooltip) |
| **Bundle impact** | Framer Motion is the primary animation library. Tree-shake unused features. Target ≤ 25 KB gzipped contribution. |

### 14.10 GSAP Usage Rules

| Rule | Detail |
|---|---|
| **Scope** | GSAP is permitted ONLY for: (1) Halo Orb ambient motion, (2) Digital Twin camera animations, (3) Situation Room hero KPI reveals |
| **No GSAP for** | Standard UI animations, page transitions, component animations, or any interaction that Framer Motion can handle |
| **Rationale** | GSAP provides superior performance for continuous animations (Orb rotation) and Three.js camera integration. Framer Motion handles React-integrated animations with superior DX. |
| **Bundle** | GSAP core only (no plugins except ScrollTrigger for hero sections). Target ≤ 30 KB gzipped. |
| **Cleanup** | All GSAP timelines must call `kill()` on component unmount. |

---

## 15. Technology Mapping

### 15.1 Technology Selection Matrix

| Animation Context | Primary Technology | Rationale |
|---|---|---|
| **Page transitions** | Framer Motion (`AnimatePresence`, `motion.div`) | React-integrated; supports `mode="wait"` for route transitions |
| **Component animations** | Framer Motion (variants, `animate`, `whileHover`, `whileTap`) | Declarative API; gesture support; reduced-motion aware |
| **Layout animations** | Framer Motion (`layout`, `layoutId`) | Automatic layout animation; shared element transitions |
| **Spring physics** | Framer Motion (spring type) | Built-in spring simulation; configurable presets |
| **CSS state transitions** | CSS Transitions + CSS Custom Properties | Hover tints, focus rings, border colors — no JS needed |
| **Skeleton shimmer** | CSS `@keyframes` + CSS Custom Properties | Pure CSS; no JS overhead; GPU-composited |
| **Number interpolation** | Custom hook (`useAnimatedNumber`) with `requestAnimationFrame` | Fine-grained control; shared RAF loop; tabular-nums |
| **Halo Orb ambient** | GSAP (`gsap.to` with `repeat: -1`) | Superior continuous animation performance; no React re-render |
| **Halo Orb state transitions** | Framer Motion | React state-driven; composable with GSAP ambient |
| **Digital Twin cameras** | GSAP (`gsap.to` on Three.js camera) | Direct Three.js object manipulation; timeline control |
| **Digital Twin scene** | Three.js + custom shaders | WebGL rendering; LOD; instancing |
| **Chart animations** | Framer Motion (SVG paths) OR Visx/D3 transitions | SVG path animation; data-driven transitions |
| **React Flow** | React Flow built-in animations + Framer Motion overlays | React Flow handles node/edge; FM for overlays |
| **Geospatial** | deck.gl transitions + MapLibre GL transitions | Built-in fly-to, layer transitions |
| **Toast animations** | Framer Motion (`AnimatePresence` + spring) | Stack management; spring settle |
| **Drag and drop** | Framer Motion (`drag`, `Reorder`) or `@dnd-kit` | Gesture-integrated; spring physics |
| **Form animations** | Framer Motion (`AnimatePresence` for conditional fields) | Height morphs; error reveals |
| **Reduced motion** | CSS `@media (prefers-reduced-motion)` + `useReducedMotion()` hook | Dual-layer: CSS for transitions, JS for Framer Motion |
| **Progress indicators** | CSS `@keyframes` (indeterminate) / inline style (determinate) | No JS for indeterminate; minimal JS for determinate |
| **Video wall / control room** | CSS Transitions only (no JS animation libraries) | Maximum performance; minimal overhead |

### 15.2 Technology by Surface

| Surface | Technologies |
|---|---|
| **App Shell** | CSS Transitions (sidebar width, shadow); Framer Motion (content transitions) |
| **Topbar** | CSS Transitions (shadow, border); Framer Motion (breadcrumb, badge) |
| **Command Palette** | Framer Motion (open/close, results list, AI streaming) |
| **Halo Orb** | GSAP (ambient rotation, breathe); Framer Motion (state transitions); optional Three.js shader (hero 96px) |
| **AI Reasoning Panel** | Framer Motion (timeline steps, streaming text, tool traces) |
| **Dashboard** | Framer Motion (card stagger, KPI counters); CSS (hover tints) |
| **Charts** | Framer Motion (SVG paths) + Visx/D3 (data interpolation) |
| **Tables** | CSS Transitions (row hover, cell highlight); Framer Motion (skeleton, sort, bulk bar) |
| **Forms** | Framer Motion (conditional fields, step transitions, validation reveals) |
| **Modals/Sheets** | Framer Motion (scale, slide, backdrop); Radix UI (focus trap, portal) |
| **Toasts** | Framer Motion (spring entry, stack management, dismiss) |
| **Digital Twin** | Three.js (scene rendering); GSAP (camera); Framer Motion (UI overlays) |
| **Maps** | deck.gl (layer transitions); MapLibre GL (fly-to); Framer Motion (UI panels) |
| **React Flow** | React Flow (node/edge layout); Framer Motion (overlays, workflow highlights) |
| **Mobile** | Framer Motion (sheet, gesture); CSS Transitions (minimal overhead) |
| **Wall Display** | CSS Transitions only (performance-critical; no JS animation) |

### 15.3 Radix + shadcn/ui Integration

Radix UI primitives handle accessibility (focus trap, portal, dismiss) while Framer Motion handles animation:

```typescript
// Pattern: Radix Dialog + Framer Motion animation
<Dialog.Root>
  <Dialog.Portal>
    <Dialog.Overlay asChild>
      <motion.div {...OPACITY.backdrop} />
    </Dialog.Overlay>
    <Dialog.Content asChild>
      <motion.div {...SCALE.modal} />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

This pattern applies to: Dialog, Sheet, Popover, Tooltip, DropdownMenu, ContextMenu, AlertDialog, Select, Command.

### 15.4 Tailwind CSS Integration

Motion tokens are exposed as Tailwind utilities via `@safetyos/design-tokens` Tailwind plugin:

```css
/* Generated Tailwind utilities */
.duration-fast { transition-duration: var(--duration-fast); }
.duration-moderate { transition-duration: var(--duration-moderate); }
.ease-standard { transition-timing-function: var(--ease-standard); }
.ease-entrance { transition-timing-function: var(--ease-entrance); }
/* etc. */
```

Tailwind is used for simple CSS transitions (hover tints, focus rings, border colors). Complex animations use Framer Motion directly.

---

## 16. Reusable Motion Components

### 16.1 Component Specifications

Every motion component is exported from `@safetyos/ui` (the Halo component library) and from `@safetyos/design-system/packages/motion`.

#### `<PageTransition>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `direction` | `"forward" \| "backward" \| "none"` | `"none"` | Determines slide direction for drill navigation |
| `mode` | `"wait" \| "sync"` | `"wait"` | AnimatePresence mode |
| `reducedMotion` | `boolean` | Auto-detected | Override reduced motion |

**Behavior:** Wraps route `<Outlet>`. Applies fade (default) or slide-fade (drill) transitions per §5.1/§5.2. Shows top progress bar during transition.

#### `<AnimatedCounter>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | Required | Target value |
| `duration` | `number` | `240` | Animation duration in ms |
| `format` | `(v: number) => string` | `toLocaleString` | Value formatter |
| `decimals` | `number` | `0` | Decimal places |

**Behavior:** Interpolates from previous value to new value using slot-machine digit animation. Uses `tabular-nums`. Under reduced motion: instant swap.

#### `<AnimatedNumber>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | Required | Target value |
| `precision` | `number` | `0` | Decimal precision |
| `prefix` | `string` | `""` | Currency/unit prefix |
| `suffix` | `string` | `""` | Unit suffix |

**Behavior:** Lightweight version of `<AnimatedCounter>` for inline use. Same interpolation logic.

#### `<AnimatedProgress>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | Required | 0–100 |
| `variant` | `"linear" \| "radial"` | `"linear"` | Shape |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `intent` | `Intent` | `"brand"` | Color |
| `indeterminate` | `boolean` | `false` | Indeterminate mode |

**Behavior:** Determinate: bar/ring fills proportionally with 240 ms interpolation. Indeterminate: sweeping animation. Complete: green flash + check.

#### `<AnimatedBadge>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | Required | Badge count |
| `max` | `number` | `99` | Max display (shows "99+") |
| `intent` | `Intent` | `"critical"` | Color |

**Behavior:** Count changes animate with scale-pop (0.9→1) + number interpolation. Badge appears with chip-pop when count goes from 0→1. Disappears with fade when count goes to 0.

#### `<AnimatedCard>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `layoutId` | `string` | `undefined` | For shared element transitions |
| `staggerIndex` | `number` | `undefined` | Position in stagger sequence |
| `variant` | `CardVariant` | `"default"` | Card type |

**Behavior:** Entry: fade + translateY(4px), staggered by index. Hover: elevation +1, translateY(-2px). Press: scale(0.99). Supports `layoutId` for card→detail shared transitions.

#### `<AnimatedDrawer>` / `<AnimatedSheet>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `"right" \| "bottom"` | `"right"` | Attach side |
| `width` | `number` | `480` | Width (right) |
| `height` | `string` | `"60vh"` | Height (bottom) |
| `onClose` | `() => void` | Required | Close handler |

**Behavior:** Slide + fade entry/exit per §4.8. Drag-to-dismiss on mobile. Sheet replacement uses lateral slide.

#### `<AnimatedSidebar>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `collapsed` | `boolean` | `false` | Collapsed state |
| `onToggle` | `() => void` | Required | Toggle handler |

**Behavior:** Width morph 240↔64 px; label fade; active accent bar slide. Per §4.5.

#### `<AnimatedTabs>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `activeIndex` | `number` | `0` | Active tab |
| `onChange` | `(i: number) => void` | Required | Change handler |

**Behavior:** Active indicator slides via `layoutId`. Content cross-fades. Per §4.9.

#### `<AnimatedTable>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `loading` | `boolean` | `false` | Show skeletons |
| `data` | `T[]` | `[]` | Table data |

**Behavior:** Loading: 12 skeleton rows, stagger 30 ms. Content: skeleton→content transition. Row hover/select per §4.17.

#### `<AnimatedChart>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `ChartType` | Required | Chart type |
| `data` | `ChartData` | Required | Data |
| `animate` | `boolean` | `true` | Enable animation |

**Behavior:** Wraps chart library with standardized enter/update/exit animations per §10.

#### `<AnimatedTimeline>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `TimelineEvent[]` | `[]` | Events |
| `live` | `boolean` | `false` | Enable live append animation |

**Behavior:** Staggered entry per §4.11. Live mode: new events slide from top. Expandable detail per event.

#### `<AnimatedGraph>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `nodes` | `Node[]` | `[]` | Graph nodes |
| `edges` | `Edge[]` | `[]` | Graph edges |
| `layout` | `"force" \| "dagre" \| "tree"` | `"force"` | Layout algorithm |

**Behavior:** Nodes fade in; force simulation runs; edges draw (streamline). Per §10.7.

#### `<AnimatedMap>`

Wrapper around MapLibre GL + deck.gl with standardized layer transitions, fly-to, and marker animations per §10.11.

#### `<AnimatedNotification>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `intent` | `Intent` | Required | Severity |
| `onDismiss` | `() => void` | Required | Dismiss handler |

**Behavior:** Entry: slide from top + fade. Critical: pulse. Per §4.20.

#### `<AnimatedToast>`

Managed by a `<ToastProvider>` that handles stack, auto-dismiss, and max count per §4.21.

#### `<AnimatedTooltip>`

Wraps Radix Tooltip with Framer Motion animation per §4.15. Supports interactive mode.

#### `<AnimatedSearch>`

Search input with expanding width, result streaming, and loading states per §4.16.

#### `<AnimatedCommandPalette>`

Full command palette with backdrop, result stagger, AI streaming, and sub-palette transitions per §4.23.

#### `<AnimatedHaloOrb>`

The Halo Orb component with all states per §7.2. Manages GSAP ambient loop + Framer Motion state transitions.

#### `<AnimatedReasoningTimeline>`

Vertical stepper that streams reasoning steps per §7.9. Supports expand/collapse, streamline connections, and active step indication.

#### `<AnimatedStreamingText>`

Token-by-token text reveal for AI responses per §7.10. Supports inline citations, code blocks, and action buttons.

#### `<AnimatedConfidenceChip>`

Confidence visualization chip per §7.8. Color-coded, animated fill changes, expandable to citation popover.

#### `<AnimatedDigitalTwinOverlay>`

Screen-space overlay for Digital Twin AI analysis per §9.8. Floating nodes, animated connections, annotation cards.

#### `<AnimatedRiskOverlay>`

Risk heatmap overlay for Digital Twin and maps per §9.6. Alpha-blended intent colors, interpolated updates.

#### `<AnimatedIncidentPlayback>`

Replay controls + synchronized scene management per §9.7. Timeline scrubber, event markers, playback controls.

---

## 17. Motion Do's and Don'ts

### 17.1 Mandatory Rules (MUST)

| # | Rule | Rationale |
|---|---|---|
| M1 | **MUST** respect `prefers-reduced-motion` globally | Vestibular safety; WCAG compliance |
| M2 | **MUST** render safety-critical alerts with 0 ms delay | Life-safety; no animation may delay emergency information |
| M3 | **MUST** provide instant feedback (≤ 50 ms) for all direct manipulations | Perceived responsiveness |
| M4 | **MUST** use only the nine motion primitives defined in §2.2 | Consistency; predictability |
| M5 | **MUST** use tokens from `@safetyos/design-tokens` for all durations, easings, springs | No hardcoded values; centralized control |
| M6 | **MUST** keep total animation duration ≤ 480 ms (non-cinematic) | Cognitive load; user patience threshold |
| M7 | **MUST** clean up all animation subscriptions on component unmount | Memory safety |
| M8 | **MUST** maintain 60 fps during all UI animations | Performance quality |
| M9 | **MUST** ensure CLS ≤ 0.05 contribution from animations | Layout stability |
| M10 | **MUST** pair `--intent-critical` and `--intent-catastrophic` motion with icon + text (never motion alone) | Accessibility; color independence |
| M11 | **MUST** animate only GPU-composited properties (`opacity`, `transform`) for T1/T2 animations | Performance; no forced reflow |
| M12 | **MUST** batch real-time updates within 100 ms windows | Flicker prevention |
| M13 | **MUST** show skeletons within 100 ms of any data request | Perceived performance |
| M14 | **MUST** never suppress or delay emergency action buttons with animation | Zero-delay emergency response |
| M15 | **MUST** provide `aria-live` regions for all animated state changes that convey information | Screen reader accessibility |

### 17.2 Prohibited Patterns (MUST NOT)

| # | Rule | Rationale |
|---|---|---|
| P1 | **MUST NOT** animate layout properties (`width`, `height`, `margin`, `padding`) without Framer Motion's `layout` prop or `max-height` technique | Forced reflow; performance degradation |
| P2 | **MUST NOT** use bounce easing in enterprise workflows | Unprofessional perception; cognitive noise |
| P3 | **MUST NOT** use elastic overshoot > 8% on any element | Vestibular discomfort; imprecise feeling |
| P4 | **MUST NOT** loop animations indefinitely except: Halo Orb idle, live-status dots, skeleton shimmer, streaming indicators, `--intent-catastrophic` alerts | Cognitive distraction; accessibility violation |
| P5 | **MUST NOT** auto-play animations on page load (except loading states and sanctioned live indicators) | Unexpected motion; accessibility violation |
| P6 | **MUST NOT** flash content > 3 Hz | WCAG 2.3.1; seizure risk |
| P7 | **MUST NOT** use parallax scrolling beyond hero surfaces (max 8 px travel) | Vestibular safety |
| P8 | **MUST NOT** animate safety-critical alerts with entry durations > 80 ms | Life-safety response time |
| P9 | **MUST NOT** delay emergency buttons (SOS, Evacuate, Declare Emergency) with any animation | Zero-delay emergency response |
| P10 | **MUST NOT** use decorative animation that doesn't serve spatial orientation, state communication, attention direction, or perceived performance | Motion philosophy violation |
| P11 | **MUST NOT** open a modal from within a modal | UX anti-pattern; use sheet-in-modal or inline step |
| P12 | **MUST NOT** use `transition: all` in CSS | Performance; unexpected property animation |
| P13 | **MUST NOT** use GSAP for standard UI animations (reserved for Orb, Twin camera, hero KPIs) | Bundle discipline; architectural boundary |
| P14 | **MUST NOT** animate the Topbar off-screen on scroll | Safety-critical context always visible |
| P15 | **MUST NOT** use `spring` with `damping < 15` (too bouncy) | Enterprise quality; vestibular safety |

### 17.3 Recommendations (SHOULD)

| # | Rule | Rationale |
|---|---|---|
| R1 | **SHOULD** prefer fade-only for T1/T2 animations (simplest, fastest, most accessible) | Minimal cognitive load |
| R2 | **SHOULD** use `SPRING_PRESETS.default` as the first choice for physics-based motion | Consistency |
| R3 | **SHOULD** stagger sibling elements rather than animating them simultaneously (more natural) | Visual rhythm |
| R4 | **SHOULD** use shared element transitions (`layoutId`) for card→detail navigation | Spatial anchoring |
| R5 | **SHOULD** preload route data on 200 ms hover intent | Perceived performance |
| R6 | **SHOULD** animate counter changes (not instant swap) for KPI surfaces | Premium feel; change detection |
| R7 | **SHOULD** use optimistic UI for all user write actions with > 90% success rate | Perceived speed |
| R8 | **SHOULD** provide undo via toast rather than confirmation dialog for reversible actions | Faster workflow; reduced friction |
| R9 | **SHOULD** cross-fade rather than hard-cut when replacing content | Smoother perceived transition |
| R10 | **SHOULD** reserve cinematic motion (T5) for the Halo Orb, Digital Twin, and Situation Room | Signal-to-noise ratio |

---

## 18. Engineering Guidelines

### 18.1 Folder Structure

```
packages/
├── motion/                             # @safetyos/motion
│   ├── src/
│   │   ├── tokens/
│   │   │   ├── durations.ts           # Duration token constants
│   │   │   ├── easings.ts             # Easing token constants
│   │   │   ├── springs.ts            # Spring preset configurations
│   │   │   ├── delays.ts             # Delay token constants
│   │   │   ├── entry.ts              # Entry animation variants
│   │   │   ├── exit.ts               # Exit animation variants
│   │   │   ├── opacity.ts            # Opacity transition variants
│   │   │   ├── scale.ts              # Scale transition variants
│   │   │   ├── blur.ts               # Blur transition variants
│   │   │   ├── rotation.ts           # Rotation animation variants
│   │   │   └── index.ts              # Barrel export
│   │   ├── hooks/
│   │   │   ├── useReducedMotion.ts    # Reduced motion detection + user pref
│   │   │   ├── useAnimatedNumber.ts   # Number interpolation hook
│   │   │   ├── useStagger.ts          # Stagger delay calculator
│   │   │   ├── useMotionConfig.ts     # Access global motion configuration
│   │   │   ├── useAnimateOnMount.ts   # One-time entry animation
│   │   │   └── useSafetyCritical.ts   # Safety-critical animation override
│   │   ├── components/
│   │   │   ├── PageTransition.tsx
│   │   │   ├── AnimatedCounter.tsx
│   │   │   ├── AnimatedNumber.tsx
│   │   │   ├── AnimatedProgress.tsx
│   │   │   ├── AnimatedBadge.tsx
│   │   │   ├── AnimatedCard.tsx
│   │   │   ├── AnimatedDrawer.tsx
│   │   │   ├── AnimatedSidebar.tsx
│   │   │   ├── AnimatedTabs.tsx
│   │   │   ├── AnimatedTable.tsx
│   │   │   ├── AnimatedChart.tsx
│   │   │   ├── AnimatedTimeline.tsx
│   │   │   ├── AnimatedGraph.tsx
│   │   │   ├── AnimatedMap.tsx
│   │   │   ├── AnimatedNotification.tsx
│   │   │   ├── AnimatedToast.tsx
│   │   │   ├── AnimatedTooltip.tsx
│   │   │   ├── AnimatedSearch.tsx
│   │   │   ├── AnimatedCommandPalette.tsx
│   │   │   ├── AnimatedHaloOrb.tsx
│   │   │   ├── AnimatedReasoningTimeline.tsx
│   │   │   ├── AnimatedStreamingText.tsx
│   │   │   ├── AnimatedConfidenceChip.tsx
│   │   │   ├── AnimatedDigitalTwinOverlay.tsx
│   │   │   ├── AnimatedRiskOverlay.tsx
│   │   │   ├── AnimatedIncidentPlayback.tsx
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   └── MotionProvider.tsx      # Global motion context (reduced motion, config)
│   │   ├── utils/
│   │   │   ├── resolveTransition.ts   # Resolves transition based on reduced motion
│   │   │   ├── staggerChildren.ts     # Calculates stagger delays
│   │   │   └── safetyCriticalGuard.ts # Cancels animations when safety event fires
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
```

### 18.2 Animation Ownership

| Domain | Owner | Components |
|---|---|---|
| **Core motion tokens** | Design Systems team | All token files |
| **Shell animations** | Shell team | PageTransition, AnimatedSidebar, AnimatedTabs |
| **AI animations** | AI Platform team | AnimatedHaloOrb, AnimatedReasoningTimeline, AnimatedStreamingText, AnimatedConfidenceChip |
| **Dashboard animations** | Dashboard team | AnimatedCounter, AnimatedChart, AnimatedCard |
| **Digital Twin animations** | Twin team | AnimatedDigitalTwinOverlay, AnimatedRiskOverlay, AnimatedIncidentPlayback |
| **Form animations** | Forms team | Form-related motion in AnimatedDrawer, conditional fields |
| **Table animations** | Data team | AnimatedTable |
| **Notification/Toast** | Notification team | AnimatedNotification, AnimatedToast |
| **Map animations** | Geospatial team | AnimatedMap |
| **Graph animations** | Knowledge team | AnimatedGraph |

### 18.3 Shared Motion Library

The `@safetyos/motion` package is the single source of truth for all animation code:

- All motion tokens, hooks, components, and utilities live here
- No animation logic is permitted in feature-level code — only composition of motion components and tokens
- Feature teams consume `@safetyos/motion` as a dependency
- Changes to motion tokens require an RFC and design review

### 18.4 Testing

| Test Type | Tool | Scope |
|---|---|---|
| **Unit tests** | Vitest + React Testing Library | Hook behavior, token values, reduced motion logic |
| **Integration tests** | Playwright | Page transitions, form animations, toast sequences |
| **Visual regression** | Chromatic (Storybook) | All motion component states (static snapshots of start/mid/end states) |
| **Performance tests** | Lighthouse CI + custom PerformanceObserver | Frame rate, CLS, animation duration compliance |
| **Accessibility tests** | axe-core + manual screen reader testing | Reduced motion compliance, ARIA live regions |
| **Reduced motion tests** | Playwright with `prefers-reduced-motion` emulation | All animations degrade correctly |

### 18.5 Storybook

Every motion component has Storybook stories covering:

1. **All states** — rest, hover, press, focus, loading, success, error, disabled
2. **Entry/exit** — visible animation in Storybook canvas
3. **Reduced motion** — toggle via Storybook addon
4. **Dark mode** — both themes
5. **Interactive** — click/hover/drag to trigger animations
6. **Performance** — fps counter overlay for complex animations

Story naming convention: `Motion/Components/AnimatedCard`, `Motion/Tokens/Springs`

### 18.6 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Token constant** | `SCREAMING_SNAKE_CASE` | `SPRING_PRESETS`, `OPACITY`, `EXIT` |
| **Token CSS variable** | `--kebab-case` | `--duration-fast`, `--ease-standard` |
| **Component** | `PascalCase` with `Animated` prefix | `AnimatedCard`, `AnimatedHaloOrb` |
| **Hook** | `camelCase` with `use` prefix | `useReducedMotion`, `useAnimatedNumber` |
| **Variant key** | `camelCase` | `slideFromRight`, `chipPop`, `scaleIn` |
| **Spring preset** | `camelCase` | `default`, `gentle`, `snappy`, `bouncy`, `heavy`, `orb`, `critical` |
| **Stagger token** | `--stagger-{context}` | `--stagger-card`, `--stagger-table-row` |

### 18.7 Versioning

- Motion tokens follow semver with the `@safetyos/design-tokens` package
- Breaking changes to motion tokens (e.g., changing `--duration-fast` from 120 ms to 100 ms) require:
  1. RFC in `/rfcs`
  2. 2-minor-cycle deprecation warning
  3. Migration codemod
  4. Visual regression review
- New motion components are added as minor versions
- Bug fixes and performance improvements are patch versions

### 18.8 Code Organization Rules

1. All animation values must reference tokens — no magic numbers
2. All Framer Motion `transition` objects must be constructed from token presets
3. `useReducedMotion()` must be checked in every animated component
4. GSAP usage requires explicit approval comment: `// GSAP-APPROVED: [reason]`
5. All `useEffect` cleanup must kill GSAP timelines and cancel RAF loops
6. Animation components must accept `className` and `style` for composition
7. Animation components must forward refs
8. Animation components must be tree-shakeable (named exports, no side effects)

---

## 19. Screen-by-Screen Motion Matrix

### 19.1 Matrix Format

For each screen, the following motion behaviors are specified:

- **Entry** — How the page enters the viewport
- **Exit** — How the page leaves the viewport
- **Loading** — Skeleton/loading behavior
- **Error** — Error state animation
- **Hover** — Hover interactions on the page
- **Click** — Click/press interactions
- **Real-time** — Live data update behavior
- **Notifications** — In-page notification behavior
- **AI** — AI interaction animations
- **Charts** — Chart-specific animation
- **Tables** — Table-specific animation
- **Twin** — Digital Twin behavior (if applicable)
- **Mobile** — Mobile-specific adaptations
- **Reduced Motion** — Behavior under `prefers-reduced-motion`

### 19.2 Shared Surfaces

#### App Shell (`global`)
| Aspect | Behavior |
|---|---|
| Entry | Instant (SSR); no animation |
| Exit | N/A (persistent) |
| Loading | Shell skeleton within 100 ms; content regions load independently |
| Error | Failed region shows error state; shell remains navigable |
| Hover | Rail items: bg tint 120 ms; topbar items: standard hover |
| Click | Rail: active accent slides (120 ms); topbar: per-component |
| Real-time | Status pill updates (200 ms cross-fade); notification badge (160 ms scale-pop) |
| Notifications | Bell badge animates; notification sheet slides from right |
| AI | Halo Orb ambient in topbar; dock opens as right sheet |
| Charts | N/A |
| Tables | N/A |
| Twin | N/A |
| Mobile | Bottom tab bar; hamburger drawer; bottom sheets |
| Reduced Motion | Instant state swaps; no rail width animation; no badge scale |

#### Topbar & Scope Selector (`global/topbar`)
| Aspect | Behavior |
|---|---|
| Entry | Instant (persistent) |
| Exit | N/A |
| Loading | Breadcrumb skeletons; notification count skeleton |
| Error | Degraded pill shows "Limited data"; retains navigation |
| Hover | Items: bg tint 120 ms; search field: width expand on focus |
| Click | Scope: chip chain cross-fade (160 ms); persona tabs: indicator slide |
| Real-time | Status pill cross-fade; badge count scale-pop |
| Reduced Motion | Instant cross-fades; no width animations |

#### Command Palette (`/search?mode=command`)
| Aspect | Behavior |
|---|---|
| Entry | Scale 0.98→1 + fade from top-16 px + backdrop blur (200 ms) |
| Exit | Scale + fade + backdrop (160 ms) |
| Loading | Skeleton result rows with shimmer |
| Error | Error message cross-fades into result area |
| Hover | Row bg tint (80 ms) |
| Click | Execute: palette exit 160 ms + success toast |
| AI | ! prefix: streaming inline response; reasoning steps stagger |
| Reduced Motion | Instant appear/disappear; no scale; no backdrop blur |

#### Halo Orb & AI Dock (`global/ai-dock`)
| Aspect | Behavior |
|---|---|
| Entry | Dock: slide from right + fade (320 ms) |
| Exit | Slide right + fade (200 ms) |
| Loading | Streaming-first; thinking dots; tool trace skeletons |
| Error | Orb red tint + shake; error chip in thread |
| Hover | Orb hover: brightens 10% (120 ms) |
| Click | Orb click: dock opens; thread loads |
| AI | Full Orb state machine per §7.2; reasoning timeline per §7.9; streaming per §7.10 |
| Reduced Motion | Static Orb gradient; no rotation/breathe; state via color only |

### 19.3 Auth Surfaces

#### Sign-in (`/auth/signin`)
| Aspect | Behavior |
|---|---|
| Entry | Card fade + scale 0.98→1 (160 ms); optional gradient hero panel on wide screens |
| Exit | Card fade (120 ms) |
| Loading | Button inline spinner on submit |
| Error | Inline field errors (slide down 200 ms); form banner for general errors |
| Hover | Button/input standard hover |
| Click | Button press + loading + success/error sequence |
| Mobile | Single column; 44 px+ targets; virtual keyboard safe |
| Reduced Motion | Instant card appear; no scale |

#### MFA Challenge (`/auth/mfa`)
| Aspect | Behavior |
|---|---|
| Entry | Card fade + scale 0.98→1 (160 ms) |
| Exit | Card fade (120 ms) |
| Loading | Code verification inline spinner |
| Error | Code field shakes (8 px, 2 cycles) on wrong code; error text fades in |
| Mobile | Single column; large code input |
| Reduced Motion | No shake; error text appears instantly |

### 19.4 Operations Live

#### Command Console L1 (`/console`)
| Aspect | Behavior |
|---|---|
| Entry | KPI strip staggers in (60 ms); event feed slides from right; tiles fade in |
| Exit | Fade (80 ms) |
| Loading | KPI skeletons; event feed skeletons; tile skeletons |
| Error | Failed region: error state; others continue |
| Hover | KPI card: elevation +1; event row: bg tint; tile: subtle brighten |
| Click | Tile: drill-down slide (200 ms); alarm: ACK ripple; KPI: detail navigate |
| Real-time | Counter interpolation (240 ms); event feed prepend (200 ms slide); tile status color transition (200 ms) |
| Notifications | Critical: interstitial overlay; normal: feed prepend |
| AI | Top deviation summary; confidence chip; drill-down suggestion |
| Charts | Risk matrix: §10.15; trend strips: §10.1 |
| Tables | Live event table: §4.17 with real-time row insert |
| Twin | N/A (link to Twin) |
| Mobile | Redirect to field-safe summary; priority KPIs only |
| Reduced Motion | Instant counter; no stagger; no slide; pulse reduced to 1 Hz for catastrophic |

#### Scoped Console (`/console/site/:id`, `/console/area/:id`, `/console/unit/:id`)
| Aspect | Behavior |
|---|---|
| Entry | Drill-down slide from right (200 ms) from L1 or parent console |
| Exit | Slide to left (drill deeper) or slide to right (drill up) |
| Loading | Scoped KPI skeletons; topology skeleton |
| Real-time | Same as L1 |
| Charts | Active work heatmap; risk matrix; permit load bar |
| Reduced Motion | Instant drill; no slide |

#### Asset Detail Console (`/console/asset/:id`)
| Aspect | Behavior |
|---|---|
| Entry | Shared element transition from asset tile/row (240 ms); or slide from right |
| Exit | Reverse shared element; or slide left |
| Loading | Hero skeleton; telemetry sparkline skeletons; alarm table skeleton |
| Real-time | Sparkline redraws (320 ms); alarm table row insert (200 ms) |
| Charts | Telemetry trends: §10.1; anomaly markers: chip-pop |
| Reduced Motion | Instant appear; no shared element transition |

#### Digital Twin 2D (`/twin`)
| Aspect | Behavior |
|---|---|
| Entry | Map tiles progressive load; markers fade in (200 ms); layer rail slides in |
| Exit | Fade (200 ms) |
| Loading | Tile placeholders; marker skeletons |
| Hover | Marker: expand to preview card (160 ms); zone: border highlight |
| Click | Object select: detail card (200 ms); zoom to: fly-to (480 ms) |
| Real-time | Worker positions interpolate (500 ms); sensor overlays update (200 ms) |
| AI | Risk cluster overlay; layer suggestions |
| Twin | Primary Twin surface; camera pan/zoom/fly-to per §9.1 |
| Mobile | Simplified 2D; larger toggles; tap instead of hover |
| Reduced Motion | No fly-to (instant snap); no marker interpolation; static overlays |

#### Digital Twin 3D (`/twin/3d`)
| Aspect | Behavior |
|---|---|
| Entry | Scene loads progressively (geometry → textures → overlays); UI fades in |
| Exit | Fade (200 ms) |
| Loading | Canvas placeholder; progressive scene hydration |
| Hover | Equipment: emissive brighten (120 ms); worker chip: name card |
| Click | Equipment select: glow + detail card per §9.2; bookmark: camera fly-to per §9.1 |
| Real-time | Flow lines animate continuously; sensor rings update (320 ms); worker positions interpolate |
| AI | Inference overlays per §9.8; narration |
| Twin | Full 3D experience per §9 |
| Mobile | 2D fallback on unsupported devices |
| Reduced Motion | No flow animation; no camera fly (snap); no ambient rotation |

#### Twin Replay (`/twin/replay`)
| Aspect | Behavior |
|---|---|
| Entry | "Live" → "Replay" indicator transition (200 ms); scrubber slides in |
| Real-time | All elements sync to scrub position; smooth interpolation |
| Twin | Full replay per §9.7; event markers; bookmarks |
| Reduced Motion | Scrubber snaps to keyframes; no smooth interpolation between frames |

#### Emergency Declare (`/emergency/declare`)
| Aspect | Behavior |
|---|---|
| Entry | INSTANT (0 ms) — safety-critical; no entry animation |
| Exit | Only after emergency is declared or cancelled |
| Loading | N/A — must render instantly from local cache |
| Click | Hold-to-confirm (500 ms radial fill); dual-confirm if required |
| Notifications | Full-viewport critical alert interstitial |
| Reduced Motion | Hold-to-confirm ring retains animation (functional); no other motion |

#### Emergency Active Command (`/emergency/active/:id`)
| Aspect | Behavior |
|---|---|
| Entry | Instant (0 ms) — safety-critical |
| Real-time | Muster count updates (counter tick); responder positions (map); status updates |
| Notifications | All alerts override other motion |
| Reduced Motion | Counter ticks instant; map snaps; status cross-fades 120 ms |

### 19.5 Work & Workflows

#### Permit Register (`/permits`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade (160 ms); table skeleton → content |
| Loading | 12 skeleton rows, stagger 30 ms |
| Hover | Row: bg tint; status chip: tooltip |
| Click | Row → detail sheet (slide right 320 ms); new permit button: standard press |
| Tables | Full table motion per §4.17; status chips use intent colors |
| Reduced Motion | Instant table; no stagger |

#### Permit Detail (`/permits/:id`)
| Aspect | Behavior |
|---|---|
| Entry | Sheet slide from right (320 ms); or shared element from register row |
| Exit | Sheet slide out (200 ms) |
| Loading | Form skeletons; evidence skeletons |
| Hover | Action buttons standard; related module links: peek popover |
| Click | Approve/reject: confirmation dialog; sign: signature pad |
| AI | Risk assessment insights; conflict check results stream |
| Tables | Evidence table; audit trail table |
| Reduced Motion | Instant sheet; no slide |

#### LOTO Board (`/loto`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; board layout with tag cards |
| Loading | Tag card skeletons |
| Hover | Tag card lift (120 ms) |
| Click | Tag → detail sheet; verify → zero-energy verification flow |
| Real-time | Tag state updates (200 ms color transition) |
| Reduced Motion | Instant transitions |

#### Incident Register (`/incidents`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; table skeleton → content |
| Loading | Table skeletons |
| Click | Row → incident detail (sheet or shared element) |
| Tables | Severity-sorted; intent-chip animation |
| Reduced Motion | Instant table |

#### RCA Workspace (`/incidents/:id/rca`)
| Aspect | Behavior |
|---|---|
| Entry | Slide from right (200 ms) |
| Loading | Timeline skeletons; evidence skeletons |
| Charts | Fishbone/5-Why diagram: node stagger; cause chain: Sankey |
| AI | AI suggests contributing factors; hypothesis cards stream |
| Reduced Motion | Instant diagram; no stagger |

### 19.6 Intelligence

#### Camera Fleet (`/vision/cameras`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; camera grid with thumbnails |
| Loading | Thumbnail skeletons (aspect-ratio preserved) |
| Hover | Camera card: video feed preview (live stream starts); elevation +1 |
| Click | Camera → detail view (shared element from thumbnail) |
| Real-time | Live feed thumbnails refresh (cross-fade); alert overlays |
| Reduced Motion | No hover preview; instant grid |

#### Knowledge Graph Explorer (`/knowledge/browse`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; graph initializes with force simulation |
| Loading | Node placeholder skeletons |
| Hover | Node: scale + connected highlight per §10.8 |
| Click | Node: neighborhood expand; edge: detail popover |
| AI | AI traversal overlay per §7.6 |
| Charts | Force-directed graph per §10.7; knowledge graph per §10.8 |
| Reduced Motion | Graph renders at final state (no simulation animation) |

#### Copilot Workspace (`/copilot`)
| Aspect | Behavior |
|---|---|
| Entry | Conversation loads; previous thread restores (instant) |
| Loading | Streaming-first; skeleton for tool results |
| AI | Full AI motion language per §7; streaming, reasoning, confidence, citations |
| Reduced Motion | Token streaming still works (functional); no orb animation |

### 19.7 Governance & Platform

#### Compliance Evidence Explorer (`/compliance/evidence`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; evidence grid |
| Loading | Card skeletons |
| Tables | Evidence table with filters per §4.17 |
| Charts | Compliance heatmap per §10.5; trend lines per §10.1 |
| Reduced Motion | Instant chart; no stagger |

#### Workflow Visualizer (`/workflows/temporal`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; React Flow canvas initializes |
| Loading | Node skeletons; edge placeholders |
| Charts | React Flow per §10.9; workflow execution highlight |
| Reduced Motion | Instant node render; no edge draw animation |

#### Security Audit Log (`/security/audit-log`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade; table skeleton → content |
| Tables | Dense table with monospace timestamps; real-time row prepend |
| Real-time | New log entries slide in from top (200 ms) |
| Reduced Motion | Instant row insert |

### 19.8 Mobile Surfaces

#### Mobile Field Home (`/mobile`)
| Aspect | Behavior |
|---|---|
| Entry | Bottom tab appears; content fades in (120 ms) |
| Loading | Lightweight skeletons; network-resilient |
| Hover | N/A (touch) |
| Click | Tap: ripple (400 ms); card: standard press |
| Notifications | Top banner for alerts; haptic feedback |
| Reduced Motion | No ripple; instant transitions |

#### Mobile SOS (`/mobile/sos`)
| Aspect | Behavior |
|---|---|
| Entry | INSTANT (0 ms) — safety-critical |
| Click | Hold-to-confirm (500 ms) + haptic; dual-confirm |
| Reduced Motion | Hold ring retained (functional) |

#### Mobile Sync Queue (`/mobile/sync`)
| Aspect | Behavior |
|---|---|
| Entry | Cross-fade (120 ms) |
| Real-time | Queue count decrements with counter-tick; item cards show sync progress |
| Reduced Motion | Instant counter |

### 19.9 Specialist & vNext Surfaces

All specialist surfaces (Zone Geometry Editor, Homography Calibration, Ontology Editor, Risk Pattern Registry, Model Registry, Policy Editor, Observability Stack, etc.) follow the standard motion patterns of their parent layout family:

| Layout Family | Standard Motion |
|---|---|
| `layout.command` | Console motion: KPI stagger, live feed, counter tick, catastrophic pulse |
| `layout.workflow` | Workflow motion: step transitions (180–220 ms), form animations, sticky bar |
| `layout.analytics` | Analytics motion: chart animations, KPI count-up, filter transitions |
| `layout.geospatial` | Twin motion: camera transitions, layer fades, marker animations |
| `layout.admin` | Admin motion: config saves (brief success morph), drawer transitions (160–200 ms), no ornamental animation |
| `layout.auth` | Auth motion: card fade+scale (160 ms), inline validation |
| `layout.mobile` | Mobile motion: short sheets, swipe confirms, ripple feedback |

No specialist surface may introduce novel motion patterns not defined in this specification. If a specialist surface requires a new animation behavior, it must be proposed via RFC to the Motion Design team and added to this document before implementation.

---

## Appendix A — Motion Token CSS (Complete)

```css
:root {
  /* ─── Durations ─── */
  --duration-instant: 0ms;
  --duration-micro: 80ms;
  --duration-fast: 120ms;
  --duration-moderate: 200ms;
  --duration-steady: 280ms;
  --duration-slow: 320ms;
  --duration-deliberate: 480ms;
  --duration-cinematic: 640ms;
  --duration-epic: 960ms;
  --duration-orbit: 2400ms;
  --duration-breathe: 4000ms;
  --duration-skeleton: 1600ms;
  --duration-counter: 240ms;
  --duration-live-pulse: 2000ms;
  --duration-hold-confirm: 500ms;
  --duration-toast-info: 4000ms;
  --duration-toast-warn: 6000ms;
  --duration-toast-undo: 8000ms;
  --duration-toast-error: 0ms;
  --duration-success-flash: 800ms;
  --duration-change-highlight: 1200ms;

  /* ─── Staggers ─── */
  --stagger-card: 40ms;
  --stagger-table-row: 30ms;
  --stagger-palette: 20ms;
  --stagger-notification: 30ms;
  --stagger-chart-series: 80ms;
  --stagger-nav-item: 20ms;
  --stagger-form-field: 40ms;
  --stagger-kpi: 60ms;
  --stagger-skeleton: 60ms;

  /* ─── Delays ─── */
  --delay-none: 0ms;
  --delay-hover-intent: 150ms;
  --delay-tooltip: 400ms;
  --delay-tooltip-shortcut: 800ms;
  --delay-skeleton-show: 100ms;
  --delay-spinner-show: 300ms;
  --delay-message-show: 1000ms;
  --delay-cause-show: 3000ms;
  --delay-prefetch: 200ms;
  --delay-debounce-input: 150ms;
  --delay-debounce-validation: 400ms;

  /* ─── Easings ─── */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-entrance: cubic-bezier(0, 0, 0, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1.2);
  --ease-linear: linear;
  --ease-sharp: cubic-bezier(0.4, 0, 0.2, 1);

  /* ─── Hover ─── */
  --hover-tint-light: 4%;
  --hover-tint-dark: 4%;
  --hover-elevation-lift: -2px;

  /* ─── Focus ─── */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-micro: 0ms;
    --duration-fast: 0ms;
    --duration-moderate: 0ms;
    --duration-steady: 0ms;
    --duration-slow: 120ms;
    --duration-deliberate: 0ms;
    --duration-cinematic: 0ms;
    --duration-epic: 0ms;
    --duration-orbit: 0ms;
    --duration-breathe: 0ms;
    --duration-skeleton: 0ms;
    --duration-counter: 0ms;
    --duration-live-pulse: 0ms;
    --stagger-card: 0ms;
    --stagger-table-row: 0ms;
    --stagger-palette: 0ms;
    --stagger-notification: 0ms;
    --stagger-chart-series: 0ms;
    --stagger-nav-item: 0ms;
    --stagger-form-field: 0ms;
    --stagger-kpi: 0ms;
    --stagger-skeleton: 0ms;
  }
}
```

---

## Appendix B — Cross-References

- **PRSD v1.0** — Product goals, personas, module scope
- **Master Feature Specifications v1.0 + vNext** — 466 features across Modules 1–27
- **Information Architecture v1.0** — Canonical routes, page inventory, navigation patterns
- **User Flow Specification v1.0** — End-to-end interaction sequences
- **Design System v1.0 (Halo)** — Visual tokens, component specs, §11 Motion & Animation, §12 Micro-Interactions, §28 Halo Orb
- **Screen Specifications v1.0** — Per-screen motion/micro-interaction requirements
- **Frontend Architecture v1.0** — Technology stack, performance budgets, accessibility requirements
- **API Specification v1.0** — WebSocket/SSE event definitions for real-time animation triggers

Every motion decision in this document traces back to a visual token in the Design System, a screen specification, a feature ID, or a persona journey. When a conflict arises, the resolution order is:

**Safety requirement > WCAG compliance > Design System token > Motion Specification > Screen Specification**

---

## Appendix C — Glossary

| Term | Definition |
|---|---|
| **Ambient motion** | Continuous, imperceptible animation that communicates "alive" state (Orb breathe, live dot) |
| **Chip-pop** | Scale 0.9→1 + fade entry animation for small elements (chips, badges, tags) |
| **Counter-tick** | Number interpolation through intermediate digits |
| **Drill-down** | Navigation from parent scope to child scope (L1→L2→L3→L4) |
| **GPU-composited** | Animation using only `opacity` and `transform` — runs on the compositor thread |
| **Hold-to-confirm** | Radial progress ring that fills while user holds a button; prevents accidental activation |
| **Intent color** | Semantic status color (`info`, `success`, `warning`, `critical`, `catastrophic`) |
| **layoutId** | Framer Motion prop enabling shared element transitions between routes |
| **Morph** | Smooth interpolation of width, height, and border-radius simultaneously |
| **Reduced motion** | System/user preference to minimize or eliminate animation |
| **Shared element transition** | An element that appears to move from its position in view A to its position in view B |
| **Skeleton** | Content-shaped placeholder with shimmer animation shown during data loading |
| **Spring** | Physics-based animation with configurable stiffness, damping, and mass |
| **Stagger** | Sequential delay applied to sibling elements animating in a group |
| **Streamline** | SVG path-drawing animation (stroke-dashoffset) |

---

*End of Document — SafetyOS Motion Design Specification v1.0*
*Codename: Kinesis*
*"Quiet by default. Loud when it matters. Alive when thinking. Still when the human needs to act."*
