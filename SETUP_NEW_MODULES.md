# Quick Start Guide for New Modules

This guide provides step-by-step instructions to get started with the newly added modules in CloudSentry.

## Prerequisites

- CloudSentry backend and frontend are installed and running
- PostgreSQL database is set up
- You have admin user credentials

## Setup Instructions

### 1. Apply Database Migrations

First, apply the database migrations to add the new tables:

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Apply migrations (if using Prisma Migrate)
npm run prisma:migrate

# OR manually apply the SQL migration
psql -U postgres -d cloudsentry -f prisma/migrations/add_config_tables.sql
```

### 2. Start the Servers

Start both backend and frontend servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Login as Admin

Navigate to http://localhost:5173 and login with admin credentials:
- Username: `admin`
- Password: `admin123`

(Update these credentials after first login for security)

## Using the New Modules

### Threat Details (威胁详情)

1. Navigate to **Threat List** from the sidebar
2. Click **View** button on any event to see detailed information
3. On the detail page, you can:
   - View all event metadata
   - Edit status and assignment
   - View raw logs
   - Delete the event

### User Management (用户管理)

1. Click **User Management** in the sidebar
2. View all users in the system
3. **Add User**: Click "Add User" button
   - Enter username, email, password
   - Select role (user/admin)
4. **Edit User**: Click "Edit" on any user
   - Update username, email, or password
   - Change role
5. **Delete User**: Click "Delete" (cannot delete yourself)

### Network Configuration (网络配置)

1. Navigate to **System Management > Network Config**
2. **Add Configuration**: Click "Add Configuration"
   - Name: Give it a unique name (e.g., "eth0")
   - Interface: Network interface name
   - IP Address: Static IP address
   - Netmask: Network mask
   - Gateway: Default gateway
   - DNS Servers: Add multiple DNS servers
   - Enable/disable the configuration
3. **Edit/Delete**: Use the action buttons

**Example Configuration:**
```
Name: Primary Network
Interface: eth0
IP Address: 192.168.1.100
Netmask: 255.255.255.0
Gateway: 192.168.1.1
DNS Servers: 8.8.8.8, 8.8.4.4
Enabled: Yes
```

### Operations Configuration (运营配置)

1. Navigate to **System Management > Operations Config**
2. Filter by category: Retention, Backup, Maintenance, Performance
3. **Add Configuration**: Click "Add Configuration"
   - Category: Select from dropdown
   - Key: Configuration key name
   - Value: JSON object with configuration
   - Description: Optional description
   - Enabled: Toggle on/off

**Example Configurations:**

**Data Retention:**
```json
Category: retention
Key: event_retention_days
Value: {"days": 90, "autoDelete": true}
Description: Automatically delete events older than 90 days
```

**Backup Schedule:**
```json
Category: backup
Key: daily_backup
Value: {"frequency": "daily", "time": "02:00", "location": "/backups"}
Description: Daily backup at 2 AM
```

**Maintenance Window:**
```json
Category: maintenance
Key: weekly_maintenance
Value: {"day": "sunday", "startTime": "02:00", "duration": 2}
Description: Weekly maintenance on Sunday at 2 AM for 2 hours
```

### Security Configuration (安全配置)

1. Navigate to **System Management > Security Config**
2. Filter by category: Authentication, Encryption, Access Control, Password Policy
3. **Add Configuration**: Similar to Operations Config

**Example Configurations:**

**Password Policy:**
```json
Category: password_policy
Key: requirements
Value: {
  "minLength": 8,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumber": true,
  "requireSpecialChar": true
}
Description: Strong password requirements
```

**Session Timeout:**
```json
Category: authentication
Key: session_timeout
Value: {"minutes": 30, "extendOnActivity": true}
Description: Session expires after 30 minutes of inactivity
```

**MFA Settings:**
```json
Category: authentication
Key: mfa_config
Value: {"enabled": true, "methods": ["totp", "sms"], "required_for_admin": true}
Description: Multi-factor authentication settings
```

### Data Management (数据管理)

1. Navigate to **Data Management** from the sidebar
2. View database statistics:
   - Total events, users, alert rules
   - Oldest and newest event timestamps

**Operations:**

**Delete Old Events:**
1. Click "Delete Old Events" button
2. Enter number of days (e.g., 90)
3. Confirm deletion
4. Events older than specified days will be permanently deleted

**Export Events:**
1. Click "Export Events" button
2. Optionally select date range
3. Set maximum number of events
4. Click OK to download JSON file

**Create Backup:**
1. Click "Create Backup" button
2. Confirm action
3. Note: This is a placeholder - actual backup implementation requires pg_dump configuration

**Run Maintenance:**
1. Click "Run Maintenance" button
2. Confirm action
3. Runs VACUUM ANALYZE to optimize database

## Tips and Best Practices

### User Management
- Create separate admin and user accounts for different access levels
- Regularly review user accounts and remove inactive users
- Use strong passwords (minimum 8 characters with mix of uppercase, lowercase, numbers, special characters)

### Network Configuration
- Document all network configurations
- Test configurations in a test environment first
- Keep backup configurations disabled until ready to use

### Operations Configuration
- Start with conservative retention policies (e.g., 90 days)
- Schedule backups during low-traffic hours
- Set up maintenance windows during planned downtime

### Security Configuration
- Enforce strong password policies
- Enable MFA for admin accounts
- Regularly review and update security settings
- Document all security configuration changes

### Data Management
- Schedule regular data retention cleanup
- Export critical events before deletion
- Run database maintenance during low-traffic periods
- Monitor database size and performance

## API Usage Examples

### Create User via API

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "analyst1",
    "email": "analyst1@company.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

### Get Network Configurations

```bash
curl -X GET http://localhost:3000/api/network \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Old Events

```bash
curl -X POST http://localhost:3000/api/data-management/delete-old-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 90}'
```

### Export Events

```bash
curl -X GET "http://localhost:3000/api/data-management/export?limit=1000&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o events-export.json
```

## Troubleshooting

### Database Migration Issues
If you encounter migration errors:
```bash
# Check database connection
cd backend
psql $DATABASE_URL

# Manually verify tables
\dt

# If needed, drop and recreate tables
DROP TABLE IF EXISTS network_config, operations_config, security_config;
# Then re-run migration
```

### Authentication Issues
If you can't access admin-only pages:
- Verify you're logged in as admin
- Check JWT token hasn't expired (7 days by default)
- Clear browser cache and login again

### API Errors
- Check backend logs for detailed error messages
- Verify database is running and accessible
- Ensure all required fields are provided in requests

## Next Steps

1. **Customize Configurations**: Set up network, operations, and security configurations for your environment
2. **Create Users**: Add team members with appropriate roles
3. **Set Up Policies**: Configure data retention and backup schedules
4. **Monitor Events**: Use the threat details page to investigate security events
5. **Regular Maintenance**: Schedule regular data cleanup and database maintenance

For more detailed information, see [NEW_MODULES.md](NEW_MODULES.md).

## Support

For issues or questions:
- Check the [API Examples](API_EXAMPLES.md)
- Review the [Contributing Guidelines](CONTRIBUTING.md)
- Open an issue on GitHub
