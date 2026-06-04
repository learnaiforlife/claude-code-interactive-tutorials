import Link from 'next/link';
import CommandPalette from './CommandPalette';
import ThemeToggle from './ThemeToggle';

/**
 * Terminal-native house chrome (DESIGN.md §3). Wraps every screen.
 * `breadcrumb` is rendered when provided; per-page breadcrumbs are wired in Phase 4.
 */
export default function Chrome({ breadcrumb }: { breadcrumb?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-panel px-4 py-2 font-mono text-xs">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f56' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#27c93f' }} />
      </span>
      <Link href="/" className="font-bold tracking-tight text-success-bright">
        claude-code · learn
      </Link>
      <span className="min-w-0 flex-1 truncate text-fg-mute">{breadcrumb ?? ''}</span>
      <ThemeToggle />
      <CommandPalette />
    </header>
  );
}
