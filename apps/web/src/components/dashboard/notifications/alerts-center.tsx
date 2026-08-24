type AlertsCenterProps = {
  alerts: string[];
};

export function AlertsCenter({ alerts }: AlertsCenterProps) {
  return (
    <section>
      <h2>Astra Alerts Center</h2>

      <ul>
        {alerts.map((alert) => (
          <li key={alert}>{alert}</li>
        ))}
      </ul>
    </section>
  );
}
