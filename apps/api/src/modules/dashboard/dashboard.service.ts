import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { IntelligenceService } from '../intelligence/intelligence.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  private getMonthStart(now = new Date()): Date {
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return monthStart;
  }

  async overview(orgId: string, includeIntelligence = false) {
    const [
      customers,
      sites,
      assets,
      openOrders,
      workOrdersThisMonth,
      highPriority,
      criticalOpen,
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
          created_at: { gte: this.getMonthStart() },
        },
      }),

      this.prisma.work_orders.count({
        where: {
          organization_id: orgId,
          status: 'OPEN',
          priority: { in: ['HIGH', 'CRITICAL'] },
        },
      }),

      this.prisma.work_orders.count({
        where: {
          organization_id: orgId,
          status: 'OPEN',
          priority: 'CRITICAL',
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

    const intelligence = includeIntelligence
      ? await this.intelligenceService.analyze(orgId)
      : undefined;

    return {
      customers,
      sites,
      assets,
      workOrders: {
        open: openOrders,
        thisMonth: workOrdersThisMonth,
        highPriority,
        criticalOpen,
      },
      assetHealth: {
        active: activeAssets,
        total: assets,
      },
      maintenance: {
        overdue: overdueMaintenance,
      },
      recentActivity: recentAuditLogs,
      ...(intelligence ? { intelligence } : {}),

      generatedAt: new Date(),
    };
  }
}
