import { ServiceUnavailableException } from '@nestjs/common';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeSubscriptionSyncClaim } from './stripe-subscription-sync-lock.service';

describe('BillingWebhookService — distributed transaction fencing', () => {
  const claim: StripeSubscriptionSyncClaim = {
    subscriptionId: 'sub_test_1',
    token: 'claim-token-1',
    generation: 1n,
  };

  const stripeSubscription = {
    id: 'sub_test_1',
    metadata: { organizationId: 'org_1', planCode: 'PRO' },
  };

  const prisma = {
    $transaction: jest.fn(),
  };

  const lock = {
    assertOwnershipInTransaction: jest.fn(),
  };

  let service: BillingWebhookService;

  const synchronize = (
    activeClaim?: StripeSubscriptionSyncClaim,
  ): Promise<boolean> =>
    (
      service as unknown as {
        syncStripeSubscriptionWithRecovery: (
          organizationId: string,
          subscription: unknown,
          claim?: StripeSubscriptionSyncClaim,
        ) => Promise<boolean>;
      }
    ).syncStripeSubscriptionWithRecovery(
      'org_1',
      stripeSubscription,
      activeClaim,
    );

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.NODE_ENV = 'test';
    delete process.env.STRIPE_SECRET_KEY;

    prisma.$transaction.mockImplementation(
      async (operation: (tx: unknown) => Promise<unknown>) =>
        operation(prisma),
    );

    lock.assertOwnershipInTransaction.mockResolvedValue(undefined);

    service = new BillingWebhookService(
      prisma as never,
      undefined,
      lock as never,
    );

    jest.spyOn(
      service as never,
      'syncSubscription',
    ).mockResolvedValue(true as never);
  });

  it('validates ownership inside the transaction before synchronization', async () => {
    await expect(synchronize(claim)).resolves.toBe(true);

    expect(lock.assertOwnershipInTransaction).toHaveBeenCalledWith(
      prisma,
      claim,
    );

    const sync = (
      service as unknown as {
        syncSubscription: jest.Mock;
      }
    ).syncSubscription;

    expect(sync).toHaveBeenCalledTimes(1);

    const fencingOrder =
      lock.assertOwnershipInTransaction.mock.invocationCallOrder[0];

    const syncOrder = sync.mock.invocationCallOrder[0];

    expect(fencingOrder).toBeDefined();
    expect(syncOrder).toBeDefined();

    expect(fencingOrder!).toBeLessThan(syncOrder!);
  });

  it('rejects a claim for a different subscription', async () => {
    await expect(
      synchronize({
        ...claim,
        subscriptionId: 'sub_different',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(lock.assertOwnershipInTransaction).not.toHaveBeenCalled();
  });

  it('rejects a lost claim without synchronizing', async () => {
    lock.assertOwnershipInTransaction.mockRejectedValue(
      new Error('Claim expired'),
    );

    await expect(synchronize(claim)).rejects.toThrow('Claim expired');

    const sync = (
      service as unknown as {
        syncSubscription: jest.Mock;
      }
    ).syncSubscription;

    expect(sync).not.toHaveBeenCalled();
  });

  it('rejects a claim when the lock dependency is missing', async () => {
    service = new BillingWebhookService(prisma as never);

    const sync = jest.spyOn(
      service as never,
      'syncSubscription',
    ).mockResolvedValue(true as never);

    await expect(synchronize(claim)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    expect(sync).not.toHaveBeenCalled();
  });
});
