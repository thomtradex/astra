import { randomUUID } from 'crypto';


import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(
    private prisma: PrismaService,
    private billingService?: BillingService,
  ) {}

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
    const { projectId } = dto;

    if (projectId) {
      const project = await this.prisma.projects.findFirst({
        where: {
          id: projectId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!project) {
        throw new Error('Project not found for this organization');
      }
    }

    if (dto.assetId) {
      const asset = await this.prisma.assets.findFirst({
        where: {
          id: dto.assetId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!asset) {
        throw new Error('Asset not found for this organization');
      }
    }

    const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        if (this.billingService) {
          const currentUsage = await this.prisma.work_orders.count({
              where: {
                organization_id: organizationId,
                created_at: { gte: monthStart },
            },
        });

        await this.billingService.assertLimit(
            organizationId,
            'workOrdersPerMonth',
            currentUsage,
        );


        }


    return this.prisma.work_orders.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        asset_id: dto.assetId,
        assigned_to_id: dto.assignedToId,
        project_id: projectId,
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
    data: UpdateWorkOrderDto,
  ) {
    const existing = await this.prisma.work_orders.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Work order not found');
    }

    if (data.projectId) {
      const project = await this.prisma.projects.findFirst({
        where: {
          id: data.projectId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!project) {
        throw new Error('Project not found for this organization');
      }
    }

    if (data.assetId) {
      const asset = await this.prisma.assets.findFirst({
        where: {
          id: data.assetId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!asset) {
        throw new Error('Asset not found for this organization');
      }
    }

    if (data.assignedToId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found for this organization');
      }
    }

    return this.prisma.work_orders.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        asset_id: data.assetId,
        assigned_to_id: data.assignedToId,
        project_id: data.projectId,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const existing = await this.prisma.work_orders.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Work order not found');
    }

    return this.prisma.work_orders.delete({
      where: {
        id,
      },
    });
  }
}
