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
        type: 'ASSIGN',
        title: 'Atribuir um responsável.',
        explanation: 'Existe uma ordem sem responsável.',
        resource: 'work_orders',
        resourceId: 'work-order-1',
        executable: true,
      },
    ],
    operationalContext: {
      workOrders: {
        open: 1,
        highPriorityOpen: 1,
        unassignedHighPriority: 1,
      },
    },
  };

  const signalSource = {
    resource: 'work_orders',
    resourceId: 'work-order-1',
  };

  const validOutput = {
    summary: 'Existe uma ordem de alta prioridade sem responsável.',
    rationale: 'A situação requer atenção operacional.',
    recommendedRecommendationId: 'recommendation-1',
    confidence: 0.95,
  };

  it('accepts a valid output', () => {
    expect(() =>
      validateLlmAnalysisOutput(validOutput, decisionContext, signalSource),
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
        signalSource,
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
        signalSource,
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
        signalSource,
      ),
    ).toThrow('recommendation inexistente');
  });

  it('rejects a non-executable recommendation', () => {
    const nonExecutableContext: IntelligenceDecisionContext = {
      ...decisionContext,
      recommendations: [
        {
          ...decisionContext.recommendations[0]!,
          executable: false,
        } as Required<(typeof decisionContext.recommendations)[number]>,
      ],
    };

    expect(() =>
      validateLlmAnalysisOutput(validOutput, nonExecutableContext, signalSource),
    ).toThrow('recommendation não executável');
  });

  it('rejects a recommendation for a different resource', () => {
    const incompatibleContext: IntelligenceDecisionContext = {
      ...decisionContext,
      recommendations: [
        {
          ...decisionContext.recommendations[0]!,
          resource: 'maintenance_plans',
          resourceId: 'maintenance-1',
        } as Required<(typeof decisionContext.recommendations)[number]>,
      ],
    };

    expect(() => validateLlmAnalysisOutput(validOutput, incompatibleContext, signalSource)).toThrow(
      'recommendation incompatível',
    );
  });

  it('rejects an empty summary', () => {
    expect(() =>
      validateLlmAnalysisOutput(
        {
          ...validOutput,
          summary: '',
        },
        decisionContext,
        signalSource,
      ),
    ).toThrow('summary é obrigatório');
  });

  it('rejects malformed output', () => {
    expect(() => validateLlmAnalysisOutput('not-an-object', decisionContext, signalSource)).toThrow(
      'não é um objeto válido',
    );
  });
});
