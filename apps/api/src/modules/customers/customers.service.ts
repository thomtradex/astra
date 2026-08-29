import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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


  findOne(id: string, organization_id: string) {
    return this.prisma.customers.findUnique({
      where: {
        id,
        organization_id,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    organization_id: string,
  ) {
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
