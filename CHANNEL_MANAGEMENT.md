# Syslog Channel Management & Field Mapping

## Overview

CloudSentry now includes advanced syslog channel management and intelligent field mapping capabilities. These features enable:

1. **Automatic Channel Discovery**: Automatically track and organize syslog sources
2. **Smart Field Mapping**: Intelligently map incoming syslog fields to the database schema
3. **Flexible Transformations**: Support for direct mapping, regex extraction, and lookup tables
4. **Channel-Specific Configurations**: Apply different mapping rules per channel or globally

## Features

### Channel Management

**Channels** represent individual syslog sources identified by their source IP or hostname. CloudSentry automatically creates channels when it receives syslog data from a new source.

#### Key Features:
- **Auto-discovery**: Channels are automatically created on first syslog receipt
- **Event Tracking**: Track the number of events and last event time per channel
- **Enable/Disable**: Control which channels are active
- **Custom Naming**: Assign meaningful names to auto-discovered channels
- **Metadata Storage**: Store additional channel-specific information

#### API Endpoints

```bash
# List all channels
GET /api/channels?page=1&limit=20&search=firewall

# Get channel details
GET /api/channels/:id

# Create channel manually
POST /api/channels
{
  "name": "Firewall Server",
  "sourceIdentifier": "192.168.1.100",
  "description": "Main firewall appliance",
  "enabled": true
}

# Update channel
PATCH /api/channels/:id
{
  "name": "Updated Name",
  "description": "Updated description"
}

# Delete channel
DELETE /api/channels/:id

# Get channel statistics
GET /api/channels/stats
```

### Field Mapping

**Field Mappings** define how fields from incoming syslog data should be mapped to the SecurityEvent table in the database.

#### Mapping Types

1. **Direct Mapping**: Copy the value directly from source to target
2. **Regex Transform**: Extract data using regular expressions
3. **Lookup Table**: Map values using a predefined lookup table
4. **Script** (Future): Custom transformation logic

#### API Endpoints

```bash
# List field mappings
GET /api/field-mappings?channelId=<channel-id>

# Get mapping details
GET /api/field-mappings/:id

# Create field mapping
POST /api/field-mappings
{
  "channelId": "optional-channel-id",  # null for global mapping
  "sourceField": "log_level",
  "targetField": "severity",
  "transformType": "lookup",
  "transformConfig": {
    "mappings": {
      "0": "critical",
      "1": "high",
      "2": "medium",
      "3": "low",
      "4": "info"
    }
  },
  "priority": 10,
  "enabled": true,
  "description": "Map numeric log levels to severity"
}

# Update field mapping
PATCH /api/field-mappings/:id

# Delete field mapping
DELETE /api/field-mappings/:id
```

#### Transform Configuration Examples

**Direct Mapping**:
```json
{
  "sourceField": "source_ip",
  "targetField": "source",
  "transformType": "direct"
}
```

**Regex Transform**:
```json
{
  "sourceField": "message",
  "targetField": "category",
  "transformType": "regex",
  "transformConfig": {
    "pattern": "\\[(\\w+)\\]",
    "flags": "i",
    "replacement": "$1"
  }
}
```

**Lookup Table**:
```json
{
  "sourceField": "event_type",
  "targetField": "category",
  "transformType": "lookup",
  "transformConfig": {
    "mappings": {
      "auth_fail": "intrusion",
      "malware_detected": "malware",
      "policy_violation": "policy_violation"
    }
  }
}
```

### Target Fields

The following fields in the SecurityEvent table can be mapped:

- `severity`: Event severity (critical, high, medium, low, info)
- `category`: Event category (malware, intrusion, policy_violation, etc.)
- `source`: Source IP or hostname
- `destination`: Destination IP or hostname
- `message`: Event message
- `protocol`: Network protocol
- `port`: Port number
- `tags`: Array of tags
- `metadata`: Additional structured data (JSON)

## How It Works

### Syslog Processing Flow

1. **Receive Syslog**: CloudSentry receives syslog data via POST to `/api/syslog`
2. **Identify Channel**: Extract source identifier (IP/hostname) from the data or request
3. **Create/Find Channel**: Auto-create channel if it doesn't exist, or find existing one
4. **Apply Mappings**: Apply field mappings in priority order (channel-specific first, then global)
5. **Transform Data**: Transform fields according to mapping rules
6. **Store Event**: Create SecurityEvent with transformed data
7. **Update Channel**: Increment event count and update last event time

### Mapping Priority

Field mappings are applied in the following order:

1. **Higher Priority First**: Mappings with higher priority values are applied first
2. **Channel-Specific**: Channel-specific mappings take precedence over global mappings
3. **First Match**: Once a target field is mapped, subsequent mappings for that field are ignored

### Example Scenario

