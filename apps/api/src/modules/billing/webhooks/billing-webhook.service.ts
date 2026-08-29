import { SubscriptionStatus } from '@astra/database';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class BillingWebhookService {
  private readonly logger = new Logger(BillingWebhookService.name);
  private readonly stripe?: Stripe;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('STRIPE_SECRET_KEY is required when billing webhooks are enabled.');
      }

      console.warn(
        'Stripe webhooks disabled: STRIPE_SECRET_KEY not configured.',
      );

      return;
    }

    this.stripe = new Stripe(secretKey);
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<{ received: true }> {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      const stripe = this.stripe;

      if (!stripe) {
        throw new Error('Stripe webhook processing is disabled.');
      }

      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.warn(
        `Invalid Stripe webhook signature: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );

      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionEvent(event.data.object);
        break;

      case 'invoice.paid':
      case 'invoice.payment_failed':
        await this.handleInvoiceEvent(event.data.object);
        break;

      default:
        this.logger.debug(`Ignoring Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const organizationId = session.metadata?.organizationId;
    const planCode = session.metadata?.planCode;

    if (!organizationId || !planCode) {
      this.logger.warn(`Checkout ${session.id} is missing organizationId or planCode metadata`);
      return;
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (!stripeSubscriptionId) {
      this.logger.warn(`Checkout ${session.id} has no Stripe subscription`);
      return;
    }

    const plan = await this.prisma.billingPlan.findUnique({
      where: {
        code: planCode.toUpperCase(),
      },
    });

    if (!plan) {
      this.logger.warn(`Billing plan ${planCode} not found for checkout ${session.id}`);
      return;
    }

    await this.prisma.subscription.updateMany({
      where: {
        organizationId,
      },
      data: {
        provider: 'stripe',
        providerCustomerId: stripeCustomerId,
        providerSubscriptionId: stripeSubscriptionId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    this.logger.log(`Checkout ${session.id} synchronized for organization ${organizationId}`);
  }

  private async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    const organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      const existing = await this.prisma.subscription.findFirst({
        where: {
          provider: 'stripe',
          providerSubscriptionId: subscription.id,
        },
      });

      if (!existing) {
        this.logger.warn(`Stripe subscription ${subscription.id} has no organization mapping`);
        return;
      }

      await this.syncSubscription(existing.organizationId, subscription);
      return;
    }

    await this.syncSubscription(organizationId, subscription);
  }

  private async syncSubscription(
    organizationId: string,
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const planCode = stripeSubscription.metadata?.planCode?.toUpperCase();

    const plan = planCode
      ? await this.prisma.billingPlan.findUnique({
          where: {
            code: planCode,
          },
        })
      : null;

    const existing = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!existing) {
      this.logger.warn(`No local subscription found for organization ${organizationId}`);
      return;
    }

    const customerId =
      typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer?.id;

    const status = this.mapStripeStatus(stripeSubscription.status);

    const subscriptionItem = stripeSubscription.items.data[0];

    if (!subscriptionItem) {
      this.logger.warn(`Stripe subscription ${stripeSubscription.id} has no subscription items`);
      return;
    }

    await this.prisma.subscription.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(plan ? { planId: plan.id } : {}),
        provider: 'stripe',
        providerCustomerId: customerId,
        providerSubscriptionId: stripeSubscription.id,
        status,
        currentPeriodStart: new Date(subscriptionItem.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.cancel_at
          ? new Date(stripeSubscription.cancel_at * 1000)
          : null,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
      },
    });
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'trialing':
        return SubscriptionStatus.TRIALING;

      case 'active':
        return SubscriptionStatus.ACTIVE;

      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PAST_DUE;

      case 'canceled':
      case 'incomplete_expired':
        return SubscriptionStatus.CANCELED;

      default:
        return SubscriptionStatus.PAST_DUE;
    }
  }

  private async handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
    const invoiceWithSubscription = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };

    const stripeSubscriptionId =
      typeof invoiceWithSubscription.subscription === 'string'
        ? invoiceWithSubscription.subscription
        : invoiceWithSubscription.subscription?.id;

    if (!stripeSubscriptionId) {
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        provider: 'stripe',
        providerSubscriptionId: stripeSubscriptionId,
      },
    });

    if (!subscription) {
      this.logger.warn(`No local subscription found for invoice ${invoice.id}`);
      return;
    }

    if (invoice.status === 'paid') {
      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      });
      return;
    }

    if (invoice.status === 'open' || invoice.status === 'uncollectible') {
      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      });
    }
  }
}
