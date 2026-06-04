# Claude Code Interactive Tutorials Platform — Plan

> **Status:** ✅ Decisions locked (2026-06-03). Design direction = **V2 Dual-Tone (A + D + B)**;
> stack = **Next.js App Router**. Visual system, the token-savings **Impact System**, and the 24-tip
> bank live in `DESIGN.md`. Ready for implementation planning (`/writing-plans`).

---

## 1. Product Goal

Build a **free, interactive tutorial platform** that teaches Claude Code from beginner to
intermediate level. This is a *learning product*, not a documentation site. Users learn by doing —
not by reading walls of text.

**Success criteria:**
- A first-time Claude Code user can complete Lesson 1 in under 10 minutes and immediately apply it
- An intermediate user can jump to any topic without reading what they already know
- The experience feels more like a well-designed tool than a course website

**What this is NOT:**
- A docs site (no GitBook / Notion aesthetic)
- A video course platform
- A marketing landing page
- Generic AI-generated courseware

---

## 2. Users

**Primary:** Developers encountering Claude Code for the first time.
Context: at a terminal, learning on their own time, probably have the Claude Code docs open in
another tab and finding them too dense.

**Secondary:** Intermediate Claude Code users who know the basics but want to go deeper on
specific topics (skills, subagents, MCP).

**Not targeted (yet):** Advanced users building production systems. That content comes later.

---

## 3. Brand & Design Constraints

### Personality
Precise, approachable, playful, opinionated, focused.

Tone: a sharp senior developer who enjoys teaching — direct without being cold, confident without
being arrogant, occasionally witty without being distracting.

### Hard constraints (do not violate)
- No predictable purple gradients
- No generic SaaS card grids (icon + heading + 2-line description, repeated)
- No glassmorphism as decoration
- No empty marketing-site hero visuals
- No bland AI-generated layouts
- No side-stripe borders (border-left as colored accent)
- No gradient text (background-clip: text)
- No numbered eyebrows on every section (01 / 02 / 03 scaffolding)

### Inspiration sources
- Terminal / IDE aesthetics (not generic dark dashboard)
- Duolingo's learning mechanics (not its visual style)
- Modern editorial design (Linear, Stripe Docs typographic confidence)
- Syntax highlighting as a design language (colors carry meaning)

### Reference to beat
claudecodeguide.dev — calm, minimal, static docs site. Good content; no interactive identity.
We need to be dramatically more interactive and visually distinctive.

---

## 4. Information Architecture

### Learning paths

```
/ (home / dashboard)
├── /learn                     — Learning path selector
│   ├── /learn/beginner        — Beginner track (8 lessons)
│   ├── /learn/intermediate    — Intermediate track (TBD)
│   └── /learn/advanced        — Advanced track (future)
├── /lessons/:slug             — Individual lesson page
├── /search                    — Search / command palette (Cmd+K)
└── /progress                  — User progress (localStorage, no auth)
```

### Navigation model
- **Command palette** (Cmd+K) as primary navigation — developer-native, skip to any lesson
- **Linear lesson flow** as default for new users (next → next → next)
- **Topic jump** for returning users — visible on dashboard, deep-linkable
- No sign-up required. Progress saved to localStorage.

---

## 5. Design Direction — ✅ RESOLVED: V2 Dual-Tone (A + D + B)

Six directions were explored and mocked up. The chosen direction is a **hybrid of A + D + B** —
"V2 Dual-Tone": D's split-screen layout, B's editorial *light* content pane, and A's authentic
dark terminal + house chrome. Full visual system in `DESIGN.md`.

### Options presented

| Option | Name | Summary | Best for |
|--------|------|---------|----------|
| A | Terminal Native | Monospace-first, dark, lessons run like CLI sessions | Maximum developer authenticity |
| B | Modern Editorial | High typographic contrast, large numerals, white space | Premium, readable, timeless |
| C | Syntax-Lit | Dark IDE palette, accent colors carry meaning like tokens | IDE familiarity + structure |
| D | Split-Screen IDE | Two-pane: lesson content left, live terminal sim right | Zero context switch, practical |
| E | Chalk Dark | Deep navy, syntax-colored keyword chips, step-by-step | Annotated lecture aesthetic |
| F | Game Map | Duolingo-style node map, developer-native, streaks/badges | High motivation mechanics |

