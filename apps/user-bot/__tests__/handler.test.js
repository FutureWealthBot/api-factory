import { strict as assert } from 'assert';
import { handleCommand } from '../index.js';

test('handleCommand /ping', async () => {
  const r = await handleCommand('t', '/ping');
  expect(r).toEqual({ pong: true });
});

test('handleCommand /echo', async () => {
  const r = await handleCommand('t', '/echo hello');
  expect(r).toEqual({ echo: 'hello' });
});

test('handleCommand /help', async () => {
  const r = await handleCommand('t', '/help');
  expect(r).toEqual({ help: 'Available: /help /ping /echo <text>' });
});
