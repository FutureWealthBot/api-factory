import assert from 'assert';
import { handleCommand } from './index.js';

async function run() {
  // /ping -> { pong: true }
  const r1 = await handleCommand('tester', '/ping');
  assert.deepStrictEqual(r1, { pong: true });

  // /echo -> echoes following text
  const r2 = await handleCommand('tester', '/echo hello world');
  assert.deepStrictEqual(r2, { echo: 'hello world' });

  // /help -> help text
  const r3 = await handleCommand('tester', '/help');
  assert.deepStrictEqual(r3, { help: 'Available: /help /ping /echo <text>' });

  // unknown -> error
  const r4 = await handleCommand('tester', '/nope');
  assert.deepStrictEqual(r4, { error: 'unknown_command' });

  console.log('PASS');
}

run().catch((err) => {
  console.error('TEST FAILED');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
