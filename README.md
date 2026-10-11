# Little Aarodiv

A preschool / daycare website with a public marketing site and three role-based
portals (Admin, Teacher, Parent). The UI is a vanilla single-page app served by
Vite, backed by a small Express API and a Dockerised PostgreSQL database that can
be synchronised on demand from a hosted Neon Postgres.

## Documentation

- `docs/DOCKER.md` — Docker database setup and maintenance
- `docs/LOCAL_DEVELOPMENT.md` — local development workflow, env vars, API reference
- `docs/TESTING.md` — test suite, headed runs and Chrome DevTools

## Stack

- **Frontend:** static HTML + CSS + classic JavaScript (no framework), bundled by Vite.
- **Backend:** Node.js + Express with the `pg` driver.
- **Database:** PostgreSQL 16 in Docker (local mirror) and Neon (source of truth).
- **Tests:** Playwright (Chromium), functional E2E + responsive/visual/a11y UI tests.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- Docker Desktop (only needed for the full local stack)
- Playwright Chromium (`npx playwright install chromium`)

## Quick start (frontend only)

```
npm install
npm run dev
```

The dev server runs on port **5173**. This mode uses the in-browser demo data
shipped with the app; the API and database are optional.

## Full local stack (Docker + API)

```
npm start local
```

This command:

1. Brings up the local Postgres container (and Adminer) via Docker Compose.
2. Waits until Postgres reports **healthy**.
3. Starts the API server on port **4000** (the Vite dev server proxies `/api`
   to it automatically).

Then run the frontend in a second terminal with `npm run dev`.

- Postgres: port **5432**, database `little_aarodiv`, user `little`.
- Adminer (DB UI): port **8080**.

To build for production: `npm run build` (output in `dist/`), preview with
`npm run preview` (port **4173**).

## Configuration

Copy `.env.local.example` to `.env.local` and adjust as needed. Key settings:

- `USE_LOCAL_DB` — `true` makes every read/write hit the local Docker Postgres.
- `LOCAL_DATABASE_URL` — connection string for the local Docker database.
- `NEON_DATABASE_URL` — connection string for the hosted Neon database. Leave it
  empty to develop fully offline; the sync action then reports
  "Neon not configured" instead of making any network calls. The server also
  accepts the Vercel/Neon variable names `DATABASE_URL_UNPOOLED` and
  `DATABASE_URL`, so a Neon integration block pasted into a gitignored `.env`
  file works as-is.
- `NEON_SYNC_ENABLED` — master switch for all Neon access. Set to `false` to run
  fully offline (for example while the Neon quota is exhausted): the sync action
  reports "disabled" and makes no network calls.
- `NEON_SYNC_TTL_SECONDS`, `NEON_SYNC_BATCH_SIZE`, `SYNC_LOCK_TIMEOUT_SECONDS` —
  sync tuning (see below).

`.env` and `.env.local` are gitignored; only `.env.local.example` is committed.

## Neon sync (kept to a minimum)

The app is **local-first**: normal browsing never touches Neon. Neon is read
only by an explicit sync, either from the admin console (**Neon Sync** menu) or
from the command line:

```
npm run sync:neon            # respects the TTL gate
npm run sync:neon -- --force # ignores the TTL gate
```

How calls are minimised:

- **TTL gate** — a normal sync is skipped if the last one finished within
  `NEON_SYNC_TTL_SECONDS` (default 24h). Use `--force` (or the admin button) to
  override.
- **Keyset cursor** — each table tracks the last `updated_at` seen, so only
  changed rows are pulled and busy tables converge in a bounded number of calls.
- **Batched pulls** — at most `NEON_SYNC_BATCH_SIZE` rows per round-trip.
- **Single-flight + advisory lock** — concurrent syncs are rejected.
- **Short-lived connection** — Neon connections use `max: 1` and close when idle.

## Demo credentials

The login screen pre-fills the demo credentials for the selected role (Admin,
Teacher, Parent), so they are intentionally not listed here. They are defined in
the app's demo data and the local database seed (`local-dev/init/02-seed.sql`).

## Tests

```
npm test             # full suite (all projects)
npm run test:e2e     # functional end-to-end tests
npm run test:ui      # responsive / visual / accessibility
npm run test:headed  # visible browser
npm run test:devtools# headed + Chrome DevTools (docs/TESTING.md)
npm run test:update  # re-record visual snapshots
npm run report       # open the last HTML report
```

Playwright runs two projects:

- **desktop** (1440x900) — every `*.spec.ts` except `*.mobile.spec.ts`.
- **mobile** (Pixel 5) — only `*.mobile.spec.ts` responsive specs.

Tests are deterministic: a fixed clock and a seeded `Math.random` are injected,
and the visual specs wait for fonts and images before comparing screenshots
(baselines live in `tests/ui/visual.spec.ts-snapshots/`).

## Scripts

| Script                  | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `npm start local`       | Docker DB + API server                           |
| `npm run dev`           | Vite dev server (frontend)                       |
| `npm run build`         | Production build into `dist/`                    |
| `npm run server`        | API server only                                  |
| `npm run db:up/down`    | Start / stop the Docker database                 |
| `npm run db:reset`      | Recreate the database (destroys the volume)      |
| `npm run sync:neon`     | Pull changes from Neon into the local database   |

## Project layout

```
public/            app source: index assets, styles.css, app.js, fonts, photos
index.html         SPA shell
server/            Express API, pg pools, schema map, Neon sync
scripts/           local launcher (Docker + API) and DevTools test runner
local-dev/         docker-compose.yml and SQL init scripts (schema + seed)
docs/              Docker, local development and testing guides
tests/e2e/         functional end-to-end specs
tests/ui/          responsive, visual and accessibility specs
tests/support/     shared Playwright helpers
```

Fonts and photos are vendored under `public/assets/` so the app makes no
external requests at runtime.
