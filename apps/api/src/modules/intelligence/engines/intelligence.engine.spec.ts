import { CooDecisionEngine } from './intelligence.engine';

describe('CooDecisionEngine', () => {
  const engine = new CooDecisionEngine();

  const now = new Date('2026-09-05T10:00:00.000Z');

  it('detects open high-priority work orders', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-1',
          title: 'Reparar equipamento',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: 'project-1',
          asset_id: 'asset-1',
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    expect(result.signalCount).toBe(1);
    expect(result.signals[0]).toBeDefined();
    expect(result.signals[0]!.type).toBe('HIGH_PRIORITY_WORK_ORDER');
    expect(result.signals[0]!.severity).toBe('HIGH');
  });

  it('explains why overdue maintenance requires attention today when delay is under 7 days', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [
        {
          id: 'maintenance-today',
          plan: 'Revisão diária',
          status: 'ACTIVE',
          nextDue: new Date('2026-09-04T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) =>
        item.type === 'OVERDUE_MAINTENANCE' &&
        item.source.resourceId === 'maintenance-today',
    );

    expect(signal).toBeDefined();
    expect(signal?.urgency).toBe(
      'Requer atenção hoje: a data prevista de manutenção já foi ultrapassada.',
    );
  });

  it('explains why overdue maintenance requires attention this week from 7 days', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [
        {
          id: 'maintenance-week',
          plan: 'Revisão semanal',
          status: 'ACTIVE',
          nextDue: new Date('2026-08-29T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) =>
        item.type === 'OVERDUE_MAINTENANCE' &&
        item.source.resourceId === 'maintenance-week',
    );

    expect(signal).toBeDefined();
    expect(signal?.urgency).toBe(
      'Requer atenção esta semana: a manutenção está há 7 dia(s) em atraso.',
    );
  });

  it('explains why overdue maintenance requires immediate attention from 30 days', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [
        {
          id: 'maintenance-immediate',
          plan: 'Revisão mensal',
          status: 'ACTIVE',
          nextDue: new Date('2026-08-06T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) =>
        item.type === 'OVERDUE_MAINTENANCE' &&
        item.source.resourceId === 'maintenance-immediate',
    );

    expect(signal).toBeDefined();
    expect(signal?.urgency).toBe(
      'Requer atenção imediata: a manutenção está há 30 dia(s) em atraso.',
    );
  });

  it('detects overdue maintenance', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [
        {
          id: 'maintenance-1',
          plan: 'Revisão mensal',
          status: 'ACTIVE',
          nextDue: new Date('2026-09-01T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [],
      sites: [],
      projects: [],
    });

    expect(result.signalCount).toBe(1);
    expect(result.signals[0]).toBeDefined();
    expect(result.signals[0]!.type).toBe('OVERDUE_MAINTENANCE');
  });

  it('adds equipment and related work order context to overdue maintenance', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-1',
          title: 'Verificar fuga hidráulica',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: 'asset-1',
        },
      ],
      maintenancePlans: [
        {
          id: 'maintenance-1',
          plan: 'Revisão mensal',
          status: 'ACTIVE',
          nextDue: new Date('2026-08-01T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [
        {
          id: 'asset-1',
          name: 'Escavadora CAT 320',
          code: 'CAT-320-01',
          serial_number: 'SN-320-01',
          status: 'ACTIVE',
          site_id: 'site-1',
        },
      ],
      sites: [
        {
          id: 'site-1',
          name: 'Obra Lisboa Norte',
          code: 'OBR-LX-01',
        },
      ],
      projects: [],
    });

    expect(result.signals).toHaveLength(3);

    const signal = result.signals.find(
      (item) => item.type === 'OVERDUE_MAINTENANCE',
    );

    expect(signal).toBeDefined();
    if (!signal) throw new Error('Expected overdue maintenance signal');

    expect(signal.type).toBe('OVERDUE_MAINTENANCE');
    expect(signal.title).toBe(
      'Manutenção em atraso — Escavadora CAT 320',
    );
    expect(signal.evidence).toEqual(
      expect.arrayContaining([
        'Equipamento: Escavadora CAT 320 (CAT-320-01)',
        'Site associado: Obra Lisboa Norte (OBR-LX-01)',
        'Ordens de trabalho abertas associadas: 1',
        'Ordens abertas de alta prioridade: 1',
      ]),
    );
    expect(signal.recommendedAction).toContain(
      'ordem(ns) de alta prioridade',
    );
    expect(signal.action).toEqual({
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      requiresAuthorization: true,
    });
  });

  it('detects unassigned high-priority work', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-1',
          title: 'Urgente',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) =>
        item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
    );

    expect(signal).toBeDefined();

    if (!signal) {
      throw new Error('Expected intelligence signal');
    }

    expect(signal.title).toBe(
      'Ordem de alta prioridade sem responsável — Urgente',
    );
    expect(signal.action).toEqual({
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      requiresAuthorization: true,
    });
    expect(signal?.source).toEqual({
      resource: 'work_orders',
      resourceId: 'wo-1',
    });
  });

  it('detects projects past their end date', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [],
      assets: [],
      projects: [
        {
          id: 'project-1',
          name: 'Obra Norte',
          status: 'IN_PROGRESS',
          progress: 60,
          end_date: new Date('2026-08-31T10:00:00.000Z'),
        },
      ],
      sites: [],
    });

    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]).toBeDefined();
    expect(result.signals[0]!.type).toBe('OVERDUE_PROJECT');
    expect(result.signals[0]!.severity).toBe('HIGH');
  });

  it('adds operational context from project work orders to overdue projects', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-1',
          title: 'Reparar estrutura',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-1',
          asset_id: null,
        },
        {
          id: 'wo-2',
          title: 'Verificar instalação',
          status: 'OPEN',
          priority: 'MEDIUM',
          assigned_to_id: 'user-1',
          project_id: 'project-1',
          asset_id: null,
        },
        {
          id: 'wo-3',
          title: 'Outra obra',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-2',
          asset_id: null,
        },
      ],
      maintenancePlans: [],
      assets: [],
      projects: [
        {
          id: 'project-1',
          name: 'Obra Norte',
          status: 'IN_PROGRESS',
          progress: 60,
          end_date: new Date('2026-08-31T10:00:00.000Z'),
        },
      ],
      sites: [],
    });

    const signal = result.signals.find(
      (item) => item.type === 'OVERDUE_PROJECT',
    );

    expect(signal).toBeDefined();

    if (!signal) {
      throw new Error('Expected overdue project intelligence signal');
    }

    expect(signal.evidence).toContain(
      'Ordens de trabalho abertas associadas: 2',
    );
    expect(signal.evidence).toContain(
      'Ordens abertas de alta prioridade: 1',
    );
    expect(signal.evidence).toContain(
      'Ordens de alta prioridade sem responsável: 1',
    );
    expect(signal.recommendedAction).toContain(
      'sem responsável',
    );
  });

  it('returns no signals when the operation has no detected issues', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-1',
          title: 'Normal',
          status: 'CLOSED',
          priority: 'MEDIUM',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: null,
        },
      ],
      maintenancePlans: [
        {
          id: 'maintenance-1',
          plan: 'Revisão futura',
          status: 'ACTIVE',
          nextDue: new Date('2026-10-01T10:00:00.000Z'),
          assetId: 'asset-1',
        },
      ],
      assets: [],
      projects: [
        {
          id: 'project-1',
          name: 'Obra Sul',
          status: 'IN_PROGRESS',
          progress: 70,
          end_date: new Date('2026-12-01T10:00:00.000Z'),
        },
      ],
      sites: [],
    });

    expect(result.signalCount).toBe(0);
  });
  it('recommends SET_PROJECT_STATUS for an overdue project', () => {
    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [],
      assets: [],
      projects: [
        {
          id: 'project-overdue',
          name: 'Projeto Atrasado',
          status: 'ACTIVE',
          progress: 35,
          end_date: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
      sites: [],
    });

    const signal = result.signals.find(
      (item) =>
        item.type === 'OVERDUE_PROJECT' &&
        item.source.resourceId === 'project-overdue',
    );

    expect(signal).toBeDefined();

    if (!signal) {
      throw new Error('Expected overdue project intelligence signal');
    }

    expect(signal.action).toEqual({
      type: 'SET_PROJECT_STATUS',
      resource: 'projects',
      resourceId: 'project-overdue',
      requiresAuthorization: true,
    });
  });


  it('prioritizes an overdue project with an unassigned high-priority work order', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      now: new Date('2026-01-10T12:00:00.000Z'),
      workOrders: [
        {
          id: 'wo-unassigned',
          title: 'Intervenção urgente',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-late',
          asset_id: null,
        },
        {
          id: 'wo-open',
          title: 'Outra intervenção',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: null,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [
        {
          id: 'project-late',
          name: 'Obra Norte',
          status: 'ACTIVE',
          progress: 40,
          end_date: new Date('2026-01-01T12:00:00.000Z'),
        },
      ],
    });

    expect(result.signals[0]!.type).toBe('OVERDUE_PROJECT');
    expect(result.signals[0]!.severity).toBe('CRITICAL');
  });

  it('prioritizes overdue maintenance with a high-priority asset work order over maintenance without operational context', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      now: new Date('2026-01-10T12:00:00.000Z'),
      workOrders: [
        {
          id: 'wo-asset-high',
          title: 'Falha crítica',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: 'asset-risk',
        },
      ],
      maintenancePlans: [
        {
          id: 'maintenance-risk',
          plan: 'Manutenção urgente',
          status: 'ACTIVE',
          nextDue: new Date('2026-01-01T12:00:00.000Z'),
          assetId: 'asset-risk',
        },
        {
          id: 'maintenance-normal',
          plan: 'Manutenção preventiva',
          status: 'ACTIVE',
          nextDue: new Date('2026-01-02T12:00:00.000Z'),
          assetId: 'asset-normal',
        },
      ],
      assets: [
        {
          id: 'asset-risk',
          name: 'Gerador principal',
          code: 'GEN-01',
          serial_number: 'SN-01',
          status: 'ACTIVE',
          site_id: null,
        },
        {
          id: 'asset-normal',
          name: 'Compressor',
          code: 'COMP-01',
          serial_number: 'SN-02',
          status: 'ACTIVE',
          site_id: null,
        },
      ],
      sites: [],
      projects: [],
    });

    const maintenanceSignals = result.signals.filter(
      (signal) => signal.type === 'OVERDUE_MAINTENANCE',
    );

    expect(maintenanceSignals[0]!.source.resourceId).toBe(
      'maintenance-risk',
    );
  });


  it('uses operational context to break ties between equally severe overdue projects', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      now: new Date('2026-01-10T12:00:00.000Z'),
      workOrders: [
        {
          id: 'wo-project-context',
          title: 'Intervenção urgente',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-context',
          asset_id: null,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [
        {
          id: 'project-no-context',
          name: 'Obra sem contexto',
          status: 'ACTIVE',
          progress: 60,
          end_date: new Date('2026-01-02T12:00:00.000Z'),
        },
        {
          id: 'project-context',
          name: 'Obra com risco operacional',
          status: 'ACTIVE',
          progress: 60,
          end_date: new Date('2026-01-01T12:00:00.000Z'),
        },
      ],
    });

    const projects = result.signals.filter(
      (signal) => signal.type === 'OVERDUE_PROJECT',
    );

    expect(projects).toHaveLength(2);
    expect(projects[0]!.source.resourceId).toBe('project-context');
  });

  it('keeps critical severity ahead of lower-severity operational context', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      now: new Date('2026-01-10T12:00:00.000Z'),
      workOrders: [
        {
          id: 'wo-high',
          title: 'Falha crítica',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: 'asset-risk',
        },
      ],
      maintenancePlans: [
        {
          id: 'maintenance-risk',
          plan: 'Manutenção atrasada',
          status: 'ACTIVE',
          nextDue: new Date('2026-01-01T12:00:00.000Z'),
          assetId: 'asset-risk',
        },
      ],
      assets: [
        {
          id: 'asset-risk',
          name: 'Gerador principal',
          code: 'GEN-01',
          serial_number: 'SN-01',
          status: 'ACTIVE',
          site_id: null,
        },
      ],
      sites: [],
      projects: [
        {
          id: 'project-critical',
          name: 'Obra crítica',
          status: 'ACTIVE',
          progress: 20,
          end_date: new Date('2026-01-01T12:00:00.000Z'),
        },
      ],
    });

    expect(result.signals[0]!.type).toBe('OVERDUE_PROJECT');
    expect(result.signals[0]!.severity).toBe('CRITICAL');
  });

});
