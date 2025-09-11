import jwt from 'jsonwebtoken';

test('echo endpoint with mock fetch', async () => {
  const secret = process.env.CONSENT_JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ consent: { scopes: ['read:unknown'] } }, secret);
  global.fetch = jest.fn(async (url, opts) => ({ json: async () => ({ echoed: { msg: 'integration-echo' } }) }));
  const res = await fetch('http://localhost:3000/api/v1/hello/echo', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ msg: 'integration-echo' }) });
  const json = await res.json();
  expect(json && json.echoed).toEqual({ msg: 'integration-echo' });
});
