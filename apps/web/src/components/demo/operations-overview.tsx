import { DemoKpiCard } from './demo-kpi-card';

export function OperationsOverview() {
  return (
    <section>
      <h2>Visão operacional</h2>

      <div>
        <DemoKpiCard title="Obras ativas" value="18" description="Projetos em execução" />

        <DemoKpiCard title="Equipas" value="35" description="Equipas operacionais" />

        <DemoKpiCard title="Colaboradores" value="250" description="Utilizadores ativos" />

        <DemoKpiCard
          title="Tarefas automatizadas"
          value="1.240"
          description="Processos simplificados"
        />
      </div>
    </section>
  );
}
