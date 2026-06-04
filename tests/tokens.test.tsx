import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import RootLayout from '@/app/layout';

// The root layout composes the app shell: house chrome + page content.
// (Font-variable / token wiring is verified visually in the browser — asserting
// className on a nested <html> under jsdom is brittle and low-value.)
test('root layout renders the house chrome and its children', () => {
  render(<RootLayout><main>page-content</main></RootLayout>);
  expect(screen.getByText(/claude-code · learn/i)).toBeInTheDocument();
  expect(screen.getByText('page-content')).toBeInTheDocument();
});
