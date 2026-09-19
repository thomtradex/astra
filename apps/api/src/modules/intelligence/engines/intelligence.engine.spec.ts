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
          updated_at: new Date(),
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

  it('does not create an aggregate high-priority signal when all high-priority work is already represented by unassigned signals', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-unassigned-1',
          title: 'Inspeção sem responsável 1',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
        },
        {
          id: 'wo-unassigned-2',
          title: 'Inspeção sem responsável 2',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    expect(
      result.signals.some(
        (item) => item.type === 'HIGH_PRIORITY_WORK_ORDER',
      ),
    ).toBe(false);

    expect(
      result.signals.filter(
        (item) => item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      ),
    ).toHaveLength(2);
  });

  it('builds operational context from source facts for aggregate high-priority work', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-assigned-1',
          title: 'Trabalho atribuído',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
        },
        {
          id: 'wo-assigned-2',
          title: 'Outro trabalho atribuído',
          status: 'OPEN',
          priority: 'CRITICAL',
          assigned_to_id: 'user-2',
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) => item.type === 'HIGH_PRIORITY_WORK_ORDER',
    );

    expect(signal).toBeDefined();
    expect(signal!.operationalContext?.workOrders).toEqual({
      open: 2,
      highPriorityOpen: 2,
      unassignedHighPriority: 0,
    });
  });

  it('treats IN_PROGRESS high-priority work orders as operationally open', () => {
    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-in-progress',
          title: 'Inspeção operacional em curso',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: 'project-1',
          asset_id: 'asset-1',
          updated_at: new Date(),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) => item.type === 'HIGH_PRIORITY_WORK_ORDER',
    );

    expect(signal).toBeDefined();
    expect(signal!.severity).toBe('HIGH');
    expect(signal!.evidence).toContain('Inspeção operacional em curso');
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
        item.type === 'OVERDUE_MAINTENANCE' && item.source.resourceId === 'maintenance-today',
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
        item.type === 'OVERDUE_MAINTENANCE' && item.source.resourceId === 'maintenance-week',
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
        item.type === 'OVERDUE_MAINTENANCE' && item.source.resourceId === 'maintenance-immediate',
    );

    expect(signal).toBeDefined();
    expect(signal?.urgency).toBe(
      'Requer atenção imediata: a manutenção está há 30 dia(s) em atraso.',
    );
  });

  it('adds a real operational chain to overdue maintenance with asset, open work order and site', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-maint-chain-1',
          title: 'Verificar travões',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: null,
          asset_id: 'asset-maint-chain-1',
          updated_at: new Date('2026-09-08T09:00:00.000Z'),
        },
      ],
      maintenancePlans: [
        {
          id: 'maintenance-chain-1',
          plan: 'Manutenção escavadora',
          status: 'ACTIVE',
          nextDue: new Date('2026-09-01T00:00:00.000Z'),
          assetId: 'asset-maint-chain-1',
        },
      ],
      assets: [
        {
          id: 'asset-maint-chain-1',
          name: 'Escavadora Norte',
          code: 'ESC-N',
          serial_number: 'SN-N',
          status: 'ACTIVE',
          site_id: 'site-maint-chain-1',
        },
      ],
      sites: [
        {
          id: 'site-maint-chain-1',
          name: 'Obra Norte',
          code: 'NORTE',
        },
      ],
      projects: [],
    });

    const signal = result.signals.find((item) => item.type === 'OVERDUE_MAINTENANCE');

    expect(signal?.chain).toBeDefined();
    expect(signal?.chain?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'MAINTENANCE',
          id: 'maintenance-chain-1',
        }),
        expect.objectContaining({
          type: 'ASSET',
          id: 'asset-maint-chain-1',
        }),
        expect.objectContaining({
          type: 'WORK_ORDER',
          id: 'wo-maint-chain-1',
        }),
        expect.objectContaining({
          type: 'SITE',
          id: 'site-maint-chain-1',
        }),
      ]),
    );
    expect(signal?.chain?.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relationship: 'afeta ativo',
        }),
        expect.objectContaining({
          relationship: 'tem ordem de trabalho aberta',
        }),
        expect.objectContaining({
          relationship: 'está localizado em',
        }),
      ]),
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
          updated_at: new Date(),
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

    expect(result.signals).toHaveLength(2);

    const signal = result.signals.find((item) => item.type === 'OVERDUE_MAINTENANCE');

    expect(signal).toBeDefined();
    if (!signal) throw new Error('Expected overdue maintenance signal');

    expect(signal.type).toBe('OVERDUE_MAINTENANCE');
    expect(signal.title).toBe('Manutenção em atraso — Escavadora CAT 320');
    expect(signal.evidence).toEqual(
      expect.arrayContaining([
        'Equipamento: Escavadora CAT 320 (CAT-320-01)',
        'Site associado: Obra Lisboa Norte (OBR-LX-01)',
        'Ordens de trabalho abertas associadas: 1',
        'Ordens abertas de alta prioridade: 1',
      ]),
    );
    expect(signal.recommendedAction).toContain('ordem(ns) de alta prioridade');
    expect(signal.action).toEqual({
      type: 'UPDATE_MAINTENANCE',
      resource: 'maintenance_plans',
      resourceId: 'maintenance-1',
      requiresAuthorization: true,
    });
  });

  it('detects open work without an assigned owner', () => {
    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-unassigned-medium',
          title: 'Instalação sem responsável',
          status: 'OPEN',
          priority: 'MEDIUM',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now,
    });

    const signal = result.signals.find(
      (item) => item.id === 'unassigned-work-order-wo-unassigned-medium',
    );

    expect(signal).toMatchObject({
      type: 'UNASSIGNED_WORK_ORDER',
      severity: 'MEDIUM',
      source: {
        resource: 'work_orders',
        resourceId: 'wo-unassigned-medium',
      },
      action: {
        type: 'ASSIGN_WORK_ORDER',
        resource: 'work_orders',
        resourceId: 'wo-unassigned-medium',
        requiresAuthorization: true,
      },
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
          updated_at: new Date(),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
    });

    const signal = result.signals.find(
      (item) => item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
    );

    expect(signal).toBeDefined();

    if (!signal) {
      throw new Error('Expected intelligence signal');
    }

    expect(signal.title).toBe('Ordem de alta prioridade sem responsável — Urgente');
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

  it('adds a real operational chain to an overdue project with an open work order and asset', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      now,
      workOrders: [
        {
          id: 'wo-chain-1',
          title: 'Reparar equipamento',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-chain-1',
          asset_id: 'asset-chain-1',
          updated_at: new Date('2026-09-08T09:00:00.000Z'),
        },
      ],
      maintenancePlans: [],
      assets: [
        {
          id: 'asset-chain-1',
          name: 'Escavadora A',
          code: 'ESC-A',
          serial_number: 'SN-A',
          status: 'ACTIVE',
          site_id: 'site-chain-1',
        },
      ],
      sites: [
        {
          id: 'site-chain-1',
          name: 'Obra Norte',
          code: 'NORTE',
        },
      ],
      projects: [
        {
          id: 'project-chain-1',
          name: 'Projeto Norte',
          status: 'ACTIVE',
          progress: 60,
          end_date: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
    });

    const signal = result.signals.find((item) => item.type === 'OVERDUE_PROJECT');

    expect(signal?.chain).toBeDefined();
    expect(signal?.chain?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'PROJECT',
          id: 'project-chain-1',
        }),
        expect.objectContaining({
          type: 'WORK_ORDER',
          id: 'wo-chain-1',
        }),
        expect.objectContaining({
          type: 'ASSET',
          id: 'asset-chain-1',
        }),
      ]),
    );
    expect(signal?.chain?.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relationship: 'tem ordem de trabalho',
        }),
        expect.objectContaining({
          relationship: 'afeta ativo',
        }),
      ]),
    );
  });

  it('does not create a project operational chain without an open related work order', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      now,
      workOrders: [],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [
        {
          id: 'project-no-chain',
          name: 'Projeto sem ordens',
          status: 'ACTIVE',
          progress: 40,
          end_date: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
    });

    const signal = result.signals.find((item) => item.type === 'OVERDUE_PROJECT');

    expect(signal).toBeDefined();
    expect(signal?.chain).toBeUndefined();
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
          updated_at: new Date(),
        },
        {
          id: 'wo-2',
          title: 'Verificar instalação',
          status: 'OPEN',
          priority: 'MEDIUM',
          assigned_to_id: 'user-1',
          project_id: 'project-1',
          asset_id: null,
          updated_at: new Date(),
        },
        {
          id: 'wo-3',
          title: 'Outra obra',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-2',
          asset_id: null,
          updated_at: new Date(),
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

    const signal = result.signals.find((item) => item.type === 'OVERDUE_PROJECT');

    expect(signal).toBeDefined();

    if (!signal) {
      throw new Error('Expected overdue project intelligence signal');
    }

    expect(signal.evidence).toContain('Ordens de trabalho abertas associadas: 2');
    expect(signal.evidence).toContain('Ordens abertas de alta prioridade: 1');
    expect(signal.evidence).toContain('Ordens de alta prioridade sem responsável: 1');
    expect(signal.recommendedAction).toContain('sem responsável');
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
          updated_at: new Date(),
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
      (item) => item.type === 'OVERDUE_PROJECT' && item.source.resourceId === 'project-overdue',
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
          updated_at: new Date(),
        },
        {
          id: 'wo-open',
          title: 'Outra intervenção',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: null,
          updated_at: new Date(),
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
    expect(result.signals[0]!.evidence).toEqual(
      expect.arrayContaining([
        'Ordens de trabalho abertas associadas: 1',
        'Ordens abertas de alta prioridade: 1',
        'Ordens de alta prioridade sem responsável: 1',
      ]),
    );
    expect(result.signals[0]!.impact).toContain('ordem de alta prioridade sem responsável');
    expect(result.signals[0]!.recommendedAction).toContain('atribuição de responsável');
    expect(result.signals[0]!.recommendedAction).toContain('plano de recuperação');
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
          updated_at: new Date(),
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

    expect(maintenanceSignals[0]!.source.resourceId).toBe('maintenance-risk');
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
          updated_at: new Date(),
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

    const projects = result.signals.filter((signal) => signal.type === 'OVERDUE_PROJECT');

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
          updated_at: new Date(),
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

  it('creates a stale open work-order signal from last update time', () => {
    const staleDate = new Date('2026-08-20T10:00:00.000Z');
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-stale',
          title: 'Inspeção atrasada',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: 'asset-1',
          updated_at: staleDate,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now,
    });

    const signal = result.signals.find((item) => item.type === 'STALE_OPEN_WORK_ORDER');

    expect(signal).toBeDefined();
    expect(signal!.title).toContain('Ordem sem atualização há');
    expect(signal!.evidence).toContain('Última atualização: há 19 dias.');
    expect(signal!.action).toBeUndefined();
    expect(signal!.decision.label).toBe('Rever ordem');
  });

  it('creates an assignable stale signal when the work order has no owner', () => {
    const staleDate = new Date('2026-08-20T10:00:00.000Z');
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-stale-unassigned',
          title: 'Substituição urgente',
          status: 'OPEN',
          priority: 'CRITICAL',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: staleDate,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now,
    });

    const staleSignal = result.signals.find(
      (item) =>
        item.type === 'STALE_OPEN_WORK_ORDER' && item.source.resourceId === 'wo-stale-unassigned',
    );

    const unassignedSignal = result.signals.find(
      (item) =>
        item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER' &&
        item.source.resourceId === 'wo-stale-unassigned',
    );

    expect(staleSignal).toBeUndefined();
    expect(unassignedSignal).toBeDefined();
    expect(unassignedSignal!.severity).toBe('CRITICAL');
    expect(unassignedSignal!.action).toEqual({
      type: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-stale-unassigned',
      requiresAuthorization: true,
    });
    expect(unassignedSignal!.evidence).toContain('Ordem de trabalho: Substituição urgente');
  });

  it('adds project context to an unassigned work order decision', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-contextual',
          title: 'Material em falta',
          status: 'OPEN',
          priority: 'CRITICAL',
          assigned_to_id: null,
          project_id: 'project-context',
          asset_id: null,
          updated_at: new Date('2026-09-08T09:00:00.000Z'),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [
        {
          id: 'project-context',
          name: 'Obra Centro',
          status: 'IN_PROGRESS',
          progress: 42,
          end_date: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
      now,
    });

    const signal = result.signals.find((item) => item.source.resourceId === 'wo-contextual');

    expect(signal).toBeDefined();
    expect(signal!.type).toBe('UNASSIGNED_HIGH_PRIORITY_WORK_ORDER');
    expect(signal!.evidence).toContain('Obra: Obra Centro');
    expect(signal!.evidence).toContain('Estado da obra: IN_PROGRESS');
    expect(signal!.evidence).toContain('Progresso da obra: 42%.');
    expect(signal!.evidence).toContain('Obra em atraso: 7 dia(s).');
    expect(signal!.impact).toContain('obra que já está atrasada 7 dia(s)');
    expect(signal!.recommendedAction).toContain('Obra Centro');
  });

  it('connects an unassigned work order to its overdue project and asset', () => {
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-chain',
          title: 'Reparar equipamento',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: null,
          project_id: 'project-chain',
          asset_id: 'asset-chain',
          updated_at: new Date('2026-09-08T09:00:00.000Z'),
        },
      ],
      maintenancePlans: [],
      assets: [
        {
          id: 'asset-chain',
          name: 'Escavadora 01',
          code: 'ESC-01',
          serial_number: 'SN-01',
          status: 'ACTIVE',
          site_id: null,
        },
      ],
      sites: [],
      projects: [
        {
          id: 'project-chain',
          name: 'Obra Norte',
          status: 'IN_PROGRESS',
          progress: 55,
          end_date: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
      now,
    });

    const signal = result.signals.find((item) => item.source.resourceId === 'wo-chain');

    expect(signal).toBeDefined();
    expect(signal!.evidence).toContain('Obra: Obra Norte');
    expect(signal!.evidence).toContain('Ativo: Escavadora 01');
    expect(signal!.evidence).toContain('Código do ativo: ESC-01.');
    expect(signal!.evidence).toContain('Estado do ativo: ACTIVE.');
    expect(signal!.urgency).toContain('7 dia(s)');
    expect(signal!.impact).toContain('já está atrasada 7 dia(s)');
  });

  it('does not duplicate stale and unassigned decisions for the same work order', () => {
    const staleDate = new Date('2026-08-20T10:00:00.000Z');
    const now = new Date('2026-09-08T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-stale-assigned',
          title: 'Revisão operacional',
          status: 'OPEN',
          priority: 'HIGH',
          assigned_to_id: 'user-1',
          project_id: null,
          asset_id: null,
          updated_at: staleDate,
        },
        {
          id: 'wo-stale-unassigned',
          title: 'Substituição urgente',
          status: 'OPEN',
          priority: 'CRITICAL',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: staleDate,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now,
    });

    const assignedSignals = result.signals.filter(
      (item) => item.source.resourceId === 'wo-stale-assigned',
    );

    const unassignedSignals = result.signals.filter(
      (item) => item.source.resourceId === 'wo-stale-unassigned',
    );

    const aggregateHighPrioritySignal = result.signals.find(
      (item) => item.type === 'HIGH_PRIORITY_WORK_ORDER',
    );

    expect(aggregateHighPrioritySignal).toBeDefined();
    expect(assignedSignals).toHaveLength(1);
    expect(assignedSignals[0]!.type).toBe('STALE_OPEN_WORK_ORDER');

    expect(unassignedSignals).toHaveLength(1);
    expect(unassignedSignals[0]!.type).toBe('UNASSIGNED_HIGH_PRIORITY_WORK_ORDER');
  });

  it('does not create a stale signal before seven days without update', () => {
    const recentDate = new Date('2026-09-03T10:01:00.000Z');
    const now = new Date('2026-09-10T10:00:00.000Z');

    const result = engine.analyze({
      workOrders: [
        {
          id: 'wo-recent',
          title: 'Ordem recente',
          status: 'OPEN',
          priority: 'MEDIUM',
          assigned_to_id: null,
          project_id: null,
          asset_id: null,
          updated_at: recentDate,
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now,
    });

    expect(result.signals.some((item) => item.type === 'STALE_OPEN_WORK_ORDER')).toBe(false);
  });
});

