const alerts = [
  "Equipment maintenance required",
  "Budget deviation detected",
  "Safety inspection pending",
];

export function AlertsCenter() {
  return (
    <section>
      <h2>
        Astra Alerts Center
      </h2>

      <ul>
        {alerts.map((alert) => (
          <li key={alert}>
            {alert}
          </li>
        ))}
      </ul>
    </section>
  );
}
