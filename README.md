# Fullstack Trip Planner

A full-stack route planning application built with a Django REST API backend and a React + Vite frontend.

The project includes:
- `trip-planner-backend/`: Django API service
- `trip-planner-frontend/`: React + Vite Single Page App
- `docker-compose.yml`: local Docker development for backend + frontend

## Features
- Route planning with pickup/dropoff segments
- Fuel stop calculation
- ELD log generation
- Local development environment via Docker or standalone backend/frontend

## Environment configuration
This repository expects a root `.env` file for local development.

### Recommended `.env`
```env
# Django settings
DJANGO_SECRET_KEY=django-insecure-dev-only-change-me-before-production
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# OpenRouteService API key used by the backend route planner
ORS_API_KEY=your_openrouteservice_api_key_here

# Frontend settings
VITE_API_URL=/api
VITE_BACKEND_TARGET=http://127.0.0.1:8000
BACKEND_URL=http://127.0.0.1:8000
```

> Note: `.env` is ignored by git in this repository, so keep your secret keys private.

## Local development with Docker Compose
Use Docker Compose to run both services together:

```bash
docker compose up --build
```

Then open the app in your browser at:

- frontend: `http://localhost`
- backend health: `http://localhost/api/health/`

### Stop services
```bash
docker compose down
```

## Backend only (local Python)
From the repository root:

```bash
cd trip-planner-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

The backend API is available at `http://127.0.0.1:8000/api/`.

## Frontend only (local Node)
From the repository root:

```bash
cd trip-planner-frontend
npm ci
npm run dev
```

The Vite development server will start on `http://127.0.0.1:5173` by default.

### Frontend proxy
During local frontend development, Vite proxies `/api` requests to the backend target defined in `VITE_BACKEND_TARGET`.
If your backend runs on a different port, update `VITE_BACKEND_TARGET` in the root `.env` file.

## API endpoints
- `GET /api/health/` — health check
- `POST /api/plan-trip/` — request a trip plan with route, fuel stops, ELD logs

## Deployment notes

### Vercel (recommended)

Deploy **two separate Vercel projects** from this monorepo — one for the API and one for the UI.

#### 1. Backend (`trip-planner-backend`)

1. Import the repo on [vercel.com](https://vercel.com) and set **Root Directory** to `trip-planner-backend`.
2. Framework preset: **Django** (auto-detected via `manage.py`).
3. Add environment variables:

| Variable | Example | Notes |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | *(random string)* | Required in production |
| `DEBUG` | `false` | |
| `ORS_API_KEY` | *(your key)* | Required for routing |
| `ALLOWED_HOSTS` | `.vercel.app` | Optional; `.vercel.app` is already in defaults |

4. Deploy. Your API base URL will look like `https://trip-planner-api.vercel.app`.
5. Verify: `https://<backend-url>/api/health/` should return `{"status":"ok"}`.

#### 2. Frontend (`trip-planner-frontend`)

1. Create a second Vercel project with **Root Directory** `trip-planner-frontend`.
2. Framework preset: **Vite**.
3. Add environment variables:

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Baked into the build; browser calls same-origin `/api/*` |
| `BACKEND_URL` | `https://trip-planner-api.vercel.app` | **No** `/api` suffix — the Vercel proxy adds it |

4. Deploy. The frontend proxies `/api/*` to your Django backend via `api/[...path].ts`.

**Request flow in production:**

```
Browser  →  https://your-frontend.vercel.app/api/plan-trip/
         →  Vercel serverless proxy (BACKEND_URL)
         →  https://your-backend.vercel.app/api/plan-trip/
```

**Local development** still uses the Vite dev proxy (`VITE_BACKEND_TARGET`, default `http://127.0.0.1:8000`).

### Render

- `trip-planner-backend/render.yaml` is configured for Render deployment.
- If using Render for the API, set frontend `BACKEND_URL` to your Render service URL (e.g. `https://trip-planner-api.onrender.com`).

## Useful commands
- `docker compose up --build`
- `docker compose down`
- `cd trip-planner-backend && python manage.py runserver 8000`
- `cd trip-planner-frontend && npm ci && npm run dev`
- `cd trip-planner-frontend && npm run build`
- `cd trip-planner-frontend && npm run lint`

## Notes
- Backend settings are loaded from the root `.env` file.
- The frontend uses `VITE_API_URL` for runtime API base path and `VITE_BACKEND_TARGET` for local dev proxy.
- In production, set `DEBUG=false` and provide a strong `DJANGO_SECRET_KEY`.
