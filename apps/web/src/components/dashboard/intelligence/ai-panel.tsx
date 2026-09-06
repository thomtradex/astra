type AiPanelProps = {
  assets: number;
  risks: number;
};

export function AiPanel({ assets, risks }: AiPanelProps) {
  return (
    <section>
      <h2>Astra COO</h2>

      <p>
        O Astra COO organiza os dados operacionais disponíveis e destaca
        situações que podem exigir atenção.
      </p>

      <p>
        {assets} ativos em contexto · {risks} sinais identificados
      </p>
    </section>
  );
}
