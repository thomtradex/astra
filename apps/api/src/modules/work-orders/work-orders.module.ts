import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

@Module({
  imports: [BillingModule, PrismaModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
