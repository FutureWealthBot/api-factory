import { handleCommand } from '../index.js';

test('/ping returns pong (mocked apiCall)', async () => {
  // stub apiCall on handleCommand's module via global fetch
  global.fetch = jest.fn(async () => ({ json: async () => ({ pong: true }) }));
  const r = await handleCommand('tester', '/ping');
  expect(r).toEqual({ pong: true });
});

test('/echo returns text', async () => {
  const r = await handleCommand('tester', '/echo hello world');
  expect(r).toEqual({ echo: 'hello world' });
});
