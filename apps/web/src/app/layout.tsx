import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Astra | Operational Intelligence Platform',
  description: 'Astra transforma operações de construção com inteligência operacional, gestão de ativos e manutenção preditiva.',
  robots: 'index, follow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} font-sans min-h-screen`}>{children}</body>
    </html>
  );
}
