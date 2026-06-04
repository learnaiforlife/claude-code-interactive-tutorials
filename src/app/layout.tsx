import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import Chrome from '@/components/chrome/Chrome';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fira = Fira_Code({ subsets: ['latin'], variable: '--font-fira', display: 'swap' });

export const metadata: Metadata = {
  title: 'Claude Code Tutorials',
  description: 'Learn Claude Code the efficient, responsible way. AI is not for everything.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fira.variable}`}>
      <body className="min-h-screen">
        <Chrome />
        {children}
      </body>
    </html>
  );
}
