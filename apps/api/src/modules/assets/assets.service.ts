import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@astra/database';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

type AssetModel = Prisma.AssetGetPayload<Record<string, never>>;

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll(
    organizationId: string,
  ): Promise<AssetModel[]> {
    return this.prisma.asset.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(
    id: string,
    organizationId: string,
  ): Promise<AssetModel | null> {
    return this.prisma.asset.findUnique({
      where: {
        id,
        organizationId,
      },
    });
  }

  create(
    dto: CreateAssetDto,
    organizationId: string,
  ) : Promise<AssetModel> {
    return this.prisma.asset.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateAssetDto,
    organizationId: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset || asset.organizationId !== organizationId) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.asset.update({
      where: { id },
      data: dto,
    });
  }

  async remove(
    id: string,
    organizationId: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset || asset.organizationId !== organizationId) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
