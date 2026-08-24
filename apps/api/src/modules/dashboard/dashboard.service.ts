import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async overview(orgId: string) {
    const [
      customers,
      sites,
      assets,
      openOrders,
      highPriority,
      activeAssets,
      overdueMaintenance,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.customers.count({
        where: { organization_id: orgId },
      }),

      this.prisma.sites.count({
        where: { organization_id: orgId },
      }),

      this.prisma.assets.count({
        where: { organization_id: orgId },
      }),

      this.prisma.work_orders.count({
        where: {
          organization_id: orgId,
          status: 'OPEN',
        },
      }),

      this.prisma.work_orders.count({
        where: {
          organization_id: orgId,
          priority: 'HIGH',
        },
      }),

      this.prisma.assets.count({
        where: {
          organization_id: orgId,
          status: 'ACTIVE',
        },
      }),

      this.prisma.maintenance_plans.count({
        where: {
          organization_id: orgId,
          status: 'ACTIVE',
          nextDue: {
            lt: new Date(),
          },
        },
      }),

      this.prisma.auditLog.findMany({
        where: {
          organizationId: orgId,
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
      }),
    ]);

    return {
      customers,
      sites,
      assets,
      workOrders: {
        open: openOrders,
        highPriority,
      },
      assetHealth: {
        active: activeAssets,
        total: assets,
      },
      maintenance: {
        overdue: overdueMaintenance,
      },
      recentActivity: recentAuditLogs,

      generatedAt: new Date(),
    };
  }
}
