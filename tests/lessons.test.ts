import { test, expect } from 'vitest';
import { getAllLessons, getLesson, getAdjacent, signatureTip } from '@/lib/lessons';

test('there are 8 beginner lessons in order 1..8', () => {
  const all = getAllLessons();
  expect(all).toHaveLength(8);
  expect(all.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
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
  }
});

test('tip ids are globally unique across all lessons', () => {
  const ids = getAllLessons().flatMap((l) => l.tips.map((t) => t.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toHaveLength(24);
});

test('lessons 3, 4 and 5 have type-it-yourself terminal challenges', () => {
  expect(getLesson('bash-commands')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-skills')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-subagents')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('effective-prompting')?.challenge).toBeUndefined();
});

test('getAdjacent gives prev/next by order', () => {
  const adj = getAdjacent('bash-commands'); // order 3
  expect(adj.prev?.slug).toBe('effective-prompting');
  expect(adj.next?.slug).toBe('creating-skills');
  expect(getAdjacent('what-is-claude-code').prev).toBeNull();
  expect(getAdjacent('common-mistakes').next).toBeNull();
});