**Raw Syslog Data**:
```json
{
  "host": "192.168.1.100",
  "level": "2",
  "event_type": "auth_fail",
  "src": "10.0.0.50",
  "dst": "192.168.1.200",
  "msg": "Failed login attempt"
}
```

**Field Mappings**:
1. `level` → `severity` (lookup: "2" → "medium")
2. `event_type` → `category` (lookup: "auth_fail" → "intrusion")
3. `src` → `source` (direct)
4. `dst` → `destination` (direct)
5. `msg` → `message` (direct)

**Resulting SecurityEvent**:
```json
{
  "severity": "medium",
  "category": "intrusion",
  "source": "10.0.0.50",
  "destination": "192.168.1.200",
  "message": "Failed login attempt",
  "channelId": "<channel-uuid>",
  "rawLog": "{...original data...}"
}
```

## UI Features

### Channel Management Page

Navigate to: **Integration → Channel Management**

Features:
- View all channels with statistics
- Search and filter channels
- Edit channel names and descriptions
- Enable/disable channels
- View event counts and last event time
- Delete unused channels

### Field Mapping Configuration Page

Navigate to: **Integration → Field Mapping**

Features:
- Create and manage field mappings
- Filter by channel
- Configure transformation rules
- Set mapping priorities
- Test transformations
- Enable/disable mappings

### Reorganized Menu Structure

The menu has been reorganized to group related features:

```
Dashboard
Threat Management
  ├── Threat List
  └── Threat Analysis
Integration
  ├── Channel Management (NEW)
  ├── Field Mapping (NEW)
  └── Alert Forwarding
User Management
System Management
  ├── System Settings
  ├── Network Config
  ├── Operations Config
  ├── Security Config
  └── Data Management
```

## Best Practices

### Channel Management

1. **Review Auto-Created Channels**: Periodically review and rename auto-created channels with meaningful names
2. **Disable Inactive Channels**: Disable channels that are no longer sending data
3. **Document Sources**: Use the description field to document the purpose and details of each channel
4. **Monitor Event Counts**: Track event counts to identify high-volume sources

### Field Mapping

1. **Start with Global Mappings**: Create global mappings for common field patterns
2. **Use Channel-Specific Overrides**: Create channel-specific mappings only when needed
3. **Set Appropriate Priorities**: Use priority to control the order of mapping application
4. **Test Transformations**: Test regex and lookup mappings with sample data
5. **Document Complex Mappings**: Use descriptions to explain complex transformation logic
6. **Avoid Redundant Mappings**: Don't create multiple mappings for the same source→target pair

### Transformation Configuration

1. **Regex Patterns**:
   - Test patterns thoroughly before deployment
   - Use non-greedy quantifiers when appropriate
   - Document complex patterns in the description

2. **Lookup Tables**:
   - Keep lookup tables up to date
   - Handle unmapped values gracefully
   - Document the source of lookup values

3. **Priority Management**:
   - Use priority 0 for default/fallback mappings
   - Use higher priorities (10, 20, etc.) for specific overrides
   - Leave gaps between priority values for future insertions

## Migration Guide

If you have an existing CloudSentry installation:

1. **Backup Database**: Always backup your database before migration
2. **Run Migration**: Execute the migration SQL file:
   ```bash
   psql -U postgres -d cloudsentry -f backend/prisma/migrations/add_syslog_channels_and_field_mappings.sql
   ```
3. **Regenerate Prisma Client**: 
   ```bash
   cd backend
   npm run prisma:generate
   ```
4. **Rebuild Application**:
   ```bash
   npm run build
   ```
5. **Create Initial Mappings**: Create field mappings for your existing syslog sources

## Troubleshooting

### Channels Not Being Created

- Check that the syslog data includes a source identifier
- Verify the syslog API endpoint is accessible
- Check backend logs for errors

### Mappings Not Applied

- Verify mappings are enabled
- Check mapping priorities
- Ensure source fields exist in incoming data
- Review backend logs for transformation errors

### Incorrect Transformations

- Test regex patterns with online regex testers
- Verify lookup table keys match source values exactly
- Check for case sensitivity in lookups
- Review the transformConfig JSON syntax

## Security Considerations

1. **Input Validation**: All incoming syslog data is validated and sanitized
2. **SQL Injection Protection**: Prisma ORM provides automatic SQL injection protection
3. **Script Transformation**: Script-based transformations are not yet implemented for security reasons
4. **Access Control**: Channel and field mapping management requires authentication
5. **Audit Logging**: All channel and mapping changes are logged

## Future Enhancements

- Advanced transformation types (date parsing, string manipulation)
- Bulk import/export of field mappings
- Mapping templates for common syslog formats
- Visual field mapping designer
- Transformation testing sandbox
- Machine learning-based field detection
- Channel grouping and organization
- Advanced analytics per channel
