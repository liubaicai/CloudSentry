# AGENTS.md — CloudSentry

This repository is a Node/TypeScript monorepo using npm workspaces:
- `backend/`: Express + Prisma + PostgreSQL
- `frontend/`: React + Vite + Ant Design

There is **no test framework configured** (no `test` scripts / `__tests__` / `*.test.*` found).
There are **no Cursor / Copilot instruction files** found (`.cursor/rules`, `.cursorrules`, `.github/copilot-instructions.md`).

---

## Quick commands (copy/paste)

### Install
From repo root:
```bash
npm run install:all
```

### Run (dev)
From repo root:
```bash
npm run dev:backend
npm run dev:frontend
```
Or per workspace:
```bash
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

### Build
From repo root (build both):
```bash
npm run build
```
Backend-only:
```bash
npm run build --workspace=backend
```
Frontend-only:
```bash
npm run build --workspace=frontend
```

### Lint / Typecheck
Frontend lint (only lint configured):
```bash
npm run lint --workspace=frontend
```
Frontend typecheck (is baked into `frontend/build` via `tsc`):
```bash
npm run build --workspace=frontend
```
Backend typecheck/build:
```bash
npm run build --workspace=backend
```

### Tests
No tests configured.

**If you add tests later**, prefer a single-test command that works with watch/filters, e.g.
- Vitest: `vitest run path/to/file.test.ts -t "test name"`
- Jest: `jest path/to/file.test.ts -t "test name"`

### Database (Prisma)
Run these from `backend/` (or `--workspace=backend`):
```bash
npm run prisma:migrate
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
```

### Docker
From repo root:
```bash
docker-compose up -d
```
Services:
- `postgres` on `5432`
- `backend` on `3000`
- `frontend` on `5173` (container serves on 80)

---

## Repository norms (follow existing patterns)

### TypeScript settings
- Backend: `backend/tsconfig.json` uses `strict: true`, `target: ES2022`, `module: commonjs`, outputs to `dist/`.
- Frontend: `frontend/tsconfig.json` uses `strict: true`, `module: ESNext`, `moduleResolution: bundler`, `noEmit: true`.

Do not silence type errors with `any` / `as any` / `@ts-ignore`.
Note: there is at least one existing usage of `any` in backend controllers (e.g. `getCurrentUser(req: any, ...)`).

### Formatting
No Prettier / Biome config found. Match the local style:
- 2-space indentation
- semicolons are used in backend and most TS files
- single quotes commonly used in backend imports/strings

When touching a file, keep formatting consistent with that file.

### Imports
Observed pattern:
1. External deps (e.g. `express`, `bcrypt`, `axios`, `winston`)
2. Internal relative imports (e.g. `../utils/logger`)

Avoid introducing absolute path aliases unless the repo already uses them.

### Naming conventions
- Variables/functions: `camelCase`
- React components: `PascalCase` and file names `SomethingPage.tsx` / `MainLayout.tsx`.
- Prisma models: `PascalCase` in schema; DB tables mapped via `@@map`.

### Backend architecture (Express)
- Entry point: `backend/src/index.ts`
- Routes under `backend/src/routes/*` mounted under `/api/*`
- Controllers under `backend/src/controllers/*`
- Services under `backend/src/services/*`
- Shared helpers under `backend/src/utils/*`
- Middleware under `backend/src/middleware/*` (e.g. `auth`, `rateLimiter`, `errorHandler`)

Prefer:
- Controller = request/response shape, validation, mapping to service calls
- Service = business logic
- Utils = pure helpers

### Error handling (backend)
Current patterns:
- Controllers often handle errors with `try/catch` and `res.status(...).json({ error: '...' })`.
- Global error middleware: `backend/src/middleware/errorHandler.ts` logs via `logger.error` and returns JSON.

Guidelines:
- Return consistent JSON errors: `{ error: string }` and include status codes.
- Use early returns after sending a response.
- Prefer throwing in services and mapping to HTTP responses in controllers.
- Do not swallow errors silently.

### Logging
Backend uses Winston (`backend/src/utils/logger.ts`).
- Use `logger.info(...)` for request-level / lifecycle logs.
- Use `logger.error(...)` when catching unexpected failures.
Avoid `console.log` except in scripts (e.g. Prisma seed) where it already exists.

### API clients (frontend)
- Axios instance: `frontend/src/services/api.ts`
- Auth handling:
  - Request interceptor attaches `Authorization: Bearer <token>` from `localStorage`.
  - 401 response interceptor clears token and hard redirects to `/login`.

When adding new API calls:
- Put request logic in `frontend/src/services/*Service.ts`.
- Keep components/pages mostly orchestration + rendering.
- Reuse existing `api` instance rather than creating new axios clients.

### Security & secrets
- Do not commit real credentials.
- `.env` files are expected (see README); treat them as local-only.
- Be careful updating authentication (JWT) and CORS; keep defaults consistent:
  - backend default `CORS_ORIGIN` is `http://localhost:5173`

---

## “Good agent” operating rules for this repo

1. Make the smallest change that solves the task (avoid opportunistic refactors).
2. Keep backend changes in `backend/` and frontend changes in `frontend/`.
3. After edits, run the most relevant command:
   - Backend TS compile: `npm run build --workspace=backend`
   - Frontend lint: `npm run lint --workspace=frontend`
   - Frontend build/typecheck: `npm run build --workspace=frontend`
4. If you introduce tests, add a `test` script and document the single-test invocation here.
