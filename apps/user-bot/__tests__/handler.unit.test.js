import { handleCommand } from '../index.js';

test('/ping returns pong', async () => {
  const r = await handleCommand('tester', '/ping');
  expect(r).toEqual({ pong: true });
});

test('/echo returns text', async () => {
  const r = await handleCommand('tester', '/echo hello world');
  expect(r).toEqual({ echo: 'hello world' });
});

test('/help returns help text', async () => {
  const r = await handleCommand('tester', '/help');
  expect(r).toEqual({ help: 'Available: /help /ping /echo <text>' });
});

test('unknown returns error', async () => {
  const r = await handleCommand('tester', '/nope');
  expect(r).toEqual({ error: 'unknown_command' });
});
