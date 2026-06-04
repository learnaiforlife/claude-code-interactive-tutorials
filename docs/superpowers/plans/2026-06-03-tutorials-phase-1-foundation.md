# Claude Code Tutorials — Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js app with the dual-tone design tokens, a typed lesson model, persistent progress, the terminal-native house chrome, an editorial dashboard, and a split-screen lesson route — so a user can browse the track, open a lesson, bank a tip, and have progress persist.

**Architecture:** Next.js App Router (TypeScript). Content/state live in pure, unit-tested TS libraries (`lib/lessons.ts`, `lib/progress.ts`) that are framework-agnostic; React components consume them. The lesson page renders the V2 Dual-Tone split layout with a *placeholder* terminal pane (real simulator = Phase 3) and a *placeholder* bank-tip confirmation (real Plant reward = Phase 2). Design tokens are CSS-first (Tailwind v4 `@theme`).

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vitest + @testing-library/react + jsdom · deployed later to Vercel.

**Spec sources:** `PRODUCT.md`, `DESIGN.md` (visual system, Impact, tips §7), `docs/plans/2026-06-03-claude-code-tutorials-platform.md` (IA §4, lessons §6, MVP §8).

---

## File Structure (Phase 1)

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts + globals + <Chrome/>
│   ├── globals.css             # Tailwind v4 import + @theme OKLCH tokens
│   ├── page.tsx                # Dashboard (editorial track list)
│   └── lessons/
│       └── [slug]/page.tsx     # Split-screen lesson page
├── components/
│   ├── chrome/Chrome.tsx       # Terminal-native house top bar
│   ├── dashboard/LessonList.tsx# Editorial numbered lesson rows + badges
│   └── lesson/
│       ├── LessonPane.tsx      # Editorial content (left pane)
│       └── TerminalPlaceholder.tsx # Stub for Phase 3 simulator
└── lib/
    ├── types.ts                # Lesson, Tip, Track, Progress types
    ├── lessons.ts              # Lesson registry + accessors
    └── progress.ts             # localStorage progress
