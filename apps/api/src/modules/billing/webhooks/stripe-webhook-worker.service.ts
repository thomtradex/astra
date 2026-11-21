import { Injectable, Logger } from '@nestjs/common';
import { StripeWebhookEventStatus } from '@astra/database';
import Stripe from 'stripe';

import { BillingWebhookService } from './billing-webhook.service';
import { StripeWebhookEventService } from './stripe-webhook-event.service';
import { StripeWebhookReviewRequiredError } from './stripe-webhook-outcome';

@Injectable()
export class StripeWebhookWorker {
  private readonly logger = new Logger(StripeWebhookWorker.name);

  private startClaimHeartbeat(
    stripeEventId: string,
    token: string,
  ): {
    stop: () => Promise<boolean>;
  } {
    let stopped = false;
    let healthy = true;
    let pending: Promise<void> | null = null;

    const timer = setInterval(() => {
      if (stopped || pending || !healthy) {
        return;
      }

      pending = (async () => {
        try {
          const renewed = await this.events.renewClaim(
            stripeEventId,
            token,
          );

          if (!renewed) {
            healthy = false;
            this.logger.error(
              'Stripe event ' + stripeEventId +
              ' lost its processing claim',
            );
          }
        } catch (error) {
          healthy = false;

          const reason =
            error instanceof Error ? error.message : String(error);

          this.logger.error(
            'Stripe event ' + stripeEventId +
            ' claim renewal failed: ' + reason,
          );
        }
      })().finally(() => {
        pending = null;
      });
    }, 60_000);

    timer.unref();

    return {
      stop: async () => {
        stopped = true;
        clearInterval(timer);

        const inFlight = pending;
        if (inFlight) {
          await inFlight;
        }

        return healthy;
      },
    };
  }


  constructor(
    private readonly events: StripeWebhookEventService,
    private readonly billing: BillingWebhookService,
  ) {}

  async processBatch(limit = 25): Promise<{
    discovered: number;
    completed: number;
    incomplete: number;
  }> {
    await this.events.finalizeExhaustedClaims();

    const eventIds = await this.events.findReadyEvents(limit);

    let completed = 0;
    let incomplete = 0;

    for (const eventId of eventIds) {
      try {
        const success = await this.processOne(eventId);

        if (success) {
          completed++;
        } else {
          incomplete++;
        }
      } catch (error) {
        incomplete++;

        const reason =
          error instanceof Error ? error.message : String(error);

        this.logger.error(
          'Stripe event ' + eventId +
          ' batch processing failed: ' + reason,
        );
      }
    }

    return {
      discovered: eventIds.length,
      completed,
      incomplete,
    };
  }

  async processOne(stripeEventId: string): Promise<boolean> {
    const token = await this.events.claim(stripeEventId);

    if (!token) {
      return false;
    }

    let event: Stripe.Event;

    try {
      const stored = await this.events.getEvent(stripeEventId);

      if (
        !stored ||
        stored.status !== StripeWebhookEventStatus.PROCESSING ||
        stored.claimToken !== token
      ) {
        this.logger.warn(
          'Stripe event ' + stripeEventId + ' claim is no longer valid',
        );
        return false;
      }

      event = stored.payload as unknown as Stripe.Event;

      if (
        !event ||
        event.id !== stripeEventId ||
        event.type !== stored.eventType ||
        !event.data ||
        !event.data.object
      ) {
        throw new StripeWebhookReviewRequiredError(
          'Persisted Stripe event payload is invalid',
        );
      }
    } catch (error) {
      return this.handleProcessingError(stripeEventId, token, error);
    }

    const heartbeat = this.startClaimHeartbeat(
      stripeEventId,
      token,
    );

    let processingError: unknown;
    let processingFailed = false;

    try {
      await this.billing.processVerifiedStripeEvent(event);
    } catch (error) {
      processingError = error;
      processingFailed = true;
    }

    const claimHealthy = await heartbeat.stop();

    if (!claimHealthy) {
      this.logger.error(
        'Stripe event ' + stripeEventId +
        ' cannot be finalized after losing its claim',
      );
      return false;
    }

    if (processingFailed) {
      return this.handleProcessingError(
        stripeEventId,
        token,
        processingError,
      );
    }

    // A finalização é independente do tratamento de erros do handler.
    // Uma falha aqui não deve transformar sucesso em FAILED.
    const completed = await this.events.complete(stripeEventId, token);

    if (!completed) {
      this.logger.error(
        'Stripe event ' + stripeEventId +
        ' processed but completion claim was rejected',
      );
    }

    return completed;
  }

  private async handleProcessingError(
    stripeEventId: string,
    token: string,
    error: unknown,
  ): Promise<boolean> {
    const reason =
      error instanceof Error ? error.message : String(error);

    if (error instanceof StripeWebhookReviewRequiredError) {
      const reviewed = await this.events.requireReview(
        stripeEventId,
        token,
        reason,
      );

      if (!reviewed) {
        this.logger.error(
          'Stripe event ' + stripeEventId +
          ' could not be marked for review',
        );
      }

      return false;
    }

    const failed = await this.events.fail(
      stripeEventId,
      token,
      reason,
    );

    if (!failed) {
      this.logger.error(
        'Stripe event ' + stripeEventId +
        ' could not be marked as failed',
      );
    }

    return false;
  }
}
