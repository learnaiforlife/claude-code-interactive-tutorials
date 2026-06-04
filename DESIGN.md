# Design

> Visual system for the Claude Code Interactive Tutorials platform.
> Companion to `PRODUCT.md` (strategy) and `docs/plans/2026-06-03-claude-code-tutorials-platform.md` (architecture/spec).
> Last updated: 2026-06-03 · Direction locked: **V2 Dual-Tone**.

---

## 1. North star

Learn Claude Code the **efficient and responsible** way. Every lesson makes you faster *and*
lighter on tokens, cost, and the planet. The product has a thesis, stated plainly and often:

> **// AI is not for everything.**

Discernment — knowing what belongs in an AI tool and what doesn't — is the skill we teach. Token
efficiency is the measurable proof of that skill, and the engine of the reward system (Section 6).

---

## 2. Design direction — V2 Dual-Tone (A + D + B)

A synthesis of three explored directions, each owning the surface it does best:

- **D — Split-Screen IDE** → the *structure*. Lessons are two panes: content left, live terminal right.
- **B — Modern Editorial** → the *content side*. Editorial typography for reading (big lesson numeral,
  strong hierarchy, whitespace, clean progress). Also the dashboard / track-list style.
- **A — Terminal Native** → the *terminal pane + house style*. The simulator is an authentic terminal;
  the house chrome (traffic-light dots, monospace wordmark, `⌘K`) wraps every screen.

**"Dual-Tone"** is the defining choice: the content/reading surfaces are **light** editorial paper;
the terminal and house chrome are **dark**. The seam between them is the natural split of the layout —
a printed page beside a live terminal.

---

## 3. Layout system

| Surface | Pattern | Notes |
|---------|---------|-------|
| **Lesson page** | Split-screen (D) | Content left (~56%), terminal sim right (~44%) |
| **Dashboard / track** | Editorial list (B) | Numbered lesson rows, Done/Now/Locked badges, accent progress bar |
| **House chrome** | Terminal bar (A) | Every screen: traffic-light dots, `claude-code · learn` wordmark, breadcrumb, `⌘K` |
| **Impact dashboard** | Forest (Section 6) | Cumulative savings as a growing forest + ledger |

**Responsive:** desktop and tablet are primary. Below ~900px the two lesson panes **stack vertically**
(content top, terminal below). Mobile is acceptable, not optimized.

---

## 4. Color — OKLCH tokens

Dual-tone surfaces + syntax-lit accents that **carry meaning** (never decoration).

```css
/* Surfaces */
--canvas:      oklch(0.11 0.012 250);  /* app background (dark) */
--paper:       oklch(0.985 0.004 120); /* content/reading surface (light) */
--terminal:    oklch(0.09 0.01 235);   /* terminal sim + dark panes */
--border:      oklch(0.22 0.01 250);   /* dark-surface borders */
--border-soft: oklch(0.90 0.01 120);   /* light-surface borders */

/* Text */
--ink:         oklch(0.16 0.01 250);   /* primary on light */
--ink-soft:    oklch(0.45 0.01 250);   /* secondary on light */
--text-dark:   oklch(0.92 0.01 250);   /* primary on dark */
--text-mute:   oklch(0.55 0.01 250);   /* secondary on dark */

/* Syntax-lit accents — each carries a fixed meaning */
--accent-green: oklch(0.62 0.15 155);  /* success · prompt · nature/CO₂ */
--accent-amber: oklch(0.62 0.14 65);   /* command · highlight · electricity */
--accent-blue:  oklch(0.55 0.13 235);  /* info · links · water */
```

Accent meaning is consistent everywhere: green = success/prompt/nature, amber = command/energy,
blue = info/water. Learners should be able to read color as a second channel of information.

---

## 5. Typography

- **Inter** (or system sans) — editorial content, UI, body. Tight tracking on headings (`-0.02em`).
- **Fira Code / JetBrains Mono** — terminal, code, numbers, the house wordmark, all metrics.
- **Editorial lesson numeral** — the large `03`-style numeral is B's hero element. It is the *only*
  large numeral; it is **not** repeated `01 / 02 / 03` eyebrow scaffolding on every section.

---

## 6. The Impact System (gamification)

Gamification is **tokens saved → real impact**, not XP/streaks/hearts. Two coded-vector animations:

### 6a. Plant — the per-step micro-reward
Fires when a learner banks a lesson's tip (completes the step/checkpoint).
- An SVG plant **grows**: stem draws in, leaves pop in sequence.
- Hero number = **tokens saved** (count-up). The lever behind everything else.
- Four metrics: 💰 **cost** (exact), ⚡ **electricity**, 💧 **water**, 🌱 **CO₂** (sourced ranges).
- **Cascade toggle** (core feature): *Per use → Daily habit (10×/day, 1yr) → Team of 20*. Turns a
  trivial per-use figure into visceral scale — this is the "spend limit → org budget → company cost"
  cascade. Present on every Plant reward and on the Forest dashboard totals.

