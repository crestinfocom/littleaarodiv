# Docker setup

The local database runs in Docker so development and tests never touch the hosted
Neon database. Two containers are provided:

| Service   | Image              | Purpose                      | Port (host) |
| --------- | ------------------ | ---------------------------- | ----------- |
| `db`      | `postgres:16-alpine` | Local development database | 5432        |
| `adminer` | `adminer:latest`     | Read-only DB browser       | 8080        |

## Prerequisites

- Docker Desktop (or Docker Engine + Compose v2) running.
- No other process using port **5432** or **8080**.

## Files

```
local-dev/
  docker-compose.yml        service definitions
  init/
    01-schema.sql           tables, indexes, sync_state
    02-seed.sql             demo programs / users / settings
```

- Connection credentials come **only** from `.env.local` via `env_file`. The
  compose file deliberately does not interpolate `POSTGRES_USER` /
  `POSTGRES_PASSWORD` / `POSTGRES_DB` because Compose also auto-loads the project
  `.env`, whose variable names overlap with the Neon/Vercel ones. Interpolating
  them would leak the remote settings into the local container.
- Data is stored in the named volume `little-aarodiv-pgdata` and survives
  `docker compose down`. Only `docker compose down -v` (or `npm run db:reset`)
  removes it.

## Commands

| Command                 | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `npm start local`       | Start `db` (+Adminer), wait for healthy, run the API on port 4000 |
| `npm run db:up`         | Start the database containers only            |
| `npm run db:down`       | Stop the containers (keeps the volume)        |
| `npm run db:reset`      | Recreate from scratch (destroys data + volume)|
| `npm run db:ps`         | Show container status                         |
| `npm run db:logs`       | Follow the `db` container logs                |

## Connecting

All connection values live in `.env.local` and are intentionally not reproduced
in this document.

| Setting  | Value                               |
| -------- | ----------------------------------- |
| Host     | `localhost`                         |
| Port     | `DB_PORT` (default `5432`)          |
| Database | `POSTGRES_DB` from `.env.local`     |
| User     | `POSTGRES_USER` from `.env.local`   |
| Password | `POSTGRES_PASSWORD` from `.env.local` |

Inspect from the command line — the container already has the values in its
environment:

```
docker exec little-aarodiv-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
docker exec little-aarodiv-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id,name FROM programs;"'
```

Or open Adminer on port **8080** and log in with the values from `.env.local`
(server `db`).

## Init scripts

Postgres runs everything under `local-dev/init/` **only when the data directory is
first created** (an empty volume). If you change the schema or seed and the volume
already exists, recreate it:

```
npm run db:reset
```

`01-schema.sql` creates the 14 mirror tables plus `sync_state`. `02-seed.sql`
inserts the same demo records the frontend ships with (6 programs, 3 users,
1 settings row) using `ON CONFLICT (id) DO NOTHING`, so re-running is safe.

## Healthcheck

The `db` container reports healthy via `pg_isready`. `npm start local` polls
`docker inspect -f '{{.State.Health.Status}}'` and only starts the API once the
database is healthy, so you never race an unready Postgres.

## Troubleshooting

- **Port 5432 already in use** — set `DB_PORT=5433` in `.env.local` (and update
  `LOCAL_DATABASE_URL` to match), then `npm run db:reset`.
- **Container keeps restarting / auth errors** — the volume was created with
  different credentials. Run `npm run db:reset` to recreate it with the current
  `.env.local` values.
- **Schema changes not applied** — init scripts only run on a fresh volume; use
  `npm run db:reset`.
- **`docker compose` not found** — install/upgrade to Compose v2 (bundled with
  current Docker Desktop).
- **Data missing after restart** — that is expected only after `down -v`; a plain
  `down` preserves the `little-aarodiv-pgdata` volume.
