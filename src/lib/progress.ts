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

export type LessonStatus = 'done' | 'now' | 'locked';

/* Pure derivations from a Progress snapshot (used by reactive UI via useProgress). */
export function tipBankedIn(p: Progress, slug: string, tipId: string): boolean {
  return (p.bankedTips[slug] ?? []).includes(tipId);
}

export function lessonCompleteIn(p: Progress, slug: string): boolean {
  const lesson = getLesson(slug);
  return lesson ? tipBankedIn(p, slug, signatureTip(lesson).id) : false;
}

export function lessonStatusIn(p: Progress, slug: string): LessonStatus {
  if (lessonCompleteIn(p, slug)) return 'done';
  const { prev } = getAdjacent(slug);
  if (prev && !lessonCompleteIn(p, prev.slug)) return 'locked';
  return 'now';
}

export function trackCompletionIn(p: Progress, track: Track): { done: number; total: number } {
  const lessons = getLessonsByTrack(track);
  return { done: lessons.filter((l) => lessonCompleteIn(p, l.slug)).length, total: lessons.length };
}

/* localStorage-reading convenience wrappers (non-reactive callers + tests). */
export function isTipBanked(slug: string, tipId: string): boolean {
  return tipBankedIn(read(), slug, tipId);
}

export function isLessonComplete(slug: string): boolean {
  return lessonCompleteIn(read(), slug);
}

export function lessonStatus(slug: string): LessonStatus {
  return lessonStatusIn(read(), slug);
}

export function trackCompletion(track: Track): { done: number; total: number } {
  return trackCompletionIn(read(), track);
}
