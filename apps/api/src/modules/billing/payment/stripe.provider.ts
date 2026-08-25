import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentProvider,
} from './interfaces/payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is required when the Stripe provider is initialized.',
      );
    }

    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const priceId = this.resolvePriceId(input.planCode);

    if (!priceId) {
      throw new InternalServerErrorException(
        `No Stripe price configured for plan ${input.planCode}`,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: input.customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: input.trialDays,
        metadata: {
          organizationId: input.organizationId,
          planCode: input.planCode,
        },
      },
      metadata: {
        organizationId: input.organizationId,
        planCode: input.planCode,
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: true,
    });

    return {
      id: session.id,
      url: session.url,
      provider: 'stripe',
    };
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  async cancelSubscriptionAtPeriodEnd(
    subscriptionId: string,
  ): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(
    subscriptionId: string,
  ): Promise<void> {
    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  private resolvePriceId(planCode: string): string | undefined {
    const prices: Record<string, string | undefined> = {
      STARTER: process.env.STRIPE_PRICE_STARTER,
      PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
      ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
    };

    return prices[planCode];
  }
}
