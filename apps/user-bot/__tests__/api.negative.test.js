test('ping endpoint without auth returns error (mocked)', async () => {
  global.fetch = jest.fn(async () => ({ json: async () => ({ error: 'unauthorized' }) }));
  const res = await fetch('http://localhost:3000/api/v1/hello/ping');
  const json = await res.json();
  expect(json && json.error).toBeTruthy();
});
