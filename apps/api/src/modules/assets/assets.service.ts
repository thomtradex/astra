import { randomUUID } from 'node:crypto';


import { Prisma } from '@astra/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AssetModel = Prisma.assetsGetPayload<Record<string, never>>;

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService?: BillingService,
  ) {}

  findAll(organization_id: string): Promise<AssetModel[]> {
    return this.prisma.assets.findMany({
      where: {
        organization_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  findOne(id: string, organization_id: string): Promise<AssetModel | null> {
    return this.prisma.assets.findUnique({
      where: {
        id,
        organization_id,
      },
    });
  }

  async create(dto: CreateAssetDto, organization_id: string): Promise<AssetModel> {
    if (this.billingService) {
      const currentUsage = await this.prisma.assets.count({
        where: {
          organization_id: organization_id,
        },
      });

      await this.billingService.assertLimit(
        organization_id,
        'assets',
        currentUsage,
      );
    }

    return this.prisma.assets.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        code: dto.code,
        serial_number: dto.serialNumber,
        description: dto.description,
        status: dto.status,
        site_id: dto.siteId,
        organization_id,
        updated_at: new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateAssetDto, organization_id: string) {
    const asset = await this.prisma.assets.findUnique({
      where: {
        id,
        organization_id,
      },
    });

    if (!asset || asset.organization_id !== organization_id) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.assets.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organization_id: string) {
    const asset = await this.prisma.assets.findUnique({
      where: {
        id,
        organization_id,
      },
    });

    if (!asset || asset.organization_id !== organization_id) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.assets.delete({
      where: { id },
    });
  }
}
