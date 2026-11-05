import { StripeWebhookEventStatus } from '@astra/database';

import { StripeWebhookWorker } from './stripe-webhook-worker.service';
import { StripeWebhookReviewRequiredError } from './stripe-webhook-outcome';

describe('StripeWebhookWorker', () => {
  const events = {
    claim: jest.fn(),
    renewClaim: jest.fn(),
    getEvent: jest.fn(),
    complete: jest.fn(),
    fail: jest.fn(),
    requireReview: jest.fn(),
    finalizeExhaustedClaims: jest.fn(),
    findReadyEvents: jest.fn(),
  };

  const billing = {
    processVerifiedStripeEvent: jest.fn(),
  };

  let worker: StripeWebhookWorker;

  const stored = {
    stripeEventId: 'evt_worker_1',
    eventType: 'invoice.paid',
    status: StripeWebhookEventStatus.PROCESSING,
    claimToken: 'token_1',
    payload: {
      id: 'evt_worker_1',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_worker_1',
        },
      },
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();

    events.claim.mockResolvedValue('token_1');
    events.renewClaim.mockResolvedValue(true);
    events.getEvent.mockResolvedValue(stored);
    events.complete.mockResolvedValue(true);
    events.fail.mockResolvedValue(true);
    events.requireReview.mockResolvedValue(true);
    billing.processVerifiedStripeEvent.mockResolvedValue(undefined);

    worker = new StripeWebhookWorker(
      events as never,
      billing as never,
    );
  });

  describe('processBatch', () => {
    beforeEach(() => {
      events.finalizeExhaustedClaims = jest.fn()
        .mockResolvedValue(0);
      events.findReadyEvents = jest.fn()
        .mockResolvedValue([]);
    });

    it('processes a batch sequentially', async () => {
      events.findReadyEvents.mockResolvedValue([
        'evt_1',
        'evt_2',
      ]);

      const spy = jest.spyOn(worker, 'processOne')
        .mockResolvedValue(true);

      await expect(worker.processBatch(2)).resolves.toEqual({
        discovered: 2,
        completed: 2,
        incomplete: 0,
      });

      expect(spy.mock.calls).toEqual([
        ['evt_1'],
        ['evt_2'],
      ]);

      expect(events.finalizeExhaustedClaims)
        .toHaveBeenCalledTimes(1);
    });

    it('continues after an individual event throws', async () => {
      events.findReadyEvents.mockResolvedValue([
        'evt_1',
        'evt_2',
      ]);

      const spy = jest.spyOn(worker, 'processOne')
        .mockRejectedValueOnce(new Error('Database unavailable'))
        .mockResolvedValueOnce(true);

      await expect(worker.processBatch()).resolves.toEqual({
        discovered: 2,
        completed: 1,
        incomplete: 1,
      });

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('returns zero counts for an empty batch', async () => {
      await expect(worker.processBatch()).resolves.toEqual({
        discovered: 0,
        completed: 0,
        incomplete: 0,
      });

      expect(events.findReadyEvents)
        .toHaveBeenCalledWith(25);
    });

    it('passes the requested limit to event discovery', async () => {
      await worker.processBatch(7);

      expect(events.findReadyEvents)
        .toHaveBeenCalledWith(7);
    });
  });

  describe('claim heartbeat', () => {
    let finishProcessing: (() => void) | undefined;

    beforeEach(() => {
      jest.useFakeTimers();

      events.renewClaim = jest.fn().mockResolvedValue(true);

      billing.processVerifiedStripeEvent.mockImplementation(
        () => new Promise<void>((resolve) => {
          finishProcessing = resolve;
        }),
      );
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      finishProcessing = undefined;
    });

    it('renews the claim during long processing', async () => {
      const processing = worker.processOne('evt_worker_1');

      await jest.advanceTimersByTimeAsync(60_000);

      expect(events.renewClaim).toHaveBeenCalledWith(
        'evt_worker_1',
        'token_1',
      );

      finishProcessing?.();

      await expect(processing).resolves.toBe(true);
      expect(events.complete).toHaveBeenCalledTimes(1);
    });

    it('does not complete after losing the claim', async () => {
      events.renewClaim.mockResolvedValue(false);

      const processing = worker.processOne('evt_worker_1');

      await jest.advanceTimersByTimeAsync(60_000);

      finishProcessing?.();

      await expect(processing).resolves.toBe(false);

      expect(events.complete).not.toHaveBeenCalled();
      expect(events.fail).not.toHaveBeenCalled();
      expect(events.requireReview).not.toHaveBeenCalled();
    });

    it('does not complete after renewal fails', async () => {
      events.renewClaim.mockRejectedValue(
        new Error('Database unavailable'),
      );

      const processing = worker.processOne('evt_worker_1');

      await jest.advanceTimersByTimeAsync(60_000);

      finishProcessing?.();

      await expect(processing).resolves.toBe(false);

      expect(events.complete).not.toHaveBeenCalled();
    });

    it('waits for an in-flight renewal before completion', async () => {
      let finishRenewal: ((value: boolean) => void) | undefined;

      events.renewClaim.mockImplementation(
        () => new Promise<boolean>((resolve) => {
          finishRenewal = resolve;
        }),
      );

      const processing = worker.processOne('evt_worker_1');

      await jest.advanceTimersByTimeAsync(60_000);

      finishProcessing?.();

      await Promise.resolve();
      await Promise.resolve();

      expect(events.complete).not.toHaveBeenCalled();

      finishRenewal?.(true);

      await expect(processing).resolves.toBe(true);

      expect(events.complete).toHaveBeenCalledTimes(1);
    });
  });

  it('does not process an event without a claim', async () => {
    events.claim.mockResolvedValue(null);

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(events.getEvent).not.toHaveBeenCalled();
    expect(billing.processVerifiedStripeEvent).not.toHaveBeenCalled();
  });

  it('processes and completes a valid event', async () => {
    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(true);

    expect(billing.processVerifiedStripeEvent)
      .toHaveBeenCalledWith(stored.payload);

    expect(events.complete)
      .toHaveBeenCalledWith('evt_worker_1', 'token_1');

    expect(events.fail).not.toHaveBeenCalled();
    expect(events.requireReview).not.toHaveBeenCalled();
  });

  it('schedules a retry after a temporary processing failure', async () => {
    billing.processVerifiedStripeEvent.mockRejectedValue(
      new Error('Stripe unavailable'),
    );

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(events.fail).toHaveBeenCalledWith(
      'evt_worker_1',
      'token_1',
      'Stripe unavailable',
    );

    expect(events.complete).not.toHaveBeenCalled();
  });

  it('marks business validation errors for manual review', async () => {
    billing.processVerifiedStripeEvent.mockRejectedValue(
      new StripeWebhookReviewRequiredError(
        'Organization mismatch',
      ),
    );

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(events.requireReview).toHaveBeenCalledWith(
      'evt_worker_1',
      'token_1',
      'Organization mismatch',
    );

    expect(events.fail).not.toHaveBeenCalled();
  });

  it('does not retry when completion throws', async () => {
    events.complete.mockRejectedValue(
      new Error('Database unavailable'),
    );

    await expect(worker.processOne('evt_worker_1'))
      .rejects.toThrow('Database unavailable');

    expect(billing.processVerifiedStripeEvent)
      .toHaveBeenCalledTimes(1);

    expect(events.fail).not.toHaveBeenCalled();
    expect(events.requireReview).not.toHaveBeenCalled();
  });

  it('does not retry when completion rejects the claim', async () => {
    events.complete.mockResolvedValue(false);

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(billing.processVerifiedStripeEvent)
      .toHaveBeenCalledTimes(1);

    expect(events.fail).not.toHaveBeenCalled();
    expect(events.requireReview).not.toHaveBeenCalled();
  });

  it('requires review for an invalid persisted payload', async () => {
    events.getEvent.mockResolvedValue({
      ...stored,
      payload: {
        ...stored.payload,
        id: 'evt_wrong',
      },
    });

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(events.requireReview).toHaveBeenCalledWith(
      'evt_worker_1',
      'token_1',
      'Persisted Stripe event payload is invalid',
    );

    expect(billing.processVerifiedStripeEvent)
      .not.toHaveBeenCalled();

    expect(events.fail).not.toHaveBeenCalled();
  });

  it('does not process an event with a mismatched claim token', async () => {
    events.getEvent.mockResolvedValue({
      ...stored,
      claimToken: 'another_token',
    });

    await expect(worker.processOne('evt_worker_1'))
      .resolves.toBe(false);

    expect(billing.processVerifiedStripeEvent)
      .not.toHaveBeenCalled();

    expect(events.complete).not.toHaveBeenCalled();
  });
});
