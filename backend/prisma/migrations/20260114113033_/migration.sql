-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threatName" TEXT,
    "threatLevel" TEXT,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "attackType" TEXT,
    "sourceIp" TEXT NOT NULL,
    "destinationIp" TEXT,
    "sourcePort" INTEGER,
    "destinationPort" INTEGER,
    "protocol" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "isp" TEXT,
    "userName" TEXT,
    "deviceType" TEXT,
    "action" TEXT,
    "source" TEXT NOT NULL,
    "destination" TEXT,
    "port" INTEGER,
    "message" TEXT NOT NULL,
    "rawData" TEXT NOT NULL,
    "rawLog" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "sourceChannel" TEXT,
    "channelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_forwarding_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "destination" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_forwarding_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interface" TEXT,
    "ipAddress" TEXT,
    "netmask" TEXT,
    "gateway" TEXT,
    "dnsServers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations_config" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operations_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_config" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syslog_channels" (
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
CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "channelId" TEXT,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "transformType" TEXT NOT NULL DEFAULT 'direct',
    "transformConfig" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openai_config" (
    "id" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "openai_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generated_mappings" (
    "id" TEXT NOT NULL,
    "channelPattern" TEXT NOT NULL,
    "sampleData" JSONB NOT NULL,
    "generatedMappings" JSONB NOT NULL,
    "tested" BOOLEAN NOT NULL DEFAULT false,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generated_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "security_events_timestamp_idx" ON "security_events"("timestamp");

-- CreateIndex
CREATE INDEX "security_events_severity_idx" ON "security_events"("severity");

-- CreateIndex
CREATE INDEX "security_events_threatLevel_idx" ON "security_events"("threatLevel");

-- CreateIndex
CREATE INDEX "security_events_category_idx" ON "security_events"("category");

-- CreateIndex
CREATE INDEX "security_events_attackType_idx" ON "security_events"("attackType");

-- CreateIndex
CREATE INDEX "security_events_status_idx" ON "security_events"("status");

-- CreateIndex
CREATE INDEX "security_events_channelId_idx" ON "security_events"("channelId");

-- CreateIndex
CREATE INDEX "security_events_sourceIp_idx" ON "security_events"("sourceIp");

-- CreateIndex
CREATE INDEX "security_events_destinationIp_idx" ON "security_events"("destinationIp");

-- CreateIndex
CREATE INDEX "security_events_country_idx" ON "security_events"("country");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "network_config_name_key" ON "network_config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "operations_config_category_key_key" ON "operations_config"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "security_config_category_key_key" ON "security_config"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "syslog_channels_sourceIdentifier_key" ON "syslog_channels"("sourceIdentifier");

-- CreateIndex
CREATE INDEX "syslog_channels_sourceIdentifier_idx" ON "syslog_channels"("sourceIdentifier");

-- CreateIndex
CREATE INDEX "field_mappings_channelId_idx" ON "field_mappings"("channelId");

-- CreateIndex
CREATE INDEX "ai_generated_mappings_channelPattern_idx" ON "ai_generated_mappings"("channelPattern");

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "syslog_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_mappings" ADD CONSTRAINT "field_mappings_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "syslog_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
