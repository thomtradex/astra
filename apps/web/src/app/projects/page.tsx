import Link from 'next/link';
import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProjectsClient } from '@/components/projects/projects-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';
import { getProjects } from '@/lib/projects';

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const projects = await getProjects(accessToken);

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-6">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Operação / Obras
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Obras
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Centralize a execução das obras, acompanhe o progresso e tenha
              uma visão operacional de cada projeto.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Nova obra
          </Link>
        </header>

        <ProjectsClient projects={projects} />
      </main>
    </DashboardShell>
  );
}
