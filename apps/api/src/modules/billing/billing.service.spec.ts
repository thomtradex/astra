import { CheckoutAttemptStatus, SubscriptionStatus } from '@astra/database';

import { BillingService } from './billing.service';

describe('BillingService', () => {
  const prisma = {
    billingPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    checkoutAttempt: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const paymentProvider = {
    createCheckoutSession: jest.fn(),
    createCustomerPortalSession: jest.fn(),
    changeSubscriptionPlan: jest.fn(),
    cancelSubscriptionAtPeriodEnd: jest.fn(),
    reactivateSubscription: jest.fn(),
  };

  let service: BillingService;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.STRIPE_PRICE_PROFESSIONAL = 'price_professional_test';

    prisma.checkoutAttempt.findUnique.mockResolvedValue(null);
    prisma.checkoutAttempt.create.mockImplementation(({ data }) =>
      Promise.resolve({
        ...data,
        id: 'checkout-attempt-test',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    prisma.checkoutAttempt.updateMany.mockResolvedValue({ count: 1 });

    service = new BillingService(prisma as never, paymentProvider);
  });

  it('creates a Stripe checkout session for a valid plan', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        organizationId: 'org-1',
        planId: 'plan-free',
        status: SubscriptionStatus.ACTIVE,
        plan: {
          id: 'plan-free',
          code: 'FREE',
        },
      },
    ]);

    paymentProvider.createCheckoutSession.mockResolvedValue({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/test',
      provider: 'stripe',
    });

    const result = await service.createCheckoutSession('org-1', 'PROFESSIONAL', 'user@example.com');

    expect(paymentProvider.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        planCode: 'PROFESSIONAL',
        customerEmail: 'user@example.com',
        stripePriceId: 'price_professional_test',
        checkoutAttemptId: 'checkout-attempt-test',
        idempotencyKey: expect.any(String),
      }),
    );

    expect(prisma.checkoutAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: 'org-1',
        planId: 'plan-pro',
        planCode: 'PROFESSIONAL',
        stripePriceId: 'price_professional_test',
        activeOrganizationId: 'org-1',
        status: CheckoutAttemptStatus.CREATING,
      }),
    });
    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'checkout-attempt-test',
        status: CheckoutAttemptStatus.CREATING,
      },
      data: expect.objectContaining({
        status: CheckoutAttemptStatus.OPEN,
        stripeSessionId: 'cs_test',
      }),
    });

    expect(result.url).toContain('checkout.stripe.com');
  });

  it.each([
    {
      name: 'COMPLETED for the same Stripe session',
      status: CheckoutAttemptStatus.COMPLETED,
      sessionId: 'cs_test',
      succeeds: true,
    },
    {
      name: 'EXPIRED after Stripe session creation',
      status: CheckoutAttemptStatus.EXPIRED,
      sessionId: 'cs_test',
      succeeds: false,
    },
    {
      name: 'COMPLETED for another Stripe session',
      status: CheckoutAttemptStatus.COMPLETED,
      sessionId: 'cs_other',
      succeeds: false,
    },
  ])('handles checkout transition race: $name', async ({ status, sessionId, succeeds }) => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findMany.mockResolvedValue([]);
    prisma.checkoutAttempt.updateMany.mockResolvedValueOnce({ count: 0 });

    prisma.checkoutAttempt.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'checkout-attempt-test',
        status,
        stripeSessionId: sessionId,
      });

    paymentProvider.createCheckoutSession.mockResolvedValue({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/test',
      provider: 'stripe',
      expiresAt: null,
    });

    const operation = service.createCheckoutSession(
      'org-1',
      'PROFESSIONAL',
      'user@example.com',
    );

    if (succeeds) {
      await expect(operation).resolves.toEqual(
        expect.objectContaining({ id: 'cs_test' }),
      );
    } else {
      await expect(operation).rejects.toThrow(
        'Stripe reconciliation required',
      );
    }

    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: 'COMPLETED for the same Stripe session',
      status: CheckoutAttemptStatus.COMPLETED,
      sessionId: 'cs_test',
      succeeds: true,
    },
    {
      name: 'EXPIRED after Stripe session creation',
      status: CheckoutAttemptStatus.EXPIRED,
      sessionId: 'cs_test',
      succeeds: false,
    },
    {
      name: 'COMPLETED for another Stripe session',
      status: CheckoutAttemptStatus.COMPLETED,
      sessionId: 'cs_other',
      succeeds: false,
    },
  ])('handles checkout transition race: $name', async ({ status, sessionId, succeeds }) => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findMany.mockResolvedValue([]);
    prisma.checkoutAttempt.updateMany.mockResolvedValueOnce({ count: 0 });

    prisma.checkoutAttempt.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'checkout-attempt-test',
        status,
        stripeSessionId: sessionId,
      });

    paymentProvider.createCheckoutSession.mockResolvedValue({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/test',
      provider: 'stripe',
      expiresAt: null,
    });

    const operation = service.createCheckoutSession(
      'org-1',
      'PROFESSIONAL',
      'user@example.com',
    );

    if (succeeds) {
      await expect(operation).resolves.toEqual(
        expect.objectContaining({ id: 'cs_test' }),
      );
    } else {
      await expect(operation).rejects.toThrow(
        'Stripe reconciliation required',
      );
    }

    expect(prisma.checkoutAttempt.updateMany).toHaveBeenCalledTimes(1);
  });

  it.each([
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAST_DUE,
  ])(
    'rejects Checkout when a paid subscription is already %s',
    async (status) => {
      prisma.billingPlan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        code: 'PROFESSIONAL',
        isActive: true,
        monthlyPriceCents: 24900,
      });

      prisma.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-starter',
          organizationId: 'org-1',
          planId: 'plan-starter',
          status,
          plan: {
            id: 'plan-starter',
            code: 'STARTER',
          },
        },
      ]);

      await expect(
        service.createCheckoutSession('org-1', 'PROFESSIONAL', 'user@example.com'),
      ).rejects.toThrow(
        'An existing paid subscription must be changed through the plan change flow.',
      );

      expect(paymentProvider.createCheckoutSession).not.toHaveBeenCalled();
    },
  );

  it('rejects Checkout when a paid subscription exists alongside a FREE subscription', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        organizationId: 'org-1',
        planId: 'plan-free',
        status: SubscriptionStatus.ACTIVE,
        plan: {
          id: 'plan-free',
          code: 'FREE',
        },
      },
      {
        id: 'sub-paid',
        organizationId: 'org-1',
        planId: 'plan-starter',
        status: SubscriptionStatus.PAST_DUE,
        plan: {
          id: 'plan-starter',
          code: 'STARTER',
        },
      },
    ]);

    await expect(
      service.createCheckoutSession('org-1', 'PROFESSIONAL', 'user@example.com'),
    ).rejects.toThrow(
      'An existing paid subscription must be changed through the plan change flow.',
    );

    expect(paymentProvider.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('changes the paid Stripe subscription when a FREE subscription also exists', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        organizationId: 'org-1',
        planId: 'plan-free',
        status: SubscriptionStatus.ACTIVE,
        plan: { id: 'plan-free', code: 'FREE', monthlyPriceCents: 0 },
        providerSubscriptionId: null,
      },
      {
        id: 'sub-paid',
        organizationId: 'org-1',
        planId: 'plan-starter',
        status: SubscriptionStatus.ACTIVE,
        plan: { id: 'plan-starter', code: 'STARTER', monthlyPriceCents: 9900 },
        providerSubscriptionId: 'stripe-sub-paid',
      },
    ]);

    prisma.subscription.update.mockResolvedValue({ id: 'sub-paid' });

    await service.changePlan('org-1', 'PROFESSIONAL');

    expect(paymentProvider.changeSubscriptionPlan).toHaveBeenCalledWith(
      'stripe-sub-paid',
      'PROFESSIONAL',
      'always_invoice',
    );
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sub-paid' } }),
    );
  });

  it('cancels the paid Stripe subscription when a FREE subscription also exists', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'FREE' },
        providerSubscriptionId: null,
      },
      {
        id: 'sub-paid',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'STARTER' },
        providerSubscriptionId: 'stripe-sub-paid',
      },
    ]);
    prisma.subscription.update.mockResolvedValue({ id: 'sub-paid' });

    await service.cancelAtPeriodEnd('org-1');

    expect(paymentProvider.cancelSubscriptionAtPeriodEnd).toHaveBeenCalledWith(
      'stripe-sub-paid',
    );
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sub-paid' } }),
    );
  });

  it('reactivates the paid Stripe subscription when a FREE subscription also exists', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'FREE' },
        providerSubscriptionId: null,
      },
      {
        id: 'sub-paid',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'STARTER' },
        providerSubscriptionId: 'stripe-sub-paid',
      },
    ]);
    prisma.subscription.update.mockResolvedValue({ id: 'sub-paid' });

    await service.reactivate('org-1');

    expect(paymentProvider.reactivateSubscription).toHaveBeenCalledWith(
      'stripe-sub-paid',
    );
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sub-paid' } }),
    );
  });

  it('uses the paid Stripe customer for the customer portal when a FREE subscription also exists', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-free',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'FREE' },
        providerSubscriptionId: null,
        providerCustomerId: null,
      },
      {
        id: 'sub-paid',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'STARTER' },
        providerSubscriptionId: 'stripe-sub-paid',
        providerCustomerId: 'stripe-customer-paid',
      },
    ]);
    paymentProvider.createCustomerPortalSession.mockResolvedValue({
      url: 'https://billing.stripe.com/test',
    });

    await service.createCustomerPortalSession('org-1', 'https://example.com/billing');

    expect(paymentProvider.createCustomerPortalSession).toHaveBeenCalledWith(
      'stripe-customer-paid',
      'https://example.com/billing',
    );
  });

  it('blocks billing changes when multiple active paid Stripe subscriptions exist', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-paid-1',
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'STARTER' },
        providerSubscriptionId: 'stripe-sub-1',
      },
      {
        id: 'sub-paid-2',
        status: SubscriptionStatus.PAST_DUE,
        plan: { code: 'PROFESSIONAL' },
        providerSubscriptionId: 'stripe-sub-2',
      },
    ]);

    await expect(service.cancelAtPeriodEnd('org-1')).rejects.toThrow(
      'Multiple active paid subscriptions exist for this organization.',
    );

    expect(paymentProvider.cancelSubscriptionAtPeriodEnd).not.toHaveBeenCalled();
  });

  it('rejects an inactive plan', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue(null);

    await expect(
      service.createCheckoutSession('org-1', 'PROFESSIONAL', 'user@example.com'),
    ).rejects.toThrow('Billing plan not found');

    expect(paymentProvider.createCheckoutSession).not.toHaveBeenCalled();
  });

  it.each([
    { code: 'FREE', intelligence: false, cooActions: false },
    { code: 'STARTER', intelligence: false, cooActions: false },
    { code: 'PROFESSIONAL', intelligence: true, cooActions: true },
    { code: 'ENTERPRISE', intelligence: true, cooActions: true },
  ])(
    'enforces intelligence and COO action entitlements for $code',
    async ({ code, intelligence, cooActions }) => {
      const plan = {
        id: `plan-${code.toLowerCase()}`,
        code,
        name: code,
        monthlyPriceCents: 0,
        currency: 'EUR',
        limits: { aiRequestsPerMonth: 25 },
        features: { intelligence, cooActions },
      };

      prisma.subscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        organizationId: 'org-1',
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        plan,
      });

      for (const feature of [
        { name: 'intelligence', enabled: intelligence },
        { name: 'cooActions', enabled: cooActions },
      ]) {
        if (feature.enabled) {
          await expect(service.assertFeature('org-1', feature.name)).resolves.toBeUndefined();
        } else {
          await expect(service.assertFeature('org-1', feature.name)).rejects.toThrow(
            `The "${feature.name}" feature is not available on your current plan.`,
          );
        }
      }
    },
  );

  it('uses Free entitlements when the organization has no subscription', async () => {
    const freePlan = {
      id: 'plan-free',
      code: 'FREE',
      name: 'Free',
      monthlyPriceCents: 0,
      currency: 'EUR',
      limits: { aiRequestsPerMonth: 25 },
      features: {
        intelligence: false,
        cooActions: false,
      },
      isActive: true,
    };

    prisma.subscription.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.billingPlan.findUnique.mockResolvedValue(freePlan);
    prisma.subscription.create.mockResolvedValue({
      id: 'sub-free',
      organizationId: 'org-1',
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      plan: freePlan,
    });

    const entitlements = await service.getEntitlements('org-1');

    expect(entitlements.plan.code).toBe('FREE');
    expect(entitlements.limits.aiRequestsPerMonth).toBe(25);
    expect(entitlements.features.intelligence).toBe(false);
    expect(entitlements.features.cooActions).toBe(false);
    expect(prisma.subscription.create).not.toHaveBeenCalled();
  });

});
