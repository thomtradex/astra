-- AlterTable
ALTER TABLE "billing_plans" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "features" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "limits" JSONB NOT NULL DEFAULT '{}';
