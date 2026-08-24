import { PrismaService } from '../../prisma/prisma.service';

import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  type DashboardPrismaMock = {
    customers: {
      count: jest.Mock<Promise<number>>;
    };
    sites: {
      count: jest.Mock<Promise<number>>;
    };
    assets: {
      count: jest.Mock<Promise<number>>;
    };
    work_orders: {
      count: jest.Mock<Promise<number>>;
    };
    maintenance_plans: {
      count: jest.Mock<Promise<number>>;
    };
    auditLog: {
      findMany: jest.Mock<
        Promise<
          Array<{
            id: string;
            action: 'UPDATE';
            resource: string;
            createdAt: Date;
          }>
        >
      >;
    };
  };

  const prisma: DashboardPrismaMock = {
    customers: {
      count: jest.fn<Promise<number>, []>(),
    },
    sites: {
      count: jest.fn<Promise<number>, []>(),
    },
    assets: {
      count: jest.fn<Promise<number>, []>(),
    },
    work_orders: {
      count: jest.fn<Promise<number>, []>(),
    },
    maintenance_plans: {
      count: jest.fn<Promise<number>, []>(),
    },
    auditLog: {
      findMany: jest.fn<
        Promise<
          Array<{
            id: string;
            action: 'UPDATE';
            resource: string;
            createdAt: Date;
          }>
        >,
        []
      >(),
    },
  };

  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  it('returns dashboard overview scoped to organization', async () => {
    prisma.customers.count.mockResolvedValue(10);
    prisma.sites.count.mockResolvedValue(4);
    prisma.assets.count.mockResolvedValue(25);
    prisma.work_orders.count.mockResolvedValueOnce(8).mockResolvedValueOnce(2);
    prisma.assets.count.mockResolvedValueOnce(25).mockResolvedValueOnce(20);
    prisma.maintenance_plans.count.mockResolvedValue(3);
    prisma.auditLog.findMany.mockResolvedValue([
      {
        id: 'audit-1',
        action: 'UPDATE',
        resource: 'asset',
        createdAt: new Date(),
      },
    ]);

    const result: {
      customers: number;
      sites: number;
      assets: number;
      workOrders: {
        open: number;
        highPriority: number;
      };
      assetHealth: {
        active: number;
        total: number;
      };
      maintenance: {
        overdue: number;
      };
      recentActivity: Array<{
        id: string;
        action: string;
        resource: string;
        createdAt: Date;
      }>;
      generatedAt: Date;
    } = await service.overview('org-1');

    expect(result.customers).toBe(10);
    expect(result.sites).toBe(4);
    expect(result.assets).toBe(25);
    expect(result.workOrders.open).toBe(8);
    expect(result.workOrders.highPriority).toBe(2);
    expect(result.assetHealth.active).toBe(20);
    expect(result.assetHealth.total).toBe(25);
    expect(result.maintenance.overdue).toBe(3);
    expect(result.recentActivity).toHaveLength(1);

    expect(prisma.customers.count).toHaveBeenCalledWith({
      where: { organization_id: 'org-1' },
    });

    expect(prisma.sites.count).toHaveBeenCalledWith({
      where: { organization_id: 'org-1' },
    });

    expect(prisma.assets.count).toHaveBeenCalledWith({
      where: { organization_id: 'org-1' },
    });

    expect(prisma.work_orders.count).toHaveBeenNthCalledWith(1, {
      where: {
        organization_id: 'org-1',
        status: 'OPEN',
      },
    });

    expect(prisma.work_orders.count).toHaveBeenNthCalledWith(2, {
      where: {
        organization_id: 'org-1',
        priority: 'HIGH',
      },
    });

    expect(prisma.assets.count).toHaveBeenNthCalledWith(2, {
      where: {
        organization_id: 'org-1',
        status: 'ACTIVE',
      },
    });

    expect(prisma.maintenance_plans.count).toHaveBeenCalledWith({
      where: {
        organization_id: 'org-1',
        status: 'ACTIVE',
        nextDue: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          lt: expect.any(Date),
        },
      },
    });

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        organizationId: 'org-1',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        action: true,
        resource: true,
        createdAt: true,
      },
    });

    expect(result.generatedAt).toBeInstanceOf(Date);
  });
});
