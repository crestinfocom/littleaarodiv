# Local development

Little Aarodiv is a static single-page app (served by Vite) with an optional
Express API and a Dockerised PostgreSQL database.

```
Browser  ──►  Vite dev server (port 5173)
                 │  /api/*  (proxy)
                 ▼
              Express API (port 4000)
                 │
                 ▼
              Docker Postgres (port 5432)   ◄── explicit sync ──  Neon (remote)
```

Ordinary traffic only ever touches the local Docker database. The hosted Neon
database is read-only and is contacted **only** by an explicit sync.

## One-time setup

```
npm install
npx playwright install chromium
copy .env.local.example .env.local    # then edit values
```

`.env.local` is gitignored. `.env` is reserved for a pasted Neon/Vercel block and
is also gitignored.

## Daily workflow

Terminal 1 — database + API:

```
npm start local
```

Terminal 2 — frontend:

```
npm run dev
```

Open the dev server on port **5173**. The frontend proxies `/api` to the API on
port **4000** automatically.

If you only need the UI (no database), `npm run dev` alone is enough — the app
falls back to the in-browser demo data shipped with it.

## Environment variables

| Variable                    | Default                    | Purpose                                             |
| --------------------------- | -------------------------- | --------------------------------------------------- |
| `USE_LOCAL_DB`              | `true`                     | Route reads/writes to the Docker DB                 |
| `LOCAL_DATABASE_URL`        | –                          | Connection string for the Docker DB                 |
| `NEON_DATABASE_URL`         | –                          | Neon connection string (falls back to `DATABASE_URL_UNPOOLED` / `DATABASE_URL`) |
| `NEON_SYNC_ENABLED`         | `true`                     | Master on/off switch for all Neon access            |
| `NEON_SYNC_TTL_SECONDS`     | `86400`                    | Minimum gap between non-forced syncs                |
| `NEON_SYNC_BATCH_SIZE`      | `500`                      | Rows pulled per Neon round-trip                      |
| `SYNC_LOCK_TIMEOUT_SECONDS` | `60`                       | Max time a sync may wait for the lock               |
| `API_PORT`                  | `4000`                     | API listen port                                     |

`.env.local` wins over `.env` (loaded first, values are not overridden).

### Neon is disabled by default while the quota is exhausted

The Neon free-tier quota is currently exhausted, so any Neon call fails. Keep
this in `.env.local`:

```
NEON_SYNC_ENABLED=false
```

With it set, the API starts with `Neon sync: disabled`, the admin **Neon Sync**
panel shows a "disabled" badge and explains why, and the sync endpoints return a
clear message **without making any network call**. Set it back to `true` once the
quota resets.

## Neon sync

Neon is read-only and via an explicit action only — the admin console
(**Neon Sync** menu) or the CLI:

```
npm run sync:neon            # respects the TTL gate
npm run sync:neon -- --force # ignores the TTL gate
```

Calls are minimised by: a TTL gate, per-table `updated_at` keyset cursors,
batched pulls, a single-flight guard, an advisory lock, and a short-lived
(`max: 1`) Neon connection.

## API reference

| Method | Path                      | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/health`             | Liveness + configuration summary         |
| GET    | `/api/admin/sync/status`  | Last sync time, TTL state, table cursors |
| POST   | `/api/admin/sync`         | Run a sync (`{"force":true}` to bypass TTL). Returns 503 when Neon is disabled/unconfigured |
| GET    | `/api/:resource`          | Read rows from a mirrored table (e.g. `/api/programs?limit=50`) |

`/api/health` returns `{ ok, useLocalDb, primaryTarget, neonConfigured, neonEnabled, time }`.

## Demo credentials

The login screen pre-fills the demo credentials for the selected role (Admin,
Teacher, Parent), so they are intentionally not listed here. They are defined in
the app's demo data and the local database seed (`local-dev/init/02-seed.sql`).

## Tips

- After pulling schema/seed changes, recreate the database with
  `npm run db:reset`.
- The API can be run on its own with `npm run server` (it loads the same `.env`).
- The SPA is a **classic** script (`public/app.js`), not a module — inline
  `onclick` handlers rely on globals, so keep it that way.

## Related docs

- Docker database details: `docs/DOCKER.md`
- Test suite and headed/DevTools runs: `docs/TESTING.md`
