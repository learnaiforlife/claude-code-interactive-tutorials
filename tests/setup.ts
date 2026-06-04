import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// next/font requires the Next build pipeline; stub the families used in layout.tsx.
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-sans', className: 'font-sans' }),
  Fira_Code: () => ({ variable: '--font-mono', className: 'font-mono' }),
}));

// next/link needs the app-router context; render a plain anchor in jsdom.
vi.mock('next/link', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    default: ({ href, children, ...props }: { href: unknown; children?: React.ReactNode }) =>
      React.createElement('a', { href: String(href), ...props }, children),
  };
});

// Deterministic in-memory localStorage (Node 25's experimental Web Storage collides with jsdom's).
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
}

function mediaQueryList(matches: boolean) {
  return {
    matches, media: '', onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('matchMedia', () => mediaQueryList(false));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
