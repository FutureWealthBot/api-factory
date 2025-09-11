import assert from 'assert';
import jwt from 'jsonwebtoken';

async function run() {
  const url = 'http://localhost:3000/api/v1/hello/echo';
  const secret = process.env.CONSENT_JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ consent: { scopes: ['read:unknown'] } }, secret);
  const payload = { msg: 'integration-echo' };
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await res.json();
  assert.deepStrictEqual(json && json.echoed, payload, 'echoed payload mismatch');
  console.log('PASS');
}

run().catch((err) => {
  console.error('TEST FAILED');
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
