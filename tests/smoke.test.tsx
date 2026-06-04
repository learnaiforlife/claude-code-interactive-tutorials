import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import RootLayout from '@/app/layout';

function Hello() {
  return <h1>Claude Code Tutorials</h1>;
}

test('test harness renders a component', () => {
  render(<Hello />);
  expect(screen.getByRole('heading', { name: 'Claude Code Tutorials' })).toBeInTheDocument();
});

test('root layout exposes a skip link to main content', () => {
  render(
    <RootLayout>
      <main id="main-content">Main target</main>
    </RootLayout>,
  );

  expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main-content');
});
