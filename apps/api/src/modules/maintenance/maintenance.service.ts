import { randomUUID } from 'node:crypto';


import { Prisma } from '@astra/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';

type MaintenancePlanModel = Prisma.maintenance_plansGetPayload<Record<string, never>>;

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService?: BillingService,
  ) {}

  findAll(organization_id: string): Promise<MaintenancePlanModel[]> {
    return this.prisma.maintenance_plans.findMany({
      where: {
        organization_id,
      },
      orderBy: {
        nextDue: 'asc',
      },
    });
  }

  async findOne(id: string, organization_id: string): Promise<MaintenancePlanModel> {
    const plan = await this.prisma.maintenance_plans.findFirst({
      where: {
        id,
        organization_id,
      },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    return plan;
  }

  async update(id: string, dto: UpdateMaintenancePlanDto, organization_id: string) {
    const plan = await this.prisma.maintenance_plans.findFirst({
      where: {
        id,
        organization_id,
      },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    return this.prisma.maintenance_plans.update({
      where: {
        id,
      },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organization_id: string) {
    const plan = await this.prisma.maintenance_plans.findFirst({
      where: {
        id,
        organization_id,
      },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    return this.prisma.maintenance_plans.delete({
      where: {
        id,
      },
    });
  }

  async create(
    dto: CreateMaintenancePlanDto,
    organization_id: string,
  ): Promise<MaintenancePlanModel> {
    if (this.billingService) {
          const currentUsage = await this.prisma.maintenance_plans.count({
            where: { organization_id: organization_id },
        });

        await this.billingService.assertLimit(
            organization_id,
            'maintenancePlans',
            currentUsage,
        );

    }


    const asset = await this.prisma.assets.findFirst({
      where: {
        id: dto.assetId,
        organization_id,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.maintenance_plans.create({
      data: {
        id: randomUUID(),
        plan: dto.plan,
        assetId: dto.assetId,
        frequency: dto.frequency,
        nextDue: new Date(dto.nextDue),
        organization_id,
        updated_at: new Date(),
      },
    });
  }
}
