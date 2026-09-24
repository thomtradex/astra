import { randomUUID } from 'node:crypto';

import { Prisma } from '@astra/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

type SupplierModel = Prisma.suppliersGetPayload<Record<string, never>>;

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string): Promise<SupplierModel[]> {
    return this.prisma.suppliers.findMany({
      where: { organization_id: organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<SupplierModel> {
    const supplier = await this.prisma.suppliers.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async create(
    dto: CreateSupplierDto,
    organizationId: string,
  ): Promise<SupplierModel> {
    return this.prisma.suppliers.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        code: dto.code,
        name: dto.name,
        tax_id: dto.taxId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        lead_time_days: dto.leadTimeDays,
        active: dto.active ?? true,
        notes: dto.notes,
        updated_at: new Date(),
      },
    });
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    organizationId: string,
  ): Promise<SupplierModel> {
    await this.findOne(id, organizationId);

    return this.prisma.suppliers.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        tax_id: dto.taxId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        lead_time_days: dto.leadTimeDays,
        active: dto.active,
        notes: dto.notes,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organizationId: string): Promise<SupplierModel> {
    await this.findOne(id, organizationId);

    return this.prisma.suppliers.delete({
      where: { id },
    });
  }
}
