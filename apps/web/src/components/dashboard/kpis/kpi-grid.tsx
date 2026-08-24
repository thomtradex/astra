import { KpiCard } from './kpi-card';

import { Grid } from '@/components/ui/grid/grid';

type DashboardOverview = {
  customers: number;
  sites: number;
  assets: number;
  workOrders: {
    open: number;
    highPriority: number;
  };
};

type KpiGridProps = {
  overview: DashboardOverview;
};

export function KpiGrid({ overview }: KpiGridProps) {
  const kpis = [
    {
      title: 'Clientes',
      value: String(overview.customers),
      trend: 'Atual',
    },
    {
      title: 'Sites',
      value: String(overview.sites),
      trend: 'Atual',
    },
    {
      title: 'Ativos',
      value: String(overview.assets),
      trend: 'Monitorizados',
    },
    {
      title: 'Ordens abertas',
      value: String(overview.workOrders.open),
      trend: `${overview.workOrders.highPriority} alta prioridade`,
    },
  ];

  return (
    <Grid>
      {kpis.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </Grid>
  );
}
