import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import Chrome from '@/components/chrome/Chrome';

test('renders the wordmark and a Cmd+K affordance', () => {
  render(<Chrome breadcrumb="beginner / 03 · bash-commands" />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
  expect(screen.getByText('⌘K')).toBeInTheDocument();
  expect(screen.getByText(/03 · bash-commands/)).toBeInTheDocument();
});

test('renders without a breadcrumb', () => {
  render(<Chrome />);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
});
