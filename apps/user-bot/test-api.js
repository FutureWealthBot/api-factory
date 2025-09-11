import assert from 'assert';
import { handleCommandApi } from './index.api.js';

async function run() {
  // Mock successful fetch
  global.fetch = async (url, opts) => ({ json: async () => ({ pong: true }) });
  const r1 = await handleCommandApi('t', '/ping');
  assert.deepStrictEqual(r1, { pong: true });

  // Mock no-response
  global.fetch = async (url, opts) => { throw new Error('network'); };
  const r2 = await handleCommandApi('t', '/ping');
  assert.deepStrictEqual(r2, { error: 'no-response' });

  console.log('PASS');
}

run().catch((err) => {
  console.error('TEST FAILED');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
