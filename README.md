# CloudSentry

CloudSentry is a modern Security Event Management Platform built with TypeScript. It provides a comprehensive solution for receiving, storing, analyzing, and managing security alerts and events from syslog sources.

## Features

- 🔐 **User Authentication**: JWT-based authentication system with role-based access control
- 📊 **Dashboard**: Real-time statistics and visualizations of security events
- 🚨 **Threat List**: Advanced filtering and management of security events
- 📈 **Aggregated Analysis**: Pattern detection and trend analysis (extensible)
- 📤 **Alert Forwarding**: Configure rules to forward alerts to external systems (webhook, email, syslog)
- ⚙️ **System Settings**: Configurable system parameters
- 🔌 **Syslog API**: RESTful API endpoint for receiving security events in bulk or individually

## Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - Modern ORM
- **JWT** - Authentication
- **Winston** - Logging

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Build tool
- **Ant Design** - UI component library
- **React Router** - Routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.