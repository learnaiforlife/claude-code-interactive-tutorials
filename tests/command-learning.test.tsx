import { render, screen, within } from '@testing-library/react';
import { test, expect } from 'vitest';
import CommandLearningPanel from '@/components/dashboard/CommandLearningPanel';
import { COMMAND_REFERENCE, COMMAND_SESSIONS } from '@/lib/command-learning';

test('command catalog groups commands into pure learning sessions', () => {
  expect(COMMAND_SESSIONS).toHaveLength(5);
  expect(COMMAND_SESSIONS.flatMap((session) => session.commands)).toHaveLength(20);
  expect(COMMAND_SESSIONS.map((session) => session.id)).toEqual([
    'start-configure',
    'control-context',
    'parallel-work',
    'ship-review',
    'recover-resume',
  ]);
  expect(COMMAND_SESSIONS.flatMap((session) => session.commands.map((item) => item.command))).toEqual(
    expect.arrayContaining(['/init', '/memory', '/mcp', '/permissions', '/plan', '/context', '/compact', '/diff', '/code-review', '/clear', '/resume', '/doctor']),
  );
});

test('command learning panel explains commands before token efficiency', () => {
  render(<CommandLearningPanel />);

  expect(screen.getByRole('heading', { name: /learn the slash commands as commands first/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /official command reference/i })).toHaveAttribute(
    'href',
    COMMAND_REFERENCE.href,
  );
  expect(screen.getByText(/Type \/ inside Claude Code/i)).toBeInTheDocument();

  expect(screen.getByRole('heading', { name: 'Start and configure a repo' })).toBeInTheDocument();

  const contextList = screen.getByLabelText('Control context during work commands');
  expect(within(contextList).getByText('/context')).toBeInTheDocument();
  expect(within(contextList).getByText(/See what is filling the context window/i)).toBeInTheDocument();
  expect(screen.getByText(/Efficient habit: Use context controls/i)).toBeInTheDocument();
});
