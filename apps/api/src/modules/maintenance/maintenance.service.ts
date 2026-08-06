import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@astra/database';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';

type MaintenancePlanModel =
  Prisma.MaintenancePlanGetPayload<Record<string, never>>;

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll(
    organizationId: string,
  ): Promise<MaintenancePlanModel[]> {
    return this.prisma.maintenancePlan.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        nextDue: 'asc',
      },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<MaintenancePlanModel> {
    const plan = await this.prisma.maintenancePlan.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    return plan;
  }

  async create(
    dto: CreateMaintenancePlanDto,
    organizationId: string,
  ): Promise<MaintenancePlanModel> {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: dto.assetId,
        organizationId,
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.maintenancePlan.create({
      data: {
        plan: dto.plan,
        assetId: dto.assetId,
        frequency: dto.frequency,
        nextDue: new Date(dto.nextDue),
        organizationId,
      },
    });
  }
}
