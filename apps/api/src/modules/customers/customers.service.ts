import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  findAll(organizationId: string): Promise<Awaited<ReturnType<PrismaService['customer']['findMany']>>> {
    return this.prisma.customer.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(
    dto: CreateCustomerDto,
    organizationId: string,
  ): Promise<Awaited<ReturnType<PrismaService['customer']['create']>>> {
    return this.prisma.customer.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }
}
