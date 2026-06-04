import { render, screen } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import ForestDashboard from '@/components/impact/ForestDashboard';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('forest tracks all 165 bankable tips across tracks', async () => {
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('0 of 165 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/0 \/ 165 tips banked/i)).toBeInTheDocument();
});

test('forest counts inline and signature tips in the impact ledger', async () => {
  bankTip('what-is-claude-code', 'l1-context-cost');
  bankTip('what-is-claude-code', 'l1-litmus');
  render(<ForestDashboard />);
  expect(await screen.findByLabelText('2 of 165 trees planted')).toBeInTheDocument();
  expect(screen.getByText(/2 \/ 165 tips banked/i)).toBeInTheDocument();
  expect(screen.getByText(/1 \/ 55 lessons complete/i)).toBeInTheDocument();
});
