type ActivityLog = {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
};

type ActivityFeedProps = {
  activities?: ActivityLog[];
};

function formatAction(action: string) {
  const labels: Record<string, string> = {
    CREATE: 'Criado',
    CREATED: 'Criado',
    UPDATE: 'Atualizado',
    UPDATED: 'Atualizado',
    DELETE: 'Eliminado',
    DELETED: 'Eliminado',
    LOGIN: 'Sessão iniciada',
    LOGOUT: 'Sessão terminada',
  };

  return labels[action.toUpperCase()] ?? action;
}

function formatResource(resource: string) {
  const labels: Record<string, string> = {
    customer: 'Cliente',
    customers: 'Cliente',
    site: 'Site',
    sites: 'Site',
    asset: 'Ativo',
    assets: 'Ativo',
    workOrder: 'Ordem de trabalho',
    work_order: 'Ordem de trabalho',
    workOrders: 'Ordem de trabalho',
    maintenance: 'Manutenção',
    document: 'Documento',
    documents: 'Documento',
    organization: 'Empresa',
    user: 'Utilizador',
    users: 'Utilizador',
  };

  return labels[resource] ?? resource;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Registo operacional
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Atividade recente
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Acompanhe as alterações recentes na sua operação.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
          Dados reais
        </span>
      </div>

      {activities.length > 0 ? (
        <div className="mt-6 divide-y divide-slate-100">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500 ring-1 ring-slate-100">
                {activity.action.toUpperCase().includes('DELETE') ? '−' : '•'}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {formatAction(activity.action)}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {formatResource(activity.resource)}
                </div>
              </div>

              <time className="shrink-0 text-[11px] text-slate-400">
                {formatDate(activity.createdAt)}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
            ◷
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            Ainda não existe atividade registada
          </h3>

          <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">
            As ações realizadas na Astra aparecerão aqui automaticamente à medida
            que a sua equipa começar a trabalhar.
          </p>
        </div>
      )}
    </section>
  );
}
