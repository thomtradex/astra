type AssetHealthProps = {
  assets: number;
  availability: number;
};

export function AssetHealth({ assets, availability }: AssetHealthProps) {
  return (
    <section>
      <h2>Asset Health</h2>

      <p>
        {assets} assets monitored.
        {availability}% operational availability.
      </p>
    </section>
  );
}
