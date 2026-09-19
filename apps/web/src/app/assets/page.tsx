import { AssetOverview } from '@/components/assets/asset-overview';
import { getAssets } from '@/lib/assets-client';

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Operações / Equipamentos
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl">
              Centro de Equipamentos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitorize equipamentos, obrigações de manutenção e situações
              operacionais num único lugar.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Dados operacionais atuais
          </div>
        </div>
      </header>

      <AssetOverview assets={assets} />
    </main>
  );
}
