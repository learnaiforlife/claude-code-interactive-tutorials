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
npm test         # vitest run  (currently 20 passing, 8 files)
npm run lint     # eslint      (currently clean)
npm run build    # next build  (currently passes; 8 lessons prerender static)
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
    types.ts            # Lesson, Tip, SessionLine, TerminalChallenge, Progress, Track
    lessons.ts          # 8 lessons: context + concept + scripted session + 3 tips each (1 signature)
    impact.ts           # exact cost, eco ranges, cascade factors, banked-tip totals
    progress.ts         # localStorage progress: bankTip + pure *In(progress,...) derivations + wrappers
    use-progress.ts     # useProgress() store (useSyncExternalStore) + bankTipNow()
    use-reduced-motion.ts # usePrefersReducedMotion() (useSyncExternalStore)
tests/                  # 11 suites, 33 tests (setup.ts mocks next/font, next/link, localStorage, matchMedia)
```

Data model: each `Lesson` has `tips: Tip[]` (exactly 3, one `kind:'signature'`) and `session: SessionLine[]`.
`SessionLine.kind` ∈ `prompt|reply|thinking|tool|out|good|warn|rule|impact`. The `impact` line carries
`savedTokens` + `note`. `Tip.savedTokens` is an illustrative per-use estimate.
Lessons 3, 4, and 5 also have `challenge?: TerminalChallenge` for type-it-yourself exercises.

---

## 5. What is DONE (Phase 1 + the live terminal)

- **Scaffold + test harness** (commit `87c1919`).
- **Dual-tone design system**: OKLCH tokens, Inter/Fira fonts, terminal-native house chrome (`aadb43d`).
- **Lesson model + 24-tip registry + localStorage progress** (`8236f29`).
- **Editorial dashboard** (progress meter, Done/Now/Locked; locked lessons are non-navigable so banking a tip unlocks the next) and **split-screen lesson page** (`7f17e54`).
- **Live animated terminal sessions + real per-lesson content** (`8c6e3e3`): `TerminalSession` plays each lesson's scripted Claude Code session (prompts type out, tool/output lines stream, ends on a tokens-saved tally; autoplay + Replay; reduced-motion renders the full transcript instantly). Every lesson has a `concept` + a `session`.
- **Impact System foundations** (`ad96ab1`): `impact.ts`, exact Sonnet input-token cost math, honest eco ranges, cascade controls, methodology page, Plant reward, and Forest dashboard.
- **24-tip banking pass**: inline tips are visible and bankable in each lesson, the Forest tracks 24 trees, signature tips still drive lesson completion/unlock.
- **Feature-module curriculum plan**: `docs/plans/2026-06-04-claude-code-feature-curriculum.md` maps Claude Code features to module tracks and efficiency hooks.
- **Type-it-yourself terminal core**: lessons 3, 4, and 5 now include terminal challenges with `?` hints, `reset`, incorrect feedback, and scripted success output.
- **Command palette**: real `⌘K` palette searches lessons/features/tips, shows Done/Now/Locked states, and only exposes navigable links for unlocked lessons.
- **Lesson checks + branded 404**: each lesson has a low-stakes check with explain-on-wrong feedback, and `/not-found` uses the dual-tone house style.

**Verified:** 33/33 tests, lint clean, production build passes (`/`, `/how-we-calculate`, all 8 lessons prerender static). Browser screenshot tooling was blocked by an occupied Playwright profile during the latest pass; route HTML was verified via the running dev server on `:3001`.

---

## 6. NEXT STEPS (prioritized)

### P1 polish — Impact System QA and craft
The Impact System is implemented, but still needs a real browser screenshot pass once the Playwright profile lock is cleared.
1. Visual QA desktop + mobile: home Forest, lesson inline-tip banking, Plant reward, cascade toggle states.
2. Reduced-motion browser QA: Plant final state, no count-up movement, terminal transcript still instant.
3. Craft pass: newest-tree glow, Forest density, mobile wrapping, empty-state language, metric legibility.

### P2 polish — Interactive terminal QA and expansion
Core type-it-yourself challenges are implemented for lessons 3, 4, and 5. Remaining work:
1. Browser QA once the Playwright profile lock clears: desktop, mobile, reduced motion, Replay after challenge.
2. Consider moving the challenge intro from terminal-only into the left lesson pane for stronger instruction.
3. Add type challenges to future feature modules as they are created.

### P2.5 — Feature-module expansion
The master plan now has a **Feature-module curriculum expansion** section and detailed plan file. Use the official Claude Code docs index (`https://code.claude.com/docs/llms.txt`) as the source map. Each new module must teach what the feature is, how it works, how to use it, and the token-efficiency habit attached to that feature.

### P3 polish — Command palette QA
Core `⌘K` palette is implemented. Remaining work:
1. Browser QA once Playwright profile lock clears: mouse open, keyboard shortcut, search, close, mobile layout.
2. Add future feature modules to palette results once those lessons exist.
3. Consider richer fuzzy ranking if the lesson count grows beyond the first tracks.

### P4 — Content & polish
- Lighthouse/perf pass, full a11y audit on both surfaces, then **Vercel deploy**.

### Backlog / Phase 3+ (from the master plan)
Intermediate/advanced tracks, accounts/cloud sync, real shell integration, sharing. Out of MVP.

---

## 7. Honest current gaps (don't represent these as done)
- Latest Impact UI has not had a screenshot-based browser QA pass because the Playwright profile was locked.
- The terminal now supports guided typing for lessons 3, 4, and 5, but it has not had screenshot-based browser QA.
- The command palette has test coverage and build coverage, but not screenshot-based browser QA.
- The branded 404 has test and build coverage, but not screenshot-based browser QA.

---

## 8. Start here
1. `npm install && npm test && npm run dev` — confirm green and click through `/` → a lesson → bank a tip → watch it unlock.
2. Continue with **P1 polish** or start **P2** interactive terminal.
3. Keep commits small; keep test/lint/build green; follow §3 conventions.
