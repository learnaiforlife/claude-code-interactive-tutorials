import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-2.6rem)] bg-paper px-6 py-14 text-ink">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
        <section>
          <p className="font-mono text-sm text-success">{'// route not found'}</p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight">This path is outside the lesson plan.</h1>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-soft">
            The fastest recovery is not a repo-wide search. Go back to the track, open the command palette,
            and jump to the lesson you meant to run.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-success px-3.5 py-2 font-mono text-sm font-semibold text-paper transition-transform duration-150 ease-out hover:-translate-y-px active:translate-y-0"
            >
              Back to track
            </Link>
            <span className="inline-flex items-center rounded-lg border border-line-soft px-3.5 py-2 font-mono text-sm text-ink-soft">
              Try ⌘K
            </span>
          </div>
        </section>

        <div className="rounded-xl border border-line bg-terminal p-5 font-mono text-sm text-fg">
          <div className="flex items-center gap-2 border-b border-line pb-3 text-xs text-fg-mute">
            <span className="h-2 w-2 rounded-full bg-success-bright" />
            claude · route check
          </div>
          <div className="mt-4 space-y-2">
            <p><span className="text-success-bright">›</span> resolve lesson slug</p>
            <p className="pl-4 text-command-bright">▲ No matching module found.</p>
            <p className="pl-4 text-fg-mute">Tip: use the dashboard or command palette instead of guessing URLs.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