describe('Operational Intelligence V4 contract', () => {
  it('exposes structured evidence for every generated signal', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      workOrders: [
        {
          id: 'v4-wo-1',
          title: 'Intervenção urgente',
          priority: 'HIGH',
          status: 'OPEN',
          asset_id: null,
          project_id: null,
          assigned_to_id: null,
          updated_at: new Date('2026-09-18T10:00:00Z'),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now: new Date('2026-09-18T12:00:00Z'),
    });

    const signal = result.signals[0];

    expect(signal).toBeDefined();
    expect(signal!.evidenceItems).toHaveLength(signal!.evidence.length);
    expect(signal!.decisionContext?.evidence).toEqual(signal!.evidenceItems);
  });

  it('exposes deterministic operational context and recommendations', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      workOrders: [
        {
          id: 'v4-wo-2',
          title: 'Ordem sem responsável',
          priority: 'CRITICAL',
          status: 'OPEN',
          asset_id: null,
          project_id: null,
          assigned_to_id: null,
          updated_at: new Date('2026-09-18T10:00:00Z'),
        },
      ],
      maintenancePlans: [],
      assets: [],
      sites: [],
      projects: [],
      now: new Date('2026-09-18T12:00:00Z'),
    });

    const signal = result.signals.find(
      (item) => item.type === 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
    );

    expect(signal).toBeDefined();
    expect(signal!.operationalContext?.workOrders.highPriorityOpen).toBeGreaterThan(0);
    expect(signal!.recommendations).toBeDefined();
    expect(signal!.decisionContext?.confidence).toBe(1);
  });

  it('preserves operational chains inside structured context', () => {
    const engine = new CooDecisionEngine();

    const result = engine.analyze({
      workOrders: [
        {
          id: 'v4-chain-wo',
          title: 'Intervenção equipamento',
          priority: 'HIGH',
          status: 'OPEN',
          asset_id: 'v4-chain-asset',
          project_id: 'v4-chain-project',
          assigned_to_id: null,
          updated_at: new Date('2026-09-18T10:00:00Z'),
        },
      ],
      maintenancePlans: [],
      assets: [
        {
          id: 'v4-chain-asset',
          name: 'Escavadora V4',
          code: 'V4-ESC-01',
          status: 'ACTIVE',
          site_id: 'v4-chain-site',
        },
      ],
      sites: [
        {
          id: 'v4-chain-site',
          name: 'Site V4',
          code: 'SITE-V4',
        },
      ],
      projects: [
        {
          id: 'v4-chain-project',
          name: 'Obra V4',
          code: 'V4-001',
          status: 'IN_PROGRESS',
          progress: 40,
          end_date: new Date('2026-09-10T00:00:00Z'),
        },
      ],
      maintenancePlans: [],
      now: new Date('2026-09-18T12:00:00Z'),
    });

    const signal = result.signals.find(
      (item) => item.source.resourceId === 'v4-chain-wo',
    );

    if (signal?.chain) {
      expect(signal.operationalContext?.chain).toEqual(signal.chain);
      expect(signal.decisionContext?.operationalContext.chain).toEqual(signal.chain);
    }
  });
});
