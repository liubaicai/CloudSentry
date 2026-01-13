-- CreateTable
CREATE TABLE IF NOT EXISTS "syslog_channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceIdentifier" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "lastEventAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "syslog_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "field_mappings" (
    "id" TEXT NOT NULL,
    "channelId" TEXT,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "transformType" TEXT NOT NULL DEFAULT 'direct',
    "transformConfig" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "security_events" ADD COLUMN IF NOT EXISTS "channelId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "syslog_channels_sourceIdentifier_key" ON "syslog_channels"("sourceIdentifier");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "syslog_channels_sourceIdentifier_idx" ON "syslog_channels"("sourceIdentifier");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "field_mappings_channelId_idx" ON "field_mappings"("channelId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "security_events_channelId_idx" ON "security_events"("channelId");

-- AddForeignKey
ALTER TABLE "security_events" 
    DROP CONSTRAINT IF EXISTS "security_events_channelId_fkey",
    ADD CONSTRAINT "security_events_channelId_fkey" 
    FOREIGN KEY ("channelId") REFERENCES "syslog_channels"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_mappings" 
    DROP CONSTRAINT IF EXISTS "field_mappings_channelId_fkey",
    ADD CONSTRAINT "field_mappings_channelId_fkey" 
    FOREIGN KEY ("channelId") REFERENCES "syslog_channels"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
