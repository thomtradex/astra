/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,code]` on the table `assets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,code]` on the table `sites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "assets_code_key";

-- DropIndex
DROP INDEX "sites_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "assets_organization_id_code_key" ON "assets"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "sites_organization_id_code_key" ON "sites"("organization_id", "code");
