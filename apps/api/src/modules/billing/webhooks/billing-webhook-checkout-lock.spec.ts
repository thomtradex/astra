import { BillingWebhookService } from './billing-webhook.service';

describe('BillingWebhookService checkout distributed lock', () => {
  const subscriptionId = 'sub_checkout_lock_test';

  function setup(options?: {
    acquire?: boolean;
    ownershipError?: Error;
    subscriptionIdMismatch?: boolean;
    syncFailure?: boolean;
  }) {
    const prisma = {
      checkoutAttempt: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'attempt_checkout_lock',
          organizationId: 'org_checkout_lock',
          planId: 'plan_checkout_lock',
          planCode: 'PROFESSIONAL',
          status: 'CREATING',
          stripeSessionId: null,
          activeOrganizationId: 'org_checkout_lock',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      subscription: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn(),
      },
      billingPlan: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'plan_checkout_lock',
          code: 'PROFESSIONAL',
          trialDays: 0,
        }),
      },
      $transaction: jest.fn().mockImplementation(
        async (callback: (tx: unknown) => Promise<unknown>) =>
          callback(prisma),
      ),
    };

    const lock = {
      acquire: jest.fn().mockImplementation(async (id: string) =>
        options?.acquire === false
          ? null
          : {
              subscriptionId: id,
              token: 'checkout-lock-token',
              generation: 1n,
            },
      ),
      renew: jest.fn().mockResolvedValue(true),
      release: jest.fn().mockResolvedValue(true),
      assertOwnershipInTransaction: jest.fn().mockImplementation(async () => {
        if (options?.ownershipError) {
          throw options.ownershipError;
        }
      }),
    };

    const service = new BillingWebhookService(
      prisma as never,
      undefined,
      lock as never,
    );

    const retrieve = jest.fn().mockImplementation(async (id: string) => ({
      id: options?.subscriptionIdMismatch
        ? 'sub_unexpected'
        : id,
      customer: 'cus_checkout_lock',
      status: 'active',
      metadata: {
        organizationId: 'org_checkout_lock',
        planCode: 'PROFESSIONAL',
      },
      items: {
        data: [],
      },
    }));

    (service as unknown as {
      stripe: {
        subscriptions: {
          retrieve: typeof retrieve;
        };
      };
    }).stripe = {
      subscriptions: { retrieve },
    };

    const surface = service as unknown as {
      handleCheckoutCompleted: (session: unknown) => Promise<void>;
      syncSubscription: (...args: unknown[]) => Promise<boolean>;
    };

    if (options?.syncFailure) {
      jest.spyOn(surface, 'syncSubscription')
        .mockResolvedValue(false);
    }

    const session = {
      id: 'cs_checkout_lock',
      metadata: {
        checkoutAttemptId: 'attempt_checkout_lock',
        organizationId: 'org_checkout_lock',
        planCode: 'PROFESSIONAL',
      },
      subscription: subscriptionId,
      customer: 'cus_checkout_lock',
      status: 'complete',
    };

    return { prisma, lock, retrieve, surface, session };
  }

  it('does not retrieve Stripe or write when the distributed lock is busy', async () => {
    const ctx = setup({ acquire: false });

    await expect(
      ctx.surface.handleCheckoutCompleted(ctx.session),
    ).rejects.toThrow();

    expect(ctx.lock.acquire).toHaveBeenCalledWith(subscriptionId);
    expect(ctx.retrieve).not.toHaveBeenCalled();
    expect(ctx.prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    expect(ctx.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects invalid fencing before checkout writes', async () => {
    const ctx = setup({
      ownershipError: new Error('Checkout lock ownership lost'),
    });

    await expect(
      ctx.surface.handleCheckoutCompleted(ctx.session),
    ).rejects.toThrow('Checkout lock ownership lost');

    expect(ctx.lock.assertOwnershipInTransaction).toHaveBeenCalled();
    expect(ctx.prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    expect(ctx.lock.release).toHaveBeenCalled();
  });

  it('rejects a mismatched Stripe subscription ID before checkout writes', async () => {
    const ctx = setup({ subscriptionIdMismatch: true });

    await expect(
      ctx.surface.handleCheckoutCompleted(ctx.session),
    ).rejects.toThrow('mismatched Stripe subscription ID');

    expect(ctx.prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    expect(ctx.prisma.$transaction).not.toHaveBeenCalled();
    expect(ctx.lock.release).toHaveBeenCalled();
  });

  it('rejects synchronization failure within the checkout transaction', async () => {
    const ctx = setup({ syncFailure: true });

    await expect(
      ctx.surface.handleCheckoutCompleted(ctx.session),
    ).rejects.toThrow('transaction rolled back');

    expect(ctx.lock.assertOwnershipInTransaction).toHaveBeenCalled();
    expect(ctx.prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
    expect(ctx.lock.release).toHaveBeenCalled();
  });
});
