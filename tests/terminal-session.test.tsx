import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';
import TerminalSession from '@/components/lesson/TerminalSession';
import type { SessionLine, TerminalChallenge } from '@/lib/types';

const script: SessionLine[] = [
  { kind: 'prompt', text: 'grep for AuthError' },
  { kind: 'tool', text: 'grep -rn "AuthError" src' },
  { kind: 'good', text: 'Found it.' },
  { kind: 'impact', savedTokens: 9560, note: 'Search, not slurp.' },
];

const challenge: TerminalChallenge = {
  intro: 'Your turn: search without slurping files.',
  prompt: 'Type the efficient command',
  accepted: ['rg "AuthError" src/server'],
  hint: 'Search for the exact error name.',
  incorrect: 'Search first, then read.',
  success: [
    { kind: 'tool', text: 'rg "AuthError" src/server' },
    { kind: 'good', text: 'Found it.' },
  ],
};

function reduceMotion() {
  vi.stubGlobal('matchMedia', () => ({
    matches: true, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  }));
}

test('under reduced motion the full transcript renders immediately', () => {
  reduceMotion();
  render(<TerminalSession script={script} />);
  expect(screen.getByText(/grep for AuthError/)).toBeInTheDocument();
  expect(screen.getByText(/Found it\./)).toBeInTheDocument();
  expect(screen.getByText(/9,560 tokens saved/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument();
});

test('interactive challenge supports hint, incorrect, reset and correct command', async () => {
  reduceMotion();
  const user = userEvent.setup();
  render(<TerminalSession script={script} challenge={challenge} />);

  const input = screen.getByLabelText(/type the efficient command/i);
  await user.type(input, '?');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getByText(/Hint: Search for the exact error name/i)).toBeInTheDocument();

  await user.type(input, 'Read src/server/auth.ts');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getByText(/Search first, then read/i)).toBeInTheDocument();

  await user.type(input, 'reset');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.queryByText(/Search first, then read/i)).not.toBeInTheDocument();

  await user.type(input, 'rg "AuthError" src/server');
  await user.click(screen.getByRole('button', { name: 'Run' }));
  expect(screen.getAllByText(/Found it\./).length).toBeGreaterThan(0);
});
