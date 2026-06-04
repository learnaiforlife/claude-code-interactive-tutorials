import Link from 'next/link';
import { COMMAND_REFERENCE, COMMAND_SESSIONS } from '@/lib/command-learning';

export default function CommandLearningPanel() {
  return (
    <section aria-labelledby="commands-lab-heading" className="border-y border-line bg-terminal px-6 py-10 text-fg">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-command-bright">Commands Lab</p>
            <h2 id="commands-lab-heading" className="mt-2 text-2xl font-bold tracking-tight text-fg">
              Learn the slash commands as commands first
            </h2>
            <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-fg-mute">
              Token efficiency still matters, but command fluency starts with knowing what each command controls:
              setup, context, parallel work, review, recovery, and session movement.
            </p>
          </div>
          <Link
            href={COMMAND_REFERENCE.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-line px-3 py-2 font-mono text-xs font-semibold text-fg transition-colors hover:border-info-bright hover:text-info-bright"
          >
            Official command reference
          </Link>
        </div>

        <p className="mt-5 max-w-[78ch] border-l border-line pl-4 font-mono text-xs leading-relaxed text-fg-mute">
          {COMMAND_REFERENCE.note}
        </p>

        <div className="mt-7 grid gap-3 lg:grid-cols-5">
          {COMMAND_SESSIONS.map((session) => (
            <article key={session.id} className="rounded-lg border border-line bg-panel p-4">
              <p className="font-mono text-[0.72rem] font-semibold text-command-bright">{session.when}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug text-fg">{session.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-mute">{session.lesson}</p>
              <ul className="mt-4 space-y-2" aria-label={`${session.title} commands`}>
                {session.commands.map((item) => (
                  <li key={item.command} className="grid gap-1">
                    <code className="w-fit rounded-md bg-canvas px-1.5 py-0.5 font-mono text-xs text-command-bright">
                      {item.command}
                    </code>
                    <span className="text-xs leading-relaxed text-fg-mute">{item.purpose}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-success-bright">
                Efficient habit: {session.efficientHabit}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
