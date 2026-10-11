import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const mode = args.find((a) => ['local', 'db'].includes(a));

if (!mode) {
  console.log(`
Little Aarodiv dev launcher

  npm start local     Start the local Docker Postgres (with persisted volume),
                      wait until healthy, then run the API server locally.
  npm start db        Start the local Docker Postgres only and exit.
  npm run db:up       docker compose up (db + adminer UI on :8080)
  npm run db:down     Stop containers (data still persists in the volume)
  npm run db:reset    Stop + delete the data volume, then re-create the DB
`);
  process.exit(0);
}

const COMPOSE = ['compose', '-f', 'local-dev/docker-compose.yml'];
const DB_CONTAINER = 'little-aarodiv-db';

function run(bin, argsArr, { stdio = 'inherit' } = {}) {
  const r = spawnSync(bin, argsArr, { stdio, shell: false });
  if (r.error) {
    console.error(`Failed to run ${bin} ${argsArr.join(' ')}: ${r.error.message}`);
    process.exit(1);
  }
  return r;
}

console.log('Bringing up the local Docker Postgres…');
run('docker', [...COMPOSE, 'up', '-d']);
console.log('Waiting for the database to be healthy…');

const deadline = Date.now() + 90_000;
for (;;) {
  const { stdout, status } = spawnSync('docker', ['inspect', '-f', '{{.State.Health.Status}}', DB_CONTAINER], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const statusText = (status === 0 ? (stdout || '').trim() : 'unknown').toLowerCase();
  if (statusText === 'healthy') {
    console.log('Local Postgres is healthy.');
    break;
  }
  if (Date.now() > deadline) {
    console.error('Timed out waiting for the database to become healthy. Check `docker logs little-aarodiv-db`.');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 2500));
}

const { config } = await import('../server/env.mjs');
console.log(`Local DB: ${config.localDatabaseUrl}`);

if (mode === 'local') {
  console.log('\nStarting the Little Aarodiv API server…\n');
  const { startServer } = await import('../server/index.mjs');
  await startServer();
} else {
  console.log('\nDatabase is ready. Run `npm start local` to also start the API, or `npm run db:logs` to watch logs.');
}