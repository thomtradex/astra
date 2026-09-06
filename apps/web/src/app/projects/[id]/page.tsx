import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DeleteProjectButton } from '@/components/projects/delete-project-button';
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
  site_id?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  customer?: {
    id: string;
    name: string;
  } | null;
  site?: {
    id: string;
    name: string;
  } | null;
};

type Asset = {
  id: string;
  name: string;
  code?: string;
  status?: string;
  site_id?: string | null;
};

type WorkOrder = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  project_id?: string | null;
};

type Activity = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
};

async function apiGet(path: string, accessToken: string) {
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
    return null;
  }

  return response.json();
}

function unwrap<T>(payload: unknown): T | null {
  if (!payload) {
    return null;
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function formatMoney(cents?: number | null) {
  if (cents == null) {
    return 'Não definido';
  }

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Não definida';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PLANNING: 'Planeamento',
    ACTIVE: 'Em execução',
    ON_HOLD: 'Em pausa',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  };

  return labels[status] ?? status;
}

export default async function ProjectDetailPage({
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

  const projectPayload = await apiGet(`projects/${id}`, accessToken);
  const project = unwrap<Project>(projectPayload);

  if (!project) {
    notFound();
  }

  const [assetsPayload, workOrdersPayload] = await Promise.all([
    apiGet('assets', accessToken),
    apiGet('work-orders', accessToken),
  ]);

  const assets = unwrap<Asset[]>(assetsPayload) ?? [];
  const workOrders = unwrap<WorkOrder[]>(workOrdersPayload) ?? [];

  const relatedAssets = project.site_id
    ? assets
        .filter((asset) => asset.site_id === project.site_id)
        .slice(0, 6)
    : [];

  const relatedWorkOrders = workOrders
    .filter((workOrder) => workOrder.project_id === project.id)
    .slice(0, 6);

  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/projects"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Voltar às obras
            </Link>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                {project.code}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                {statusLabel(project.status)}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {project.name}
            </h1>

            {project.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {project.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/projects/${project.id}/edit`}
              className="rounded-xl border px-5 py-3 text-sm font-semibold"
            >
              Editar obra
            </Link>

            <DeleteProjectButton
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Progresso</p>
            <p className="mt-2 text-3xl font-semibold">
              {project.progress}%
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{
                  width: `${Math.min(100, Math.max(0, project.progress))}%`,
                }}
              />
            </div>
          </article>

          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Orçamento</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(project.budget_cents)}
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Cliente</p>
            <p className="mt-2 text-lg font-semibold">
              {project.customer?.name ?? 'Sem cliente'}
            </p>
          </article>

          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Local</p>
            <p className="mt-2 text-lg font-semibold">
              {project.site?.name ?? 'Sem local'}
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Informação da obra</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dados operacionais principais.
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Código
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {project.code}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Estado
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {statusLabel(project.status)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Início
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(project.start_date)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Conclusão prevista
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(project.end_date)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Criada em
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(project.created_at)}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Última atualização
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(project.updated_at)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Resumo operacional</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Ativos</span>
                <span className="font-semibold">
                  {relatedAssets.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Ordens de trabalho
                </span>
                <span className="font-semibold">
                  {relatedWorkOrders.length}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Ativos</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Equipamentos associados à operação.
                </p>
              </div>
            </div>

            {relatedAssets.length ? (
              <div className="mt-5 divide-y">
                {relatedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {asset.name}
                      </p>
                      {asset.code ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {asset.code}
                        </p>
                      ) : null}
                    </div>

                    <span className="text-xs text-slate-500">
                      {asset.status ?? 'Sem estado'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Ainda não existem ativos associados.
              </div>
            )}
          </article>

          <article className="rounded-2xl border bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">
                Ordens de trabalho
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Trabalho operacional relacionado.
              </p>
            </div>

            {relatedWorkOrders.length ? (
              <div className="mt-5 divide-y">
                {relatedWorkOrders.map((workOrder) => (
                  <div key={workOrder.id} className="py-4">
                    <p className="text-sm font-semibold">
                      {workOrder.title}
                    </p>
                    <div className="mt-2 flex gap-2 text-xs text-slate-500">
                      <span>{workOrder.status ?? 'Sem estado'}</span>
                      <span>·</span>
                      <span>{workOrder.priority ?? 'Sem prioridade'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Ainda não existem ordens de trabalho.
              </div>
            )}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Atividade</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registo operacional da plataforma.
            </p>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            A atividade específica desta obra será ligada ao histórico
            operacional na próxima etapa.
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}
