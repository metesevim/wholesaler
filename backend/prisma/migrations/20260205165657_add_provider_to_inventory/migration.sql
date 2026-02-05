-- AlterTable
ALTER TABLE "AdminInventoryItem" ADD COLUMN     "providerId" INTEGER;

-- AddForeignKey
ALTER TABLE "AdminInventoryItem" ADD CONSTRAINT "AdminInventoryItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
