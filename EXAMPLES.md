# CloudSentry Usage Examples

This document provides practical examples for using CloudSentry's new features.

## Basic Threat Event Submission

### Example 1: Simple Threat Alert

```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "threatName": "Brute Force Attack",
    "threatLevel": "high",
    "sourceIp": "203.0.113.45",
    "destinationIp": "192.168.1.10",
    "sourcePort": 54321,
    "destinationPort": 22,
    "protocol": "TCP",
    "category": "intrusion",
    "severity": "high",
    "message": "Multiple failed SSH login attempts detected",
    "tags": ["ssh", "brute-force", "authentication"],
    "timestamp": "2024-01-13T10:30:00Z"
  }'
```

### Example 2: SQL Injection Attempt

```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "threatName": "SQL Injection",
    "threatLevel": "critical",
    "sourceIp": "198.51.100.23",
    "destinationIp": "192.168.1.50",
    "destinationPort": 3306,
    "protocol": "TCP",
    "category": "intrusion",
    "severity": "critical",
    "message": "SQL injection pattern detected in request: UNION SELECT * FROM users",
    "tags": ["sql-injection", "database", "web-attack"],
    "metadata": {
      "requestPath": "/api/users",
      "userAgent": "Mozilla/5.0",
      "queryString": "id=1' OR '1'='1"
    }
  }'
```

### Example 3: Malware Detection

```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "threatName": "Trojan.Generic.KD.12345",
    "threatLevel": "critical",
    "sourceIp": "192.168.1.101",
    "category": "malware",
    "severity": "critical",
    "message": "Malicious file detected and quarantined",
    "tags": ["malware", "trojan", "quarantine"],
    "metadata": {
      "fileName": "invoice.exe",
      "filePath": "C:\\Users\\john\\Downloads\\invoice.exe",
      "fileHash": "a1b2c3d4e5f6...",
      "action": "quarantined"
    }
  }'
```

## Bulk Event Submission

```bash
curl -X POST http://localhost:3000/api/syslog/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "threatName": "Port Scan",
      "threatLevel": "medium",
      "sourceIp": "198.51.100.1",
      "destinationIp": "192.168.1.1",
      "message": "Port scanning activity detected"
    },
    {
      "threatName": "DDoS Attack",
      "threatLevel": "high",
      "sourceIp": "203.0.113.1",
      "destinationIp": "192.168.1.100",
      "destinationPort": 80,
      "message": "High volume traffic detected"
    },
    {
      "threatName": "Phishing Email",
      "threatLevel": "medium",
      "category": "phishing",
      "message": "Suspicious email blocked"
    }
  ]'
```

## AI-Powered Field Mapping

### Step 1: Configure OpenAI

```bash
# Login first to get JWT token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# Create OpenAI configuration
curl -X POST http://localhost:3000/api/openai-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-your-api-key-here",
    "model": "gpt-3.5-turbo",
    "enabled": true,
    "description": "Production OpenAI configuration"
  }'
```

### Step 2: Create a Channel

```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Firewall Logs",
    "sourceIdentifier": "192.168.1.1",
    "description": "Main firewall syslog source",
    "enabled": true
  }'
```

### Step 3: Generate AI Mappings

```bash
# Assume channel ID is returned as: abc-123-def-456
CHANNEL_ID="abc-123-def-456"

curl -X POST "http://localhost:3000/api/channels/$CHANNEL_ID/ai-mappings/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sampleData": {
      "timestamp": "2024-01-13T10:30:00Z",
      "src": "203.0.113.45",
      "dst": "192.168.1.10",
      "sport": 54321,
      "dport": 22,
      "proto": "TCP",
      "action": "BLOCK",
      "reason": "Suspicious activity"
    }
  }'
```

### Step 4: Apply Generated Mappings

```bash
curl -X POST "http://localhost:3000/api/channels/$CHANNEL_ID/ai-mappings/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "mappings": [
      {
        "sourceField": "src",
        "targetField": "sourceIp",
        "transformType": "direct",
        "description": "Map source IP"
      },
      {
        "sourceField": "dst",
        "targetField": "destinationIp",
        "transformType": "direct",
        "description": "Map destination IP"
      },
      {
        "sourceField": "sport",
        "targetField": "sourcePort",
        "transformType": "direct",
        "description": "Map source port"
      },
      {
        "sourceField": "dport",
        "targetField": "destinationPort",
        "transformType": "direct",
        "description": "Map destination port"
      },
      {
        "sourceField": "proto",
        "targetField": "protocol",
        "transformType": "direct",
        "description": "Map protocol"
      },
      {
        "sourceField": "reason",
        "targetField": "message",
        "transformType": "direct",
        "description": "Map message"
      }
    ]
  }'
```

## Querying Events

### Get Recent Events

```bash
curl "http://localhost:3000/api/events?page=1&limit=20&severity=high" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Threat Level

```bash
curl "http://localhost:3000/api/events?threatLevel=critical" \
  -H "Authorization: Bearer $TOKEN"
```

### Search by IP Address

```bash
curl "http://localhost:3000/api/events?search=192.168.1.100" \
  -H "Authorization: Bearer $TOKEN"
```

### Date Range Query

```bash
curl "http://localhost:3000/api/events?startDate=2024-01-01T00:00:00Z&endDate=2024-01-13T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

