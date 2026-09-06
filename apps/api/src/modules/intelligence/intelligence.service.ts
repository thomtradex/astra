import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CooDecisionEngine } from './engines/intelligence.engine';

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: CooDecisionEngine,
  ) {}

  async analyze(organizationId: string) {
    const [
      workOrders,
      maintenancePlans,
      assets,
      sites,
      projects,
    ] = await Promise.all([
        this.prisma.work_orders.findMany({
          where: {
            organization_id: organizationId,
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
        }),

        this.prisma.maintenance_plans.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            plan: true,
            status: true,
            nextDue: true,
            assetId: true,
          },
        }),

        this.prisma.assets.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            code: true,
            serial_number: true,
            status: true,
            site_id: true,
          },
        }),

        this.prisma.sites.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            code: true,
          },
        }),

        this.prisma.projects.findMany({
          where: {
            organization_id: organizationId,
          },
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
            end_date: true,
          },
        }),
      ]);

    return this.engine.analyze({
      workOrders,
      maintenancePlans,
      assets,
      sites,
      projects,
    });
  }
}
