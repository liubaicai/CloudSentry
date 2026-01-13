# CloudSentry

CloudSentry is a modern Security Event Management Platform built with TypeScript. It provides a comprehensive solution for receiving, storing, analyzing, and managing security alerts and events from syslog sources.

## Features

- 🔐 **User Authentication**: JWT-based authentication system with role-based access control
- 📊 **Dashboard**: Real-time statistics and visualizations of security events
- 🚨 **Threat Management**: Advanced filtering and analysis of security events with enhanced threat fields
- 🔍 **Threat Details**: Detailed view and management of individual security events
- 👥 **User Management**: Complete user account management with role-based access
- 📈 **Aggregated Analysis**: Pattern detection and trend analysis (extensible)
- 🌐 **Channel Management**: Track and manage syslog sources with auto-discovery
- 🔄 **Field Mapping**: Intelligent mapping of syslog fields to database schema with transformations
- 🤖 **AI-Powered Mapping**: Automatic field mapping generation using OpenAI-compatible APIs ✨ NEW
- ⏰ **Data Retention**: Automatic cleanup of old data with configurable retention policy (7 days default) ✨ NEW
- 📤 **Alert Forwarding**: Configure rules to forward alerts to external systems (webhook, email, syslog)
- ⚙️ **System Settings**: Configurable system parameters
- 🌐 **Network Configuration**: Network interface and connectivity settings management
- 🔧 **Operations Configuration**: Operational policies including retention, backup, and maintenance
- 🔒 **Security Configuration**: Security policies and authentication settings
- 💾 **Data Management**: Database statistics, export, backup, and maintenance tools
- 🔌 **Syslog API**: RESTful API endpoint for receiving security events in bulk or individually

## Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - Modern ORM
- **JWT** - Authentication
- **Winston** - Logging
- **OpenAI SDK** - AI-powered field mapping ✨ NEW

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Build tool
- **Ant Design** - UI component library
- **React Router** - Routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Caddy** - Reverse proxy and web server ✨ NEW (replaces nginx)

## Project Structure

```
CloudSentry/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript types
│   └── package.json
└── docker-compose.yml      # Docker setup
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/liubaicai/CloudSentry.git
   cd CloudSentry
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run database migrations
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start Development Servers**
   
   Terminal 1 - Backend:
   ```bash
   npm run dev:backend
   ```
   
   Terminal 2 - Frontend:
   ```bash
   npm run dev:frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/health

### Using Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend on port 5173

## API Documentation

### Authentication

**Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

### Syslog Ingestion

**Single Event**
```bash
POST /api/syslog
Content-Type: application/json

{
  "timestamp": "2024-01-12T10:30:00Z",
  "severity": "critical",
  "category": "intrusion",
  "source": "192.168.1.100",
  "destination": "192.168.1.200",
  "message": "Suspicious activity detected",
  "protocol": "TCP",
  "port": 22,
  "tags": ["ssh", "brute-force"]
}
```

**Bulk Events**
```bash
POST /api/syslog/bulk
Content-Type: application/json

[
  {
    "severity": "high",
    "category": "malware",
    "source": "192.168.1.105",
    "message": "Malware detected"
  },
  {
    "severity": "medium",
    "category": "policy_violation",
    "source": "192.168.1.110",
    "message": "Policy violation detected"
  }
]
```

### Events Management

**List Events**
```bash
GET /api/events?page=1&limit=20&severity=critical&status=new
Authorization: Bearer <token>
```

**Update Event Status**
```bash
PATCH /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "assignedTo": "admin"
}
```

### Dashboard

**Get Statistics**
```bash
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Get Time Series Data**
```bash
GET /api/dashboard/timeseries?days=7
Authorization: Bearer <token>
```

## Default Credentials

After first setup, you'll need to register an admin user via the API or registration page.

For testing, you can use:
- Username: `admin`
- Password: `admin123`
- Email: `admin@cloudsentry.local`

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cloudsentry?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=/api
```

## Development

### Database Migrations

```bash
cd backend
npm run prisma:migrate      # Create and apply migrations
npm run prisma:generate     # Generate Prisma Client
npm run prisma:studio       # Open Prisma Studio
```

### Build for Production

```bash
npm run build               # Build both frontend and backend
npm run build:backend       # Build backend only
npm run build:frontend      # Build frontend only
```

## Security Considerations

- Change default JWT secret in production
- Use strong passwords
- Enable HTTPS in production
- Configure proper CORS origins
- Implement rate limiting for API endpoints
- Regular security audits and updates
- Use environment variables for sensitive data

## Channel Management & Field Mapping

CloudSentry includes advanced syslog channel management and intelligent field mapping capabilities:

### Channel Management
- **Auto-discovery**: Automatically create channels when receiving syslog from new sources
- **Event Tracking**: Monitor event counts and last event time per channel
- **Custom Naming**: Assign meaningful names to discovered channels
- **Channel Control**: Enable/disable specific channels

### Field Mapping
- **Smart Mapping**: Map incoming syslog fields to database schema
- **Transformation Types**: Direct copy, regex extraction, lookup tables
- **Priority-based**: Control mapping order with priorities
- **Channel-Specific**: Apply different mappings per channel or globally

For detailed documentation, see [CHANNEL_MANAGEMENT.md](./CHANNEL_MANAGEMENT.md)

## 🤖 AI-Powered Field Mapping (NEW)

CloudSentry now includes intelligent field mapping generation using OpenAI-compatible APIs:

### Key Features
- **Automatic Mapping Generation**: AI analyzes sample data and generates appropriate field mappings
- **Smart Reuse**: System checks for compatible existing mappings before generating new ones
- **Learning System**: Mappings are stored and reused for similar data structures
- **OpenAI Compatible**: Works with OpenAI API or compatible services (Azure OpenAI, local models, etc.)

### Enhanced Threat Data Model
Security events now include comprehensive threat tracking fields:
- `threatName` - Name/identifier of the threat
- `threatLevel` - Threat severity level
- `sourceIp`, `destinationIp` - Enhanced network information
- `sourcePort`, `destinationPort` - Port information
- `sourceChannel` - Channel identifier
- `rawData` - Complete original data

### Quick Start with AI Mapping

1. Configure OpenAI API:
```bash
POST /api/openai-config
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-3.5-turbo"
}
```

2. Generate mappings for a channel:
```bash
POST /api/channels/:id/ai-mappings/generate
{
  "sampleData": {
    "src_ip": "192.168.1.100",
    "alert_level": "3",
    "message": "Threat detected"
  }
}
```

3. Apply the generated mappings:
```bash
POST /api/channels/:id/ai-mappings/apply
{
  "mappings": [...generated mappings...]
}
```

For complete documentation, see [AI_MAPPING_GUIDE.md](./AI_MAPPING_GUIDE.md)

## ⏰ Data Retention Policy (NEW)

CloudSentry implements a lightweight data retention strategy for optimal performance:

### Features
- **7-Day Default Retention**: Keeps platform lightweight and performant
- **Automatic Cleanup**: Runs daily to remove old data
- **Configurable**: Retention period can be adjusted via the service
- **PostgreSQL Optimized**: Efficient deletion and space reclamation

### Why 7 Days?
- **Performance**: Smaller dataset = faster queries
- **Lightweight**: Suitable for edge deployments
- **Adequate**: Sufficient for real-time threat monitoring
- **Archivable**: Export older data if long-term storage is needed

The combination of PostgreSQL with a 7-day retention window can handle:
- Up to 10,000 events/minute on modest hardware
- ~6 million events total
- Sub-second query responses

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.