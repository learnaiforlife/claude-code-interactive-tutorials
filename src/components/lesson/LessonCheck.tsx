'use client';

import { useState } from 'react';
import type { LessonCheck as LessonCheckData } from '@/lib/types';
import { Check } from '@/components/ui/icons';

export default function LessonCheck({ check }: { check: LessonCheckData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = check.options.find((option) => option.id === selectedId);

  return (
    <div className="mt-5 rounded-xl border border-line-soft bg-black/[0.02] p-5">
      <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Check</div>
      <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{check.question}</h2>
      <div className="mt-4 space-y-2">
        {check.options.map((option) => {
          const chosen = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              aria-pressed={chosen}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                chosen
                  ? option.correct
                    ? 'border-success bg-success/10'
                    : 'border-command bg-command/10'
                  : 'border-line-soft bg-paper hover:bg-black/[0.025]'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.68rem] ${
                  chosen
                    ? option.correct
                      ? 'border-success bg-success text-paper'
                      : 'border-command text-command'
                    : 'border-line-soft text-ink-soft'
                }`}
                aria-hidden="true"
              >
                {chosen && option.correct ? <Check className="h-3 w-3" /> : option.id.toUpperCase().slice(0, 1)}
              </span>
              <span className="text-sm leading-relaxed text-ink">{option.text}</span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm leading-relaxed ${
            selected.correct ? 'bg-success/10 text-success' : 'bg-command/10 text-command'
          }`}
          role="status"
        >
          {selected.explanation}
        </div>
      ) : null}
    </div>
  );
}

