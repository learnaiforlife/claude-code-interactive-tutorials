import type { Progress, Track } from './types';
import { getLesson, signatureTip, getLessonsByTrack, getAdjacent } from './lessons';

const KEY = 'cct.progress.v1';
const EMPTY: Progress = { bankedTips: {} };

function read(): Progress {
  if (typeof localStorage === 'undefined') return structuredClone(EMPTY);
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}

function write(p: Progress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProgress(): Progress {
  return read();
}

export function resetProgress(): void {
  write(structuredClone(EMPTY));
}

export function bankTip(slug: string, tipId: string): void {
  const p = read();
  const list = p.bankedTips[slug] ?? [];
  if (!list.includes(tipId)) {
    p.bankedTips[slug] = [...list, tipId];
    write(p);
  }
}

export function isTipBanked(slug: string, tipId: string): boolean {
  return (read().bankedTips[slug] ?? []).includes(tipId);
}

export function isLessonComplete(slug: string): boolean {
  const lesson = getLesson(slug);
  if (!lesson) return false;
  return isTipBanked(slug, signatureTip(lesson).id);
}

export function trackCompletion(track: Track): { done: number; total: number } {
  const lessons = getLessonsByTrack(track);
  return { done: lessons.filter((l) => isLessonComplete(l.slug)).length, total: lessons.length };
}

export type LessonStatus = 'done' | 'now' | 'locked';

export function lessonStatus(slug: string): LessonStatus {
  if (isLessonComplete(slug)) return 'done';
  const { prev } = getAdjacent(slug);
  if (prev && !isLessonComplete(prev.slug)) return 'locked';
  return 'now';
}
