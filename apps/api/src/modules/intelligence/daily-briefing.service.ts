import { Injectable } from '@nestjs/common';

import {
  DailyBriefing,
  DailyBriefingPriority,
  DailyBriefingSummary,
} from './daily-briefing.types';
import { IntelligenceSignal } from './intelligence.types';

const DAILY_PRIORITY_LIMIT = 5;

@Injectable()
export class DailyBriefingService {
  build(signals: IntelligenceSignal[], generatedAt = new Date()): DailyBriefing {
    const summary = this.buildSummary(signals);
    const priorities = signals
      .slice(0, DAILY_PRIORITY_LIMIT)
      .map((signal, index) => this.toPriority(signal, index + 1));

    return {
      date: generatedAt.toISOString().slice(0, 10),
      generatedAt: generatedAt.toISOString(),
      summary,
      priorities,
      nextStep: this.buildNextStep(summary, priorities),
    };
  }

  private buildSummary(signals: IntelligenceSignal[]): DailyBriefingSummary {
    const critical = signals.filter((signal) => signal.severity === 'CRITICAL').length;
    const high = signals.filter((signal) => signal.severity === 'HIGH').length;
    const medium = signals.filter((signal) => signal.severity === 'MEDIUM').length;

    return {
      headline: this.buildHeadline(critical, high, signals.length),
      explanation: this.buildExplanation(critical, high, medium, signals.length),
      critical,
      high,
      medium,
      total: signals.length,
    };
  }

  private buildHeadline(critical: number, high: number, total: number): string {
    if (critical > 0) {
      return `${critical} situação(ões) crítica(s) exigem decisão hoje.`;
    }

    if (high > 0) {
      return `${high} situação(ões) de alta prioridade exigem atenção hoje.`;
    }

    if (total > 0) {
      return `${total} situação(ões) operacional(is) requerem atenção.`;
    }

    return 'A operação não apresenta sinais prioritários neste momento.';
  }

  private buildExplanation(
    critical: number,
    high: number,
    medium: number,
    total: number,
  ): string {
    if (total === 0) {
      return 'Os dados operacionais disponíveis não apresentam situações que cumpram os critérios atuais de atenção.';
    }

    const parts: string[] = [];

    if (critical > 0) {
      parts.push(`${critical} crítica(s)`);
    }

    if (high > 0) {
      parts.push(`${high} de prioridade alta`);
    }

    if (medium > 0) {
      parts.push(`${medium} de prioridade média`);
    }

    return `A Astra identificou ${parts.join(', ')} entre ${total} sinal(is) operacional(is) em aberto.`;
  }

  private toPriority(signal: IntelligenceSignal, rank: number): DailyBriefingPriority {
    return {
      rank,
      severity: signal.severity,
      title: signal.title,
      why: signal.urgency,
      impact: signal.impact,
      recommendedAction: signal.recommendedAction,
      source: signal.source,
      ...(signal.action ? { action: signal.action } : {}),
    };
  }

  private buildNextStep(
    summary: DailyBriefingSummary,
    priorities: DailyBriefingPriority[],
  ): string {
    if (priorities.length === 0) {
      return 'Continuar a operação normalmente e voltar a consultar o briefing à medida que existirem novas alterações.';
    }

    if (summary.critical > 0) {
      return 'Começar pela primeira prioridade crítica e confirmar a ação necessária antes de avançar para as restantes.';
    }

    if (summary.high > 0) {
      return 'Começar pelo primeiro sinal de alta prioridade e confirmar responsável, estado e próxima ação.';
    }

    return 'Rever as prioridades apresentadas e confirmar a próxima ação operacional.';
  }
}
