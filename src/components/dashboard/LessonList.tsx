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
  const familyTargets = getFamilyTargets(track.id, track.lessons);

  return (
    <section aria-labelledby={`${track.id}-heading`}>
      <div className="mb-5">
        <h2 id={`${track.id}-heading`} className="text-xl font-bold tracking-tight text-ink">
          {track.title}
        </h2>
        <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-soft">{track.description}</p>
      </div>

      <FeatureFamilyMap track={track} />

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
          const familyTarget = familyTargets.get(lesson.featureFamily);
          const familyTargetId = familyTarget?.firstSlug === lesson.slug ? familyTarget.id : undefined;
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
              id={familyTargetId}
              data-testid={`lesson-row-${lesson.slug}`}
              className="scroll-mt-24 border-b border-line-soft last:border-b-0"
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

function FeatureFamilyMap({ track }: { track: TrackInfo & { lessons: Lesson[] } }) {
  const families = summarizeFamilies(track.id, track.lessons);

  return (
    <div
      aria-label={`${track.title} feature map`}
      className="mb-6 border-y border-line-soft py-4"
    >
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Feature map</div>
        <div className="font-mono text-xs text-ink-soft">{track.lessons.length} modules · {track.lessons.length * 3} token habits</div>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {families.map((family) => (
          <li
            key={family.name}
            aria-label={`${family.name}: ${family.moduleCount} ${family.moduleCount === 1 ? 'module' : 'modules'}, ${family.tokenHabits} token habits`}
            className="rounded-lg bg-black/[0.018]"
          >
            <a
              href={`#${family.targetId}`}
              aria-label={`Jump to ${family.name} modules`}
              className="group flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-info/5"
            >
              <span className="min-w-0 truncate text-sm font-medium text-ink transition-colors group-hover:text-info">{family.name}</span>
              <span className="shrink-0 font-mono text-xs text-ink-soft">
                {family.moduleCount} {family.moduleCount === 1 ? 'module' : 'modules'} · {family.tokenHabits} token habits
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function summarizeFamilies(
  trackId: TrackInfo['id'],
  lessons: Lesson[],
): Array<{ name: string; moduleCount: number; tokenHabits: number; targetId: string }> {
  const summaries = new Map<string, { name: string; moduleCount: number; tokenHabits: number; firstOrder: number; targetId: string }>();

  for (const lesson of lessons) {
    const existing = summaries.get(lesson.featureFamily);
    if (existing) {
      existing.moduleCount += 1;
      existing.tokenHabits += lesson.tips.length;
      continue;
    }
    summaries.set(lesson.featureFamily, {
      name: lesson.featureFamily,
      moduleCount: 1,
      tokenHabits: lesson.tips.length,
      firstOrder: lesson.order,
      targetId: familyTargetId(trackId, lesson.featureFamily),
    });
  }

  return [...summaries.values()]
    .sort((a, b) => a.firstOrder - b.firstOrder)
    .map(({ name, moduleCount, tokenHabits, targetId }) => ({ name, moduleCount, tokenHabits, targetId }));
}

function getFamilyTargets(trackId: TrackInfo['id'], lessons: Lesson[]): Map<string, { id: string; firstSlug: string }> {
  const targets = new Map<string, { id: string; firstSlug: string }>();
  for (const lesson of lessons) {
    if (targets.has(lesson.featureFamily)) continue;
    targets.set(lesson.featureFamily, {
      id: familyTargetId(trackId, lesson.featureFamily),
      firstSlug: lesson.slug,
    });
  }
  return targets;
}

function familyTargetId(trackId: TrackInfo['id'], family: string): string {
  return `${trackId}-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
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
