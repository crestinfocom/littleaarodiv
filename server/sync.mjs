import { pool, neonPool } from './db.mjs';
import { config, neonConfigured, neonStatusReason } from './env.mjs';
import { SYNC_TABLES, SYNC_META_KEY, SYNC_LOCK_KEY } from './schema.mjs';

const iso = (v) => {
  if (v === null || v === undefined) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const parseCursor = (txt) => {
  if (!txt) return null;
  try {
    const arr = JSON.parse(txt);
    return Array.isArray(arr) && arr.length ? arr : null;
  } catch {
    return null;
  }
};

const JSON_CURSOR = (arr) => JSON.stringify(arr);

async function getColumns(tableName) {
  const { rows } = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = $1
      ORDER BY ordinal_position`,
    [tableName],
  );
  return rows.map((r) => r.column_name);
}

/** Keyset cursor -> WHERE + ORDER BY that strictly advances past (ts, pk). */
function cursorClause(cursor, pk, offset) {
  const pkCols = pk.map((c) => `"${c}"`).join(', ');
  const order = `ORDER BY updated_at ASC, ${pkCols} ASC`;
  if (!cursor) {
    return { where: '', order, params: [] };
  }
  const [ts, ...pkVals] = cursor;
  const params = [ts, ...pkVals];
  const typedTs = `$${offset}::timestamptz`;
  const rest = pkVals.map((_, i) => `$${offset + i + 1}`).join(', ');
  const tuple = [typedTs, rest].filter(Boolean).join(', ');
  return {
    where: `WHERE (updated_at, ${pkCols}) > (${tuple})`,
    order,
    params,
  };
}

function buildUpsert(tableName, cols, pk) {
  const colList = cols.map((c) => `"${c}"`).join(', ');
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const pkList = pk.map((c) => `"${c}"`).join(', ');
  const updates = cols
    .filter((c) => !pk.includes(c))
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(', ');
  return `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders})
          ON CONFLICT (${pkList}) DO UPDATE SET ${updates}`;
}

async function syncTable(local, neon, table) {
  const { name, pk } = table;
  const cols = await getColumns(name);
  const upsert = buildUpsert(name, cols, pk);

  let cursor = parseCursor((await local.query('SELECT last_cursor FROM sync_state WHERE table_name=$1', [name])).rows[0]?.last_cursor);
  let rowsSynced = 0;
  let iterations = 0;

  for (;;) {
    const { where, order, params } = cursorClause(cursor, pk, 1);
    let res;
    try {
      res = await neon.query(
        `SELECT * FROM "${name}" ${where} ${order} LIMIT $${params.length + 1}`,
        [...params, config.neonBatchSize],
      );
    } catch (e) {
      // Table not present on Neon (fresh database) — treat as empty, not a failure.
      if (e?.code === '42P01') return { table: name, rows: 0, cursor: null, iterations: 0, skipped: true };
      throw e;
    }
    const batch = res.rows;
    iterations += 1;
    if (!batch.length) break;

    const flat = [];
    const sets = [];
    batch.forEach((row, i) => {
      const vals = cols.map((c) => row[c] ?? null);
      sets.push(`(${vals.map((_, j) => `$${flat.length + j + 1}`).join(', ')})`);
      flat.push(...vals);
    });
    await local.query(upsert, flat);

    const last = batch[batch.length - 1];
    cursor = [iso(last.updated_at), ...pk.map((c) => last[c] ?? null)];
    rowsSynced += batch.length;
    if (batch.length < config.neonBatchSize) break;
  }

  await local.query(
    `INSERT INTO sync_state (table_name, last_cursor, last_synced_at, rows_synced)
     VALUES ($1, $2, now(), $3)
     ON CONFLICT (table_name) DO UPDATE
       SET last_cursor = EXCLUDED.last_cursor,
           last_synced_at = now(),
           rows_synced   = $3`,
    [name, JSON_CURSOR(cursor), rowsSynced],
  );

  return { table: name, rows: rowsSynced, cursor: JSON_CURSOR(cursor), iterations };
}

export class SyncConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SyncConfigError';
  }
}

let inflight = null;

/**
 * Mirror Neon -> local Docker. To minimise Neon calls while running locally:
 *  - ordinary app traffic never reads Neon (local-first);
 *  - a TTL gate skips Neon entirely unless enough time has passed OR force=1;
 *  - single-flight prevents parallel syncs;
 *  - per-table `updated_at` cursors pull only changes, in bounded batches.
 */
export function syncFromNeon({ force = false } = {}) {
  if (inflight) return inflight;
  inflight = doSync(force).finally(() => {
    inflight = null;
  });
  return inflight;
}

async function doSync(force) {
  if (!neonConfigured || !neonPool) {
    if (!config.neonSyncEnabled) {
      throw new SyncConfigError(
        'Neon sync is disabled (NEON_SYNC_ENABLED=false in .env.local). ' +
          'The Neon quota is exhausted — set NEON_SYNC_ENABLED=true once it resets.',
      );
    }
    throw new SyncConfigError('Neon is not configured. Set NEON_DATABASE_URL in .env.local.');
  }
  if (config.primaryDatabaseUrl === config.neonDatabaseUrl) {
    throw new SyncConfigError(
      'LOCAL_DATABASE_URL is not set; the API is connected to Neon directly. Configure the local Docker DB first.',
    );
  }

  // TTL gate: if the local mirror was refreshed recently, don't call Neon again.
  const meta = (
    await pool.query('SELECT last_synced_at FROM sync_state WHERE table_name=$1', [SYNC_META_KEY])
  ).rows[0];
  if (!force && meta?.last_synced_at) {
    const ageMs = Date.now() - new Date(meta.last_synced_at).getTime();
    if (ageMs < config.neonTtlSeconds * 1000) {
      return {
        skipped: true,
        reason: 'ttl',
        lastSyncedAt: new Date(meta.last_synced_at).toISOString(),
        nextSyncAt: new Date(
          new Date(meta.last_synced_at).getTime() + config.neonTtlSeconds * 1000,
        ).toISOString(),
      };
    }
  }

  const neon = await neonPool.connect();
  const local = await pool.connect();
  const errors = [];
  let startedAt = Date.now();

  try {
    await local.query('BEGIN');
    await local.query(`SET SESSION lock_timeout = '${config.syncLockTimeoutSeconds}s'`);
    await local.query('SELECT pg_advisory_xact_lock($1)', [SYNC_LOCK_KEY]);
    // Bail on any concurrent worker that already owns the lock.
    // (pg_advisory_xact_lock already serialises us; this is the cross-process guard.)
    await local.query("SET SESSION session_replication_role = 'replica'");

    const results = [];
    for (const table of SYNC_TABLES) {
      await local.query('SAVEPOINT sync_table');
      try {
        results.push(await syncTable(local, neon, table));
      } catch (e) {
        await local.query('ROLLBACK TO SAVEPOINT sync_table');
        errors.push({ table: table.name, error: String(e?.message || e) });
      }
    }

    const totalRows = results.reduce((a, r) => a + r.rows, 0);
    const syncedTables = results.filter((r) => !r.skipped).map((r) => r.table);
    const skippedTables = results.filter((r) => r.skipped).map((r) => r.table);
    const errored = errors.map((e) => e.table);

    await local.query(
      `INSERT INTO sync_state (table_name, last_synced_at, rows_synced)
       VALUES ($1, now(), $2)
       ON CONFLICT (table_name) DO UPDATE
         SET last_synced_at = now(), rows_synced = $2`,
      [SYNC_META_KEY, totalRows],
    );

    await local.query('SET SESSION session_replication_role = DEFAULT');
    await local.query('COMMIT');

    return {
      skipped: false,
      totalRows,
      tables: results,
      errors,
      syncedTables,
      skippedTables,
      erroredTables: errored,
      durationMs: Date.now() - startedAt,
      lastSyncedAt: new Date().toISOString(),
    };
  } catch (e) {
    try {
      await local.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    neon.release();
    local.release();
  }
}

export async function getSyncStatus() {
  const rows = (
    await pool.query('SELECT table_name, last_cursor, last_synced_at, rows_synced FROM sync_state ORDER BY table_name')
  ).rows;
  const meta = rows.find((r) => r.table_name === SYNC_META_KEY);
  const tables = rows
    .filter((r) => r.table_name !== SYNC_META_KEY)
    .map((r) => ({
      table: r.table_name,
      lastSyncedAt: r.last_synced_at ? new Date(r.last_synced_at).toISOString() : null,
      rowsSynced: r.rows_synced,
    }));
  const lastSyncedAt = meta?.last_synced_at ? new Date(meta.last_synced_at).toISOString() : null;
  return {
    useLocalDb: config.useLocalDb,
    primaryTarget: config.useLocalDb ? 'local-docker' : 'neon',
    neonConfigured,
    neonEnabled: config.neonSyncEnabled,
    neonReason: neonStatusReason,
    ttlSeconds: config.neonTtlSeconds,
    batchSize: config.neonBatchSize,
    lastSyncedAt,
    syncedWithinTtl: lastSyncedAt
      ? Date.now() - new Date(lastSyncedAt).getTime() < config.neonTtlSeconds * 1000
      : false,
    tables,
  };
}