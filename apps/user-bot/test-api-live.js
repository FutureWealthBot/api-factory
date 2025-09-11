import assert from 'assert';
import jwt from 'jsonwebtoken';

async function run() {
  const url = 'http://localhost:3000/api/v1/hello/ping';
  // create a consent JWT matching middleware expectations
  const secret = process.env.CONSENT_JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ consent: { scopes: ['read:unknown'] } }, secret);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  // expect { pong: true, ts: ... }
  assert.strictEqual(json && json.pong, true, 'expected pong: true');
  console.log('PASS');
}

run().catch((err) => {
  console.error('TEST FAILED');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
