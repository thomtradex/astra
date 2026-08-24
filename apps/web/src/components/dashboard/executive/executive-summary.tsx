type ExecutiveSummaryProps = {
  portfolioHealth: number;
  operationalEfficiency: number;
  financialRisk: string;
  recommendations: number;
};

export function ExecutiveSummary({
  portfolioHealth,
  operationalEfficiency,
  financialRisk,
  recommendations,
}: ExecutiveSummaryProps) {
  return (
    <section>
      <h2>Executive Intelligence</h2>

      <ul>
        <li>Portfolio Health Score: {portfolioHealth}%</li>
        <li>Operational Efficiency: {operationalEfficiency}%</li>
        <li>Financial Risk: {financialRisk}</li>
        <li>AI Recommendations: {recommendations}</li>
      </ul>
    </section>
  );
}
