# CloudSentry System Architecture

## Module Overview

```
CloudSentry Security Event Management Platform
├── 登录 (Login) ✅
│   ├── JWT Authentication
│   ├── Role-based Access Control
│   └── Session Management
│
├── 仪表盘 (Dashboard) ✅
│   ├── Real-time Statistics
│   ├── Severity Distribution
│   ├── Category Distribution
│   └── Time Series Charts
│
├── 威胁列表 (Threat List) ✅
│   ├── Advanced Filtering
│   ├── Search Functionality
│   ├── Status Management
│   └── Pagination
│
├── 威胁详情 (Threat Details) ✅ NEW
│   ├── Complete Event Information
│   ├── Edit Status & Assignment
│   ├── Raw Log Viewer
│   └── Metadata Display
│
├── 告警外发 (Alert Forwarding) ✅
│   ├── Webhook Integration
│   ├── Email Notifications
│   ├── Syslog Forwarding
│   └── Rule-based Conditions
│
├── 用户管理 (User Management) ✅ NEW
│   ├── User CRUD Operations
│   ├── Role Assignment
│   ├── Password Management
│   └── Admin-only Access
│
├── 系统管理 (System Management) ✅ ENHANCED
│   ├── 系统设置 (System Settings) ✅
│   │   ├── Key-Value Configuration
│   │   └── System Parameters
│   │
│   ├── 网络配置 (Network Config) ✅ NEW
│   │   ├── Interface Management
│   │   ├── IP Configuration
│   │   ├── DNS Settings
│   │   └── Gateway Configuration
│   │
│   ├── 运营配置 (Operations Config) ✅ NEW
│   │   ├── Retention Policies
│   │   ├── Backup Schedules
│   │   ├── Maintenance Windows
│   │   └── Performance Settings
│   │
│   └── 安全配置 (Security Config) ✅ NEW
│       ├── Authentication Policies
│       ├── Password Requirements
│       ├── Session Management
│       └── Access Control Rules
│
├── 数据管理 (Data Management) ✅ NEW
│   ├── Database Statistics
│   ├── Data Retention
│   ├── Event Export
│   ├── Backup Management
│   └── Database Maintenance
│
└── syslog接收 (Syslog Reception) ✅
    ├── Single Event API
    ├── Bulk Event API
    └── Flexible Event Schema
```

## Technology Stack

### Backend
```
Node.js + TypeScript
├── Express.js (Web Framework)
├── Prisma (ORM)
├── PostgreSQL (Database)
├── JWT (Authentication)
├── bcrypt (Password Hashing)
└── Winston (Logging)
```

### Frontend
```
React 18 + TypeScript
├── Vite (Build Tool)
├── Ant Design (UI Components)
├── React Router (Routing)
├── Recharts (Visualization)
└── Axios (HTTP Client)
```

## Database Schema

```
PostgreSQL Database
├── users (User Accounts)
│   ├── id, username, email, password
│   ├── role (admin/user)
│   └── timestamps
│
├── security_events (Security Events)
│   ├── id, timestamp, severity, category
│   ├── source, destination, message
│   ├── status, assignedTo, tags
│   └── metadata, rawLog
│
├── alert_forwarding_rules (Alert Rules)
│   ├── id, name, description
│   ├── enabled, conditions
│   └── destination, type
│
├── system_settings (Settings)
│   ├── id, key, value
│   └── timestamps
│
├── network_config (Network) ✅ NEW
│   ├── id, name, description
│   ├── interface, ipAddress
│   ├── netmask, gateway
│   ├── dnsServers, enabled
│   └── timestamps
│
├── operations_config (Operations) ✅ NEW
│   ├── id, category, key
│   ├── value (JSON), description
│   ├── enabled
│   └── timestamps
│
└── security_config (Security) ✅ NEW
    ├── id, category, key
    ├── value (JSON), description
    ├── enabled
    └── timestamps
```

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Security Events
```
GET    /api/events
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id
```

### Syslog
```
POST   /api/syslog
POST   /api/syslog/bulk
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/timeseries
```

### Alert Forwarding
```
GET    /api/alert-forwarding
POST   /api/alert-forwarding
PATCH  /api/alert-forwarding/:id
DELETE /api/alert-forwarding/:id
```

