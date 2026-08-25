import { Module } from '@nestjs/common';

import { PaymentModule } from './payment/payment.module';
import { BillingWebhookModule } from './webhooks/billing-webhook.module';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [PaymentModule, BillingWebhookModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
