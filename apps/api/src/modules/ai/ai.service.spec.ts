import { Test, TestingModule } from '@nestjs/testing';

import { AI_PROVIDER, AiService } from './ai.service';
import type { AIAnalysisInput } from './ai.types';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const provider = {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED' as const,
        summary: 'Análise AI determinística.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'deterministic',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_PROVIDER,
          useValue: provider,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate analysis to the configured AI provider', async () => {
    const provider = {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED' as const,
        summary: 'Análise AI determinística.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'deterministic',
        recommendedRecommendationId: 'recommendation-1',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_PROVIDER,
          useValue: provider,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    const input: AIAnalysisInput = {
      signalId: 'signal-1',
      signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      severity: 'HIGH',
      title: 'Ordem sem responsável',
      explanation: 'A ordem de trabalho não tem responsável.',
      urgency: 'Requer atenção hoje.',
      impact: 'Pode atrasar a operação.',
      recommendedAction: 'Atribuir um responsável.',
      decisionContext: {
        evidence: [
          {
            id: 'evidence-1',
            kind: 'FACT',
            label: 'Prioridade',
            value: 'HIGH',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-1',
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
            title: 'Atribuir responsável',
            explanation: 'Definir um responsável operacional.',
            resource: 'work_orders',
            resourceId: 'wo-1',
            executable: true,
          },
        ],
        confidence: 1,
      },
    };

    await expect(service.analyze(input)).resolves.toEqual(
      expect.objectContaining({
        status: 'GENERATED',
        provider: 'deterministic',
        recommendedRecommendationId: 'recommendation-1',
        confidence: 1,
      }),
    );

    expect(provider.analyze).toHaveBeenCalledWith(input);
    expect(provider.analyze).toHaveBeenCalledTimes(1);
  });
});
