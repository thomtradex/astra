import { randomUUID } from 'node:crypto';
import { Prisma, StripeWebhookEventStatus } from '@astra/database';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { PrismaService } from '../../../prisma/prisma.service';

const MAX_ATTEMPTS = 8;
const BASE_RETRY_MS = 30_000;

@Injectable()
export class StripeWebhookEventService {
  constructor(private readonly prisma: PrismaService) {}

  async register(event: Stripe.Event) {
    try {
      return await this.prisma.stripeWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          payload: JSON.parse(JSON.stringify(event)) as Prisma.InputJsonValue,
          status: StripeWebhookEventStatus.PENDING,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.prisma.stripeWebhookEvent.findUnique({
          where: { stripeEventId: event.id },
        });

        if (existing && existing.eventType === event.type) {
          return existing;
        }
      }

      throw error;
    }
  }

  async getEvent(stripeEventId: string) {
    return this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId },
    });
  }

  async findReadyEvents(limit = 25): Promise<string[]> {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - 5 * 60 * 1000);

    const events = await this.prisma.stripeWebhookEvent.findMany({
      where: {
        attempts: { lt: MAX_ATTEMPTS },
        OR: [
          {
            status: StripeWebhookEventStatus.PENDING,
          },
          {
            status: StripeWebhookEventStatus.FAILED,
            nextRetryAt: { lte: now },
          },
          {
            status: StripeWebhookEventStatus.PROCESSING,
            processingAt: { lte: expiredBefore },
          },
        ],
      },
      select: {
        stripeEventId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: Math.min(Math.max(Math.trunc(limit), 1), 100),
    });

    return events.map((event) => event.stripeEventId);
  }

  async claim(
    stripeEventId: string,
  ): Promise<string | null> {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - 5 * 60 * 1000);
    const claimToken = randomUUID();

    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        stripeEventId,
        attempts: { lt: MAX_ATTEMPTS },
        OR: [
          {
            status: StripeWebhookEventStatus.PENDING,
          },
          {
            status: StripeWebhookEventStatus.FAILED,
            nextRetryAt: { lte: now },
          },
          {
            status: StripeWebhookEventStatus.PROCESSING,
            processingAt: { lte: expiredBefore },
          },
        ],
      },
      data: {
        status: StripeWebhookEventStatus.PROCESSING,
        claimToken,
        processingAt: now,
        attempts: { increment: 1 },
        lastError: null,
        nextRetryAt: null,
      },
    });

    return result.count === 1 ? claimToken : null;
  }

  async renewClaim(
    stripeEventId: string,
    claimToken: string,
  ): Promise<boolean> {
    const now = new Date();
    const expiredBefore = new Date(now.getTime() - 5 * 60 * 1000);

    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        stripeEventId,
        claimToken,
        status: StripeWebhookEventStatus.PROCESSING,
        processingAt: { gt: expiredBefore },
      },
      data: {
        processingAt: now,
      },
    });

    return result.count === 1;
  }

  async complete(
    stripeEventId: string,
    claimToken: string,
  ): Promise<boolean> {
    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        stripeEventId,
        claimToken,
        status: StripeWebhookEventStatus.PROCESSING,
      },
      data: {
        status: StripeWebhookEventStatus.COMPLETED,
        processedAt: new Date(),
        processingAt: null,
        claimToken: null,
        lastError: null,
        nextRetryAt: null,
      },
    });

    return result.count === 1;
  }

  async finalizeExhaustedClaims(): Promise<number> {
    const expiredBefore = new Date(Date.now() - 5 * 60 * 1000);

    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        status: StripeWebhookEventStatus.PROCESSING,
        attempts: { gte: MAX_ATTEMPTS },
        processingAt: { lte: expiredBefore },
      },
      data: {
        status: StripeWebhookEventStatus.REQUIRES_REVIEW,
        claimToken: null,
        processingAt: null,
        nextRetryAt: null,
        processedAt: null,
        lastError: 'Processing claim expired after maximum retry attempts',
      },
    });

    return result.count;
  }

  async requireReview(
    stripeEventId: string,
    claimToken: string,
    reason: string,
  ): Promise<boolean> {
    const current = await this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId },
      select: {
        status: true,
        claimToken: true,
        attempts: true,
      },
    });

    if (
      !current ||
      current.status !== StripeWebhookEventStatus.PROCESSING ||
      current.claimToken !== claimToken
    ) {
      return false;
    }

    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        stripeEventId,
        claimToken,
        status: StripeWebhookEventStatus.PROCESSING,
        attempts: current.attempts,
      },
      data: {
        status: StripeWebhookEventStatus.REQUIRES_REVIEW,
        processingAt: null,
        claimToken: null,
        nextRetryAt: null,
        processedAt: null,
        lastError: reason.slice(0, 500),
      },
    });

    return result.count === 1;
  }

  async fail(
    stripeEventId: string,
    claimToken: string,
    reason: string,
    nextRetryAt?: Date | null,
  ): Promise<boolean> {
    const current = await this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId },
      select: {
        status: true,
        claimToken: true,
        attempts: true,
      },
    });

    if (
      !current ||
      current.status !== StripeWebhookEventStatus.PROCESSING ||
      current.claimToken !== claimToken
    ) {
      return false;
    }

    const exhausted = current.attempts >= MAX_ATTEMPTS;

    const retryDate = exhausted
      ? null
      : nextRetryAt ??
        new Date(
          Date.now() +
            BASE_RETRY_MS *
              2 ** Math.max(0, current.attempts - 1),
        );

    const result = await this.prisma.stripeWebhookEvent.updateMany({
      where: {
        stripeEventId,
        claimToken,
        status: StripeWebhookEventStatus.PROCESSING,
        attempts: current.attempts,
      },
      data: {
        status: exhausted
          ? StripeWebhookEventStatus.REQUIRES_REVIEW
          : StripeWebhookEventStatus.FAILED,
        processingAt: null,
        claimToken: null,
        lastError: reason.slice(0, 500),
        nextRetryAt: retryDate,
      },
    });

    return result.count === 1;
  }

}
