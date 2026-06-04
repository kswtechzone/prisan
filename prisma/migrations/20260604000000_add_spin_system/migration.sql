-- Migration: Add spin & win system + customer registration support
-- Steps:
-- 1. Add new columns to users table
-- 2. Migrate existing data (name -> full_name)
-- 3. Drop old columns
-- 4. Create spin_offers table
-- 5. Create spin_history table

-- Step 1: Add new user columns (nullable for data migration)
ALTER TABLE "users" ADD COLUMN "full_name" TEXT;
ALTER TABLE "users" ADD COLUMN "mobile" TEXT;
ALTER TABLE "users" ADD COLUMN "address" TEXT;

-- Step 2: Migrate existing name data to full_name
UPDATE "users" SET "full_name" = "name" WHERE "full_name" IS NULL;

-- Step 3: Make full_name NOT NULL and drop old name column
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;
ALTER TABLE "users" DROP COLUMN "name";

-- Step 4: Update existing admin user role if needed (keep as admin)
-- Default role for new users will be 'customer' (handled by Prisma schema default)

-- Step 5: Create spin_offers table
CREATE TABLE "spin_offers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "probability" DOUBLE PRECISION NOT NULL,
    "reward_type" TEXT NOT NULL,
    "coupon_code" TEXT,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spin_offers_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create spin_history table
CREATE TABLE "spin_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "offer_id" TEXT,
    "reward" TEXT NOT NULL,
    "coupon_code" TEXT,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spin_history_pkey" PRIMARY KEY ("id")
);

-- Step 7: Add foreign key constraints
ALTER TABLE "spin_history" ADD CONSTRAINT "spin_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "spin_history" ADD CONSTRAINT "spin_history_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "spin_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 8: Create indexes
CREATE INDEX "spin_history_user_id_idx" ON "spin_history"("user_id");
CREATE INDEX "spin_history_offer_id_idx" ON "spin_history"("offer_id");
CREATE INDEX "spin_offers_is_active_idx" ON "spin_offers"("is_active");
