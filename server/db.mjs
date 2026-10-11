import pg from 'pg';
import { primaryDatabaseUrl, neonConfigured, config } from './env.mjs';

if (!primaryDatabaseUrl) {
  throw new Error(
    'No primary database URL configured. Fill LOCAL_DATABASE_URL / NEON_DATABASE_URL in .env.local ' +
      '(see .env.local.example).',
  );
}

export const pool = new pg.Pool({
  connectionString: primaryDatabaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 8_000,
});

/**
 * Short-lived Neon connection used ONLY by the admin sync action and the
 * `npm run sync:neon` CLI. max:1 keeps a single Neon connection; it is dropped
 * again shortly after a sync so we never hold idle connections against Neon.
 */
export const neonPool = neonConfigured
  ? new pg.Pool({
      connectionString: config.neonDatabaseUrl,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    })
  : null;

let shuttingDown = false;
export async function closeDatabases() {
  if (shuttingDown) return;
  shuttingDown = true;
  await Promise.allSettled([pool.end(), neonPool ? neonPool.end() : Promise.resolve()]);
}