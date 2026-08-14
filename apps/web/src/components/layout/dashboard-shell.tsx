import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <div>
      <Sidebar />

      <main>
        <Topbar />

        {children}
      </main>
    </div>
  );
}
