import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [BillingModule,PrismaModule],
  controllers: [SitesController],
  providers: [SitesService],
})
export class SitesModule {}
