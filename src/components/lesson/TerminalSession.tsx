'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { SessionLine, TerminalChallenge } from '@/lib/types';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

export default function TerminalSession({ script, challenge }: { script: SessionLine[]; challenge?: TerminalChallenge }) {
  const reduced = usePrefersReducedMotion();
  const [runId, setRunId] = useState(0);

  return (
    <div className="flex h-full min-h-[22rem] min-w-0 flex-col overflow-hidden bg-terminal font-mono text-[0.82rem] leading-relaxed">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-xs uppercase tracking-wider text-fg-mute">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full" style={{ background: '#ff5f56' }} />
          <span className="h-2 w-2 rounded-full" style={{ background: '#ffbd2e' }} />
          <span className="h-2 w-2 rounded-full" style={{ background: '#27c93f' }} />
        </span>
        <span className="ml-1">claude · session</span>
      </div>

      <Player key={`${runId}-${reduced ? 'reduced' : 'motion'}`} script={script} challenge={challenge} reduced={reduced} />

      <div className="flex justify-end border-t border-line px-4 py-2">
        <button
          type="button"
          onClick={() => setRunId((r) => r + 1)}
          className="rounded px-2.5 py-1 text-xs font-semibold text-fg-mute transition-colors hover:bg-white/5 hover:text-fg"
        >
          ↻ Replay
        </button>
      </div>
    </div>
  );
}

function Player({
  script,
  challenge,
  reduced,
}: {
  script: SessionLine[];
  challenge?: TerminalChallenge;
  reduced: boolean;
}) {
  const [shown, setShown] = useState<SessionLine[]>(() => (reduced ? script : []));
  const [typed, setTyped] = useState<string | null>(null);
  const [challengeLines, setChallengeLines] = useState<SessionLine[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));

    let i = 0;
    const step = () => {
      if (cancelled || i >= script.length) return;
      const line = script[i];
      if (line.kind === 'prompt' && line.text) {
        const full = line.text;
        let c = 0;
        const type = () => {
          if (cancelled) return;
          c += 1;
          setTyped(full.slice(0, c));
          if (c < full.length) later(type, 24);
          else
            later(() => {
              setShown((s) => [...s, line]);
              setTyped(null);
              i += 1;
              later(step, 420);
            }, 280);
        };
        type();
      } else {
        const ms =
          line.kind === 'thinking' ? 650 : line.kind === 'tool' ? 480 : line.kind === 'impact' ? 520 : 300;
        later(() => {
          setShown((s) => [...s, line]);
          i += 1;
          step();
        }, ms);
      }
    };
    later(step, 320);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [script, reduced]);

  useEffect(() => {
    if (reduced) return;
    const el = scrollRef.current;
    if (el && typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight });
  }, [shown, typed, reduced]);

  const running = !reduced && (typed !== null || shown.length < script.length);
  const challengeReady = Boolean(challenge) && !running;

  function submitChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;

    const raw = input.trim();
    if (!raw) return;
    const normalized = normalizeCommand(raw);
    setInput('');

    if (normalized === '?') {
      setChallengeLines((lines) => [
        ...lines,
        { kind: 'prompt', text: raw },
        { kind: 'reply', text: `Hint: ${challenge.hint}` },
      ]);
      return;
    }

    if (normalized === 'reset') {
      setChallengeLines([]);
      return;
    }

    const accepted = challenge.accepted.map(normalizeCommand);
    if (accepted.includes(normalized)) {
      setChallengeLines((lines) => [...lines, { kind: 'prompt', text: raw }, ...challenge.success]);
      return;
    }

    setChallengeLines((lines) => [...lines, { kind: 'prompt', text: raw }, { kind: 'warn', text: challenge.incorrect }]);
  }

  return (
    <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
      {shown.map((line, idx) => (
        <Line key={idx} line={line} />
      ))}
      {typed !== null && (
        <div className="flex min-w-0 gap-2">
          <span className="text-success-bright">›</span>
          <span className="min-w-0 break-words text-fg">
            {typed}
            <Cursor />
          </span>
        </div>
      )}
      {running && typed === null && (
        <div>
          <span className="text-success-bright">›</span> <Cursor />
        </div>
      )}
      {challenge && (
        <div className="mt-4 rounded-md border border-line bg-panel/60 p-3">
          <div className="text-fg-mute">{challenge.intro}</div>
          <div className="mt-1 text-fg-mute">
            Type <span className="text-command-bright">?</span> for a hint or{' '}
            <span className="text-command-bright">reset</span> to clear your attempt.
          </div>
          {challengeLines.map((line, idx) => (
            <Line key={`challenge-${idx}`} line={line} />
          ))}
          <form onSubmit={submitChallenge} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="terminal-challenge-input">
              {challenge.prompt}
            </label>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-terminal px-2 py-1.5">
              <span className="text-success-bright">›</span>
              <input
                id="terminal-challenge-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={!challengeReady}
                placeholder={challengeReady ? challenge.prompt : 'Transcript is running'}
                className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-mute"
              />
            </div>
            <button
              type="submit"
              disabled={!challengeReady}
              className="rounded-md bg-success-bright px-3 py-1.5 text-sm font-semibold text-terminal transition-colors hover:bg-success-bright/90 disabled:cursor-not-allowed disabled:bg-line disabled:text-fg-mute"
            >
              Run
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function normalizeCommand(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function Cursor() {
  return (
    <span className="ml-px inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] bg-success-bright align-text-bottom motion-safe:animate-pulse" />
  );
}

function Line({ line }: { line: SessionLine }) {
  switch (line.kind) {
    case 'prompt':
      return (
        <div className="flex min-w-0 gap-2 pt-1">
          <span className="text-success-bright">›</span>
          <span className="min-w-0 break-words text-fg">{line.text}</span>
        </div>
      );
    case 'reply':
      return (
        <div className="flex min-w-0 gap-2 pt-0.5">
          <span className="text-info-bright">⏺</span>
          <span className="min-w-0 break-words text-fg/90">{line.text}</span>
        </div>
      );
    case 'thinking':
      return <div className="min-w-0 break-words pt-0.5 italic text-fg-mute">✶ {line.text ?? 'Thinking'}…</div>;
    case 'tool':
      return (
        <div className="flex min-w-0 gap-2 text-info-bright">
          <span aria-hidden="true">⎿</span>
          <span className="min-w-0 break-words text-fg-mute">{line.text}</span>
        </div>
      );
    case 'out':
      return <div className="min-w-0 break-words pl-4 text-fg-mute">{line.text}</div>;
    case 'good':
      return <div className="min-w-0 break-words text-success-bright">✓ {line.text}</div>;
    case 'warn':
      return <div className="min-w-0 break-words text-command-bright">▲ {line.text}</div>;
    case 'rule':
      return (
        <div className="flex items-center gap-2 py-1.5 text-[0.7rem] uppercase tracking-wider text-fg-mute/70">
          <span className="h-px flex-1 bg-line" />
          {line.text}
          <span className="h-px flex-1 bg-line" />
        </div>
      );
    case 'impact':
      return (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-success-bright/30 bg-success-bright/10 px-3 py-2 text-success-bright">
          <span aria-hidden="true">↓</span>
          <span className="font-semibold">~{(line.savedTokens ?? 0).toLocaleString()} tokens saved</span>
          {line.note && <span className="min-w-0 break-words text-fg-mute">· {line.note}</span>}
        </div>
      );
  }
}
