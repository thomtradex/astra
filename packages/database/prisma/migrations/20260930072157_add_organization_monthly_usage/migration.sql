-- CreateTable
CREATE TABLE "organization_monthly_usage" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "ai_requests" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_monthly_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_monthly_usage_organization_id_idx" ON "organization_monthly_usage"("organization_id");

-- CreateIndex
CREATE INDEX "organization_monthly_usage_period_start_idx" ON "organization_monthly_usage"("period_start");

-- CreateIndex
CREATE UNIQUE INDEX "organization_monthly_usage_organization_id_period_start_key" ON "organization_monthly_usage"("organization_id", "period_start");

-- AddForeignKey
ALTER TABLE "organization_monthly_usage" ADD CONSTRAINT "organization_monthly_usage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
