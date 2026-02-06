-- CreateEnum
CREATE TYPE "ProviderOrderStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ProviderOrder" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "status" "ProviderOrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderOrderItem" (
    "id" SERIAL NOT NULL,
    "providerOrderId" INTEGER NOT NULL,
    "adminItemId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "productCode" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderOrderItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProviderOrder" ADD CONSTRAINT "ProviderOrder_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrderItem" ADD CONSTRAINT "ProviderOrderItem_providerOrderId_fkey" FOREIGN KEY ("providerOrderId") REFERENCES "ProviderOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderOrderItem" ADD CONSTRAINT "ProviderOrderItem_adminItemId_fkey" FOREIGN KEY ("adminItemId") REFERENCES "AdminInventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
