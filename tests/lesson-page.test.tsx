import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import LessonPane from '@/components/lesson/LessonPane';
import { getLesson } from '@/lib/lessons';
import { isLessonComplete, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('renders the lesson numeral, title and signature tip', () => {
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(screen.getByText('03')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /bash commands/i })).toBeInTheDocument();
  expect(screen.getByText(/Search, don't slurp/i)).toBeInTheDocument();
});

test('banking the signature tip completes the lesson and confirms', async () => {
  const user = userEvent.setup();
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(isLessonComplete('bash-commands')).toBe(false);
  await user.click(screen.getByRole('button', { name: /bank this tip/i }));
  expect(isLessonComplete('bash-commands')).toBe(true);
  expect(screen.getByText(/tip banked/i)).toBeInTheDocument();
});
