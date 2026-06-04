import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCommandGroups, commandCount, COMMAND_REFERENCE } from '@/lib/commands';

export const metadata: Metadata = {
  title: 'Commands · Claude Code Tutorials',
  description: 'Learn Claude Code slash commands as short interactive sessions, grouped by workflow.',
};

export default function CommandsIndex() {
  const groups = getAllCommandGroups();

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-2.6rem)] bg-paper px-6 py-12 text-ink">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Commands lab</p>
        <h1 id="commands-index-heading" className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Learn the slash commands as commands
        </h1>
        <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
          {commandCount()} commands across five groups. Each group is a short interactive session: watch it run,
          then type the command yourself.
        </p>
        <Link
          href={COMMAND_REFERENCE.href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-info hover:underline"
        >
          Official command reference
        </Link>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link
              key={group.slug}
              href={`/commands/${group.slug}`}
              className="flex flex-col rounded-xl border border-line-soft bg-surface p-5 transition-colors hover:border-ink-soft/40"
            >
              <p className="font-mono text-xs text-ink-soft">{group.categoryLabel} · {group.when}</p>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{group.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{group.concept}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {group.commands.map((example) => (
                  <li key={example.command}>
                    <code className="rounded-md border border-line-soft bg-paper px-1.5 py-0.5 font-mono text-xs text-command">
                      {example.command}
                    </code>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line-soft pt-3 font-mono text-xs text-success">Open group</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
