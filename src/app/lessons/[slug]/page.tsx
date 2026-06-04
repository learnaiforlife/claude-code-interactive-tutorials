import { notFound } from 'next/navigation';
import { getLesson, getAllLessons } from '@/lib/lessons';
import LessonPane from '@/components/lesson/LessonPane';
import TerminalSession from '@/components/lesson/TerminalSession';

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  return (
    <main className="grid min-h-[calc(100vh-2.6rem)] grid-cols-1 md:grid-cols-[56fr_44fr]">
      <LessonPane lesson={lesson} />
      <TerminalSession script={lesson.session} />
    </main>
  );
}
