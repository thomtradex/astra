const risks = [
  {
    asset: "Grua Norte",
    risk: "Alta probabilidade de manutenção",
    score: "87%",
  },
  {
    asset: "Escavadora 04",
    risk: "Performance abaixo do normal",
    score: "72%",
  },
];

export function RiskEngine() {
  return (
    <section>
      <h2>
        AI Risk Engine
      </h2>

      {risks.map((risk) => (
        <article key={risk.asset}>
          <strong>
            {risk.asset}
          </strong>

          <p>
            {risk.risk}
          </p>

          <span>
            {risk.score}
          </span>
        </article>
      ))}
    </section>
  );
}
