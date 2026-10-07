import Link from 'next/link';

export function LockedIntelligence() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="max-w-2xl">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Astra
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          O Resumo da operação está disponível no Professional.
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          O Astra analisa os dados operacionais disponíveis e transforma situações que requerem
          atenção em situações claras, com evidência e próxima ação recomendada.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/plans?plan=PROFESSIONAL"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Conhecer Professional →
          </Link>

          <Link
            href="/billing"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver subscrição
          </Link>
        </div>
      </div>
    </div>
  );
}
