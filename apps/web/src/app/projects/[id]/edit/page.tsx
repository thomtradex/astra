import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { EditProjectForm } from '@/components/projects/edit-project-form';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

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

async function getProject(id: string, accessToken: string) {
  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/projects/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();

  return payload?.data ?? payload;
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
          <p className="text-sm font-medium text-slate-500">
            Projetos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Editar obra
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Atualize os dados operacionais desta obra.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <EditProjectForm project={project} />
        </section>
      </main>
    </DashboardShell>
  );
}
