import { Prisma, StripeWebhookEventStatus } from '@astra/database';
import Stripe from 'stripe';

import { StripeWebhookEventService } from './stripe-webhook-event.service';

describe('StripeWebhookEventService', () => {
  const prisma = {
    stripeWebhookEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  let service: StripeWebhookEventService;

  const event = {
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
      },
    },
  } as Stripe.Event;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new StripeWebhookEventService(prisma as never);
  });

  describe('renewClaim', () => {
    it('renews an active claim', async () => {
      prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
        count: 1,
      });

      await expect(
        service.renewClaim('evt_test_123', 'token_1'),
      ).resolves.toBe(true);

      expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith({
        where: {
          stripeEventId: 'evt_test_123',
          claimToken: 'token_1',
          status: StripeWebhookEventStatus.PROCESSING,
          processingAt: { gt: expect.any(Date) },
        },
        data: {
          processingAt: expect.any(Date),
        },
      });
    });

    it('rejects a claim that is no longer valid', async () => {
      prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.renewClaim('evt_test_123', 'old_token'),
      ).resolves.toBe(false);
    });

    it('does not modify the token or processing status', async () => {
      prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.renewClaim('evt_test_123', 'token_1');

      const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

      expect(call.data).toEqual({
        processingAt: expect.any(Date),
      });

      expect(call.data).not.toHaveProperty('claimToken');
      expect(call.data).not.toHaveProperty('status');
      expect(call.data).not.toHaveProperty('attempts');
    });

    it('propagates database failures during renewal', async () => {
      prisma.stripeWebhookEvent.updateMany.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(
        service.renewClaim('evt_test_123', 'token_1'),
      ).rejects.toThrow('Database unavailable');
    });
  });

  describe('findReadyEvents', () => {
    it('selects eligible events in creation order', async () => {
      prisma.stripeWebhookEvent.findMany.mockResolvedValue([
        { stripeEventId: 'evt_ready_1' },
        { stripeEventId: 'evt_ready_2' },
      ]);

      const result = await service.findReadyEvents();

      expect(result).toEqual(['evt_ready_1', 'evt_ready_2']);

      expect(prisma.stripeWebhookEvent.findMany).toHaveBeenCalledWith({
        where: {
          attempts: { lt: 8 },
          OR: [
            { status: StripeWebhookEventStatus.PENDING },
            {
              status: StripeWebhookEventStatus.FAILED,
              nextRetryAt: { lte: expect.any(Date) },
            },
            {
              status: StripeWebhookEventStatus.PROCESSING,
              processingAt: { lte: expect.any(Date) },
            },
          ],
        },
        select: { stripeEventId: true },
        orderBy: { createdAt: 'asc' },
        take: 25,
      });
    });

    it('limits the number of events to 100', async () => {
      prisma.stripeWebhookEvent.findMany.mockResolvedValue([]);

      await service.findReadyEvents(500);

      expect(prisma.stripeWebhookEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('propagates database failures', async () => {
      prisma.stripeWebhookEvent.findMany.mockRejectedValue(
        new Error('Database unavailable'),
      );

      await expect(service.findReadyEvents()).rejects.toThrow(
        'Database unavailable',
      );
    });
  });

  it('registers a Stripe event as PENDING', async () => {
    prisma.stripeWebhookEvent.create.mockResolvedValue({
      stripeEventId: event.id,
      status: StripeWebhookEventStatus.PENDING,
    });

    await service.register(event);

    expect(prisma.stripeWebhookEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stripeEventId: event.id,
        eventType: event.type,
        status: StripeWebhookEventStatus.PENDING,
        payload: expect.objectContaining({ id: event.id }),
      }),
    });
  });

  it('returns an existing event on a unique constraint conflict', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '6.19.3' },
    );

    prisma.stripeWebhookEvent.create.mockRejectedValue(conflict);
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      stripeEventId: event.id,
      eventType: event.type,
      status: StripeWebhookEventStatus.COMPLETED,
    });

    const result = await service.register(event);

    expect(result.status).toBe(StripeWebhookEventStatus.COMPLETED);
    expect(prisma.stripeWebhookEvent.findUnique).toHaveBeenCalledWith({
      where: { stripeEventId: event.id },
    });
  });

  it('rejects a conflicting Stripe event type', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '6.19.3' },
    );

    prisma.stripeWebhookEvent.create.mockRejectedValue(conflict);
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      stripeEventId: event.id,
      eventType: 'invoice.paid',
    });

    await expect(service.register(event)).rejects.toThrow(
      Prisma.PrismaClientKnownRequestError,
    );
  });

  it('propagates database failures during registration', async () => {
    prisma.stripeWebhookEvent.create.mockRejectedValue(
      new Error('Database unavailable'),
    );

    await expect(service.register(event)).rejects.toThrow(
      'Database unavailable',
    );
  });

  it('claims a pending event with a unique token', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    const token = await service.claim(event.id);

    expect(typeof token).toBe('string');
    expect(token).toBeTruthy();

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith({
      where: {
        stripeEventId: event.id,
        attempts: { lt: 8 },
        OR: expect.arrayContaining([
          { status: StripeWebhookEventStatus.PENDING },
        ]),
      },
      data: expect.objectContaining({
        status: StripeWebhookEventStatus.PROCESSING,
        claimToken: token,
        attempts: { increment: 1 },
      }),
    });
  });

  it('returns null when an event cannot be claimed', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 0,
    });

    expect(await service.claim(event.id)).toBeNull();
  });

  it('uses different tokens for independent claims', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    const first = await service.claim('evt_first');
    const second = await service.claim('evt_second');

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it('allows claiming FAILED events only when retry is due', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.claim(event.id);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: StripeWebhookEventStatus.FAILED,
          nextRetryAt: {
            lte: expect.any(Date),
          },
        }),
      ]),
    );
  });

  it('allows recovering expired PROCESSING claims', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.claim(event.id);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: StripeWebhookEventStatus.PROCESSING,
          processingAt: {
            lte: expect.any(Date),
          },
        }),
      ]),
    );
  });

  it('completes an event only with its claim token', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    expect(await service.complete(event.id, 'token_valid')).toBe(true);

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith({
      where: {
        stripeEventId: event.id,
        claimToken: 'token_valid',
        status: StripeWebhookEventStatus.PROCESSING,
      },
      data: expect.objectContaining({
        status: StripeWebhookEventStatus.COMPLETED,
        claimToken: null,
        processedAt: expect.any(Date),
      }),
    });
  });

  it('rejects completion when the claim is no longer valid', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 0,
    });

    expect(
      await service.complete(event.id, 'token_expired'),
    ).toBe(false);
  });

  it('records failures only for the matching claim token', async () => {
    const retryAt = new Date('2026-11-05T10:00:00.000Z');

    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_valid',
      attempts: 2,
    });

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    expect(
      await service.fail(
        event.id,
        'token_valid',
        'Temporary failure',
        retryAt,
      ),
    ).toBe(true);

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith({
      where: {
        stripeEventId: event.id,
        claimToken: 'token_valid',
        status: StripeWebhookEventStatus.PROCESSING,
        attempts: 2,
      },
      data: expect.objectContaining({
        status: StripeWebhookEventStatus.FAILED,
        claimToken: null,
        lastError: 'Temporary failure',
        nextRetryAt: retryAt,
      }),
    });
  });

  it('rejects failure updates from stale claims', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 0,
    });

    expect(
      await service.fail(event.id, 'stale_token', 'Temporary failure'),
    ).toBe(false);
  });

  it('limits stored error descriptions to 500 characters', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_valid',
      attempts: 2,
    });

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    await service.fail(event.id, 'token_valid', 'x'.repeat(900));

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.data.lastError).toHaveLength(500);
  });

  it('schedules the first retry after 30 seconds', async () => {
    const now = Date.now();

    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_1',
      attempts: 1,
    });
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 1 });

    expect(
      await service.fail(event.id, 'token_1', 'Temporary failure'),
    ).toBe(true);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];
    const delay = call.data.nextRetryAt.getTime() - now;

    expect(delay).toBeGreaterThanOrEqual(30_000);
    expect(delay).toBeLessThan(35_000);
  });

  it('applies exponential backoff on the fourth attempt', async () => {
    const now = Date.now();

    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_4',
      attempts: 4,
    });
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 1 });

    await service.fail(event.id, 'token_4', 'Temporary failure');

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];
    const delay = call.data.nextRetryAt.getTime() - now;

    expect(delay).toBeGreaterThanOrEqual(240_000);
    expect(delay).toBeLessThan(245_000);
  });

  it('stops scheduling retries after eight attempts', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_8',
      attempts: 8,
    });
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 1 });

    expect(
      await service.fail(event.id, 'token_8', 'Retry exhausted'),
    ).toBe(true);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.data.status).toBe(StripeWebhookEventStatus.REQUIRES_REVIEW);
    expect(call.data.nextRetryAt).toBeNull();
  });

  it('does not update a failure when the claim token has changed', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'new_token',
      attempts: 2,
    });

    expect(
      await service.fail(event.id, 'old_token', 'Stale processor'),
    ).toBe(false);

    expect(prisma.stripeWebhookEvent.updateMany).not.toHaveBeenCalled();
  });

  it('restricts claims to fewer than eight attempts', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 0 });

    await service.claim(event.id);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where.attempts).toEqual({ lt: 8 });
  });

  it('rejects a failure update if its attempt changed concurrently', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_2',
      attempts: 2,
    });
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 0 });

    expect(
      await service.fail(event.id, 'token_2', 'Concurrent update'),
    ).toBe(false);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where).toEqual({
      stripeEventId: event.id,
      claimToken: 'token_2',
      status: StripeWebhookEventStatus.PROCESSING,
      attempts: 2,
    });
  });

  it('schedules a retry when null is explicitly provided', async () => {
    const now = Date.now();

    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_null',
      attempts: 1,
    });

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 1,
    });

    expect(
      await service.fail(event.id, 'token_null', 'Temporary failure', null),
    ).toBe(true);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];
    const retryDate = call.data.nextRetryAt as Date;

    expect(retryDate).toBeInstanceOf(Date);
    expect(retryDate.getTime() - now).toBeGreaterThanOrEqual(30_000);
    expect(retryDate.getTime() - now).toBeLessThan(35_000);
  });


  it('moves an event to REQUIRES_REVIEW with a valid claim token', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_valid',
      attempts: 2,
    });

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.requireReview(
      event.id,
      'token_valid',
      'Organization mismatch',
    );

    expect(result).toBe(true);

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith({
      where: {
        stripeEventId: event.id,
        claimToken: 'token_valid',
        status: StripeWebhookEventStatus.PROCESSING,
        attempts: 2,
      },
      data: {
        status: StripeWebhookEventStatus.REQUIRES_REVIEW,
        processingAt: null,
        claimToken: null,
        nextRetryAt: null,
        processedAt: null,
        lastError: 'Organization mismatch',
      },
    });
  });

  it('rejects review transitions with an invalid claim token', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'current_token',
      attempts: 2,
    });

    expect(
      await service.requireReview(
        event.id,
        'old_token',
        'Organization mismatch',
      ),
    ).toBe(false);

    expect(prisma.stripeWebhookEvent.updateMany).not.toHaveBeenCalled();
  });

  it('rejects review transitions after a concurrent claim change', async () => {
    prisma.stripeWebhookEvent.findUnique.mockResolvedValue({
      status: StripeWebhookEventStatus.PROCESSING,
      claimToken: 'token_valid',
      attempts: 3,
    });

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 0 });

    expect(
      await service.requireReview(
        event.id,
        'token_valid',
        'Plan mismatch',
      ),
    ).toBe(false);

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          claimToken: 'token_valid',
          attempts: 3,
        }),
      }),
    );
  });

  it('does not allow automatic claims for REQUIRES_REVIEW events', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({ count: 0 });

    expect(await service.claim(event.id)).toBeNull();

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where.OR).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: StripeWebhookEventStatus.REQUIRES_REVIEW,
        }),
      ]),
    );

    expect(call.where.attempts).toEqual({ lt: 8 });
  });


  it('finalizes expired processing claims after eight attempts', async () => {
    const before = Date.now();

    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 2,
    });

    const result = await service.finalizeExhaustedClaims();

    const after = Date.now();

    expect(result).toBe(2);

    expect(prisma.stripeWebhookEvent.updateMany).toHaveBeenCalledTimes(1);

    const call = prisma.stripeWebhookEvent.updateMany.mock.calls[0][0];

    expect(call.where.status).toBe(
      StripeWebhookEventStatus.PROCESSING,
    );

    expect(call.where.attempts).toEqual({ gte: 8 });

    expect(call.where.processingAt.lte).toBeInstanceOf(Date);

    const cutoff = call.where.processingAt.lte.getTime();

    expect(cutoff).toBeGreaterThanOrEqual(before - 300_000);
    expect(cutoff).toBeLessThanOrEqual(after - 300_000);

    expect(call.data).toEqual({
      status: StripeWebhookEventStatus.REQUIRES_REVIEW,
      claimToken: null,
      processingAt: null,
      nextRetryAt: null,
      processedAt: null,
      lastError:
        'Processing claim expired after maximum retry attempts',
    });

    expect(prisma.stripeWebhookEvent.findUnique).not.toHaveBeenCalled();
  });

  it('returns zero when no exhausted claims are eligible', async () => {
    prisma.stripeWebhookEvent.updateMany.mockResolvedValue({
      count: 0,
    });

    expect(await service.finalizeExhaustedClaims()).toBe(0);
  });

  it('propagates database failures when finalizing exhausted claims', async () => {
    prisma.stripeWebhookEvent.updateMany.mockRejectedValue(
      new Error('Database unavailable'),
    );

    await expect(
      service.finalizeExhaustedClaims(),
    ).rejects.toThrow('Database unavailable');
  });

});
