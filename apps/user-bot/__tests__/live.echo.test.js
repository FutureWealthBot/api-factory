test('live echo (runs only when RUN_LIVE_TESTS=1)', async () => {
  if (process.env.RUN_LIVE_TESTS !== '1') return expect(true).toBe(true);
  const jwt = await import('jsonwebtoken');
  const secret = process.env.CONSENT_JWT_SECRET || 'dev-secret';
  const token = jwt.default.sign({ consent: { scopes: ['read:unknown'] } }, secret);
  const payload = { msg: 'integration-echo' };
  const res = await fetch('http://localhost:3000/api/v1/hello/echo', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await res.json();
  expect(json && json.echoed).toEqual(payload);
});
