import Link from 'next/link';
import { COMMAND_GROUPS, COMMAND_REFERENCE, commandCount } from '@/lib/commands';

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
              {commandCount()} commands across five groups: setup, context, parallel work, review, and recovery.
              Open a group to watch the session run, then type the command yourself.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/commands"
              className="inline-flex items-center justify-center rounded-lg bg-success-bright px-3 py-2 font-mono text-xs font-semibold text-terminal transition-colors hover:bg-success-bright/90"
            >
              Open the Commands lab
            </Link>
            <Link
              href={COMMAND_REFERENCE.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-line px-3 py-2 font-mono text-xs font-semibold text-fg transition-colors hover:border-info-bright hover:text-info-bright"
            >
              Official command reference
            </Link>
          </div>
        </div>

        <p className="mt-5 max-w-[78ch] border-l border-line pl-4 font-mono text-xs leading-relaxed text-fg-mute">
          {COMMAND_REFERENCE.note}
        </p>

        <div className="mt-7 grid gap-3 lg:grid-cols-5">
          {COMMAND_GROUPS.map((group) => (
            <Link
              key={group.slug}
              href={`/commands/${group.slug}`}
              className="flex flex-col rounded-lg border border-line bg-panel p-4 transition-colors hover:border-fg-mute/40"
            >
              <p className="font-mono text-[0.72rem] font-semibold text-command-bright">{group.when}</p>
              <h3 className="mt-2 text-base font-semibold leading-snug text-fg">{group.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-mute">{group.concept}</p>
              <ul className="mt-4 space-y-2" aria-label={`${group.title} commands`}>
                {group.commands.map((item) => (
                  <li key={item.command} className="grid gap-1">
                    <code className="w-fit rounded-md bg-canvas px-1.5 py-0.5 font-mono text-xs text-command-bright">
                      {item.command}
                    </code>
                    <span className="text-xs leading-relaxed text-fg-mute">{item.purpose}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-success-bright">
                Efficient habit: {group.efficiencyHabit}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
