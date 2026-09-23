import type { IntelligenceDecisionContext } from '../../intelligence/intelligence-contract.types';

import {
  LlmAnalysisOutputValidationError,
  validateLlmAnalysisOutput,
} from './llm-analysis-output.validator';

describe('validateLlmAnalysisOutput', () => {
  const decisionContext: IntelligenceDecisionContext = {
    confidence: 1,
    evidence: [],
    recommendations: [
      {
        id: 'recommendation-1',
        title: 'Atribuir um responsável.',
        explanation: 'Existe uma ordem sem responsável.',
        executable: true,
      },
    ],
    operationalContext: {
      entityType: 'WORK_ORDER',
      entityId: 'work-order-1',
    },
  };

  const validOutput = {
    summary: 'Existe uma ordem de alta prioridade sem responsável.',
    rationale: 'A situação requer atenção operacional.',
    recommendedRecommendationId: 'recommendation-1',
    confidence: 0.95,
  };

  it('accepts a valid output', () => {
    expect(() =>
      validateLlmAnalysisOutput(validOutput, decisionContext),
    ).not.toThrow();
  });

  it('accepts null recommendation', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        {
          ...validOutput,
          recommendedRecommendationId: null,
        },
        decisionContext,
      ),
    ).not.toThrow();
  });

  it('rejects invalid confidence', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        {
          ...validOutput,
          confidence: 1.5,
        },
        decisionContext,
      ),
    ).toThrow(LlmAnalysisOutputValidationError);
  });

  it('rejects an unknown recommendation', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        {
          ...validOutput,
          recommendedRecommendationId: 'invented-recommendation',
        },
        decisionContext,
      ),
    ).toThrow('recommendation inexistente');
  });

  it('rejects an empty summary', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        {
          ...validOutput,
          summary: '',
        },
        decisionContext,
      ),
    ).toThrow('summary é obrigatório');
  });

  it('rejects malformed output', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        'not-an-object',
        decisionContext,
      ),
    ).toThrow('não é um objeto válido');
  });
});
