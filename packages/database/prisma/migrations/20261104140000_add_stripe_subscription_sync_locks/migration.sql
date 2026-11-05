CREATE TABLE "stripe_subscription_sync_locks" (
  "subscription_id" TEXT NOT NULL,
  "claim_token" TEXT,
  "generation" BIGINT NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stripe_subscription_sync_locks_pkey"
    PRIMARY KEY ("subscription_id")
);

CREATE INDEX "stripe_subscription_sync_locks_expires_at_idx"
ON "stripe_subscription_sync_locks"("expires_at");
