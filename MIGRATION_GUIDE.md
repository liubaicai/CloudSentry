# Database Migration Guide

## Overview

This migration adds enhanced threat data fields, AI-powered field mapping capabilities, and data retention policies to CloudSentry.

## Changes

### New Models

1. **OpenAIConfig** - Configuration for OpenAI-compatible APIs
   - `baseUrl` - API endpoint
   - `apiKey` - Authentication key
   - `model` - Model to use for generation
   - `enabled` - Whether this configuration is active

2. **AIGeneratedMapping** - Stores AI-generated field mappings for reuse
   - `channelPattern` - Pattern identifying the channel
   - `sampleData` - Sample data used for generation
   - `generatedMappings` - The generated mappings
   - `tested` - Whether mapping has been tested
   - `successCount` - Number of successful applications
   - `failureCount` - Number of failures
   - `lastUsedAt` - Last usage timestamp

### Enhanced Models

1. **SecurityEvent** - Additional threat tracking fields
   - `threatName` - Name of the threat
   - `threatLevel` - Threat severity level
   - `sourceIp` - Source IP (enhanced field)
   - `destinationIp` - Destination IP (enhanced field)
   - `sourcePort` - Source port
   - `destinationPort` - Destination port
   - `sourceChannel` - Source channel identifier
   - `rawData` - Raw data (alias for rawLog)
   - New indexes on `threatLevel`, `sourceIp`, `destinationIp`

2. **FieldMapping** - AI generation tracking
   - `aiGenerated` - Boolean flag indicating AI-generated mappings

## Migration Steps

### Development Environment

```bash
cd backend

# Create migration
npx prisma migrate dev --name add_enhanced_threat_fields_and_ai_mapping

# Generate Prisma client
npx prisma generate

# Restart backend server
npm run dev
```

### Production Environment

```bash
cd backend

# Apply migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Restart backend server
npm start
```

### Docker Environment

```bash
# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d

# Migrations are applied automatically on container start
```

## Backward Compatibility

### Data Preservation

- All existing `SecurityEvent` records will be preserved
- Legacy fields (`source`, `destination`, `port`, `rawLog`) are maintained
- New fields are nullable and won't break existing queries

### API Compatibility

- Existing API endpoints continue to work
- New fields are optional in POST requests
- GET responses include both old and new fields

### Field Mapping

When sending syslog data, you can use either old or new field names:

**Old format (still works):**
```json
{
  "source": "192.168.1.100",
  "destination": "10.0.0.50",
  "severity": "high",
  "message": "Threat detected"
}
```

**New format (recommended):**
```json
{
  "sourceIp": "192.168.1.100",
  "destinationIp": "10.0.0.50",
  "sourcePort": 54321,
  "destinationPort": 443,
  "threatName": "SQL Injection Attempt",
  "threatLevel": "high",
  "severity": "high",
  "message": "Threat detected"
}
```

**Mixed format (also works):**
```json
{
  "src_ip": "192.168.1.100",
  "dst_ip": "10.0.0.50",
  "alert_level": "3",
  "message": "Threat detected"
}
```

The syslog controller will map common variations:
- `src_ip`, `source_ip`, `sourceIp` → `sourceIp`
- `dst_ip`, `destination_ip`, `destinationIp` → `destinationIp`
- `src_port`, `source_port`, `sourcePort` → `sourcePort`
- `dst_port`, `destination_port`, `destinationPort` → `destinationPort`

## Post-Migration Tasks

### 1. Configure OpenAI (Optional)

If you want to use AI-powered field mapping:

```bash
curl -X POST http://localhost:3000/api/openai-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-...",
    "model": "gpt-3.5-turbo",
    "enabled": true
  }'
```

### 2. Test Data Retention

The data retention service starts automatically. To verify:

```bash
# Check logs for "Automatic data retention cleanup started"
docker-compose logs backend | grep retention

# Or in development
npm run dev | grep retention
```

### 3. Update Field Mappings

Review existing field mappings and add new target fields as needed:

- `threatName`
- `threatLevel`
- `sourceIp`
- `destinationIp`
- `sourcePort`
- `destinationPort`

### 4. Test New Endpoints

```bash
# Test OpenAI configuration
curl http://localhost:3000/api/openai-config/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Generate AI mappings for a channel
curl -X POST http://localhost:3000/api/channels/CHANNEL_ID/ai-mappings/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sampleData": {
      "src_ip": "192.168.1.100",
      "alert": "Threat detected"
    }
  }'
```

## Rollback Plan

If you need to rollback:

### Using Prisma Migrate

```bash
cd backend

# Check migration history
npx prisma migrate status

# Rollback to previous migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### Manual Rollback

If automated rollback fails, you can manually drop the new tables and columns:

```sql
-- Drop new tables
DROP TABLE IF EXISTS "openai_config";
DROP TABLE IF EXISTS "ai_generated_mappings";

-- Remove new columns from security_events
ALTER TABLE "security_events" 
  DROP COLUMN IF EXISTS "threatName",
  DROP COLUMN IF EXISTS "threatLevel",
  DROP COLUMN IF EXISTS "sourceIp",
  DROP COLUMN IF EXISTS "destinationIp",
  DROP COLUMN IF EXISTS "sourcePort",
  DROP COLUMN IF EXISTS "destinationPort",
  DROP COLUMN IF EXISTS "sourceChannel",
  DROP COLUMN IF EXISTS "rawData";

-- Remove aiGenerated from field_mappings
ALTER TABLE "field_mappings"
  DROP COLUMN IF EXISTS "aiGenerated";
```

## Performance Considerations

### Indexes

New indexes have been added for:
- `threatLevel` - For filtering by threat severity
- `sourceIp` - For source-based queries
- `destinationIp` - For destination-based queries

These indexes will be created automatically during migration but may take time on large datasets.

### Data Retention

The automatic cleanup runs daily and deletes events older than 7 days. This will:
- Reduce database size
- Improve query performance
- Keep the platform lightweight

Monitor the first cleanup to estimate disk space recovery.

## Troubleshooting

### Migration Fails

If migration fails:

1. Check database connection
2. Ensure user has CREATE TABLE permissions
3. Check for conflicting table names
4. Review error logs

### Prisma Client Out of Sync

If you see "Prisma Client is not in sync" errors:

```bash
npx prisma generate
```

### Data Retention Issues

If cleanup doesn't run:

1. Check server logs for errors
2. Verify database DELETE permissions
3. Check if service initialized properly

### OpenAI Integration Issues

If AI mapping fails:

1. Verify OpenAI configuration is enabled
2. Check API key validity
3. Test connection: `GET /api/openai-config/test`
4. Review API rate limits

## Support

For issues or questions:
1. Check the main [README.md](./README.md)
2. Review [AI_MAPPING_GUIDE.md](./AI_MAPPING_GUIDE.md)
3. Open an issue on GitHub
