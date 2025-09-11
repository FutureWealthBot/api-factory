test('live negative (runs only when RUN_LIVE_TESTS=1)', async () => {
  if (process.env.RUN_LIVE_TESTS !== '1') return expect(true).toBe(true);
  const res = await fetch('http://localhost:3000/api/v1/hello/ping');
  const json = await res.json();
  expect(json && json.error).toBeTruthy();
});
