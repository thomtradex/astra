import { randomUUID } from 'node:crypto';

import { Prisma } from '@astra/database';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CreateWorkOrderMaterialDto } from './dto/create-work-order-material.dto';
import { UpdateWorkOrderMaterialDto } from './dto/update-work-order-material.dto';
import { ReserveInventoryDto} from './dto/reserve-inventory.dto';
import { withSerializableRetry } from './utils/serializable-retry';

type WorkOrderMaterialModel =
  Prisma.work_order_materialsGetPayload<Record<string, never>>;

@Injectable()
export class WorkOrderMaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateWorkOrderMaterialDto,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    const workOrder = await this.prisma.work_orders.findFirst({
      where: {
        id: dto.workOrderId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException(
        'Work order not found for this organization',
      );
    }

    const material = await this.prisma.materials.findFirst({
      where: {
        id: dto.materialId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!material) {
      throw new NotFoundException(
        'Material not found for this organization',
      );
    }

    const site = await this.prisma.sites.findFirst({
      where: {
        id: dto.siteId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (!site) {
      throw new NotFoundException(
        'Site not found for this organization',
      );
    }

    const existing = await this.prisma.work_order_materials.findFirst({
      where: {
        work_order_id: dto.workOrderId,
        material_id: dto.materialId,
        organization_id: organizationId,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      throw new Error(
        'Material is already associated with this work order',
      );
    }

    return this.prisma.work_order_materials.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        work_order_id: dto.workOrderId,
        material_id: dto.materialId,
        site_id: dto.siteId,
        required_quantity: dto.requiredQuantity,
        reserved_quantity: 0,
        consumed_quantity: 0,
        status: 'REQUIRED',
        notes: dto.notes,
        updated_at: new Date(),
      },
    });
  }

  findAll(
    workOrderId: string,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel[]> {
    return this.prisma.work_order_materials.findMany({
      where: {
        work_order_id: workOrderId,
        organization_id: organizationId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    const item = await this.prisma.work_order_materials.findFirst({
      where: {
        id,
        organization_id: organizationId,
      },
    });

    if (!item) {
      throw new NotFoundException('Work order material not found');
    }

    return item;
  }

  async update(
    id: string,
    dto: UpdateWorkOrderMaterialDto,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    const existing = await this.findOne(id, organizationId);

    const reservedQuantity = new Prisma.Decimal(
      existing.reserved_quantity,
    );
    const consumedQuantity = new Prisma.Decimal(
      existing.consumed_quantity,
    );
    const allocatedQuantity = reservedQuantity.plus(consumedQuantity);

    const hasInventoryMovement =
      reservedQuantity.greaterThan(0) || consumedQuantity.greaterThan(0);

    const workOrderChanged =
      dto.workOrderId !== undefined &&
      dto.workOrderId !== existing.work_order_id;
    const materialChanged =
      dto.materialId !== undefined &&
      dto.materialId !== existing.material_id;
    const siteChanged =
      dto.siteId !== undefined &&
      dto.siteId !== existing.site_id;

    if (
      hasInventoryMovement &&
      (workOrderChanged || materialChanged || siteChanged)
    ) {
      throw new BadRequestException(
        'Cannot change work order, material, or site after inventory has been reserved or consumed',
      );
    }

    if (dto.requiredQuantity !== undefined) {
      const requiredQuantity = new Prisma.Decimal(dto.requiredQuantity);

      if (requiredQuantity.lessThan(allocatedQuantity)) {
        throw new BadRequestException(
          'Required quantity cannot be less than reserved and consumed quantity',
        );
      }
    }

    if (workOrderChanged) {
      const workOrder = await this.prisma.work_orders.findFirst({
        where: {
          id: dto.workOrderId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!workOrder) {
        throw new NotFoundException(
          'Work order not found for this organization',
        );
      }
    }

    if (materialChanged) {
      const material = await this.prisma.materials.findFirst({
        where: {
          id: dto.materialId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!material) {
        throw new NotFoundException(
          'Material not found for this organization',
        );
      }
    }

    if (siteChanged) {
      const site = await this.prisma.sites.findFirst({
        where: {
          id: dto.siteId,
          organization_id: organizationId,
        },
        select: {
          id: true,
        },
      });

      if (!site) {
        throw new NotFoundException(
          'Site not found for this organization',
        );
      }
    }

    const workOrderId = dto.workOrderId ?? existing.work_order_id;
    const materialId = dto.materialId ?? existing.material_id;

    if (workOrderId !== existing.work_order_id || materialId !== existing.material_id) {
      const duplicate = await this.prisma.work_order_materials.findFirst({
        where: {
          work_order_id: workOrderId,
          material_id: materialId,
          organization_id: organizationId,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Material is already associated with this work order',
        );
      }
    }

    const requiredQuantity =
      dto.requiredQuantity ?? existing.required_quantity;

    const nextStatus = consumedQuantity.greaterThanOrEqualTo(
      requiredQuantity,
    )
      ? 'CONSUMED'
      : reservedQuantity.greaterThan(0)
        ? 'RESERVED'
        : 'REQUIRED';

    return this.prisma.work_order_materials.update({
      where: {
        id,
      },
      data: {
        ...(dto.workOrderId !== undefined
          ? { work_order_id: dto.workOrderId }
          : {}),
        ...(dto.materialId !== undefined
          ? { material_id: dto.materialId }
          : {}),
        ...(dto.siteId !== undefined
          ? { site_id: dto.siteId }
          : {}),
        ...(dto.requiredQuantity !== undefined
          ? { required_quantity: dto.requiredQuantity }
          : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        status: nextStatus,
        updated_at: new Date(),
      },
    });
  }

  async reserve(
    dto: ReserveInventoryDto,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    return withSerializableRetry(this.prisma, async (tx) => {
      const workOrderMaterial =
        await tx.work_order_materials.findFirst({
          where: {
            id: dto.workOrderMaterialId,
            organization_id: organizationId,
          },
        });

      if (!workOrderMaterial) {
        throw new NotFoundException(
          'Work order material not found',
        );
      }

      const remainingRequired = new Prisma.Decimal(
        workOrderMaterial.required_quantity,
      )
        .minus(workOrderMaterial.reserved_quantity)
        .minus(workOrderMaterial.consumed_quantity);

      const requestedQuantity = new Prisma.Decimal(dto.quantity);

      if (requestedQuantity.greaterThan(remainingRequired)) {
        throw new BadRequestException(
          'Cannot reserve more material than required',
        );
      }

      const stock = await tx.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: workOrderMaterial.site_id,
          material_id: workOrderMaterial.material_id,
        },
        select: {
          id: true,
          quantity_on_hand: true,
          quantity_reserved: true,
        },
      });

      if (!stock) {
        throw new NotFoundException(
          'Inventory stock not found',
        );
      }

      const available = new Prisma.Decimal(
        stock.quantity_on_hand,
      ).minus(stock.quantity_reserved ?? 0);

      if (requestedQuantity.greaterThan(available)) {
        throw new BadRequestException(
          'Insufficient available inventory',
        );
      }

      const nextReservedStock = new Prisma.Decimal(
        stock.quantity_reserved ?? 0,
      ).plus(requestedQuantity);

      const nextReservedMaterial = new Prisma.Decimal(
        workOrderMaterial.reserved_quantity,
      ).plus(requestedQuantity);

      const nextStatus = nextReservedMaterial.greaterThanOrEqualTo(
        workOrderMaterial.required_quantity,
      )
        ? 'RESERVED'
        : 'REQUIRED';

      await tx.inventory_stock.update({
        where: {
          id: stock.id,
        },
        data: {
          quantity_reserved: nextReservedStock,
          updated_at: new Date(),
        },
      });

      return tx.work_order_materials.update({
        where: {
          id: workOrderMaterial.id,
        },
        data: {
          reserved_quantity: nextReservedMaterial,
          status: nextStatus,
          updated_at: new Date(),
        },
      });
    });
  }

  async consume(
    dto: ConsumeInventoryDto,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    return withSerializableRetry(this.prisma, async (tx) => {
      const workOrderMaterial =
        await tx.work_order_materials.findFirst({
          where: {
            id: dto.workOrderMaterialId,
            organization_id: organizationId,
          },
        });

      if (!workOrderMaterial) {
        throw new NotFoundException(
          'Work order material not found',
        );
      }

      const reservedQuantity = new Prisma.Decimal(
        workOrderMaterial.reserved_quantity,
      );

      const requestedQuantity = new Prisma.Decimal(dto.quantity);

      if (requestedQuantity.greaterThan(reservedQuantity)) {
        throw new BadRequestException(
          'Cannot consume more material than reserved',
        );
      }

      const stock = await tx.inventory_stock.findFirst({
        where: {
          organization_id: organizationId,
          site_id: workOrderMaterial.site_id,
          material_id: workOrderMaterial.material_id,
        },
        select: {
          id: true,
          quantity_on_hand: true,
          quantity_reserved: true,
        },
      });

      if (!stock) {
        throw new NotFoundException(
          'Inventory stock not found',
        );
      }

      const stockReserved = new Prisma.Decimal(
        stock.quantity_reserved ?? 0,
      );

      if (requestedQuantity.greaterThan(stockReserved)) {
        throw new BadRequestException(
          'Cannot consume more material than reserved in inventory',
        );
      }

      const nextOnHand = new Prisma.Decimal(
        stock.quantity_on_hand,
      ).minus(requestedQuantity);

      if (nextOnHand.lessThan(0)) {
        throw new BadRequestException(
          'Insufficient inventory stock',
        );
      }

      const nextStockReserved = stockReserved.minus(
        requestedQuantity,
      );

      const nextMaterialReserved = reservedQuantity.minus(
        requestedQuantity,
      );

      const nextConsumed = new Prisma.Decimal(
        workOrderMaterial.consumed_quantity,
      ).plus(requestedQuantity);

      if (
        nextConsumed.greaterThan(
          workOrderMaterial.required_quantity,
        )
      ) {
        throw new BadRequestException(
          'Consumed quantity cannot exceed required quantity',
        );
      }

      const nextStatus = nextConsumed.greaterThanOrEqualTo(
        workOrderMaterial.required_quantity,
      )
        ? 'CONSUMED'
        : nextMaterialReserved.greaterThan(0)
          ? 'RESERVED'
          : 'REQUIRED';

      await tx.inventory_stock.update({
        where: {
          id: stock.id,
        },
        data: {
          quantity_on_hand: nextOnHand,
          quantity_reserved: nextStockReserved,
          updated_at: new Date(),
        },
      });

      await tx.inventory_movements.create({
        data: {
          id: randomUUID(),
          organization_id: organizationId,
          site_id: workOrderMaterial.site_id,
          material_id: workOrderMaterial.material_id,
          movement_type: 'CONSUMPTION',
          quantity: requestedQuantity,
          reference_type: 'WORK_ORDER_MATERIAL',
          reference_id: workOrderMaterial.id,
          reason: 'Work order material consumption',
          occurred_at: new Date(),
          created_at: new Date(),
        },
      });

      return tx.work_order_materials.update({
        where: {
          id: workOrderMaterial.id,
        },
        data: {
          reserved_quantity: nextMaterialReserved,
          consumed_quantity: nextConsumed,
          status: nextStatus,
          updated_at: new Date(),
        },
      });
    });
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<WorkOrderMaterialModel> {
    const workOrderMaterial = await this.findOne(
      id,
      organizationId,
    );

    const reservedQuantity = new Prisma.Decimal(
      workOrderMaterial.reserved_quantity ?? 0,
    );
    const consumedQuantity = new Prisma.Decimal(
      workOrderMaterial.consumed_quantity ?? 0,
    );

    if (
      reservedQuantity.greaterThan(0) ||
      consumedQuantity.greaterThan(0)
    ) {
      throw new BadRequestException(
        'Cannot remove a work order material after inventory has been reserved or consumed',
      );
    }

    return this.prisma.work_order_materials.delete({
      where: {
        id,
      },
    });
  }
}
