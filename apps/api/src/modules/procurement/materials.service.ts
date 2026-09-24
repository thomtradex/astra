import { randomUUID } from 'node:crypto';

import { Prisma } from '@astra/database';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

type MaterialModel = Prisma.materialsGetPayload<Record<string, never>>;

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string): Promise<MaterialModel[]> {
    return this.prisma.materials.findMany({
      where: { organization_id: organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<MaterialModel> {
    const material = await this.prisma.materials.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  private async assertSupplier(
    supplierId: string | undefined,
    organizationId: string,
  ): Promise<void> {
    if (!supplierId) {
      return;
    }

    const supplier = await this.prisma.suppliers.findFirst({
      where: {
        id: supplierId,
        organization_id: organizationId,
      },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }

  async create(
    dto: CreateMaterialDto,
    organizationId: string,
  ): Promise<MaterialModel> {
    await this.assertSupplier(dto.supplierId, organizationId);

    return this.prisma.materials.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        supplier_id: dto.supplierId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        unit: dto.unit,
        unit_cost: dto.unitCost,
        lead_time_days: dto.leadTimeDays,
        reorder_point: dto.reorderPoint,
        reorder_quantity: dto.reorderQuantity,
        active: dto.active ?? true,
        notes: dto.notes,
        updated_at: new Date(),
      },
    });
  }

  async update(
    id: string,
    dto: UpdateMaterialDto,
    organizationId: string,
  ): Promise<MaterialModel> {
    await this.findOne(id, organizationId);
    await this.assertSupplier(dto.supplierId, organizationId);

    return this.prisma.materials.update({
      where: { id },
      data: {
        supplier_id: dto.supplierId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        unit: dto.unit,
        unit_cost: dto.unitCost,
        lead_time_days: dto.leadTimeDays,
        reorder_point: dto.reorderPoint,
        reorder_quantity: dto.reorderQuantity,
        active: dto.active,
        notes: dto.notes,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: string, organizationId: string): Promise<MaterialModel> {
    await this.findOne(id, organizationId);

    return this.prisma.materials.delete({
      where: { id },
    });
  }
}
