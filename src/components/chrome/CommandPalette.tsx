'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { getAllLessons } from '@/lib/lessons';
import { lessonStatusIn, type LessonStatus } from '@/lib/progress';
import { useProgress } from '@/lib/use-progress';
import { Check, Lock, ArrowRight } from '@/components/ui/icons';

const lessons = getAllLessons();
const SEARCH_FIELDS = [
  { key: 'title', weight: 120 },
  { key: 'slug', weight: 70 },
  { key: 'featureFamily', weight: 64 },
  { key: 'efficiencyHabit', weight: 56 },
  { key: 'docs', weight: 36 },
  { key: 'tips', weight: 30 },
  { key: 'concept', weight: 18 },
  { key: 'format', weight: 12 },
] as const;

export default function CommandPalette() {
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelected(0);
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        closePalette();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closePalette]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return lessons;
    return lessons
      .map((lesson, index) => ({ lesson, index, score: scoreLesson(lesson, needle) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((result) => result.lesson);
  }, [query]);

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter') {
      const lesson = results[selected];
      if (!lesson || lessonStatusIn(progress, lesson.slug) === 'locked') return;
      window.location.assign(`/lessons/${lesson.slug}`);
    }
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-fg-mute transition-colors hover:border-fg-mute hover:text-fg"
        aria-label="⌘K, open command palette"
      >
        ⌘K
      </button>

      <dialog
        ref={dialogRef}
        open={open}
        aria-label="Command palette"
        aria-modal="true"
        onKeyDown={onDialogKeyDown}
        className="fixed left-1/2 top-16 z-50 m-0 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-line bg-panel p-0 text-fg shadow-[0_18px_48px_oklch(0_0_0_/_0.32)] backdrop:bg-canvas/70"
      >
        <div className="border-b border-line px-3 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-terminal px-3 py-2">
            <span className="text-success-bright">›</span>
            <input
              aria-label="Search lessons, features, and token habits"
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search lessons, features, and token habits"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-fg-mute"
            />
            <button
              type="button"
              onClick={closePalette}
              className="rounded px-2 py-1 font-mono text-xs text-fg-mute hover:bg-white/5 hover:text-fg"
            >
              Esc
            </button>
          </div>
        </div>

        <div className="max-h-[min(32rem,calc(100vh-10rem))] overflow-y-auto p-2">
          {results.length ? (
            <ol className="space-y-1">
              {results.map((lesson, index) => {
                const status = lessonStatusIn(progress, lesson.slug);
                const active = index === selected;
                return (
                  <li key={lesson.slug}>
                    <PaletteRow
                      href={`/lessons/${lesson.slug}`}
                      order={lesson.order}
                      title={lesson.title}
                      meta={`${lesson.featureFamily} · ${lesson.format} · ${lesson.estimatedMinutes} min`}
                      detail={lesson.efficiencyHabit}
                      status={status}
                      active={active}
                      onNavigate={closePalette}
                    />
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="px-3 py-8 text-center font-mono text-sm text-fg-mute">No lessons found</div>
          )}
        </div>
      </dialog>
    </>
  );
}

function scoreLesson(lesson: (typeof lessons)[number], needle: string): number {
  const tokens = tokenize(needle);
  if (!tokens.length) return 0;

  const fields = {
    title: lesson.title,
    slug: lesson.slug,
    featureFamily: lesson.featureFamily,
    efficiencyHabit: lesson.efficiencyHabit,
    docs: lesson.docsRefs.flatMap((ref) => [ref.title, ref.href]).join(' '),
    tips: lesson.tips.flatMap((tip) => [tip.title, tip.detail]).join(' '),
    concept: lesson.concept,
    format: lesson.format,
  };

  const haystack = Object.values(fields).join(' ').toLowerCase();
  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 0;
  for (const { key, weight } of SEARCH_FIELDS) {
    const value = fields[key].toLowerCase();
    if (value.includes(needle)) score += weight * 5;
    for (const token of tokens) {
      if (value.includes(token)) score += weight;
    }
    if (value.startsWith(needle)) score += weight * 2;
  }

  return score;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function PaletteRow({
  href,
  order,
  title,
  meta,
  detail,
  status,
  active,
  onNavigate,
}: {
  href: string;
  order: number;
  title: string;
  meta: string;
  detail: string;
  status: LessonStatus;
  active: boolean;
  onNavigate: () => void;
}) {
  const className = `flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
    active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.045]'
  }`;
  const inner = (
    <>
      <span className={`w-7 shrink-0 font-mono text-xs tabular-nums ${status === 'done' ? 'text-success-bright' : 'text-fg-mute'}`}>
        {String(order).padStart(2, '0')}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-semibold ${status === 'locked' ? 'text-fg-mute' : 'text-fg'}`}>
          {title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-xs text-fg-mute">{meta}</span>
        <span className="mt-1 block truncate text-xs leading-relaxed text-fg-mute">{detail}</span>
      </span>
      <PaletteStatus status={status} />
    </>
  );

  if (status === 'locked') {
    return (
      <div aria-disabled="true" className={`${className} cursor-default opacity-60`}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} className={className}>
      {inner}
    </Link>
  );
}

function PaletteStatus({ status }: { status: LessonStatus }) {
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-bright/10 px-2 py-0.5 font-mono text-xs text-success-bright">
        <Check className="h-3 w-3" /> Done
      </span>
    );
  }
  if (status === 'now') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-bright px-2 py-0.5 font-mono text-xs font-semibold text-terminal">
        Now <ArrowRight className="h-3 w-3" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-xs text-fg-mute">
      <Lock className="h-3 w-3" /> Locked
    </span>
  );
}
