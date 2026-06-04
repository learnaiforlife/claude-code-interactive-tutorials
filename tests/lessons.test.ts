import { test, expect } from 'vitest';
import { getAllLessons, getLesson, getLessonsByTrack, getAdjacent, signatureTip } from '@/lib/lessons';

test('there are 8 beginner lessons, 11 feature modules, and 13 power-user modules in track order', () => {
  const all = getAllLessons();
  expect(all).toHaveLength(32);
  expect(getLessonsByTrack('beginner').map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(getLessonsByTrack('feature-modules').map((l) => l.slug)).toEqual([
    'agent-loop',
    'context-window',
    'permission-modes',
    'prompt-input',
    'continue-resume',
    'slash-commands',
    'search-and-read',
    'claude-md',
    'built-in-tools',
    'bash-powershell',
    'checkpointing',
  ]);
  expect(getLessonsByTrack('power-user').map((l) => l.slug)).toEqual([
    'custom-slash-commands',
    'skills-on-demand',
    'subagents-isolated-context',
    'hooks-automation',
    'mcp-tool-discovery',
    'plugins-workflows',
    'plugin-distribution',
    'worktrees-isolation',
    'agent-view',
    'agent-teams',
    'dynamic-workflows',
    'goals-completion',
    'scheduled-tasks-routines',
  ]);
});

test('getLesson returns the lesson for a known slug, undefined otherwise', () => {
  expect(getLesson('bash-commands')?.title).toMatch(/bash/i);
  expect(getLesson('nope')).toBeUndefined();
});

test('every lesson has exactly 3 tips and exactly one signature tip', () => {
  for (const lesson of getAllLessons()) {
    expect(lesson.tips).toHaveLength(3);
    expect(lesson.tips.filter((t) => t.kind === 'signature')).toHaveLength(1);
    expect(signatureTip(lesson).kind).toBe('signature');
    expect(lesson.check.options.filter((option) => option.correct)).toHaveLength(1);
    expect(lesson.featureFamily.length).toBeGreaterThan(0);
    expect(lesson.efficiencyHabit.length).toBeGreaterThan(0);
    expect(lesson.docsRefs.length).toBeGreaterThan(0);
    for (const ref of lesson.docsRefs) {
      expect(ref.href).toMatch(/^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/);
    }
  }
});

test('tip ids are globally unique across all lessons', () => {
  const ids = getAllLessons().flatMap((l) => l.tips.map((t) => t.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toHaveLength(96);
});

test('beginner challenge lessons and extension modules have type-it-yourself terminal challenges', () => {
  expect(getLesson('bash-commands')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-skills')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-subagents')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('effective-prompting')?.challenge).toBeUndefined();
  for (const lesson of getLessonsByTrack('power-user')) {
    expect(lesson.challenge?.accepted.length).toBeGreaterThan(0);
  }
});

test('getAdjacent gives prev/next by order', () => {
  const adj = getAdjacent('bash-commands'); // order 3
  expect(adj.prev?.slug).toBe('effective-prompting');
  expect(adj.next?.slug).toBe('creating-skills');
  expect(getAdjacent('what-is-claude-code').prev).toBeNull();
  expect(getAdjacent('common-mistakes').next).toBeNull();
  expect(getAdjacent('agent-loop').prev).toBeNull();
  expect(getAdjacent('agent-loop').next?.slug).toBe('context-window');
  expect(getAdjacent('permission-modes').next?.slug).toBe('prompt-input');
  expect(getAdjacent('checkpointing').next).toBeNull();
  expect(getAdjacent('custom-slash-commands').prev).toBeNull();
  expect(getAdjacent('custom-slash-commands').next?.slug).toBe('skills-on-demand');
  expect(getAdjacent('plugin-distribution').next?.slug).toBe('worktrees-isolation');
  expect(getAdjacent('scheduled-tasks-routines').next).toBeNull();
});
