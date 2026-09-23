import type { AIAnalysis, AIAnalysisInput } from '../ai.types';

import type { AIProvider } from './ai.provider';

export class DeterministicAiProvider implements AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysis> {
    const recommendation = input.decisionContext.recommendations.find(
      (item) => item.executable,
    );

    const summary = recommendation
      ? this.buildExecutableSummary(input, recommendation.title)
      : this.buildMonitoringSummary(input);

    const rationale = this.buildRationale(input);

    return Promise.resolve({
      status: 'GENERATED',
      summary,
      rationale,
      ...(recommendation
        ? { recommendedRecommendationId: recommendation.id }
        : {}),
      confidence: input.decisionContext.confidence,
      confidenceSource: 'DETERMINISTIC_RULE',
      provider: 'deterministic',
    });
  }

  private buildExecutableSummary(
    input: AIAnalysisInput,
    recommendationTitle: string,
  ): string {
    return this.normalizeText(
      `${input.title}. A ação recomendada é: ${recommendationTitle}. ${input.recommendedAction}`,
    );
  }

  private buildMonitoringSummary(input: AIAnalysisInput): string {
    return this.normalizeText(
      `${input.title}. A situação requer acompanhamento operacional. ${input.recommendedAction}`,
    );
  }

  private buildRationale(input: AIAnalysisInput): string {
    const evidenceCount = input.decisionContext.evidence.length;

    const evidenceSummary =
      evidenceCount === 1
        ? 'Existe 1 evidência estruturada associada ao sinal.'
        : `Existem ${evidenceCount} evidências estruturadas associadas ao sinal.`;

    return this.normalizeText(
      [
        input.explanation,
        input.urgency,
        input.impact,
        evidenceSummary,
      ].join(' '),
    );
  }

  private normalizeText(value: string): string {
    return value
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([—–-])\s*/g, '$1 ')
      .replace(/\s*([—–-])\s*/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
