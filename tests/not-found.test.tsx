import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import NotFound from '@/app/not-found';

test('renders the branded not-found page', () => {
  render(<NotFound />);
  expect(screen.getByRole('heading', { name: /outside the lesson plan/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /back to track/i })).toHaveAttribute('href', '/');
  expect(screen.getByText(/Try ⌘K/i)).toBeInTheDocument();
});

