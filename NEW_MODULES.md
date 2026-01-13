# New Modules Documentation

This document describes the new modules added to CloudSentry to complete the required functionality.

## Overview

The following modules have been added to CloudSentry:

1. **Threat Details (威胁详情)** - Detailed view for individual security events
2. **User Management (用户管理)** - Complete CRUD operations for user accounts
3. **Network Configuration (网络配置)** - Network interface and settings management
4. **Operations Configuration (运营配置)** - Operational settings and policies
5. **Security Configuration (安全配置)** - Security policies and parameters
6. **Data Management (数据管理)** - Database statistics, export, backup, and maintenance

## Module Details

### 1. Threat Details (威胁详情)

**Frontend:**
- Path: `/threats/:id`
- Component: `ThreatDetailPage.tsx`
- Features:
  - View complete event details
  - Edit event status and assignment
  - Delete events
  - View raw logs and metadata
  - Navigate back to threat list

**Backend:**
- Endpoint: `GET /api/events/:id` (existing)
- Uses existing events controller

### 2. User Management (用户管理)

**Frontend:**
- Path: `/users`
- Component: `UserManagementPage.tsx`
- Service: `usersService.ts`
- Features:
  - List all users with pagination
  - Create new users
  - Edit existing users
  - Delete users (with protection against self-deletion)
  - Role management (admin/user)
  - Password change support