### Chosen direction
**V2 Dual-Tone (A + D + B).** A light editorial content pane (B) beside a dark terminal sim (A),
in a split-screen lesson layout (D), wrapped in terminal-native house chrome. Gamification is the
token-savings **Impact System** (Plant + Forest), not a game map. See `DESIGN.md` for tokens,
typography, components, motion, and constraints.

---

## 6. Tutorial Content — MVP Lessons (Beginner Track)

Eight lessons for the first release:

| # | Slug | Title | Format | Est. Time |
|---|------|-------|--------|-----------|
| 1 | `what-is-claude-code` | What Claude Code is and how to think about it | Concept + quiz | 5 min |
| 2 | `effective-prompting` | How to prompt Claude Code effectively | Interactive exercise | 8 min |
| 3 | `bash-commands` | How to run bash commands from Claude Code | Terminal sim + challenge | 10 min |
| 4 | `creating-skills` | How to create and use skills | Build-along exercise | 12 min |
| 5 | `creating-subagents` | How to create and use subagents | Build-along exercise | 12 min |
| 6 | `mcp-overview` | How to view MCP servers and tools | Guided walkthrough | 8 min |
| 7 | `mcp-management` | How to enable, disable, and manage MCP connections | Interactive config sim | 10 min |
| 8 | `common-mistakes` | Common beginner mistakes and best practices | Review + self-check | 8 min |

### Lesson anatomy (per lesson)

Each lesson has these sections:
1. **Context** — Why this matters (1–3 sentences max, no padding)
2. **Concept** — The core idea, explained visually or with code
3. **Hands-on** — An interactive exercise or terminal simulation
4. **Check** — A checkpoint question or mini-challenge
5. **Next** — One clear next step (the next lesson, or a specific thing to try in real Claude Code)

### Feature-module curriculum expansion

The long-term curriculum should cover Claude Code as a set of feature modules. Each module teaches:
1. **What it is** — the feature's job in Claude Code.
2. **How it works** — what gets loaded into context, what tools or files it touches, and what Claude can do with it.
3. **How to use it** — one realistic guided session or build-along.
4. **How to use it efficiently** — the token habit that makes the feature cheaper, safer, or more precise.
5. **Impact reward** — the saved-token estimate, cost, energy, water, and CO2e attached to that habit.

Authoritative source map: use the official Claude Code docs index (`https://code.claude.com/docs/llms.txt`) before adding or renaming modules. As of June 4, 2026, the feature families to cover are:

| Track | Feature modules | Efficiency hook |
|-------|-----------------|-----------------|
| Foundations | Install, authenticate, update, `claude doctor`, CLI vs IDE vs desktop vs web | Keep setup prompts diagnostic and short. Do not paste environment dumps when a command can report the state. |
| Core CLI workflow | Interactive sessions, prompt input, edit/run/approve loop, continuing and resuming sessions, slash commands, keyboard shortcuts | Start from the narrowest task, resume only related work, and clear or compact when context changes. |
| Codebase context | File reads, search, `CLAUDE.md`, auto memory, context window, prompt caching, status line, usage/cost views | Search before reading, store durable facts once, and watch what is consuming context. |
| Tools and permissions | Built-in tools, Bash/PowerShell, permission modes, sandboxing, auto mode, approvals | Let deterministic tools do deterministic work, allow only needed tools, and avoid carrying broad permissions into small tasks. |
| Extension system | Custom slash commands, skills, subagents, hooks, MCP, plugins, plugin marketplaces | Encode repeated workflows once, isolate heavy context in subagents, and lazy-load external tools instead of carrying every schema. |
| Parallel and large work | Worktrees, agent view, agent teams, dynamic workflows, checkpointing, goals, scheduled tasks, routines | Split independent work, return conclusions instead of dumps, and checkpoint before broad edits. |
| Integrations | VS Code, JetBrains, Desktop, Chrome, GitHub Actions, GitLab CI/CD, Slack, Remote Control, web/cloud sessions | Put Claude where the context already is, but avoid duplicating the same context across tools and sessions. |
| Programmatic use | Agent SDK, headless mode, streaming, structured output, custom tools, SDK sessions, cost tracking | Use structured output and tool allowlists, stream only what the host needs, and track token spend per workflow. |
| Team and enterprise | Organization setup, managed settings, Bedrock, Vertex AI, Microsoft Foundry, LLM gateways, analytics, monitoring, security, data usage | Scope defaults centrally, measure usage by feature, and keep high-cost capabilities opt-in. |

