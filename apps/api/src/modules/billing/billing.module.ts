import { Module } from '@nestjs/common';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingAccessService } from './core/billing-access.service';
import { PaymentModule } from './payment/payment.module';
import { SubscriptionService } from './subscriptions/subscription.service';
import { UsageService } from './usage/usage.service';
@Module({
  controllers: [BillingController],
  imports: [PaymentModule],
  providers: [
    BillingService,
    SubscriptionService,
    UsageService,
    BillingAccessService,
  ],
  exports: [
    BillingService,
    SubscriptionService,
    UsageService,
    BillingAccessService,
  ],
})
export class BillingModule {}
