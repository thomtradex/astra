import { SubscriptionStatus } from '@astra/database';

import { BillingWebhookService } from './billing-webhook.service';

describe('BillingWebhookService', () => {
  const prisma = {
    billingPlan: {
      findUnique: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
    subscription: string;
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
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    service = new BillingWebhookService(prisma as never);
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

  it('marks a paid invoice subscription as active', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
      status: SubscriptionStatus.PAST_DUE,
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_paid',
      status: 'paid',
      subscription: 'sub_stripe_1',
    });

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: {
        id: 'local-sub-1',
      },
      data: {
        status: SubscriptionStatus.ACTIVE,
      },
    });
  });

  it('marks an open invoice subscription as past due', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      id: 'local-sub-1',
      provider: 'stripe',
      providerSubscriptionId: 'sub_stripe_1',
      status: SubscriptionStatus.ACTIVE,
    });

    await ((service as unknown) as BillingWebhookTestSurface).handleInvoiceEvent({
      id: 'in_open',
      status: 'open',
      subscription: 'sub_stripe_1',
    });

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: {
        id: 'local-sub-1',
      },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
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
});
