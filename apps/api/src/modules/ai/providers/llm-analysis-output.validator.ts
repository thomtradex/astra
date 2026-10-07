import type { IntelligenceDecisionContext } from '../../intelligence/intelligence-contract.types';

import type { LlmAnalysisOutput } from './llm-analysis-output';

export class LlmAnalysisOutputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmAnalysisOutputValidationError';
  }
}

export function validateLlmAnalysisOutput(
  output: unknown,
  decisionContext: IntelligenceDecisionContext,
  signalSource: {
    resource: string;
    resourceId?: string;
  },
): asserts output is LlmAnalysisOutput {
  if (!isRecord(output)) {
    throw new LlmAnalysisOutputValidationError(
      'A resposta do LLM não é um objeto válido.',
    );
  }

  if (typeof output.summary !== 'string' || output.summary.trim() === '') {
    throw new LlmAnalysisOutputValidationError(
      'O campo summary é obrigatório.',
    );
  }

  if (
    typeof output.rationale !== 'string' ||
    output.rationale.trim() === ''
  ) {
    throw new LlmAnalysisOutputValidationError(
      'O campo rationale é obrigatório.',
    );
  }

  if (
    output.recommendedRecommendationId !== null &&
    typeof output.recommendedRecommendationId !== 'string'
  ) {
    throw new LlmAnalysisOutputValidationError(
      'recommendedRecommendationId deve ser string ou null.',
    );
  }

  if (
    typeof output.confidence !== 'number' ||
    !Number.isFinite(output.confidence) ||
    output.confidence < 0 ||
    output.confidence > 1
  ) {
    throw new LlmAnalysisOutputValidationError(
      'confidence deve ser um número entre 0 e 1.',
    );
  }

  if (output.recommendedRecommendationId !== null) {
    const recommendation = decisionContext.recommendations.find(
      (item) => item.id === output.recommendedRecommendationId,
    );

    if (!recommendation) {
      throw new LlmAnalysisOutputValidationError(
        'O LLM referenciou uma recommendation inexistente.',
      );
    }

    if (!recommendation.executable) {
      throw new LlmAnalysisOutputValidationError(
        'O LLM selecionou uma recommendation não executável.',
      );
    }

    if (
      recommendation.resource !== signalSource.resource ||
      recommendation.resourceId !== signalSource.resourceId
    ) {
      throw new LlmAnalysisOutputValidationError(
        'O LLM selecionou uma recommendation incompatível com o recurso do sinal.',
      );
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
