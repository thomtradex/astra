import type { IntelligenceSeverity } from '@/lib/intelligence-client';

export const severityConfig: Record<
  IntelligenceSeverity,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  CRITICAL: {
    label: 'Crítico',
    className: 'border-red-200 bg-red-50 text-red-950',
    dotClassName: 'bg-red-500',
  },
  HIGH: {
    label: 'Alta',
    className: 'border-orange-200 bg-orange-50 text-orange-950',
    dotClassName: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Média',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
    dotClassName: 'bg-amber-500',
  },
  LOW: {
    label: 'Baixa',
    className: 'border-slate-200 bg-slate-50 text-slate-900',
    dotClassName: 'bg-slate-400',
  },
};
