import { OperationalRiskEngine } from './operational-risk.engine';

describe('OperationalRiskEngine', () => {
  const engine = new OperationalRiskEngine();

  it('scores an unassigned critical open work order as high risk', () => {
    const result = engine.calculate({
      priority: 'CRITICAL',
      status: 'OPEN',
      assigned: false,
    });

    expect(result.score).toBe(65);
    expect(result.level).toBe('HIGH');
    expect(result.factors).toEqual(
      expect.arrayContaining([
        'Prioridade CRITICAL',
        'Estado OPEN',
        'Sem responsável',
      ]),
    );
  });

  it('raises risk for stale work and related open orders', () => {
    const result = engine.calculate({
      priority: 'HIGH',
      status: 'OPEN',
      assigned: true,
      ageDays: 8,
      relatedOpenWorkOrders: 3,
    });

    expect(result.score).toBe(65);
    expect(result.level).toBe('HIGH');
    expect(result.factors).toEqual(
      expect.arrayContaining([
        'Prioridade HIGH',
        'Sem atualização há 8 dia(s)',
        '3 ordens abertas relacionadas',
      ]),
    );
  });

  it('caps risk at 100', () => {
    const result = engine.calculate({
      priority: 'CRITICAL',
      status: 'OPEN',
      assigned: false,
      ageDays: 30,
      relatedOpenWorkOrders: 10,
      projectOverdueDays: 30,
      maintenanceOverdueDays: 30,
    });

    expect(result.score).toBe(100);
    expect(result.level).toBe('CRITICAL');
  });
});
