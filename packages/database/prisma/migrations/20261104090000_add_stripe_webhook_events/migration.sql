CREATE TYPE "StripeWebhookEventStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REQUIRES_REVIEW'
);

CREATE TABLE "stripe_webhook_events" (
  "id" TEXT NOT NULL,
  "stripe_event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "status" "StripeWebhookEventStatus" NOT NULL DEFAULT 'PENDING',
  "organization_id" TEXT,
  "payload" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "next_retry_at" TIMESTAMP(3),
  "claim_token" TEXT,
  "processing_at" TIMESTAMP(3),
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stripe_webhook_events_stripe_event_id_key"
ON "stripe_webhook_events"("stripe_event_id");

CREATE INDEX "stripe_webhook_events_status_next_retry_at_idx"
ON "stripe_webhook_events"("status", "next_retry_at");

CREATE INDEX "stripe_webhook_events_organization_id_idx"
ON "stripe_webhook_events"("organization_id");

CREATE INDEX "stripe_webhook_events_created_at_idx"
ON "stripe_webhook_events"("created_at");
