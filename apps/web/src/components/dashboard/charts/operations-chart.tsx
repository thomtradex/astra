export function OperationsChart() {
  const data = [
    {
      month: "Jan",
      value: 82,
    },
    {
      month: "Feb",
      value: 88,
    },
    {
      month: "Mar",
      value: 91,
    },
    {
      month: "Apr",
      value: 95,
    },
  ];

  return (
    <section>
      <h2>
        Operational Performance
      </h2>

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
