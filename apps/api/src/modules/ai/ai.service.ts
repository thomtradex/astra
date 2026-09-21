import { Injectable } from '@nestjs/common';

import type {
  AIAnalysis,
  AIAnalysisInput,
} from './ai.types';
import type { AIProvider } from './providers/ai.provider';

@Injectable()
export class AiService implements AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysis> {
    const recommendation = input.recommendations.find(
      (item) => item.executable,
    );

    const summary = recommendation
      ? `${input.title}. A recomendação operacional atual é: ${recommendation.title}.`
      : `${input.title}. A situação requer acompanhamento operacional.`;

    const rationale = [
      input.explanation,
      input.impact,
      `Existem ${input.evidence.length} evidência(s) estruturada(s) associada(s) ao sinal.`,
    ].join(' ');

    return Promise.resolve({
      status: 'GENERATED',
      summary,
      rationale,
      ...(recommendation
        ? { recommendedRecommendationId: recommendation.id }
        : {}),
      confidence: input.decisionContext.confidence,
      provider: 'deterministic',
    });
  }
}
