import type { Lesson, Tip } from './types';

const LESSONS: Lesson[] = [
  {
    slug: 'what-is-claude-code', order: 1, track: 'beginner',
    title: 'What Claude Code is and how to think about it',
    estimatedMinutes: 5, format: 'Concept + quiz',
    context: 'Claude Code is a terminal-native AI agent: it reads your files, runs commands, and edits code.',
    concept: 'The skill is not using it for everything. It is knowing what to hand to the agent and what to just do yourself. Reach for the cheapest tool that gets the result, and the agent earns its keep on the hard parts.',
    session: [
      { kind: 'prompt', text: 'rename every .js file in src/ to .ts' },
      { kind: 'thinking', text: 'Thinking' },
      { kind: 'reply', text: 'That is a deterministic rename. A shell command does it for zero model tokens:' },
      { kind: 'tool', text: 'git mv src/util.js src/util.ts   (x14 files)' },
      { kind: 'good', text: 'Renamed 14 files. Cost: 0 model tokens.' },
      { kind: 'warn', text: 'Asking me to edit them one by one would have cost ~4,000 tokens.' },
      { kind: 'impact', savedTokens: 4000, note: 'Reach for the cheapest tool that works.' },
    ],
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
    context: 'Every clarifying round re-sends the entire conversation. A precise prompt up front skips the loop.',
    concept: 'Vague prompts feel faster but cost more: each back-and-forth re-sends all the prior context. Name the file, the symptom, and the expected behavior in one shot.',
    session: [
      { kind: 'prompt', text: 'fix the bug' },
      { kind: 'reply', text: 'Which bug? Which file? What is the expected behavior?' },
      { kind: 'warn', text: '3 clarifying rounds, full context re-sent each time. ~6,000 tokens.' },
      { kind: 'rule', text: 'the same task, said once' },
      { kind: 'prompt', text: 'in checkout.ts, total ignores the coupon; subtract it before tax' },
      { kind: 'thinking', text: 'Thinking' },
      { kind: 'good', text: 'Fixed applyDiscount() ordering. One pass, ~1,500 tokens.' },
      { kind: 'impact', savedTokens: 4500, note: 'Say it once, precisely.' },
    ],
    tips: [
      { id: 'l2-precise', kind: 'signature', savedTokens: 1800, title: 'One precise prompt beats five vague ones', detail: 'Each clarify-retry round re-sends the entire context.' },
      { id: 'l2-scope', kind: 'inline', savedTokens: 1000, title: 'Scope the context', detail: 'Name the files/dirs to touch instead of "look around the repo".' },
      { id: 'l2-shape', kind: 'inline', savedTokens: 600, title: 'Ask for the output shape', detail: '"Just the diff" or "one-line answer" stops you paying for padding.' },
    ],
  },
  {
    slug: 'bash-commands', order: 3, track: 'beginner',
    title: 'How to run bash commands from Claude Code',
    estimatedMinutes: 10, format: 'Terminal sim + challenge',
    context: 'Claude can run shell commands for you. Reading whole files to find a few lines is the classic token sink.',
    concept: 'Searching first and reading only what matches is dramatically cheaper than loading entire files into context. Let grep and glob find the lines; read just those.',
    session: [
      { kind: 'prompt', text: 'where do we handle auth errors?' },
      { kind: 'thinking', text: 'Thinking' },
      { kind: 'tool', text: 'Read src/server/auth.ts (812 lines)' },
      { kind: 'tool', text: 'Read src/server/middleware.ts (430 lines)' },
      { kind: 'warn', text: 'Scanned 1,242 lines to find 1. ~9,800 tokens.' },
      { kind: 'rule', text: 'search, then read only the hit' },
      { kind: 'prompt', text: 'grep for where AuthError is thrown' },
      { kind: 'tool', text: 'grep -rn "throw new AuthError" src/server' },
      { kind: 'out', text: 'auth.ts:148:  throw new AuthError("token expired")' },
      { kind: 'good', text: 'Found it. ~240 tokens.' },
      { kind: 'impact', savedTokens: 9560, note: "Search, don't slurp. ~40x cheaper." },
    ],
    challenge: {
      intro: 'Your turn: find where auth errors are thrown without reading whole files.',
      prompt: 'Type the efficient command',
      accepted: [
        'grep -rn "throw new AuthError" src/server',
        'rg "throw new AuthError" src/server',
        'grep -R "throw new AuthError" src/server',
      ],
      hint: 'Search for the exact error constructor inside src/server.',
      incorrect: 'Close, but this exercise wants a search command that narrows the context before any file read.',
      success: [
        { kind: 'tool', text: 'rg "throw new AuthError" src/server' },
        { kind: 'out', text: 'src/server/auth.ts:148: throw new AuthError("token expired")' },
        { kind: 'good', text: 'Found the line without loading two full files.' },
        { kind: 'impact', savedTokens: 3200, note: 'Search first, read second.' },
      ],
    },
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
    concept: 'If you paste the same multi-paragraph instructions every time, you pay for them every time. A skill stores the workflow and loads it on demand.',
    session: [
      { kind: 'prompt', text: 'set up our PR review checklist again... (pastes 40 lines)' },
      { kind: 'warn', text: 'Re-explained the whole workflow. ~3,200 tokens, again.' },
      { kind: 'rule', text: 'save it once as a skill' },
      { kind: 'prompt', text: '/review-pr' },
      { kind: 'tool', text: 'Loaded skill: review-pr' },
      { kind: 'good', text: 'Workflow ready. ~300 tokens.' },
      { kind: 'impact', savedTokens: 2900, note: 'Teach the workflow once.' },
    ],
    challenge: {
      intro: 'Your turn: replace a repeated review prompt with the durable workflow command.',
      prompt: 'Type the command Claude should run next',
      accepted: ['/review-pr', 'review-pr'],
      hint: 'Use the saved slash command from the efficient path.',
      incorrect: 'That still sounds like re-explaining the workflow. Use the saved command instead.',
      success: [
        { kind: 'prompt', text: '/review-pr' },
        { kind: 'tool', text: 'Loaded skill: review-pr' },
        { kind: 'good', text: 'The workflow loads once, then runs from the saved instructions.' },
        { kind: 'impact', savedTokens: 2200, note: 'A command replaces repeated setup text.' },
      ],
    },
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
    context: 'A subagent can read a huge surface and hand back only the answer. Your main context never pays for the raw files.',
    concept: 'Heavy reading pollutes your main context and gets re-sent every turn. Dispatch a subagent to do the reading and return just the conclusion.',
    session: [
      { kind: 'prompt', text: 'which files still import the old logger?' },
      { kind: 'tool', text: 'Dispatch subagent: grep + read across 60 files' },
      { kind: 'thinking', text: 'Subagent working' },
      { kind: 'out', text: 'subagent scanned ~18,000 lines in its own context' },
      { kind: 'good', text: 'Returns: 6 files. Main-context cost: ~400 tokens.' },
      { kind: 'warn', text: 'Doing it inline would have loaded 18,000 lines into your context.' },
      { kind: 'impact', savedTokens: 17000, note: 'Let subagents hold the heavy context.' },
    ],
    challenge: {
      intro: 'Your turn: ask for a subagent result without pulling raw findings into the main context.',
      prompt: 'Type the efficient instruction',
      accepted: [
        'return only the conclusion',
        'have the subagent return only the conclusion',
        'dispatch subagent and return only the conclusion',
      ],
      hint: 'The key phrase is about returning the answer, not the dump.',
      incorrect: 'That would still bring too much raw context back. Ask for the conclusion only.',
      success: [
        { kind: 'tool', text: 'Dispatch subagent: inspect old logger imports' },
        { kind: 'out', text: 'subagent returns: 6 files, no raw file dumps' },
        { kind: 'good', text: 'Main context receives only the decision-ready answer.' },
        { kind: 'impact', savedTokens: 5000, note: 'Heavy reading stays isolated.' },
      ],
    },
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
    context: "Every enabled MCP tool's schema is loaded into context on every turn. Knowing what's loaded is step one.",
    concept: 'MCP servers add tools, and every tool definition rides along in your context each turn. Viewing them shows you the bill you are paying before you type a word.',
    session: [
      { kind: 'prompt', text: '/mcp' },
      { kind: 'out', text: 'github (26 tools)   playwright (21)   tradingview (78)' },
      { kind: 'out', text: 'filesystem (12)   memory (9)   ...' },
      { kind: 'warn', text: '312 tool schemas loaded. ~14,000 tokens before you type.' },
      { kind: 'good', text: 'Now you can see exactly what to trim.' },
      { kind: 'impact', savedTokens: 14000, note: "You can't trim what you can't see." },
    ],
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
    context: 'Disable the servers a project does not use. Their schemas stop riding along on every turn.',
    concept: 'Trimming MCP to what a project actually needs is the biggest context win in the toolset. Enable per project, not globally.',
    session: [
      { kind: 'prompt', text: 'disable tradingview and playwright for this repo' },
      { kind: 'tool', text: 'claude mcp disable tradingview playwright' },
      { kind: 'out', text: 'context/turn: 14,000 -> 2,100 tokens' },
      { kind: 'good', text: 'Trimmed. 99 tool schemas dropped.' },
      { kind: 'impact', savedTokens: 11900, note: 'Trim to what this project needs.' },
    ],
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
    context: 'A few cheap habits eliminate most wasted tokens. Bank them and the beginner track is done.',
    concept: 'Stale conversation history is re-sent on every turn. Clearing between unrelated tasks drops that tax instantly, and editing beats rewriting whole files.',
    session: [
      { kind: 'out', text: 'context: 40-message debugging thread, now a new task' },
      { kind: 'warn', text: 'Each new turn re-sends all 40 messages. ~22,000 tokens/turn.' },
      { kind: 'rule', text: 'start the new task clean' },
      { kind: 'prompt', text: '/clear' },
      { kind: 'good', text: 'Fresh context. Next turn: ~800 tokens.' },
      { kind: 'impact', savedTokens: 21000, note: '/clear between unrelated tasks.' },
    ],
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
