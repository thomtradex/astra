type Asset = {
  id: string;
  name: string;
  code: string;
  status: string;
  site_id?: string | null;

  work_orders: Array<{
    id: string;
    status: string;
    priority?: string | null;
  }>;

  maintenance_plans: Array<{
    id: string;
    status: string;
    nextDue: string;
  }>;
};

export function AssetOverview({
  assets: apiAssets = [],
}: {
  assets: Asset[];
}) {
  const assets = apiAssets.map((asset) => ({
    name: asset.name,
    code: asset.code,
    status: asset.status,

    availability:
      asset.work_orders.length > 0
        ? `${asset.work_orders.length} open orders`
        : 'Available',

    health:
      asset.maintenance_plans.some(
        (plan) =>
          new Date(plan.nextDue) < new Date(),
      )
        ? 'Attention'
        : asset.work_orders.some(
            (order) =>
              order.status !== 'COMPLETED' &&
              order.status !== 'CLOSED',
          )
          ? 'Attention'
          : asset.status === 'ACTIVE'
            ? 'Healthy'
            : 'Attention',

    risk:
      asset.maintenance_plans.some(
        (plan) =>
          new Date(plan.nextDue) < new Date(),
      )
        ? 'High'
        : asset.work_orders.some(
            (order) =>
              order.priority === 'HIGH' ||
              order.priority === 'CRITICAL',
          )
          ? 'High'
          : asset.work_orders.length > 0
            ? 'Medium'
            : 'Low',

    location: asset.site_id ?? 'No site assigned',

    work_orders: asset.work_orders,
    maintenance_plans: asset.maintenance_plans,

    action:
      asset.work_orders.length > 0
        ? 'Review open operational work orders'
        : asset.maintenance_plans.length > 0
          ? 'Maintenance schedule monitored'
          : 'No intervention required',
  }));

  const stats = [
    [
      'Total Assets',
      String(assets.length),
    ],
    [
      'High Risk',
      String(
        assets.filter((asset) => asset.risk === 'High').length,
      ),
    ],
    [
      'Needs Attention',
      String(
        assets.filter((asset) => asset.health === 'Attention').length,
      ),
    ],
    [
      'Maintenance Signals',
      String(
        assets.filter(
          (asset) =>
            asset.maintenance_plans.length > 0 ||
            asset.work_orders.length > 0,
        ).length,
      ),
    ],
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Asset Portfolio Health
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Operational condition and intervention signals across registered assets.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {assets.map((asset) => (
            <article key={asset.name} className="px-6 py-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {asset.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Code: {asset.code}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-xs uppercase text-slate-400">Health</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {asset.health}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">Risk</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {asset.risk}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">Status</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {asset.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">
                  Recommended action:
                </span>{' '}
                {asset.action}
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Site: {asset.location}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
