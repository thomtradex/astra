import { CheckoutAttemptStatus, Prisma, SubscriptionStatus } from '@astra/database';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';

import { PrismaService } from '../../../prisma/prisma.service';
import { withSerializableRetry } from '../../procurement/utils/serializable-retry';
import { StripeWebhookEventService } from './stripe-webhook-event.service';
import { StripeSubscriptionSyncClaim, StripeSubscriptionSyncLockService } from './stripe-subscription-sync-lock.service';
import { StripeWebhookReviewRequiredError } from './stripe-webhook-outcome';

@Injectable()
export class BillingWebhookService {
  private readonly logger = new Logger(BillingWebhookService.name);

  private readonly subscriptionSynchronizationLocks =
    new Map<string, Promise<void>>();

  private async withSubscriptionSynchronizationLock<T>(
    subscriptionId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.subscriptionSynchronizationLocks.get(subscriptionId);
    let release!: () => void;

    const current = new Promise<void>((resolve) => {
      release = resolve;
    });

    const queued = (previous ?? Promise.resolve()).then(
      () => current,
      () => current,
    );

    this.subscriptionSynchronizationLocks.set(subscriptionId, queued);

    try {
      if (previous) {
        await previous;
      }

      return await operation();
    } finally {
      release();

      if (this.subscriptionSynchronizationLocks.get(subscriptionId) === queued) {
        this.subscriptionSynchronizationLocks.delete(subscriptionId);
      }
    }
  }


  private async withDistributedSubscriptionLock<T>(
    subscriptionId: string,
    operation: (claim: StripeSubscriptionSyncClaim) => Promise<T>,
  ): Promise<T> {
    const lock = this.subscriptionSyncLock;

    if (!lock) {
      throw new ServiceUnavailableException(
        'Stripe subscription synchronization lock is not configured',
      );
    }

    const claim = await lock.acquire(subscriptionId);

    if (!claim) {
      throw new ServiceUnavailableException(
        'Stripe subscription ' + subscriptionId +
          ' is currently being synchronized by another worker',
      );
    }

    let stopped = false;
    let healthy = true;
    let pending: Promise<void> | null = null;

    const timer = setInterval(() => {
      if (stopped || pending || !healthy) {
        return;
      }

      pending = (async () => {
        try {
          const renewed = await lock.renew(claim);

          if (!renewed) {
            healthy = false;
            this.logger.error(
              'Stripe subscription ' + subscriptionId +
                ' lost its distributed synchronization lock',
            );
          }
        } catch (error) {
          healthy = false;
          this.logger.error(
            'Stripe subscription ' + subscriptionId +
              ' lock renewal failed: ' +
              (error instanceof Error ? error.message : String(error)),
          );
        }
      })().finally(() => {
        pending = null;
      });
    }, 15_000);

    timer.unref();

    let result: T | undefined;
    let operationError: unknown;
    let operationFailed = false;

    try {
      result = await operation(claim);
    } catch (error) {
      operationFailed = true;
      operationError = error;
    } finally {
      stopped = true;
      clearInterval(timer);

      if (pending) {
        await pending;
      }

      try {
        await lock.release(claim);
      } catch (error) {
        healthy = false;
        this.logger.error(
          'Stripe subscription ' + subscriptionId +
            ' lock release failed: ' +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    if (!healthy) {
      throw new ServiceUnavailableException(
        'Stripe subscription ' + subscriptionId +
          ' synchronization lock became unhealthy',
      );
    }

    if (operationFailed) {
      throw operationError;
    }

    return result as T;
  }

  private readonly stripe?: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookEvents?: StripeWebhookEventService,
    private readonly subscriptionSyncLock?: StripeSubscriptionSyncLockService,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('STRIPE_SECRET_KEY is required when billing webhooks are enabled.');
      }

      console.warn('Stripe webhooks disabled: STRIPE_SECRET_KEY not configured.');

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
      throw new InternalServerErrorException(
        'Stripe webhook secret is not configured',
      );
    }

    const stripe = this.stripe;

    if (!stripe) {
      throw new ServiceUnavailableException(
        'Stripe webhook processing is not configured',
      );
    }

    let event: Stripe.Event;

    try {
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

    if (!this.webhookEvents) {
      throw new ServiceUnavailableException(
        'Stripe webhook inbox is not configured',
      );
    }

    await this.webhookEvents.register(event);

    return { received: true };
  }

  async processVerifiedStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        await this.handleCheckoutExpired(event.data.object);
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

  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const checkoutAttemptId = session.metadata?.checkoutAttemptId;
    const organizationId = session.metadata?.organizationId;
    const planCode = session.metadata?.planCode?.toUpperCase();

    if (!checkoutAttemptId || !organizationId || !planCode) {
      this.logger.warn(
        'Checkout ' + session.id + ' is missing checkoutAttemptId, organizationId or planCode metadata',
      );
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id + ' is missing checkoutAttemptId, organizationId or planCode metadata',
      );
    }

