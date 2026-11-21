export enum StripeWebhookOutcomeStatus {
  PROCESSED = 'PROCESSED',
  IGNORED = 'IGNORED',
  RETRYABLE = 'RETRYABLE',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
}

export type StripeWebhookOutcome =
  | { status: StripeWebhookOutcomeStatus.PROCESSED }
  | { status: StripeWebhookOutcomeStatus.IGNORED; reason: string }
  | { status: StripeWebhookOutcomeStatus.RETRYABLE; reason: string }
  | { status: StripeWebhookOutcomeStatus.REQUIRES_REVIEW; reason: string };

export class StripeWebhookReviewRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeWebhookReviewRequiredError';
  }
}
