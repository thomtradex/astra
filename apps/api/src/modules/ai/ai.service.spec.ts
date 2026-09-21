import { Test, TestingModule } from '@nestjs/testing';

import { AiService } from './ai.service';
import type { AIAnalysisInput } from './ai.types';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a structured analysis from operational context', async () => {
    const input: AIAnalysisInput = {
      signalId: 'signal-1',
      signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      severity: 'HIGH',
      title: 'Ordem sem responsável',
      explanation: 'A ordem de trabalho não tem responsável.',
      urgency: 'Requer atenção hoje.',
      impact: 'Pode atrasar a operação.',
      recommendedAction: 'Atribuir um responsável.',
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
      decisionContext: {
        evidence: [],
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
  });
});
