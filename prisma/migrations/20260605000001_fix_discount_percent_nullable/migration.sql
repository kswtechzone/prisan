-- Make discount_percent nullable to match Prisma schema (Int?)
ALTER TABLE "coupon_codes" ALTER COLUMN "discount_percent" DROP NOT NULL;
ALTER TABLE "coupon_codes" ALTER COLUMN "discount_percent" DROP DEFAULT;
