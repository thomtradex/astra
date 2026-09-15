import { DailyBriefingService } from './daily-briefing.service';
import { IntelligenceService } from './intelligence.service';

describe('IntelligenceService', () => {
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
    const service = new IntelligenceService(prisma, engine, dailyBriefingService);

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
    const result = await new IntelligenceService(prisma, engine, dailyBriefingService).analyze(
      'org-1',
    );
    expect(result.decisionMetrics).toEqual({ executed: 1, denied: 1, failed: 1 });
    const firstSignal = result.signals[0];
    expect(firstSignal).toBeDefined();
    expect(firstSignal?.lastAction?.status).toBe('EXECUTED');
  });
});
