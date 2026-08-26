import { SubscriptionStatus } from '@astra/database';
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

  async ensureTrialSubscription(organizationId: string) {
    const existing = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
        status: {
          in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
        },
      },
      include: {
        plan: true,
      },
    });

    if (existing) {
      return existing;
    }

    const starter = await this.prisma.billingPlan.findUnique({
      where: {
        code: 'STARTER',
      },
    });

    if (!starter || !starter.isActive) {
      throw new ConflictException('STARTER billing plan is not available');
    }

    const now = new Date();

    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + starter.trialDays);

    const periodEnd = new Date(trialEnd);

    return this.prisma.subscription.create({
      data: {
        organizationId,
        planId: starter.id,
        status: SubscriptionStatus.TRIALING,
        trialStart: now,
        trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: true,
      },
    });
  }

  async getEntitlements(organizationId: string): Promise<BillingEntitlements> {
    const subscription = await this.getSubscription(organizationId);

    if (
      subscription.status === SubscriptionStatus.TRIALING &&
      subscription.trialEnd &&
      subscription.trialEnd <= new Date()
    ) {
      await this.expireSubscription(subscription.id);

      throw new BadRequestException(
        'Your free trial has expired. Please choose a paid plan to continue.',
      );
    }

    return {
      plan: {
        id: subscription.plan.id,
        code: subscription.plan.code,
        name: subscription.plan.name,
        monthlyPriceCents: subscription.plan.monthlyPriceCents,
        currency: subscription.plan.currency,
      },
      limits: subscription.plan.limits as BillingLimits,
      features: subscription.plan.features as BillingFeatures,
    };
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

  async createCheckoutSession(organizationId: string, planCode: string, customerEmail: string) {
    const normalizedPlanCode = planCode.toUpperCase();

    const plan = await this.prisma.billingPlan.findUnique({
      where: {
        code: normalizedPlanCode,
      },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Billing plan not found');
    }

    if (plan.monthlyPriceCents <= 0) {
      throw new BadRequestException('A paid Stripe checkout is not available for this plan.');
    }

    const subscription = await this.getSubscription(organizationId);

    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.planId === plan.id) {
      throw new ConflictException('The organization is already subscribed to this plan.');
    }

    const result = await this.paymentProvider.createCheckoutSession({
      organizationId,
      organizationName: organizationId,
      planCode: normalizedPlanCode,
      customerEmail,
      successUrl: process.env.BILLING_SUCCESS_URL || 'http://localhost:3000/billing/success',
      cancelUrl: process.env.BILLING_CANCEL_URL || 'http://localhost:3000/billing',
      trialDays: 14,
    });

    return result;
  }

  async cancelAtPeriodEnd(organizationId: string) {
    const subscription = await this.getSubscription(organizationId);

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
    const subscription = await this.getSubscription(organizationId);

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
    const subscription = await this.getSubscription(organizationId);

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
