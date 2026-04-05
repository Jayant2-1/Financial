# Finance Monorepo

## Structure

- `backend/` Express + MongoDB API
- `frontend/` React (Vite) API tester UI

## Run Backend

1. `cd backend`
2. `cp .env.example .env`
3. Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_SETUP_KEY`
4. `npm install`
5. `npm run dev`

Backend URLs:

- API: `http://localhost:4000/api/v1`
- Health: `http://localhost:4000/health`
- Swagger: `http://localhost:4000/api-docs`

## Run Frontend

1. Open a second terminal
2. `cd frontend`
3. `cp .env.example .env`
4. `npm install`
5. `npm run dev`

Frontend URL:

- App: `http://localhost:5173`

## How they connect

- Frontend calls `VITE_API_BASE_URL` (default `http://localhost:4000/api/v1`).
- Backend allows CORS from `http://localhost:5173` by default.
- Frontend sends cookies (`credentials: include`) and Bearer token when available.

## GitHub Actions

- Workflow: `.github/workflows/test.yml`
- Runs backend tests on push/PR for Node `18` and `20`.
