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
    chrome/Chrome.tsx           # sticky terminal bar (dots, wordmark, breadcrumb slot, ⌘K hint)
    dashboard/LessonList.tsx    # progress meter + numbered rows + Done/Now/Locked; locked = non-navigable
    lesson/LessonPane.tsx       # editorial left pane: numeral+title, context, "The idea" concept, signature-tip card + bank button, prev/next
    lesson/TerminalSession.tsx  # THE animated session player (autoplay + Replay, reduced-motion safe)
    ui/icons.tsx                # in-house Check/Lock/ArrowLeft/ArrowRight (no icon dep)
  lib/
    types.ts            # Lesson, Tip, SessionLine, Progress, Track
    lessons.ts          # 8 lessons: context + concept + scripted session + 3 tips each (1 signature)
    progress.ts         # localStorage progress: bankTip + pure *In(progress,...) derivations + wrappers
    use-progress.ts     # useProgress() store (useSyncExternalStore) + bankTipNow()
    use-reduced-motion.ts # usePrefersReducedMotion() (useSyncExternalStore)
tests/                  # 8 suites, 20 tests (setup.ts mocks next/font, next/link, localStorage, matchMedia)
```

Data model: each `Lesson` has `tips: Tip[]` (exactly 3, one `kind:'signature'`) and `session: SessionLine[]`.
`SessionLine.kind` ∈ `prompt|reply|thinking|tool|out|good|warn|rule|impact`. The `impact` line carries
`savedTokens` + `note`. `Tip.savedTokens` is an illustrative per-use estimate.

---

## 5. What is DONE (Phase 1 + the live terminal)

- **Scaffold + test harness** (commit `87c1919`).
- **Dual-tone design system**: OKLCH tokens, Inter/Fira fonts, terminal-native house chrome (`aadb43d`).
- **Lesson model + 24-tip registry + localStorage progress** (`8236f29`).
- **Editorial dashboard** (progress meter, Done/Now/Locked; locked lessons are non-navigable so banking a tip unlocks the next) and **split-screen lesson page** (`7f17e54`).
- **Live animated terminal sessions + real per-lesson content** (`8c6e3e3`): `TerminalSession` plays each lesson's scripted Claude Code session (prompts type out, tool/output lines stream, ends on a tokens-saved tally; autoplay + Replay; reduced-motion renders the full transcript instantly). Every lesson has a `concept` + a `session`.

**Verified:** 20/20 tests, lint clean, production build passes (all 8 lessons prerender static), animation confirmed in-browser (desktop + mobile stack, bank→unlock flow, 404, clean console / no hydration errors).

---

## 6. NEXT STEPS (prioritized)

### P1 — Phase 2: The Impact System (the other half of the "wow"; the user is most excited about this)
Per `DESIGN.md` §6. Token efficiency → visible impact.
1. **`src/lib/impact.ts`** — pure functions: `tokensToCost(tokens)` (exact, from a model-pricing constant; document the assumed $/Mtok), and `tokensToEco(tokens)` returning **ranges** `{ whLo, whHi, mlLo, mlHi, co2Lo, co2Hi }` from published per-token estimates. Keep ranges honest (`~`, low–high). Unit-test it.
2. **`/how-we-calculate` methodology page** — states the pricing constant + cites the eco sources + assumptions. Link to it from every impact figure. (Credibility is a hard requirement, `DESIGN.md` §6c.)
3. **Plant reward** — replace `LessonPane`'s static "Tip banked" confirmation with a coded-vector **growing-plant SVG animation** (stem draws, leaves pop), the tokens-saved hero number counting up, and the four impact metrics (cost exact; energy/water/CO₂ as sourced ranges). Reduced-motion: final state instantly. Reference mock built during design lives at `.superpowers/brainstorm/*/content/impact-reward.html`.
4. **Cascade toggle** (core, `DESIGN.md` §6a) — `Per use → Daily habit (×2,500/yr) → Team of 20 (×50,000)` rescales every figure. Present on the Plant reward and the Forest dashboard.
5. **Forest dashboard** — on `/` (above or replacing the bare meter): each banked tip = a tree (sprout→sapling→forest), a cumulative ledger of totals (cost/water/energy/CO₂). Reference mock: same brainstorm dir (`reward-options.html`, option 4).
   - **Acceptance:** banking a tip shows the animated Plant with honest numbers + cascade; the home Forest grows and tallies; methodology page exists and is linked; reduced-motion clean; tests for `impact.ts`; lint+build green.

### P2 — Interactive terminal (type-it-yourself)
Extend `TerminalSession` (or add a sibling) so lessons 3/4/5 let the user **type a command and get scripted output**, with `?`-for-hint and `reset`, plus correct/incorrect detection. Today it only autoplays/replays. Keep the same line-rendering + reduced-motion model.

### P3 — Command palette (⌘K)
Wire the `Chrome` ⌘K hint to a real palette: fuzzy search all lessons, show Done/Now/Locked inline, keyboard-first, navigate on select. Use native `<dialog>`/portal (avoid clipping). Replace the `<kbd>` hint with the real trigger.

### P4 — Content & polish
- **Lesson "Check"** (lesson anatomy step 4): a small MCQ / fill-in-the-blank per lesson with explain-on-wrong (not graded). Surface the two **inline (non-signature) tips** in each lesson.
- Branded **404**, Lighthouse/perf pass, full a11y audit on both surfaces, then **Vercel deploy**.

### Backlog / Phase 3+ (from the master plan)
Intermediate/advanced tracks, accounts/cloud sync, real shell integration, sharing. Out of MVP.

---

## 7. Honest current gaps (don't represent these as done)
- Banking a tip shows a clean **static** confirmation, not the animated Plant yet (P1).
- The terminal **autoplays/replays**; you cannot type into it yet (P2).
- ⌘K is a visual hint only (P3).
- No methodology page yet, so impact eco numbers are not yet shown anywhere user-facing except illustrative session tallies (P1 formalizes them).
- 404 is Next's default (P4).

---

## 8. Start here
1. `npm install && npm test && npm run dev` — confirm green and click through `/` → a lesson → bank a tip → watch it unlock.
2. Begin **P1 step 1** (`src/lib/impact.ts`, test-first).
3. Keep commits small; keep test/lint/build green; follow §3 conventions.
