import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentProvider,
} from './interfaces/payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly stripe?: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('STRIPE_SECRET_KEY is required in production.');
      }

      console.warn('Stripe disabled: STRIPE_SECRET_KEY not configured. Running without billing.');

      return;
    }

    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    const priceId = this.resolvePriceId(input.planCode);

    if (!priceId) {
      throw new InternalServerErrorException(
        `No Stripe price configured for plan ${input.planCode}`,
      );
    }

    if (!this.stripe) {
      throw new InternalServerErrorException('Billing is not configured in this environment.');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_collection: 'always',
      customer_email: input.customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ...(input.trialDays > 0
        ? {
            subscription_data: {
              trial_period_days: input.trialDays,
              metadata: {
                organizationId: input.organizationId,
                planCode: input.planCode,
              },
            },
          }
        : {}),
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
    if (!this.stripe) {
      throw new InternalServerErrorException('Billing is not configured in this environment.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  async changeSubscriptionPlan(
    subscriptionId: string,
    planCode: string,
    prorationBehavior: 'always_invoice' | 'none' = 'always_invoice',
  ): Promise<void> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Billing isnot configured in this environment.');
    }

    const priceId = this.resolvePriceId(planCode);

    if (!priceId) {
      throw new InternalServerErrorException(
        `No Stripe price configured for plan ${planCode}`,
      );
    }

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionItem = subscription.items.data[0];

    if (!subscriptionItem) {
      throw new InternalServerErrorException(
        'Stripe subscription has no subscription items.',
      );
    }

    await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscriptionItem.id,
          price: priceId,
        },
      ],
      proration_behavior: prorationBehavior,
    });
  }

  async cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<void> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Billing is not configured in this environment.');
    }

    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    if (!this.stripe) {
      throw new InternalServerErrorException('Billing is not configured in this environment.');
    }

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
