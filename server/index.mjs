import express from 'express';
import { pathToFileURL } from 'node:url';
import { pool } from './db.mjs';
import { config, neonConfigured, neonStatusReason } from './env.mjs';
import { syncFromNeon, getSyncStatus, SyncConfigError } from './sync.mjs';
import { SYNC_TABLES } from './schema.mjs';

const TABLE_NAMES = new Set(SYNC_TABLES.map((t) => t.name));

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', async (_req, res, next) => {
    try {
      const { rows } = await pool.query('SELECT 1 AS ok');
      res.json({
        ok: rows[0]?.ok === 1,
        service: 'little-aarodiv-api',
        useLocalDb: config.useLocalDb,
        primaryTarget: config.useLocalDb ? 'local-docker' : 'neon',
        neonConfigured,
        neonEnabled: config.neonSyncEnabled,
        time: new Date().toISOString(),
      });
    } catch (e) {
      next(e);
    }
  });

  app.get('/api/admin/sync/status', async (_req, res, next) => {
    try {
      res.json(await getSyncStatus());
    } catch (e) {
      next(e);
    }
  });

  app.post('/api/admin/sync', async (req, res, next) => {
    try {
      const force = Boolean(req.body?.force);
      const result = await syncFromNeon({ force });
      res.status(result.skipped ? 200 : 200).json(result);
    } catch (e) {
      if (e instanceof SyncConfigError) {
        return res.status(503).json({ error: e.message, code: e.name });
      }
      next(e);
    }
  });

  // Generic read-only access to mirrored tables for dev / sync inspection.
  app.get('/api/:resource', async (req, res, next) => {
    try {
      const table = req.params.resource;
      if (!TABLE_NAMES.has(table)) {
        return res.status(404).json({ error: `Unknown resource "${table}".`, ok: false });
      }
      const limit = Math.min(Number(req.query.limit) || 500, 1000);
      const offset = Math.max(Number(req.query.offset) || 0, 0);
      const { rows } = await pool.query(
        `SELECT * FROM "${table}" ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      res.json({ ok: true, resource: table, count: rows.length, rows });
    } catch (e) {
      next(e);
    }
  });

  app.use((_req, res) => res.status(404).json({ error: 'Not found', ok: false }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[api]', err);
    res.status(500).json({ error: err?.message || 'Internal server error', ok: false });
  });

  return app;
}

export async function startServer() {
  const app = createApp();
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Little Aarodiv API listening on http://localhost:${config.port}`);
    console.log(
      `DB target: ${config.useLocalDb ? 'LOCAL Docker Postgres (cache/mirror)' : 'Neon (direct)'}  ` +
        `Neon sync: ${neonConfigured ? 'configured' : config.neonSyncEnabled ? 'not configured' : 'disabled'}` +
        (neonStatusReason && !neonConfigured ? `  (${neonStatusReason})` : ''),
    );
  });
  const shutdown = async () => {
    server.close();
    const { closeDatabases } = await import('./db.mjs');
    await closeDatabases();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}