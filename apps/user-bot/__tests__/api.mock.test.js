import { handleCommandApi } from '../index.api.js';

test('handleCommandApi /ping mocked success', async () => {
  global.fetch = jest.fn(async () => ({ json: async () => ({ pong: true }) }));
  const r = await handleCommandApi('t', '/ping');
  expect(r).toEqual({ pong: true });
});

test('handleCommandApi /ping mocked failure', async () => {
  global.fetch = jest.fn(async () => { throw new Error('network'); });
  const r = await handleCommandApi('t', '/ping');
  expect(r).toEqual({ error: 'no-response' });
});
