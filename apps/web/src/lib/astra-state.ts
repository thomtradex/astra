import type { IntelligenceBriefing, IntelligenceSignal } from './intelligence-client';

export type AstraOperationalState = 'STARTING' | 'CRITICAL' | 'ATTENTION' | 'MONITOR' | 'STABLE';

export interface AstraState {
  state: AstraOperationalState;
  label: string;
  summary: string;
  reason: string;
  signalCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  topSignals: IntelligenceSignal[];
}

interface AstraStateInput {
  briefing?: IntelligenceBriefing;
  sites: number;
  customers: number;
  assets: number;
  openWorkOrders: number;
  highPriorityWorkOrders: number;
  criticalOpenWorkOrders: number;
}

export function deriveAstraState(input: AstraStateInput): AstraState {
  const signals = input.briefing?.signals ?? [];
  const criticalCount = signals.filter((signal) => signal.severity === 'CRITICAL').length;
  const totalCritical = criticalCount + input.criticalOpenWorkOrders;
  const highCount = signals.filter((signal) => signal.severity === 'HIGH').length;
  const mediumCount = signals.filter((signal) => signal.severity === 'MEDIUM').length;

  const hasOperationalData =
    input.sites > 0 || input.customers > 0 || input.assets > 0 || input.openWorkOrders > 0;

  const topSignals = signals.slice(0, 3);

  if (!hasOperationalData) {
    return {
      state: 'STARTING',
      label: 'A preparar',
      summary: 'A Astra ainda não tem contexto operacional suficiente.',
      reason:
        'É necessário existir atividade operacional real para determinar o estado da operação.',
      signalCount: signals.length,
      criticalCount,
      highCount,
      mediumCount,
      topSignals,
    };
  }

  if (totalCritical > 0) {
    return {
      state: 'CRITICAL',
      label: 'Risco crítico',
      summary:
        input.criticalOpenWorkOrders > 0
          ? `Existem ${input.criticalOpenWorkOrders} ordens de trabalho críticas em aberto que exigem decisão.`
          : `${criticalCount} situação(ões) crítica(s) exigem decisão.`,
      reason:
        input.criticalOpenWorkOrders > 0
          ? 'Existem ordens de trabalho críticas em aberto que podem comprometer diretamente a continuidade ou o controlo da operação.'
          : 'Existem sinais críticos que podem comprometer diretamente a continuidade ou o controlo da operação.',
      signalCount: signals.length,
      criticalCount,
      highCount,
      mediumCount,
      topSignals,
    };
  }

  if (highCount > 0 || input.highPriorityWorkOrders > 0) {
    return {
      state: 'ATTENTION',
      label: 'Requer atenção',
      summary:
        input.highPriorityWorkOrders > 0
          ? `Existem ${input.highPriorityWorkOrders} ordens de trabalho prioritárias em aberto que exigem acompanhamento.`
          : `${highCount} situação(ões) de alta prioridade exigem acompanhamento.`,
      reason:
        input.highPriorityWorkOrders > 0
          ? 'A Astra detetou trabalho prioritário em aberto que requer atenção operacional.'
          : 'Existem sinais de alta prioridade que devem ser revistos antes de se tornarem problemas operacionais maiores.',
      signalCount: signals.length,
      criticalCount,
      highCount,
      mediumCount,
      topSignals,
    };
  }

  if (mediumCount > 0) {
    return {
      state: 'MONITOR',
      label: 'Sob monitorização',
      summary: `${mediumCount} situação(ões) merecem acompanhamento.`,
      reason:
        'A operação não apresenta sinais críticos ou de alta prioridade, mas existem situações que justificam acompanhamento.',
      signalCount: signals.length,
      criticalCount,
      highCount,
      mediumCount,
      topSignals,
    };
  }

  return {
    state: 'STABLE',
    label: 'Estável',
    summary: 'Não foram identificados sinais prioritários.',
    reason:
      'Os dados operacionais disponíveis não apresentam atualmente situações que exijam intervenção prioritária.',
    signalCount: signals.length,
    criticalCount,
    highCount,
    mediumCount,
    topSignals,
  };
}
