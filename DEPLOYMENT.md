# Deployment Guide (Railway Backend + Vercel Frontend)

## 1) Security configuration

Set these backend environment variables in Railway:

- `NODE_ENV=production`
- `PORT=4000`
- `DATABASE_URL=<mongo connection string>`
- `JWT_ACCESS_SECRET=<strong-random-secret>`
- `JWT_REFRESH_SECRET=<strong-random-secret>`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `BCRYPT_SALT_ROUNDS=12`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `CORS_ORIGIN=https://<your-vercel-domain>`
- `ALLOW_BOOTSTRAP_ADMIN=false`
- `SEED_SYSTEM_ADMIN_ON_STARTUP=true`
- `SEED_INITIAL_USERS_ON_STARTUP=true`
- `INITIAL_ANALYST_EMAIL=<initial-analyst-email>`
- `INITIAL_ANALYST_PASSWORD=<initial-analyst-password>`
- `INITIAL_VIEWER_EMAIL=<initial-viewer-email>`
- `INITIAL_VIEWER_PASSWORD=<initial-viewer-password>`
- `SEED_DEMO_USERS_ON_STARTUP=false`
- `SEED_DEMO_RECORDS_ON_STARTUP=false`
- `SYSTEM_ADMIN_EMAIL=<initial-admin-email>`
- `SYSTEM_ADMIN_PASSWORD=<initial-admin-password>`
- `LOG_LEVEL=info`

Set this frontend environment variable in Vercel:

- `VITE_API_BASE_URL=https://<your-railway-domain>/api/v1`

## 2) Docker

Backend container files:

- `Dockerfile` (root monorepo Dockerfile for Railway)
- `railway.toml` (root Railway config for monorepo)
- `backend/Dockerfile`
- `backend/.dockerignore`
- `backend/railway.toml`
- `backend/start.sh` (Railway start entrypoint)

## 3) GitHub Actions workflows

- CI: `.github/workflows/test.yml`
  - Runs backend tests
  - Builds frontend

- CD: `.github/workflows/deploy.yml`
  - Deploys backend to Railway
  - Deploys frontend to Vercel

## 4) Required GitHub Secrets

### Railway
- `RAILWAY_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_ENVIRONMENT_ID`
- `RAILWAY_SERVICE_ID`

### Vercel
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_BASE_URL`

## 5) Important notes

- In production, cookies are configured as `Secure` with `SameSite=None`.
- Bootstrap admin can be disabled using `ALLOW_BOOTSTRAP_ADMIN=false`.
- Demo analyst/viewer seeding can be disabled in production using `SEED_DEMO_USERS_ON_STARTUP=false`.
- Demo records can be disabled in production using `SEED_DEMO_RECORDS_ON_STARTUP=false`.
- Do not commit real secrets to git.
