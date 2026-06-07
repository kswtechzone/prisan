-- CreateTable
CREATE TABLE "spin_config" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "daily_spin_limit" INTEGER NOT NULL DEFAULT 10,
    "weekly_claim_period_days" INTEGER NOT NULL DEFAULT 7,
    "anti_spam_cooldown_ms" INTEGER NOT NULL DEFAULT 3000,
    "stale_pending_minutes" INTEGER NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "spin_config_pkey" PRIMARY KEY ("id")
);

-- Insert default row
INSERT INTO "spin_config" (id, daily_spin_limit, weekly_claim_period_days, anti_spam_cooldown_ms, stale_pending_minutes) 
VALUES ('default', 10, 7, 3000, 10) 
ON CONFLICT (id) DO NOTHING;
