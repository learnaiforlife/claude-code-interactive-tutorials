import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';

function Hello() {
  return <h1>Claude Code Tutorials</h1>;
}

test('test harness renders a component', () => {
  render(<Hello />);
  expect(screen.getByRole('heading', { name: 'Claude Code Tutorials' })).toBeInTheDocument();
});
