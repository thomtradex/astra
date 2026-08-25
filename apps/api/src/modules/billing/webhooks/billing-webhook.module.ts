import { Module } from '@nestjs/common';

import { BillingWebhookController } from './billing-webhook.controller';
import { BillingWebhookService } from './billing-webhook.service';

@Module({
  controllers: [BillingWebhookController],
  providers: [BillingWebhookService],
  exports: [BillingWebhookService],
})
export class BillingWebhookModule {}
