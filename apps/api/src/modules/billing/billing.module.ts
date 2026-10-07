import { Module } from '@nestjs/common';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaymentModule } from './payment/payment.module';
import { UsageService } from './usage/usage.service';
import { BillingWebhookModule } from './webhooks/billing-webhook.module';
@Module({
  controllers: [BillingController],
  imports: [PaymentModule, BillingWebhookModule],
  providers: [
    BillingService,
    UsageService,
  ],
  exports: [
    BillingService,
    UsageService,
  ],
})
export class BillingModule {}
