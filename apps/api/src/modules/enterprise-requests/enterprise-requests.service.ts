import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateEnterpriseRequestDto } from './dto/create-enterprise-request.dto';

@Injectable()
export class EnterpriseRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEnterpriseRequestDto) {
    return this.prisma.enterpriseRequest.create({
      data: {
        company: dto.company.trim(),
        email: dto.email.trim().toLowerCase(),
        projects: dto.projects?.trim() || null,
        users: dto.users?.trim() || null,
        companySize: dto.companySize?.trim() || null,
        capacity: dto.capacity?.trim() || null,
        features: dto.features?.trim() || null,
        integrations: dto.integrations?.trim() || null,
        support: dto.support?.trim() || null,
        needs: dto.needs.trim(),
      },
      select: {
        id: true,
        company: true,
        email: true,
        projects: true,
        users: true,
        companySize: true,
        capacity: true,
        features: true,
        integrations: true,
        support: true,
        needs: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
