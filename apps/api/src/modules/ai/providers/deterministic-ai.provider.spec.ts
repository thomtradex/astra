import { DeterministicAiProvider } from './deterministic-ai.provider';

describe('DeterministicAiProvider', () => {
  let provider: DeterministicAiProvider;

  beforeEach(() => {
    provider = new DeterministicAiProvider();
  });

  it('should generate analysis from operational context', async () => {
    const input = {
      signalId: 'signal-1',
      signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' as const,
      severity: 'HIGH' as const,
      title: 'Ordem sem responsável',
      explanation: 'A ordem de trabalho não tem responsável.',
      urgency: 'Requer atenção hoje.',
      impact: 'Pode atrasar a operação.',
      recommendedAction: 'Atribuir um responsável.',
      decisionContext: {
        evidence: [
          {
            id: 'evidence-1',
            kind: 'FACT' as const,
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
            type: 'ASSIGN' as const,
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

    const result = await provider.analyze(input);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'GENERATED',
        provider: 'deterministic',
        recommendedRecommendationId: 'recommendation-1',
        confidence: 1,
      }),
    );

    expect(result.summary).toContain('Ordem sem responsável');
    expect(result.summary).toContain('Atribuir responsável');
    expect(result.summary).toContain('Atribuir um responsável.');
    expect(result.rationale).toContain('Requer atenção hoje.');
    expect(result.rationale).toContain(
      'A ordem de trabalho não tem responsável.',
    );
    expect(result.rationale).toContain('Pode atrasar a operação.');
    expect(result.rationale).toContain(
      '1 evidência estruturada associada ao sinal.',
    );
  });

  it('should generate analysis without a recommendation', async () => {
    const input = {
      signalId: 'signal-2',
      signalType: 'MAINTENANCE_OPERATIONAL_CONFLICT' as const,
      severity: 'MEDIUM' as const,
      title: 'Conflito operacional',
      explanation: 'Existe uma sobreposição operacional.',
      urgency: 'Requer acompanhamento.',
      impact: 'Pode exigir coordenação.',
      recommendedAction: 'Rever a operação.',
      decisionContext: {
        evidence: [],
        operationalContext: {
          workOrders: {
            open: 2,
            highPriorityOpen: 0,
            unassignedHighPriority: 0,
          },
        },
        recommendations: [
          {
            id: 'recommendation-monitor',
            type: 'MONITOR' as const,
            title: 'Monitorizar operação',
            explanation: 'Acompanhar a situação.',
            resource: 'maintenance_plans',
            resourceId: 'maintenance-1',
            executable: false,
          },
        ],
        confidence: 1,
      },
    };

    const result = await provider.analyze(input);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'GENERATED',
        provider: 'deterministic',
        confidence: 1,
      }),
    );

    expect(result.recommendedRecommendationId).toBeUndefined();
    expect(result.summary).toContain(
      'A situação requer acompanhamento operacional.',
    );
    expect(result.rationale).toContain(
      'Existem 0 evidências estruturadas associadas ao sinal.',
    );
  });

  it('should normalize spacing and punctuation in generated text', async () => {
    const input = {
      signalId: 'signal-3',
      signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' as const,
      severity: 'HIGH' as const,
      title: 'Ordem de alta prioridade sem responsável — Inspeção operacional',
      explanation:
        'A ordem de trabalho de alta prioridade permanece sem responsável.',
      urgency: 'Requer atenção hoje: prioridade alta sem responsável atribuído.',
      impact:
        'A ordem permanece sem responsável, deixando a responsabilidade operacional por definir.',
      recommendedAction:
        'Atribuir um responsável e confirmar a próxima ação operacional.',
      decisionContext: {
        evidence: [
          {
            id: 'evidence-1',
            kind: 'FACT' as const,
            label: 'Estado',
            value: 'Sem responsável',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-3',
            },
          },
          {
            id: 'evidence-2',
            kind: 'FACT' as const,
            label: 'Prioridade',
            value: 'HIGH',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-3',
            },
          },
          {
            id: 'evidence-3',
            kind: 'FACT' as const,
            label: 'Estado operacional',
            value: 'OPEN',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-3',
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
            id: 'recommendation-3',
            type: 'ASSIGN' as const,
            title: 'Ação recomendada pelo Astra',
            explanation:
              'Atribuir um responsável e confirmar a próxima ação operacional.',
            resource: 'work_orders',
            resourceId: 'wo-3',
            executable: true,
          },
        ],
        confidence: 1,
      },
    };

    const result = await provider.analyze(input);

    expect(result.summary).toBe(
      'Ordem de alta prioridade sem responsável — Inspeção operacional. ' +
        'A ação recomendada é: Ação recomendada pelo Astra. ' +
        'Atribuir um responsável e confirmar a próxima ação operacional.',
    );

    expect(result.rationale).toContain(
      'Existem 3 evidências estruturadas associadas ao sinal.',
    );

    expect(result.summary).not.toMatch(/\s{2,}/);
    expect(result.summary).not.toMatch(/recomendadapelo/);
    expect(result.summary).not.toMatch(/açãooperacional/);
    expect(result.rationale).not.toMatch(/3evidências/);
  });
});
