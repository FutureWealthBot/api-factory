import Fastify from 'fastify';
import helloRoutes from './hello';

describe('hello routes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeAll(async () => {
  fastify = Fastify();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await fastify.register(helloRoutes as any);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  test('/_api/healthz returns 200 and status ok', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/_api/healthz' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
  });

  test('/api/v1/hello/ping returns pong', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/hello/ping', headers: { 'x-api-key': 'test-key' } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.pong).toBe(true);
    expect(body.ts).toBeTruthy();
  });

  test('/api/v1/hello/echo echoes payload', async () => {
    const payload = { msg: 'test' };
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/hello/echo', payload, headers: { 'x-api-key': 'test-key' } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.echoed).toEqual(payload);
    expect(body.receivedAt).toBeTruthy();
  });
});
