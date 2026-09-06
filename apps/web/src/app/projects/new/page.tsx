import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CreateProjectForm } from '@/components/projects/create-project-form';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth';

async function getCollection(path: string, accessToken: string) {
  const response = await fetch(
    `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/v1/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();

  return Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.items ?? [];
}

export default async function NewProjectPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const [customers, sites] = await Promise.all([
    getCollection('customers', accessToken),
    getCollection('sites', accessToken),
  ]);

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Projetos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Nova obra
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Crie uma obra e comece a acompanhar a operação.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <CreateProjectForm
            customers={customers}
            sites={sites}
          />
        </section>
      </main>
    </DashboardShell>
  );
}
