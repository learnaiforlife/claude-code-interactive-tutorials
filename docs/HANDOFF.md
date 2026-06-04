# Handoff — Claude Code Interactive Tutorials

> **Use this as your starting prompt.** You are continuing an in-progress build. Read this whole file,
> then read `PRODUCT.md`, `DESIGN.md`, and `docs/plans/2026-06-03-claude-code-tutorials-platform.md`
> before writing code. Do not restate the obvious; pick up at "Next steps" and keep the conventions below.

---

## 1. What this product is

A **free, interactive tutorial platform that teaches Claude Code by doing**, with an opinionated thesis:

> **// AI is not for everything.**

The hook is **token efficiency as impact**: every lesson teaches one habit that saves tokens, and "tokens
saved" is converted into money + electricity + water + CO₂ (the gamification). Each lesson plays a **live
animated Claude Code session** demonstrating its tip with real before/after token cost.

Authoritative specs (already written — follow them, don't redo):
- `PRODUCT.md` — users, brand, design principles, anti-references.
- `DESIGN.md` — visual system (V2 Dual-Tone), the Impact System (§6), the 24-tip backbone (§7), hard bans (§10), a11y (§11).
- `docs/plans/2026-06-03-claude-code-tutorials-platform.md` — IA, lesson list, MVP scope.
- `docs/superpowers/plans/2026-06-03-tutorials-phase-1-foundation.md` — the Phase 1 task plan (done).

---

## 2. Tech stack & environment

- **Next.js 16.2.7** (App Router, Turbopack) · **React 19** · **TypeScript** · **Tailwind CSS v4** (CSS-first `@theme`).
- **Vitest 4 + @testing-library/react + jsdom** for unit/component tests.
- Path alias `@/*` → `src/*`. Deploy target: Vercel (not yet wired).

**Environment gotchas (already handled — keep handling them this way):**
- **Node 25 exposes a global `localStorage`** during SSR/prerender (you'll see a `--localstorage-file` warning). So **never read `localStorage` during a component's initial render / render-time `useState` initializer** — it causes hydration mismatches. Read browser state via the `useSyncExternalStore` hooks (`src/lib/use-progress.ts`, `src/lib/use-reduced-motion.ts`). This pattern is mandatory for any new browser-backed state.
- **jsdom has no `scrollTo` / `matchMedia`** — guard `scrollTo` (`typeof el.scrollTo === 'function'`); `matchMedia` is stubbed in `tests/setup.ts`.
- Vitest has `css: false` so Tailwind PostCSS stays out of unit tests; `next/font` and `next/link` are mocked in `tests/setup.ts`.
- Dev server runs on **:3001** here (3000 was occupied); `npm run dev` picks a free port.

**Commands:**
```bash
npm run dev      # local dev (Turbopack)
npm test         # vitest run  (currently 51 passing, 12 files)
npm run lint     # eslint      (currently clean)
npm run build    # next build  (currently passes; 90 lessons prerender static)
```

---

## 3. Conventions you MUST follow

These are non-negotiable (brand is "precise"; the user explicitly rejected AI-slop output):

1. **Dual-tone, fixed per surface.** Light "paper" content surfaces, dark "terminal/canvas" chrome + terminal. No global light/dark toggle, no `prefers-color-scheme`.
2. **Use the token system** in `src/app/globals.css` (`@theme`). Utilities: `bg-paper`, `text-ink`, `text-ink-soft`, `bg-canvas`, `text-fg`, `text-fg-mute`, `bg-terminal`, `border-line`, `border-line-soft`, `text-success`/`text-success-bright`, `text-command-bright`, `text-info-bright`. Accents carry meaning (green=success/prompt/nature, amber=command/energy, blue=info/water). Add new tokens here, not ad-hoc hex.
3. **WCAG AA on both surfaces.** Accents have on-light (darker) + on-dark (brighter) variants for this reason. Verify contrast.
4. **No em dashes** in any user-facing copy (use comma/colon/period/parens). No `//`-prefixed JSX text nodes (wrap in `{'...'}`). Honor `DESIGN.md` §10 bans (no side-stripe accents, no gradient text, no glassmorphism, no over-rounded cards >16px, no eyebrow-on-every-section).
5. **`prefers-reduced-motion` is mandatory** for every animation: provide an instant/static fallback (see `TerminalSession`'s reduced path).
6. **No `setState` synchronously inside `useEffect`** (ESLint `react-hooks/set-state-in-effect` is an error). Use `useSyncExternalStore` for external state; schedule animation state via `setTimeout` callbacks (async) only.
7. **TDD + small commits.** Tests live in `tests/`. Keep `npm test`, `npm run lint`, `npm run build` green before each commit. Commit per task. End commit messages with the project's Co-Authored-By trailer.
8. **Real content only.** No placeholder/junk copy. No fake controls (a not-yet-wired control should be an honest hint, like the ⌘K `<kbd>`).

---

## 4. File map (current)

```
src/
  app/
    layout.tsx              # Inter+Fira fonts, renders global <Chrome/>
    globals.css             # Tailwind v4 @theme OKLCH tokens, z-scale, focus, reduced-motion
    page.tsx                # Home: editorial Beginner Track + <LessonList/>
    lessons/[slug]/page.tsx # Split-screen: <LessonPane/> + <TerminalSession/>; notFound() on bad slug; generateStaticParams
  components/
    chrome/Chrome.tsx           # sticky terminal bar (dots, wordmark, breadcrumb slot, real ⌘K trigger)
    chrome/CommandPalette.tsx   # searchable lesson palette with Done/Now/Locked states
    dashboard/LessonList.tsx    # progress meter + numbered rows + Done/Now/Locked; locked = non-navigable
    impact/                     # Impact math UI: Forest dashboard, Plant reward, cascade controls, metric formatting
    lesson/LessonPane.tsx       # editorial left pane: concept, signature + inline tip banking, Plant reward, prev/next
    lesson/TerminalSession.tsx  # animated session player + optional type-it-yourself challenge
    ui/icons.tsx                # in-house Check/Lock/ArrowLeft/ArrowRight (no icon dep)
  lib/
    types.ts            # TrackInfo, Lesson, Tip, SessionLine, TerminalChallenge, Progress, Track
    lessons.ts          # 90 lessons across Beginner, Feature Modules, Power User Modules, and Team Modules
    impact.ts           # exact cost, eco ranges, cascade factors, banked-tip totals
    progress.ts         # localStorage progress: bankTip + pure *In(progress,...) derivations + wrappers
    use-progress.ts     # useProgress() store (useSyncExternalStore) + bankTipNow()
    use-reduced-motion.ts # usePrefersReducedMotion() (useSyncExternalStore)
tests/                  # 12 suites, 51 tests (setup.ts mocks next/font, next/link, localStorage, matchMedia)
```

Data model: each `Lesson` has `tips: Tip[]` (exactly 3, one `kind:'signature'`) and `session: SessionLine[]`.
Each lesson also carries `featureFamily`, `docsRefs`, and `efficiencyHabit`, so new modules explicitly teach the feature and its token habit.
`SessionLine.kind` ∈ `prompt|reply|thinking|tool|out|good|warn|rule|impact`. The `impact` line carries
`savedTokens` + `note`. `Tip.savedTokens` is an illustrative per-use estimate.
Lessons 3, 4, and 5 plus all Power User and Team lessons also have `challenge?: TerminalChallenge` for type-it-yourself exercises.

---

## 5. What is DONE (Phase 1 + the live terminal)

- **Scaffold + test harness** (commit `87c1919`).
- **Dual-tone design system**: OKLCH tokens, Inter/Fira fonts, terminal-native house chrome (`aadb43d`).
- **Lesson model + 270-tip registry + localStorage progress** (`8236f29`), now extended with track metadata, feature-family metadata, official docs references, and explicit efficiency habits.
- **Editorial dashboard** (track sections, progress meters, Done/Now/Locked; locked lessons are non-navigable so banking a signature tip unlocks the next lesson in that track) and **split-screen lesson page** (`7f17e54`).
- **Live animated terminal sessions + real per-lesson content** (`8c6e3e3`): `TerminalSession` plays each lesson's scripted Claude Code session (prompts type out, tool/output lines stream, ends on a tokens-saved tally; autoplay + Replay; reduced-motion renders the full transcript instantly). Every lesson has a `concept` + a `session`.
- **Impact System foundations** (`ad96ab1`): `impact.ts`, exact Sonnet input-token cost math, honest eco ranges, cascade controls, methodology page, Plant reward, and Forest dashboard.
- **270-tip banking pass**: inline tips are visible and bankable in each lesson, the Forest tracks 270 trees, signature tips still drive lesson completion/unlock.
- **Feature-module curriculum plan**: `docs/plans/2026-06-04-claude-code-feature-curriculum.md` maps Claude Code features to module tracks and efficiency hooks, with an official-index coverage audit and build sequence.
- **Feature Modules track**: 24 shipped modules covering Agent loop, Prompt input, Continue/resume, Slash commands, Search/read, CLAUDE.md, Context window, Built-in tools, Bash/PowerShell, Permission modes, Checkpointing, quickstart/install/login, install troubleshooting, terminal configuration, keybindings, status line, fullscreen rendering, voice dictation, output styles, fast mode, sandbox environments, dev containers, runtime troubleshooting, and environment variables. Each teaches what it is, how it works, how to use it, and how to use it efficiently with a bankable token-saving habit.
- **Power User Modules track**: 26 shipped modules covering Custom slash commands, Skills, Subagents, Hooks, MCP, Plugins, Plugin distribution, Worktrees, Agent view, Agent teams, Dynamic workflows, Goals, Scheduled tasks/routines, VS Code, JetBrains, Desktop, Chrome/computer use, GitHub Actions, GitLab CI/CD, Code Review, Slack/Remote Control, web/cloud sessions, channels, deep links, security guidance plugin, and ultrareview. Each includes official docs refs, a typed terminal challenge, and a token-efficiency habit.
- **Team Modules track**: 32 shipped modules covering Agent SDK, headless automation, SDK sessions, SDK permissions/user input, SDK streaming, structured outputs, custom tools, tool search, cost tracking, observability, hosting/session storage, secure deployment, organization setup, analytics/monitoring, managed settings, managed MCP, security/data usage, network gateways, GitHub Enterprise Server, Bedrock, Vertex AI, Microsoft Foundry, Claude Platform on AWS, rollout kits, SDK agent loop, SDK migration, SDK plugins, SDK skills, SDK slash commands, SDK subagents, SDK todo lists, and Python SDK reference orientation. Each includes official docs refs, a typed terminal challenge, and a token-efficiency habit.
- **Type-it-yourself terminal core**: lessons 3, 4, and 5 plus all Power User and Team lessons now include terminal challenges with `?` hints, `reset`, incorrect feedback, and scripted success output.
- **Command palette**: real `⌘K` palette searches lessons/features/docs refs/tips, shows Done/Now/Locked states, and only exposes navigable links for unlocked lessons.
- **Lesson checks + branded 404**: each lesson has a low-stakes check with explain-on-wrong feedback, and `/not-found` uses the dual-tone house style.
- **Release hardening pass**: axe-core structural a11y coverage for chrome, Forest, lesson, terminal, and 404; semantic Forest markers; mobile overflow fixes; reduced-motion terminal remounts into the full transcript.

**Verified:** 51/51 tests, lint clean, production build passes (`/`, `/how-we-calculate`, all 90 lessons prerender static; 95 static pages total). Rendered browser QA used isolated headless Chrome DevTools Protocol because the MCP Playwright profile was locked: desktop home, mobile home, desktop/mobile `sdk-agent-loop`, no console/runtime errors, and no horizontal overflow.

---

## 6. NEXT STEPS (prioritized)

### P1 polish — Impact System QA and craft
The Impact System is implemented and the baseline home Forest has desktop/mobile screenshot coverage. Remaining:
1. Interactive browser QA: bank a lesson tip, confirm Plant reward, newest-tree glow, and cascade toggle states.
2. Reduced-motion browser QA for Plant count-up final state.
3. Craft pass: Forest density, empty-state language, and metric legibility.

### P2 polish — Interactive terminal QA and expansion
Core type-it-yourself challenges are implemented for lessons 3, 4, and 5. Remaining work:
1. Browser QA: Replay after challenge and typed success/incorrect flows in a rendered browser.
2. Consider moving the challenge intro from terminal-only into the left lesson pane for stronger instruction.
3. Add type challenges to future feature modules as they are created.

### P2.5 — Feature-module expansion
The master plan now has a **Feature-module curriculum expansion** section and detailed plan file. Use the official Claude Code docs index (`https://code.claude.com/docs/llms.txt`) as the source map. Each new module must teach what the feature is, how it works, how to use it, and the token-efficiency habit attached to that feature.
Feature Modules, Power User Modules, and Team Modules are shipped through the Agent SDK expansion slice. The live docs index has 145 pages; 133 are referenced by lessons, leaving 12 release/changelog pages. The Agent SDK subpages, champion kit, desktop quickstart, glossary, and legal/compliance pages are now either lesson modules or linked from relevant lessons.
1. Remaining docs/reference coverage: changelog and `whats-new` pages should become a small "What changed recently" module only if they teach durable user behavior, not release-note trivia.
2. Continue auditing the live docs index before each curriculum slice because Claude Code features and docs move quickly.

### P3 polish — Command palette QA
Core `⌘K` palette is implemented. Remaining work:
1. Browser QA: mouse open, keyboard shortcut, search, close, mobile layout.
2. Add future feature modules to palette results once those lessons exist.
3. Consider richer fuzzy ranking if the lesson count grows beyond the first tracks.

### P4 — Content & polish
- Lighthouse/perf pass, manual keyboard audit, then **Vercel deploy**.

### Backlog / Phase 3+ (from the master plan)
Intermediate/advanced tracks, accounts/cloud sync, real shell integration, sharing. Out of MVP.

---

## 7. Honest current gaps (don't represent these as done)
- Impact baseline has desktop/mobile screenshot coverage for the previous 246-tree state. The 270-tree Forest plus bank-tip Plant reward and cascade toggles still need rendered interaction QA.
- The terminal has desktop/mobile/reduced-motion screenshot coverage, but guided typing success/incorrect flows still need rendered interaction QA.
- The command palette has unit, axe, and build coverage, but not rendered screenshot QA for open/search/close states.
- The branded 404 has test, axe, build, and desktop screenshot coverage.

---

## 8. Start here
1. `npm install && npm test && npm run dev` — confirm green and click through `/` → a lesson → bank a tip → watch it unlock.
2. Continue with **P1 polish** or start **P2** interactive terminal.
3. Keep commits small; keep test/lint/build green; follow §3 conventions.
