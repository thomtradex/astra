import { Module } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BillingModule } from '../billing/billing.module';

import { IntelligenceModule } from '../intelligence/intelligence.module';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [IntelligenceModule, BillingModule],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
