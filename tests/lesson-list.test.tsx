import { render, screen, within } from '@testing-library/react';
import { test, expect, beforeEach } from 'vitest';
import LessonList from '@/components/dashboard/LessonList';
import { bankTip, resetProgress } from '@/lib/progress';

beforeEach(() => resetProgress());

const SLUGS = [
  'what-is-claude-code', 'effective-prompting', 'bash-commands', 'creating-skills',
  'creating-subagents', 'mcp-overview', 'mcp-management', 'common-mistakes',
  'agent-loop', 'context-window', 'permission-modes', 'prompt-input',
  'continue-resume', 'slash-commands', 'search-and-read', 'claude-md',
  'built-in-tools', 'bash-powershell', 'checkpointing',
  'custom-slash-commands', 'skills-on-demand', 'subagents-isolated-context',
  'hooks-automation', 'mcp-tool-discovery', 'plugins-workflows', 'plugin-distribution',
  'worktrees-isolation', 'agent-view', 'agent-teams', 'dynamic-workflows',
  'goals-completion', 'scheduled-tasks-routines',
];

test('renders beginner, feature-module, and power-user rows grouped by track', () => {
  render(<LessonList />);
  expect(screen.getByRole('heading', { name: 'Beginner Track' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Feature Modules v1' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Power User Modules' })).toBeInTheDocument();
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

test('first feature module starts available in its own track', async () => {
  render(<LessonList />);
  const agentLoop = await screen.findByTestId('lesson-row-agent-loop');
  const contextWindow = screen.getByTestId('lesson-row-context-window');
  expect(within(agentLoop).getByText('Now')).toBeInTheDocument();
  expect(agentLoop.querySelector('a')).not.toBeNull();
  expect(within(contextWindow).getByText('Locked')).toBeInTheDocument();
});

test('first power-user module starts available in its own track', async () => {
  render(<LessonList />);
  const customCommands = await screen.findByTestId('lesson-row-custom-slash-commands');
  const skills = screen.getByTestId('lesson-row-skills-on-demand');
  expect(within(customCommands).getByText('Now')).toBeInTheDocument();
  expect(customCommands.querySelector('a')).not.toBeNull();
  expect(within(skills).getByText('Locked')).toBeInTheDocument();
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
