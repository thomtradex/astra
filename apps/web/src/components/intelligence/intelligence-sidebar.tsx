"use client";

import Link from "next/link";

const pages = [
  "dashboard",
  "analytics",
  "reasoning",
  "memory",
  "decision-engine",
  "orchestrator",
  "runtime",
];

export function IntelligenceSidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="font-bold mb-4">Intelligence</h2>

      <nav className="space-y-2">
        {pages.map((page) => (
          <Link
            key={page}
            href={`/intelligence/${page}`}
            className="block rounded px-2 py-1 hover:bg-muted"
          >
            {page}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
