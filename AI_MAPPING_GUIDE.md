# AI-Powered Field Mapping and Enhanced Threat Data

This document describes the new AI-powered field mapping feature and enhanced threat data fields in CloudSentry.

## Overview

CloudSentry now includes:
1. **Enhanced Threat Data Model** - Additional fields for comprehensive threat tracking
2. **AI-Powered Field Mapping** - Intelligent field mapping generation using OpenAI-compatible APIs
3. **Data Retention Policy** - Automatic cleanup of data older than 7 days
4. **Caddy Integration** - Replaced nginx with Caddy for improved configuration

## Enhanced Threat Data Fields

The `SecurityEvent` model has been enhanced with the following fields:

### New Fields
- `threatName` - Name/identifier of the threat or alert
- `threatLevel` - Threat severity level (critical, high, medium, low, info)
- `sourceIp` - Source IP address (enhanced field)
- `destinationIp` - Destination IP address (enhanced field)
- `sourcePort` - Source port number
- `destinationPort` - Destination port number
- `sourceChannel` - Source channel identifier
- `rawData` - Raw original data (alias for rawLog)

### Backward Compatibility
Legacy fields (`source`, `destination`, `port`, `rawLog`) are maintained for backward compatibility.

## OpenAI Configuration

### Setup

1. Navigate to the OpenAI Configuration page in the admin panel
2. Configure the following settings:
   - **Base URL**: OpenAI API endpoint (default: `https://api.openai.com/v1`)
   - **API Key**: Your OpenAI API key
   - **Model**: Model to use (default: `gpt-3.5-turbo`)
   - **Description**: Optional description

### API Endpoints

#### Get Active Configuration
```
GET /api/openai-config/active
```

#### List All Configurations
```
GET /api/openai-config/
```

#### Create Configuration
```
POST /api/openai-config/
Content-Type: application/json

{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-3.5-turbo",
  "enabled": true,
  "description": "Production OpenAI Config"
}
```

#### Update Configuration
```
PUT /api/openai-config/:id
Content-Type: application/json

{
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4",
  "enabled": true
}
```

#### Test Connection
```
GET /api/openai-config/test
```

## AI-Powered Field Mapping

### How It Works

1. **New Channel Detection**: When a new syslog source is detected, the system can generate field mappings automatically
2. **Compatibility Check**: Before generating new mappings, the system checks if existing mappings are compatible
3. **AI Generation**: If no compatible mapping exists, OpenAI generates appropriate field mappings based on sample data
4. **Mapping Storage**: Generated mappings are stored for reuse with similar data structures

### API Endpoints

#### Generate AI Mappings for a Channel
```
POST /api/channels/:id/ai-mappings/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "sampleData": {
    "src_ip": "192.168.1.100",
    "dst_ip": "10.0.0.50",
    "alert_level": "3",
    "alert_name": "Suspicious Activity",
    "timestamp": "2024-01-12T10:30:00Z"
  }
}
```

Response:
```json
{
  "message": "AI field mappings generated successfully",
  "mappings": [
    {
      "sourceField": "src_ip",
      "targetField": "sourceIp",
      "transformType": "direct",
      "description": "Map source IP directly"
    },
    {
      "sourceField": "alert_level",
      "targetField": "severity",
      "transformType": "lookup",
      "transformConfig": {
        "mappings": {
          "1": "low",
          "2": "medium",
          "3": "high",
          "4": "critical"
        }
      },
      "description": "Map numeric alert level to severity"
    }
  ],
  "isNew": true
}
```

#### Apply AI-Generated Mappings
```
POST /api/channels/:id/ai-mappings/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "mappings": [
    {
      "sourceField": "src_ip",
      "targetField": "sourceIp",
      "transformType": "direct",
      "description": "Map source IP directly"
    }
  ]
}
```

### Target Fields

The AI can map to the following target fields in the SecurityEvent model:

- `threatName` - Name of the threat
- `threatLevel` - Threat severity level
- `severity` - Event severity
- `category` - Event category
- `sourceIp` - Source IP address
- `destinationIp` - Destination IP address
- `sourcePort` - Source port
- `destinationPort` - Destination port
- `protocol` - Network protocol
- `message` - Event message
- `tags` - Array of tags
- `metadata` - Additional structured data

### Transform Types

1. **direct** - Direct copy of value
2. **regex** - Extract value using regex pattern
3. **lookup** - Map value using lookup table
4. **script** - Custom transformation (future)

## Data Retention

### Overview

CloudSentry implements a lightweight data retention policy to keep the platform performant:

- **Default Retention**: 7 days
- **Automatic Cleanup**: Runs daily at midnight
- **Configurable**: Can be adjusted via the data retention service

