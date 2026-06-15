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
- `trip-planner-backend/render.yaml` is configured for Render deployment.
- If deploying the frontend to Vercel, set `BACKEND_URL` to your deployed Django API URL.

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
