import { randomUUID } from 'crypto';

import { Prisma } from '@astra/database';
import { BadRequestException } from '@nestjs/common';

export async function releaseWorkOrderReservations(
  tx: Prisma.TransactionClient,
  organizationId: string,
  workOrderId: string,
  reason: string,
): Promise<void> {
  const materials = await tx.work_order_materials.findMany({
    where: {
      organization_id: organizationId,
      work_order_id: workOrderId,
      reserved_quantity: {
        gt: 0,
      },
    },
    select: {
      id: true,
      site_id: true,
      material_id: true,
      required_quantity: true,
      reserved_quantity: true,
      consumed_quantity: true,
    },
  });

  for (const material of materials) {
    const reservedQuantity = new Prisma.Decimal(
      material.reserved_quantity,
    );

    if (!reservedQuantity.greaterThan(0)) {
      continue;
    }

    const stock = await tx.inventory_stock.findFirst({
      where: {
        organization_id: organizationId,
        site_id: material.site_id,
        material_id: material.material_id,
      },
      select: {
        id: true,
        quantity_reserved: true,
      },
    });

    if (!stock) {
      throw new BadRequestException(
        `Cannot release reservation for material ${material.id}: inventory stock not found`,
      );
    }

    const stockReserved = new Prisma.Decimal(
      stock.quantity_reserved ?? 0,
    );

    if (stockReserved.lessThan(reservedQuantity)) {
      throw new BadRequestException(
        `Cannot release reservation for material ${material.id}: inventory reservation is inconsistent`,
      );
    }

    const nextStockReserved = stockReserved.minus(reservedQuantity);
    const consumedQuantity = new Prisma.Decimal(
      material.consumed_quantity,
    );
    const requiredQuantity = new Prisma.Decimal(
      material.required_quantity,
    );

    const nextStatus = consumedQuantity.greaterThanOrEqualTo(
      requiredQuantity,
    )
      ? 'CONSUMED'
      : 'REQUIRED';

    await tx.inventory_stock.update({
      where: {
        id: stock.id,
      },
      data: {
        quantity_reserved: nextStockReserved,
        updated_at: new Date(),
      },
    });

    await tx.work_order_materials.update({
      where: {
        id: material.id,
      },
      data: {
        reserved_quantity: new Prisma.Decimal(0),
        status: nextStatus,
        updated_at: new Date(),
      },
    });

    await tx.inventory_movements.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        site_id: material.site_id,
        material_id: material.material_id,
        movement_type: 'RESERVATION_RELEASE',
        quantity: reservedQuantity,
        reference_type: 'WORK_ORDER_MATERIAL',
        reference_id: material.id,
        reason,
        occurred_at: new Date(),
        created_at: new Date(),
      },
    });
  }
}
