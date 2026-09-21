/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { DailyBriefingService } from './daily-briefing.service';
import { IntelligenceService } from './intelligence.service';
import type { IntelligenceSignal } from './intelligence.types';

describe('IntelligenceService', () => {
  const createAiDependencies = () => ({
    aiService: {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED' as const,
        summary: 'Análise AI determinística.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'deterministic',
      }),
    },
    aiContextBuilder: {
      build: jest.fn().mockReturnValue(null),
    },
  });

  it('passes organization-scoped project work order context to the COO engine', async () => {
    const prisma: any = {
      work_orders: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'wo-1',
            title: 'Resolver infiltração',
            status: 'OPEN',
            priority: 'HIGH',
            assigned_to_id: null,
            project_id: 'project-1',
            asset_id: null,
          },
        ]),
      },
      maintenance_plans: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      assets: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      sites: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      projects: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'project-1',
            name: 'Obra Centro',
            status: 'IN_PROGRESS',
            progress: 60,
            end_date: new Date('2026-08-31T10:00:00.000Z'),
          },
        ]),
      },
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T10:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const dailyBriefingService = new DailyBriefingService();
    const aiService: any = {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED',
        summary: 'Análise AI determinística.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'deterministic',
      }),
    };
    const aiContextBuilder: any = {
      build: jest.fn().mockReturnValue({
        signalId: 'signal-test',
        signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
        severity: 'HIGH',
        title: 'Signal test',
        explanation: 'Signal test',
        urgency: 'high',
        impact: 'impact',
        recommendedAction: 'action',
        evidence: [],
        operationalContext: {
          workOrders: {
            open: 0,
            highPriorityOpen: 0,
            unassignedHighPriority: 0,
          },
        },
        recommendations: [],
        decisionContext: {
          evidence: [],
          operationalContext: {
            workOrders: {
              open: 0,
              highPriorityOpen: 0,
              unassignedHighPriority: 0,
            },
          },
          recommendations: [],
          confidence: 1,
        },
      }),
    };

    const service = new IntelligenceService(
      prisma,
      engine,
      dailyBriefingService,
      aiService,
      aiContextBuilder,
    );

    await service.analyze('org-1');

    expect(prisma.work_orders.findMany).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assigned_to_id: true,
        project_id: true,
        asset_id: true,
        updated_at: true,
      },
    });

    expect(prisma.assets.findMany).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
      },
      select: {
        id: true,
        name: true,
        code: true,
        serial_number: true,
        status: true,
        site_id: true,
      },
    });

    expect(prisma.sites.findMany).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    expect(engine.analyze).toHaveBeenCalledWith(
      expect.objectContaining({
        workOrders: [
          expect.objectContaining({
            project_id: 'project-1',
          }),
        ],
        assets: [],
        sites: [],
        projects: [
          expect.objectContaining({
            id: 'project-1',
          }),
        ],
      }),
    );
  });
  it('propagates the V4 intelligence contract into the daily briefing', async () => {
    const prisma: any = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: { findMany: jest.fn().mockResolvedValue([]) },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const evidenceItems = [
      {
        id: 'evidence-1',
        kind: 'FACT',
        label: 'Prioridade',
        value: 'HIGH',
        source: {
          resource: 'work_orders',
          resourceId: 'wo-v4',
        },
      },
    ];

    const operationalContext = {
      workOrders: {
        open: 2,
        highPriorityOpen: 1,
        unassignedHighPriority: 1,
      },
    };

    const recommendations = [
      {
        id: 'recommendation-1',
        type: 'ASSIGN',
        title: 'Atribuir ordem',
        explanation: 'A ordem de alta prioridade está sem responsável.',
        resource: 'work_orders',
        resourceId: 'wo-v4',
        executable: true,
      },
    ];

    const decisionContext = {
      evidence: evidenceItems,
      operationalContext,
      recommendations,
      confidence: 1,
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 1,
        signals: [
          {
            id: 'signal-v4',
            type: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
            severity: 'HIGH',
            title: 'Ordem sem responsável',
            explanation: 'Existe uma ordem de alta prioridade sem responsável.',
            evidence: ['A ordem está sem responsável.'],
            evidenceItems,
            urgency: 'NOW',
            impact: 'HIGH',
            operationalContext,
            recommendations,
            decisionContext,
            recommendedAction: 'Atribuir responsável',
            decision: {
              type: 'REVIEW',
              label: 'Atribuir',
            },
            status: 'OPEN',
            timestamp: '2026-09-05T12:00:00.000Z',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-v4',
            },
          },
        ],
      }),
    };

    const dailyBriefingService = new DailyBriefingService();
    const result = await new IntelligenceService(
      prisma,
      engine,
      dailyBriefingService,
      createAiDependencies().aiService,
      createAiDependencies().aiContextBuilder,
    ).analyze('org-1');

    const priority = result.daily.priorities[0];

    expect(priority).toBeDefined();
    expect(priority?.evidenceItems).toEqual(evidenceItems);
    expect(priority?.operationalContext).toEqual(operationalContext);
    expect(priority?.recommendations).toEqual(recommendations);
    expect(priority?.decisionContext).toEqual(decisionContext);
  });

  it('builds decision history from COO audit records', async () => {
    const prisma = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'wo-1',
            assigned_to_id: 'user-2',
            status: 'OPEN',
          },
        ]),
      },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-1',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-1',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'ASSIGN_WORK_ORDER',
              assignedToId: 'user-2',
              message: 'Ordem atribuída com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
          {
            id: 'decision-2',
            action: 'ACCESS_DENIED',
            resource: 'work_orders',
            resourceId: 'wo-2',
            createdAt: new Date('2026-09-05T09:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'DENIED',
              actionType: 'ASSIGN_WORK_ORDER',
              message: 'Ação não autorizada.',
            },
            actor: null,
          },
        ]),
      },
    };

    const auditFindMany = prisma.auditLog.findMany;

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(auditFindMany).toHaveBeenCalled();
    const auditQuery = auditFindMany.mock.calls[0]?.[0] as {
      where?: {
        action?: {
          in?: string[];
        };
      };
    };

    expect(auditQuery.where?.action?.in).toEqual(['CREATE', 'UPDATE', 'DELETE', 'ACCESS_DENIED']);

    expect(result.decisionHistory).toHaveLength(2);
    expect(result.decisionHistory[0]).toEqual({
      id: 'decision-1',
      timestamp: '2026-09-05T10:00:00.000Z',
      status: 'EXECUTED',
      actionType: 'ASSIGN_WORK_ORDER',
      resource: 'work_orders',
      resourceId: 'wo-1',
      actor: {
        id: 'user-1',
        name: 'Ana Silva',
        email: 'operator@astra.test',
      },
      message: 'Ordem atribuída com sucesso.',
      verification: {
        status: 'VERIFIED',
        label: 'Resultado confirmado',
        explanation:
          'O responsável definido pela decisão está atualmente atribuído à ordem de trabalho.',
        checkedAt: '2026-09-05T12:00:00.000Z',
      },
    });
    expect(result.decisionHistory[1]?.status).toBe('DENIED');
    expect(result.decisionHistory[1]?.actor).toBeUndefined();
  });

  it('verifies an executed project status decision against the current project state', async () => {
    const prisma = {
      projects: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'project-1',
            name: 'Projeto principal',
            status: 'ON_HOLD',
            progress: 50,
            end_date: null,
          },
        ]),
      },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-project-1',
            action: 'UPDATE',
            resource: 'projects',
            resourceId: 'project-1',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'SET_PROJECT_STATUS',
              status: 'ON_HOLD',
              message: 'Projeto colocado em pausa com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
        ]),
      },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(result.decisionHistory).toHaveLength(1);
    expect(result.decisionHistory[0]?.verification).toEqual({
      status: 'VERIFIED',
      label: 'Resultado confirmado',
      explanation:
        'O estado definido pela decisão está atualmente aplicado ao projeto.',
      checkedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('verifies an executed maintenance decision against the current next due date', async () => {
    const nextDue = '2026-10-15T09:00:00.000Z';

    const prisma = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      maintenance_plans: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'maintenance-1',
            plan: 'Inspeção preventiva',
            status: 'ACTIVE',
            nextDue: new Date(nextDue),
            assetId: 'asset-1',
          },
        ]),
      },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-maintenance-1',
            action: 'UPDATE',
            resource: 'maintenance_plans',
            resourceId: 'maintenance-1',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'UPDATE_MAINTENANCE',
              nextDue,
              message: 'Manutenção reagendada com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
        ]),
      },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(result.decisionHistory).toHaveLength(1);
    expect(result.decisionHistory[0]?.verification).toEqual({
      status: 'VERIFIED',
      label: 'Resultado confirmado',
      explanation:
        'A data definida pela decisão está atualmente aplicada ao plano de manutenção.',
      checkedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('marks an executed assignment as still open when the work order remains unassigned', async () => {
    const prisma = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'wo-open',
            assigned_to_id: null,
            status: 'OPEN',
          },
        ]),
      },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-open',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-open',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'ASSIGN_WORK_ORDER',
              assignedToId: 'user-2',
              message: 'Ordem atribuída com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
        ]),
      },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(result.decisionHistory[0]?.verification).toEqual({
      status: 'STILL_OPEN',
      label: 'Situação continua aberta',
      explanation:
        'A ordem de trabalho não está atualmente atribuída ao responsável definido pela decisão.',
      checkedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('does not verify an executed assignment when a different user is currently assigned', async () => {
    const prisma = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'wo-different-user',
            assigned_to_id: 'user-3',
            status: 'OPEN',
          },
        ]),
      },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-different-user',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-different-user',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'ASSIGN_WORK_ORDER',
              assignedToId: 'user-2',
              message: 'Ordem atribuída com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
        ]),
      },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(result.decisionHistory[0]?.verification).toEqual({
      status: 'STILL_OPEN',
      label: 'Situação continua aberta',
      explanation:
        'A ordem de trabalho não está atualmente atribuída ao responsável definido pela decisão.',
      checkedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('does not verify an executed assignment when the decision has no target user', async () => {
    const prisma = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'wo-missing-target',
            assigned_to_id: 'user-2',
            status: 'OPEN',
          },
        ]),
      },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'decision-missing-target',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-missing-target',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'ASSIGN_WORK_ORDER',
              message: 'Ordem atribuída com sucesso.',
            },
            actor: {
              id: 'user-1',
              email: 'operator@astra.test',
              firstName: 'Ana',
              lastName: 'Silva',
            },
          },
        ]),
      },
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const result = await new IntelligenceService(
      prisma as any,
      engine,
      new DailyBriefingService(),
    ).analyze('org-1');

    expect(result.decisionHistory[0]?.verification).toEqual({
      status: 'NOT_VERIFIED',
      label: 'Não foi possível verificar',
      explanation: 'A decisão não contém o responsável que deveria ter sido atribuído.',
      checkedAt: '2026-09-05T12:00:00.000Z',
    });
  });

  it('measures COO decision outcomes', async () => {
    const prisma: any = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: { findMany: jest.fn().mockResolvedValue([]) },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'a1',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-x',
            createdAt: new Date('2026-09-05T10:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'EXECUTED',
              actionType: 'ASSIGN_WORK_ORDER',
            },
          },
          {
            id: 'a2',
            action: 'ACCESS_DENIED',
            resource: 'work_orders',
            resourceId: 'wo-y',
            createdAt: new Date('2026-09-05T09:30:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'DENIED',
              actionType: 'ASSIGN_WORK_ORDER',
            },
          },
          {
            id: 'a3',
            action: 'UPDATE',
            resource: 'work_orders',
            resourceId: 'wo-y',
            createdAt: new Date('2026-09-05T09:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'FAILED',
              actionType: 'ASSIGN_WORK_ORDER',
            },
          },
          {
            id: 'a4',
            action: 'UPDATE',
            resource: 'projects',
            resourceId: 'wo-x',
            createdAt: new Date('2026-09-05T11:00:00.000Z'),
            metadata: {
              type: 'coo_action',
              source: 'coo',
              outcomeStatus: 'FAILED',
              actionType: 'SET_PROJECT_STATUS',
            },
          },
        ]),
      },
    };
    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 1,
        signals: [
          {
            id: 's1',
            type: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
            severity: 'HIGH',
            title: 'WO',
            explanation: 'WO',
            evidence: [],
            urgency: 'NOW',
            impact: 'HIGH',
            recommendedAction: 'Atribuir',
            decision: { type: 'REVIEW', label: 'Atribuir' },
            action: {
              type: 'ASSIGN_WORK_ORDER',
              resource: 'work_orders',
              resourceId: 'wo-x',
              requiresAuthorization: true,
            },
            status: 'OPEN',
            timestamp: '2026-09-05T12:00:00.000Z',
            source: { resource: 'work_orders', resourceId: 'wo-x' },
          },
        ],
      }),
    };
    const dailyBriefingService = new DailyBriefingService();
    const result = await new IntelligenceService(
      prisma,
      engine,
      dailyBriefingService,
      { analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED',
        summary: 'Análise AI determinística.',
        rationale: 'Contexto operacional analisado.',
        confidence: 1,
        provider: 'deterministic',
      }) },
      { build: jest.fn().mockReturnValue(null) },
    ).analyze(
      'org-1',
    );
    expect(result.decisionMetrics).toEqual({ executed: 1, denied: 1, failed: 2 });
    const firstSignal = result.signals[0];
    expect(firstSignal).toBeDefined();
    expect(firstSignal?.lastAction?.status).toBe('EXECUTED');
  });

  it('enriches actionable signals with AI analysis', async () => {
    const prisma: any = {
      projects: { findMany: jest.fn().mockResolvedValue([]) },
      work_orders: { findMany: jest.fn().mockResolvedValue([]) },
      maintenance_plans: { findMany: jest.fn().mockResolvedValue([]) },
      assets: { findMany: jest.fn().mockResolvedValue([]) },
      sites: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const evidenceItems = [
      {
        id: 'evidence-ai-1',
        kind: 'FACT',
        label: 'Prioridade',
        value: 'HIGH',
        source: {
          resource: 'work_orders',
          resourceId: 'wo-ai-1',
        },
      },
    ];

    const operationalContext = {
      workOrders: {
        open: 1,
        highPriorityOpen: 1,
        unassignedHighPriority: 1,
      },
    };

    const recommendations = [
      {
        id: 'recommendation-ai-1',
        type: 'ASSIGN',
        title: 'Atribuir ordem',
        explanation: 'A ordem necessita de responsável.',
        resource: 'work_orders',
        resourceId: 'wo-ai-1',
        executable: true,
      },
    ];

    const decisionContext = {
      evidence: evidenceItems,
      operationalContext,
      recommendations,
      confidence: 0.95,
    };

    const engine: any = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T12:00:00.000Z',
        signalCount: 1,
        signals: [
          {
            id: 'signal-ai-1',
            type: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
            severity: 'HIGH',
            title: 'Ordem sem responsável',
            explanation: 'Existe uma ordem de alta prioridade sem responsável.',
            evidence: ['A ordem está sem responsável.'],
            evidenceItems,
            urgency: 'Alta',
            impact: 'Pode atrasar a operação.',
            operationalContext,
            recommendations,
            decisionContext,
            recommendedAction: 'Atribuir responsável.',
            decision: {
              type: 'REVIEW',
              label: 'Rever decisão',
            },
            action: {
              type: 'ASSIGN_WORK_ORDER',
              resource: 'work_orders',
              resourceId: 'wo-ai-1',
              requiresAuthorization: true,
            },
            status: 'OPEN',
            timestamp: '2026-09-05T12:00:00.000Z',
            source: {
              resource: 'work_orders',
              resourceId: 'wo-ai-1',
            },
          },
        ],
      }),
    };

    const aiService = {
      analyze: jest.fn().mockResolvedValue({
        status: 'GENERATED',
        summary: 'A ordem necessita de responsável.',
        rationale: 'Existe uma ordem de alta prioridade sem responsável.',
        recommendedRecommendationId: 'recommendation-ai-1',
        confidence: 0.95,
        provider: 'deterministic',
      }),
    };

    const aiContextBuilder = {
      build: jest.fn().mockImplementation((signal: IntelligenceSignal) => ({
        signalId: signal.id,
        signalType: signal.type,
        severity: signal.severity,
        title: signal.title,
        explanation: signal.explanation,
        urgency: signal.urgency,
        impact: signal.impact,
        recommendedAction: signal.recommendedAction,
        evidence: signal.evidenceItems,
        operationalContext: signal.operationalContext,
        recommendations: signal.recommendations,
        decisionContext: signal.decisionContext,
      })),
    };

    const service = new IntelligenceService(
      prisma,
      engine,
      new DailyBriefingService(),
      aiService,
      aiContextBuilder,
    );

    const result = await service.analyze('org-1');

    expect(aiContextBuilder.build).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'signal-ai-1',
      }),
    );

    expect(aiService.analyze).toHaveBeenCalledWith(
      expect.objectContaining({
        signalId: 'signal-ai-1',
        signalType: 'UNASSIGNED_HIGH_PRIORITY_WORK_ORDER',
      }),
    );

    expect(result.signals[0]?.aiAnalysis).toEqual({
      status: 'GENERATED',
      summary: 'A ordem necessita de responsável.',
      rationale: 'Existe uma ordem de alta prioridade sem responsável.',
      recommendedRecommendationId: 'recommendation-ai-1',
      confidence: 0.95,
      provider: 'deterministic',
    });
  });

});
