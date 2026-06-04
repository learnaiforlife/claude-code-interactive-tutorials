'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Lesson, TerminalChallenge, Tip } from '@/lib/types';
import { signatureTip, getAdjacent, getLessonsByTrack, getTrackInfo } from '@/lib/lessons';
import { tipBankedIn } from '@/lib/progress';
import { useProgress, bankTipNow } from '@/lib/use-progress';
import { Check, ArrowLeft, ArrowRight } from '@/components/ui/icons';
import PlantReward from '@/components/impact/PlantReward';
import LessonCheck from './LessonCheck';

export default function LessonPane({ lesson }: { lesson: Lesson }) {
  const sig = signatureTip(lesson);
  const inlineTips = lesson.tips.filter((tip) => tip.kind === 'inline');
  const { prev, next } = getAdjacent(lesson.slug);
  const trackTotal = getLessonsByTrack(lesson.track).length;
  const track = getTrackInfo(lesson.track);
  const progress = useProgress();
  const banked = tipBankedIn(progress, lesson.slug, sig.id);
  const [rewardTipId, setRewardTipId] = useState<string | null>(null);
  const rewardTip = lesson.tips.find((tip) => tip.id === rewardTipId) ?? (banked ? sig : null);

  function bankTip(tip: Tip): void {
    bankTipNow(lesson.slug, tip.id);
    setRewardTipId(tip.id);
  }

  return (
    <section className="flex min-h-full min-w-0 flex-col bg-paper px-7 py-9 text-ink md:px-10 md:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">
        {track.title} · {lesson.featureFamily}
      </p>

      <div className="mt-4 flex items-start gap-5">
        <span className="font-mono text-[3.25rem] font-extrabold leading-[0.8] tracking-tight text-ink-soft tabular-nums">
          {String(lesson.order).padStart(2, '0')}
        </span>
        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">{lesson.title}</h1>
      </div>

      <p className="mt-5 max-w-[58ch] text-[0.95rem] leading-relaxed text-ink">{lesson.context}</p>

      <ModuleBrief lesson={lesson} />

      <div className="mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">The idea</p>
        <p className="mt-2 max-w-[58ch] leading-relaxed text-ink-soft">{lesson.concept}</p>
      </div>

      <p className="mt-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <span className="text-success">▶</span> Watch the session, then bank each token-saving habit.
      </p>

      {lesson.challenge ? <ChallengeBrief challenge={lesson.challenge} /> : null}

      <div className="mt-4 rounded-xl border border-line-soft bg-black/[0.02] p-5">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wide text-success">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Signature tip
        </div>
        <h2 className="mt-2.5 text-lg font-semibold leading-snug">{sig.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{sig.detail}</p>

        {banked ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success/10 px-3.5 py-2 font-mono text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Tip banked · ~{sig.savedTokens.toLocaleString()} tokens saved
          </div>
        ) : (
          <button
            type="button"
            onClick={() => bankTip(sig)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success px-3.5 py-2 font-mono text-sm font-semibold text-paper transition-transform duration-150 ease-out hover:-translate-y-px active:translate-y-0"
          >
            Bank this tip · ~{sig.savedTokens.toLocaleString()} tokens
          </button>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-line-soft bg-paper p-5">
        <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
          More habits in this lesson
        </div>
        <ul className="mt-3 space-y-3">
          {inlineTips.map((tip) => {
            const isBanked = tipBankedIn(progress, lesson.slug, tip.id);
            return (
              <li key={tip.id} className="rounded-lg border border-line-soft bg-black/[0.018] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-ink">{tip.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{tip.detail}</p>
                  </div>
                  {isBanked ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 font-mono text-xs font-medium text-success">
                      <Check className="h-3.5 w-3.5" /> Banked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bankTip(tip)}
                      aria-label={`Bank tip · ~${tip.savedTokens.toLocaleString()} tokens: ${tip.title}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-line-soft px-2.5 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:bg-success/10 hover:text-success"
                    >
                      Bank tip · ~{tip.savedTokens.toLocaleString()}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {rewardTip ? <PlantReward key={rewardTip.id} tip={rewardTip} /> : null}

      <LessonCheck check={lesson.check} />

      <nav className="mt-auto flex items-center justify-between pt-10 font-mono text-xs text-ink-soft">
        {prev ? (
          <Link href={`/lessons/${prev.slug}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> {String(prev.order).padStart(2, '0')}
          </Link>
        ) : (
          <span />
        )}
        <span>Lesson {lesson.order} of {trackTotal}</span>
        {next ? (
          <Link href={`/lessons/${next.slug}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            {String(next.order).padStart(2, '0')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </section>
  );
}

function ModuleBrief({ lesson }: { lesson: Lesson }) {
  return (
    <section aria-labelledby="module-brief-heading" className="mt-6 rounded-xl border border-line-soft bg-black/[0.018] p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="module-brief-heading" className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Module brief
        </h2>
        <span className="font-mono text-xs text-ink-soft">{lesson.estimatedMinutes} min · {lesson.format}</span>
      </div>

      <dl className="mt-4 grid gap-4 text-sm md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        <div>
          <dt className="font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-info">Feature</dt>
          <dd className="mt-1 font-medium leading-relaxed text-ink">{lesson.featureFamily}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-success">Efficient habit</dt>
          <dd className="mt-1 leading-relaxed text-ink">{lesson.efficiencyHabit}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-command">Docs</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {lesson.docsRefs.map((ref) => (
              <Link
                key={ref.href}
                href={ref.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center rounded-lg border border-line-soft bg-paper px-2.5 py-1.5 font-mono text-xs font-semibold text-ink transition-colors hover:border-info/40 hover:text-info"
              >
                <span className="truncate">{ref.title}</span>
              </Link>
            ))}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function ChallengeBrief({ challenge }: { challenge: TerminalChallenge }) {
  return (
    <section
      aria-labelledby="challenge-brief-heading"
      className="mt-4 rounded-xl border border-info/25 bg-info/5 p-5"
    >
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
