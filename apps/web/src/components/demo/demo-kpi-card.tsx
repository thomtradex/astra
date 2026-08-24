type DemoKpiCardProps = {
  title: string;
  value: string;
  description: string;
};

export function DemoKpiCard({ title, value, description }: DemoKpiCardProps) {
  return (
    <div>
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  );
}
