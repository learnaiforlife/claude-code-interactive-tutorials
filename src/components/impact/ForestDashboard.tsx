'use client';

import { useState } from 'react';
import { getAllLessons } from '@/lib/lessons';
import { bankedSavedTokensIn, bankedTipsIn, calculateImpact, type CascadeMode } from '@/lib/impact';
import { lessonCompleteIn, tipBankedIn } from '@/lib/progress';
import { useProgress } from '@/lib/use-progress';
import CascadeControl from './CascadeControl';
import { formatTokens, ImpactMetricGrid, MethodologyLink } from './ImpactFigures';

const lessons = getAllLessons();
const tipMarkers = lessons.flatMap((lesson) => lesson.tips.map((tip) => ({ lesson, tip })));

export default function ForestDashboard() {
  const progress = useProgress();
  const [mode, setMode] = useState<CascadeMode>('per-use');
  const done = lessons.filter((lesson) => lessonCompleteIn(progress, lesson.slug)).length;
  const total = lessons.length;
  const bankedTipCount = bankedTipsIn(progress).length;
  const savedTokens = bankedSavedTokensIn(progress);
  const impact = calculateImpact(savedTokens, mode);
  const plantedPercent = Math.round((bankedTipCount / tipMarkers.length) * 100);
  const newestIndex = tipMarkers.reduce((latest, marker, index) => (
    tipBankedIn(progress, marker.lesson.slug, marker.tip.id) ? index : latest
  ), -1);
  const nextMarker = tipMarkers.find(({ lesson, tip }) => !tipBankedIn(progress, lesson.slug, tip.id));
  const stage = forestStage(bankedTipCount);

  return (
    <section className="border-b border-line-soft bg-paper px-6 py-10 text-ink">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-end">
        <div className="min-w-0">
          <h1 id="forest-heading" className="text-balance text-3xl font-bold tracking-tight">Impact Forest</h1>
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

          <p className="mt-4 max-w-full font-mono text-xs leading-relaxed tabular-nums text-ink-soft">
            {bankedTipCount} / {tipMarkers.length} tips banked · {done} / {total} lessons complete · {plantedPercent}% planted · {formatTokens(impact.tokens)} scaled tokens saved
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-line-soft bg-black/[0.025] p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-success">{stage.label}</p>
              <p className="mt-1 max-w-[38ch] text-sm leading-relaxed text-ink-soft">{stage.description}</p>
            </div>
            <p className="font-mono text-xs tabular-nums text-ink-soft">{bankedTipCount} / {tipMarkers.length}</p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full border border-line-soft bg-paper" aria-hidden="true">
            <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${plantedPercent}%` }} />
          </div>

          <ol
            className="mt-5 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-x-1 gap-y-1.5 sm:grid-cols-[repeat(21,minmax(0,1fr))]"
            aria-label={`${bankedTipCount} of ${tipMarkers.length} trees planted`}
          >
            {tipMarkers.map(({ lesson, tip }, index) => {
              const planted = tipBankedIn(progress, lesson.slug, tip.id);
              return (
                <Tree
                  key={tip.id}
                  planted={planted}
                  newest={planted && index === newestIndex}
                  label={`Lesson ${lesson.order}: ${tip.title}`}
                />
              );
            })}
          </ol>
          <div className="mt-5 h-px border-t border-dashed border-line-soft" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs leading-relaxed text-ink-soft">
            <span>{savedTokens ? `${formatTokens(savedTokens)} raw tokens banked` : 'No habits banked yet'}</span>
            <span>{nextMarker ? `Next tree: ${String(nextMarker.lesson.order).padStart(2, '0')} · ${nextMarker.tip.title}` : 'Every tree planted'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tree({ planted, newest, label }: { planted: boolean; newest: boolean; label: string }) {
  return (
    <li className="flex h-9 items-end justify-center" aria-label={`${label} ${planted ? 'planted' : 'locked'}`}>
      <svg
        viewBox="0 0 48 72"
        className={`h-8 w-5 transition-transform duration-300 ${newest ? 'scale-125' : ''} ${planted ? 'text-success' : 'text-ink-soft/25'}`}
        aria-hidden="true"
      >
        <path d="M24 64 V38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity={planted ? 0.9 : 0.45} />
        <path d="M24 14 C13 22 9 34 16 42 C21 47 27 47 32 42 C39 34 35 22 24 14Z" fill="currentColor" opacity={planted ? 0.86 : 0.18} />
        <path d="M12 34 C7 42 11 51 21 52 C27 53 34 48 36 40 C28 42 20 39 12 34Z" fill="currentColor" opacity={planted ? 0.62 : 0.1} />
        <path d="M36 34 C42 42 38 51 27 52 C22 52 16 48 13 40 C21 42 29 39 36 34Z" fill="currentColor" opacity={planted ? 0.7 : 0.12} />
        {newest ? <circle cx="24" cy="38" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" /> : null}
      </svg>
    </li>
  );
}

function forestStage(bankedTips: number): { label: string; description: string } {
  if (bankedTips === 0) {
    return {
      label: 'Forest waiting',
      description: 'Bank the first habit to make token savings visible.',
    };
  }
  if (bankedTips < 8) {
    return {
      label: 'Sprout stage',
      description: 'The first efficient habits are taking root.',
    };
  }
  if (bankedTips < 18) {
    return {
      label: 'Sapling stage',
      description: 'Repeated small savings are becoming a durable workflow.',
    };
  }
  return {
    label: 'Forest stage',
    description: 'The track is turning token discipline into compounding impact.',
  };
}
