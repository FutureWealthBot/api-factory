test('live ping (runs only when RUN_LIVE_TESTS=1)', async () => {
  if (process.env.RUN_LIVE_TESTS !== '1') return expect(true).toBe(true);
  const jwt = await import('jsonwebtoken');
  const secret = process.env.CONSENT_JWT_SECRET || 'dev-secret';
  const token = jwt.default.sign({ consent: { scopes: ['read:unknown'] } }, secret);
  const res = await fetch('http://localhost:3000/api/v1/hello/ping', { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  expect(json && json.pong).toBe(true);
});
