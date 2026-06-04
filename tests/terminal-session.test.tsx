import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import TerminalSession from '@/components/lesson/TerminalSession';
import type { SessionLine } from '@/lib/types';

const script: SessionLine[] = [
  { kind: 'prompt', text: 'grep for AuthError' },
  { kind: 'tool', text: 'grep -rn "AuthError" src' },
  { kind: 'good', text: 'Found it.' },
  { kind: 'impact', savedTokens: 9560, note: 'Search, not slurp.' },
];

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
