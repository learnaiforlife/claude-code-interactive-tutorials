import type { Lesson, Tip, Track, TrackInfo } from './types';

export const TRACKS: TrackInfo[] = [
  {
    id: 'beginner',
    title: 'Beginner Track',
    description: 'Core Claude Code habits, taught by doing.',
  },
  {
    id: 'feature-modules',
    title: 'Feature Modules v1',
    description: 'Claude Code features mapped to what they do, how they work, and how to use them efficiently.',
  },
  {
    id: 'power-user',
    title: 'Power User Modules',
    description: 'Extensions, parallel work, integrations, and larger operating patterns.',
  },
  {
    id: 'team',
    title: 'Team Modules',
    description: 'SDK, enterprise, rollout, monitoring, and policy features.',
  },
];

const TRACK_ORDER = new Map<Track, number>(TRACKS.map((track, index) => [track.id, index]));

const LESSONS: Lesson[] = [
  {
    slug: 'what-is-claude-code', order: 1, track: 'beginner',
    title: 'What Claude Code is and how to think about it',
    estimatedMinutes: 5, format: 'Concept + quiz',
    featureFamily: 'Foundations',
    docsRefs: [
      { title: 'Overview', href: 'https://code.claude.com/docs/en/overview.md' },
      { title: 'How Claude Code works', href: 'https://code.claude.com/docs/en/how-claude-code-works.md' },
    ],
    efficiencyHabit: 'Choose the cheapest deterministic tool before spending model context.',
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
    check: {
      question: 'A user asks Claude to rename 14 files one by one. What should you do first?',
      options: [
        { id: 'command', text: 'Use a shell or editor rename command.', correct: true, explanation: 'Correct. Deterministic file moves do not need model reasoning.' },
        { id: 'agent', text: 'Ask Claude to edit every file manually.', correct: false, explanation: 'That spends tokens on work the shell can do exactly.' },
        { id: 'opus', text: 'Switch to the strongest model first.', correct: false, explanation: 'Model choice matters after you decide the task belongs in the model.' },
      ],
    },
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
    featureFamily: 'Core Session Workflow',
    docsRefs: [
      { title: 'Best practices for Claude Code', href: 'https://code.claude.com/docs/en/best-practices.md' },
      { title: 'Prompt library', href: 'https://code.claude.com/docs/en/prompt-library.md' },
    ],
    efficiencyHabit: 'Name the file, symptom, expected behavior, and output shape in one prompt.',
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
    check: {
      question: 'Which prompt shape is cheapest for a known checkout bug?',
      options: [
        { id: 'vague', text: 'fix the bug', correct: false, explanation: 'That forces clarifying rounds, and every round re-sends context.' },
        { id: 'precise', text: 'In checkout.ts, subtract coupon before tax and return just the diff.', correct: true, explanation: 'Correct. It names file, symptom, desired behavior, and output shape.' },
        { id: 'browse', text: 'Look around the whole repo and improve checkout.', correct: false, explanation: 'That widens context before Claude knows what matters.' },
      ],
    },
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
    featureFamily: 'Tools, Permissions, And Safety',
    docsRefs: [
      { title: 'Tools reference', href: 'https://code.claude.com/docs/en/tools-reference.md' },
      { title: 'Common workflows', href: 'https://code.claude.com/docs/en/common-workflows.md' },
    ],
    efficiencyHabit: 'Search and compute with shell tools before reading large files into context.',
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
    check: {
      question: 'You need the one line that throws AuthError. What is the efficient first move?',
      options: [
        { id: 'read', text: 'Read both likely files in full.', correct: false, explanation: 'That loads hundreds of irrelevant lines into context.' },
        { id: 'search', text: 'Search for the exact throw pattern first.', correct: true, explanation: 'Correct. Search narrows the context before any file read.' },
        { id: 'paste', text: 'Paste the full auth logs into the prompt.', correct: false, explanation: 'Large pasted logs become context that gets paid for again.' },
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
    featureFamily: 'Extensions',
    docsRefs: [
      { title: 'Extend Claude with skills', href: 'https://code.claude.com/docs/en/skills.md' },
      { title: 'Commands', href: 'https://code.claude.com/docs/en/commands.md' },
    ],
    efficiencyHabit: 'Store repeated workflows once and load them on demand.',
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
    check: {
      question: 'When you repeat the same PR review checklist every week, what should you do?',
      options: [
        { id: 'paste', text: 'Paste the full checklist into every session.', correct: false, explanation: 'That pays for the same instructions repeatedly.' },
        { id: 'skill', text: 'Save the workflow as a tight skill or command.', correct: true, explanation: 'Correct. Durable workflow instructions should be loaded on demand.' },
        { id: 'memory', text: 'Ask Claude to infer the checklist again.', correct: false, explanation: 'Inference is not durable. Store repeated workflow rules explicitly.' },
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
    featureFamily: 'Extensions',
    docsRefs: [
      { title: 'Create custom subagents', href: 'https://code.claude.com/docs/en/sub-agents.md' },
      { title: 'Run agents in parallel', href: 'https://code.claude.com/docs/en/agents.md' },
    ],
    efficiencyHabit: 'Isolate heavy reading in a subagent and return only the conclusion.',
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
    check: {
      question: 'A task needs scanning 60 files. What should the main session receive back?',
      options: [
        { id: 'dump', text: 'Every matching file and all raw snippets.', correct: false, explanation: 'That imports the heavy context into the main conversation.' },
        { id: 'conclusion', text: 'A short conclusion with the exact files to edit.', correct: true, explanation: 'Correct. The subagent can hold the heavy scan and return only the answer.' },
        { id: 'repeat', text: 'The full subagent transcript for audit.', correct: false, explanation: 'The transcript is usually too much. Ask for decision-ready evidence only.' },
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
    featureFamily: 'Extensions',
    docsRefs: [
      { title: 'Connect Claude Code to tools via MCP', href: 'https://code.claude.com/docs/en/mcp.md' },
      { title: 'Debug your configuration', href: 'https://code.claude.com/docs/en/debug-your-config.md' },
    ],
    efficiencyHabit: 'Inspect loaded MCP schemas before adding more tool context.',
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
    check: {
      question: 'Why should you inspect MCP servers before a new task?',
      options: [
        { id: 'schemas', text: 'Enabled tool schemas ride along in context.', correct: true, explanation: 'Correct. Tool definitions can become a context cost before you type.' },
        { id: 'speed', text: 'It makes every server run faster.', correct: false, explanation: 'Inspection shows what is loaded. It does not speed the servers by itself.' },
        { id: 'security', text: 'It automatically disables risky tools.', correct: false, explanation: 'Viewing is not trimming. You still choose what to disable or defer.' },
      ],
    },
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
    featureFamily: 'Extensions',
    docsRefs: [
      { title: 'Connect to MCP servers', href: 'https://code.claude.com/docs/en/mcp-quickstart.md' },
      { title: 'Control MCP server access for your organization', href: 'https://code.claude.com/docs/en/managed-mcp.md' },
    ],
    efficiencyHabit: 'Enable MCP servers per project and disable what the project does not use.',
    context: 'Disable the servers a project does not use. Their schemas stop riding along on every turn.',
    concept: 'Trimming MCP to what a project actually needs is the biggest context win in the toolset. Enable per project, not globally.',
    session: [
      { kind: 'prompt', text: 'disable tradingview and playwright for this repo' },
      { kind: 'tool', text: 'claude mcp disable tradingview playwright' },
      { kind: 'out', text: 'context/turn: 14,000 -> 2,100 tokens' },
      { kind: 'good', text: 'Trimmed. 99 tool schemas dropped.' },
      { kind: 'impact', savedTokens: 11900, note: 'Trim to what this project needs.' },
    ],
    check: {
      question: 'A repo does not use Playwright or trading data. What is the efficient MCP move?',
      options: [
        { id: 'global', text: 'Leave every global server enabled.', correct: false, explanation: 'Unused schemas still consume context on every turn.' },
        { id: 'disable', text: 'Disable unused servers for this project.', correct: true, explanation: 'Correct. Project-scoped MCP keeps the tool budget aligned with the work.' },
        { id: 'paste', text: 'Paste tool descriptions only when needed.', correct: false, explanation: 'That is worse than configuration. Let the tool system manage schemas.' },
      ],
    },
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
    featureFamily: 'Codebase Context',
    docsRefs: [
      { title: 'Explore the context window', href: 'https://code.claude.com/docs/en/context-window.md' },
      { title: 'How Claude Code uses prompt caching', href: 'https://code.claude.com/docs/en/prompt-caching.md' },
      { title: 'Manage costs effectively', href: 'https://code.claude.com/docs/en/costs.md' },
    ],
    efficiencyHabit: 'Clear unrelated history and preserve stable context for cacheable turns.',
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
    check: {
      question: 'You finished a long debugging thread and want to start a new feature. What saves the most context?',
      options: [
        { id: 'continue', text: 'Continue in the same thread for convenience.', correct: false, explanation: 'The old debugging history will be re-sent into the new task.' },
        { id: 'clear', text: 'Use /clear before the unrelated task.', correct: true, explanation: 'Correct. A fresh context drops stale history from the next turn.' },
        { id: 'summarize', text: 'Ask Claude to reread everything first.', correct: false, explanation: 'That adds another costly turn before the new task even starts.' },
      ],
    },
    tips: [
      { id: 'l8-clear', kind: 'signature', savedTokens: 1500, title: '/clear between unrelated tasks', detail: 'Stale history is re-sent every turn.' },
      { id: 'l8-edit', kind: 'inline', savedTokens: 2000, title: "Edit, don't rewrite", detail: 'Pay only for the lines that change.' },
      { id: 'l8-no-reread', kind: 'inline', savedTokens: 700, title: 'Don\'t re-read to "verify"', detail: 'The harness already tracks file state after an edit.' },
    ],
  },
  {
    slug: 'agent-loop', order: 1, track: 'feature-modules',
    title: 'Agent loop: read, edit, run, decide',
    estimatedMinutes: 9, format: 'Feature walkthrough',
    featureFamily: 'Core Session Workflow',
    docsRefs: [
      { title: 'How Claude Code works', href: 'https://code.claude.com/docs/en/how-claude-code-works.md' },
      { title: 'Best practices for Claude Code', href: 'https://code.claude.com/docs/en/best-practices.md' },
    ],
    efficiencyHabit: 'Approve narrow deterministic tool calls and challenge broad repo exploration.',
    context: 'Claude Code works in a loop: inspect context, choose tools, make changes, run checks, and ask when it needs permission.',
    concept: 'The efficient user guides the loop. Let Claude run narrow commands when the next step is deterministic, but stop broad reads before they turn into an expensive repo tour.',
    session: [
      { kind: 'prompt', text: 'fix the failing profile test' },
      { kind: 'thinking', text: 'Planning the next tool call' },
      { kind: 'tool', text: 'Read entire src directory before checking the failure' },
      { kind: 'warn', text: 'Broad exploration first. ~12,000 context tokens before the failing test is known.' },
      { kind: 'rule', text: 'guide the loop to the narrow evidence' },
      { kind: 'prompt', text: 'run the profile test, then inspect only the failing file' },
      { kind: 'tool', text: 'npm test profile.test.tsx' },
      { kind: 'out', text: 'ProfileForm expects saved name after submit' },
      { kind: 'tool', text: 'Read src/profile/ProfileForm.tsx' },
      { kind: 'good', text: 'One failing path, one file, one edit.' },
      { kind: 'impact', savedTokens: 8400, note: 'Approve work, not wandering.' },
    ],
    check: {
      question: 'Claude asks to read the whole repo before running the failing test. What is the efficient response?',
      options: [
        { id: 'approve-all', text: 'Approve the broad read.', correct: false, explanation: 'That spends context before the failure is scoped.' },
        { id: 'narrow', text: 'Ask it to run the failing test first, then inspect the file named by the failure.', correct: true, explanation: 'Correct. The test output narrows the next read.' },
        { id: 'manual', text: 'Paste every related file into the prompt.', correct: false, explanation: 'Pasting files imports the same context cost, but with less tool control.' },
      ],
    },
    tips: [
      { id: 'fm1-loop-scope', kind: 'signature', savedTokens: 2600, title: 'Approve work, not wandering', detail: 'Let the loop take the narrow next step, not a broad repo tour.' },
      { id: 'fm1-test-first', kind: 'inline', savedTokens: 1800, title: 'Run the failing check first', detail: 'A test failure names the evidence before Claude reads files.' },
      { id: 'fm1-small-tools', kind: 'inline', savedTokens: 2200, title: 'Prefer narrow tool calls', detail: 'One file, one grep, or one test beats an exploratory sweep.' },
    ],
  },
  {
    slug: 'context-window', order: 2, track: 'feature-modules',
    title: 'Context window: what fills it and what to drop',
    estimatedMinutes: 10, format: 'Context simulation',
    featureFamily: 'Codebase Context',
    docsRefs: [
      { title: 'Explore the context window', href: 'https://code.claude.com/docs/en/context-window.md' },
      { title: 'How Claude Code uses prompt caching', href: 'https://code.claude.com/docs/en/prompt-caching.md' },
      { title: 'Manage costs effectively', href: 'https://code.claude.com/docs/en/costs.md' },
    ],
    efficiencyHabit: 'Keep durable context stable, then clear or compact unrelated history.',
    context: 'The context window is the working memory Claude pays attention to each turn. Files, tool schemas, messages, and rules all compete for that space.',
    concept: 'Treat context like a budget. Stable project rules can be useful and cacheable, but stale chat history and unnecessary reads get resent until you drop or compact them.',
    session: [
      { kind: 'out', text: 'loaded: CLAUDE.md, 6 tool schemas, 28 messages, 3 files' },
      { kind: 'warn', text: 'New task starts with 31,000 stale tokens from the prior debug thread.' },
      { kind: 'rule', text: 'keep stable context, drop stale work' },
      { kind: 'prompt', text: '/context' },
      { kind: 'out', text: 'largest blocks: old auth thread, two full log files, stable project rules' },
      { kind: 'prompt', text: '/clear, then reference the one file needed for the new task' },
      { kind: 'good', text: 'Stable rules remain in project memory. Stale messages are gone.' },
      { kind: 'impact', savedTokens: 18000, note: 'Drop stale history before it compounds.' },
    ],
    check: {
      question: 'A new task starts after a long unrelated debugging thread. What should stay?',
      options: [
        { id: 'all-history', text: 'All previous messages, in case they matter.', correct: false, explanation: 'Unrelated history is paid for again and distracts the task.' },
        { id: 'stable-rules', text: 'Stable project rules and the specific file needed now.', correct: true, explanation: 'Correct. Keep durable context, drop stale conversation history.' },
        { id: 'full-logs', text: 'Both full log files from the old investigation.', correct: false, explanation: 'Logs should be searched or referenced only when the new task needs them.' },
      ],
    },
    tips: [
      { id: 'fm2-drop-stale', kind: 'signature', savedTokens: 3200, title: 'Drop stale history', detail: 'Clear or compact when the task changes.' },
      { id: 'fm2-stable-context', kind: 'inline', savedTokens: 1400, title: 'Keep stable context stable', detail: 'Durable project rules are cheaper than re-explaining them.' },
      { id: 'fm2-context-audit', kind: 'inline', savedTokens: 1600, title: 'Audit what is loaded', detail: '/context shows the largest context blocks before you optimize.' },
    ],
  },
  {
    slug: 'permission-modes', order: 3, track: 'feature-modules',
    title: 'Permission modes: allow the safe path',
    estimatedMinutes: 9, format: 'Approval exercise',
    featureFamily: 'Tools, Permissions, And Safety',
    docsRefs: [
      { title: 'Choose a permission mode', href: 'https://code.claude.com/docs/en/permission-modes.md' },
      { title: 'Tools reference', href: 'https://code.claude.com/docs/en/tools-reference.md' },
    ],
    efficiencyHabit: 'Allow the narrow safe command, deny broad access, and avoid repeated approval chatter.',
    context: 'Permission modes control when Claude can edit files or run commands. The efficient setup is not maximum freedom, it is the smallest access that lets safe work proceed.',
    concept: 'Repeated approval prompts cost attention and tokens, but broad access creates expensive mistakes. Scope permissions to the repo, task, and command family you actually trust.',
    session: [
      { kind: 'prompt', text: 'update generated types after the schema change' },
      { kind: 'reply', text: 'I need to run the codegen command.' },
      { kind: 'warn', text: 'If you deny every safe repeat command, the session burns turns on approval chatter.' },
      { kind: 'rule', text: 'allow the specific safe command' },
      { kind: 'prompt', text: 'allow npm run codegen, deny broad file deletion commands' },
      { kind: 'tool', text: 'npm run codegen' },
      { kind: 'good', text: 'Generated types updated with one approved command.' },
      { kind: 'impact', savedTokens: 3600, note: 'Narrow permission beats repeated negotiation.' },
    ],
    check: {
      question: 'Claude needs to run the same safe codegen command twice. What is the efficient permission choice?',
      options: [
        { id: 'deny', text: 'Deny every run and ask Claude to explain again.', correct: false, explanation: 'That burns turns on repeated approval negotiation.' },
        { id: 'allow-specific', text: 'Allow the specific codegen command, keep broad risky commands denied.', correct: true, explanation: 'Correct. Narrow permission removes chatter without widening the blast radius.' },
        { id: 'allow-all', text: 'Allow every command for the rest of the session.', correct: false, explanation: 'That is broader than the task needs and can make mistakes expensive.' },
      ],
    },
    tips: [
      { id: 'fm3-narrow-allow', kind: 'signature', savedTokens: 1900, title: 'Allow only what is needed', detail: 'Specific safe commands avoid approval loops without opening broad access.' },
      { id: 'fm3-deny-broad', kind: 'inline', savedTokens: 1100, title: 'Deny broad risky commands', detail: 'Do not pay for recovery from commands the task never needed.' },
      { id: 'fm3-state-policy', kind: 'inline', savedTokens: 900, title: 'State the permission rule once', detail: 'One clear allow/deny rule beats repeated negotiation.' },
    ],
  },
];

export function getAllLessons(): Lesson[] {
  return [...LESSONS].sort((a, b) => {
    const trackDelta = (TRACK_ORDER.get(a.track) ?? 99) - (TRACK_ORDER.get(b.track) ?? 99);
    return trackDelta || a.order - b.order;
  });
}

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonsByTrack(track: Lesson['track']): Lesson[] {
  return getAllLessons().filter((l) => l.track === track);
}

export function getTrackInfo(track: Track): TrackInfo {
  return TRACKS.find((info) => info.id === track) ?? TRACKS[0];
}

export function signatureTip(lesson: Lesson): Tip {
  return lesson.tips.find((t) => t.kind === 'signature')!;
}

export function getAdjacent(slug: string): { prev: Lesson | null; next: Lesson | null } {
  const current = getLesson(slug);
  if (!current) return { prev: null, next: null };
  const all = getLessonsByTrack(current.track);
  const i = all.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}
