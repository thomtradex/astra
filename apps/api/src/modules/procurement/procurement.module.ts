import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

@Module({
  imports: [PrismaModule, BillingModule],
  controllers: [SuppliersController, MaterialsController],
  providers: [SuppliersService, MaterialsService],
  exports: [SuppliersService, MaterialsService],
})
export class ProcurementModule {}
