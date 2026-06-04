'use client';
import { useTheme, toggleTheme } from '@/lib/use-theme';

/** Light/dark switch. Lives in the (always-dark) house chrome, so it uses on-dark tokens. */
export default function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-pressed={isDark}
      className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-fg-mute transition-colors hover:text-fg"
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
