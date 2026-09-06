import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  findAll(organizationId: string) {
    return this.prisma.projects.findMany({
      where: { organization_id: organizationId },
      include: {
        customer: true,
        site: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const project = await this.prisma.projects.findFirst({
      where: { id, organization_id: organizationId },
      include: {
        customer: true,
        site: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(dto: CreateProjectDto, organizationId: string) {
    if (dto.customerId) {
      const customer = await this.prisma.customers.findFirst({
        where: {
          id: dto.customerId,
          organization_id: organizationId,
        },
        select: { id: true },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (dto.siteId) {
      const site = await this.prisma.sites.findFirst({
        where: {
          id: dto.siteId,
          organization_id: organizationId,
        },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }
    }

    const currentUsage = await this.prisma.projects.count({
      where: { organization_id: organizationId },
    });

    await this.billingService.assertLimit(
      organizationId,
      'projects',
      currentUsage,
    );

    return this.prisma.projects.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        customer_id: dto.customerId,
        site_id: dto.siteId,
        status: dto.status ?? 'PLANNING',
        progress: dto.progress ?? 0,
        budget_cents: dto.budgetCents,
        start_date: dto.startDate ? new Date(dto.startDate) : undefined,
        end_date: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        customer: true,
        site: true,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto, organizationId: string) {
    await this.findOne(id, organizationId);

    if (dto.customerId) {
      const customer = await this.prisma.customers.findFirst({
        where: {
          id: dto.customerId,
          organization_id: organizationId,
        },
        select: { id: true },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (dto.siteId) {
      const site = await this.prisma.sites.findFirst({
        where: {
          id: dto.siteId,
          organization_id: organizationId,
        },
        select: { id: true },
      });

      if (!site) {
        throw new NotFoundException('Site not found');
      }
    }

    return this.prisma.projects.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        customer_id: dto.customerId,
        site_id: dto.siteId,
        status: dto.status,
        progress: dto.progress,
        budget_cents: dto.budgetCents,
        start_date: dto.startDate ? new Date(dto.startDate) : undefined,
        end_date: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        customer: true,
        site: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.projects.delete({
      where: { id },
    });
  }
}