Each new module must have at least one concrete token-efficiency tip in the lesson data before it ships.

Detailed expansion plan: `docs/plans/2026-06-04-claude-code-feature-curriculum.md`.

---

## 7. Interactive Elements

These are the core interactive components that differentiate this from a static site.
They need to be designed and built as reusable components.

### Terminal Simulator
A fake terminal that accepts typed input and responds with pre-scripted output.
Not a real shell — a guided simulation for lesson exercises.
- Typewriter output animation
- Correct/incorrect response detection
- Hint system (press ? for hint)
- Copy-paste the correct answer shows in real terminal style

### Command Palette (Cmd+K)
Search all lessons by title, keyword, or concept.
Instant navigation. Developer-native.
- Keyboard-first
- Shows progress state inline (done/in-progress/locked)
- Fuzzy search

### Progress System
Stored in localStorage. No account required.
- Per-lesson completion state
- Track-level progress (X of 8 lessons done)
- Resume prompt on return visit ("You left off at Lesson 4")
- Surfaced via the **Forest** impact dashboard (no streaks/hearts — see Impact System below)

### Interactive Code Blocks
Code examples that can be copied, annotated, or stepped through.
- Line-by-line step mode for complex examples
- Inline annotations (click a token to see what it means)
- Copy button with "copied!" feedback

### Checkpoints / Mini-challenges
End-of-lesson knowledge checks.
- Multiple choice OR fill-in-the-blank (no essays)
- Immediate feedback
- Wrong answer shows explanation, not just "incorrect"
- Not graded — the goal is learning, not scoring

### Impact System (gamification — core)
Token efficiency *is* the gamification. No XP, streaks, hearts, or badges.
- Each lesson teaches token-optimization **tips** (24 total, 3 per lesson — see `DESIGN.md` §7).
- **Banking a tip** fires a **Plant** micro-reward: an SVG plant grows while tokens saved (the lever),
  exact cost, and sourced ranges for electricity / water / CO₂ animate in.
- A **cascade toggle** (Per use → Daily habit → Team of 20) scales numbers to org/company impact.
- The cumulative **Forest** dashboard grows a tree per banked tip; a ledger tracks running totals.
- A **"How we calculate this"** methodology page documents pricing + sourced eco ranges.
- Motto throughout: **// AI is not for everything.**

---

## 8. MVP Scope

### In MVP
- Home/dashboard with learning path selector
- All 8 beginner lessons (content + interactive elements)
- Command palette navigation (Cmd+K)
- Terminal simulator component (used in lessons 3, 4, 5)
- Progress tracking via localStorage
- Impact System: 24 token-optimization tips, Plant per-step reward, Forest dashboard, cascade toggle
- "How we calculate this" methodology page (exact cost + sourced environmental ranges)
- Responsive (works on desktop and tablet; mobile is acceptable but not primary)
- WCAG AA accessibility
- Reduced motion support

### Out of MVP (Phase 2+)
- User accounts / cloud progress sync
- Intermediate + advanced tracks
- Video content
- Community features (comments, questions)
- Real terminal integration (WebSocket to actual shell)
- Certificate / completion badge sharing
- Search engine indexing / SEO optimization
- Analytics / engagement tracking

