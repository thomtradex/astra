const risks = [
  "Equipment failure probability increased",
  "Maintenance delay detected",
  "Project cost deviation identified",
];

export function RiskPanel() {
  return (
    <section>
      <h2>
        AI Risk Detection
      </h2>

      <ul>
        {risks.map((risk) => (
          <li key={risk}>
            {risk}
          </li>
        ))}
      </ul>
    </section>
  );
}
