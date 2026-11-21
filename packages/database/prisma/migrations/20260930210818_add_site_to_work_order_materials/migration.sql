/*
  Add site_id to work_order_materials.

  Existing work_order_materials rows cannot be backfilled automatically because
  work_orders does not have a site_id relation. Do not invent a site assignment.

  The migration therefore:
  1. Adds site_id as nullable.
  2. Fails explicitly if existing rows require a manual data migration.
  3. Makes site_id required once the table is known to be empty.
*/

ALTER TABLE "work_order_materials"
ADD COLUMN "site_id" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "work_order_materials"
    LIMIT 1
  ) THEN
    RAISE EXCEPTION
      'Cannot migrate work_order_materials: existing rows require a manual site_id assignment before site_id can be made NOT NULL.';
  END IF;
END $$;

ALTER TABLE "work_order_materials"
ALTER COLUMN "site_id" SET NOT NULL;

CREATE INDEX "work_order_materials_organization_id_site_id_idx"
ON "work_order_materials"("organization_id", "site_id");

ALTER TABLE "work_order_materials"
ADD CONSTRAINT "work_order_materials_site_id_fkey"
FOREIGN KEY ("site_id") REFERENCES "sites"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
