# Finance Backend API

## Table of Contents

- **Overview**
- **Tech Stack**
- **Architecture**
- **Quick Setup**
- **Environment Variables**
- **API Endpoints**
- **Database Schema**
- **Project Structure**
- **Scripts**
- **Error Handling & Logging**
- **Deployment**
- **Assumptions / Review Needed**

## Overview

- **Purpose** Secure finance records backend.
- **Features** JWT auth, RBAC, users CRUD, records CRUD, dashboard analytics.
- **Roles** `viewer`, `analyst`, `admin`.
- **Entry Points** `src/app.js`, `src/server.js`.

## Tech Stack

- **Runtime** Node.js (CommonJS)
- **Framework** Express.js
- **Database** MongoDB + Mongoose
- **Validation** Joi
- **Authentication** JWT access + refresh tokens
- **Security** Helmet, CORS, rate limit, sanitize, xss-clean, bcryptjs
- **Docs** Swagger/OpenAPI
- **Testing** Jest + Supertest + mongodb-memory-server
- **Logging** Winston + correlation IDs

## Architecture

- **Flow** Route -> Middleware -> Controller -> Service -> Repository -> Model/DB -> DTO -> Response
- **Route Layer** endpoint mapping
- **Controller Layer** request/response handling
- **Service Layer** business logic
- **Repository Layer** data access
- **Model Layer** schema/index definition
- **Middleware Layer** auth, role checks, validation, timing, error handling

## Quick Setup

- **Install**

```bash
npm install
```

- **Create Env File**

```bash
cp .env.example .env
```

- **Set Required Env** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_SETUP_KEY`

- **Start Dev Server**

```bash
npm run dev
```

- **Important URLs**
  - **API** `http://localhost:4000/api/v1`
  - **Health** `http://localhost:4000/health`
  - **Swagger** `http://localhost:4000/api-docs`

- **Run Tests**

```bash
npm test
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 4000 | Server port |
| DATABASE_URL | Yes* | - | MongoDB URL |
| JWT_ACCESS_SECRET | Yes* | - | Access token secret |
| JWT_REFRESH_SECRET | Yes* | - | Refresh token secret |
| JWT_ACCESS_EXPIRES_IN | No | 15m | Access token TTL |
| JWT_REFRESH_EXPIRES_IN | No | 7d | Refresh token TTL |
| BCRYPT_SALT_ROUNDS | No | 12 | Password hash cost |
| RATE_LIMIT_WINDOW_MS | No | 900000 | Rate-limit window |
| RATE_LIMIT_MAX | No | 100 | Max requests/window |
| CORS_ORIGIN | No | http://localhost:3000 | Allowed frontend origin |
| ADMIN_SETUP_KEY | No** | bootstrap-admin-key | First admin setup key |
| LOG_LEVEL | No | info | Logger level |

\* Required outside test mode.  
\** Has default, but you should override it.

## API Endpoints

- **Base URL** `http://localhost:4000/api/v1`
- **Auth Header** `Authorization: Bearer <accessToken>`
- **Cookie Auth** Access/refresh cookies set by login/refresh

### Auth

