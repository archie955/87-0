# 87-0

A Counter-Strike esports fantasy-lineup game, in the spirit of the NBA's ["82-0"](https://www.82-0.com/): roll random teams, build a 5-player lineup one pick at a time (with one reroll allowed), name your in-game leader, and get scored against the field.

You can play the game [here](https://87-0.net/).

## Stack

- **`client/`** - React 19 + TypeScript, Vite, Tailwind, Zustand, TanStack Query
- **`server/`** - Python FastAPI + SQLAlchemy (async) + Postgres + Redis, managed with [uv](https://docs.astral.sh/uv/)

Each has its own README with the details specific to it: [`client/README.md`](./client/README.md), [`server/README.md`](./server/README.md).

## Quick start (Docker)

Requires Docker and Docker Compose.

```bash
cp .env.example .env.dev   # fill in the blanks
docker compose -f docker-compose.dev.yml --env-file .env.dev up --build
```

This starts Postgres, Redis, and the backend (with auto-reload against your local `server/` source). The backend seeds its own database on first boot. Once it's up:

```bash
cd client
npm install
npm run dev
```

The frontend dev server proxies `/api/*` to the backend automatically (see `client/vite.config.ts`) - no separate configuration needed. Open the URL Vite prints (typically `http://localhost:5173`).

## Running tests

```bash
# backend
cd server && uv sync --group dev && uv run pytest

# frontend
cd client && npm install && npx vitest run
```

Both suites are also wired up in CI - see [`.github/workflows/`](./.github/workflows/).

## Production

See `server/Dockerfile` and `client/Dockerfile` for the production images (multi-stage, non-root, no dev tooling baked in). `client/nginx.conf` serves the built frontend and reverse-proxies `/api/*` to the backend, so both stay on the same origin in production the same way they do in local dev.

## Licensing

The code in this repository is MIT-licensed - see [`LICENSE`](./LICENSE). Player names, team names, and any associated logos/imagery are the property of their respective organizations and are not covered by that license.
