ALTER TABLE "organizations"
ADD COLUMN IF NOT EXISTS "employees" INTEGER;

ALTER TABLE "organizations"
ADD COLUMN IF NOT EXISTS "preference" TEXT;
