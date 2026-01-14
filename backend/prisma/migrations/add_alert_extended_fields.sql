-- AlterTable: Add extended fields to security_events table
-- These fields provide additional context for security alerts

-- Geographic information
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "isp" TEXT;

-- Attack type information
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "attackType" TEXT;

-- User and device information
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "deviceType" TEXT;

-- Action information
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "action" TEXT;

-- CreateIndex for new fields
CREATE INDEX IF NOT EXISTS "security_events_attackType_idx" ON "security_events"("attackType");
CREATE INDEX IF NOT EXISTS "security_events_country_idx" ON "security_events"("country");
