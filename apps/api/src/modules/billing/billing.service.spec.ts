import { SubscriptionStatus } from '@astra/database';

import { BillingService } from './billing.service';

describe('BillingService', () => {
  const prisma = {
    billingPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
  };

  let service: BillingService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new BillingService(prisma as never, paymentProvider as never);
  });

  it('creates a Stripe checkout session for a valid plan', async () => {
    prisma.billingPlan.findUnique.mockResolvedValue({
      id: 'plan-pro',
      code: 'PROFESSIONAL',
      isActive: true,
      monthlyPriceCents: 24900,
    });

    prisma.subscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      organizationId: 'org-1',
      planId: 'plan-starter',
      status: SubscriptionStatus.TRIALING,
    });

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
      }),
    );

    expect(result.url).toContain('checkout.stripe.com');
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
    expect(prisma.subscription.create).toHaveBeenCalled();
  });

});
