import Link from 'next/link';

import { severityConfig } from '@/components/intelligence/severity-config';
import type { IntelligenceChange } from '@/lib/intelligence-client';
function getChangeHref(change: IntelligenceChange): string {
  switch (change.source.resource) {
    case 'projects':
      return `/projects/${change.source.resourceId}`;

    case 'work-orders':
      return '/work-orders';

    case 'maintenance':
    case 'maintenance_plans':
      return '/maintenance';

    default:
      return '/dashboard';
  }
}

export function ChangeCard({ change }: { change: IntelligenceChange }) {
  const severity = severityConfig[change.severity];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severity.dotClassName}`} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${severity.className}`}
              >
                {severity.label}
              </span>

              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Mudança recente
              </span>
            </div>

            <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-950">
              {change.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">{change.explanation}</p>
          </div>
        </div>

        <Link
          href={getChangeHref(change)}
          className="shrink-0 text-sm font-semibold text-slate-700 hover:text-slate-950"
        >
          Rever →
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Evidência
          </p>

          <ul className="mt-1.5 space-y-1">
            {change.evidence.map((item) => (
              <li key={item} className="text-xs leading-5 text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Impacto
          </p>

          <p className="mt-1.5 text-xs leading-5 text-slate-700">{change.impact}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Astra recomenda
          </p>

          <p className="mt-1.5 text-xs font-medium leading-5 text-slate-900">
            {change.recommendedAction}
          </p>
        </div>
      </div>
    </article>
  );
}
