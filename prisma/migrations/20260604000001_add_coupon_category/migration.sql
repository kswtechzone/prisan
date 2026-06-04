-- Add category column to spin_offers
ALTER TABLE "spin_offers" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Add category column to spin_history
ALTER TABLE "spin_history" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Add category column to coupon_codes
ALTER TABLE "coupon_codes" ADD COLUMN IF NOT EXISTS "category" TEXT;
