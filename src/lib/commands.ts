import type { SessionLine, TerminalChallenge, LessonCheck, DocsReference } from './types';

export interface CommandExample {
  command: string;          // e.g. '/context'
  purpose: string;          // one-line "what it does"
  docsRef?: DocsReference;  // optional per-command doc (reserved for later)
}

export type CommandCategory =
  | 'setup-config'
  | 'context-session'
  | 'planning-work'
  | 'review-ship'
  | 'recovery-debug';

export interface CommandGroup {
  slug: string;             // route param, equals the category id
  order: number;            // 1..5, contiguous
  category: CommandCategory;
  categoryLabel: string;    // human label for cards/header
  title: string;
  when: string;             // when you reach for this group
  context: string;          // 1-2 sentence lead-in
  concept: string;          // the core teaching
  commands: CommandExample[];
  session: SessionLine[];   // animated transcript; exactly one 'impact' line
  challenge: TerminalChallenge; // type-it-yourself; reused by TerminalSession
  check: LessonCheck;       // MCQ, exactly one correct
  efficiencyHabit: string;  // explicit token-saving behavior
  docsRefs: DocsReference[]; // official Claude Code docs backing this group
}

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    slug: 'setup-config',
    order: 1,
    category: 'setup-config',
    categoryLabel: 'Setup and config',
    title: 'Set up and configure a repo',
    when: 'First session in a new project',
    context: 'Before the first broad prompt, give Claude durable project facts, see what tools are loaded, and lock the permission rules.',
    concept: 'Configuration is leverage. A few setup commands store project memory once and trim what rides in context, so every later turn is cheaper and more accurate.',
    commands: [
      { command: '/init', purpose: 'Create a starter CLAUDE.md for the repo.' },
      { command: '/memory', purpose: 'Edit durable project or user memory.' },
      { command: '/config', purpose: 'Open settings for the current project.' },
      { command: '/theme', purpose: 'Switch the color theme.' },
      { command: '/statusline', purpose: 'Configure the status line.' },
      { command: '/mcp', purpose: 'View and manage MCP server connections.' },
      { command: '/permissions', purpose: 'Review allow, ask, and deny rules.' },
    ],
    session: [
      { kind: 'prompt', text: '/init' },
      { kind: 'tool', text: 'Wrote CLAUDE.md with build, test, and layout notes' },
      { kind: 'good', text: 'Project facts now load once per session, not re-derived each turn.' },
      { kind: 'prompt', text: '/mcp' },
      { kind: 'out', text: 'github (26 tools)  playwright (21)  filesystem (12)' },
      { kind: 'warn', text: '59 tool schemas loaded before the first prompt. ~9,000 tokens.' },
      { kind: 'prompt', text: '/permissions' },
      { kind: 'good', text: 'Reviewed allow and deny rules. No surprise approvals mid task.' },
      { kind: 'impact', savedTokens: 9000, note: 'Configure once; every later turn is leaner.' },
    ],
    challenge: {
      intro: 'Your turn: see what is loaded before you prompt.',
      prompt: 'Type the command that lists MCP servers',
      accepted: ['/mcp'],
      hint: 'It is the command that views and manages MCP server connections.',
      incorrect: 'Inspect the loaded tools first, then trim what this repo does not need.',
      success: [
        { kind: 'tool', text: '/mcp' },
        { kind: 'out', text: 'github (26)  playwright (21)  filesystem (12)' },
        { kind: 'good', text: 'Now you can disable what this repo does not use.' },
        { kind: 'impact', savedTokens: 9000, note: 'Look before you load.' },
      ],
    },
    check: {
      question: 'You join a repo with a dozen MCP servers enabled. What is the cheapest first move?',
      options: [
        { id: 'inspect', text: 'Run /mcp and /context to see what is loaded, then trim.', correct: true, explanation: 'Right. You cannot trim context you have not measured.' },
        { id: 'prompt', text: 'Ask Claude to build the feature immediately.', correct: false, explanation: 'Every loaded tool schema rides on that prompt and each later turn.' },
        { id: 'model', text: 'Switch to the largest model first.', correct: false, explanation: 'Model choice does not reduce the loaded tool context.' },
      ],
    },
    efficiencyHabit: 'Inspect loaded context and permission rules before the first broad prompt.',
    docsRefs: [
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
      { title: 'Memory', href: 'https://code.claude.com/docs/en/memory.md' },
      { title: 'MCP', href: 'https://code.claude.com/docs/en/mcp.md' },
      { title: 'Permissions', href: 'https://code.claude.com/docs/en/permissions.md' },
      { title: 'Status line', href: 'https://code.claude.com/docs/en/statusline.md' },
    ],
  },
  {
    slug: 'context-session',
    order: 2,
    category: 'context-session',
    categoryLabel: 'Context and session',
    title: 'Control context during a session',
    when: 'During a long task',
    context: 'A growing transcript is re-sent on every turn. These commands keep the working context small without losing the thread.',
    concept: 'Context is a meter that never stops running. Compact when history gets long, clear between unrelated tasks, and branch a side question instead of growing the main thread.',
    commands: [
      { command: '/context', purpose: 'See what is filling the context window.' },
      { command: '/compact', purpose: 'Summarize history so the same task can continue.' },
      { command: '/clear', purpose: 'Start a new conversation with empty context.' },
      { command: '/resume', purpose: 'Return to an earlier conversation.' },
      { command: '/branch', purpose: 'Explore a side thread without growing the main one.' },
      { command: '/btw', purpose: 'Ask a quick aside without derailing the main thread.' },
    ],
    session: [
      { kind: 'prompt', text: '/context' },
      { kind: 'out', text: '180k / 200k tokens used. History is 70% of the window.' },
      { kind: 'warn', text: 'Every turn now re-sends 180k tokens.' },
      { kind: 'prompt', text: '/compact' },
      { kind: 'good', text: 'History summarized to 24k. Same task continues, far cheaper per turn.' },
      { kind: 'impact', savedTokens: 156000, note: 'Compact long history before it dominates the window.' },
    ],
    challenge: {
      intro: 'Your turn: you are starting a brand new, unrelated task.',
      prompt: 'Type the command that empties the context',
      accepted: ['/clear'],
      hint: 'It starts a new conversation with empty context.',
      incorrect: 'For unrelated work, do not carry the old transcript forward.',
      success: [
        { kind: 'tool', text: '/clear' },
        { kind: 'good', text: 'Fresh context. The next turn is small again.' },
        { kind: 'impact', savedTokens: 21000, note: '/clear between unrelated tasks.' },
      ],
    },
    check: {
      question: 'You finish a long debugging thread and start an unrelated feature. What now?',
      options: [
        { id: 'clear', text: 'Run /clear so the new task starts with empty context.', correct: true, explanation: 'Right. Stale history would be re-sent on every new turn.' },
        { id: 'keep', text: 'Keep going in the same thread to save time.', correct: false, explanation: 'The long transcript is re-sent each turn, for nothing.' },
        { id: 'compact', text: 'Compact, then continue in the same thread.', correct: false, explanation: 'Compact helps a continuing task; an unrelated task wants a clear.' },
      ],
    },
    efficiencyHabit: 'Compact a continuing task, clear an unrelated one, and branch side questions.',
    docsRefs: [
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
      { title: 'Context window', href: 'https://code.claude.com/docs/en/context-window.md' },
      { title: 'Interactive mode', href: 'https://code.claude.com/docs/en/interactive-mode.md' },
      { title: 'Sessions', href: 'https://code.claude.com/docs/en/sessions.md' },
    ],
  },
  {
    slug: 'planning-work',
    order: 3,
    category: 'planning-work',
    categoryLabel: 'Planning and work',
    title: 'Plan and parallelize the work',
    when: 'When one thread is too narrow for the change',
    context: 'Plan before a large change, and let agents, tasks, and worktree batches do heavy work without dumping every detail into one thread.',
    concept: 'Scope the plan first, then fan the work out. Subagents and batches hold the heavy reading in their own context and hand back conclusions, so the main thread stays small.',
    commands: [
      { command: '/plan', purpose: 'Enter plan mode before a larger change.' },
      { command: '/agents', purpose: 'Create and manage subagents.' },
      { command: '/tasks', purpose: 'List background tasks in the session.' },
      { command: '/batch', purpose: 'Split a large change across worktrees.' },
      { command: '/background', purpose: 'Move the running task to the background.' },
    ],
    session: [
      { kind: 'prompt', text: '/plan migrate the logger across the repo' },
      { kind: 'reply', text: 'Plan: find call sites, then update them in isolated worktrees.' },
      { kind: 'prompt', text: '/agents' },
      { kind: 'tool', text: 'Dispatch subagent: find every import of the old logger' },
      { kind: 'out', text: 'subagent scanned 18,000 lines in its own context' },
      { kind: 'good', text: 'Returned 6 files. Main thread cost: ~400 tokens.' },
      { kind: 'impact', savedTokens: 17000, note: 'Let subagents hold the heavy context.' },
    ],
    challenge: {
      intro: 'Your turn: scope the work before touching code.',
      prompt: 'Type the command that enters planning',
      accepted: ['/plan'],
      hint: 'It switches into plan mode before a larger change.',
      incorrect: 'Plan the change first so the work fans out cleanly.',
      success: [
        { kind: 'tool', text: '/plan' },
        { kind: 'good', text: 'Plan mode on. Now the work can split across agents and worktrees.' },
        { kind: 'impact', savedTokens: 6000, note: 'Plan once, then parallelize.' },
      ],
    },
    check: {
      question: 'You must find every file importing an old module across a huge repo. Cheapest path?',
      options: [
        { id: 'subagent', text: 'Dispatch a subagent to search and return just the file list.', correct: true, explanation: 'Right. The subagent reads in its own context and hands back the answer.' },
        { id: 'inline', text: 'Read the candidate files inline in the main thread.', correct: false, explanation: 'That loads thousands of lines into your context, re-sent each turn.' },
        { id: 'paste', text: 'Paste the files into the prompt yourself.', correct: false, explanation: 'Same problem: the raw files now live in your context.' },
      ],
    },
    efficiencyHabit: 'Ask parallel workers for conclusions and diffs, not raw transcripts.',
    docsRefs: [
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
      { title: 'Plan mode', href: 'https://code.claude.com/docs/en/ultraplan.md' },
      { title: 'Subagents', href: 'https://code.claude.com/docs/en/sub-agents.md' },
      { title: 'Worktrees', href: 'https://code.claude.com/docs/en/worktrees.md' },
    ],
  },
  {
    slug: 'review-ship',
    order: 4,
    category: 'review-ship',
    categoryLabel: 'Review and ship',
    title: 'Review and ship changes',
    when: 'Before you commit or deploy',
    context: 'Inspect the diff, review the risky parts, and verify behavior before you rely on a final answer.',
    concept: 'Read the diff before spending model attention. A cheap visual diff plus a targeted review beats asking the model to re-read whole files to find what changed.',
    commands: [
      { command: '/diff', purpose: 'Open the interactive diff viewer.' },
      { command: '/code-review', purpose: 'Review the current diff for correctness issues.' },
      { command: '/simplify', purpose: 'Apply cleanup-only review findings.' },
      { command: '/verify', purpose: 'Run and observe the app after a change.' },
    ],
    session: [
      { kind: 'prompt', text: 'is my change correct?' },
      { kind: 'tool', text: 'Read src/checkout.ts (640 lines)' },
      { kind: 'warn', text: 'Re-read the whole file to find what changed. ~5,200 tokens.' },
      { kind: 'rule', text: 'review the diff, not the file' },
      { kind: 'prompt', text: '/code-review' },
      { kind: 'out', text: 'Reviewed 38 changed lines. 1 off-by-one in applyDiscount().' },
      { kind: 'good', text: 'Found it from the diff alone. ~700 tokens.' },
      { kind: 'impact', savedTokens: 4500, note: 'Review the diff, then focus on the risk.' },
    ],
    challenge: {
      intro: 'Your turn: review the change without re-reading whole files.',
      prompt: 'Type the command that reviews the current diff',
      accepted: ['/code-review'],
      hint: 'It reviews the current diff for correctness issues.',
      incorrect: 'Point the review at the diff, not the entire file.',
      success: [
        { kind: 'tool', text: '/code-review' },
        { kind: 'out', text: 'Reviewed 38 changed lines. 1 issue found.' },
        { kind: 'good', text: 'Caught it from the diff. No full-file re-read.' },
        { kind: 'impact', savedTokens: 4500, note: 'Diff first, attention second.' },
      ],
    },
    check: {
      question: 'You want Claude to check a change you just made. What is cheapest?',
      options: [
        { id: 'diff', text: 'Run /diff and /code-review to focus on the changed lines.', correct: true, explanation: 'Right. The diff is small; the whole file is not.' },
        { id: 'reread', text: 'Ask Claude to re-read the whole file and look for bugs.', correct: false, explanation: 'You pay to re-read hundreds of unchanged lines.' },
        { id: 'rewrite', text: 'Ask Claude to rewrite the file cleanly.', correct: false, explanation: 'Rewrites re-emit unchanged code and risk new bugs.' },
      ],
    },
    efficiencyHabit: 'Review the diff first, then spend model attention on the risky parts.',
    docsRefs: [
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
      { title: 'Code review', href: 'https://code.claude.com/docs/en/code-review.md' },
      { title: 'Cloud review', href: 'https://code.claude.com/docs/en/ultrareview.md' },
    ],
  },
  {
    slug: 'recovery-debug',
    order: 5,
    category: 'recovery-debug',
    categoryLabel: 'Recovery and debug',
    title: 'Recover and debug',
    when: 'Between tasks or when something breaks',
    context: 'Roll back to a known-good checkpoint, diagnose the environment directly, and send feedback without burning a long thread on it.',
    concept: 'When work goes sideways, recover instead of arguing with the transcript. A checkpoint rewind or a direct config diagnosis is cheaper than re-explaining the whole mess to the model.',
    commands: [
      { command: '/rewind', purpose: 'Roll back code and conversation to a checkpoint.' },
      { command: '/doctor', purpose: 'Diagnose installation and settings issues.' },
      { command: '/debug', purpose: 'Capture a debug report of your config.' },
      { command: '/feedback', purpose: 'Send feedback to the Claude Code team.' },
    ],
    session: [
      { kind: 'prompt', text: 'undo the last three changes, they broke the build' },
      { kind: 'warn', text: 'Re-explaining three changes back to the model. ~6,000 tokens.' },
      { kind: 'rule', text: 'rewind instead of re-explain' },
      { kind: 'prompt', text: '/rewind' },
      { kind: 'good', text: 'Restored code and conversation to the last green checkpoint.' },
      { kind: 'impact', savedTokens: 6000, note: 'Rewind to a checkpoint instead of re-explaining.' },
    ],
    challenge: {
      intro: 'Your turn: a change broke the build and you want the last good state.',
      prompt: 'Type the command that rolls back to a checkpoint',
      accepted: ['/rewind'],
      hint: 'It rolls back code and conversation to a checkpoint.',
      incorrect: 'Recover to a checkpoint instead of describing every change to undo.',
      success: [
        { kind: 'tool', text: '/rewind' },
        { kind: 'good', text: 'Back to the last green checkpoint, code and history together.' },
        { kind: 'impact', savedTokens: 6000, note: 'Recover, do not re-explain.' },
      ],
    },
    check: {
      question: 'Three recent edits broke the build. What is the cheapest recovery?',
      options: [
        { id: 'rewind', text: 'Use /rewind to restore the last good checkpoint.', correct: true, explanation: 'Right. The checkpoint restores code and conversation at once.' },
        { id: 'explain', text: 'Describe each change to the model and ask it to undo them.', correct: false, explanation: 'That re-sends and re-reasons over work a checkpoint already holds.' },
        { id: 'redo', text: 'Ask the model to rewrite the files from memory.', correct: false, explanation: 'Slower, costlier, and risks drifting from the known-good state.' },
      ],
    },
    efficiencyHabit: 'Recover from checkpoints and diagnose config directly instead of re-explaining.',
    docsRefs: [
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
      { title: 'Checkpointing', href: 'https://code.claude.com/docs/en/checkpointing.md' },
      { title: 'Debug your config', href: 'https://code.claude.com/docs/en/debug-your-config.md' },
      { title: 'Troubleshooting', href: 'https://code.claude.com/docs/en/troubleshooting.md' },
    ],
  },
];

export const COMMAND_REFERENCE = {
  title: 'Commands reference',
  href: 'https://code.claude.com/docs/en/commands.md',
  note: 'Type / inside Claude Code to see the commands available for your plan, platform, and environment.',
} as const;

export function getAllCommandGroups(): CommandGroup[] {
  return [...COMMAND_GROUPS].sort((a, b) => a.order - b.order);
}

export function getCommandGroup(slug: string): CommandGroup | undefined {
  return COMMAND_GROUPS.find((group) => group.slug === slug);
}

export function getAdjacentGroup(slug: string): { prev: CommandGroup | null; next: CommandGroup | null } {
  const all = getAllCommandGroups();
  const i = all.findIndex((group) => group.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: i > 0 ? all[i - 1] : null, next: i < all.length - 1 ? all[i + 1] : null };
}

export function commandCount(): number {
  return COMMAND_GROUPS.reduce((sum, group) => sum + group.commands.length, 0);
}
