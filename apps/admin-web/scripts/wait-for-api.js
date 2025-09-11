// apps/admin-web/scripts/wait-for-api.js
const DEFAULT_API = 'http://localhost:5178';
const POLL_PATH = '/api/fortress/scan';
const MAX_WAIT_MS = 15000;
const INTERVAL_MS = 500;

const urlBase = process.env.ADMIN_API_URL || DEFAULT_API;
const url = urlBase.replace(/\/$/, '') + POLL_PATH;

async function wait() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        console.log('API ready at', url);
        process.exit(0);
      }
      console.log('API responded', res.status, 'retrying...');
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
  console.warn(`API did not become ready within ${MAX_WAIT_MS}ms at ${url}`);
  // exit 0 anyway so dev server still starts, but we warn
  process.exit(0);
}

wait();
