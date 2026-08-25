import { BillingService } from './billing.service';
import { SubscriptionStatus } from '@astra/database';

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
});
