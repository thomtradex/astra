type OperationsChartProps = {
  data: Array<{
    month: string;
    value: number;
  }>;
};

export function OperationsChart({ data }: OperationsChartProps) {
  return (
    <section>
      <h2>Operational Performance</h2>

      <ul>
        {data.map((item) => (
          <li key={item.month}>
            {item.month}: {item.value}%
          </li>
        ))}
      </ul>
    </section>
  );
}
