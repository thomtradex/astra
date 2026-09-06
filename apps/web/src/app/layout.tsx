import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Astra COO | Operational Decision Intelligence',
  description:
    'Astra COO transforma dados operacionais em sinais, prioridades, decisões e ações para empresas com operações complexas.',
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'construction software',
    'asset management',
    'maintenance intelligence',
    'enterprise operations',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={`${inter.variable} font-sans min-h-screen`}>{children}</body>
    </html>
  );
}
