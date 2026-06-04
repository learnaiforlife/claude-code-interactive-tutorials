import { notFound } from 'next/navigation';
import { getCommandGroup, getAllCommandGroups } from '@/lib/commands';
import CommandPane from '@/components/command/CommandPane';
import TerminalSession from '@/components/lesson/TerminalSession';

export function generateStaticParams() {
  return getAllCommandGroups().map((group) => ({ slug: group.slug }));
}

export default async function CommandGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getCommandGroup(slug);
  if (!group) notFound();

  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-[calc(100vh-2.6rem)] min-w-0 grid-cols-1 md:grid-cols-[56fr_44fr]">
      <CommandPane group={group} />
      <TerminalSession script={group.session} challenge={group.challenge} />
    </main>
  );
}
