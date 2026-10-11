import { syncFromNeon, getSyncStatus, SyncConfigError } from './sync.mjs';
import { config } from './env.mjs';
import { closeDatabases } from './db.mjs';

const force = process.argv.includes('--force');

try {
  if (!config.neonSyncEnabled) {
    console.log('Neon sync is disabled (NEON_SYNC_ENABLED=false in .env.local).');
    console.log('The local Docker database is the source of truth; no Neon call was made.');
    console.log('Set NEON_SYNC_ENABLED=true once the Neon quota resets to re-enable syncing.');
  } else {
    await getSyncStatus();
    const result = await syncFromNeon({ force });
    if (result.skipped) {
      console.log('Skipped (within TTL window — Neon was not called).');
      console.log(`Last sync: ${result.lastSyncedAt}  Next free sync: ${result.nextSyncAt}`);
      console.log('Run again with --force to sync immediately.');
    } else {
      console.log(`Synced ${result.totalRows} rows from Neon into the local Docker DB in ${result.durationMs}ms.`);
      for (const t of result.tables) {
        if (t.skipped) continue;
        console.log(`  • ${t.table}: ${t.rows} rows (${t.iterations} page${t.iterations === 1 ? '' : 's'})`);
      }
      if (result.skippedTables?.length) {
        console.log(`  (not present on Neon, skipped: ${result.skippedTables.join(', ')})`);
      }
      if (result.erroredTables?.length) {
        console.error(`Tables with errors: ${result.erroredTables.join(', ')}`);
        process.exitCode = 2;
      }
    }
    console.log('---');
    console.log(JSON.stringify(await getSyncStatus(), null, 2));
  }
} catch (e) {
  if (e instanceof SyncConfigError) {
    console.error(`Sync error: ${e.message}`);
    process.exitCode = 2;
  } else {
    console.error(e);
    process.exitCode = 1;
  }
} finally {
  await closeDatabases();
}