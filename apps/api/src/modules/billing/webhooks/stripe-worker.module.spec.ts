import { Test } from '@nestjs/testing';

import { PrismaService } from '../../../prisma/prisma.service';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeWebhookEventService } from './stripe-webhook-event.service';
import { StripeSubscriptionSyncLockService } from './stripe-subscription-sync-lock.service';
import { StripeWebhookWorker } from './stripe-webhook-worker.service';
import { StripeWorkerModule } from './stripe-worker.module';

describe('StripeWorkerModule', () => {
  it('resolves the worker and its dependencies without database access', async () => {
    const prisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [StripeWorkerModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    try {
      const worker = moduleRef.get(StripeWebhookWorker);
      const billing = moduleRef.get(BillingWebhookService);
      const events = moduleRef.get(StripeWebhookEventService);
      const lock = moduleRef.get(StripeSubscriptionSyncLockService);

      expect(worker).toBeInstanceOf(StripeWebhookWorker);
      expect(billing).toBeInstanceOf(BillingWebhookService);
      expect(events).toBeInstanceOf(StripeWebhookEventService);
      expect(lock).toBeInstanceOf(StripeSubscriptionSyncLockService);

      expect(prisma.$connect).not.toHaveBeenCalled();
      expect(prisma.$disconnect).not.toHaveBeenCalled();
    } finally {
      await moduleRef.close();
    }
  });
});
