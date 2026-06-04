'use client';

import type { CascadeMode } from '@/lib/impact';
import { CASCADES } from '@/lib/impact';

export default function CascadeControl({
  mode,
  onChange,
  compact = false,
}: {
  mode: CascadeMode;
  onChange: (mode: CascadeMode) => void;
  compact?: boolean;
}) {
  return (
    <div className={`inline-flex rounded-lg border border-line-soft bg-black/[0.025] p-1 ${compact ? 'text-[0.68rem]' : 'text-xs'}`}>
      {CASCADES.map((cascade) => (
        <button
          key={cascade.mode}
          type="button"
          onClick={() => onChange(cascade.mode)}
          className={`rounded-md px-2.5 py-1.5 font-mono font-semibold transition-colors ${
            mode === cascade.mode
              ? 'bg-ink text-paper'
              : 'text-ink-soft hover:bg-black/[0.04] hover:text-ink'
          }`}
          aria-pressed={mode === cascade.mode}
        >
          {cascade.label}
        </button>
      ))}
    </div>
  );
}

