-- Create projects table
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "site_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "budget_cents" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Project indexes
CREATE UNIQUE INDEX "projects_organization_id_code_key"
ON "projects"("organization_id", "code");

CREATE INDEX "projects_organization_id_idx"
ON "projects"("organization_id");

CREATE INDEX "projects_customer_id_idx"
ON "projects"("customer_id");

CREATE INDEX "projects_site_id_idx"
ON "projects"("site_id");

CREATE INDEX "projects_organization_id_status_idx"
ON "projects"("organization_id", "status");

-- Project foreign keys
ALTER TABLE "projects"
ADD CONSTRAINT "projects_organization_id_fkey"
FOREIGN KEY ("organization_id")
REFERENCES "organizations"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "projects"
ADD CONSTRAINT "projects_customer_id_fkey"
FOREIGN KEY ("customer_id")
REFERENCES "customers"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "projects"
ADD CONSTRAINT "projects_site_id_fkey"
FOREIGN KEY ("site_id")
REFERENCES "sites"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add project context to work orders
ALTER TABLE "work_orders"
ADD COLUMN "project_id" TEXT;

CREATE INDEX "work_orders_project_id_idx"
ON "work_orders"("project_id");

ALTER TABLE "work_orders"
ADD CONSTRAINT "work_orders_project_id_fkey"
FOREIGN KEY ("project_id")
REFERENCES "projects"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
