import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { EditProjectForm } from '@/components/projects/edit-project-form';
import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';

type Project = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  progress: number;
  budget_cents?: number | null;
  start_date?: string | null;
  end_date?: string | null;
};


async function getProject(id: string, accessToken: string): Promise<Project | null> {
  try {
    const response = await fetch(getApiBaseUrl() + '/projects/' + id, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();

    if (payload !== null && typeof payload === 'object' && 'data' in payload) {
      const data = (payload as { data?: unknown }).data;
      return data && typeof data === 'object' ? (data as Project) : null;
    }

    return payload && typeof payload === 'object' ? (payload as Project) : null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    notFound();
  }

  const project = await getProject(id, accessToken);

  if (!project) {
    notFound();
  }

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Projetos</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editar obra</h1>
          <p className="mt-2 text-sm text-slate-500">Atualize os dados operacionais desta obra.</p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <EditProjectForm project={project} />
        </section>
      </main>
    </DashboardShell>
  );
}
