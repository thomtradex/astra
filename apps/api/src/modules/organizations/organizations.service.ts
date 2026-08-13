import { buildPaginatedResult, normalizePagination, PaginatedResult } from '@astra/shared';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  /* istanbul ignore next */
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryOrganizationsDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<PrismaService['organization']['findMany']>>[number]>
  > {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const where = query.search
      ? {
          OR: [
            {
              name: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
            {
              slug: {
                contains: query.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return buildPaginatedResult(organizations, total, page, limit);
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async create(dto: CreateOrganizationDto) {
    const slug = dto.slug.trim().toLowerCase();

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name.trim(),
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);

    const slug = dto.slug?.trim().toLowerCase();

    if (slug) {
      const existing = await this.prisma.organization.findFirst({
        where: {
          slug,
          NOT: { id },
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException('Organization slug already exists');
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(slug !== undefined ? { slug } : {}),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async setActive(id: string, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: { is_active: isActive },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
