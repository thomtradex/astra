import { randomUUID } from 'node:crypto';

import { Prisma } from '@astra/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { withSerializableRetry } from './utils/serializable-retry';

type InventoryStockModel = Prisma.inventory_stockGetPayload<Record<string, never>>;

type InventoryStockWithRelations = Prisma.inventory_stockGetPayload<{
  include: {
    materials: true;
    sites: true;
  };
}>;

type InventoryMovementModel = Prisma.inventory_movementsGetPayload<Record<string, never>>;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    siteId?: string,
    materialId?: string,
  ): Promise<InventoryStockWithRelations[]> {
    return this.prisma.inventory_stock.findMany({
      where: {
        organization_id: organizationId,
        site_id: siteId,
        material_id: materialId,
      },
      include: {
        materials: true,
        sites: true,
      },
      orderBy: [
        { site_id: 'asc' },
        { material_id: 'asc' },
      ],
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<InventoryStockWithRelations> {
    const stock = await this.prisma.inventory_stock.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
      include: {
        materials: true,
        sites: true,
      },
    });

    if (!stock) {
      throw new NotFoundException('Inventory stock not found');
    }

    return stock;
  }

  async findByMaterialAndSite(
    materialId: string,
    siteId: string,
    organizationId: string,
  ): Promise<InventoryStockModel | null> {
    return this.prisma.inventory_stock.findFirst({
      where: {
        organization_id: organizationId,
        material_id: materialId,
        site_id: siteId,
      },
    });
  }

  async createMovement(
    dto: CreateInventoryMovementDto,
    organizationId: string,
  ): Promise<InventoryMovementModel> {
    await this.assertSite(dto.siteId, organizationId);
    await this.assertMaterial(dto.materialId, organizationId);

    return withSerializableRetry(this.prisma, async (tx) => {
      const existingStock = await tx.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: dto.siteId,
          material_id: dto.materialId,
        },
      });

      const currentQuantity =
        existingStock?.quantity_on_hand ?? new Prisma.Decimal(0);
      const currentReserved =
        existingStock?.quantity_reserved ?? new Prisma.Decimal(0);
      const delta = this.getStockDelta(dto.movementType, dto.quantity);
      const nextQuantity = currentQuantity.plus(delta);

      if (nextQuantity.lessThan(0)) {
        throw new BadRequestException('Insufficient inventory stock');
      }

      if (
        dto.movementType === 'ADJUSTMENT_OUT' &&
        nextQuantity.lessThan(currentReserved)
      ) {
        throw new BadRequestException(
          'Insufficient available inventory: reserved stock cannot be removed',
        );
      }

      if (existingStock) {
        await tx.inventory_stock.update({
          where: {
            id: existingStock.id,
          },
          data: {
            quantity_on_hand: nextQuantity,
            updated_at: new Date(),
          },
        });
      } else {
        await tx.inventory_stock.create({
          data: {
            id: randomUUID(),
            organization_id: organizationId,
            site_id: dto.siteId,
            material_id: dto.materialId,
            quantity_on_hand: nextQuantity,
            quantity_reserved: 0,
            updated_at: new Date(),
          },
        });
      }

      return tx.inventory_movements.create({
        data: {
          id: randomUUID(),
          organization_id: organizationId,
          site_id: dto.siteId,
          material_id: dto.materialId,
          movement_type: dto.movementType,
          quantity: dto.quantity,
          reference_type: dto.referenceType,
          reference_id: dto.referenceId,
          reason: dto.reason,
          occurred_at: new Date(),
          created_at: new Date(),
        },
      });
    });
  }

  private getStockDelta(
    movementType: CreateInventoryMovementDto['movementType'],
    quantity: number,
  ): Prisma.Decimal {
    const amount = new Prisma.Decimal(quantity);

    switch (movementType) {
      case 'ADJUSTMENT_IN':
      case 'RECEIPT':
      case 'RETURN':
        return amount;
      case 'ADJUSTMENT_OUT':
        return amount.negated();
    }
  }

  private async assertSite(
    siteId: string,
    organizationId: string,
  ): Promise<void> {
    const site = await this.prisma.sites.findFirst({
      where: {
        id: siteId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }
  }

  private async assertMaterial(
    materialId: string,
    organizationId: string,
  ): Promise<void> {
    const material = await this.prisma.materials.findFirst({
      where: {
        id: materialId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }
  }
}
