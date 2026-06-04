import { render, screen, within } from '@testing-library/react';
import { test, expect } from 'vitest';
import CommandLearningPanel from '@/components/dashboard/CommandLearningPanel';
import { COMMAND_REFERENCE, COMMAND_GROUPS, commandCount } from '@/lib/commands';

test('command catalog groups commands into pure learning sessions', () => {
  expect(COMMAND_GROUPS).toHaveLength(5);
  expect(commandCount()).toBe(26);
  expect(COMMAND_GROUPS.map((group) => group.slug)).toEqual([
    'setup-config',
    'context-session',
    'planning-work',
    'review-ship',
    'recovery-debug',
  ]);
  expect(COMMAND_GROUPS.flatMap((group) => group.commands.map((item) => item.command))).toEqual(
    expect.arrayContaining([
      '/init', '/memory', '/mcp', '/permissions', '/plan',
      '/context', '/compact', '/diff', '/code-review', '/clear', '/resume', '/doctor',
    ]),
  );
});

test('command learning panel links each group into the commands lab', () => {
  render(<CommandLearningPanel />);

  expect(screen.getByRole('heading', { name: /learn the slash commands as commands first/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /open the commands lab/i })).toHaveAttribute('href', '/commands');
  expect(screen.getByRole('link', { name: /official command reference/i })).toHaveAttribute('href', COMMAND_REFERENCE.href);
  expect(screen.getByText(/Type \/ inside Claude Code/i)).toBeInTheDocument();

  const card = screen.getByRole('link', { name: /Set up and configure a repo/i });
  expect(card).toHaveAttribute('href', '/commands/setup-config');

  const contextList = screen.getByLabelText('Control context during a session commands');
  expect(within(contextList).getByText('/context')).toBeInTheDocument();
  expect(within(contextList).getByText(/See what is filling the context window/i)).toBeInTheDocument();
  expect(screen.getByText(/Efficient habit: Compact a continuing task/i)).toBeInTheDocument();
});
