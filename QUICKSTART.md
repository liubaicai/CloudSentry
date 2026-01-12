# CloudSentry - Quick Reference

## Quick Start

```bash
# Using setup script
./setup.sh

# Configure database
cd backend && cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run prisma:migrate
npm run prisma:seed

# Start development
cd .. && npm run dev:backend     # Terminal 1
npm run dev:frontend             # Terminal 2
```

## Using Docker

```bash
docker-compose up -d
```

Access: http://localhost:5173

## Common Commands

### Backend
```bash
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Frontend
```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Default Ports

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- PostgreSQL: `5432`

## API Endpoints

### Public
- `POST /api/syslog` - Receive single event
- `POST /api/syslog/bulk` - Receive bulk events
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Protected (requires Bearer token)
- `GET /api/events` - List events
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/alert-forwarding` - List rules
- `GET /api/settings` - System settings

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/cloudsentry"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

## First Time Setup

1. Register an admin user:
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

2. Send a test event:
```bash
curl -X POST http://localhost:3000/api/syslog \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "critical",
    "category": "test",
    "source": "test-system",
    "message": "Test security event"
  }'
```

3. Login to UI at http://localhost:5173

## Troubleshooting

### Database connection failed
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env
- Ensure database exists

### Frontend can't connect to backend
- Check backend is running on port 3000
- Verify CORS_ORIGIN in backend/.env
- Check browser console for errors

### Build errors
- Run `npm install` in both backend and frontend
- Check Node.js version (requires 18+)
- Clear node_modules and reinstall

## Project Structure

```
CloudSentry/
├── backend/           # API Server
│   ├── prisma/       # Database schema
│   └── src/          # Source code
├── frontend/         # React App
│   └── src/          # Source code
├── docker-compose.yml
└── README.md
```

## Technologies

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Ant Design
- **Auth**: JWT
- **Database**: PostgreSQL

## Resources

- [Full README](README.md)
- [API Examples](API_EXAMPLES.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
