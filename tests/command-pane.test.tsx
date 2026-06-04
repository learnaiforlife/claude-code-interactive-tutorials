import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect } from 'vitest';
import CommandPane from '@/components/command/CommandPane';
import { getCommandGroup } from '@/lib/commands';

const group = getCommandGroup('context-session')!;

test('renders header, concept, commands table, habit, docs, challenge, and check', () => {
  render(<CommandPane group={group} />);

  expect(screen.getByText('02')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /control context/i })).toBeInTheDocument();
  expect(screen.getByText(/meter that never stops/i)).toBeInTheDocument();

  // commands table chips (target the <code> chip, not prose mentions)
  expect(screen.getByText('/context', { selector: 'code' })).toBeInTheDocument();
  expect(screen.getByText('/clear', { selector: 'code' })).toBeInTheDocument();
  expect(screen.getByText(/Start a new conversation with empty context\./i)).toBeInTheDocument();

  // efficiency habit + docs link
  expect(screen.getByText(/Compact a continuing task/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Context window/i })).toHaveAttribute(
    'href',
    'https://code.claude.com/docs/en/context-window.md',
  );

  // challenge brief + check question
  expect(screen.getByText(/Type it yourself/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /unrelated feature/i })).toBeInTheDocument();
});

test('the check explains a wrong answer then a right one', async () => {
  const user = userEvent.setup();
  render(<CommandPane group={group} />);

  await user.click(screen.getByRole('button', { name: /Keep going in the same thread/i }));
  expect(screen.getByText(/re-sent each turn, for nothing/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Run \/clear so the new task/i }));
  expect(screen.getByText(/Stale history would be re-sent/i)).toBeInTheDocument();
});
