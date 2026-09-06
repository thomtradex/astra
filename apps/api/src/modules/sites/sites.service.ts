import { randomUUID } from 'node:crypto';


import { Prisma } from '@astra/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

type SiteModel = Prisma.sitesGetPayload<Record<string, never>>;

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService?: BillingService,
  ) {}

  findAll(organization_id: string): Promise<SiteModel[]> {
    return this.prisma.sites.findMany({
      where: {
        organization_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  findOne(id: string, organization_id: string): Promise<SiteModel | null> {
    return this.prisma.sites.findUnique({
      where: {
        id,
        organization_id,
      },
    });
  }

  async create(dto: CreateSiteDto, organization_id: string): Promise<SiteModel> {
    if (this.billingService) {
      const currentUsage = await this.prisma.sites.count({
        where: {
          organization_id: organization_id,
        },
      });

      await this.billingService.assertLimit(
        organization_id,
        'sites',
        currentUsage,
      );
    }

    return this.prisma.sites.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        code: dto.code,
        organization_id,
        updated_at: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateSiteDto, organization_id: string) {
    const site = await this.prisma.sites.findUnique({
      where: { id },
    });

    if (!site || site.organization_id !== organization_id) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.sites.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organization_id: string) {
    const site = await this.prisma.sites.findUnique({
      where: { id },
    });

    if (!site || site.organization_id !== organization_id) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.sites.delete({
      where: { id },
    });
  }
}
