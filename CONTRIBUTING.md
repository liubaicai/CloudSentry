# Contributing to CloudSentry

Thank you for your interest in contributing to CloudSentry! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CloudSentry.git
   cd CloudSentry
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```
4. Set up the database:
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:seed
   ```

## Project Structure

```
CloudSentry/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Helper functions
│   └── prisma/             # Database schema
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── contexts/       # React contexts
└── docker-compose.yml      # Docker setup
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types when possible
- Use interfaces for data structures
- Follow existing code style

### Backend

- Follow REST API conventions
- Use async/await for asynchronous operations
- Add proper error handling
- Log important operations
- Add JSDoc comments for public functions

### Frontend

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow Ant Design guidelines for UI

## Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test them:
   ```bash
   # Backend
   cd backend
   npm run build
   npm run dev
   
   # Frontend
   cd frontend
   npm run build
   npm run dev
   ```

3. Commit your changes:
   ```bash
   git commit -m "Description of your changes"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure all builds pass
- Update documentation if needed
- Add tests for new features

## Adding New Features

### Backend API Endpoint

1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Register route in `backend/src/index.ts`
4. Update API documentation

### Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation item in `frontend/src/components/MainLayout.tsx`
4. Create service in `frontend/src/services/` if needed

## Database Changes

When modifying the database schema:

1. Update `backend/prisma/schema.prisma`
2. Create migration:
   ```bash
   cd backend
   npm run prisma:migrate
   ```
3. Update seed script if needed

## Testing

Currently, the project focuses on manual testing:

1. Start both backend and frontend
2. Test API endpoints with curl or Postman
3. Test UI features in the browser
4. Verify database changes

Future contributions for automated testing are welcome!

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Questions?

Feel free to open an issue for questions or discussions about contributing.

## License

By contributing to CloudSentry, you agree that your contributions will be licensed under the MIT License.
