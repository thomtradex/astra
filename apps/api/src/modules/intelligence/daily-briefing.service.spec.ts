import { DailyBriefingService } from './daily-briefing.service';
import { IntelligenceSignal } from './intelligence.types';

function signal(
  overrides: Partial<IntelligenceSignal> = {},
): IntelligenceSignal {
  return {
    id: 'signal-1',
    type: 'UNASSIGNED_WORK_ORDER',
    severity: 'MEDIUM',
    title: 'Ordem sem responsável',
    explanation: 'A ordem necessita de responsável.',
    evidence: ['Ordem aberta.'],
    urgency: 'Requer atenção.',
    impact: 'Pode atrasar a execução.',
    recommendedAction: 'Atribuir responsável.',
    decision: {
      type: 'REVIEW',
      label: 'Rever',
    },
    status: 'OPEN',
    timestamp: '2026-09-15T08:00:00.000Z',
    source: {
      resource: 'work_orders',
      resourceId: 'wo-1',
    },
    ...overrides,
  };
}

describe('DailyBriefingService', () => {
  const service = new DailyBriefingService();

  it('builds a clear zero-signal briefing', () => {
    const result = service.build([], new Date('2026-09-15T08:00:00.000Z'));

    expect(result.date).toBe('2026-09-15');
    expect(result.generatedAt).toBe('2026-09-15T08:00:00.000Z');
    expect(result.summary).toEqual({
      headline: 'A operação não apresenta situações prioritárias neste momento.',
      explanation:
        'Os dados operacionais disponíveis não apresentam situações que cumpram os critérios atuais de atenção.',
      critical: 0,
      high: 0,
      medium: 0,
      total: 0,
    });
    expect(result.priorities).toEqual([]);
    expect(result.nextStep).toContain('Continuar a operação normalmente');
  });

  it('preserves engine ordering while building priorities', () => {
    const result = service.build([
      signal({
        id: 'medium-1',
        severity: 'MEDIUM',
      }),
      signal({
        id: 'critical-1',
        severity: 'CRITICAL',
        title: 'Projeto crítico',
      }),
      signal({
        id: 'high-1',
        severity: 'HIGH',
        title: 'Risco elevado',
      }),
    ], new Date('2026-09-15T08:00:00.000Z'));

    expect(result.summary.critical).toBe(1);
    expect(result.summary.high).toBe(1);
    expect(result.summary.medium).toBe(1);
    expect(result.summary.total).toBe(3);

    expect(result.priorities.map((item) => item.rank)).toEqual([1, 2, 3]);
    expect(result.priorities[0]?.severity).toBe('MEDIUM');

    expect(result.nextStep).toContain('prioridade crítica');
  });

  it('preserves the executable action in the priority', () => {
    const result = service.build([
      signal({
        severity: 'HIGH',
        action: {
          type: 'ASSIGN_WORK_ORDER',
          resource: 'work_orders',
          resourceId: 'wo-42',
          requiresAuthorization: true,
        },
      }),
    ], new Date('2026-09-15T08:00:00.000Z'));

    expect(result.priorities[0]?.action).toEqual({
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-42',
      requiresAuthorization: true,
    });
  });

  it('limits daily priorities to five signals', () => {
    const signals = Array.from({ length: 8 }, (_, index) =>
      signal({
        id: `signal-${index + 1}`,
        title: `Sinal ${index + 1}`,
      }),
    );

    const result = service.build(
      signals,
      new Date('2026-09-15T08:00:00.000Z'),
    );

    expect(result.summary.total).toBe(8);
    expect(result.priorities).toHaveLength(5);
    expect(result.priorities.map((item) => item.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses the high-priority next step when there are no critical signals', () => {
    const result = service.build([
      signal({
        severity: 'HIGH',
      }),
    ], new Date('2026-09-15T08:00:00.000Z'));

    expect(result.nextStep).toContain('alta prioridade');
  });
});
