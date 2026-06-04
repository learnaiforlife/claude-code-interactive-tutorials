import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import ThemeToggle from '@/components/chrome/ThemeToggle';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
});

test('toggles the theme class + persists, defaulting from light', async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);

  await user.click(screen.getByRole('button', { name: /switch to dark theme/i }));
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('cct.theme')).toBe('dark');

  await user.click(screen.getByRole('button', { name: /switch to light theme/i }));
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('cct.theme')).toBe('light');
});
