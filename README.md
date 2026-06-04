# Claude Code Interactive Tutorials

An interactive tutorial platform for learning Claude Code by doing. Each module teaches what a feature is, how it works, how to use it, and how to use it efficiently with a bankable token-saving habit.

## Commands

```bash
npm run dev          # local development
npm test             # Vitest component and data tests
npm run lint         # ESLint
npm run build        # production build
npm run qa:rendered  # production build plus headless Chrome rendered QA
npm run audit:curriculum # static lesson contract audit
npm run audit:docs   # live Claude Code docs coverage audit
```

`npm run qa:rendered` starts `next start` on a free port and drives a local Chrome or Chromium binary through DevTools Protocol. If Chrome is not installed in a standard location, set `CHROME_PATH` to the browser binary.

## Current Coverage

- 91 lessons across Beginner, Feature Modules, Power User Modules, and Team Modules.
- 273 bankable token-saving tips.
- Dashboard feature maps summarize each track by Claude Code feature family, module count, and token-habit count.
- Curriculum audit checks the lesson contract: feature metadata, docs refs, guided sessions, checks, challenges, impact lines, and token-saving tips.
- Live docs audit checks the official Claude Code docs index against lesson `docsRefs`.
- Rendered QA covers dashboard feature maps, module brief visibility, official docs links, efficiency habits, multiple terminal challenge flows, Replay, multi-tip Forest state, Plant and Forest cascade scaling, newest-tree marker/count, command palette locked/unlocked behavior, desktop/mobile overflow, and browser console/runtime errors.

## Development Notes

- Browser-backed state must use the existing `useSyncExternalStore` pattern.
- Do not read `localStorage` during initial render or render-time state initialization.
- Keep user-facing copy free of em dashes and placeholder text.
- Before committing, run `npm run audit:curriculum`, `npm run audit:docs`, `npm test`, `npm run lint`, and `npm run build`. Run `npm run qa:rendered` for UI or rendered-flow changes.
