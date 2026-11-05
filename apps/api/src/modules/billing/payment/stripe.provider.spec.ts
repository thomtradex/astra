import { InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeProvider } from './stripe.provider';

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

describe('StripeProvider', () => {
  const stripeConstructor = Stripe as unknown as jest.Mock;
  const originalSecretKey = process.env.STRIPE_SECRET_KEY;
  const originalProfessionalPrice = process.env.STRIPE_PRICE_PROFESSIONAL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_unit';
    process.env.STRIPE_PRICE_PROFESSIONAL = 'price_professional';
  });

  afterAll(() => {
    if (originalSecretKey === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = originalSecretKey;
    }

    if (originalProfessionalPrice === undefined) {
      delete process.env.STRIPE_PRICE_PROFESSIONAL;
    } else {
      process.env.STRIPE_PRICE_PROFESSIONAL = originalProfessionalPrice;
    }
  });

  function setup() {
    const provider = new StripeProvider();
    const constructorResult = stripeConstructor.mock.results[0];

    if (!constructorResult) {
      throw new Error('Stripe constructor was not called');
    }

    const stripe = constructorResult.value as {
      checkout: {
        sessions: {
          create: jest.Mock;
        };
      };
      subscriptions: {
        retrieve: jest.Mock;
        update: jest.Mock;
      };
    };

    return { provider, stripe };
  }

  it('creates an idempotent Checkout Session with attempt metadata and persisted price', async () => {
    const { provider, stripe } = setup();
    const expiresAt = 1_800_000_000;

    stripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      expires_at: expiresAt,
    });

    const result = await provider.createCheckoutSession({
      organizationId: 'org_123',
      customerEmail: 'user@example.com',
      planCode: 'PROFESSIONAL',
      stripePriceId: 'price_snapshot_123',
      checkoutAttemptId: 'attempt_123',
      idempotencyKey: 'checkout-idempotency-123',
      trialDays: 14,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer_email: 'user@example.com',
        line_items: [{ price: 'price_snapshot_123', quantity: 1 }],
        subscription_data: expect.objectContaining({
          trial_period_days: 14,
          metadata: {
            organizationId: 'org_123',
            planCode: 'PROFESSIONAL',
            checkoutAttemptId: 'attempt_123',
          },
        }),
        metadata: {
          organizationId: 'org_123',
          planCode: 'PROFESSIONAL',
          checkoutAttemptId: 'attempt_123',
        },
      }),
      { idempotencyKey: 'checkout-idempotency-123' },
    );

    expect(result).toEqual({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      provider: 'stripe',
      expiresAt: new Date(expiresAt * 1000),
    });
  });

  it('updates price and planCode while preserving existing metadata', async () => {
    const { provider, stripe } = setup();

    stripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_123',
      metadata: {
        organizationId: 'org_123',
        customReference: 'keep_this',
        planCode: 'STARTER',
      },
      items: { data: [{ id: 'si_123' }] },
    });

    stripe.subscriptions.update.mockResolvedValue({ id: 'sub_123' });

    await provider.changeSubscriptionPlan(
      'sub_123',
      'PROFESSIONAL',
      'always_invoice',
    );

    expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
    expect(stripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
      items: [{ id: 'si_123', price: 'price_professional' }],
      proration_behavior: 'always_invoice',
      metadata: {
        organizationId: 'org_123',
        customReference: 'keep_this',
        planCode: 'PROFESSIONAL',
      },
    });
  });

  it('rejects a subscription without items', async () => {
    const { provider, stripe } = setup();

    stripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_empty',
      metadata: { organizationId: 'org_123', planCode: 'STARTER' },
      items: { data: [] },
    });

    await expect(
      provider.changeSubscriptionPlan('sub_empty', 'PROFESSIONAL'),
    ).rejects.toThrow(InternalServerErrorException);

    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });

  it('rejects a plan without a configured Stripe price', async () => {
    delete process.env.STRIPE_PRICE_PROFESSIONAL;

    const { provider, stripe } = setup();

    await expect(
      provider.changeSubscriptionPlan('sub_123', 'PROFESSIONAL'),
    ).rejects.toThrow(
      'No Stripe price configured for plan PROFESSIONAL',
    );

    expect(stripe.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });
});