### Settings
```
GET    /api/settings
POST   /api/settings
DELETE /api/settings/:key
```

### User Management ✅ NEW
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Network Configuration ✅ NEW
```
GET    /api/network
GET    /api/network/:id
POST   /api/network
PATCH  /api/network/:id
DELETE /api/network/:id
```

### Operations Configuration ✅ NEW
```
GET    /api/operations
GET    /api/operations/:id
POST   /api/operations
PATCH  /api/operations/:id
DELETE /api/operations/:id
```

### Security Configuration ✅ NEW
```
GET    /api/security-config
GET    /api/security-config/:id
POST   /api/security-config
PATCH  /api/security-config/:id
DELETE /api/security-config/:id
```

### Data Management ✅ NEW
```
GET    /api/data-management/stats
POST   /api/data-management/delete-old-events
GET    /api/data-management/export
GET    /api/data-management/count
POST   /api/data-management/backup
POST   /api/data-management/maintenance
```

## Frontend Routes

```
/                           Dashboard Page
/login                      Login Page
/threats                    Threat List Page
/threats/:id                Threat Detail Page ✅ NEW
/analysis                   Analysis Page
/alert-forwarding          Alert Forwarding Page
/settings                   System Settings Page
/users                      User Management Page ✅ NEW
/network                    Network Config Page ✅ NEW
/operations                 Operations Config Page ✅ NEW
/security                   Security Config Page ✅ NEW
/data-management           Data Management Page ✅ NEW
```

## Access Control Matrix

```
Module                    | User | Admin
--------------------------|------|-------
Login                     |  ✓   |   ✓
Dashboard                 |  ✓   |   ✓
Threat List               |  ✓   |   ✓
Threat Details            |  ✓   |   ✓
Analysis                  |  ✓   |   ✓
Alert Forwarding          |  ✓   |   ✓
System Settings           |      |   ✓
User Management          |      |   ✓
Network Configuration    |      |   ✓
Operations Configuration |      |   ✓
Security Configuration   |      |   ✓
Data Management          |      |   ✓
```

## Security Features

```
Authentication & Authorization
├── JWT Token-based Authentication
├── Role-based Access Control (RBAC)
├── Password Hashing (bcrypt)
├── Session Management
└── Self-deletion Protection

API Security
├── CORS Protection
├── Rate Limiting
├── Input Validation
├── Error Handling
└── SQL Injection Prevention (Prisma)

Data Security
├── Encrypted Password Storage
├── Secure Configuration Storage
├── Audit Logging
└── Access Control Enforcement
```

## Performance Features

```
Database Optimization
├── Indexed Queries
├── Pagination Support
├── VACUUM ANALYZE Maintenance
└── Efficient Query Patterns

Frontend Optimization
├── Code Splitting
├── Lazy Loading
├── Vite Build Optimization
└── Component Reusability

API Optimization
├── Efficient Data Serialization
├── Bulk Operations Support
├── Query Filtering
└── Caching Ready
```

## Deployment Options

```
Development
├── npm run dev:backend
└── npm run dev:frontend

Production
├── Docker Compose
├── Manual Build & Deploy
└── CI/CD Pipeline Ready

Docker Services
├── PostgreSQL Database
├── Backend API (Node.js)
└── Frontend (Nginx)
```

## Monitoring & Maintenance

```
Logging
├── Winston Logger
├── HTTP Request Logging
├── Error Logging
└── Application Logging

Database Maintenance
├── VACUUM ANALYZE
├── Data Retention Policies
├── Backup Management
└── Performance Monitoring

Data Management
├── Statistics Dashboard
├── Event Export
├── Old Data Cleanup
└── Backup Creation
```

## Integration Points

```
External Systems
├── Syslog Sources → Event Ingestion
├── Webhook Destinations → Alert Forwarding
├── Email Servers → Alert Notifications
├── Syslog Destinations → Alert Forwarding
└── Backup Storage → Database Backups
```

## Future Enhancements

```
Planned Features
├── Real-time Event Streaming (WebSockets)
├── Machine Learning Threat Detection
├── Advanced Reporting System
├── Multi-tenancy Support
├── Mobile Application
├── SIEM Integration
├── Automated Response Actions
└── Advanced Analytics Dashboard
```
