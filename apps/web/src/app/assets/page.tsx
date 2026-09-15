import { AssetOverview } from '@/components/assets/asset-overview';
import { getAssets } from '@/lib/assets-client';

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">

      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Operational Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Asset Intelligence
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitorize disponibilidade, condição operacional e riscos dos equipamentos críticos da sua operação.
        </p>
      </header>

      <AssetOverview assets={assets} />

    </main>
  );
}
