import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { BillingModule } from '../billing/billing.module';

import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [BillingModule,PrismaModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