---

## 9. Tech Stack — ✅ RESOLVED: Next.js App Router

Locked: **Next.js App Router + Tailwind CSS v4 + TypeScript + npm**, deploying to **Vercel**.
Alternatives considered (kept for the record):

### Option 1: Next.js (App Router) + Tailwind CSS
- Pros: SSR/SSG hybrid, great DX, MDX for lesson content, large ecosystem
- Cons: More complex than needed for a mostly-static tutorial site
- Best if: SEO and performance matter from day one

### Option 2: Astro + React islands
- Pros: Zero-JS by default, fast, MDX, React for interactive components only
- Cons: Less familiar to many devs, smaller ecosystem
- Best if: Performance is the primary constraint

### Option 3: Vite + React + React Router
- Pros: Simple, fast build, full React for interactive components
- Cons: No SSR, weaker SEO (fixable with static prerender)
- Best if: Speed of development matters more than SEO

**Recommendation:** Next.js App Router. The MDX integration for lesson content is excellent,
and the static export covers the no-auth MVP case cleanly.

### Styling
- Tailwind CSS v4 (OKLCH color tokens throughout)
- CSS custom properties for the design system
- No component library — hand-crafted to match the chosen design direction

### Content
- Lesson content in MDX files (`/content/lessons/*.mdx`)
- Lesson metadata in frontmatter (title, slug, track, estimatedMinutes, order)
- No CMS for MVP — file-based is fast to iterate

---

## 10. File Structure (proposed)

```
claude-code-interactive-tutorials/
├── PRODUCT.md                         # Strategic context (written)
├── DESIGN.md                          # Visual system (write after direction is chosen)
├── docs/
│   └── plans/
│       └── 2026-06-03-claude-code-tutorials-platform.md  # This file
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── page.tsx                   # Home / dashboard
│   │   ├── learn/
│   │   │   └── [track]/page.tsx       # Track overview
│   │   └── lessons/
│   │       └── [slug]/page.tsx        # Individual lesson
│   ├── components/
│   │   ├── terminal-sim/              # Terminal simulator
│   │   ├── command-palette/           # Cmd+K navigation
│   │   ├── progress/                  # Progress tracking hooks + UI
│   │   ├── lesson/                    # Lesson layout + sections
│   │   └── ui/                        # Shared primitives
│   ├── content/
│   │   └── lessons/
│   │       ├── 01-what-is-claude-code.mdx
│   │       ├── 02-effective-prompting.mdx
│   │       └── ...
│   ├── lib/
│   │   ├── lessons.ts                 # Lesson content loader
│   │   └── progress.ts                # localStorage progress
│   └── styles/
│       └── globals.css                # Design tokens + base styles
├── public/
└── package.json
```

---

## 11. Open Decisions — ✅ ALL RESOLVED (2026-06-03)

1. **Design direction** — ✅ V2 Dual-Tone (A + D + B). See `DESIGN.md`.
2. **Tech stack** — ✅ Next.js App Router + Tailwind v4 + TypeScript + npm.
3. **DESIGN.md** — ✅ Written (repo root). Run `/impeccable` during the build to polish the visual craft.
4. **Content depth** — ✅ Lesson anatomy confirmed (Section 6); each lesson carries 3 tips (`DESIGN.md` §7).
5. **Domain / hosting** — ✅ Vercel.

---

## 12. How to Use This Document in a New Session

1. Open a new Claude Code session in this directory
2. Say: "Read docs/plans/2026-06-03-claude-code-tutorials-platform.md and help me refine and execute it"
3. Resolve the open decisions in Section 11 first (design direction, tech stack)
4. Run `/impeccable document` to generate DESIGN.md once design direction is locked
5. Use `/writing-plans` to break the implementation into TDD task steps once all decisions are locked
6. Execute with `/superpowers:subagent-driven-development` or a parallel session

---

*Last updated: 2026-06-03 · Session: claude-code-interactive-tutorials initial design*
