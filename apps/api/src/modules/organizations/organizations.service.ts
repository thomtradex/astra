import { Organization } from '@astra/database';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;

    return this.prisma.organization.findMany({
      skip,
      take: query.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  create(dto: CreateOrganizationDto): Promise<Organization> {
    return this.prisma.organization.create({
      data: dto,
    });
  }

  update(
  id: string,
  dto: UpdateOrganizationDto,
): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string): Promise<Organization> {
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}