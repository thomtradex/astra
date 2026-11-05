import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';

import { BillingWebhookController } from './billing-webhook.controller';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeWebhookEventService } from './stripe-webhook-event.service';
import { StripeSubscriptionSyncLockService } from './stripe-subscription-sync-lock.service';

@Module({
  imports: [PrismaModule],
  controllers: [BillingWebhookController],
  providers: [BillingWebhookService, StripeWebhookEventService, StripeSubscriptionSyncLockService],
  exports: [BillingWebhookService, StripeWebhookEventService],
})
export class BillingWebhookModule {}
