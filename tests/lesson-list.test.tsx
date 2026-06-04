import { render, screen, within } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import LessonList from '@/components/dashboard/LessonList';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

const SLUGS = [
  'what-is-claude-code', 'effective-prompting', 'bash-commands', 'creating-skills',
  'creating-subagents', 'mcp-overview', 'mcp-management', 'common-mistakes',
];

test('renders all 8 lesson rows', () => {
  render(<LessonList />);
  for (const slug of SLUGS) {
    expect(screen.getByTestId(`lesson-row-${slug}`)).toBeInTheDocument();
  }
});

test('first lesson is "Now" (a link); later lessons are "Locked" (not links)', async () => {
  render(<LessonList />);
  const l1 = await screen.findByTestId('lesson-row-what-is-claude-code');
  const l2 = screen.getByTestId('lesson-row-effective-prompting');
  expect(within(l1).getByText('Now')).toBeInTheDocument();
  expect(l1.querySelector('a')).not.toBeNull();
  expect(within(l2).getByText('Locked')).toBeInTheDocument();
  expect(l2.querySelector('a')).toBeNull();
});

test('banking lesson 1 marks it Done and unlocks lesson 2', async () => {
  bankTip('what-is-claude-code', 'l1-litmus');
  render(<LessonList />);
  const l1 = await screen.findByTestId('lesson-row-what-is-claude-code');
  const l2 = screen.getByTestId('lesson-row-effective-prompting');
  expect(await within(l1).findByText('Done')).toBeInTheDocument();
  expect(await within(l2).findByText('Now')).toBeInTheDocument();
  expect(l2.querySelector('a')).not.toBeNull();
});
