'use client';
import Link from 'next/link';
import { getLessonsByTrack, TRACKS } from '@/lib/lessons';
import { lessonStatusIn, trackCompletionIn, type LessonStatus } from '@/lib/progress';
import { useProgress } from '@/lib/use-progress';
import { Check, Lock, ArrowRight } from '@/components/ui/icons';
import type { Lesson, Progress, TrackInfo } from '@/lib/types';

const tracks = TRACKS.map((track) => ({ ...track, lessons: getLessonsByTrack(track.id) }))
  .filter((track) => track.lessons.length > 0);

export default function LessonList() {
  const progress = useProgress();

  return (
    <div className="space-y-12">
      {tracks.map((track) => (
        <TrackSection key={track.id} track={track} progress={progress} />
      ))}
    </div>
  );
}

function TrackSection({
  track,
  progress,
}: {
  track: TrackInfo & { lessons: Lesson[] };
  progress: Progress;
}) {
  const { done, total } = trackCompletionIn(progress, track.id);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <section aria-labelledby={`${track.id}-heading`}>
      <div className="mb-5">
        <h2 id={`${track.id}-heading`} className="text-xl font-bold tracking-tight text-ink">
          {track.title}
        </h2>
        <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{track.description}</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-ink-soft">{done} / {total} complete</span>
      </div>

      <ol className="list-none">
        {track.lessons.map((lesson) => {
          const status = lessonStatusIn(progress, lesson.slug);
          const locked = status === 'locked';
          const inner = (
            <div className="flex items-center gap-4 py-4">
              <span
                className={`w-7 shrink-0 font-mono text-sm tabular-nums ${
                  status === 'done' ? 'text-success' : 'text-ink-soft'
                }`}
              >
                {String(lesson.order).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className={`font-medium ${status === 'now' ? 'text-ink' : 'text-ink-soft'}`}>
                  {lesson.title}
                </div>
                <div className="mt-0.5 font-mono text-xs text-ink-soft">
                  {lesson.featureFamily} · {lesson.format} · {lesson.estimatedMinutes} min
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{lesson.efficiencyHabit}</p>
              </div>
              <StatusBadge status={status} />
            </div>
          );

          return (
            <li
              key={lesson.slug}
              data-testid={`lesson-row-${lesson.slug}`}
              className="border-b border-line-soft last:border-b-0"
            >
              {locked ? (
                <div aria-disabled="true" className="cursor-default px-3 opacity-55">{inner}</div>
              ) : (
                <Link
                  href={`/lessons/${lesson.slug}`}
                  className="-mx-3 block rounded-lg px-3 transition-colors hover:bg-black/[0.03]"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
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
