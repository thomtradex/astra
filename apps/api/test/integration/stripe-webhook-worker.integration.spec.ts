import { randomUUID } from 'crypto';
import { PrismaClient } from '@astra/database';
import { StripeWebhookEventService } from '../../src/modules/billing/webhooks/stripe-webhook-event.service';
import { StripeWebhookWorker } from '../../src/modules/billing/webhooks/stripe-webhook-worker.service';
import { BillingWebhookService } from '../../src/modules/billing/webhooks/billing-webhook.service';
import { requireIsolatedTestDatabase } from '../require-isolated-test-database';

describe('Stripe webhook worker — real PostgreSQL integration', () => {
  let prisma: PrismaClient;
  let events: StripeWebhookEventService;
  let worker: StripeWebhookWorker;
  let stripeEventId: string;
  const createdEventIds: string[] = [];

  const billing = {
    processVerifiedStripeEvent: jest.fn(),
  };

  beforeAll(async () => {
    const url = requireIsolatedTestDatabase();

    prisma = new PrismaClient({
      datasources: {
        db: { url },
      },
    });

    await prisma.$connect();

    events = new StripeWebhookEventService(prisma as never);

    worker = new StripeWebhookWorker(
      events,
      billing as unknown as BillingWebhookService,
    );
  });

  afterAll(async () => {
    if (prisma) {
      try {
        if (createdEventIds.length > 0) {
          await prisma.stripeWebhookEvent.deleteMany({
            where: {
              stripeEventId: {
                in: createdEventIds,
              },
            },
          });
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes a persisted event exactly once', async () => {
    stripeEventId = 'evt_astra_integration_' + randomUUID();
    createdEventIds.push(stripeEventId);

    const event = {
      id: stripeEventId,
      object: 'event',
      type: 'customer.subscription.updated',
      api_version: '2024-06-20',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: 'sub_astra_integration',
          object: 'subscription',
        },
      },
    };

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId,
        eventType: event.type,
        status: 'PENDING',
        payload: event,
      },
    });

    const initial = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId },
    });

    expect(initial.status).toBe('PENDING');
    expect(initial.attempts).toBe(0);

    billing.processVerifiedStripeEvent.mockResolvedValue(undefined);

    const first = await worker.processOne(stripeEventId);

    expect(first).toBe(true);

    expect(
      billing.processVerifiedStripeEvent,
    ).toHaveBeenCalledTimes(1);

    const completed = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId },
    });

    expect(completed.status).toBe('COMPLETED');
    expect(completed.attempts).toBe(1);
    expect(completed.claimToken).toBeNull();
    expect(completed.processingAt).toBeNull();
    expect(completed.processedAt).not.toBeNull();

    const second = await worker.processOne(stripeEventId);

    expect(second).toBe(false);

    expect(
      billing.processVerifiedStripeEvent,
    ).toHaveBeenCalledTimes(1);
  });

  it('discovers and completes a pending event through processBatch', async () => {
    stripeEventId = 'evt_astra_integration_' + randomUUID();
    createdEventIds.push(stripeEventId);

    const event = {
      id: stripeEventId,
      object: 'event',
      type: 'customer.subscription.updated',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: 'sub_astra_batch',
          object: 'subscription',
        },
      },
    };

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId,
        eventType: event.type,
        status: 'PENDING',
        payload: event,
      },
    });

    billing.processVerifiedStripeEvent.mockResolvedValue(undefined);

    const result = await worker.processBatch(25);

    expect(result.discovered).toBe(1);
    expect(result.completed).toBe(1);
    expect(result.incomplete).toBe(0);

    expect(
      billing.processVerifiedStripeEvent,
    ).toHaveBeenCalledTimes(1);

    const stored = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId },
    });

    expect(stored.status).toBe('COMPLETED');
    expect(stored.attempts).toBe(1);
    expect(stored.claimToken).toBeNull();
  });

  it('prevents duplicate processing across two Prisma clients', async () => {
    stripeEventId = 'evt_astra_integration_' + randomUUID();
    createdEventIds.push(stripeEventId);

    const event = {
      id: stripeEventId,
      object: 'event',
      type: 'customer.subscription.updated',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: 'sub_astra_concurrency',
          object: 'subscription',
        },
      },
    };

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId,
        eventType: event.type,
        status: 'PENDING',
        payload: event,
      },
    });

    const secondPrisma = new PrismaClient({
      datasources: {
        db: {
          url: requireIsolatedTestDatabase(),
        },
      },
    });

    try {
      await secondPrisma.$connect();

      const secondEvents = new StripeWebhookEventService(
        secondPrisma as never,
      );

      const secondWorker = new StripeWebhookWorker(
        secondEvents,
        billing as unknown as BillingWebhookService,
      );

      billing.processVerifiedStripeEvent.mockImplementation(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        },
      );

      const results = await Promise.all([
        worker.processOne(stripeEventId),
        secondWorker.processOne(stripeEventId),
      ]);

      expect(results.filter(Boolean)).toHaveLength(1);

      expect(
        billing.processVerifiedStripeEvent,
      ).toHaveBeenCalledTimes(1);

      const stored = await prisma.stripeWebhookEvent.findUniqueOrThrow({
        where: { stripeEventId },
      });

      expect(stored.status).toBe('COMPLETED');
      expect(stored.attempts).toBe(1);
    } finally {
      await secondPrisma.$disconnect();
    }
  });


  it('schedules a retry after a temporary handler failure', async () => {
    const id = 'evt_astra_integration_' + randomUUID();
    createdEventIds.push(id);

    const event = {
      id,
      object: 'event',
      type: 'customer.subscription.updated',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: 'sub_astra_retry_failure',
          object: 'subscription',
        },
      },
    };

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: id,
        eventType: event.type,
        status: 'PENDING',
        payload: event,
      },
    });

    billing.processVerifiedStripeEvent.mockRejectedValue(
      new Error('Temporary integration test failure'),
    );

    const before = Date.now();
    const processed = await worker.processOne(id);
    const after = Date.now();

    expect(processed).toBe(false);

    const stored = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId: id },
    });

    expect(stored.status).toBe('FAILED');
    expect(stored.attempts).toBe(1);
    expect(stored.claimToken).toBeNull();
    expect(stored.processingAt).toBeNull();
    expect(stored.processedAt).toBeNull();
    expect(stored.lastError).toContain(
      'Temporary integration test failure',
    );
    expect(stored.nextRetryAt).not.toBeNull();

    const retryTime = stored.nextRetryAt!.getTime();

    expect(retryTime).toBeGreaterThanOrEqual(before + 30000);
    expect(retryTime).toBeLessThanOrEqual(after + 35000);

    expect(await events.claim(id)).toBeNull();

    expect(
      billing.processVerifiedStripeEvent,
    ).toHaveBeenCalledTimes(1);
  });

  it('recovers a failed event when its retry becomes due', async () => {
    const id = 'evt_astra_integration_' + randomUUID();
    createdEventIds.push(id);

    const event = {
      id,
      object: 'event',
      type: 'customer.subscription.updated',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: 'sub_astra_retry_recovery',
          object: 'subscription',
        },
      },
    };

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: id,
        eventType: event.type,
        status: 'PENDING',
        payload: event,
      },
    });

    billing.processVerifiedStripeEvent
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(undefined);

    expect(await worker.processOne(id)).toBe(false);

    const failed = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId: id },
    });

    expect(failed.status).toBe('FAILED');
    expect(failed.attempts).toBe(1);
    expect(failed.nextRetryAt).not.toBeNull();

    // Simula a passagem do prazo, sem esperar 30 segundos.
    // A alteração é restrita ao evento criado neste teste.
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId: id },
      data: {
        nextRetryAt: new Date(Date.now() - 1000),
      },
    });

    const processed = await worker.processOne(id);

    expect(processed).toBe(true);

    const completed = await prisma.stripeWebhookEvent.findUniqueOrThrow({
      where: { stripeEventId: id },
    });

    expect(completed.status).toBe('COMPLETED');
    expect(completed.attempts).toBe(2);
    expect(completed.claimToken).toBeNull();
    expect(completed.processingAt).toBeNull();
    expect(completed.nextRetryAt).toBeNull();
    expect(completed.processedAt).not.toBeNull();

    expect(
      billing.processVerifiedStripeEvent,
    ).toHaveBeenCalledTimes(2);
  });

});
