import { KpiCard } from "./kpi-card";

import { Grid } from "@/components/ui/grid/grid";

const kpis = [
  {
    title: "Projetos ativos",
    value: "24",
    trend: "+12%",
  },
  {
    title: "Eficiência operacional",
    value: "91%",
    trend: "+4%",
  },
  {
    title: "Riscos detectados",
    value: "7",
    trend: "-18%",
  },
  {
    title: "Equipamentos ativos",
    value: "342",
    trend: "98%",
  },
];

export function KpiGrid() {
  return (
    <Grid>
      {kpis.map((item) => (
        <KpiCard
          key={item.title}
          {...item}
        />
      ))}
    </Grid>
  );
}
