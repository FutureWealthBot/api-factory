import { InMemoryStore } from '../src/store';

test('InMemoryStore basic ops', async () => {
  const s = new InMemoryStore<any>();
  expect(await s.get('x')).toBeNull();
  await s.put('x', { key: 'x', status: 'ok' });
  const v = await s.get('x');
  expect(v).toBeDefined();
  expect((await s.list())['x']).toBeDefined();
  await s.delete('x');
  expect(await s.get('x')).toBeNull();
});
