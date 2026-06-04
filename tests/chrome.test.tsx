import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import Chrome from '@/components/chrome/Chrome';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('renders the wordmark and a Cmd+K affordance', () => {
  render(<Chrome breadcrumb="beginner / 03 · bash-commands" />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /open command palette/i })).toBeInTheDocument();
  expect(screen.getByText(/03 · bash-commands/)).toBeInTheDocument();
});

test('renders without a breadcrumb', () => {
  render(<Chrome />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
});

test('opens the command palette and searches lessons', async () => {
  const user = userEvent.setup();
  render(<Chrome />);
  await user.click(screen.getByRole('button', { name: /open command palette/i }));
  expect(screen.getByRole('dialog', { name: /command palette/i })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /search lessons/i })).toHaveFocus();
  await user.type(screen.getByPlaceholderText(/search lessons/i), 'bash');
  expect(screen.getByText(/How to run bash commands/i)).toBeInTheDocument();
  expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
});

test('escape closes the command palette and clears the query', async () => {
  const user = userEvent.setup();
  render(<Chrome />);
  await user.click(screen.getByRole('button', { name: /open command palette/i }));
  await user.type(screen.getByRole('textbox', { name: /search lessons/i }), 'bash');

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog', { name: /command palette/i })).not.toBeInTheDocument();

  await user.keyboard('{Control>}k{/Control}');
  expect(screen.getByRole('textbox', { name: /search lessons/i })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: /search lessons/i })).toHaveFocus();
});

test('command palette searches feature metadata and docs references', async () => {
  const user = userEvent.setup();
  render(<Chrome />);
  await user.click(screen.getByRole('button', { name: /open command palette/i }));
  await user.type(screen.getByRole('textbox', { name: /search lessons/i }), 'prompt caching');
  expect(screen.getByText(/Common beginner mistakes/i)).toBeInTheDocument();
});

test('unlocked palette results are navigable links', async () => {
  const user = userEvent.setup();
  bankTip('what-is-claude-code', 'l1-litmus');
  bankTip('effective-prompting', 'l2-precise');
  render(<Chrome />);
  await user.keyboard('{Meta>}k{/Meta}');
  await user.type(screen.getByPlaceholderText(/search lessons/i), 'bash');
  const link = screen.getByRole('link', { name: /How to run bash commands/i });
  expect(link).toHaveAttribute('href', '/lessons/bash-commands');
  expect(screen.getByText('Now')).toBeInTheDocument();
});
