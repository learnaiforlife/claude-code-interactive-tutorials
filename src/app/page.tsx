import LessonList from '@/components/dashboard/LessonList';
import CommandLearningPanel from '@/components/dashboard/CommandLearningPanel';
import ForestDashboard from '@/components/impact/ForestDashboard';
import { COMMAND_SESSIONS } from '@/lib/command-learning';
import { getAllLessons } from '@/lib/lessons';

export default function Home() {
  const lessons = getAllLessons();
  const tips = lessons.reduce((sum, lesson) => sum + lesson.tips.length, 0);
  const challenges = lessons.filter((lesson) => lesson.challenge).length;
  const commandCount = COMMAND_SESSIONS.reduce((sum, session) => sum + session.commands.length, 0);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-2.6rem)] bg-paper text-ink">
      <section className="bg-canvas px-6 py-12 text-fg">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-success-bright">
              Claude Code Interactive Tutorials
            </p>
            <h1 className="mt-4 max-w-[12ch] text-4xl font-bold leading-[1.05] tracking-tight text-fg md:text-5xl">
              Learn Claude Code by doing it
            </h1>
            <p className="mt-5 max-w-[64ch] text-base leading-relaxed text-fg-mute">
              Start with pure command fluency, then move into feature modules, live terminal sessions,
              checks, and token-efficient habits. The point is not only to save tokens. It is to know what
              Claude Code can do, when to use each command, and when a simpler tool is enough.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#commands-lab-heading"
                className="inline-flex items-center justify-center rounded-lg bg-success-bright px-4 py-2 font-mono text-sm font-semibold text-terminal transition-colors hover:bg-success-bright/90"
              >
                Explore commands
              </a>
              <a
                href="#tracks-heading"
                className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 font-mono text-sm font-semibold text-fg transition-colors hover:border-info-bright hover:text-info-bright"
              >
                View modules
              </a>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-line bg-terminal p-4 font-mono text-sm text-fg">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-command-bright" />
              <span className="h-2.5 w-2.5 rounded-full bg-info-bright" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-bright" />
              <span className="ml-2 text-xs text-fg-mute">learning map</span>
            </div>
            <div className="mt-4 space-y-2 leading-relaxed">
              <p><span className="text-success-bright">›</span> /help</p>
              <p className="pl-4 text-fg-mute">See what commands are available in your session.</p>
              <p><span className="text-success-bright">›</span> /context</p>
              <p className="pl-4 text-fg-mute">Understand what Claude is carrying before optimizing.</p>
              <p><span className="text-success-bright">›</span> /diff</p>
              <p className="pl-4 text-fg-mute">Review the exact change before shipping.</p>
              <p className="pt-2 text-command-bright">▲ Command fluency first, efficiency second.</p>
            </div>
          </div>
        </div>
      </section>

      <CommandLearningPanel />
      <ForestDashboard />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Full curriculum</p>
          <h2 id="tracks-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Feature modules with efficient-use hooks
          </h2>
          <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
            {lessons.length} modules, {commandCount} highlighted commands, {challenges} typed terminal challenges,
            and {tips} bankable habits. Each module teaches the feature, how it works, how to use it, and the
            efficient habit attached to it.
          </p>
        </div>
        <div className="mt-12">
          <LessonList />
        </div>
      </div>
    </main>
  );
}