- **POST** `/auth/register`
  - **Access** Public
  - **Use** Create first admin only
  - **Request**

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "setupKey": "your-admin-setup-key"
}
```

  - **Responses** `201`, `401`, `409`

- **POST** `/auth/login`
  - **Access** Public
  - **Use** Issue access token + cookies
  - **Request**

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

  - **Responses** `200`, `401`

- **POST** `/auth/refresh`
  - **Access** Public with refresh token
  - **Source** Cookie `refreshToken` or `body.refreshToken`
  - **Responses** `200`, `401`

- **POST** `/auth/logout`
  - **Access** Authenticated
  - **Responses** `200`

### Users (Admin Only)

- **GET** `/users`
  - **Query** `limit`, `offset`
  - **Responses** `200`

- **POST** `/users`
  - **Request**

```json
{
  "email": "analyst@example.com",
  "password": "StrongPass123!",
  "role": "analyst",
  "isActive": true
}
```

  - **Responses** `201`, `409`

- **PUT** `/users/:id`
  - **Update Fields** `email`, `password`, `role`, `isActive`
  - **Responses** `200`, `404`

- **DELETE** `/users/:id`
  - **Use** Soft delete user
  - **Responses** `200`, `404`

### Records

- **Access Matrix**
  - **Read** `viewer`, `analyst`, `admin`
  - **Write** `admin`

- **GET** `/records`
  - **Query** `type`, `category`, `dateFrom`, `dateTo`, `search`, `limit`, `offset`
  - **Responses** `200`

- **POST** `/records`
  - **Request**

```json
{
  "amount": 1200,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "April salary"
}
```

  - **Responses** `201`, `400`, `403`

- **GET** `/records/:id`
  - **Responses** `200`, `404`

- **PUT** `/records/:id`
  - **Use** Partial update
  - **Responses** `200`, `404`

- **DELETE** `/records/:id`
  - **Use** Soft delete record
  - **Responses** `200`, `404`

### Dashboard

- **Access** `viewer`, `analyst`, `admin`

- **GET** `/dashboard/summary`
  - **Query** `dateFrom`, `dateTo` (optional)
  - **Returns** `totalIncome`, `totalExpenses`, `netBalance`, `categoryTotals`, `recentActivity`

- **GET** `/dashboard/trends`
  - **Query** `dateFrom`, `dateTo` (optional)
  - **Returns** Monthly trend rows

### Common Status Codes

- **Success** `200`, `201`
- **Client Errors** `400`, `401`, `403`, `404`, `409`, `429`
- **Server Error** `500`

## Database Schema

### User

- **Fields** `email`, `passwordHash`, `role`, `isActive`, `lastLoginAt`, `deletedAt`, `createdAt`, `updatedAt`
- **Behavior** Soft delete via `deletedAt`

### Record

- **Fields** `amount`, `type`, `category`, `date`, `notes`, `createdBy`, `tags`, `metadata`, `deletedAt`, `createdAt`, `updatedAt`
- **Behavior** Soft delete via `deletedAt`

### RefreshToken

- **Fields** `userId`, `tokenHash`, `expiresAt`, `revokedAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt`
- **Behavior** TTL expiration via `expiresAt` index

## Project Structure

```text
.
├── .env.example
├── package.json
├── jest.config.js
├── src
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── constants/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── validators/
│   ├── dtos/
│   ├── middlewares/
│   └── utils/
└── tests/
```

- **routes/** Endpoint definitions
- **controllers/** HTTP request/response handling
- **services/** Business logic
- **repositories/** Data access
- **models/** Mongoose schemas
- **middlewares/** Auth, validation, security, errors

## Scripts

- **dev** `npm run dev`
- **start** `npm start`
- **test** `npm test`
- **test:coverage** `npm run test:coverage`

## Error Handling & Logging

- **Errors** Custom classes in `src/utils/ApiError.js`
- **Global Handler** `src/middlewares/error.middleware.js`
- **Validation Output** Field-level error details
- **Logging** Winston request/error logs + correlation IDs
- **Production Files** `logs/error.log`, `logs/combined.log`

## Deployment

- **Set Secure Secrets** JWT secrets and setup key
- **Use Production Mode** `NODE_ENV=production`
- **Use Reverse Proxy** Nginx/ALB or equivalent
- **Enable HTTPS** Required for secure transport
- **Run Process Manager** PM2/systemd/container platform
- **Monitor Health** `/health`
- **Containerization** Dockerfile not included in this repo

## Assumptions / Review Needed

- **Assumption** No migration framework; Mongoose schema-driven setup
- **Review Needed** Duplicate text-index warning for `Record.notes` in tests
- **Review Needed** Repository supports tags filter but validator does not expose `tags` query input
# Financial
