type AiPanelProps = {
  assets: number;
  risks: number;
};

export function AiPanel({ assets, risks }: AiPanelProps) {
  return (
    <section>
      <h2>Astra Intelligence AI</h2>

      <p>
        Sistema analisou {assets} ativos e identificou {risks} potenciais riscos operacionais.
      </p>
    </section>
  );
}
