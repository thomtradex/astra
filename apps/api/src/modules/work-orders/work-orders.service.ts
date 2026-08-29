import { randomUUID } from 'crypto';

import { Prisma } from '@astra/database';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.work_orders.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async create(organizationId: string, dto: CreateWorkOrderDto) {
    return this.prisma.work_orders.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        asset_id: dto.assetId,
        assigned_to_id: dto.assignedToId,
        organization_id: organizationId,
        updated_at: new Date(),
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    return this.prisma.work_orders.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Prisma.work_ordersUpdateManyMutationInput,
  ) {
    return this.prisma.work_orders.updateMany({
      where: {
        id,
        organization_id: organizationId,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    return this.prisma.work_orders.deleteMany({
      where: {
        id,
        organization_id: organizationId,
      },
    });
  }
}
