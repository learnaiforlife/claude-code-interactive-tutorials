'use client';
import { useSyncExternalStore } from 'react';
import type { Progress } from './types';
import { getProgress, bankTip } from './progress';

/*
  Reactive localStorage-backed progress via useSyncExternalStore:
  - SSR/first-client render use the empty server snapshot (no hydration mismatch)
  - after mount, components see real stored progress and re-render on change
  - bankTipNow() mutates and notifies, so every mounted view updates at once
*/
const EMPTY: Progress = { bankedTips: {} };
let snapshot: Progress = EMPTY;
const listeners = new Set<() => void>();

function emit(): void {
  snapshot = getProgress();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  if (listeners.size === 0) snapshot = getProgress();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === 'cct.progress.v1') emit();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

const getSnapshot = (): Progress => snapshot;
const getServerSnapshot = (): Progress => EMPTY;

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function bankTipNow(slug: string, tipId: string): void {
  bankTip(slug, tipId);
  emit();
}
