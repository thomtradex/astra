import { Module } from '@nestjs/common';

import { AppConfigModule } from '../../../config/config.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeSubscriptionSyncLockService } from './stripe-subscription-sync-lock.service';
import { StripeWebhookEventService } from './stripe-webhook-event.service';
import { StripeWebhookWorker } from './stripe-webhook-worker.service';

@Module({
  imports: [AppConfigModule, PrismaModule],
  providers: [
    BillingWebhookService,
    StripeSubscriptionSyncLockService,
    StripeWebhookEventService,
    StripeWebhookWorker,
  ],
})
export class StripeWorkerModule {}
