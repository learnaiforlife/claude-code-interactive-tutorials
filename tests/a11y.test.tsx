import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { test, expect, beforeEach } from 'vitest';
import Chrome from '@/components/chrome/Chrome';
import ForestDashboard from '@/components/impact/ForestDashboard';
import LessonPane from '@/components/lesson/LessonPane';
import TerminalSession from '@/components/lesson/TerminalSession';
import NotFound from '@/app/not-found';
import { getLesson } from '@/lib/lessons';
import { resetProgress } from '@/lib/progress';

async function expectNoA11yViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: {
      // jsdom does not compute rendered CSS color contrast reliably.
      'color-contrast': { enabled: false },
    },
  });

  expect(result.violations).toEqual([]);
}

beforeEach(() => resetProgress());

test('chrome command palette has no structural accessibility violations', async () => {
  render(<Chrome />);
  screen.getByRole('button', { name: /open command palette/i }).click();
  await expectNoA11yViolations(document.body);
});

test('forest dashboard has no structural accessibility violations', async () => {
  const { container } = render(<ForestDashboard />);
  await screen.findByLabelText('0 of 57 trees planted');
  await expectNoA11yViolations(container);
});

test('lesson surface has no structural accessibility violations', async () => {
  const lesson = getLesson('bash-commands');
  if (!lesson) throw new Error('missing lesson');

  const { container } = render(<LessonPane lesson={lesson} />);
  await expectNoA11yViolations(container);
});

test('terminal session has no structural accessibility violations', async () => {
  const lesson = getLesson('bash-commands');
  if (!lesson) throw new Error('missing lesson');

  const { container } = render(<TerminalSession script={lesson.session} challenge={lesson.challenge} />);
  await expectNoA11yViolations(container);
});

test('not found page has no structural accessibility violations', async () => {
  const { container } = render(<NotFound />);
  await expectNoA11yViolations(container);
});
