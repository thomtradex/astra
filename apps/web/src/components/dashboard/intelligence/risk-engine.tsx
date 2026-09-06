type RiskEngineProps = {
  risks: Array<{
    asset: string;
    risk: string;
    score: string;
  }>;
};

export function RiskEngine({ risks }: RiskEngineProps) {
  return (
    <section>
      <h2>Sinais operacionais</h2>

      {risks.map((risk) => (
        <article key={`${risk.asset}-${risk.risk}`}>
          <strong>{risk.asset}</strong>

          <p>{risk.risk}</p>

          <span>{risk.score}</span>
        </article>
      ))}
    </section>
  );
}
