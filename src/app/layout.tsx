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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fira.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('cct.theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[var(--z-tooltip)] focus:rounded-md focus:bg-info-bright focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:font-semibold focus:text-terminal"
        >
          Skip to content
        </a>
        <Chrome />
        {children}
      </body>
    </html>
  );
}
