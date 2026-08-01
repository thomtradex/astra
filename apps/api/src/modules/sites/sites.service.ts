import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@astra/database';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

type SiteModel = Prisma.SiteGetPayload<Record<string, never>>;

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  findAll(
    organizationId: string,
  ): Promise<SiteModel[]> {
    return this.prisma.site.findMany({
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
  ): Promise<SiteModel | null> {
    return this.prisma.site.findUnique({
      where: {
        id,
        organizationId,
      },
    });
  }

  create(
    dto: CreateSiteDto,
    organizationId: string,
  ) : Promise<SiteModel> {
    return this.prisma.site.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateSiteDto,
    organizationId: string,
  ) {
    const site = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!site || site.organizationId !== organizationId) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.site.update({
      where: { id },
      data: dto,
    });
  }

  async remove(
    id: string,
    organizationId: string,
  ) {
    const site = await this.prisma.site.findUnique({
      where: { id },
    });

    if (!site || site.organizationId !== organizationId) {
      throw new NotFoundException('Site not found');
    }

    return this.prisma.site.delete({
      where: { id },
    });
  }
}
