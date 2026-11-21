CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "lead_time_days" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" TEXT NOT NULL,
    "unit_cost" DECIMAL(12,2),
    "lead_time_days" INTEGER,
    "reorder_point" DECIMAL(12,3),
    "reorder_quantity" DECIMAL(12,3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "suppliers_organization_id_code_key"
ON "suppliers"("organization_id", "code");

CREATE INDEX "suppliers_organization_id_idx"
ON "suppliers"("organization_id");

CREATE INDEX "suppliers_organization_id_active_idx"
ON "suppliers"("organization_id", "active");

CREATE INDEX "suppliers_organization_id_name_idx"
ON "suppliers"("organization_id", "name");

CREATE UNIQUE INDEX "materials_organization_id_code_key"
ON "materials"("organization_id", "code");

CREATE INDEX "materials_organization_id_idx"
ON "materials"("organization_id");

CREATE INDEX "materials_organization_id_active_idx"
ON "materials"("organization_id", "active");

CREATE INDEX "materials_organization_id_supplier_id_idx"
ON "materials"("organization_id", "supplier_id");

CREATE INDEX "materials_supplier_id_idx"
ON "materials"("supplier_id");

ALTER TABLE "suppliers"
ADD CONSTRAINT "suppliers_organization_id_fkey"
FOREIGN KEY ("organization_id")
REFERENCES "organizations"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "materials"
ADD CONSTRAINT "materials_organization_id_fkey"
FOREIGN KEY ("organization_id")
REFERENCES "organizations"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "materials"
ADD CONSTRAINT "materials_supplier_id_fkey"
FOREIGN KEY ("supplier_id")
REFERENCES "suppliers"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
