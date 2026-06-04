import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, beforeEach } from 'vitest';
import LessonPane from '@/components/lesson/LessonPane';
import { getLesson } from '@/lib/lessons';
import { isLessonComplete, isTipBanked, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

test('renders the lesson numeral, title and signature tip', () => {
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(screen.getByText(/Beginner Track · Tools, Permissions, And Safety/i)).toBeInTheDocument();
  expect(screen.getByText('03')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /bash commands/i })).toBeInTheDocument();
  expect(screen.getByText(/Search, don't slurp/i)).toBeInTheDocument();
  expect(screen.getByText(/What is the efficient first move/i)).toBeInTheDocument();
});

test('feature module lessons render their track and family', () => {
  render(<LessonPane lesson={getLesson('agent-loop')!} />);
  expect(screen.getByText(/Feature Modules v1 · Core Session Workflow/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 1 of 3')).toBeInTheDocument();
});

test('banking the signature tip completes the lesson and confirms', async () => {
  const user = userEvent.setup();
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(isLessonComplete('bash-commands')).toBe(false);
  await user.click(screen.getByRole('button', { name: /bank this tip/i }));
  expect(isLessonComplete('bash-commands')).toBe(true);
  expect(screen.getAllByText(/tip banked/i).length).toBeGreaterThan(0);
});

test('renders and banks inline tips without completing the lesson', async () => {
  const user = userEvent.setup();
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(screen.getByText(/Let a command do deterministic work/i)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /bank let a command do deterministic work/i }));
  expect(isTipBanked('bash-commands', 'l3-command')).toBe(true);
  expect(isLessonComplete('bash-commands')).toBe(false);
  expect(screen.getByText(/tokens kept out of the next prompt loop/i)).toBeInTheDocument();
});

test('lesson check explains wrong and correct answers', async () => {
  const user = userEvent.setup();
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  await user.click(screen.getByRole('button', { name: /Read both likely files in full/i }));
  expect(screen.getByText(/hundreds of irrelevant lines/i)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Search for the exact throw pattern first/i }));
  expect(screen.getByText(/Search narrows the context/i)).toBeInTheDocument();
});
