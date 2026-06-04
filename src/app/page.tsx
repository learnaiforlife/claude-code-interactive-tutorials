import LessonList from '@/components/dashboard/LessonList';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-2.6rem)] bg-paper px-6 py-14 text-ink">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance text-3xl font-bold tracking-tight">Beginner Track</h1>
        <p className="mt-3 max-w-[58ch] leading-relaxed text-ink-soft">
          Learn Claude Code the efficient way. Every lesson banks one habit that saves tokens,
          money, and energy. <span className="font-mono text-sm text-success">{'// AI is not for everything.'}</span>
        </p>
        <div className="mt-12">
          <LessonList />
        </div>
      </div>
    </main>
  );
}
