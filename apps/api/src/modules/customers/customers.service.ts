import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  findAll(
    organization_id: string,
  ): Promise<Awaited<ReturnType<PrismaService['customers']['findMany']>>> {
    return this.prisma.customers.findMany({
      where: {
        organization_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  create(
    dto: CreateCustomerDto,
    organization_id: string,
  ): Promise<Awaited<ReturnType<PrismaService['customers']['create']>>> {
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
