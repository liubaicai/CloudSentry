# CloudSentry API Examples

This document provides example API calls for testing CloudSentry.

## Setup

First, start the backend server:
```bash
cd backend
npm run dev
```

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Save the token from the response for authenticated requests.

## Syslog Ingestion

### Send a single security event

```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-12T10:30:00Z",
    "severity": "critical",
    "category": "intrusion",
    "source": "192.168.1.100",
    "destination": "192.168.1.200",
    "message": "SSH brute force attack detected",
    "protocol": "TCP",
    "port": 22,
    "tags": ["ssh", "brute-force"]
  }'
```

### Send multiple events (bulk)

```bash
curl -X POST http://localhost:3000/api/syslog/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "severity": "high",
      "category": "malware",
      "source": "192.168.1.105",
      "message": "Malware detected: Trojan.Generic"
    },
    {
      "severity": "medium",
      "category": "policy_violation",
      "source": "192.168.1.110",
      "message": "Unauthorized access attempt"
    }
  ]'
```

## Events Management

### List events (authenticated)

```bash
# Replace YOUR_TOKEN with the JWT token from login
curl -X GET "http://localhost:3000/api/events?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter events by severity

```bash
curl -X GET "http://localhost:3000/api/events?severity=critical&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get a specific event

```bash
# Replace EVENT_ID with an actual event ID
curl -X GET "http://localhost:3000/api/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update event status

```bash
curl -X PATCH "http://localhost:3000/api/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "investigating",
    "assignedTo": "admin"
  }'
```

### Delete an event

```bash
curl -X DELETE "http://localhost:3000/api/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Dashboard

### Get dashboard statistics

```bash
curl -X GET "http://localhost:3000/api/dashboard/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get time series data

```bash
curl -X GET "http://localhost:3000/api/dashboard/timeseries?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Alert Forwarding Rules

### List all rules

```bash
curl -X GET "http://localhost:3000/api/alert-forwarding" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create a new rule (admin only)

```bash
curl -X POST "http://localhost:3000/api/alert-forwarding" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Critical Alerts to Webhook",
    "description": "Forward critical events to external webhook",
    "enabled": true,
    "type": "webhook",
    "destination": "https://webhook.site/your-webhook-id",
    "conditions": {
      "severity": ["critical", "high"]
    }
  }'
```

### Update a rule

```bash
curl -X PATCH "http://localhost:3000/api/alert-forwarding/RULE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

### Delete a rule

```bash
curl -X DELETE "http://localhost:3000/api/alert-forwarding/RULE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## System Settings

### Get all settings (admin only)

```bash
curl -X GET "http://localhost:3000/api/settings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a setting

```bash
curl -X POST "http://localhost:3000/api/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "retention_days",
    "value": 90
  }'
```

## Testing with Python

Here's a Python script to send test events:

```python
import requests
import json
from datetime import datetime

API_URL = "http://localhost:3000/api"

# Send a test event
def send_event():
    event = {
        "timestamp": datetime.now().isoformat(),
        "severity": "critical",
        "category": "intrusion",
        "source": "192.168.1.100",
        "message": "Test security event from Python script",
        "tags": ["test", "python"]
    }
    
    response = requests.post(
        f"{API_URL}/syslog",
        json=event
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    send_event()
```

## Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-12T10:30:00.000Z"
}
```
