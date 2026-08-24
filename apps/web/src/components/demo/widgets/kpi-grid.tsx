import { Card } from '@/components/ui/card';

const metrics = [
  {
    title: 'Projetos ativos',
    value: '18',
    description: 'Obras acompanhadas em tempo real',
  },
  {
    title: 'Equipas',
    value: '35',
    description: 'Equipas operacionais',
  },
  {
    title: 'Automação',
    value: '1.240',
    description: 'Processos simplificados',
  },
  {
    title: 'Eficiência',
    value: '91%',
    description: 'Performance operacional',
  },
];

export function KpiGrid() {
  return (
    <section>
      {metrics.map((metric) => (
        <Card key={metric.title} title={metric.title}>
          <strong>{metric.value}</strong>

          <p>{metric.description}</p>
        </Card>
      ))}
    </section>
  );
}
