import { render, screen } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import Home from '@/app/page';
import { resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('landing page leads with command learning and the full curriculum', () => {
  render(<Home />);

  expect(screen.getByRole('heading', { level: 1, name: /learn claude code by doing it/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /explore commands/i })).toHaveAttribute('href', '#commands-lab-heading');
  expect(screen.getByRole('link', { name: /view modules/i })).toHaveAttribute('href', '#tracks-heading');
  expect(screen.getByRole('heading', { name: /learn the slash commands as commands first/i })).toBeInTheDocument();
  expect(screen.getByText(/Command fluency first, efficiency second/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /feature modules with efficient-use hooks/i })).toBeInTheDocument();
  expect(screen.getByText(/91 modules, 20 highlighted commands, 75 typed terminal challenges, and 273 bankable habits/i)).toBeInTheDocument();
});
