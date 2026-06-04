import Link from 'next/link';
import type { CommandGroup } from '@/lib/commands';
import type { TerminalChallenge } from '@/lib/types';
import { getAdjacentGroup, getAllCommandGroups } from '@/lib/commands';
import LessonCheck from '@/components/lesson/LessonCheck';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';

export default function CommandPane({ group }: { group: CommandGroup }) {
  const { prev, next } = getAdjacentGroup(group.slug);
  const total = getAllCommandGroups().length;

  return (
    <section className="flex min-h-full min-w-0 flex-col bg-paper px-7 py-9 text-ink md:px-10 md:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
        Commands lab · {group.categoryLabel}
      </p>

      <div className="mt-4 flex items-start gap-5">
        <span className="font-mono text-[3.25rem] font-extrabold leading-[0.8] tracking-tight text-ink-soft tabular-nums">
          {String(group.order).padStart(2, '0')}
        </span>
        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">{group.title}</h1>
      </div>

      <p className="mt-5 max-w-[58ch] text-[0.95rem] leading-relaxed text-ink">{group.context}</p>

      <section aria-labelledby="command-brief-heading" className="mt-6 rounded-xl border border-line-soft bg-black/[0.018] p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="command-brief-heading" className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Command brief
          </h2>
          <span className="font-mono text-xs text-ink-soft">{group.commands.length} commands · {group.when}</span>
        </div>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-success">Efficient habit</dt>
            <dd className="mt-1 leading-relaxed text-ink">{group.efficiencyHabit}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-command">Docs</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {group.docsRefs.map((docRef) => (
                <Link
                  key={docRef.href}
                  href={docRef.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center rounded-lg border border-line-soft bg-paper px-2.5 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-info/40 hover:text-info"
                >
                  <span className="truncate">{docRef.title}</span>
                </Link>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">The idea</p>
        <p className="mt-2 max-w-[58ch] leading-relaxed text-ink-soft">{group.concept}</p>
      </div>

      <section aria-labelledby="commands-table-heading" className="mt-6">
        <h2 id="commands-table-heading" className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Commands in this group
        </h2>
        <dl className="mt-3 divide-y divide-line-soft rounded-xl border border-line-soft">
          {group.commands.map((example) => (
            <div key={example.command} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
              <dt className="shrink-0 sm:w-40">
                <code className="rounded-md border border-line-soft bg-black/[0.04] px-1.5 py-0.5 font-mono text-sm text-ink">
                  {example.command}
                </code>
              </dt>
              <dd className="min-w-0 text-sm leading-relaxed text-ink-soft">{example.purpose}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <span className="text-success">▶</span> Watch the session, then try the command yourself.
      </p>

      <ChallengeBrief challenge={group.challenge} />

      <LessonCheck check={group.check} />

      <nav className="mt-auto flex items-center justify-between pt-10 font-mono text-xs text-ink-soft">
        {prev ? (
          <Link href={`/commands/${prev.slug}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> {String(prev.order).padStart(2, '0')}
          </Link>
        ) : (
          <span />
        )}
        <span>Group {group.order} of {total}</span>
        {next ? (
          <Link href={`/commands/${next.slug}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            {String(next.order).padStart(2, '0')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </section>
  );
}

function ChallengeBrief({ challenge }: { challenge: TerminalChallenge }) {
  return (
    <section aria-labelledby="challenge-brief-heading" className="mt-4 rounded-xl border border-info/25 bg-info/5 p-5">
      <div className="font-mono text-xs font-semibold uppercase tracking-wide text-info">Type it yourself</div>
      <h2 id="challenge-brief-heading" className="mt-2 text-lg font-semibold leading-snug text-ink">
        {challenge.intro}
      </h2>
      <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
        After the transcript finishes, the terminal asks: <span className="font-medium text-ink">{challenge.prompt}</span>
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs text-ink-soft">
        Type <kbd className="rounded border border-line-soft bg-paper px-1.5 py-0.5 text-ink">?</kbd> for a hint, or{' '}
        <kbd className="rounded border border-line-soft bg-paper px-1.5 py-0.5 text-ink">reset</kbd> to clear your attempt.
      </p>
    </section>
  );
}
