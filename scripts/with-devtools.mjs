#!/usr/bin/env node
/**
 * Launch Playwright in headed mode with Chrome DevTools auto-opened for every
 * tab. Any extra arguments are forwarded to `playwright test`.
 *
 *   npm run test:devtools                 # whole suite
 *   npm run test:devtools -- tests/e2e    # subset
 *   npm run test:devtools -- --project=desktop
 */
import { spawnSync } from 'node:child_process';

const forwarded = process.argv.slice(2);
const args = ['playwright', 'test', '--headed', ...forwarded];

console.log(`[devtools] npx ${args.join(' ')}  (PW_DEVTOOLS=1)`);

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PW_DEVTOOLS: '1' },
});

process.exit(result.status ?? 0);