tests/
├── lessons.test.ts
├── progress.test.ts
├── chrome.test.tsx
├── lesson-list.test.tsx
└── lesson-page.test.tsx
```

Responsibilities: `lib/*` is pure logic (no React) → fully unit-tested. `components/*` are focused, single-purpose, and consume `lib`. Routes wire components together. Files that change together (a component + its test) stay adjacent.

---

### Task 1: Scaffold project + test harness

**Files:**
- Create: project via `create-next-app`, then `vitest.config.ts`, `tests/setup.ts`, `tests/smoke.test.tsx`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Scaffold Next.js (App Router, TS, Tailwind, src dir)**

Run in the project root (it already contains PRODUCT.md/DESIGN.md/docs — answer "yes" to proceed in a non-empty dir if prompted):

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --use-npm --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths
```

- [ ] **Step 3: Write Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

- [ ] **Step 4: Write test setup file**

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 5: Add test scripts to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Write the smoke test**

Create `tests/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';

function Hello() {
  return <h1>Claude Code Tutorials</h1>;
}

test('test harness renders a component', () => {
  render(<Hello />);
  expect(screen.getByRole('heading', { name: 'Claude Code Tutorials' })).toBeInTheDocument();
});
```

- [ ] **Step 7: Run the smoke test (verify harness works)**

Run: `npm test`
Expected: PASS — 1 test passing. (If it fails to find jsdom or the alias, re-check `vitest.config.ts`.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app + Vitest/RTL test harness"
```

---

### Task 2: Design tokens + fonts (dual-tone)

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Test: `tests/tokens.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/tokens.test.tsx` — assert the root layout wires the font CSS variables onto `<html>`:

```tsx
import { render } from '@testing-library/react';
import { test, expect } from 'vitest';
import RootLayout from '@/app/layout';

test('root layout exposes sans + mono font variables', () => {
  const { container } = render(
    <RootLayout><div>child</div></RootLayout>
  );
  const html = container.querySelector('html');
  expect(html?.className).toMatch(/--font-sans|font-sans/);
  expect(html?.className).toMatch(/--font-mono|font-mono/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/tokens.test.tsx`
Expected: FAIL — default layout has no mono font variable.

- [ ] **Step 3: Write the OKLCH token theme**

Replace `src/app/globals.css` with (tokens copied from `DESIGN.md` §4):

```css
@import "tailwindcss";

@theme {
  --color-canvas: oklch(0.11 0.012 250);
  --color-paper: oklch(0.985 0.004 120);
  --color-terminal: oklch(0.09 0.01 235);
  --color-border: oklch(0.22 0.01 250);
  --color-border-soft: oklch(0.90 0.01 120);
  --color-ink: oklch(0.16 0.01 250);
  --color-ink-soft: oklch(0.45 0.01 250);
  --color-text-dark: oklch(0.92 0.01 250);
  --color-text-mute: oklch(0.55 0.01 250);
  --color-accent-green: oklch(0.62 0.15 155);
  --color-accent-amber: oklch(0.62 0.14 65);
  --color-accent-blue: oklch(0.55 0.13 235);
}

html { background: var(--color-canvas); color: var(--color-text-dark); }
body { margin: 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 4: Wire fonts in the root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import Chrome from '@/components/chrome/Chrome';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = Fira_Code({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Claude Code Tutorials',
  description: 'Learn Claude Code the efficient, responsible way. AI is not for everything.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Chrome />
        {children}
      </body>
    </html>
  );
}
```

> Note: `Chrome` is created in Task 5. Until then this import will fail typecheck — that's fine; Task 2's test targets only the font wiring and you'll create a temporary stub now. Create `src/components/chrome/Chrome.tsx` with `export default function Chrome() { return null; }` to keep it compiling; Task 5 replaces the body.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/tokens.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: dual-tone OKLCH design tokens + Inter/Fira fonts"
```

---

### Task 3: Lesson model + registry (`lib/lessons.ts`)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/lessons.ts`
- Test: `tests/lessons.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lessons.test.ts`:

```ts
import { test, expect } from 'vitest';
import { getAllLessons, getLesson, getAdjacent, signatureTip } from '@/lib/lessons';

test('there are 8 beginner lessons in order 1..8', () => {
  const all = getAllLessons();
  expect(all).toHaveLength(8);
  expect(all.map(l => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test('getLesson returns the lesson for a known slug, undefined otherwise', () => {
  expect(getLesson('bash-commands')?.title).toMatch(/bash/i);
  expect(getLesson('nope')).toBeUndefined();
});

test('every lesson has exactly 3 tips and exactly one signature tip', () => {
  for (const lesson of getAllLessons()) {
    expect(lesson.tips).toHaveLength(3);
    expect(lesson.tips.filter(t => t.kind === 'signature')).toHaveLength(1);
    expect(signatureTip(lesson).id).toBe(lesson.tips.find(t => t.kind === 'signature')!.id);
  }
});

test('getAdjacent gives prev/next by order', () => {
  const adj = getAdjacent('bash-commands'); // order 3
  expect(adj.prev?.slug).toBe('effective-prompting');
  expect(adj.next?.slug).toBe('creating-skills');
  expect(getAdjacent('what-is-claude-code').prev).toBeNull();
  expect(getAdjacent('common-mistakes').next).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lessons.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the types**

Create `src/lib/types.ts`:

```ts
export type Track = 'beginner' | 'intermediate' | 'advanced';
export type TipKind = 'signature' | 'inline';

export interface Tip {
  id: string;          // unique, e.g. 'l3-grep'
  title: string;       // short imperative
  detail: string;      // one-line "why it saves"
  kind: TipKind;
  savedTokens: number; // illustrative per-use estimate; methodology in Phase 2
}

export interface Lesson {
  slug: string;
  order: number;
  track: Track;
  title: string;
  estimatedMinutes: number;
  format: string;
  context: string;     // 1–3 sentences, no padding
  tips: Tip[];         // exactly 3, exactly one 'signature'
}

export interface Progress {
  bankedTips: Record<string, string[]>; // lessonSlug -> tipId[]
}
```

- [ ] **Step 4: Write the registry + accessors**

Create `src/lib/lessons.ts` (tip titles/details from `DESIGN.md` §7; `savedTokens` are illustrative estimates):

```ts
import type { Lesson } from './types';

const LESSONS: Lesson[] = [
  {
    slug: 'what-is-claude-code', order: 1, track: 'beginner',
    title: 'What Claude Code is and how to think about it',
    estimatedMinutes: 5, format: 'Concept + quiz',
    context: 'Claude Code is a terminal-native AI agent. Before anything else, learn when to reach for it — and when not to.',
    tips: [
      { id: 'l1-litmus', kind: 'signature', savedTokens: 2000, title: 'AI is not for everything — run the litmus', detail: 'Could a command, your editor, or your own memory do this for 0 tokens? If yes, do that.' },
      { id: 'l1-context-cost', kind: 'inline', savedTokens: 1200, title: "Context isn't free or one-time", detail: 'Claude re-reads the whole conversation every turn.' },
      { id: 'l1-model-match', kind: 'inline', savedTokens: 1500, title: 'Match the model to the task', detail: 'Opus for hard reasoning, Haiku for mechanical bulk.' },
    ],
  },
  {
    slug: 'effective-prompting', order: 2, track: 'beginner',
    title: 'How to prompt Claude Code effectively',
    estimatedMinutes: 8, format: 'Interactive exercise',
    context: 'A precise prompt is the cheapest optimization there is — it prevents the back-and-forth that re-sends everything.',
    tips: [
      { id: 'l2-precise', kind: 'signature', savedTokens: 1800, title: 'One precise prompt beats five vague ones', detail: 'Each clarify→retry round re-sends the entire context.' },
      { id: 'l2-scope', kind: 'inline', savedTokens: 1000, title: 'Scope the context', detail: 'Name the files/dirs to touch instead of "look around the repo".' },
      { id: 'l2-shape', kind: 'inline', savedTokens: 600, title: 'Ask for the output shape', detail: '"Just the diff" / "one-line answer" stops you paying for padding.' },
    ],
  },
  {
    slug: 'bash-commands', order: 3, track: 'beginner',
    title: 'How to run bash commands from Claude Code',
    estimatedMinutes: 10, format: 'Terminal sim + challenge',
    context: 'Claude can run shell commands for you — but reading whole files into context is the classic token sink.',
    tips: [
      { id: 'l3-grep', kind: 'signature', savedTokens: 3200, title: "Search, don't slurp", detail: 'grep/glob to the 5 relevant lines instead of reading whole files.' },
      { id: 'l3-command', kind: 'inline', savedTokens: 2500, title: 'Let a command do deterministic work', detail: 'Rename/move/count/test = 0 model tokens.' },
      { id: 'l3-reference', kind: 'inline', savedTokens: 4000, title: "Reference files & logs, don't paste them", detail: 'Point Claude at the file; no 2,000-line dumps.' },
    ],
  },
  {
    slug: 'creating-skills', order: 4, track: 'beginner',
    title: 'How to create and use skills',
    estimatedMinutes: 12, format: 'Build-along exercise',
    context: 'A skill captures a repeated workflow once, so you stop re-explaining it every session.',
    tips: [
      { id: 'l4-reuse', kind: 'signature', savedTokens: 2200, title: 'A skill replaces a re-explanation', detail: 'Encapsulate a repeated workflow once.' },
      { id: 'l4-claude-md', kind: 'inline', savedTokens: 1500, title: 'Put durable facts in CLAUDE.md', detail: 'Stable project context, prompt-cacheable, not re-derived.' },
      { id: 'l4-tight', kind: 'inline', savedTokens: 800, title: 'Keep skills tight', detail: 'Load detail on demand, not a huge reference every call.' },
    ],
  },
  {
    slug: 'creating-subagents', order: 5, track: 'beginner',
    title: 'How to create and use subagents',
    estimatedMinutes: 12, format: 'Build-along exercise',
    context: 'Subagents are the cleanest way to do heavy reading without polluting your main context.',
    tips: [
      { id: 'l5-context', kind: 'signature', savedTokens: 5000, title: 'Let subagents hold the heavy context', detail: 'They read/search a big surface and return only the conclusion.' },
      { id: 'l5-conclusions', kind: 'inline', savedTokens: 3000, title: 'Demand conclusions, not dumps', detail: 'Hand back the answer, not the files it read.' },
      { id: 'l5-parallel', kind: 'inline', savedTokens: 1200, title: 'Parallelize independent work', detail: 'Independent calls in one turn avoid repeated re-sends.' },
    ],
  },
  {
    slug: 'mcp-overview', order: 6, track: 'beginner',
    title: 'How to view MCP servers and tools',
    estimatedMinutes: 8, format: 'Guided walkthrough',
    context: "Every enabled MCP tool's schema rides in your context on every turn — so knowing what's loaded matters.",
    tips: [
      { id: 'l6-schema-cost', kind: 'signature', savedTokens: 900, title: "Every enabled tool's schema lives in your context", detail: 'Loaded every turn — seeing what is loaded is step one.' },
      { id: 'l6-sprawl', kind: 'inline', savedTokens: 1500, title: 'Spot tool sprawl', detail: 'A dozen servers can dominate the budget before you type.' },
      { id: 'l6-on-demand', kind: 'inline', savedTokens: 2000, title: 'Prefer on-demand tool discovery', detail: 'Lazily loading schemas beats carrying every schema always.' },
    ],
  },
  {
    slug: 'mcp-management', order: 7, track: 'beginner',
    title: 'How to enable, disable, and manage MCP connections',
    estimatedMinutes: 10, format: 'Interactive config sim',
    context: 'Trimming MCP to what a project actually needs is the biggest context win in the toolset.',
    tips: [
      { id: 'l7-disable', kind: 'signature', savedTokens: 2500, title: "Disable what this project doesn't use", detail: 'Unused servers stop riding along every turn.' },
      { id: 'l7-per-project', kind: 'inline', savedTokens: 1500, title: 'Enable per-project, not globally', detail: 'Scope connections to where they are needed.' },
      { id: 'l7-audit', kind: 'inline', savedTokens: 800, title: 'Audit periodically', detail: 'Needs drift; a monthly trim keeps context lean.' },
    ],
  },
  {
    slug: 'common-mistakes', order: 8, track: 'beginner',
    title: 'Common beginner mistakes and best practices',
    estimatedMinutes: 8, format: 'Review + self-check',
    context: 'A few cheap habits eliminate most wasted tokens. Bank them and you are done with the beginner track.',
    tips: [
      { id: 'l8-clear', kind: 'signature', savedTokens: 1500, title: '/clear between unrelated tasks', detail: 'Stale history is re-sent every turn.' },
      { id: 'l8-edit', kind: 'inline', savedTokens: 2000, title: "Edit, don't rewrite", detail: 'Pay only for the lines that change.' },
      { id: 'l8-no-reread', kind: 'inline', savedTokens: 700, title: 'Don\'t re-read to "verify"', detail: 'The harness already tracks file state after an edit.' },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return [...LESSONS].sort((a, b) => a.order - b.order);
}

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find(l => l.slug === slug);
}

export function getLessonsByTrack(track: Lesson['track']): Lesson[] {
  return getAllLessons().filter(l => l.track === track);
}

export function signatureTip(lesson: Lesson) {
  return lesson.tips.find(t => t.kind === 'signature')!;
}

export function getAdjacent(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const all = getAllLessons();
  const i = all.findIndex(l => l.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/lessons.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: typed lesson model + 8-lesson/24-tip registry"
```

---

### Task 4: Progress library (`lib/progress.ts`)

**Files:**
- Create: `src/lib/progress.ts`
- Test: `tests/progress.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/progress.test.ts`:

```ts
import { test, expect, beforeEach } from 'vitest';
import { getProgress, bankTip, isTipBanked, isLessonComplete, trackCompletion, lessonStatus, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('starts empty', () => {
  expect(getProgress().bankedTips).toEqual({});
});

test('banking a tip is idempotent and persists', () => {
  bankTip('bash-commands', 'l3-grep');
  bankTip('bash-commands', 'l3-grep');
  expect(isTipBanked('bash-commands', 'l3-grep')).toBe(true);
  expect(getProgress().bankedTips['bash-commands']).toEqual(['l3-grep']);
});

test('a lesson is complete when its signature tip is banked', () => {
  expect(isLessonComplete('bash-commands')).toBe(false);
  bankTip('bash-commands', 'l3-command'); // inline only
  expect(isLessonComplete('bash-commands')).toBe(false);
  bankTip('bash-commands', 'l3-grep');    // signature
  expect(isLessonComplete('bash-commands')).toBe(true);
});

test('trackCompletion counts complete lessons', () => {
  expect(trackCompletion('beginner')).toEqual({ done: 0, total: 8 });
  bankTip('what-is-claude-code', 'l1-litmus');
  expect(trackCompletion('beginner')).toEqual({ done: 1, total: 8 });
});

test('lessonStatus: first is "now", later locked until predecessor done', () => {
  expect(lessonStatus('what-is-claude-code')).toBe('now');
  expect(lessonStatus('effective-prompting')).toBe('locked');
  bankTip('what-is-claude-code', 'l1-litmus');
  expect(lessonStatus('what-is-claude-code')).toBe('done');
  expect(lessonStatus('effective-prompting')).toBe('now');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/progress.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/lib/progress.ts`:

```ts
import type { Progress, Track } from './types';
import { getAllLessons, getLesson, signatureTip, getLessonsByTrack, getAdjacent } from './lessons';

const KEY = 'cct.progress.v1';
const EMPTY: Progress = { bankedTips: {} };

function read(): Progress {
  if (typeof localStorage === 'undefined') return structuredClone(EMPTY);
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}

function write(p: Progress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProgress(): Progress {
  return read();
}

export function resetProgress(): void {
  write(structuredClone(EMPTY));
}

export function bankTip(slug: string, tipId: string): void {
  const p = read();
  const list = p.bankedTips[slug] ?? [];
  if (!list.includes(tipId)) {
    p.bankedTips[slug] = [...list, tipId];
    write(p);
  }
}

export function isTipBanked(slug: string, tipId: string): boolean {
  return (read().bankedTips[slug] ?? []).includes(tipId);
}

export function isLessonComplete(slug: string): boolean {
  const lesson = getLesson(slug);
  if (!lesson) return false;
  return isTipBanked(slug, signatureTip(lesson).id);
}

export function trackCompletion(track: Track): { done: number; total: number } {
  const lessons = getLessonsByTrack(track);
  return { done: lessons.filter(l => isLessonComplete(l.slug)).length, total: lessons.length };
}

export type LessonStatus = 'done' | 'now' | 'locked';

export function lessonStatus(slug: string): LessonStatus {
  if (isLessonComplete(slug)) return 'done';
  const { prev } = getAdjacent(slug);
  if (prev && !isLessonComplete(prev.slug)) return 'locked';
  return 'now';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/progress.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: localStorage progress lib (bank tips, lesson/track status)"
```

---

### Task 5: House chrome component

**Files:**
- Modify: `src/components/chrome/Chrome.tsx` (replace the Task 2 stub)
- Test: `tests/chrome.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/chrome.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import Chrome from '@/components/chrome/Chrome';

test('renders the wordmark and a Cmd+K affordance', () => {
  render(<Chrome breadcrumb="beginner / 03 · bash-commands" />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
  expect(screen.getByText('⌘K')).toBeInTheDocument();
  expect(screen.getByText(/03 · bash-commands/)).toBeInTheDocument();
});

test('renders without a breadcrumb', () => {
  render(<Chrome />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/chrome.test.tsx`
Expected: FAIL — current stub returns `null`.

- [ ] **Step 3: Write the implementation**

Replace `src/components/chrome/Chrome.tsx`:

```tsx
import Link from 'next/link';

export default function Chrome({ breadcrumb }: { breadcrumb?: string }) {
  return (
    <header
      className="flex items-center gap-3 px-4 py-2 font-mono text-xs"
      style={{ background: 'var(--color-terminal)', borderBottom: '1px solid var(--color-border)' }}
    >
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f56' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#27c93f' }} />
      </span>
      <Link href="/" className="font-bold" style={{ color: 'var(--color-accent-green)' }}>
        claude-code · learn
      </Link>
      <span className="flex-1" style={{ color: 'var(--color-text-mute)' }}>{breadcrumb ?? ''}</span>
      <span
        className="rounded px-1.5 py-0.5"
        style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-mute)' }}
      >
        ⌘K
      </span>
    </header>
  );
}
```

> The root layout (Task 2) renders `<Chrome />` with no breadcrumb. Lesson pages render their own `<Chrome breadcrumb=… />`? No — to avoid double chrome, the layout owns the global Chrome with no breadcrumb. Per-page breadcrumbs are a Phase 4 enhancement; the `breadcrumb` prop exists and is tested now so the API is stable.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/chrome.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: terminal-native house chrome"
```

---

### Task 6: Dashboard (editorial lesson list)

**Files:**
- Create: `src/components/dashboard/LessonList.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/lesson-list.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/lesson-list.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import LessonList from '@/components/dashboard/LessonList';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('renders all 8 lessons as links', () => {
  render(<LessonList />);
  expect(screen.getAllByRole('link')).toHaveLength(8);
  expect(screen.getByText(/Running bash commands|bash commands/i)).toBeInTheDocument();
});

test('reflects done / now / locked status from progress', () => {
  bankTip('what-is-claude-code', 'l1-litmus'); // completes lesson 1
  render(<LessonList />);
  const l1 = screen.getByTestId('lesson-row-what-is-claude-code');
  const l2 = screen.getByTestId('lesson-row-effective-prompting');
  const l3 = screen.getByTestId('lesson-row-bash-commands');
  expect(within(l1).getByText('Done')).toBeInTheDocument();
  expect(within(l2).getByText('Now')).toBeInTheDocument();
  expect(within(l3).getByText('Locked')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lesson-list.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the component**

Create `src/components/dashboard/LessonList.tsx` (client component — reads localStorage):

```tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllLessons } from '@/lib/lessons';
import { lessonStatus, type LessonStatus } from '@/lib/progress';

const BADGE: Record<LessonStatus, string> = { done: 'Done', now: 'Now', locked: 'Locked' };

export default function LessonList() {
  const lessons = getAllLessons();
  const [statuses, setStatuses] = useState<Record<string, LessonStatus>>({});

  useEffect(() => {
    const map: Record<string, LessonStatus> = {};
    for (const l of lessons) map[l.slug] = lessonStatus(l.slug);
    setStatuses(map);
  }, [lessons]);

  return (
    <ol style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}
        className="mx-auto max-w-2xl list-none rounded-xl p-6">
      {lessons.map(l => {
        const status = statuses[l.slug] ?? 'locked';
        return (
          <li key={l.slug} data-testid={`lesson-row-${l.slug}`}
              className="flex items-center justify-between border-b py-3"
              style={{ borderColor: 'var(--color-border-soft)' }}>
            <Link href={`/lessons/${l.slug}`} className="flex items-baseline gap-3">
              <span className="font-mono text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                {String(l.order).padStart(2, '0')}
              </span>
              <span className="font-medium">{l.title}</span>
            </Link>
            <span className="font-mono text-xs" data-status={status}>{BADGE[status]}</span>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 4: Use it on the home page**

Replace `src/app/page.tsx`:

```tsx
import LessonList from '@/components/dashboard/LessonList';

export default function Home() {
  return (
    <main className="px-6 py-10">
      <h1 className="mx-auto mb-1 max-w-2xl text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-dark)' }}>
        Beginner Track
      </h1>
      <p className="mx-auto mb-6 max-w-2xl text-sm" style={{ color: 'var(--color-text-mute)' }}>
        Learn Claude Code the efficient way. <span className="font-mono">// AI is not for everything.</span>
      </p>
      <LessonList />
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/lesson-list.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: editorial dashboard lesson list with done/now/locked"
```

---

### Task 7: Split-screen lesson page

**Files:**
- Create: `src/components/lesson/LessonPane.tsx`, `src/components/lesson/TerminalPlaceholder.tsx`, `src/app/lessons/[slug]/page.tsx`
- Test: `tests/lesson-page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/lesson-page.test.tsx` (tests the `LessonPane` client component directly — Server-Component routing/`notFound` is verified manually in Step 6):

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import LessonPane from '@/components/lesson/LessonPane';
import { getLesson } from '@/lib/lessons';
import { isLessonComplete, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('renders the lesson numeral, title and signature tip', () => {
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(screen.getByText('03')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /running bash commands/i })).toBeInTheDocument();
  expect(screen.getByText(/Search, don't slurp/i)).toBeInTheDocument();
});

test('banking the signature tip completes the lesson and confirms', async () => {
  const user = userEvent.setup();
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(isLessonComplete('bash-commands')).toBe(false);
  await user.click(screen.getByRole('button', { name: /bank this tip/i }));
  expect(isLessonComplete('bash-commands')).toBe(true);
  expect(screen.getByText(/tip banked/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lesson-page.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the terminal placeholder**

Create `src/components/lesson/TerminalPlaceholder.tsx`:

```tsx
export default function TerminalPlaceholder() {
  return (
    <div className="h-full p-4 font-mono text-xs"
         style={{ background: 'var(--color-terminal)', color: 'var(--color-text-mute)' }}>
      <div style={{ color: 'var(--color-accent-green)' }}>▶ Terminal</div>
      <div className="mt-2">Interactive simulator arrives in Phase 3.</div>
      <div className="mt-1">
        <span style={{ color: 'var(--color-accent-green)' }}>›</span> <span className="animate-pulse">▌</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write the lesson pane (client component)**

Create `src/components/lesson/LessonPane.tsx`:

```tsx
'use client';
import { useState } from 'react';
import type { Lesson } from '@/lib/types';
import { signatureTip } from '@/lib/lessons';
import { bankTip, isTipBanked } from '@/lib/progress';

export default function LessonPane({ lesson }: { lesson: Lesson }) {
  const sig = signatureTip(lesson);
  const [banked, setBanked] = useState(() => isTipBanked(lesson.slug, sig.id));

  function handleBank() {
    bankTip(lesson.slug, sig.id);
    setBanked(true); // Phase 2 swaps this for the Plant reward animation
  }

  return (
    <section className="p-8" style={{ background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--color-accent-green)' }}>
        Module 1 — Basics
      </div>
      <div className="mt-3 flex items-baseline gap-4">
        <span className="text-5xl font-extrabold tracking-tighter" style={{ color: 'var(--color-ink-soft)' }}>
          {String(lesson.order).padStart(2, '0')}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
      </div>
      <p className="mt-3 max-w-prose text-sm leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        {lesson.context}
      </p>

      <div className="mt-6 rounded-lg p-4" style={{ border: '1px solid var(--color-border-soft)' }}>
        <div className="font-mono text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-accent-green)' }}>
          Signature tip
        </div>
        <div className="mt-1 font-semibold">{sig.title}</div>
        <div className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>{sig.detail}</div>
        <button
          onClick={handleBank}
          disabled={banked}
          className="mt-3 rounded px-3 py-1.5 font-mono text-xs font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--color-accent-green)' }}
        >
          {banked ? '✓ Tip banked' : `Bank this tip · ~${sig.savedTokens.toLocaleString()} tokens`}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Write the route (split-screen, Server Component with notFound)**

Create `src/app/lessons/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { getLesson, getAllLessons } from '@/lib/lessons';
import LessonPane from '@/components/lesson/LessonPane';
import TerminalPlaceholder from '@/components/lesson/TerminalPlaceholder';

export function generateStaticParams() {
  return getAllLessons().map(l => ({ slug: l.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <main className="grid min-h-[calc(100vh-41px)] grid-cols-1 md:grid-cols-[56fr_44fr]">
      <LessonPane lesson={lesson} />
      <div className="min-h-[300px]"><TerminalPlaceholder /></div>
    </main>
  );
}
```

- [ ] **Step 6: Run tests + manual route check**

Run: `npx vitest run tests/lesson-page.test.tsx`
Expected: PASS — 2 tests.

Then: `npm run dev`, open `http://localhost:3000` → click a lesson → confirm split layout renders, "Bank this tip" persists across refresh, and `http://localhost:3000/lessons/nope` returns the 404 page.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS — all tests across all files green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: split-screen lesson route with bank-tip + progress"
```

---

## Self-Review

**Spec coverage (Phase 1 slice):**
- Dual-tone tokens + fonts → Task 2 ✓ (DESIGN.md §4–5)
- House chrome (A) → Task 5 ✓ (DESIGN.md §3)
- Editorial dashboard with Done/Now/Locked (B) → Task 6 ✓ (DESIGN.md §3, plan §4)
- Split-screen lesson layout (D) → Task 7 ✓ (DESIGN.md §3)
- Lesson model + 24 tips → Task 3 ✓ (DESIGN.md §7)
- localStorage progress, no auth → Task 4 ✓ (plan §7)
- Reduced-motion baseline → Task 2 globals ✓ (DESIGN.md §9)
- *Deferred by design (later phases):* Plant reward + cascade + Forest (Phase 2), terminal simulator (Phase 3), Cmd+K palette + MDX lesson bodies + methodology page (Phase 4), AA contrast audit + deploy (Phase 5). Each is named in the roadmap so nothing is silently dropped.

**Placeholder scan:** No TBD/TODO. The `TerminalPlaceholder` and the bank-tip `setBanked` are *intentional, labelled* seams for Phases 2–3, not gaps — each says which phase replaces it.

**Type consistency:** `Lesson`, `Tip`, `Progress`, `Track`, `TipKind` defined once in `types.ts`. `lessonStatus`/`LessonStatus`, `bankTip(slug, tipId)`, `signatureTip(lesson)`, `getAdjacent(slug)` used identically across Tasks 3–7. Tip ids referenced in tests (`l1-litmus`, `l3-grep`, `l3-command`) exist in the registry.

---

## Notes for later phases (not tasks — context only)

- **Phase 2 (Impact):** add `lib/impact.ts` (tokens → exact $ from a pricing constant; → sourced eco *ranges*), the methodology page, the Plant reward (swaps `LessonPane`'s `setBanked`), the cascade toggle, and the Forest dashboard. Keep all numbers as ranges with `~` per DESIGN.md §6c.
- **Phase 3 (Terminal sim):** replace `TerminalPlaceholder` with the scripted simulator (approve-command step, typewriter, `?` hint, `reset`).
- **Phase 4:** Cmd+K palette in `Chrome`, real MDX lesson bodies, the inline (non-signature) tips, methodology page content.
- **Phase 5:** AA contrast verification on both surfaces, full reduced-motion fallbacks, Lighthouse/perf, Vercel deploy.
