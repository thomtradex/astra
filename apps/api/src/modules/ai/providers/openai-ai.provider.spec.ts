import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import type { AIAnalysisInput } from '../ai.types';

import { OpenAiAiProvider } from './openai-ai.provider';

jest.mock('openai');

type MockCreateRequest = {
  model: string;
  text: {
    format: {
      type: string;
      name: string;
      strict: boolean;
      schema: unknown;
    };
  };
};

type MockCreateResponse = {
  output_text: string;
};

describe('OpenAiAiProvider', () => {
  const input: AIAnalysisInput = {
    signalId: 'signal-1',
    signalType: 'WORK_ORDER',
    severity: 'HIGH',
    title: 'Ordem de trabalho sem responsável',
    explanation: 'Existe uma ordem de alta prioridade sem responsável.',
    urgency: 'Alta',
    impact: 'Pode atrasar a execução operacional.',
    recommendedAction: 'Atribuir um responsável.',
    decisionContext: {
      confidence: 0.72,
      evidence: [
        {
          id: 'evidence-1',
          kind: 'STATE',
          label: 'Responsável',
          value: 'Não definido',
          source: {
            resource: 'work_orders',
            resourceId: 'work-order-1',
          },
        },
      ],
      operationalContext: {
        workOrders: {
          open: 1,
          highPriorityOpen: 1,
          unassignedHighPriority: 1,
        },
      },
      recommendations: [
        {
          id: 'recommendation-1',
          type: 'ASSIGN',
          title: 'Atribuir um responsável.',
          explanation: 'A ordem está sem responsável.',
          resource: 'work_orders',
          resourceId: 'work-order-1',
          executable: true,
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function config(values: Record<string, unknown>): ConfigService {
    return {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;
  }

  it('returns unavailable when no API key is configured', async () => {
    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': undefined,
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    await expect(provider.analyze(input)).resolves.toEqual({
      status: 'UNAVAILABLE',
      summary: 'A análise AI externa não está configurada.',
      rationale:
        'O provider OpenAI não possui uma chave API configurada. A análise operacional determinística permanece disponível.',
      confidence: 0,
      confidenceSource: 'UNAVAILABLE',
      provider: 'openai',
    });

    expect(OpenAI).not.toHaveBeenCalled();
  });

  it('generates a validated analysis from a structured OpenAI response', async () => {
    const create = jest.fn<Promise<MockCreateResponse>, [MockCreateRequest]>().mockResolvedValue({
      output_text: JSON.stringify({
        summary: 'Existe uma ordem de alta prioridade sem responsável.',
        rationale:
          'A evidência operacional confirma que a ordem permanece sem responsável.',
        recommendedRecommendationId: 'recommendation-1',
        confidence: 0.68,
      }),
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create,
      },
    }));

    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': 'test-key',
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    await expect(provider.analyze(input)).resolves.toEqual({
      status: 'GENERATED',
      summary: 'Existe uma ordem de alta prioridade sem responsável.',
      rationale:
        'A evidência operacional confirma que a ordem permanece sem responsável.',
      recommendedRecommendationId: 'recommendation-1',
      confidence: 0.68,
      confidenceSource: 'LLM',
      provider: 'openai',
    });

    expect(create).toHaveBeenCalledTimes(1);

    const request = create.mock.calls[0][0];

    expect(request.model).toBe('gpt-5-mini');
    expect(request.text.format).toMatchObject({
      type: 'json_schema',
      name: 'astra_ai_analysis',
      strict: true,
    });

    expect(request.text.format.schema).toMatchObject({
      type: 'object',
      additionalProperties: false,
    });
  });

  it('never allows the LLM to increase deterministic confidence', async () => {
    const create = jest.fn<Promise<MockCreateResponse>, [MockCreateRequest]>().mockResolvedValue({
      output_text: JSON.stringify({
        summary: 'Análise operacional.',
        rationale: 'Racional baseado no contexto.',
        recommendedRecommendationId: 'recommendation-1',
        confidence: 0.99,
      }),
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create,
      },
    }));

    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': 'test-key',
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    const result = await provider.analyze(input);

    expect(result.status).toBe('GENERATED');
    expect(result.confidence).toBe(0.72);
  });

  it('rejects a recommendation invented by the LLM', async () => {
    const create = jest.fn<Promise<MockCreateResponse>, [MockCreateRequest]>().mockResolvedValue({
      output_text: JSON.stringify({
        summary: 'Análise operacional.',
        rationale: 'Racional baseado no contexto.',
        recommendedRecommendationId: 'invented-recommendation',
        confidence: 0.7,
      }),
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create,
      },
    }));

    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': 'test-key',
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    await expect(provider.analyze(input)).resolves.toMatchObject({
      status: 'UNAVAILABLE',
      confidence: 0,
      confidenceSource: 'UNAVAILABLE',
      provider: 'openai',
    });
  });

  it('returns unavailable when OpenAI returns empty output', async () => {
    const create = jest.fn<Promise<MockCreateResponse>, [MockCreateRequest]>().mockResolvedValue({
      output_text: '',
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create,
      },
    }));

    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': 'test-key',
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    await expect(provider.analyze(input)).resolves.toMatchObject({
      status: 'UNAVAILABLE',
      summary: 'A análise AI externa não produziu conteúdo.',
      confidence: 0,
      provider: 'openai',
    });
  });

  it('returns unavailable when the OpenAI request fails', async () => {
    const create = jest.fn().mockRejectedValue(new Error('timeout'));

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      responses: {
        create,
      },
    }));

    const provider = new OpenAiAiProvider(
      config({
        'ai.openaiApiKey': 'test-key',
        'ai.openaiModel': 'gpt-5-mini',
        'ai.openaiTimeoutMs': 10000,
      }),
    );

    await expect(provider.analyze(input)).resolves.toMatchObject({
      status: 'UNAVAILABLE',
      summary: 'A análise AI externa está temporariamente indisponível.',
      confidence: 0,
      confidenceSource: 'UNAVAILABLE',
      provider: 'openai',
    });
  });
});
