-- AddIBANToUserAndCustomer
-- Add IBAN field to User model (for employees)
ALTER TABLE "User" ADD COLUMN "iban" TEXT;

-- Add IBAN field to Customer model
ALTER TABLE "Customer" ADD COLUMN "iban" TEXT;

