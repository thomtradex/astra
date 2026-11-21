import { ServiceUnavailableException } from '@nestjs/common';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeSubscriptionSyncClaim } from './stripe-subscription-sync-lock.service';

describe('BillingWebhookService — distributed lock wrapper', () => {
  const claim: StripeSubscriptionSyncClaim = {
    subscriptionId: 'sub_test_1',
    token: 'token_test_1',
    generation: 1n,
  };

  const lock = {
    acquire: jest.fn(),
    renew: jest.fn(),
    release: jest.fn(),
  };

  let service: BillingWebhookService;

  const execute = (
    operation: (claim: StripeSubscriptionSyncClaim) => Promise<unknown>,
  ) =>
    (
      service as unknown as {
        withDistributedSubscriptionLock: (
          subscriptionId: string,
          operation: (claim: StripeSubscriptionSyncClaim) => Promise<unknown>,
        ) => Promise<unknown>;
      }
    ).withDistributedSubscriptionLock('sub_test_1', operation);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';

    lock.acquire.mockResolvedValue(claim);
    lock.renew.mockResolvedValue(true);
    lock.release.mockResolvedValue(true);

    service = new BillingWebhookService(
      {} as never,
      undefined,
      lock as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('acquires and releases the lock after successful execution', async () => {
    const operation = jest.fn().mockResolvedValue('completed');

    await expect(execute(operation)).resolves.toBe('completed');

    expect(lock.acquire).toHaveBeenCalledWith('sub_test_1');
    expect(operation).toHaveBeenCalledWith(claim);
    expect(lock.release).toHaveBeenCalledWith(claim);
  });

  it('rejects a busy lock without running the operation', async () => {
    lock.acquire.mockResolvedValue(null);
    const operation = jest.fn();

    await expect(execute(operation)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    expect(operation).not.toHaveBeenCalled();
    expect(lock.release).not.toHaveBeenCalled();
  });

  it('rejects when the lock dependency is unavailable', async () => {
    service = new BillingWebhookService({} as never);
    const operation = jest.fn();

    await expect(execute(operation)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    expect(operation).not.toHaveBeenCalled();
  });

  it('releases the lock when the operation throws', async () => {
    const failure = new Error('Synchronization failed');

    await expect(
      execute(async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);

    expect(lock.release).toHaveBeenCalledWith(claim);
  });

  it('rejects successful completion when release throws', async () => {
    lock.release.mockRejectedValue(new Error('Release failed'));

    await expect(
      execute(async () => 'completed'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(lock.release).toHaveBeenCalledWith(claim);
  });

  it('detects a lost lock during heartbeat renewal', async () => {
    jest.useFakeTimers();
    lock.renew.mockResolvedValue(false);

    let finishOperation: (() => void) | undefined;

    const operationWait = new Promise<void>((resolve) => {
      finishOperation = resolve;
    });

    const running = execute(async () => {
      await operationWait;
      return 'completed';
    });

    await jest.advanceTimersByTimeAsync(15_000);

    finishOperation?.();

    await expect(running).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    expect(lock.renew).toHaveBeenCalledWith(claim);
    expect(lock.release).toHaveBeenCalledWith(claim);
  });

  it('does not overlap heartbeat renewals while one is pending', async () => {
    jest.useFakeTimers();

    let finishRenewal!: (value: boolean) => void;
    let finishOperation!: () => void;

    const renewal = new Promise<boolean>((resolve) => {
      finishRenewal = resolve;
    });

    const operationWait = new Promise<void>((resolve) => {
      finishOperation = resolve;
    });

    lock.renew.mockImplementation(() => renewal);

    try {
      const running = execute(async () => {
        await operationWait;
        return 'completed';
      });

      await jest.advanceTimersByTimeAsync(15_000);

      expect(lock.renew).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(45_000);

      expect(lock.renew).toHaveBeenCalledTimes(1);

      finishOperation();

      let completed = false;

      const observed = running.then((value) => {
        completed = true;
        return value;
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(completed).toBe(false);
      expect(lock.release).not.toHaveBeenCalled();

      finishRenewal(true);

      await expect(observed).resolves.toBe('completed');

      expect(lock.release).toHaveBeenCalledTimes(1);
      expect(lock.renew).toHaveBeenCalledTimes(1);
    } finally {
      finishRenewal(true);
      finishOperation();
      jest.useRealTimers();
    }
  });


  it('rejects when heartbeat renewal throws an exception', async () => {
    jest.useFakeTimers();

    let finishOperation!: () => void;

    const operationWait = new Promise<void>((resolve) => {
      finishOperation = resolve;
    });

    lock.renew.mockRejectedValue(
      new Error('PostgreSQL connection unavailable'),
    );

    try {
      const running = execute(async () => {
        await operationWait;
        return 'completed';
      });

      await jest.advanceTimersByTimeAsync(15_000);

      finishOperation();

      await expect(running).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );

      expect(lock.renew).toHaveBeenCalledTimes(1);
      expect(lock.release).toHaveBeenCalledWith(claim);
    } finally {
      finishOperation();
      jest.useRealTimers();
    }
  });

  it('rejects completion after a pending renewal reports lost ownership', async () => {
    jest.useFakeTimers();

    let finishRenewal!: (value: boolean) => void;
    let finishOperation!: () => void;

    const renewal = new Promise<boolean>((resolve) => {
      finishRenewal = resolve;
    });

    const operationWait = new Promise<void>((resolve) => {
      finishOperation = resolve;
    });

    lock.renew.mockImplementation(() => renewal);

    try {
      const running = execute(async () => {
        await operationWait;
        return 'completed';
      });

      await jest.advanceTimersByTimeAsync(15_000);

      expect(lock.renew).toHaveBeenCalledTimes(1);

      finishOperation();

      await Promise.resolve();
      await Promise.resolve();

      expect(lock.release).not.toHaveBeenCalled();

      finishRenewal(false);

      await expect(running).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );

      expect(lock.release).toHaveBeenCalledWith(claim);
    } finally {
      finishRenewal(false);
      finishOperation();
      jest.useRealTimers();
    }
  });

});
