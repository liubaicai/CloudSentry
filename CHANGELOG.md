# Changelog

All notable changes to CloudSentry will be documented in this file.

## [1.1.0] - 2024-01-12

### Added

#### New Modules (Complete System Management Suite)

1. **Threat Details Module (威胁详情)**
   - Dedicated page for viewing individual security event details
   - Edit event status and assignment directly from detail view
   - View complete metadata and raw logs
   - Delete individual events
   - Navigate between threat list and detail view

2. **User Management Module (用户管理)**
   - Complete CRUD operations for user accounts
   - List all users with pagination
   - Create new users with role assignment
   - Edit existing users (username, email, password, role)
   - Delete users with self-deletion protection
   - Admin-only access control
   - Password hashing with bcrypt

3. **Network Configuration Module (网络配置)**
   - Network interface management
   - IP address configuration
   - Gateway and netmask settings
   - DNS server management
   - Enable/disable network configurations
   - Admin-only access control

4. **Operations Configuration Module (运营配置)**
   - Category-based configuration management
   - Support for: retention, backup, maintenance, performance
   - JSON-based flexible configuration values
   - Filter configurations by category
   - Enable/disable individual configurations
   - Admin-only access control

5. **Security Configuration Module (安全配置)**
   - Security policy management
   - Support for: authentication, encryption, access_control, password_policy
   - JSON-based flexible configuration values
   - Filter configurations by category
   - Enable/disable individual configurations
   - Admin-only access control

6. **Data Management Module (数据管理)**
   - Database statistics dashboard
   - Delete old events (data retention)
   - Export events to JSON
   - Database backup functionality (placeholder)
   - Database maintenance (VACUUM ANALYZE)
   - Event count by date range
   - Admin-only access control

#### Backend Enhancements

- Added 5 new controllers: usersController, networkController, operationsController, securityController, dataManagementController
- Added 5 new route files: users.ts, network.ts, operations.ts, securityConfig.ts, dataManagement.ts
- Extended Prisma schema with 3 new tables: NetworkConfig, OperationsConfig, SecurityConfig
- Enhanced auth middleware with `authenticateToken` alias and `requireAdmin` helper
- Created SQL migration file for new tables
- Added comprehensive error handling for all new endpoints

#### Frontend Enhancements

- Added 6 new pages: ThreatDetailPage, UserManagementPage, NetworkConfigPage, OperationsConfigPage, SecurityConfigPage, DataManagementPage
- Created 2 new service files: usersService.ts, configService.ts
- Updated MainLayout with hierarchical menu structure
- Added System Management submenu with 4 configuration options
- Enhanced ThreatListPage with View and Quick View actions
- Added navigation icons from Ant Design icons library

#### Database Schema

New tables added:
- `network_config`: Network interface configurations
- `operations_config`: Operational policies and settings
- `security_config`: Security policies and parameters

#### Documentation

- Created NEW_MODULES.md: Comprehensive documentation of all new modules
- Created SETUP_NEW_MODULES.md: Quick start guide with examples
- Updated README.md with new features list
- Added API examples for all new endpoints
- Included configuration examples for operations and security modules

### Changed

- Navigation menu restructured with submenu for System Management
- Updated feature list in README
- Enhanced authentication middleware for better reusability

### Technical Details

- Total new files: 23
- Total new API endpoints: 26
- New database tables: 3
- Lines of code added: ~10,000+
- All modules follow existing code patterns
- Consistent error handling and logging
- Type-safe implementations with TypeScript

### Security

- All new modules require authentication
- User Management, Configuration, and Data Management require admin role
- Self-deletion protection in User Management
- Password updates use bcrypt hashing
- JSON configuration values properly validated

## [1.0.0] - 2024-01-12

### Added

#### Backend
- Express.js API server with TypeScript
- PostgreSQL database with Prisma ORM
- JWT-based authentication system
- RESTful API endpoints for security event management
- Syslog ingestion API (single and bulk)
- Dashboard statistics API
- Alert forwarding rules management
- System settings management
- Winston logging
- CORS support
- Error handling middleware

#### Frontend
- React 18 with TypeScript
- Vite build system
- Ant Design UI components
- User authentication flow
- Dashboard page with charts and statistics
- Threat list page with filtering and pagination
- Alert forwarding management page
- System settings page
- Analysis page (extensible)
- Responsive layout with sidebar navigation
- Protected routes

#### Database Schema
- Users table with role-based access
- Security events table with comprehensive fields
- Alert forwarding rules table
- System settings table
- Proper indexes for performance

#### Documentation
- Comprehensive README with setup instructions
- API examples and usage guide
- Contributing guidelines
- Docker support with docker-compose
- Setup script for easy installation

#### Development Tools
- TypeScript configuration for both frontend and backend
- ESLint for code quality
- Prisma for database migrations
- Database seed script with sample data

### Features

1. **User Management**
   - Registration and login
   - JWT token authentication
   - Role-based access control (admin/user)

2. **Security Event Management**
   - Receive events via syslog API
   - Store events with metadata
   - Filter and search events
   - Update event status
   - Assign events to users
   - Tag events

3. **Dashboard & Analytics**
   - Overview statistics
   - Severity distribution charts
   - Category distribution charts
   - Recent events list
   - Time-based filtering

4. **Alert Forwarding**
   - Create forwarding rules
   - Support for webhooks, email, and syslog
   - Condition-based filtering
   - Enable/disable rules

5. **System Configuration**
   - Configurable settings
   - Data retention policies
   - Alert notifications

### Technical Highlights
- Modern TypeScript stack
- Type-safe API and frontend
- Production-ready Docker setup
- Scalable architecture
- Security best practices

## [Unreleased]

### Planned Features
- Email notification system
- Advanced threat intelligence integration
- Machine learning-based anomaly detection
- Multi-tenancy support
- Real-time event streaming
- Automated response actions
- Integration with SIEM systems
- Mobile application
- Advanced reporting
- Audit logging
