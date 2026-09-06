ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "users" TEXT;

ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "company_size" TEXT;

ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "capacity" TEXT;

ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "features" TEXT;

ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "integrations" TEXT;

ALTER TABLE "enterprise_requests"
ADD COLUMN IF NOT EXISTS "support" TEXT;