### 6b. Forest — the cumulative dashboard
The progress/home surface. Each banked tip plants a **tree**; the newest glows; locked lessons show
faint tree outlines. The world levels up **sprout → sapling → forest** as the track completes. A dashed
**ledger** shows running totals (cost, water, energy, CO₂) across the module.

### 6c. The numbers — credibility rules (non-negotiable)
- **Cost is exact** — computed from real model pricing (token → $).
- **Environmental figures are honest ranges**, drawn from published research, always prefixed `~` and
  shown as `low–high`. Never single false-precision eco numbers.
- A visible **"How we calculate this"** methodology page cites sources and states assumptions.
- Brand is *precise*; fabricated stats would betray it. When uncertain, widen the range or omit.

---

## 7. The tips backbone

Every lesson teaches a full set of token-optimization tips (**3 each, 24 total — nothing deferred**).
One is the **signature tip** (★) — the lesson's headline and primary Plant reward; the others are
taught inline. **Banking any tip** credits impact and grows the Forest.

| Lesson | Signature tip (★) | Additional tips (inline) |
|--------|-------------------|--------------------------|
| L1 · What is Claude Code | **AI is not for everything — run the litmus** (could a command/editor/your memory do this for 0 tokens?) | • Context isn't free or one-time — re-read every turn  • Match the model to the task (Opus = hard reasoning, Haiku = mechanical bulk) |
| L2 · Effective prompting | **One precise prompt beats five vague ones** (each retry re-sends all context) | • Scope the context — name files/dirs  • Ask for the output shape ("just the diff", "one line") |
| L3 · Bash commands | **Search, don't slurp** — grep/glob to the 5 relevant lines, not whole files | • Let a command do deterministic work (rename/move/count/test = 0 tokens)  • Reference files & logs, don't paste them |
| L4 · Creating skills | **A skill replaces a re-explanation** — encapsulate a repeated workflow once | • Put durable facts in CLAUDE.md (prompt-cacheable)  • Keep skills tight — load detail on demand |
| L5 · Creating subagents | **Let subagents hold the heavy context** — return only the conclusion | • Demand conclusions, not dumps  • Parallelize independent work |
| L6 · MCP overview | **Every enabled tool's schema lives in your context** — every turn | • Spot tool sprawl before it dominates the budget  • Prefer on-demand tool discovery (lazy schemas) |
| L7 · MCP management | **Disable what this project doesn't use** | • Enable per-project, not globally  • Audit periodically as needs drift |
| L8 · Common mistakes | **`/clear` between unrelated tasks** — stale history is re-sent every turn | • Edit, don't rewrite — pay only for changed lines  • Don't re-read to "verify" (the harness tracks file state) |

24 tips total (3 per lesson). The full bank ships in MVP.

---

## 8. Core interactive components

Styled to the system; each is reusable and independently testable.

- **Terminal simulator** (the star) — scripted, not a real shell. Includes an *approve-the-command* step
  mirroring real Claude Code, typewriter output (reduced-motion safe), correct/incorrect detection,
  `?` for a hint, `reset` to retry. Lives in the right pane (lessons 3, 4, 5).
- **Command palette (`⌘K`)** — in the house chrome. Fuzzy search across lessons; inline progress state
  (done / in-progress / locked); keyboard-first.
- **Progress** — `localStorage`, no auth. Per-lesson + track-level state, resume prompt on return.
  Presented via the Forest dashboard. No streaks/hearts.
- **Interactive code blocks** — copy, line-by-line step mode, click-a-token annotations.
- **Checkpoints** — MCQ or fill-in-the-blank (no essays). Wrong answers explain, not just "incorrect."
  Not graded — banking the tip (and the Plant reward) is the payoff.

---

## 9. Motion

- **Coded vector only** — SVG / CSS / Lottie. No GIF or video. Crisp at any size, themeable, tiny payload.
- Easing favors a gentle overshoot for "earned" moments (`cubic-bezier(.2,1.3,.4,1)`), linear/ease for chrome.
- **`prefers-reduced-motion` is mandatory.** Every animation (count-ups, plant growth, forest, typewriter,
  cursor blink) has a static final-state fallback. Reduced motion shows the result instantly, no movement.

---

## 10. Hard constraints (do not violate)

- No predictable purple gradients.
- No generic SaaS card grids (icon + heading + 2 lines, repeated).
- No glassmorphism as decoration.
- No empty marketing-hero visuals.
- No `border-left` colored side-stripe accents. (The lesson pane divider is *structural*, not an accent.)
- No gradient text (`background-clip: text`).
- No numbered eyebrow scaffolding on every section. The single editorial numeral is the exception.

---

## 11. Accessibility

- **WCAG AA** on **both** the light content surface and the dark terminal — verify contrast on each,
  including code/syntax colors, not just body text.
- Keyboard-first: `⌘K` palette, focus-visible everywhere, full keyboard path through the terminal sim.
- Reduced motion (Section 9). Respect `prefers-color-scheme` is **not** required — dual-tone is intentional
  and fixed per surface.

---

## 12. Build note

When implementation reaches the visual craft (plant art, easing polish, particle detail, the Forest
level-ups), run **`/impeccable`** against the built components to take them to the "clean and advanced" bar.
This document is the brief.
