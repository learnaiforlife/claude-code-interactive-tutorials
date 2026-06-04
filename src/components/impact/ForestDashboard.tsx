'use client';

import { useState } from 'react';
import { getAllLessons } from '@/lib/lessons';
import { bankedSavedTokensIn, calculateImpact, type CascadeMode } from '@/lib/impact';
import { tipBankedIn, trackCompletionIn } from '@/lib/progress';
import { useProgress } from '@/lib/use-progress';
import CascadeControl from './CascadeControl';
import { formatTokens, ImpactMetricGrid, MethodologyLink } from './ImpactFigures';

const lessons = getAllLessons();

export default function ForestDashboard() {
  const progress = useProgress();
  const [mode, setMode] = useState<CascadeMode>('per-use');
  const { done, total } = trackCompletionIn(progress, 'beginner');
  const savedTokens = bankedSavedTokensIn(progress);
  const impact = calculateImpact(savedTokens, mode);

  return (
    <section className="border-b border-line-soft bg-paper px-6 py-10 text-ink">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Beginner Track</h1>
          <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
            Learn Claude Code the efficient way. Every banked habit saves tokens, money, and energy.
            <span className="ml-2 font-mono text-sm text-success">{'// AI is not for everything.'}</span>
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <CascadeControl mode={mode} onChange={setMode} />
            <MethodologyLink />
          </div>

          <div className="mt-6">
            <ImpactMetricGrid costUsd={impact.costUsd} eco={impact.eco} />
          </div>

          <p className="mt-4 font-mono text-xs tabular-nums text-ink-soft">
            {done} / {total} signature tips banked · {formatTokens(impact.tokens)} scaled tokens saved
          </p>
        </div>

        <div className="rounded-xl border border-line-soft bg-black/[0.025] p-5">
          <div className="grid grid-cols-8 gap-2" aria-label={`${done} of ${total} trees planted`}>
            {lessons.map((lesson) => {
              const signature = lesson.tips.find((tip) => tip.kind === 'signature')!;
              const planted = tipBankedIn(progress, lesson.slug, signature.id);
              return <Tree key={lesson.slug} planted={planted} newest={planted && lesson.order === done} order={lesson.order} />;
            })}
          </div>
          <div className="mt-5 h-px border-t border-dashed border-line-soft" />
          <div className="mt-4 flex items-center justify-between gap-4 font-mono text-xs text-ink-soft">
            <span>{forestStage(done)}</span>
            <span>{savedTokens ? `${formatTokens(savedTokens)} raw tokens` : 'Plant the first habit'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tree({ planted, newest, order }: { planted: boolean; newest: boolean; order: number }) {
  return (
    <div className="flex h-24 items-end justify-center" aria-label={`Lesson ${order} ${planted ? 'planted' : 'locked'}`}>
      <svg
        viewBox="0 0 48 72"
        className={`h-20 w-12 transition-transform duration-300 ${newest ? 'scale-105' : ''} ${planted ? 'text-success' : 'text-ink-soft/25'}`}
        aria-hidden="true"
      >
        <path d="M24 64 V38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity={planted ? 0.9 : 0.45} />
        <path d="M24 14 C13 22 9 34 16 42 C21 47 27 47 32 42 C39 34 35 22 24 14Z" fill="currentColor" opacity={planted ? 0.86 : 0.18} />
        <path d="M12 34 C7 42 11 51 21 52 C27 53 34 48 36 40 C28 42 20 39 12 34Z" fill="currentColor" opacity={planted ? 0.62 : 0.1} />
        <path d="M36 34 C42 42 38 51 27 52 C22 52 16 48 13 40 C21 42 29 39 36 34Z" fill="currentColor" opacity={planted ? 0.7 : 0.12} />
        {newest ? <circle cx="24" cy="38" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" /> : null}
      </svg>
    </div>
  );
}

function forestStage(done: number): string {
  if (done === 0) return 'Forest waiting';
  if (done < 3) return 'Sprout stage';
  if (done < 7) return 'Sapling stage';
  return 'Forest stage';
}

