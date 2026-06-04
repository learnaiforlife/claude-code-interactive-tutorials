'use client';

import { useEffect, useState } from 'react';
import type { Tip } from '@/lib/types';
import type { CascadeMode } from '@/lib/impact';
import { calculateImpact } from '@/lib/impact';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import CascadeControl from './CascadeControl';
import { formatTokens, ImpactMetricGrid, MethodologyLink } from './ImpactFigures';

export default function PlantReward({ tip }: { tip: Tip }) {
  const [mode, setMode] = useState<CascadeMode>('per-use');
  const reducedMotion = usePrefersReducedMotion();
  const impact = calculateImpact(tip.savedTokens, mode);
  const shownTokens = useCountUp(impact.tokens, reducedMotion);

  return (
    <div className="mt-4 rounded-xl border border-success/25 bg-success/5 p-4" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-[7rem_1fr] sm:items-center">
        <PlantSvg reducedMotion={reducedMotion} />
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-success">Tip banked</p>
              <p className="mt-1 font-mono text-3xl font-bold leading-none tabular-nums text-ink">
                {formatTokens(shownTokens)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">tokens kept out of the next prompt loop</p>
            </div>
            <CascadeControl mode={mode} onChange={setMode} compact />
          </div>
          <div className="mt-4">
            <ImpactMetricGrid costUsd={impact.costUsd} eco={impact.eco} />
          </div>
          <MethodologyLink className="mt-3 inline-block" />
        </div>
      </div>
    </div>
  );
}

function useCountUp(target: number, reducedMotion: boolean): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (reducedMotion) {
      const done = window.setTimeout(() => setValue(target), 0);
      return () => window.clearTimeout(done);
    }

    const reset = window.setTimeout(() => setValue(0), 0);
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / 700, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(reset);
      window.cancelAnimationFrame(frame);
    };
  }, [target, reducedMotion]);

  return value;
}

function PlantSvg({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      viewBox="0 0 112 128"
      role="img"
      aria-label="A new tip growing into a plant"
      className={reducedMotion ? 'h-28 w-28 text-success' : 'impact-plant h-28 w-28 text-success'}
    >
      <path d="M56 110 C55 84 57 60 58 34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M57 68 C34 55 25 42 22 26 C40 27 53 38 57 68Z" fill="currentColor" opacity="0.9" />
      <path d="M58 78 C80 63 91 48 93 30 C75 32 62 45 58 78Z" fill="currentColor" opacity="0.82" />
      <path d="M56 96 C38 87 30 76 27 63 C41 63 52 73 56 96Z" fill="currentColor" opacity="0.72" />
      <ellipse cx="56" cy="113" rx="30" ry="7" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

