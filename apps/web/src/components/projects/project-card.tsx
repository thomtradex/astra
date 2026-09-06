'use client';

import Link from 'next/link';

import type { Project } from '@/lib/projects';

import { ProjectStatusBadge } from './project-status-badge';

function formatBudget(cents: number | null) {
  if (cents === null) return '—';

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            {project.code}
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold text-slate-950 group-hover:underline">
            {project.name}
          </h3>
        </div>

        <ProjectStatusBadge status={project.status} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Progresso</span>
          <span className="font-semibold text-slate-900">
            {project.progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <p className="text-xs text-slate-400">Cliente</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-800">
            {project.customer?.name ?? 'Sem cliente'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Orçamento</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatBudget(project.budget_cents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
