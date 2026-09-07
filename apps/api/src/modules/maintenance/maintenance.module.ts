import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [BillingModule,PrismaModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
