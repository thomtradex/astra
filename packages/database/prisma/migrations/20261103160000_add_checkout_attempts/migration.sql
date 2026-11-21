-- CreateEnum
CREATE TYPE "CheckoutAttemptStatus" AS ENUM ('CREATING', 'OPEN', 'COMPLETED', 'EXPIRED', 'FAILED');

-- CreateTable
CREATE TABLE "checkout_attempts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "plan_code" TEXT NOT NULL,
    "customer_email" TEXT,
    "stripe_price_id" TEXT NOT NULL,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "success_url" TEXT NOT NULL,
    "cancel_url" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "stripe_session_id" TEXT,
    "checkout_url" TEXT,
    "status" "CheckoutAttemptStatus" NOT NULL DEFAULT 'CREATING',
    "active_organization_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_attempts_idempotency_key_key" ON "checkout_attempts"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_attempts_stripe_session_id_key" ON "checkout_attempts"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_attempts_active_organization_id_key" ON "checkout_attempts"("active_organization_id");

-- CreateIndex
CREATE INDEX "checkout_attempts_organization_id_status_idx" ON "checkout_attempts"("organization_id", "status");

-- CreateIndex
CREATE INDEX "checkout_attempts_expires_at_idx" ON "checkout_attempts"("expires_at");

-- AddForeignKey
ALTER TABLE "checkout_attempts" ADD CONSTRAINT "checkout_attempts_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_attempts" ADD CONSTRAINT "checkout_attempts_plan_id_fkey"
FOREIGN KEY ("plan_id") REFERENCES "billing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
