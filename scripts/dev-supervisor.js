#!/usr/bin/env node
// scripts/dev-supervisor.js
// Starts admin-api (on PORT=5178) then waits for health, then starts admin-web.

import { spawn } from 'child_process';
import fetch from 'node-fetch';

const ADMIN_API_DIR = 'packages/admin-api';
const ADMIN_WEB_DIR = 'apps/admin-web';
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:5178';
const ADMIN_WEB_URL = process.env.ADMIN_BASE_URL || 'http://localhost:5173';

function spawnCmd(cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  p.on('exit', (code) => {
    if (code && code !== 0) {
      console.warn(`${cmd} ${args.join(' ')} exited with ${code}`);
    }
  });
  return p;
}

async function waitForApi(url, timeout = 20000, interval = 500) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, interval));
  }
  return false;
}

async function main() {
  console.log('Starting admin-api...');
  const apiProc = spawnCmd('pnpm', ['--filter', './packages/admin-api', 'dev']);

  const ok = await waitForApi(ADMIN_API_URL + '/api/fortress/scan', 20000, 500);
  if (!ok) {
    console.warn('admin-api did not become healthy in time, continuing anyway');
  } else {
    console.log('admin-api is healthy');
  }

  console.log('Starting admin-web...');
  const webProc = spawnCmd('pnpm', ['--filter', './apps/admin-web', 'dev']);

  // forward SIGINT/SIGTERM to children
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach(sig => process.on(sig, () => {
    console.log('Shutting down children');
    apiProc.kill('SIGTERM');
    webProc.kill('SIGTERM');
    process.exit();
  }));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
