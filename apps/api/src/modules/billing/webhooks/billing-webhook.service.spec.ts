import { StripeWebhookReviewRequiredError } from './stripe-webhook-outcome';
import { CheckoutAttemptStatus, SubscriptionStatus } from '@astra/database';

import { BillingWebhookService } from './billing-webhook.service';

describe('BillingWebhookService', () => {
  const expectLastSubscriptionUpdate = (
    updateMock: { mock: { calls: unknown[][] } },
    expected: {
      where: { id: string };
      data: Record<string, unknown>;
    },
  ) => {
    const lastCall = updateMock.mock.calls.at(-1)?.[0] as
      | { where?: { id?: string }; data?: Record<string, unknown> }
      | undefined;

    expect(lastCall).toMatchObject(expected);
  };

  const prisma = {
    $transaction: jest.fn(),
    billingPlan: {
      findUnique: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    checkoutAttempt: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  let service: BillingWebhookService;

type BillingWebhookTestSurface = {
  syncSubscription: (
    organizationId: string,
    subscription: typeof stripeSubscription,
  ) => Promise<unknown>;
  handleInvoiceEvent: (event: {
    id: string;
    status: string;
    parent?: {
      subscription_details?: {
        subscription: string | { id: string };
      } | null;
    } | null;
    subscription?: string | { id: string } | null;
  }) => Promise<unknown>;
  handleSubscriptionEvent: (
    subscription: Omit<typeof stripeSubscription, 'metadata'> & {
      metadata?: {
        organizationId?: string;
        planCode?: string;
      };
    },
  ) => Promise<unknown>;
  handleCheckoutCompleted: (session: {
    id: string;
    metadata: {
      checkoutAttemptId: string;
      organizationId: string;
      planCode: string;
    };
    subscription: string;
    customer: string;
    status: 'complete';
  }) => Promise<unknown>;
  handleCheckoutExpired: (session: {
    id: string;
    metadata: {
      checkoutAttemptId: string;
      organizationId: string;
      planCode: string;
    };
  }) => Promise<unknown>;
  mapStripeStatus: (status: string) => SubscriptionStatus;
};


  const stripeSubscription = {
    id: 'sub_stripe_1',
    status: 'active',
    customer: 'cus_1',
    cancel_at_period_end: false,
    cancel_at: null,
    trial_start: null,
    trial_end: null,
    metadata: {
      organizationId: 'org_1',
      planCode: 'PROFESSIONAL',
    },
    items: {
      data: [
        {
          current_period_start: 1700000000,
          current_period_end: 1702592000,
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (operation: (tx: typeof prisma) => Promise<unknown>) =>
        operation(prisma),
    );
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    const subscriptionSyncLock = {
    acquire: jest.fn().mockImplementation(async (subscriptionId: string) => ({
      subscriptionId,
      token: 'test-claim-token',
      generation: 1n,
    })),
    renew: jest.fn().mockResolvedValue(true),
    release: jest.fn().mockResolvedValue(true),
    assertOwnershipInTransaction: jest.fn().mockResolvedValue(undefined),
  };

  service = new BillingWebhookService(
    prisma as never,
    undefined,
    subscriptionSyncLock as never,
  );

    prisma.checkoutAttempt.findUnique.mockResolvedValue({
      id: 'attempt_1',
      organizationId: 'org_1',
      planId: 'plan-pro',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.CREATING,
      stripeSessionId: null,
      activeOrganizationId: 'org_1',
    });
    prisma.checkoutAttempt.updateMany.mockResolvedValue({ count: 1 });

    const stripeClient = (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe;

    stripeClient.subscriptions.retrieve = jest.fn().mockImplementation(
      (subscriptionId: string) => ({
        ...stripeSubscription,
        id: subscriptionId,
      }),
    );
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('creates a local subscription when a Stripe subscription arrives first', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    prisma.subscription.create.mockResolvedValue({
      id: 'local-sub-1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).syncSubscription('org_1', stripeSubscription);

    expect(prisma.subscription.create).toHaveBeenCalledWith({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        organizationId: 'org_1',
        planId: 'plan-pro',
        provider: 'stripe',
        providerCustomerId: 'cus_1',
        providerSubscriptionId: 'sub_stripe_1',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(1700000000 * 1000),
        currentPeriodEnd: new Date(1702592000 * 1000),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        trialStart: null,
        trialEnd: null,
      }),
    });
  });

  it('updates the existing Stripe subscription instead of creating a duplicate', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).syncSubscription('org_1', stripeSubscription);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: {
        id: 'local-sub-1',
      },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        planId: 'plan-pro',
        providerSubscriptionId: 'sub_stripe_1',
        status: SubscriptionStatus.ACTIVE,
      }),
    });

    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('reuses the current active local subscription when Stripe provider id is not yet attached', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'local-sub-2',
        organizationId: 'org_1',
        status: SubscriptionStatus.TRIALING,
      });

    await ((service as unknown) as BillingWebhookTestSurface).syncSubscription('org_1', stripeSubscription);

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: {
        id: 'local-sub-2',
      },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_1',
        planId: 'plan-pro',
      }),
    });

    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it.each([
    { planCode: 'STARTER', planId: 'plan-starter' },
    { planCode: 'PROFESSIONAL', planId: 'plan-pro' },
  ])(
    'reuses the existing FREE subscription when converting to $planCode',
    async ({ planCode, planId }) => {
      prisma.billingPlan.findUnique.mockResolvedValue({
        id: planId,
        code: planCode,
        trialDays: 0,
      });

      prisma.subscription.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'local-free-sub',
          organizationId: 'org_1',
          status: SubscriptionStatus.ACTIVE,
          plan: { code: 'FREE' },
        });

      await ((service as unknown) as BillingWebhookTestSurface).syncSubscription(
        'org_1',
        {
          ...stripeSubscription,
          metadata: {
            ...stripeSubscription.metadata,
            planCode,
          },
        },
      );

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'local-free-sub' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          planId,
          provider: 'stripe',
          providerSubscriptionId: 'sub_stripe_1',
          status: SubscriptionStatus.ACTIVE,
        }),
      });

      expect(prisma.subscription.create).not.toHaveBeenCalled();
    },
  );

  it('does not update a Stripe subscription owned by another organization', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-org-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).syncSubscription(
      'org_2',
      stripeSubscription,
    );

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('does not replace a different Stripe subscription on the latest local subscription', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'local-sub-org-1',
        organizationId: 'org_1',
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_existing',
        status: SubscriptionStatus.ACTIVE,
      });

    await ((service as unknown) as BillingWebhookTestSurface).syncSubscription(
      'org_1',
      {
        ...stripeSubscription,
        id: 'sub_stripe_new',
      },
    );

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('marks the checkout attempt as completed after successful subscription synchronization', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    prisma.subscription.create.mockResolvedValue({
      id: 'local-sub-created',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_success',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'attempt_1',
          organizationId: 'org_1',
          planId: 'plan-pro',
        }),
        data: expect.objectContaining({
          status: CheckoutAttemptStatus.COMPLETED,
          stripeSessionId: 'cs_success',
          activeOrganizationId: null,
        }),
      }),
    );
  });

  it('does not process a checkout attempt that is already completed', async () => {
    prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
      id: 'attempt_1',
      organizationId: 'org_1',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.COMPLETED,
      stripeSessionId: 'cs_already_completed',
      activeOrganizationId: null,
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_already_completed',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    });

    expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('rejects a completed checkout attempt belonging to a different Stripe session', async () => {
    prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
      id: 'attempt_1',
      organizationId: 'org_1',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.COMPLETED,
      stripeSessionId: 'cs_original',
      activeOrganizationId: null,
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
        id: 'cs_conflicting',
        metadata: {
          checkoutAttemptId: 'attempt_1',
          organizationId: 'org_1',
          planCode: 'PROFESSIONAL',
        },
        subscription: 'sub_stripe_1',
        customer: 'cus_1',
        status: 'complete',
      }),
    ).rejects.toThrow('conflicts with the completed checkout session');

    expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('marks an open checkout attempt as expired and releases its organization slot', async () => {
    prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
      id: 'attempt_1',
      organizationId: 'org_1',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.OPEN,
      stripeSessionId: 'cs_expired',
      activeOrganizationId: 'org_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleCheckoutExpired({
      id: 'cs_expired',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
    });

    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
        status: {
          in: [CheckoutAttemptStatus.CREATING, CheckoutAttemptStatus.OPEN],
        },
        OR: [
          { stripeSessionId: 'cs_expired' },
          {
            stripeSessionId: null,
            status: CheckoutAttemptStatus.CREATING,
          },
        ],
      },
      data: {
        status: CheckoutAttemptStatus.EXPIRED,
        activeOrganizationId: null,
      },
    });
  });

  it('does not replace an existing Stripe subscription during checkout completion', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'local-sub-org-1',
        organizationId: 'org_1',
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_existing',
        status: SubscriptionStatus.ACTIVE,
      });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_new',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_new',
      customer: 'cus_1',
      status: 'complete',
    }),
    ).rejects.toThrow('transaction rolled back');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('does not associate a checkout with a Stripe subscription owned by another organization', async () => {
    prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
      id: 'attempt_1',
      organizationId: 'org_2',
      planId: 'plan-pro',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.CREATING,
      stripeSessionId: null,
      activeOrganizationId: 'org_2',
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      id: 'sub_stripe_new',
      metadata: {
        ...stripeSubscription.metadata,
        organizationId: 'org_2',
      },
    });

    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-org-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_new',
      status: SubscriptionStatus.ACTIVE,
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_org_2',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_2',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_new',
      customer: 'cus_2',
      status: 'complete',
    }),
    ).rejects.toThrow('transaction rolled back');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('rejects checkout when Stripe organization metadata conflicts with the session', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        ...stripeSubscription.metadata,
        organizationId: 'org_2',
      },
    });

    await expect(((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_org_mismatch',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('organization metadata does not match Stripe subscription');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('rejects checkout when Stripe plan metadata conflicts with the session', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        ...stripeSubscription.metadata,
        planCode: 'STARTER',
      },
    });

    await expect(((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_plan_mismatch',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('plan metadata does not match Stripe subscription');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('does not synchronize checkout when the Stripe plan has no local mapping', async () => {
    prisma.billingPlan.findUnique.mockResolvedValueOnce(null);

    await expect(((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_missing_plan_mapping',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('transaction rolled back');

    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
  });

  it('does not synchronize checkout when the local plan ID differs from the persisted attempt', async () => {
    prisma.billingPlan.findUnique.mockResolvedValueOnce({
      id: 'different-plan-id',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    await expect(((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_plan_id_mismatch',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('transaction rolled back');

    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
  });

  it('rejects checkout when Stripe organization metadata is missing', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        planCode: 'PROFESSIONAL',
      },
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_missing_org_metadata',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        planCode: 'PROFESSIONAL',
      } as never,
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('is missing checkoutAttemptId, organizationId or planCode metadata');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
  });

  it('rejects checkout when Stripe plan metadata is missing', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        organizationId: 'org_1',
      },
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_missing_plan_metadata',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
      } as never,
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    })).rejects.toThrow('is missing checkoutAttemptId, organizationId or planCode metadata');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
  });

  it('propagates checkout errors when retrieving the Stripe subscription fails', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockRejectedValueOnce(
      new Error('Stripe unavailable'),
    );

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
        id: 'cs_retrieve_error',
        metadata: {
          checkoutAttemptId: 'attempt_1',
          organizationId: 'org_1',
          planCode: 'PROFESSIONAL',
        },
        subscription: 'sub_stripe_1',
        customer: 'cus_1',
        status: 'complete',
      }),
    ).rejects.toThrow('Stripe unavailable');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });


  it('does not synchronize when expiration wins the conditional checkout transition', async () => {
    prisma.checkoutAttempt.updateMany.mockResolvedValueOnce({ count: 0 });
    prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
      id: 'attempt_1',
      organizationId: 'org_1',
      planId: 'plan-pro',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.CREATING,
      stripeSessionId: null,
    }).mockResolvedValueOnce({
      id: 'attempt_1',
      status: CheckoutAttemptStatus.EXPIRED,
      stripeSessionId: 'cs_race',
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
      id: 'cs_race',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
      subscription: 'sub_stripe_1',
      customer: 'cus_1',
      status: 'complete',
    }),
    ).rejects.toThrow('requires Stripe reconciliation');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('propagates subscription persistence failures from checkout transaction', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
    });
    prisma.subscription.findFirst.mockResolvedValue(null);
    prisma.subscription.create.mockRejectedValueOnce(
      new Error('Database write failed'),
    );

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutCompleted({
        id: 'cs_write_failure',
        metadata: {
          checkoutAttemptId: 'attempt_1',
          organizationId: 'org_1',
          planCode: 'PROFESSIONAL',
        },
        subscription: 'sub_stripe_1',
        customer: 'cus_1',
        status: 'complete',
      }),
    ).rejects.toThrow('Database write failed');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });


  describe('reconciles expiration after a conditional update conflict', () => {
    const session = {
      id: 'cs_expired_race',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
    };

    const initialAttempt = {
      id: 'attempt_1',
      organizationId: 'org_1',
      planCode: 'PROFESSIONAL',
      status: CheckoutAttemptStatus.OPEN,
      stripeSessionId: 'cs_expired_race',
    };

    beforeEach(() => {
      prisma.checkoutAttempt.updateMany.mockResolvedValueOnce({ count: 0 });
      prisma.checkoutAttempt.findUnique.mockReset();
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce(initialAttempt);
    });

    it('accepts an expiration already applied', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
        ...initialAttempt,
        status: CheckoutAttemptStatus.EXPIRED,
      });

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).resolves.toBeUndefined();

      expect(prisma.checkoutAttempt.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
    });

    it('preserves a checkout completed by a concurrent event', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
        ...initialAttempt,
        status: CheckoutAttemptStatus.COMPLETED,
      });

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).resolves.toBeUndefined();

      expect(prisma.checkoutAttempt.findUnique).toHaveBeenCalledTimes(2);
    });

    it('rejects an unresolved checkout that remains open', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce(initialAttempt);

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('could not be reconciled');

      expect(prisma.checkoutAttempt.findUnique).toHaveBeenCalledTimes(2);
    });

    it('rejects a conflicting Stripe session', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
        ...initialAttempt,
        stripeSessionId: 'cs_different',
      });

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('conflicts with its latest persisted attempt');

      expect(prisma.checkoutAttempt.findUnique).toHaveBeenCalledTimes(2);
    });

    it('rejects a checkout attempt missing after the conflict', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce(null);

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('could not be reconciled');

      expect(prisma.checkoutAttempt.findUnique).toHaveBeenCalledTimes(2);
    });
  });


  describe('validates expired checkout metadata and identity', () => {
    const session = {
      id: 'cs_expiration_validation',
      metadata: {
        checkoutAttemptId: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
      },
    };

    it('rejects missing required metadata', async () => {
      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired({
            ...session,
            metadata: {
              ...session.metadata,
              organizationId: undefined,
            } as never,
          }),
      ).rejects.toThrow('has missing required metadata');

      expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a checkout attempt that does not exist', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce(null);

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('was not found');

      expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a conflicting organization', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
        id: 'attempt_1',
        organizationId: 'org_different',
        planCode: 'PROFESSIONAL',
        status: CheckoutAttemptStatus.OPEN,
        stripeSessionId: session.id,
      });

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('metadata conflicts with persisted attempt');

      expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    });

    it('rejects a conflicting Stripe session', async () => {
      prisma.checkoutAttempt.findUnique.mockResolvedValueOnce({
        id: 'attempt_1',
        organizationId: 'org_1',
        planCode: 'PROFESSIONAL',
        status: CheckoutAttemptStatus.OPEN,
        stripeSessionId: 'cs_different',
      });

      await expect(
        ((service as unknown) as BillingWebhookTestSurface)
          .handleCheckoutExpired(session),
      ).rejects.toThrow('conflicts with persisted Stripe session');

      expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
    });
  });

  it('rejects expiration when persisted checkout plan differs', async () => {
    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleCheckoutExpired({
        id: 'cs_wrong_plan',
        metadata: {
          checkoutAttemptId: 'attempt_1',
          organizationId: 'org_1',
          planCode: 'STARTER',
        },
      }),
    ).rejects.toThrow('metadata conflicts with persisted attempt');

    expect(prisma.checkoutAttempt.updateMany).not.toHaveBeenCalled();
  });

  it('reconciles an invoice using the modern parent subscription ID', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_modern_id',
      status: 'paid',
      parent: {
        subscription_details: {
          subscription: 'sub_stripe_1',
        },
      },
    });

    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_1',
      },
    });
    expect(prisma.subscription.update).toHaveBeenCalled();
  });

  it('reconciles an invoice using the modern expanded subscription object', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_modern_object',
      status: 'paid',
      parent: {
        subscription_details: {
          subscription: { id: 'sub_stripe_1' },
        },
      },
    });

    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_1',
      },
    });
    expect(prisma.subscription.update).toHaveBeenCalled();
  });

  it('continues to support legacy invoice subscription IDs', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_legacy',
      status: 'paid',
      subscription: 'sub_stripe_1',
    });

    expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_1',
      },
    });
    expect(prisma.subscription.update).toHaveBeenCalled();
  });

  it('ignores invoices without a subscription reference', async () => {
    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_without_subscription',
      status: 'paid',
    });

    expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  it('rejects invoice reconciliation when Stripe organization metadata conflicts with the local subscription', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        ...stripeSubscription.metadata,
        organizationId: 'org_2',
      },
    });

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
        id: 'in_org_mismatch',
        status: 'paid',
        subscription: 'sub_stripe_1',
      }),
    ).rejects.toThrow('Stripe subscription organization metadata mismatch');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('marks a paid invoice subscription as active', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
      status: SubscriptionStatus.PAST_DUE,
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_paid',
      status: 'paid',
      subscription: 'sub_stripe_1',
    });

    expectLastSubscriptionUpdate(prisma.subscription.update, {
      where: { id: 'local-sub-1' },
      data: {
        status: SubscriptionStatus.ACTIVE,
        providerSubscriptionId: 'sub_stripe_1',
      },
    });
  });

  it('propagates Stripe retrieval failures during invoice reconciliation', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockRejectedValueOnce(
      new Error('Stripe unavailable'),
    );

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
        id: 'in_retrieve_error',
        status: 'paid',
        subscription: 'sub_stripe_1',
      }),
    ).rejects.toThrow('Stripe unavailable');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  it('propagates Prisma update failures during invoice reconciliation', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });
    prisma.subscription.update.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    await expect(
      ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
        id: 'in_database_error',
        status: 'paid',
        subscription: 'sub_stripe_1',
      }),
    ).rejects.toThrow('Database unavailable');
  });

  it('propagates Prisma create failures when synchronizing a new subscription', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });
    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.subscription.create.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    await expect(
      (
        service as unknown as BillingWebhookTestSurface
      ).syncSubscription('org_1', stripeSubscription),
    ).rejects.toThrow('Database unavailable');
  });

  it('marks an open invoice subscription as past due', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
      status: SubscriptionStatus.ACTIVE,
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      status: 'past_due',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_open',
      status: 'open',
      subscription: 'sub_stripe_1',
    });

    expectLastSubscriptionUpdate(prisma.subscription.update, {
      where: { id: 'local-sub-1' },
      data: {
        status: SubscriptionStatus.PAST_DUE,
        providerSubscriptionId: 'sub_stripe_1',
      },
    });
  });

  it('does not reactivate a canceled subscription from a historical paid invoice', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
      status: SubscriptionStatus.CANCELED,
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      status: 'canceled',
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_old_paid',
      status: 'paid',
      subscription: 'sub_stripe_1',
    });

    expectLastSubscriptionUpdate(prisma.subscription.update, {
      where: { id: 'local-sub-1' },
      data: { status: SubscriptionStatus.CANCELED },
    });
  });

  it('uses the current Stripe state instead of a stale subscription event', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      trialDays: 0,
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      status: 'canceled',
    });

    await (
      service as unknown as BillingWebhookTestSurface
    ).handleSubscriptionEvent({
      ...stripeSubscription,
      status: 'active',
    });

    expect(
      (
        service as unknown as {
          stripe: { subscriptions: { retrieve: jest.Mock } };
        }
      ).stripe.subscriptions.retrieve,
    ).toHaveBeenCalledWith('sub_stripe_1');

    expectLastSubscriptionUpdate(prisma.subscription.update, {
      where: { id: 'local-sub-1' },
      data: { status: SubscriptionStatus.CANCELED },
    });
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

  it('propagates errors when retrieving the current Stripe subscription state fails', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockRejectedValueOnce(
      new Error('Stripe unavailable'),
    );

    await expect(
      (
        service as unknown as BillingWebhookTestSurface
      ).handleSubscriptionEvent(stripeSubscription),
    ).rejects.toThrow('Stripe unavailable');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.billingPlan.findUnique).not.toHaveBeenCalled();
  });

  it('does not synchronize when current Stripe organization metadata conflicts with the event', async () => {
    (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
      ...stripeSubscription,
      metadata: {
        ...stripeSubscription.metadata,
        organizationId: 'org_2',
      },
    });

    await expect(
      (
        service as unknown as BillingWebhookTestSurface
      ).handleSubscriptionEvent(stripeSubscription),
    ).rejects.toThrow('organization metadata mismatch');

    expect(prisma.subscription.update).not.toHaveBeenCalled();
    expect(prisma.subscription.create).not.toHaveBeenCalled();
    expect(prisma.billingPlan.findUnique).not.toHaveBeenCalled();
  });


  describe('rejects mismatched Stripe subscription identifiers', () => {
    it('rejects a different subscription ID returned by Stripe', async () => {
      (
        service as unknown as {
          stripe: { subscriptions: { retrieve: jest.Mock } };
        }
      ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
        ...stripeSubscription,
        id: 'sub_unexpected',
      });

      await expect(
        (
          service as unknown as BillingWebhookTestSurface
        ).handleSubscriptionEvent(stripeSubscription),
      ).rejects.toThrow('returned a mismatched Stripe subscription ID');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });

    it('rejects a different subscription ID when reconciling an invoice', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce({
        id: 'local-sub-1',
        organizationId: 'org_1',
        provider: 'stripe',
        providerSubscriptionId: 'sub_stripe_1',
      });

      (
        service as unknown as {
          stripe: { subscriptions: { retrieve: jest.Mock } };
        }
      ).stripe.subscriptions.retrieve.mockResolvedValueOnce({
        ...stripeSubscription,
        id: 'sub_unexpected',
      });

      await expect(
        (
          service as unknown as BillingWebhookTestSurface
        ).handleInvoiceEvent({
          id: 'in_wrong_subscription_id',
          status: 'paid',
          subscription: 'sub_stripe_1',
        }),
      ).rejects.toThrow('returned a mismatched Stripe subscription ID');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });
  });


  describe('retries temporarily unmapped Stripe events', () => {
    it('rejects a subscription without organization metadata or local mapping', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce(null);

      await expect(
        (
          service as unknown as BillingWebhookTestSurface
        ).handleSubscriptionEvent({
          ...stripeSubscription,
          metadata: {},
        }),
      ).rejects.toThrow('has no organization mapping yet');

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          provider: 'stripe',
          providerSubscriptionId: 'sub_stripe_1',
        },
      });

      expect(prisma.subscription.update).not.toHaveBeenCalled();
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });

    it('rejects an invoice whose subscription is not yet stored locally', async () => {
      prisma.subscription.findFirst.mockResolvedValueOnce(null);

      await expect(
        (
          service as unknown as BillingWebhookTestSurface
        ).handleInvoiceEvent({
          id: 'in_subscription_not_yet_local',
          status: 'paid',
          subscription: 'sub_stripe_1',
        }),
      ).rejects.toThrow('has no local subscription yet');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });
  });

  it('maps Stripe subscription statuses correctly', () => {
    expect(((service as unknown) as BillingWebhookTestSurface).mapStripeStatus('trialing')).toBe(
      SubscriptionStatus.TRIALING,
    );
    expect(((service as unknown) as BillingWebhookTestSurface).mapStripeStatus('active')).toBe(
      SubscriptionStatus.ACTIVE,
    );
    expect(((service as unknown) as BillingWebhookTestSurface).mapStripeStatus('past_due')).toBe(
      SubscriptionStatus.PAST_DUE,
    );
    expect(((service as unknown) as BillingWebhookTestSurface).mapStripeStatus('unpaid')).toBe(
      SubscriptionStatus.PAST_DUE,
    );
    expect(((service as unknown) as BillingWebhookTestSurface).mapStripeStatus('canceled')).toBe(
      SubscriptionStatus.CANCELED,
    );
  });
  it('propagates subscription synchronization rejection', async () => {
    const surface = service as unknown as BillingWebhookTestSurface;

    const syncSpy = jest
      .spyOn(surface, 'syncSubscription')
      .mockResolvedValueOnce(false);

    await expect(
      surface.handleSubscriptionEvent(stripeSubscription),
    ).rejects.toThrow('could not be synchronized');

    expect(syncSpy).toHaveBeenCalled();
    syncSpy.mockRestore();
  });

  it('propagates invoice synchronization rejection', async () => {
    const surface = service as unknown as BillingWebhookTestSurface;

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    const syncSpy = jest
      .spyOn(surface, 'syncSubscription')
      .mockResolvedValueOnce(false);

    await expect(
      surface.handleInvoiceEvent({
        id: 'in_sync_rejected',
        status: 'paid',
        subscription: 'sub_stripe_1',
      }),
    ).rejects.toThrow('subscription synchronization failed');

    expect(syncSpy).toHaveBeenCalled();
    syncSpy.mockRestore();
  });


  describe('serializable synchronization', () => {
    it('uses a serializable transaction for subscription events', async () => {
      const surface = service as unknown as BillingWebhookTestSurface;

      await surface.handleSubscriptionEvent(stripeSubscription);

      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          isolationLevel: 'Serializable',
        }),
      );
    });

    it('uses a serializable transaction for invoice events', async () => {
      const surface = service as unknown as BillingWebhookTestSurface;

      await surface.handleInvoiceEvent({
        id: 'in_serializable',
        status: 'paid',
        parent: {
          subscription_details: {
            subscription: 'sub_stripe_1',
          },
        },
      });

      expect(prisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          isolationLevel: 'Serializable',
        }),
      );
    });
  });


  it('does not silently accept a subscription uniqueness conflict', async () => {
    const { Prisma } = await import('@astra/database');

    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
    });

    prisma.subscription.findFirst.mockResolvedValue(null);

    const conflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '6.19.3',
      },
    );

    prisma.subscription.create.mockRejectedValue(conflict);

    const surface = service as unknown as BillingWebhookTestSurface;

    await expect(
      surface.handleSubscriptionEvent(stripeSubscription),
    ).rejects.toBe(conflict);

    expect(prisma.subscription.create).toHaveBeenCalledTimes(1);
  });




  it('does not overwrite a newer Stripe state with an older concurrent synchronization', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      organizationId: 'org_1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
    });

    let releaseOlderWrite: (() => void) | undefined;
    let signalOlderWrite: (() => void) | undefined;

    const olderWriteStarted = new Promise<void>((resolve) => {
      signalOlderWrite = resolve;
    });

    const olderWriteReleased = new Promise<void>((resolve) => {
      releaseOlderWrite = resolve;
    });

    let persistedStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE;

    prisma.subscription.update.mockImplementation(
      async (args: { data: { status: SubscriptionStatus } }) => {
        if (args.data.status === SubscriptionStatus.ACTIVE) {
          signalOlderWrite?.();
          await olderWriteReleased;
        }

        persistedStatus = args.data.status;
        return { id: 'local-sub-1', status: persistedStatus };
      },
    );

    const stripeClient = (
      service as unknown as {
        stripe: { subscriptions: { retrieve: jest.Mock } };
      }
    ).stripe;

    stripeClient.subscriptions.retrieve
      .mockResolvedValueOnce({
        ...stripeSubscription,
        status: 'active',
      })
      .mockResolvedValueOnce({
        ...stripeSubscription,
        status: 'canceled',
      });

    const surface = service as unknown as BillingWebhookTestSurface;

    const older = surface.handleSubscriptionEvent(stripeSubscription);

    await olderWriteStarted;

    const newer = surface.handleSubscriptionEvent({
      ...stripeSubscription,
      status: 'canceled',
    });

    releaseOlderWrite?.();

    await Promise.all([older, newer]);

    expect(persistedStatus).toBe(SubscriptionStatus.CANCELED);
  });

  describe('subscription P2002 recovery', () => {
    it('retries synchronization after a recoverable uniqueness race', async () => {
      const { Prisma } = await import('@astra/database');

      const conflict = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.19.3',
          meta: {
            target: ['provider', 'provider_subscription_id'],
          },
        },
      );

      prisma.billingPlan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        code: 'PROFESSIONAL',
      });

      prisma.subscription.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'local-sub-created-concurrently',
          organizationId: 'org_1',
          provider: 'stripe',
          providerSubscriptionId: 'sub_stripe_1',
        })
        .mockResolvedValueOnce({
          id: 'local-sub-created-concurrently',
          organizationId: 'org_1',
          provider: 'stripe',
          providerSubscriptionId: 'sub_stripe_1',
        });

      prisma.subscription.create.mockRejectedValueOnce(conflict);
      prisma.subscription.update.mockResolvedValue({
        id: 'local-sub-created-concurrently',
      });

      const surface = service as unknown as BillingWebhookTestSurface;

      await expect(
        surface.handleSubscriptionEvent(stripeSubscription),
      ).resolves.toBeUndefined();

      expect(prisma.$transaction).toHaveBeenCalledTimes(2);
      expect(prisma.subscription.create).toHaveBeenCalledTimes(1);
      expect(prisma.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'local-sub-created-concurrently' },
        }),
      );
    });

    it('rejects a uniqueness conflict belonging to another organization', async () => {
      const { Prisma } = await import('@astra/database');

      const conflict = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.19.3',
          meta: {
            target: ['provider', 'provider_subscription_id'],
          },
        },
      );

      prisma.billingPlan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        code: 'PROFESSIONAL',
      });

      prisma.subscription.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'local-sub-other-org',
          organizationId: 'org_2',
          provider: 'stripe',
          providerSubscriptionId: 'sub_stripe_1',
        });

      prisma.subscription.create.mockRejectedValueOnce(conflict);

      const surface = service as unknown as BillingWebhookTestSurface;

      await expect(
        surface.handleSubscriptionEvent(stripeSubscription),
      ).rejects.toBeInstanceOf(StripeWebhookReviewRequiredError);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });
  });

});
