import { PaymentModule } from './payment/payment.module';

import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscriptions/subscription.service';
import { BillingService } from './billing.service';
import { UsageService } from './usage/usage.service';
import { BillingAccessService } from './core/billing-access.service';

@Module({
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
