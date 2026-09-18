import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CreateProjectForm } from '@/components/projects/create-project-form';
import { getApiBaseUrl } from '@/lib/api-client';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-constants';

type CollectionItem = {
  id: string;
  name: string;
};

async function getCollection(
  path: string,
  accessToken: string,
): Promise<CollectionItem[]> {
  try {
    const response = await fetch(getApiBaseUrl() + '/' + path, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to load ' + path + ':', response.status);
      return [];
    }

    const payload: unknown = await response.json();

    if (Array.isArray(payload)) {
      return payload.filter(
        (item): item is CollectionItem =>
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item),
      );
    }

    if (payload !== null && typeof payload === 'object') {
      const record = payload as {
        data?: unknown;
        items?: unknown;
      };

      const collection = Array.isArray(record.data)
        ? record.data
        : Array.isArray(record.items)
          ? record.items
          : [];

      return collection
        .filter(
          (item): item is CollectionItem =>
            typeof item === 'object' &&
            item !== null &&
            !Array.isArray(item),
        )
        .filter(
          (item): item is CollectionItem & { id: string; name: string } =>
            typeof item.id === 'string' &&
            typeof item.name === 'string',
        );
    }

    return [];
  } catch (error) {
    console.error('Failed to load ' + path + ':', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

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
          <p className="text-sm font-medium text-slate-500">Projetos</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nova obra</h1>
          <p className="mt-2 text-sm text-slate-500">
            Crie uma obra e comece a acompanhar a operação.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <CreateProjectForm customers={customers} sites={sites} />
        </section>
      </main>
    </DashboardShell>
  );
}
