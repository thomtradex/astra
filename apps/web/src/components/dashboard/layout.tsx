import { ReactNode } from 'react';

import { SessionUser } from '@/lib/auth';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: ReactNode;
  user: SessionUser;
}

export function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-astra-50">
      <Sidebar user={user} />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}