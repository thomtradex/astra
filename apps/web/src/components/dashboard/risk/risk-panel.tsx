type RiskPanelProps = {
  risks: string[];
};

export function RiskPanel({ risks }: RiskPanelProps) {
  return (
    <section>
      <h2>AI Risk Detection</h2>

      <ul>
        {risks.map((risk) => (
          <li key={risk}>{risk}</li>
        ))}
      </ul>
    </section>
  );
}
