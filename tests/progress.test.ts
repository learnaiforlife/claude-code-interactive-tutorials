import { test, expect, beforeEach } from 'vitest';
import {
  getProgress, bankTip, isTipBanked, isLessonComplete,
  trackCompletion, lessonStatus, resetProgress,
} from '@/lib/progress';

beforeEach(() => resetProgress());

test('starts empty', () => {
  expect(getProgress().bankedTips).toEqual({});
});

test('banking a tip is idempotent and persists', () => {
  bankTip('bash-commands', 'l3-grep');
  bankTip('bash-commands', 'l3-grep');
  expect(isTipBanked('bash-commands', 'l3-grep')).toBe(true);
  expect(getProgress().bankedTips['bash-commands']).toEqual(['l3-grep']);
});

test('a lesson is complete when its signature tip is banked', () => {
  expect(isLessonComplete('bash-commands')).toBe(false);
  bankTip('bash-commands', 'l3-command'); // inline only
  expect(isLessonComplete('bash-commands')).toBe(false);
  bankTip('bash-commands', 'l3-grep');    // signature
  expect(isLessonComplete('bash-commands')).toBe(true);
});

test('trackCompletion counts complete lessons', () => {
  expect(trackCompletion('beginner')).toEqual({ done: 0, total: 8 });
  bankTip('what-is-claude-code', 'l1-litmus');
  expect(trackCompletion('beginner')).toEqual({ done: 1, total: 8 });
});

test('lessonStatus: first is "now", later locked until predecessor done', () => {
  expect(lessonStatus('what-is-claude-code')).toBe('now');
  expect(lessonStatus('effective-prompting')).toBe('locked');
  bankTip('what-is-claude-code', 'l1-litmus');
  expect(lessonStatus('what-is-claude-code')).toBe('done');
  expect(lessonStatus('effective-prompting')).toBe('now');
});
