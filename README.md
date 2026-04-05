# Finance System (Backend + Frontend)

This repository contains a role-based finance system:

- **Backend:** Express + MongoDB API
- **Frontend:** React + Vite app

---


## Project structure

```text
backend/
  src/
    config/        # env, db, logger, swagger
    constants/     # roles, error codes, enums
    controllers/   # HTTP handlers
    dtos/          # response mapping
    middlewares/   # auth, role, validation, error, response shaping
    models/        # mongoose schemas
    repositories/  # data access
    routes/        # endpoint wiring
    services/      # business logic
    utils/         # pagination, filtering, request context
  tests/           # integration tests

frontend/
  src/
    api/           # fetch client
    components/    # shell, guards, UI pieces
    context/       # auth provider + hooks
    pages/         # login/dashboard/records/users/unauthorized
```

---


## Contents

- [What is implemented](#what-is-implemented)
- [Architecture at a glance](#architecture-at-a-glance)
- [Role model](#role-model)
- [API surface (implemented routes)](#api-surface-implemented-routes)
- [Data model](#data-model)
- [Design decisions and tradeoffs](#design-decisions-and-tradeoffs)
- [Security implementation](#-security-implementation)
- [Error handling and logging](#-error-handling--logging)
- [Testing](#-testing)
- [Environment variables](#-environment-variables)
- [Example: create a record via API](#-example-creating-a-record-via-api)
- [Project structure](#project-structure)
- [Verification notes](#verification-notes)

---

## What is implemented

### Backend

1. **Authentication**
  - `POST /api/v1/auth/register` (bootstrap first admin)
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/bootstrap-status`

2. **Users (admin only)**
  - `GET /api/v1/users`
  - `POST /api/v1/users`
  - `PUT /api/v1/users/:id`
  - `DELETE /api/v1/users/:id` (soft delete)

3. **Records**
  - `GET /api/v1/records` (analyst/admin)
  - `POST /api/v1/records` (admin)
  - `GET /api/v1/records/:id` (analyst/admin)
  - `PUT /api/v1/records/:id` (admin)
  - `DELETE /api/v1/records/:id` (admin, soft delete)
  - filters: `type`, `category`, `date`, `dateFrom`, `dateTo`, `search`, `limit`, `offset`

4. **Dashboard**
  - `GET /api/v1/dashboard/summary`
  - `GET /api/v1/dashboard/trends`

5. **System routes**
  - `GET /health`
  - `GET /api-docs` (Swagger UI)

### Frontend

- Login + session bootstrap via refresh route
- Protected routes by role
- Pages: Dashboard, Records, Users, Unauthorized

---

## Architecture at a glance

Request flow:

`Route -> Middleware -> Controller -> Service -> Repository -> Model`

This separation keeps role checks, validation, business rules, and queries isolated and maintainable.

---

## Role model

| Role | Access |
|------|--------|
| `admin` | users CRUD, records CRUD, dashboard |
| `analyst` | records read, dashboard read |
| `viewer` | dashboard read |

RBAC is enforced in route middleware and data scope checks.

---

## API surface (implemented routes)

All mounted under `/api/v1`.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/bootstrap-status`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Records
- `GET /records`
- `POST /records`
- `GET /records/:id`
- `PUT /records/:id`
- `DELETE /records/:id`

### Dashboard
- `GET /dashboard/summary`
- `GET /dashboard/trends`

---

## Data model

### User
- `email`, `passwordHash`, `role`, `isActive`, `lastLoginAt`, `deletedAt`, timestamps

### Record
- `amount`, `type`, `category`, `date`, `notes`, `createdBy`, `tags`, `metadata`, `deletedAt`, timestamps

### RefreshToken
- `userId`, `tokenHash`, `expiresAt` (TTL), `revokedAt`, `ipAddress`, `userAgent`, timestamps

---

## Design decisions and tradeoffs

### 1) Offset pagination vs cursor pagination

**Current choice:** offset (`limit`, `offset`)

**Why this works here**
- Easy to implement and reason about in table-style UI
- Predictable API contract for admin lists

**Tradeoffs**
- Large offsets get expensive
- Concurrent writes can shift rows between pages

**When cursor is better**
- Very large datasets
- Infinite scrolling or near-real-time streams

### 2) Soft delete vs hard delete

**Current choice:** soft delete (`deletedAt`)

**Why this works here**
- Preserves finance history
- Safer operationally (recoverability)

**Tradeoffs**
- Every active query must filter `deletedAt: null`
- Storage grows unless archival policy is added

### 3) MongoDB vs relational SQL

**Current choice:** MongoDB + Mongoose

**Why this works here**
- Record document fits evolving categories/tags/metadata
- Fast schema iteration with indexes and validation

**Tradeoffs**
- Cross-entity relational workflows can be less direct
- Index strategy matters more as data volume grows

### 4) Repository layer vs direct model access

**Current choice:** repositories in front of models

**Why this works here**
- Centralizes query logic
- Improves testability and future refactoring options

**Tradeoffs**
- Additional abstraction layer
- Slightly more boilerplate

### 5) JWT + refresh token rotation vs server sessions

**Current choice:** JWT access + rotating refresh token

**Why this works here**
- Stateless request auth
- Works cleanly with frontend + API separation

**Tradeoffs**
- Token revocation logic is more involved
- Requires refresh storage and rotation checks

### 6) Redis summary cache vs direct DB every time

**Current choice:** cache summary results when Redis is available

**Why this works here**
- Dashboard summary uses aggregation queries
- Caching reduces repeated heavy reads

**Tradeoffs**
- Invalidation complexity
- Additional infra dependency when enabled

**Implemented behavior**
- Graceful fallback when Redis is unavailable
- Invalidate summary cache on record write operations
- TTL controlled by `DASHBOARD_SUMMARY_CACHE_TTL_SEC` (default `120`)

### 7) Joi runtime validation vs type-only checks

**Current choice:** Joi schemas via middleware

**Why this works here**
- Runtime validation for external API input
- Consistent request contract and errors

**Tradeoffs**
- Schema maintenance overhead
- Potential duplication if a separate static type layer is introduced

### 8) CommonJS vs ESM

**Current choice:** CommonJS (`require/module.exports`)

**Why this works here**
- Consistent with current backend and Jest config

**Tradeoffs**
- Less aligned with modern ESM-first ecosystem

---

## 🔒 Security Implementation

### 1. **Authentication**
- JWT tokens with expiration
- Refresh token rotation
- HttpOnly cookies (prevents XSS access)
- Token hashing in database

### 2. **Authorization**
- Role-based access control (3 layers)
- Resource-level access checks
- Data isolation per user

### 3. **Data Protection**
- Password hashing: bcrypt with 12 salt rounds
- Input sanitization: express-mongo-sanitize, xss-clean
- SQL/NoSQL injection prevention

### 4. **HTTP Security**
- Helmet.js for security headers
- CORS with origin validation
- Rate limiting (100 requests/15 min)
- HTTPS enforced in production

### 5. **Logging & Auditing**
- Correlation IDs for request tracing
- Structured error logging
- User action logging (lastLoginAt)

---

## 📊 Error Handling & Logging

### Error Structure

```json
{
  "success": false,
  "error": {
    "code": 400,
    "errorCode": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "email must be a valid email",
        "type": "string.email"
      }
    ],
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-04-05T10:30:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Auth required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate data |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Unexpected error |

### Logging Levels

```
error   - Application errors, failures
warn    - Warnings, deprecations
info    - General info, successful operations
debug   - Detailed debugging info
```

---

## 🧪 Testing

### Test Coverage

- **Unit Tests:** Service logic, validation
- **Integration Tests:** Full request/response cycles
- **Database Tests:** Using MongoDB Memory Server (no external DB needed)
- **Role Tests:** Access control verification

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### Test Database

- Uses `mongodb-memory-server` for isolated testing
- Each test run gets fresh database
- No test data cleanup needed
- Fast execution (in-memory)

---

## 📖 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | `development` or `production` |
| `PORT` | No | 4000 | Server port |
| `DATABASE_URL` | Yes* | - | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes* | - | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes* | - | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | No | 12 | Password hash cost (higher = slower) |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | 100 | Max requests per window |
| `CORS_ORIGIN` | No | http://localhost:5173 | Frontend origin |
| `ADMIN_SETUP_KEY` | No | - | Key for bootstrap admin registration |
| `LOG_LEVEL` | No | info | Logging level (debug/info/warn/error) |

\* Required in production. Test mode uses in-memory DB.

---

## 📝 Example: Creating a Record via API

```bash
# 1. Login to get access token
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'

# Response includes accessToken

# 2. Create record
curl -X POST http://localhost:4000/api/v1/records \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01",
    "notes": "Monthly salary"
  }'

# 3. Get dashboard summary
curl -X GET "http://localhost:4000/api/v1/dashboard/summary?dateFrom=2026-01-01" \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🤔 Assumptions Made

1. **No Multi-Tenancy:** Each environment serves one organization
2. **No Real-Time:** Dashboard updates acceptable with 5-minute cache
3. **No Audit Trail:** Logging present but detailed audit log not required
4. **No Batch Operations:** Records processed individually
5. **No File Uploads:** Records contain only text/numbers

---


