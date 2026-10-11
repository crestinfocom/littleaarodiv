import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const p of [path.join(root, '.env.local'), path.join(root, '.env')]) {
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false, quiet: true });
}

const bool = (v, d = false) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(String(v)));
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

export const env = process.env;

// Neon source URL. Accepts our own NEON_DATABASE_URL first, then the standard
// Neon/Vercel variable names so a pasted .env "just works". Prefer the
// non-pooled URL for sync: it holds one session for the whole transaction
// (advisory lock + session_replication_role) without pgbouncer rewriting it.
//
// NEON_SYNC_ENABLED=false hard-disables all Neon access (useful while the Neon
// quota is exhausted): the sync action then reports "disabled" and makes no
// network calls at all.
const neonEnabled = bool(env.NEON_SYNC_ENABLED, true);
const neonUrl = !neonEnabled
  ? ''
  : (env.NEON_DATABASE_URL || '').trim() ||
    (env.DATABASE_URL_UNPOOLED || '').trim() ||
    (env.DATABASE_URL || '').trim();

export const config = {
  root,
  port: num(env.API_PORT, 4000),
  useLocalDb: bool(env.USE_LOCAL_DB, true),
  localDatabaseUrl: env.LOCAL_DATABASE_URL || '',
  neonSyncEnabled: neonEnabled,
  neonDatabaseUrl: neonUrl,
  neonTtlSeconds: num(env.NEON_SYNC_TTL_SECONDS, 86400),
  neonBatchSize: num(env.NEON_SYNC_BATCH_SIZE, 500),
  syncLockTimeoutSeconds: num(env.SYNC_LOCK_TIMEOUT_SECONDS, 60),
};

/**
 * Primary connection target. While USE_LOCAL_DB is true, every dev/test read
 * and write goes to the Docker Postgres mirror and Neon is never touched by
 * ordinary traffic — Neon is only used by the explicit admin sync action.
 */
export const primaryDatabaseUrl =
  config.useLocalDb && config.localDatabaseUrl
    ? config.localDatabaseUrl
    : config.neonDatabaseUrl;

export const neonConfigured = Boolean(config.neonDatabaseUrl) && config.neonDatabaseUrl !== config.primaryDatabaseUrl;

// Human-readable explanation shown by the API + admin UI when Neon is not usable.
export const neonStatusReason = !neonEnabled
  ? 'Neon access is disabled (NEON_SYNC_ENABLED=false).'
  : !config.neonDatabaseUrl
    ? 'Neon is not configured. Set NEON_DATABASE_URL in .env.local.'
    : null;
