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
  expect(screen.getByText('Module brief')).toBeInTheDocument();
  expect(screen.getByText('Feature')).toBeInTheDocument();
  expect(screen.getByText('Efficient habit')).toBeInTheDocument();
  expect(screen.getByText('Docs')).toBeInTheDocument();
  expect(screen.getByText(/Search and compute with shell tools before reading large files into context/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Tools reference/i })).toHaveAttribute(
    'href',
    'https://code.claude.com/docs/en/tools-reference.md',
  );
  expect(screen.getByRole('heading', { name: 'Module path' })).toBeInTheDocument();
  expect(screen.getByText('What it is')).toBeInTheDocument();
  expect(screen.getByText('How it works')).toBeInTheDocument();
  expect(screen.getByText('Use it')).toBeInTheDocument();
  expect(screen.getByText('Use it efficiently')).toBeInTheDocument();
  expect(screen.getByText(/A Claude Code session demonstrates the workflow/i)).toBeInTheDocument();
  expect(screen.getByText(/Search, don't slurp/i)).toBeInTheDocument();
  expect(screen.getByText(/What is the efficient first move/i)).toBeInTheDocument();
});

test('surfaces type-it-yourself challenge instructions in the lesson pane', () => {
  render(<LessonPane lesson={getLesson('bash-commands')!} />);
  expect(screen.getByRole('heading', { level: 2, name: /Your turn: find where auth errors are thrown/i })).toBeInTheDocument();
  expect(screen.getByText(/After the transcript finishes, the terminal asks/i)).toBeInTheDocument();
  expect(screen.getByText(/Type the efficient command/i)).toBeInTheDocument();
  expect(screen.getByText('?')).toBeInTheDocument();
  expect(screen.getByText('reset')).toBeInTheDocument();
});

test('feature module lessons render their track and family', () => {
  render(<LessonPane lesson={getLesson('agent-loop')!} />);
  expect(screen.getByText(/Feature Modules · Core Session Workflow/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 1 of 24')).toBeInTheDocument();
  expect(screen.getByText(/Approve narrow deterministic tool calls and challenge broad repo exploration/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Best practices for Claude Code/i })).toHaveAttribute(
    'href',
    'https://code.claude.com/docs/en/best-practices.md',
  );
});

test('runtime setup feature lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('quickstart-install-login')!} />);
  expect(screen.getByText(/Feature Modules · Runtime Setup/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 12 of 24')).toBeInTheDocument();
  expect(screen.getByText(/What should you verify before asking Claude/i)).toBeInTheDocument();
});

test('power-user module lessons render their track and extension family', () => {
  render(<LessonPane lesson={getLesson('custom-slash-commands')!} />);
  expect(screen.getByText(/Power User Modules · Extensions/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 1 of 26')).toBeInTheDocument();
});

test('parallel-work power-user lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('worktrees-isolation')!} />);
  expect(screen.getByText(/Power User Modules · Parallel And Large Work/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 8 of 26')).toBeInTheDocument();
});

test('integration power-user lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('vs-code-integration')!} />);
  expect(screen.getByText(/Power User Modules · Integrations/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 14 of 26')).toBeInTheDocument();
});

test('team module lessons render their track and SDK family', () => {
  render(<LessonPane lesson={getLesson('agent-sdk-overview')!} />);
  expect(screen.getByText(/Team Modules · Programmatic Use \/ SDK/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 1 of 33')).toBeInTheDocument();
  expect(screen.getByText(/Start with the smallest tool surface and load project features only when they replace repeated prompt setup/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /SDK overview/i })).toHaveAttribute(
    'href',
    'https://code.claude.com/docs/en/agent-sdk/overview.md',
  );
});

test('enterprise team lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('organization-setup')!} />);
  expect(screen.getByText(/Team Modules · Enterprise Operations/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 13 of 33')).toBeInTheDocument();
  expect(screen.getByText(/What should an organization decide/i)).toBeInTheDocument();
});

test('agent-sdk-internals lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('sdk-agent-loop')!} />);
  expect(screen.getByText(/Team Modules · Agent SDK Internals/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 25 of 33')).toBeInTheDocument();
  expect(screen.getByText(/What is the efficient way to debug an SDK run/i)).toBeInTheDocument();
});

test('release-awareness lessons render their family and position', () => {
  render(<LessonPane lesson={getLesson('whats-new-changelog')!} />);
  expect(screen.getByText(/Team Modules · Release Awareness/i)).toBeInTheDocument();
  expect(screen.getByText('Lesson 33 of 33')).toBeInTheDocument();
  expect(screen.getByText(/What is the efficient way to use the changelog/i)).toBeInTheDocument();
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
  await user.click(screen.getByRole('button', { name: /bank tip.*let a command do deterministic work/i }));
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
