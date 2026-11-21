import type { IntelligenceSignal } from '../../intelligence/intelligence.types';

import { IntelligenceAiContextBuilder } from './intelligence-ai-context.builder';

describe('IntelligenceAiContextBuilder', () => {
  const builder = new IntelligenceAiContextBuilder();

  it('builds AI analysis input when decision context exists', () => {
    const signal = {
      id: 'signal-1',
      type: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      severity: 'HIGH',
      title: 'Ordem sem responsável',
      explanation: 'Existe uma ordem de alta prioridade sem responsável.',
      evidence: ['wo-1'],
      urgency: 'Alta',
      impact: 'Pode atrasar a execução.',
      recommendedAction: 'Atribuir responsável à ordem.',
      decision: {
        type: 'REVIEW',
        label: 'Rever decisão',
      },
      status: 'OPEN',
      timestamp: '2026-09-26T10:00:00.000Z',
      source: {
        resource: 'work_orders',
        resourceId: 'wo-1',
      },
      decisionContext: {
        evidence: [],
        operationalContext: {
          workOrders: {
            open: 1,
            highPriorityOpen: 1,
            unassignedHighPriority: 1,
          },
        },
        recommendations: [],
        confidence: 1,
      },
    } satisfies IntelligenceSignal;

    expect(builder.build(signal)).toEqual({
      signalId: 'signal-1',
      signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      severity: 'HIGH',
      title: 'Ordem sem responsável',
      explanation: 'Existe uma ordem de alta prioridade sem responsável.',
      urgency: 'Alta',
      impact: 'Pode atrasar a execução.',
      recommendedAction: 'Atribuir responsável à ordem.',
      signalSource: {
        resource: 'work_orders',
        resourceId: 'wo-1',
      },
      decisionContext: signal.decisionContext,
    });
  });

  it('does not build AI analysis input when decision context is missing', () => {
    const signal = {
      id: 'signal-2',
      type: 'HIGH_PRIORITY_WORK_ORDER',
      severity: 'HIGH',
      title: 'Ordem prioritária',
      explanation: 'Existe uma ordem prioritária.',
      evidence: [],
      urgency: 'Alta',
      impact: 'Requer atenção.',
      recommendedAction: 'Rever a ordem.',
      decision: {
        type: 'REVIEW',
        label: 'Rever decisão',
      },
      status: 'OPEN',
      timestamp: '2026-09-26T10:00:00.000Z',
      source: {
        resource: 'work_orders',
        resourceId: 'wo-2',
      },
    } satisfies IntelligenceSignal;

    expect(builder.build(signal)).toBeUndefined();
  });
});
