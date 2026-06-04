import { render, screen } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import ForestDashboard from '@/components/impact/ForestDashboard';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('forest tracks all 78 bankable tips across tracks', async () => {
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('0 of 78 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/0 \/ 78 tips banked/i)).toBeInTheDocument();
});

test('forest counts inline and signature tips in the impact ledger', async () => {
  bankTip('what-is-claude-code', 'l1-context-cost');
  bankTip('what-is-claude-code', 'l1-litmus');
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('2 of 78 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/2 \/ 78 tips banked/i)).toBeInTheDocument();
  expect(screen.getByText(/1 \/ 26 lessons complete/i)).toBeInTheDocument();
});
