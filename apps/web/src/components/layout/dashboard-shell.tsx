import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Topbar />

          <main className="mx-auto w-full max-w-[1680px] px-4 py-6 md:px-7 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
