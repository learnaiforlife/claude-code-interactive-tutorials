import { render, screen } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import ForestDashboard from '@/components/impact/ForestDashboard';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('forest tracks all 273 bankable tips across tracks', async () => {
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('0 of 273 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/0 \/ 273 tips banked/i)).toBeInTheDocument();
  expect(screen.getByText(/Forest waiting/i)).toBeInTheDocument();
  expect(screen.getByText(/Bank the first habit to make token savings visible/i)).toBeInTheDocument();
  expect(screen.getByText(/Next tree: 01 · AI is not for everything/i)).toBeInTheDocument();
});

test('forest counts inline and signature tips in the impact ledger', async () => {
  bankTip('what-is-claude-code', 'l1-context-cost');
  bankTip('what-is-claude-code', 'l1-litmus');
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('2 of 273 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/2 \/ 273 tips banked/i)).toBeInTheDocument();
  expect(screen.getByText(/1 \/ 91 lessons complete/i)).toBeInTheDocument();
  expect(screen.getByText(/Sprout stage/i)).toBeInTheDocument();
  expect(screen.getByText(/3,200 raw tokens banked/i)).toBeInTheDocument();
});
