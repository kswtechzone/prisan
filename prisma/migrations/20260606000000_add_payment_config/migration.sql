-- Create payment_config table for admin-managed payment details
CREATE TABLE "payment_config" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "bank_holder" TEXT,
    "esewa_number" TEXT,
    "khalti_number" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_config_pkey" PRIMARY KEY ("id")
);
