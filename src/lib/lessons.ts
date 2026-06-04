import type { Lesson, Tip } from './types';

const LESSONS: Lesson[] = [
  {
    slug: 'what-is-claude-code', order: 1, track: 'beginner',
    title: 'What Claude Code is and how to think about it',
    estimatedMinutes: 5, format: 'Concept + quiz',
    context: 'Claude Code is a terminal-native AI agent. Before anything else, learn when to reach for it, and when not to.',
    tips: [
      { id: 'l1-litmus', kind: 'signature', savedTokens: 2000, title: 'AI is not for everything: run the litmus', detail: 'Could a command, your editor, or your own memory do this for 0 tokens? If yes, do that.' },
      { id: 'l1-context-cost', kind: 'inline', savedTokens: 1200, title: "Context isn't free or one-time", detail: 'Claude re-reads the whole conversation every turn.' },
      { id: 'l1-model-match', kind: 'inline', savedTokens: 1500, title: 'Match the model to the task', detail: 'Opus for hard reasoning, Haiku for mechanical bulk.' },
    ],
  },
  {
    slug: 'effective-prompting', order: 2, track: 'beginner',
    title: 'How to prompt Claude Code effectively',
    estimatedMinutes: 8, format: 'Interactive exercise',
    context: 'A precise prompt is the cheapest optimization there is. It prevents the back-and-forth that re-sends everything.',
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
    context: 'Claude can run shell commands for you, but reading whole files into context is the classic token sink.',
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
    context: "Every enabled MCP tool's schema rides in your context on every turn, so knowing what's loaded matters.",
    tips: [
      { id: 'l6-schema-cost', kind: 'signature', savedTokens: 900, title: "Every enabled tool's schema lives in your context", detail: 'Loaded every turn; seeing what is loaded is step one.' },
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
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonsByTrack(track: Lesson['track']): Lesson[] {
  return getAllLessons().filter((l) => l.track === track);
}

export function signatureTip(lesson: Lesson): Tip {
  return lesson.tips.find((t) => t.kind === 'signature')!;
}

export function getAdjacent(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const all = getAllLessons();
  const i = all.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}
