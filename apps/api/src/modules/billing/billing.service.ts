import { randomUUID } from 'node:crypto';
import { CheckoutAttemptStatus, SubscriptionStatus } from '@astra/database';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  BillingEntitlements,
  BillingFeatures,
  BillingLimits,
} from './interfaces/billing-entitlements.interface';
import { withSerializableRetry } from '../procurement/utils/serializable-retry';
import { PaymentProvider } from './payment/interfaces/payment-provider.interface';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('PAYMENT_PROVIDER')
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async getPlans() {
    return this.prisma.billingPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No billing subscription exists for this organization');
    }

    return subscription;
  }

  private async getActivePaidSubscription(organizationId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        organizationId,
        status: {
          in: [
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
          ],
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const paidSubscriptions = subscriptions.filter(
      (subscription) =>
        subscription.plan.code !== 'FREE' &&
        !!subscription.providerSubscriptionId,
    );

    if (paidSubscriptions.length > 1) {
      throw new ConflictException(
        'Multiple active paid subscriptions exist for this organization. Billing changes are blocked until the subscriptions are reconciled.',
      );
    }

    if (paidSubscriptions.length === 0) {
      throw new BadRequestException(
        'No active paid Stripe subscription exists for this organization.',
      );
    }

    const subscription = paidSubscriptions[0];

    if (!subscription) {
      throw new BadRequestException(
        'No active paid Stripe subscription exists for this organization.',
      );
    }

    return subscription;
  }

  async ensureFreeSubscription(organizationId: string) {
    return withSerializableRetry(this.prisma, async (tx) => {
      // Serialize FREE activation for the same organization.
      // Lock the existing tenant row before reading subscriptions.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM organizations
        WHERE id = ${organizationId}
        FOR UPDATE
      `;

      if (locked.length !== 1) {
        throw new NotFoundException('Organization not found');
      }

      const existing = await tx.subscription.findFirst({
        where: {
          organizationId,
          status: {
            in: [
              SubscriptionStatus.TRIALING,
              SubscriptionStatus.ACTIVE,
              SubscriptionStatus.PAST_DUE,
            ],
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (existing) {
        return existing;
      }

      const free = await tx.billingPlan.findUnique({
        where: {
          code: 'FREE',
        },
      });

      if (!free || !free.isActive || free.monthlyPriceCents !== 0) {
        throw new ConflictException('FREE billing plan is not available');
      }

      const now = new Date();

      return tx.subscription.create({
        data: {
          organizationId,
          planId: free.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: new Date('2099-12-31T23:59:59.999Z'),
          cancelAtPeriodEnd: false,
        },
        include: {
          plan: true,
        },
      });
    });
  }

  async getEntitlements(organizationId: string): Promise<BillingEntitlements> {
    let subscription;

    try {
      subscription = await this.getSubscription(organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.getFreeEntitlements();
      }
      throw error;
    }

    const now = new Date();

    if (subscription.plan.code === 'FREE') {
      return this.toEntitlements(subscription.plan);
    }

    if (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now
    ) {
      return this.toEntitlements(subscription.plan);
    }

    if (
      subscription.status === SubscriptionStatus.TRIALING &&
      subscription.trialEnd &&
      subscription.trialEnd > now
    ) {
      return this.toEntitlements(subscription.plan);
    }

    if (
      (subscription.status === SubscriptionStatus.ACTIVE &&
        (!subscription.currentPeriodEnd || subscription.currentPeriodEnd <= now)) ||
      (subscription.status === SubscriptionStatus.TRIALING &&
        (!subscription.trialEnd || subscription.trialEnd <= now))
    ) {
      await this.expireSubscription(subscription.id);
    }

    return this.getFreeEntitlements();
  }

  private toEntitlements(plan: {
    id: string;
    code: string;
    name: string;
    monthlyPriceCents: number;
    currency: string;
    limits: unknown;
    features: unknown;
  }): BillingEntitlements {
    return {
      plan: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        monthlyPriceCents: plan.monthlyPriceCents,
        currency: plan.currency,
      },
      limits: plan.limits as BillingLimits,
      features: plan.features as BillingFeatures,
    };
  }

  private async getFreeEntitlements(): Promise<BillingEntitlements> {
    const freePlan = await this.prisma.billingPlan.findUnique({
      where: { code: 'FREE' },
    });

    if (!freePlan || !freePlan.isActive || freePlan.monthlyPriceCents !== 0) {
      throw new ConflictException('FREE billing plan is not available');
    }

    return this.toEntitlements(freePlan);
  }

  async expireSubscription(subscriptionId: string) {
    return this.prisma.subscription.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });
  }

  async processExpiredTrials() {
    const now = new Date();

    const expired = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEnd: {
          not: null,
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (expired.length === 0) {
      return {
        processed: 0,
      };
    }

    await this.prisma.subscription.updateMany({
      where: {
        id: {
          in: expired.map((subscription) => subscription.id),
        },
        status: SubscriptionStatus.TRIALING,
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });

    return {
      processed: expired.length,
    };
  }

  async createCheckoutSession(
    organizationId: string,
    planCode: string,
    customerEmail: string,
  ) {
    const normalizedPlanCode = planCode.toUpperCase();

    const plan = await this.prisma.billingPlan.findUnique({
      where: {
        code: normalizedPlanCode,
      },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Billing plan not found');
    }

    if (plan.code === 'FREE') {
      throw new BadRequestException(
        'FREE does not use Stripe Checkout. Use the free-plan activation flow.',
      );
    }

    if (plan.monthlyPriceCents <= 0) {
      throw new BadRequestException('A paid Stripe checkout is not available for this plan.');
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        organizationId,
        status: {
          in: [
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
          ],
        },
      },
      include: {
        plan: true,
      },
    });

    if (subscriptions.some((subscription) => subscription.plan.code !== 'FREE')) {
      throw new ConflictException(
        'An existing paid subscription must be changed through the plan change flow.',
      );
    }

    const stripePriceIds: Record<string, string | undefined> = {
      STARTER: process.env.STRIPE_PRICE_STARTER,
      PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
      ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
    };

    const stripePriceId = stripePriceIds[normalizedPlanCode];

    if (!stripePriceId) {
      throw new BadRequestException(
        `Stripe price is not configured for plan ${normalizedPlanCode}.`,
      );
    }

    const successUrl =
      process.env.BILLING_SUCCESS_URL || 'http://localhost:3000/billing/success';
    const cancelUrl =
      process.env.BILLING_CANCEL_URL || 'http://localhost:3000/billing/cancel';
    const trialDays = plan.code === 'STARTER' ? plan.trialDays : 0;
    const now = new Date();
    const idempotencySafeWindowMs = 23 * 60 * 60 * 1000;

    let attempt = await this.prisma.checkoutAttempt.findUnique({
      where: {
        activeOrganizationId: organizationId,
      },
    });

    if (!attempt) {
      try {
        attempt = await this.prisma.checkoutAttempt.create({
          data: {
            organizationId,
            planId: plan.id,
            planCode: normalizedPlanCode,
            customerEmail,
            stripePriceId,
            trialDays,
            successUrl,
            cancelUrl,
            idempotencyKey: randomUUID(),
            activeOrganizationId: organizationId,
            status: CheckoutAttemptStatus.CREATING,
          },
        });
      } catch (error) {
        const isUniqueConstraintError =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002';

        if (!isUniqueConstraintError) {
          throw error;
        }

        // Another request may have acquired the organization's unique checkout slot.
        attempt = await this.prisma.checkoutAttempt.findUnique({
          where: {
            activeOrganizationId: organizationId,
          },
        });

        if (!attempt) {
          throw error;
        }
      }
    }

    if (attempt.planCode !== normalizedPlanCode) {
      throw new ConflictException(
        'A checkout attempt for another plan is already active. Complete or expire it before selecting another plan.',
      );
    }

    if (attempt.status === CheckoutAttemptStatus.OPEN) {
      if (
        attempt.checkoutUrl &&
        (!attempt.expiresAt || attempt.expiresAt > now)
      ) {
        return {
          id: attempt.stripeSessionId,
          url: attempt.checkoutUrl,
          provider: 'stripe',
          expiresAt: attempt.expiresAt,
        };
      }

      throw new ConflictException(
        'An existing checkout session is expired or awaiting webhook reconciliation.',
      );
    }

    if (attempt.status !== CheckoutAttemptStatus.CREATING) {
      throw new ConflictException(
        'The existing checkout attempt must be reconciled before another checkout can be created.',
      );
    }

    if (
      now.getTime() - attempt.createdAt.getTime() >= idempotencySafeWindowMs
    ) {
      throw new ConflictException(
        'The checkout attempt is too old for a safe Stripe retry and requires reconciliation.',
      );
    }

    // Reuse the persisted snapshot and key. Never generate a new key for this attempt.
    const result = await this.paymentProvider.createCheckoutSession({
      organizationId: attempt.organizationId,
      organizationName: attempt.organizationId,
      planCode: attempt.planCode,
      stripePriceId: attempt.stripePriceId,
      checkoutAttemptId: attempt.id,
      idempotencyKey: attempt.idempotencyKey,
      customerEmail: attempt.customerEmail ?? customerEmail,
      successUrl: attempt.successUrl,
      cancelUrl: attempt.cancelUrl,
      trialDays: attempt.trialDays,
    });

    // A webhook may complete the attempt while the Stripe request is in flight.
    // Conditional update prevents this response from regressing COMPLETED to OPEN.
    const transition = await this.prisma.checkoutAttempt.updateMany({
      where: {
        id: attempt.id,
        status: CheckoutAttemptStatus.CREATING,
      },
      data: {
        status: CheckoutAttemptStatus.OPEN,
        stripeSessionId: result.id,
        checkoutUrl: result.url ?? null,
        expiresAt: result.expiresAt ?? null,
      },
    });

    if (transition.count !== 1) {
      const latestAttempt = await this.prisma.checkoutAttempt.findUnique({
        where: { id: attempt.id },
      });

      const sameSession =
        latestAttempt?.stripeSessionId === result.id;

      const alreadyCompleted =
        latestAttempt?.status === CheckoutAttemptStatus.COMPLETED;

      const alreadyOpen =
        latestAttempt?.status === CheckoutAttemptStatus.OPEN;

      if (!sameSession || (!alreadyCompleted && !alreadyOpen)) {
        throw new ConflictException(
          'Checkout session could not be persisted consistently; Stripe reconciliation required.',
        );
      }
    }

    return result;
  }

  async changePlan(organizationId: string, planCode: string) {
    const normalizedPlanCode = planCode.toUpperCase();

    const targetPlan = await this.prisma.billingPlan.findUnique({
      where: {
        code: normalizedPlanCode,
      },
    });

    if (!targetPlan || !targetPlan.isActive) {
      throw new NotFoundException('Billing plan not found');
    }

    if (targetPlan.code === 'FREE') {
      throw new BadRequestException(
        'FREE cannot be selected through paid subscription plan changes.',
      );
    }

    const subscription = await this.getActivePaidSubscription(organizationId);

    if (
      subscription.planId === targetPlan.id &&
      subscription.status !== SubscriptionStatus.EXPIRED
    ) {
      throw new ConflictException('The organization is already subscribed to this plan.');
    }

    if (!subscription.providerSubscriptionId) {
      throw new BadRequestException(
        'This subscription is not connected to a Stripe subscription.',
      );
    }

    const currentPlanCode = subscription.plan.code;

    if (currentPlanCode === 'FREE') {
      throw new BadRequestException(
        'Free subscriptions must use Checkout to start a paid subscription.',
      );
    }

    const originalTrialEnd = subscription.trialEnd;

    const currentPrice = subscription.plan.monthlyPriceCents;
    const targetPrice = targetPlan.monthlyPriceCents;

    const isCurrentlyTrialing =
      subscription.status === SubscriptionStatus.TRIALING &&
      !!originalTrialEnd &&
      originalTrialEnd > new Date();

    const isUpgrade = targetPrice > currentPrice;
    const isDowngrade = targetPrice < currentPrice;

    const prorationBehavior =
      isCurrentlyTrialing
        ? 'none'
        : isDowngrade
          ? 'none'
          : isUpgrade
            ? 'always_invoice'
            : 'none';

    await this.paymentProvider.changeSubscriptionPlan(
      subscription.providerSubscriptionId,
      normalizedPlanCode,
      prorationBehavior,
    );

    return this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        planId: targetPlan.id,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        status: isCurrentlyTrialing
          ? SubscriptionStatus.TRIALING
          : SubscriptionStatus.ACTIVE,
        trialEnd: isCurrentlyTrialing ? originalTrialEnd : null,
      },
      include: {
        plan: true,
      },
    });
  }

  async cancelAtPeriodEnd(organizationId: string) {
    const subscription = await this.getActivePaidSubscription(organizationId);

    if (!subscription.providerSubscriptionId) {
      throw new BadRequestException('This subscription is not connected to a Stripe subscription.');
    }

    await this.paymentProvider.cancelSubscriptionAtPeriodEnd(subscription.providerSubscriptionId);

    return this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
      include: {
        plan: true,
      },
    });
  }

  async reactivate(organizationId: string) {
    const subscription = await this.getActivePaidSubscription(organizationId);

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new BadRequestException(
        'An expired subscription must be upgraded through Stripe Checkout.',
      );
    }

    if (!subscription.providerSubscriptionId) {
      throw new BadRequestException('This subscription is not connected to a Stripe subscription.');
    }

    await this.paymentProvider.reactivateSubscription(subscription.providerSubscriptionId);

    return this.prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      include: {
        plan: true,
      },
    });
  }

  async createCustomerPortalSession(organizationId: string, returnUrl: string) {
    const subscription = await this.getActivePaidSubscription(organizationId);

    if (!subscription.providerCustomerId) {
      throw new BadRequestException('This organization does not have a Stripe customer yet.');
    }

    return this.paymentProvider.createCustomerPortalSession(
      subscription.providerCustomerId,
      returnUrl,
    );
  }

  async assertFeature(organizationId: string, feature: string): Promise<void> {
    const entitlements = await this.getEntitlements(organizationId);

    if (entitlements.features[feature] !== true) {
      throw new BadRequestException(
        `The "${feature}" feature is not available on your current plan.`,
      );
    }
  }

  async assertLimit(
    organizationId: string,
    limit: keyof BillingLimits,
    currentUsage: number,
  ): Promise<void> {
    const entitlements = await this.getEntitlements(organizationId);

    const maximum = entitlements.limits[limit];

    if (maximum === undefined) {
      return;
    }

    if (currentUsage >= maximum) {
      throw new BadRequestException(
        `You have reached your ${String(limit)} limit for the current plan.`,
      );
    }
  }
}
