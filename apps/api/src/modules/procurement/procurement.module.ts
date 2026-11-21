import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { WorkOrderMaterialsController } from './work-order-materials.controller';
import { WorkOrderMaterialsService } from './work-order-materials.service';

@Module({
  imports: [PrismaModule, BillingModule],
  controllers: [
    SuppliersController,
    MaterialsController,
    WorkOrderMaterialsController,
    InventoryController,
  ],
  providers: [
    SuppliersService,
    MaterialsService,
    WorkOrderMaterialsService,
    InventoryService,
  ],
  exports: [
    SuppliersService,
    MaterialsService,
    WorkOrderMaterialsService,
    InventoryService,
  ],
})
export class ProcurementModule {}
