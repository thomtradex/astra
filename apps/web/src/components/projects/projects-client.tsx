'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { Project, ProjectStatus } from '@/lib/projects';

import { ProjectCard } from './project-card';

const statuses: Array<{ value: 'ALL' | ProjectStatus; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PLANNING', label: 'Planeamento' },
  { value: 'ACTIVE', label: 'Em curso' },
  { value: 'ON_HOLD', label: 'Em pausa' },
  { value: 'COMPLETED', label: 'Concluídas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | ProjectStatus>('ALL');

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus =
        status === 'ALL' || project.status === status;

      const matchesQuery =
        !normalized ||
        project.name.toLowerCase().includes(normalized) ||
        project.code.toLowerCase().includes(normalized) ||
        project.customer?.name.toLowerCase().includes(normalized);

      return matchesStatus && matchesQuery;
    });
  }, [projects, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm md:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar obras..."
          className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as 'ALL' | ProjectStatus)
          }
          className="rounded-xl border px-4 py-3 text-sm outline-none"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">
            Ainda não existem obras
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Comece pela primeira obra da empresa
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Registe uma obra real e passe a centralizar a operação da empresa
            num único espaço.
          </p>
          <Link
            href="/projects/new"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Criar primeira obra
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium text-slate-900">
            Nenhuma obra corresponde aos filtros.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Experimente alterar a pesquisa ou o estado.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
