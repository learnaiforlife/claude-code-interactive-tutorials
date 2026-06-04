'use client';
import Link from 'next/link';
import type { Lesson } from '@/lib/types';
import { signatureTip, getAdjacent } from '@/lib/lessons';
import { tipBankedIn } from '@/lib/progress';
import { useProgress, bankTipNow } from '@/lib/use-progress';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';
import PlantReward from '@/components/impact/PlantReward';

export default function LessonPane({ lesson }: { lesson: Lesson }) {
  const sig = signatureTip(lesson);
  const { prev, next } = getAdjacent(lesson.slug);
  const progress = useProgress();
  const banked = tipBankedIn(progress, lesson.slug, sig.id);

  return (
    <section className="flex min-h-full flex-col bg-paper px-7 py-9 text-ink md:px-10 md:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Module 1 · Basics</p>

      <div className="mt-4 flex items-start gap-5">
        <span className="font-mono text-[3.25rem] font-extrabold leading-[0.8] tracking-tight text-ink-soft tabular-nums">
          {String(lesson.order).padStart(2, '0')}
        </span>
        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight">{lesson.title}</h1>
      </div>

      <p className="mt-5 max-w-[58ch] text-[0.95rem] leading-relaxed text-ink">{lesson.context}</p>

      <div className="mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">The idea</p>
        <p className="mt-2 max-w-[58ch] leading-relaxed text-ink-soft">{lesson.concept}</p>
      </div>

      <p className="mt-6 flex items-center gap-2 font-mono text-xs text-ink-soft">
        <span className="text-success">▶</span> Watch the session, then bank the tip.
      </p>

      <div className="mt-4 rounded-xl border border-line-soft bg-black/[0.02] p-5">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wide text-success">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> Signature tip
        </div>
        <h2 className="mt-2.5 text-lg font-semibold leading-snug">{sig.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{sig.detail}</p>

        {banked ? (
          <PlantReward tip={sig} />
        ) : (
          <button
            type="button"
            onClick={() => bankTipNow(lesson.slug, sig.id)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-success px-3.5 py-2 font-mono text-sm font-semibold text-paper transition-transform duration-150 ease-out hover:-translate-y-px active:translate-y-0"
          >
            Bank this tip · ~{sig.savedTokens.toLocaleString()} tokens
          </button>
        )}
      </div>

      <nav className="mt-auto flex items-center justify-between pt-10 font-mono text-xs text-ink-soft">
        {prev ? (
          <Link href={`/lessons/${prev.slug}`} className="inline-flex items-center gap-1.5 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> {String(prev.order).padStart(2, '0')}
          </Link>
        ) : (
          <span />
        )}
        <span>Lesson {lesson.order} of 8</span>
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