**Backend:**
- Base Path: `/api/users`
- Controller: `usersController.ts`
- Routes: `users.ts`
- Endpoints:
  - `GET /api/users` - List users with filters
  - `GET /api/users/:id` - Get user by ID
  - `POST /api/users` - Create new user
  - `PATCH /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
- Security: All routes require admin role

### 3. Network Configuration (网络配置)

**Frontend:**
- Path: `/network`
- Component: `NetworkConfigPage.tsx`
- Features:
  - List network configurations
  - Create/Edit/Delete network configs
  - Configure: interface, IP address, netmask, gateway, DNS servers
  - Enable/disable configurations

**Backend:**
- Base Path: `/api/network`
- Controller: `networkController.ts`
- Routes: `network.ts`
- Database: `network_config` table
- Endpoints:
  - `GET /api/network` - List all network configurations
  - `GET /api/network/:id` - Get configuration by ID
  - `POST /api/network` - Create configuration
  - `PATCH /api/network/:id` - Update configuration
  - `DELETE /api/network/:id` - Delete configuration
- Security: All routes require admin role

**Database Schema:**
```prisma
model NetworkConfig {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  interface   String?
  ipAddress   String?
  netmask     String?
  gateway     String?
  dnsServers  String[] @default([])
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 4. Operations Configuration (运营配置)

**Frontend:**
- Path: `/operations`
- Component: `OperationsConfigPage.tsx`
- Features:
  - Category-based configuration (retention, backup, maintenance, performance)
  - Create/Edit/Delete configurations
  - JSON value support
  - Filter by category

**Backend:**
- Base Path: `/api/operations`
- Controller: `operationsController.ts`
- Routes: `operations.ts`
- Database: `operations_config` table
- Endpoints:
  - `GET /api/operations` - List configurations (with optional category filter)
  - `GET /api/operations/:id` - Get configuration by ID
  - `POST /api/operations` - Create configuration
  - `PATCH /api/operations/:id` - Update configuration
  - `DELETE /api/operations/:id` - Delete configuration
- Security: All routes require admin role

**Database Schema:**
```prisma
model OperationsConfig {
  id          String   @id @default(uuid())
  category    String
  key         String
  value       Json
  description String?
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([category, key])
}
```

**Example Configurations:**
- Retention policy: `{"days": 90, "autoDelete": true}`
- Backup schedule: `{"frequency": "daily", "time": "02:00", "location": "/backups"}`
- Maintenance window: `{"day": "sunday", "startTime": "02:00", "duration": 2}`

### 5. Security Configuration (安全配置)

**Frontend:**
- Path: `/security`
- Component: `SecurityConfigPage.tsx`
- Features:
  - Category-based configuration (authentication, encryption, access_control, password_policy)
  - Create/Edit/Delete configurations
  - JSON value support
  - Filter by category

**Backend:**
- Base Path: `/api/security-config`
- Controller: `securityController.ts`
- Routes: `securityConfig.ts`
- Database: `security_config` table
- Endpoints:
  - `GET /api/security-config` - List configurations (with optional category filter)
  - `GET /api/security-config/:id` - Get configuration by ID
  - `POST /api/security-config` - Create configuration
  - `PATCH /api/security-config/:id` - Update configuration
  - `DELETE /api/security-config/:id` - Delete configuration
- Security: All routes require admin role

**Database Schema:**
```prisma
model SecurityConfig {
  id          String   @id @default(uuid())
  category    String
  key         String
  value       Json
  description String?
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([category, key])
}
```

**Example Configurations:**
- Password policy: `{"minLength": 8, "requireSpecialChar": true, "requireNumber": true}`
- Session timeout: `{"minutes": 30, "extendOnActivity": true}`
- MFA settings: `{"enabled": true, "methods": ["totp", "sms"]}`

### 6. Data Management (数据管理)

**Frontend:**
- Path: `/data-management`
- Component: `DataManagementPage.tsx`
- Features:
  - View database statistics
  - Delete old events (data retention)
  - Export events to JSON
  - Create database backup
  - Run database maintenance

**Backend:**
- Base Path: `/api/data-management`
- Controller: `dataManagementController.ts`
- Routes: `dataManagement.ts`
- Endpoints:
  - `GET /api/data-management/stats` - Get database statistics
  - `POST /api/data-management/delete-old-events` - Delete events older than specified days
  - `GET /api/data-management/export` - Export events as JSON
  - `GET /api/data-management/count` - Count events in date range
  - `POST /api/data-management/backup` - Create database backup (placeholder)
  - `POST /api/data-management/maintenance` - Run VACUUM ANALYZE
- Security: All routes require admin role

**Statistics Provided:**
- Total events count
- Total users count
- Total alert rules count
- Total system settings count
- Oldest and newest event timestamps

## Navigation Structure

The main navigation menu has been updated with the following structure:

```
├── Dashboard (仪表盘)
├── Threat List (威胁列表)
├── Analysis (分析)
├── Alert Forwarding (告警外发)
├── User Management (用户管理)
├── System Management (系统管理)
│   ├── System Settings (系统设置)
│   ├── Network Config (网络配置)
│   ├── Operations Config (运营配置)
│   └── Security Config (安全配置)
└── Data Management (数据管理)
```

## Database Migration

To apply the new database schema changes, run the following migration:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Or manually apply the migration SQL file:
```bash
psql -U postgres -d cloudsentry -f prisma/migrations/add_config_tables.sql
```

## Security Considerations

- All new endpoints require authentication
- User Management, Network, Operations, Security, and Data Management modules require admin role
- Users cannot delete their own account
- Password changes are properly hashed with bcrypt
- All configuration values are stored as JSON for flexibility

## Frontend Service Layer

A new `configService.ts` has been added to handle all configuration-related API calls:

```typescript
configService.network.*      // Network configuration operations
configService.operations.*   // Operations configuration operations
configService.security.*     // Security configuration operations
configService.dataManagement.* // Data management operations
```

## Testing

To test the new modules:

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Login with an admin account
4. Navigate to each new module through the sidebar menu
5. Test CRUD operations in each module

## API Examples

### User Management

Create a new user:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Network Configuration

Create network configuration:
```bash
curl -X POST http://localhost:3000/api/network \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "eth0",
    "interface": "eth0",
    "ipAddress": "192.168.1.100",
    "netmask": "255.255.255.0",
    "gateway": "192.168.1.1",
    "dnsServers": ["8.8.8.8", "8.8.4.4"],
    "enabled": true
  }'
```

### Data Management

Delete old events:
```bash
curl -X POST http://localhost:3000/api/data-management/delete-old-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 90}'
```

Export events:
```bash
curl -X GET "http://localhost:3000/api/data-management/export?limit=1000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o events-export.json
```

## Summary

All required modules have been implemented with full CRUD functionality, proper authentication and authorization, and comprehensive user interfaces. The system now provides complete management capabilities for:

- Security events and threat analysis
- User accounts and access control
- Network infrastructure
- Operational policies
- Security policies
- Data lifecycle management

The implementation follows the existing codebase patterns and maintains consistency with the established architecture.
