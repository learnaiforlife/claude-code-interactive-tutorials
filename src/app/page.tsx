import LessonList from '@/components/dashboard/LessonList';
import ForestDashboard from '@/components/impact/ForestDashboard';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-2.6rem)] bg-paper text-ink">
      <ForestDashboard />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mt-12">
          <LessonList />
        </div>
      </div>
    </main>
  );
}
