'use client';
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'cct.theme';
const listeners = new Set<() => void>();

function currentTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = (): Theme => currentTheme();
const getServerSnapshot = (): Theme => 'light';

/** Current theme; light by default, set by the no-FOUC script + toggleTheme. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleTheme(): void {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', next === 'dark');
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  listeners.forEach((l) => l());
}
