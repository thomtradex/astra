-- CreateTable
CREATE TABLE "inventory_stock" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity_on_hand" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "quantity_reserved" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customersId" TEXT,

    CONSTRAINT "inventory_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "reason" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customersId" TEXT,
    "inventory_stockId" TEXT,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_materials" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "required_quantity" DECIMAL(12,3) NOT NULL,
    "reserved_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "consumed_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REQUIRED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_stock_organization_id_idx" ON "inventory_stock"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_stock_organization_id_site_id_idx" ON "inventory_stock"("organization_id", "site_id");

-- CreateIndex
CREATE INDEX "inventory_stock_organization_id_material_id_idx" ON "inventory_stock"("organization_id", "material_id");

-- CreateIndex
CREATE INDEX "inventory_stock_site_id_idx" ON "inventory_stock"("site_id");

-- CreateIndex
CREATE INDEX "inventory_stock_material_id_idx" ON "inventory_stock"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stock_organization_id_site_id_material_id_key" ON "inventory_stock"("organization_id", "site_id", "material_id");

-- CreateIndex
CREATE INDEX "inventory_movements_organization_id_idx" ON "inventory_movements"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_movements_organization_id_site_id_idx" ON "inventory_movements"("organization_id", "site_id");

-- CreateIndex
CREATE INDEX "inventory_movements_organization_id_material_id_idx" ON "inventory_movements"("organization_id", "material_id");

-- CreateIndex
CREATE INDEX "inventory_movements_organization_id_occurred_at_idx" ON "inventory_movements"("organization_id", "occurred_at");

-- CreateIndex
CREATE INDEX "inventory_movements_material_id_occurred_at_idx" ON "inventory_movements"("material_id", "occurred_at");

-- CreateIndex
CREATE INDEX "inventory_movements_reference_type_reference_id_idx" ON "inventory_movements"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "work_order_materials_organization_id_idx" ON "work_order_materials"("organization_id");

-- CreateIndex
CREATE INDEX "work_order_materials_organization_id_work_order_id_idx" ON "work_order_materials"("organization_id", "work_order_id");

-- CreateIndex
CREATE INDEX "work_order_materials_organization_id_material_id_idx" ON "work_order_materials"("organization_id", "material_id");

-- CreateIndex
CREATE INDEX "work_order_materials_work_order_id_idx" ON "work_order_materials"("work_order_id");

-- CreateIndex
CREATE INDEX "work_order_materials_material_id_idx" ON "work_order_materials"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_materials_work_order_id_material_id_key" ON "work_order_materials"("work_order_id", "material_id");

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_customersId_fkey" FOREIGN KEY ("customersId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_customersId_fkey" FOREIGN KEY ("customersId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_stockId_fkey" FOREIGN KEY ("inventory_stockId") REFERENCES "inventory_stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
