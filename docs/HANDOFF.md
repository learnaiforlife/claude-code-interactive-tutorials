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
- Path alias `@/*` → `src/*`. Deploy target: Vercel. Production is live at
  `https://claude-code-interactive-tutorials.vercel.app`. Manual Vercel deploys work from this machine.
  Automatic GitHub-linked deploys still need the Vercel account to add a GitHub login connection.

**Environment gotchas (already handled — keep handling them this way):**
- **Node 25 exposes a global `localStorage`** during SSR/prerender (you'll see a `--localstorage-file` warning). So **never read `localStorage` during a component's initial render / render-time `useState` initializer** — it causes hydration mismatches. Read browser state via the `useSyncExternalStore` hooks (`src/lib/use-progress.ts`, `src/lib/use-reduced-motion.ts`). This pattern is mandatory for any new browser-backed state.
- **jsdom has no `scrollTo` / `matchMedia`** — guard `scrollTo` (`typeof el.scrollTo === 'function'`); `matchMedia` is stubbed in `tests/setup.ts`.
- Vitest has `css: false` so Tailwind PostCSS stays out of unit tests; `next/font` and `next/link` are mocked in `tests/setup.ts`.
- Dev server runs on **:3001** here (3000 was occupied); `npm run dev` picks a free port.

**Commands:**
```bash
npm run dev      # local dev (Turbopack)
npm test         # vitest run  (currently 65 passing, 15 files)
npm run lint     # eslint      (currently clean)
npm run build    # next build  (currently passes; 91 lessons prerender static)
npm run qa:rendered # production build + headless Chrome rendered QA
npm run audit:curriculum # static lesson contract audit
npm run audit:docs # live Claude Code docs coverage audit
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
7. **TDD + small commits.** Tests live in `tests/`. Keep `npm run audit:curriculum`, `npm test`, `npm run lint`, and `npm run build` green before each commit. Commit per task. End commit messages with the project's Co-Authored-By trailer.
8. **Real content only.** No placeholder/junk copy. No fake controls (a not-yet-wired control should be an honest hint, like the ⌘K `<kbd>`).

---

## 4. File map (current)

```
src/
  app/
    layout.tsx              # Inter+Fira fonts, renders global <Chrome/>
    globals.css             # Tailwind v4 @theme OKLCH tokens, z-scale, focus, reduced-motion
    page.tsx                # Home: command-first landing, Commands Lab, Forest, and <LessonList/>
    lessons/[slug]/page.tsx # Split-screen: <LessonPane/> + <TerminalSession/>; notFound() on bad slug; generateStaticParams
  components/
    chrome/Chrome.tsx           # sticky terminal bar (dots, wordmark, breadcrumb slot, real ⌘K trigger)
    chrome/CommandPalette.tsx   # searchable lesson palette with Done/Now/Locked states
    dashboard/CommandLearningPanel.tsx # Commands Lab: pure slash-command learning sessions
    dashboard/LessonList.tsx    # progress meter + numbered rows + Done/Now/Locked; locked = non-navigable
    impact/                     # Impact math UI: Forest dashboard, Plant reward, cascade controls, metric formatting
    lesson/LessonPane.tsx       # editorial left pane: concept, signature + inline tip banking, Plant reward, prev/next
    lesson/TerminalSession.tsx  # animated session player + optional type-it-yourself challenge
    ui/icons.tsx                # in-house Check/Lock/ArrowLeft/ArrowRight (no icon dep)
  lib/
    types.ts            # TrackInfo, Lesson, Tip, SessionLine, TerminalChallenge, Progress, Track
    lessons.ts          # 91 lessons across Beginner, Feature Modules, Power User Modules, and Team Modules
    command-learning.ts # 5 pure command learning sessions covering 20 highlighted slash commands
    impact.ts           # exact cost, eco ranges, cascade factors, banked-tip totals
    progress.ts         # localStorage progress: bankTip + pure *In(progress,...) derivations + wrappers
    use-progress.ts     # useProgress() store (useSyncExternalStore) + bankTipNow()
    use-reduced-motion.ts # usePrefersReducedMotion() (useSyncExternalStore)
tests/                  # 15 suites, 65 tests (setup.ts mocks next/font, next/link, localStorage, matchMedia)
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
- **Lesson model + 273-tip registry + localStorage progress** (`8236f29`), now extended with track metadata, feature-family metadata, official docs references, and explicit efficiency habits.
- **Editorial dashboard** (track sections, progress meters, Done/Now/Locked; locked lessons are non-navigable so banking a signature tip unlocks the next lesson in that track) and **split-screen lesson page** (`7f17e54`).
- **Live animated terminal sessions + real per-lesson content** (`8c6e3e3`): `TerminalSession` plays each lesson's scripted Claude Code session (prompts type out, tool/output lines stream, ends on a tokens-saved tally; autoplay + Replay; reduced-motion renders the full transcript instantly). Every lesson has a `concept` + a `session`.
- **Impact System foundations** (`ad96ab1`): `impact.ts`, exact Sonnet input-token cost math, honest eco ranges, cascade controls, methodology page, Plant reward, and Forest dashboard.
- **273-tip banking pass**: inline tips are visible and bankable in each lesson, the Forest tracks 273 trees, signature tips still drive lesson completion/unlock.
- **Feature-module curriculum plan**: `docs/plans/2026-06-04-claude-code-feature-curriculum.md` maps Claude Code features to module tracks and efficiency hooks, with a repeatable official-index coverage audit and build sequence.
- **Dashboard feature maps**: each track summarizes feature families with module counts and bankable token-habit counts, then jumps to the matching module rows without bypassing locked lessons.
- **Learner-facing module brief**: every lesson pane now surfaces the feature family, estimated format/time, explicit efficient habit, and official docs links before the concept and terminal session.
- **Learner-facing module path**: every lesson names the teaching sequence: what it is, how it works, how to use it, and how to use it efficiently.
- **Command-first landing layer**: the home page now starts with a pure Commands Lab covering 5 workflow sessions and 20 highlighted slash commands, then connects learners to impact and the full module tracks.
- **Feature Modules track**: 24 shipped modules covering Agent loop, Prompt input, Continue/resume, Slash commands, Search/read, CLAUDE.md, Context window, Built-in tools, Bash/PowerShell, Permission modes, Checkpointing, quickstart/install/login, install troubleshooting, terminal configuration, keybindings, status line, fullscreen rendering, voice dictation, output styles, fast mode, sandbox environments, dev containers, runtime troubleshooting, and environment variables. Each teaches what it is, how it works, how to use it, and how to use it efficiently with a bankable token-saving habit.
- **Power User Modules track**: 26 shipped modules covering Custom slash commands, Skills, Subagents, Hooks, MCP, Plugins, Plugin distribution, Worktrees, Agent view, Agent teams, Dynamic workflows, Goals, Scheduled tasks/routines, VS Code, JetBrains, Desktop, Chrome/computer use, GitHub Actions, GitLab CI/CD, Code Review, Slack/Remote Control, web/cloud sessions, channels, deep links, security guidance plugin, and ultrareview. Each includes official docs refs, a typed terminal challenge, and a token-efficiency habit.
- **Team Modules track**: 33 shipped modules covering Agent SDK, headless automation, SDK sessions, SDK permissions/user input, SDK streaming, structured outputs, custom tools, tool search, cost tracking, observability, hosting/session storage, secure deployment, organization setup, analytics/monitoring, managed settings, managed MCP, security/data usage, network gateways, GitHub Enterprise Server, Bedrock, Vertex AI, Microsoft Foundry, Claude Platform on AWS, rollout kits, SDK agent loop, SDK migration, SDK plugins, SDK skills, SDK slash commands, SDK subagents, SDK todo lists, Python SDK reference orientation, and release awareness through changelog/What's new. Each includes official docs refs, a typed terminal challenge, and a token-efficiency habit.
- **Type-it-yourself terminal core**: lessons 3, 4, and 5 plus all Power User and Team lessons now include terminal challenges with `?` hints, `reset`, incorrect feedback, and scripted success output.
- **Command palette**: real `⌘K` palette ranks multi-term matches across lessons/features/docs refs/tips/efficiency habits, focuses search on open, traps Tab focus while open, resets cleanly on Escape, shows Done/Now/Locked states, and only exposes navigable links for unlocked lessons.
- **Lesson checks + branded 404**: each lesson has a low-stakes check with explain-on-wrong feedback, and `/not-found` uses the dual-tone house style.
- **Release hardening pass**: axe-core structural a11y coverage for chrome, Forest, lesson, terminal, and 404; semantic Forest markers; skip link to main content; command-palette focus trap; mobile overflow fixes; reduced-motion terminal remounts into the full transcript.

**Verified:** 65/65 tests, lint clean, production build passes (`/`, `/how-we-calculate`, all 91 lessons prerender static; 96 static pages total). `npm run audit:curriculum` reports 91 lessons, 273 tips, 75 challenges, 145 unique docs refs, 91/91 four-part teaching paths, and 0 contract errors. `npm run audit:docs` fetches the live official Claude Code docs index and currently reports 145 live pages, 145 unique lesson refs, 0 missing, and 0 stale. `npm run qa:rendered` starts production `next start` on a free port and drives local headless Chrome through DevTools Protocol: command learning landing panel, dashboard feature maps and jump links, module brief visibility, module paths, official docs links, efficiency habits, ranked command palette search, bash and skills terminal challenges, Replay clearing challenge output, multi-tip Forest state, Plant and Forest Team-of-20 cascade scaling, newest-tree marker/count, command palette locked-result non-navigation, unlocked Enter navigation, desktop/mobile overflow, and browser console/runtime errors. Rendered browser QA used isolated headless Chrome DevTools Protocol because the MCP Playwright profile was locked: banked `bash-commands`, confirmed Plant reward, cascade scaling, Forest newest-tree glow/count, reduced-motion final token state, no console/runtime errors, and no horizontal overflow. Forest craft QA now covers the denser 273-tree field, empty-state guidance, next-tree prompt, metric legibility, team cascade scaling, desktop/mobile layouts, no console/runtime errors, and no horizontal overflow. Terminal interaction QA also covered reduced-motion typed challenges on `bash-commands`: hint, incorrect feedback, reset, success output, Replay clearing challenge output, mobile success, no console/runtime errors, and no horizontal overflow. Terminal instruction QA now covers the left-pane type-it-yourself brief on `bash-commands` at desktop and mobile widths: challenge heading, terminal prompt, `?`/`reset` affordances, no console/runtime errors, no horizontal overflow, and no overlap with the signature tip. Command palette QA covered mouse open, focused search, multi-term feature/habit ranking, locked search results, Escape close/reset, keyboard shortcut open, unlocked Enter navigation, mobile search/close, no console/runtime errors, and no horizontal overflow. P4 keyboard/perf smoke covers skip link, palette focus trap, lesson bank/check/terminal/replay tab reachability, reduced-motion terminal input reachability, 91 ms home DOMContentLoaded / 124 ms load, 70 ms lesson DOMContentLoaded / 85 ms load, no console/runtime errors. Formal Lighthouse on production `next start` covers `/` and `/lessons/bash-commands`: 97 performance, 100 accessibility, 100 best practices, 100 SEO, 100 agentic browsing on both routes; label/content-name passes; FCP 0.8-0.9 s, LCP 2.6 s, TBT 0 ms, CLS 0.

---

## 6. NEXT STEPS (prioritized)

### P1 polish — Impact System QA and craft
The Impact System is implemented and `npm run qa:rendered` now covers Plant reward, Forest update, Team-of-20 cascade scaling, and newest-tree marker/count in a committed rendered harness. Remaining:
1. Optional follow-up: expand the harness if new Impact states are added.

### P2 polish — Interactive terminal QA and expansion
Core type-it-yourself challenges are implemented and rendered QA covers hint, incorrect, reset, success, Replay, mobile success, reduced-motion behavior, overflow checks, and the left-pane challenge brief on `bash-commands`. Remaining work:
1. Add type challenges to future feature modules as they are created.
2. Optional follow-up: expand `npm run qa:rendered` as new challenge patterns are added.

### P2.5 — Feature-module expansion
The master plan now has a **Feature-module curriculum expansion** section and detailed plan file. Use the official Claude Code docs index (`https://code.claude.com/docs/llms.txt`) as the source map. Each new module must teach what the feature is, how it works, how to use it, and the token-efficiency habit attached to that feature.
Feature Modules, Power User Modules, and Team Modules are shipped through the release-awareness slice. The live docs index has 145 unique pages and all 145 are referenced by lessons. The final docs gap was closed by the `whats-new-changelog` module, which teaches how to scope release-note review to a workflow and version window.
1. Run `npm run audit:docs` before each curriculum slice because Claude Code features and docs move quickly.
2. When new docs appear, add a module only if it teaches durable user behavior, not release-note trivia.

### P3 polish — Command palette QA
Core `⌘K` palette is implemented and rendered QA covers mouse open, focused search, locked results, Escape close/reset, keyboard shortcut open, unlocked Enter navigation, mobile search/close, and overflow checks. Remaining work:
1. Add future feature modules to palette results once those lessons exist.
2. Consider richer fuzzy ranking if the lesson count grows beyond the first tracks.
3. Optional follow-up: expand `npm run qa:rendered` if new palette result states are added.

### P4 — Content & polish
Manual keyboard smoke, basic rendered load timing, formal Lighthouse/perf reporting, and manual Vercel production deploy are complete. Remaining:
1. Add the GitHub login connection in Vercel if automatic deploys from `origin/main` are desired.

### Backlog / Phase 3+ (from the master plan)
Intermediate/advanced tracks, accounts/cloud sync, real shell integration, sharing. Out of MVP.

---

## 7. Honest current gaps (don't represent these as done)
- Impact rendered QA now has a committed `npm run qa:rendered` harness for Plant reward, multi-tip Forest state, Team-of-20 cascade scaling, and newest-tree marker/count.
- The terminal rendered QA covers desktop/mobile/reduced-motion screenshots plus guided hint, incorrect, reset, success, Replay flows, and left-pane challenge instruction placement. Remaining terminal work is future-module expansion.
- The command palette has unit, axe, build, and rendered desktop/mobile interaction coverage. Remaining palette work is future expansion and optional fuzzy ranking.
- The branded 404 has test, axe, build, and desktop screenshot coverage.
- P4 has rendered keyboard/perf smoke, a formal Lighthouse report, and a manual production Vercel deployment. Automatic GitHub-linked deploys are not connected yet.

---

## 8. Start here
1. `npm install && npm test && npm run dev` — confirm green and click through `/` → a lesson → bank a tip → watch it unlock.
2. Continue with the Vercel GitHub connection if automatic deploys are needed, or add rendered coverage for any new feature-module/challenge pattern.
3. Keep commits small; keep test/lint/build green; follow §3 conventions.
