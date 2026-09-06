import { randomUUID } from 'node:crypto';


import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  async findAll(
    organization_id: string,
    query?: {
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 25));
    const search = query?.search?.trim();

    const where = {
      organization_id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { code: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.customers.findMany({
        where,
        include: {
          projects: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customers.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string, organization_id: string) {
    return this.prisma.customers.findFirst({
      where: {
        id,
        organization_id,
      },
      include: {
        projects: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
            progress: true,
            budget_cents: true,
            start_date: true,
            end_date: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateCustomerDto, organization_id: string) {
    const customer = await this.prisma.customers.findUnique({
      where: {
        id,
        organization_id,
      },
    });

    if (!customer || customer.organization_id !== organization_id) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customers.update({
      where: {
        id,
      },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organization_id: string) {
    const customer = await this.prisma.customers.findUnique({
      where: {
        id,
        organization_id,
      },
    });

    if (!customer || customer.organization_id !== organization_id) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customers.delete({
      where: {
        id,
      },
    });
  }

  async create(
    dto: CreateCustomerDto,
    organization_id: string,
  ): Promise<Awaited<ReturnType<PrismaService['customers']['create']>>> {
    const currentUsage = await this.prisma.customers.count({
      where: { organization_id },
    });

    await this.billingService.assertLimit(
      organization_id,
      'customers',
      currentUsage,
    );

    return this.prisma.customers.create({
      data: {
        id: randomUUID(),
        code: dto.code,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        organization_id,
        updated_at: new Date(),
      },
    });
  }
}
