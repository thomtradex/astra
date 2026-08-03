"use client";

import { IntelligenceProvider } from "./intelligence-provider";
import { IntelligenceShell } from "./intelligence-shell";

export function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <IntelligenceProvider>
      <IntelligenceShell>{children}</IntelligenceShell>
    </IntelligenceProvider>
  );
}
