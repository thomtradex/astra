import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';

import { BillingWebhookController } from './billing-webhook.controller';
import { BillingWebhookService } from './billing-webhook.service';

@Module({
  imports: [PrismaModule],
  controllers: [BillingWebhookController],
  providers: [BillingWebhookService],
  exports: [BillingWebhookService],
})
export class BillingWebhookModule {}
