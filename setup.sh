#!/bin/bash

# CloudSentry Setup Script
echo "========================================="
echo "  CloudSentry Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠ Warning: PostgreSQL is not installed. You'll need it for the database."
    echo "  You can use Docker to run PostgreSQL:"
    echo "  docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cloudsentry postgres:16-alpine"
    echo ""
fi

# Install root dependencies
echo ""
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo ""
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "✓ Created backend/.env (please update with your database credentials)"
else
    echo "✓ Backend .env file already exists"
fi

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install

cd ..

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run database migrations:"
echo "   cd backend && npm run prisma:migrate"
echo "3. (Optional) Seed the database with sample data:"
echo "   cd backend && npm run prisma:seed"
echo "4. Start the backend:"
echo "   npm run dev:backend"
echo "5. In another terminal, start the frontend:"
echo "   npm run dev:frontend"
echo ""
echo "Or use Docker:"
echo "   docker-compose up -d"
echo ""
echo "Access the application at http://localhost:5173"
echo ""
