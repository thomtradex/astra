const data = [
  {
    month: 'Janeiro',
    value: '62%',
  },
  {
    month: 'Fevereiro',
    value: '71%',
  },
  {
    month: 'Março',
    value: '84%',
  },
  {
    month: 'Abril',
    value: '91%',
  },
];

export function PerformanceChart() {
  return (
    <section>
      <h2>Performance operacional</h2>

      <ul>
        {data.map((item) => (
          <li key={item.month}>
            {item.month}: {item.value}
          </li>
        ))}
      </ul>
    </section>
  );
}
