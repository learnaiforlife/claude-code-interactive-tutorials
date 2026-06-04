'use client';
import Link from 'next/link';
import { getAllLessons } from '@/lib/lessons';
import { lessonStatusIn, trackCompletionIn, type LessonStatus } from '@/lib/progress';
import { useProgress } from '@/lib/use-progress';
import { Check, Lock, ArrowRight } from '@/components/ui/icons';

const lessons = getAllLessons();

export default function LessonList() {
  const progress = useProgress();
  const { done, total } = trackCompletionIn(progress, 'beginner');
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="mb-9 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-ink-soft">{done} / {total} banked</span>
      </div>

      <ol className="list-none">
        {lessons.map((l) => {
          const status = lessonStatusIn(progress, l.slug);
          const locked = status === 'locked';
          const inner = (
            <div className="flex items-center gap-4 py-4">
              <span
                className={`w-7 shrink-0 font-mono text-sm tabular-nums ${
                  status === 'done' ? 'text-success' : 'text-ink-soft'
                }`}
              >
                {String(l.order).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`font-medium ${status === 'now' ? 'text-ink' : 'text-ink-soft'}`}>
                  {l.title}
                </div>
                <div className="mt-0.5 font-mono text-xs text-ink-soft">
                  {l.format} · {l.estimatedMinutes} min
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          );

          return (
            <li
              key={l.slug}
              data-testid={`lesson-row-${l.slug}`}
              className="border-b border-line-soft last:border-b-0"
            >
              {locked ? (
                <div aria-disabled="true" className="cursor-default px-3 opacity-55">{inner}</div>
              ) : (
                <Link
                  href={`/lessons/${l.slug}`}
                  className="-mx-3 block rounded-lg px-3 transition-colors hover:bg-black/[0.03]"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-xs text-success">
        <Check className="h-3 w-3" /> Done
      </span>
    );
  }
  if (status === 'now') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 font-mono text-xs font-semibold text-paper">
        Now <ArrowRight className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line-soft px-2 py-0.5 font-mono text-xs text-ink-soft">
      <Lock className="h-3 w-3" /> Locked
    </span>
  );
}
