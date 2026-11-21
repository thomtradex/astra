-- Associate each completed checkout attempt with its
-- exact Stripe subscription.
--
-- Nullable for checkout attempts that have not completed.
-- Existing rows remain valid.
--
-- This migration must be applied separately after approval.

ALTER TABLE "checkout_attempts"
ADD COLUMN "provider_subscription_id" TEXT;
