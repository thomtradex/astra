import { IntelligenceService } from './intelligence.service';

describe('IntelligenceService', () => {
  it('passes organization-scoped project work order context to the COO engine', async () => {
    const prisma = {
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
    };

    const engine = {
      analyze: jest.fn().mockReturnValue({
        generatedAt: '2026-09-05T10:00:00.000Z',
        signalCount: 0,
        signals: [],
      }),
    };

    const service = new IntelligenceService(
      prisma as never,
      engine as never,
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
});
