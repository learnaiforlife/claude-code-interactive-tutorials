import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';
import TerminalSession from '@/components/lesson/TerminalSession';
import { getCommandGroup } from '@/lib/commands';

function reduceMotion() {
  vi.stubGlobal('matchMedia', () => ({
    matches: true, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  }));
}

const group = getCommandGroup('context-session')!;

test('a command group challenge supports hint, incorrect, reset, and the accepted command', async () => {
  reduceMotion();
  const user = userEvent.setup();
  render(<TerminalSession script={group.session} challenge={group.challenge} />);

  const input = screen.getByLabelText(/empties the context/i);

  await user.type(input, '?');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getByText(/Hint:/i)).toBeInTheDocument();

  await user.type(input, '/compact');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getByText(/do not carry the old transcript/i)).toBeInTheDocument();

  await user.type(input, 'reset');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.queryByText(/do not carry the old transcript/i)).not.toBeInTheDocument();

  await user.type(input, '/clear');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getByText(/21,000 tokens saved/)).toBeInTheDocument();
});
