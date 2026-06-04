export interface CommandExample {
  command: string;
  purpose: string;
}

export interface CommandSession {
  id: string;
  title: string;
  when: string;
  lesson: string;
  commands: CommandExample[];
  efficientHabit: string;
}

export const COMMAND_SESSIONS: CommandSession[] = [
  {
    id: 'start-configure',
    title: 'Start and configure a repo',
    when: 'First session in a project',
    lesson: 'Use commands to create project memory, inspect loaded tools, and set the rules before asking for code changes.',
    commands: [
      { command: '/init', purpose: 'Create a starter CLAUDE.md for the repo.' },
      { command: '/memory', purpose: 'Edit durable project or user memory.' },
      { command: '/mcp', purpose: 'View and manage MCP server connections.' },
      { command: '/permissions', purpose: 'Review allow, ask, and deny rules.' },
    ],
    efficientHabit: 'Inspect loaded context and permission rules before the first broad prompt.',
  },
  {
    id: 'control-context',
    title: 'Control context during work',
    when: 'During a long task',
    lesson: 'These commands keep the session readable when history, model choice, or reasoning effort starts to matter.',
    commands: [
      { command: '/plan', purpose: 'Switch into planning before a larger change.' },
      { command: '/context', purpose: 'See what is filling the context window.' },
      { command: '/compact', purpose: 'Summarize history so the same task can continue.' },
      { command: '/btw', purpose: 'Ask a side question without growing the main thread.' },
    ],
    efficientHabit: 'Use context controls before the transcript becomes the problem.',
  },
  {
    id: 'parallel-work',
    title: 'Run work in parallel',
    when: 'When one thread is too narrow',
    lesson: 'Claude Code can manage background agents, subagents, tasks, and worktree-backed batches without turning one session into a dump of every detail.',
    commands: [
      { command: '/agents', purpose: 'Manage subagent configurations.' },
      { command: '/tasks', purpose: 'List background tasks in the current session.' },
      { command: '/background', purpose: 'Detach the current session to keep running.' },
      { command: '/batch', purpose: 'Split a large codebase change across worktrees.' },
    ],
    efficientHabit: 'Ask parallel workers for conclusions and PRs, not raw transcripts.',
  },
  {
    id: 'ship-review',
    title: 'Review and ship changes',
    when: 'Before commit or deploy',
    lesson: 'Use commands to inspect diffs, review risk, and verify behavior before relying on a final answer.',
    commands: [
      { command: '/diff', purpose: 'Open the interactive diff viewer.' },
      { command: '/code-review', purpose: 'Review the current diff for correctness issues.' },
      { command: '/simplify', purpose: 'Apply cleanup-only review findings.' },
      { command: '/verify', purpose: 'Run and observe the app after a code change.' },
    ],
    efficientHabit: 'Review the diff first, then spend model attention on the risky parts.',
  },
  {
    id: 'recover-resume',
    title: 'Recover and resume',
    when: 'Between tasks or when something breaks',
    lesson: 'These commands help you get unstuck, move sessions between surfaces, and avoid carrying stale history into unrelated work.',
    commands: [
      { command: '/clear', purpose: 'Start a new conversation with empty context.' },
      { command: '/resume', purpose: 'Return to an earlier conversation.' },
      { command: '/rewind', purpose: 'Roll back code and conversation to a checkpoint.' },
      { command: '/doctor', purpose: 'Diagnose installation and settings issues.' },
    ],
    efficientHabit: 'Clear unrelated work, resume related work, and diagnose the environment directly.',
  },
];

export const COMMAND_REFERENCE = {
  title: 'Commands reference',
  href: 'https://code.claude.com/docs/en/commands.md',
  note: 'Type / inside Claude Code to see the commands available for your plan, platform, and environment.',
};
