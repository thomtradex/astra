"use client";

import { IntelligenceSidebar } from "./intelligence-sidebar";

export function IntelligenceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <IntelligenceSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
