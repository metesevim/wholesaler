/*
  Warnings:

  - You are about to drop the column `lowStockAlert` on the `AdminInventoryItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminInventoryItem" DROP COLUMN "lowStockAlert",
ADD COLUMN     "maximumCapacity" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "minimumCapacity" INTEGER NOT NULL DEFAULT 20;