    const attempt = await this.prisma.checkoutAttempt.findUnique({
      where: {
        id: checkoutAttemptId,
      },
    });

    if (!attempt) {
      this.logger.error('Checkout attempt ' + checkoutAttemptId + ' was not found');
      throw new StripeWebhookReviewRequiredError(
        'Checkout attempt ' + checkoutAttemptId + ' was not found',
      );
    }

    if (
      attempt.organizationId !== organizationId ||
      attempt.planCode !== planCode
    ) {
      this.logger.error(
        'Checkout ' + session.id + ' metadata does not match its persisted checkout attempt',
      );
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id + ' metadata does not match its persisted checkout attempt',
      );
    }

    if (attempt.status === CheckoutAttemptStatus.COMPLETED) {
      if (attempt.stripeSessionId !== session.id) {
        throw new ServiceUnavailableException(
          'Checkout ' + session.id + ' conflicts with the completed checkout session for attempt ' + attempt.id,
        );
      }

      this.logger.debug('Checkout attempt ' + attempt.id + ' was already completed');
      return;
    }

    if (
      attempt.status !== CheckoutAttemptStatus.CREATING &&
      attempt.status !== CheckoutAttemptStatus.OPEN
    ) {
      this.logger.warn(
        'Checkout attempt ' + attempt.id + ' is not eligible for completion from status ' + attempt.status,
      );
      throw new StripeWebhookReviewRequiredError(
        'Checkout attempt ' + attempt.id + ' is not eligible for completion from status ' + attempt.status,
      );
    }

    if (attempt.stripeSessionId && attempt.stripeSessionId !== session.id) {
      this.logger.error(
        'Checkout session ID does not match persisted attempt ' + attempt.id,
      );
      throw new StripeWebhookReviewRequiredError(
        'Checkout session ID does not match persisted attempt ' + attempt.id,
      );
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!stripeSubscriptionId) {
      this.logger.warn('Checkout ' + session.id + ' has no Stripe subscription');
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id + ' has no Stripe subscription',
      );
    }

    const stripe = this.stripe;

    if (!stripe) {
      throw new ServiceUnavailableException(
        'Checkout ' + session.id + ' cannot be synchronized because Stripe is not configured',
      );
    }

    return this.withSubscriptionSynchronizationLock(stripeSubscriptionId, () =>
      this.withDistributedSubscriptionLock(stripeSubscriptionId, async (claim) => {
    let stripeSubscription: Stripe.Subscription;

    try {
      stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (error) {
      this.logger.error(
        'Unable to retrieve Stripe subscription ' + stripeSubscriptionId + ' for checkout ' + session.id + ': ' +
          (error instanceof Error ? error.message : 'unknown error'),
      );
      throw error;
    }

    if (stripeSubscription.id !== stripeSubscriptionId) {
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id +
          ' returned a mismatched Stripe subscription ID',
      );
    }

    const stripeOrganizationId = stripeSubscription.metadata?.organizationId;
    const stripePlanCode = stripeSubscription.metadata?.planCode?.toUpperCase();

    if (stripeOrganizationId !== organizationId) {
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id +
          ' organization metadata does not match Stripe subscription',
      );
    }

    if (stripePlanCode !== planCode) {
      throw new StripeWebhookReviewRequiredError(
        'Checkout ' + session.id +
          ' plan metadata does not match Stripe subscription',
      );
    }

    const outcome = await withSerializableRetry(this.prisma, async (tx) => {
      if (!this.subscriptionSyncLock) {
        throw new ServiceUnavailableException(
          'Stripe subscription synchronization lock is not configured',
        );
      }

      if (claim.subscriptionId !== stripeSubscriptionId) {
        throw new ServiceUnavailableException(
          'Stripe subscription synchronization claim ID mismatch',
        );
      }

      await this.subscriptionSyncLock.assertOwnershipInTransaction(
        tx,
        claim,
      );

      const completion = await tx.checkoutAttempt.updateMany({
        where: {
          id: attempt.id,
          organizationId,
          planId: attempt.planId,
          status: {
            in: [CheckoutAttemptStatus.CREATING, CheckoutAttemptStatus.OPEN],
          },
          OR: [
            { stripeSessionId: null },
            { stripeSessionId: session.id },
          ],
        },
        data: {
          status: CheckoutAttemptStatus.COMPLETED,
          stripeSessionId: session.id,
          activeOrganizationId: null,
        },
      });

      if (completion.count !== 1) {
        return 'not-eligible' as const;
      }

      const synchronized = await this.syncSubscription(
        organizationId,
        stripeSubscription,
        attempt.planId,
        tx,
      );

      if (!synchronized) {
        throw new ServiceUnavailableException(
          'Checkout ' + session.id + ' subscription synchronization failed; transaction rolled back',
        );
      }

      return 'completed' as const;
    });

    if (outcome === 'not-eligible') {
      const latestAttempt = await this.prisma.checkoutAttempt.findUnique({
        where: { id: attempt.id },
      });

      if (
        latestAttempt?.status === CheckoutAttemptStatus.COMPLETED &&
        latestAttempt.stripeSessionId === session.id
      ) {
        this.logger.debug('Checkout attempt ' + attempt.id + ' was already completed');
        return;
      }

      this.logger.error(
        'Checkout ' + session.id +
          ' cannot be completed from its persisted state; Stripe reconciliation required',
      );
      throw new ServiceUnavailableException(
        'Checkout ' + session.id + ' requires Stripe reconciliation',
      );
    }

    this.logger.log(
      'Checkout ' + session.id + ' synchronized for organization ' + organizationId,
    );
      }),
    );
  }

  private async handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
    const checkoutAttemptId = session.metadata?.checkoutAttemptId;
    const organizationId = session.metadata?.organizationId;
    const planCode = session.metadata?.planCode?.toUpperCase();

    if (!checkoutAttemptId || !organizationId || !planCode) {
      this.logger.warn(
        'Expired checkout ' + session.id + ' is missing checkoutAttemptId or organizationId metadata',
      );
      throw new StripeWebhookReviewRequiredError(
        'Expired checkout ' + session.id + ' has missing required metadata',
      );
    }

    const attempt = await this.prisma.checkoutAttempt.findUnique({
      where: {
        id: checkoutAttemptId,
      },
    });

    if (!attempt) {
      this.logger.warn('Expired checkout attempt ' + checkoutAttemptId + ' was not found');
      throw new StripeWebhookReviewRequiredError(
        'Expired checkout attempt ' + checkoutAttemptId + ' was not found',
      );
    }

    if (
      attempt.organizationId !== organizationId ||
      attempt.planCode !== planCode
    ) {
      this.logger.error(
        'Expired checkout ' + session.id + ' organization does not match its persisted attempt',
      );
      throw new StripeWebhookReviewRequiredError(
        'Expired checkout ' + session.id + ' metadata conflicts with persisted attempt',
      );
    }

    if (attempt.stripeSessionId && attempt.stripeSessionId !== session.id) {
      this.logger.error(
        'Expired checkout session ID does not match persisted attempt ' + attempt.id,
      );
      throw new StripeWebhookReviewRequiredError(
        'Expired checkout ' + session.id + ' conflicts with persisted Stripe session',
      );
    }

    if (attempt.status === CheckoutAttemptStatus.COMPLETED) {
      this.logger.debug(
        'Ignoring expiration for already completed checkout attempt ' + attempt.id,
      );
      return;
    }

    const expiration = await this.prisma.checkoutAttempt.updateMany({
      where: {
        id: attempt.id,
        organizationId,
        planCode,
        status: {
          in: [CheckoutAttemptStatus.CREATING, CheckoutAttemptStatus.OPEN],
        },
        OR: [
          { stripeSessionId: session.id },
          {
            stripeSessionId: null,
            status: CheckoutAttemptStatus.CREATING,
          },
        ],
      },
      data: {
        status: CheckoutAttemptStatus.EXPIRED,
        activeOrganizationId: null,
      },
    });

    if (expiration.count > 0) {
      this.logger.log(
        'Checkout attempt ' + attempt.id + ' expired; organization checkout slot released',
      );
      return;
    }

    const latestAttempt = await this.prisma.checkoutAttempt.findUnique({
      where: { id: attempt.id },
    });

    if (
      latestAttempt &&
      latestAttempt.organizationId === organizationId &&
      latestAttempt.planCode === planCode &&
      latestAttempt.stripeSessionId === session.id &&
      (
        latestAttempt.status === CheckoutAttemptStatus.EXPIRED ||
        latestAttempt.status === CheckoutAttemptStatus.COMPLETED
      )
    ) {
      this.logger.debug(
        'Checkout expiration ' + session.id +
          ' already resolved with status ' + latestAttempt.status,
      );
      return;
    }

    if (
      latestAttempt &&
      (
        latestAttempt.organizationId !== organizationId ||
        latestAttempt.planCode !== planCode ||
        (latestAttempt.stripeSessionId &&
          latestAttempt.stripeSessionId !== session.id)
      )
    ) {
      throw new StripeWebhookReviewRequiredError(
        'Expired checkout ' + session.id +
          ' conflicts with its latest persisted attempt',
      );
    }

    throw new ServiceUnavailableException(
      'Expired checkout ' + session.id +
        ' could not be reconciled after a conditional update conflict',
    );
  }

  private async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    return this.withSubscriptionSynchronizationLock(subscription.id, () =>
      this.withDistributedSubscriptionLock(subscription.id, (claim) =>
        this.handleSubscriptionEventLocked(subscription, claim),
      ),
    );
  }

  private async handleSubscriptionEventLocked(
    subscription: Stripe.Subscription,
    claim: StripeSubscriptionSyncClaim,
  ): Promise<void> {
    let organizationId = subscription.metadata?.organizationId;

    if (!organizationId) {
      const existing = await this.prisma.subscription.findFirst({
        where: {
          provider: 'stripe',
          providerSubscriptionId: subscription.id,
        },
      });

      if (!existing) {
        this.logger.warn(`Stripe subscription ${subscription.id} has no organization mapping`);
        throw new ServiceUnavailableException(
          'Stripe subscription ' + subscription.id +
            ' has no organization mapping yet; reconciliation required',
        );
      }

      organizationId = existing.organizationId;
    }

    if (!this.stripe) {
      throw new ServiceUnavailableException(
        `Stripe subscription ${subscription.id} cannot be synchronized because Stripe is not configured`,
      );
    }

    let currentSubscription: Stripe.Subscription;

    try {
      currentSubscription = await this.stripe.subscriptions.retrieve(subscription.id);
    } catch (error) {
      this.logger.error(
        `Unable to retrieve current Stripe subscription ${subscription.id}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw error;
    }

    if (currentSubscription.id !== subscription.id) {
      this.logger.error(
        `Retrieved Stripe subscription ID does not match event subscription ${subscription.id}; synchronization skipped`,
      );
      throw new StripeWebhookReviewRequiredError(
        'Stripe subscription ' + subscription.id + ' returned a mismatched Stripe subscription ID',
      );
    }

    const eventOrganizationId = subscription.metadata?.organizationId;
    const currentOrganizationId = currentSubscription.metadata?.organizationId;

    if (
      (eventOrganizationId && eventOrganizationId !== organizationId) ||
      (currentOrganizationId && currentOrganizationId !== organizationId)
    ) {
      this.logger.error(
        `Stripe subscription ${subscription.id} organization metadata mismatch; synchronization skipped`,
      );
      throw new StripeWebhookReviewRequiredError(
        'Stripe subscription ' + subscription.id +
          ' organization metadata mismatch',
      );
    }

    const synchronized = await this.syncStripeSubscriptionWithRecovery(
      organizationId,
      currentSubscription,
      claim,
    );

    if (!synchronized) {
      throw new ServiceUnavailableException(
        'Stripe subscription ' + subscription.id +
          ' could not be synchronized; reconciliation required',
      );
    }
  }

  private async syncStripeSubscriptionWithRecovery(
    organizationId: string,
    stripeSubscription: Stripe.Subscription,
    claim?: StripeSubscriptionSyncClaim,
  ): Promise<boolean> {
    const synchronize = () =>
      withSerializableRetry(this.prisma, async (tx) => {
        if (claim) {
          if (!this.subscriptionSyncLock) {
            throw new ServiceUnavailableException(
              'Stripe subscription synchronization lock is not configured',
            );
          }

          if (claim.subscriptionId !== stripeSubscription.id) {
            throw new ServiceUnavailableException(
              'Stripe subscription synchronization claim ID mismatch',
            );
          }

          await this.subscriptionSyncLock.assertOwnershipInTransaction(
            tx,
            claim,
          );
        }

        return this.syncSubscription(
          organizationId,
          stripeSubscription,
          undefined,
          tx,
        );
      });

    try {
      return await synchronize();
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      ) {
        throw error;
      }

      const target = error.meta?.target;
      const columns = Array.isArray(target)
        ? target.map(String)
        : [];

      const matchesStripeSubscriptionConstraint =
        columns.length === 2 &&
        columns.includes('provider') &&
        (
          columns.includes('provider_subscription_id') ||
          columns.includes('providerSubscriptionId')
        );

      if (!matchesStripeSubscriptionConstraint) {
        throw error;
      }

      const existing = await this.prisma.subscription.findFirst({
        where: {
          provider: 'stripe',
          providerSubscriptionId: stripeSubscription.id,
        },
      });

      if (!existing) {
        throw error;
      }

      if (existing.organizationId !== organizationId) {
        throw new StripeWebhookReviewRequiredError(
          'Stripe subscription ' + stripeSubscription.id +
          ' is already associated with another organization',
        );
      }

      return synchronize();
    }
  }

  private async syncSubscription(
    organizationId: string,
    stripeSubscription: Stripe.Subscription,
    expectedPlanId?: string,
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<boolean> {
    const planCode = stripeSubscription.metadata?.planCode?.toUpperCase();

    const plan = planCode
      ? await db.billingPlan.findUnique({
          where: {
            code: planCode,
          },
        })
      : null;

    if (expectedPlanId && (!plan || plan.id !== expectedPlanId)) {
      this.logger.error(
        'Stripe subscription ' + stripeSubscription.id +
          ' has no valid plan mapping matching the checkout attempt; synchronization skipped',
      );
      return false;
    }

    const existingByProvider = await db.subscription.findFirst({
      where: {
        provider: 'stripe',
        providerSubscriptionId: stripeSubscription.id,
      },
    });

    if (existingByProvider && existingByProvider.organizationId !== organizationId) {
      this.logger.error(
        'Stripe subscription ' + stripeSubscription.id + ' organization mismatch; synchronization skipped',
      );
      return false;
    }

    const latestLocal = existingByProvider
      ? null
      : await db.subscription.findFirst({
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

    // Reuse the current local subscription, including FREE, when Checkout
    // attaches the new Stripe subscription to the organization.
    const existing = existingByProvider ?? latestLocal;

    if (
      existing &&
      existing.providerSubscriptionId &&
      existing.providerSubscriptionId !== stripeSubscription.id
    ) {
      this.logger.warn(
        'Local subscription ' + existing.id + ' is already linked to a different Stripe subscription; synchronization skipped',
      );
      return false;
    }

    const customerId =
      typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer?.id;

    const status = this.mapStripeStatus(stripeSubscription.status);
    const subscriptionItem = stripeSubscription.items.data[0];

    if (!subscriptionItem) {
      this.logger.warn(
        'Stripe subscription ' + stripeSubscription.id + ' has no subscription items',
      );
      return false;
    }

    const data = {
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
    };

    if (existing) {
      await db.subscription.update({
        where: {
          id: existing.id,
        },
        data,
      });

      return true;
    }

    if (!plan) {
      this.logger.warn(
        'Stripe subscription ' + stripeSubscription.id + ' has no valid plan mapping',
      );
      return false;
    }

    await db.subscription.create({
      data: {
        organizationId,
        planId: plan.id,
        ...data,
      },
    });

    return true;
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
    const legacyInvoice = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };

    const subscription =
      invoice.parent?.subscription_details?.subscription ??
      legacyInvoice.subscription;

    const subscriptionId =
      typeof subscription === 'string'
        ? subscription
        : subscription?.id;

    if (!subscriptionId) {
      return;
    }

    return this.withSubscriptionSynchronizationLock(subscriptionId, () =>
      this.withDistributedSubscriptionLock(subscriptionId, (claim) =>
        this.handleInvoiceEventLocked(invoice, claim),
      ),
    );
  }

  private async handleInvoiceEventLocked(
    invoice: Stripe.Invoice,
    claim: StripeSubscriptionSyncClaim,
  ): Promise<void> {
    const invoiceWithLegacySubscription = invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    };

    const subscription =
      invoice.parent?.subscription_details?.subscription ??
      invoiceWithLegacySubscription.subscription;

    const stripeSubscriptionId =
      typeof subscription === 'string' ? subscription : subscription?.id;

    if (!stripeSubscriptionId) {
      return;
    }

    const localSubscription = await this.prisma.subscription.findFirst({
      where: {
        provider: 'stripe',
        providerSubscriptionId: stripeSubscriptionId,
      },
    });

    if (!localSubscription) {
      this.logger.warn(`No local subscription found for invoice ${invoice.id}`);
      throw new ServiceUnavailableException(
        'Invoice ' + invoice.id +
          ' has no local subscription yet; reconciliation required',
      );
    }

    if (!this.stripe) {
      throw new ServiceUnavailableException(
        `Invoice ${invoice.id} cannot be reconciled because Stripe is not configured`,
      );
    }

    try {
      // Os eventos podem chegar fora de ordem. O estado atual da subscrição
      // no Stripe prevalece sobre o estado histórico da fatura.
      const stripeSubscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

      if (stripeSubscription.id !== stripeSubscriptionId) {
        this.logger.error(
          `Retrieved Stripe subscription ID does not match invoice ${invoice.id}; synchronization skipped`,
        );
        throw new StripeWebhookReviewRequiredError(
          'Invoice ' + invoice.id + ' returned a mismatched Stripe subscription ID',
        );
      }

      const stripeOrganizationId = stripeSubscription.metadata?.organizationId;

      if (
        stripeOrganizationId &&
        stripeOrganizationId !== localSubscription.organizationId
      ) {
        this.logger.error(
          `Invoice ${invoice.id} Stripe subscription organization metadata mismatch; synchronization skipped`,
        );
        throw new StripeWebhookReviewRequiredError(
          'Invoice ' + invoice.id +
            ' Stripe subscription organization metadata mismatch',
        );
      }

      const synchronized = await this.syncStripeSubscriptionWithRecovery(
        localSubscription.organizationId,
        stripeSubscription,
        claim,
      );

      if (!synchronized) {
        throw new ServiceUnavailableException(
          'Invoice ' + invoice.id +
            ' subscription synchronization failed; reconciliation required',
        );
      }
    } catch (error) {
      this.logger.error(
        `Unable to reconcile Stripe subscription ${stripeSubscriptionId} for invoice ${invoice.id}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
      throw error;
    }
  }

}
