/*
  Warnings:

  - You are about to drop the column `customersId` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_stockId` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `customersId` on the `inventory_stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_customersId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_inventory_stockId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_stock" DROP CONSTRAINT "inventory_stock_customersId_fkey";

-- AlterTable
ALTER TABLE "inventory_movements" DROP COLUMN "customersId",
DROP COLUMN "inventory_stockId";

-- AlterTable
ALTER TABLE "inventory_stock" DROP COLUMN "customersId";