### Benefits

- **Performance**: Smaller database size improves query performance
- **Lightweight**: Suitable for resource-constrained environments
- **PostgreSQL Optimized**: Works efficiently with PostgreSQL's MVCC model

### Monitoring

Check data retention statistics:
```javascript
// In backend code
import { dataRetentionService } from './services/dataRetentionService';

const stats = await dataRetentionService.getStorageStats();
console.log(stats);
// {
//   totalEvents: 50000,
//   withinRetentionPolicy: 45000,
//   toBeDeleted: 5000,
//   retentionDays: 7,
//   oldestEventDate: "2024-01-05T10:30:00Z",
//   newestEventDate: "2024-01-12T10:30:00Z"
// }
```

### Manual Cleanup

```javascript
// Trigger manual cleanup
await dataRetentionService.cleanupOldEvents();
```

### Adjust Retention Period

```javascript
// Set retention to 14 days
dataRetentionService.setRetentionDays(14);
```

## Caddy Configuration

### Overview

Caddy has replaced nginx as the reverse proxy for the frontend, providing:

- **Automatic HTTPS**: Built-in Let's Encrypt support
- **Simpler Configuration**: More intuitive Caddyfile syntax
- **Better Performance**: HTTP/2 and HTTP/3 support out of the box

### Configuration

The Caddyfile is located at `frontend/Caddyfile`:

```caddyfile
:80 {
    root * /usr/share/caddy
    file_server
    try_files {path} /index.html
    
    handle /api/* {
        reverse_proxy backend:3000
    }
    
    encode gzip
    
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }
}
```

### Docker Integration

The frontend Dockerfile now uses Caddy:

```dockerfile
FROM caddy:2-alpine

COPY --from=builder /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
```

## Database Migration

After pulling these changes, run the following commands to update your database:

```bash
cd backend
npx prisma migrate dev --name add_enhanced_threat_fields
npx prisma generate
```

Or for production:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Example Usage

### Sending Enhanced Threat Data

```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "threatName": "SQL Injection Attempt",
    "threatLevel": "high",
    "sourceIp": "192.168.1.100",
    "destinationIp": "10.0.0.50",
    "sourcePort": 54321,
    "destinationPort": 3306,
    "protocol": "TCP",
    "category": "intrusion",
    "message": "Detected SQL injection pattern in request",
    "timestamp": "2024-01-12T10:30:00Z"
  }'
```

### Using AI to Generate Mappings

1. Receive data from a new source
2. Call the AI mapping generation endpoint with sample data
3. Review the suggested mappings
4. Apply the mappings to the channel
5. Future data from the same source will be automatically mapped

## Performance Considerations

### PostgreSQL for 7-Day Retention

PostgreSQL is well-suited for the 7-day retention model:

- **MVCC Model**: Efficient handling of deletions
- **VACUUM**: Automatic space reclamation
- **Indexes**: Fast queries even with millions of events
- **Partitioning**: Can be added for even better performance (optional)

### Lightweight Alternatives

If you need even lighter weight storage, consider:

1. **TimescaleDB**: PostgreSQL extension optimized for time-series data
2. **SQLite**: For very small deployments (single user)
3. **DuckDB**: For analytical workloads with less frequent writes

However, PostgreSQL with 7-day retention should handle:
- **Up to 10,000 events/minute** on modest hardware
- **~6 million events** total (at 7-day retention with 10k events/min)
- **Sub-second query response** with proper indexing

## Security Best Practices

1. **Protect OpenAI API Keys**: Store them securely, use environment variables in production
2. **Rate Limiting**: The AI endpoints are protected by rate limiting
3. **Authentication**: All AI configuration endpoints require authentication
4. **API Key Masking**: API keys are masked in responses (only showing first 8 characters)

## Troubleshooting

### OpenAI Service Not Available

Check:
1. Is there an enabled OpenAI configuration?
2. Is the API key valid?
3. Is the base URL correct?
4. Test the connection using `/api/openai-config/test`

### Field Mappings Not Working

Check:
1. Are the mappings enabled?
2. Is the channel ID correct?
3. Are the source field names matching the incoming data?
4. Check logs for transformation errors

### Data Retention Not Working

Check:
1. Is the backend service running?
2. Check logs for cleanup job execution
3. Verify database permissions for DELETE operations

## Future Enhancements

- [ ] Support for custom AI prompts
- [ ] Machine learning for mapping pattern recognition
- [ ] Advanced transformation functions
- [ ] Real-time mapping validation
- [ ] Mapping version control
- [ ] A/B testing for different mappings