## Dashboard Statistics

```bash
# Get overall statistics
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

# Get time series data
curl "http://localhost:3000/api/dashboard/timeseries?days=7" \
  -H "Authorization: Bearer $TOKEN"
```

## Channel Management

### List All Channels

```bash
curl http://localhost:3000/api/channels \
  -H "Authorization: Bearer $TOKEN"
```

### Get Channel Details

```bash
curl "http://localhost:3000/api/channels/$CHANNEL_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Channel

```bash
curl -X PATCH "http://localhost:3000/api/channels/$CHANNEL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Firewall Logs",
    "description": "Primary firewall with enhanced monitoring"
  }'
```

## Field Mapping Management

### List Mappings for a Channel

```bash
curl "http://localhost:3000/api/field-mappings?channelId=$CHANNEL_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Custom Mapping

```bash
curl -X POST http://localhost:3000/api/field-mappings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channelId": "'$CHANNEL_ID'",
    "sourceField": "severity_code",
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
    "description": "Map numeric severity to text",
    "priority": 10,
    "enabled": true
  }'
```

## Python Example

```python
import requests
import json
from datetime import datetime

# Configuration
API_URL = "http://localhost:3000/api"
USERNAME = "admin"
PASSWORD = "admin123"

# Login
response = requests.post(
    f"{API_URL}/auth/login",
    json={"username": USERNAME, "password": PASSWORD}
)
token = response.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# Submit a threat event
threat_event = {
    "threatName": "Suspicious Network Activity",
    "threatLevel": "high",
    "sourceIp": "198.51.100.50",
    "destinationIp": "192.168.1.25",
    "sourcePort": 45678,
    "destinationPort": 445,
    "protocol": "TCP",
    "category": "intrusion",
    "severity": "high",
    "message": "Suspicious SMB traffic detected",
    "tags": ["smb", "network", "intrusion"],
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

response = requests.post(
    f"{API_URL}/syslog",
    json=threat_event,
    headers={"Content-Type": "application/json"}
)

print(f"Event submitted: {response.json()}")

# Query recent high-severity events
response = requests.get(
    f"{API_URL}/events",
    params={"severity": "high", "limit": 10},
    headers=headers
)

events = response.json()["events"]
print(f"Found {len(events)} high-severity events")
for event in events:
    print(f"  - {event['threatName']}: {event['message']}")
```

## Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function main() {
  // Login
  const loginResponse = await axios.post(`${API_URL}/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  
  const token = loginResponse.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  // Submit event
  const threatEvent = {
    threatName: 'DDoS Attack',
    threatLevel: 'critical',
    sourceIp: '203.0.113.100',
    destinationIp: '192.168.1.1',
    destinationPort: 80,
    protocol: 'TCP',
    category: 'dos',
    severity: 'critical',
    message: 'DDoS attack detected - high volume traffic',
    tags: ['ddos', 'network', 'dos'],
    timestamp: new Date().toISOString()
  };

  await axios.post(`${API_URL}/syslog`, threatEvent);
  console.log('Event submitted successfully');

  // Get dashboard stats
  const statsResponse = await axios.get(`${API_URL}/dashboard/stats`, { headers });
  console.log('Dashboard stats:', statsResponse.data);
}

main().catch(console.error);
```

## Integration with SIEM Tools

### Splunk Integration

```python
# Example: Forward events from Splunk to CloudSentry
import requests
import json

def send_to_cloudsentry(event):
    payload = {
        "threatName": event.get("alert_name"),
        "threatLevel": event.get("severity", "info").lower(),
        "sourceIp": event.get("src_ip"),
        "destinationIp": event.get("dest_ip"),
        "sourcePort": event.get("src_port"),
        "destinationPort": event.get("dest_port"),
        "protocol": event.get("protocol"),
        "category": event.get("category", "unknown"),
        "severity": event.get("severity", "info").lower(),
        "message": event.get("message"),
        "tags": event.get("tags", []),
        "metadata": event
    }
    
    response = requests.post(
        "http://cloudsentry:3000/api/syslog",
        json=payload
    )
    
    return response.status_code == 201
```

## Monitoring and Alerting

### Check System Health

```bash
curl http://localhost:3000/health
```

### Monitor Data Retention

```bash
# In your monitoring script
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.storageStats'
```

## Best Practices

1. **Use Bulk API for High Volume**: Submit events in batches for better performance
2. **Set Appropriate Threat Levels**: Use consistent severity classification
3. **Include Metadata**: Store additional context in the metadata field
4. **Use Tags Effectively**: Tag events for easier filtering and analysis
5. **Monitor AI Mapping Success**: Review generated mappings before applying
6. **Regular Backups**: Export critical events before the 7-day retention expires
7. **Rotate API Keys**: Regularly update OpenAI API keys
8. **Monitor Channel Health**: Check lastEventAt to detect inactive sources

## Troubleshooting

### Event Not Appearing

Check:
- Is the channel enabled?
- Are field mappings correct?
- Check backend logs for errors
- Verify authentication token

### AI Mapping Fails

- Test OpenAI connection: `/api/openai-config/test`
- Check API key validity
- Verify API rate limits
- Review sample data format

### Performance Issues

- Check database size (should be < 7 days of data)
- Verify indexes are created
- Monitor query performance
- Consider increasing retention if needed
