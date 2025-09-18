import Fastify from 'fastify';
import actionsRoutes, { rateLimitStore } from './actions';

describe('POST /api/v1/actions', () => {
  let fastify: ReturnType<typeof Fastify>;
  beforeAll(async () => {
    fastify = Fastify();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fastify.register(actionsRoutes as any);
    await fastify.ready();
  });
  afterAll(async () => {
    await fastify.close();
  });
  beforeEach(() => {
    rateLimitStore.clear();
  });

  it('should require API key', async () => {
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/actions', payload: { foo: 'bar' } });
    expect(res.statusCode).toBe(401);
  });

  it('should accept valid API key and echo action', async () => {
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/actions', headers: { 'x-api-key': 'test-key' }, payload: { foo: 'bar' } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).action).toEqual({ foo: 'bar' });
  });

  it('should enforce per-key rate limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await fastify.inject({ method: 'POST', url: '/api/v1/actions', headers: { 'x-api-key': 'test-key' }, payload: { n: i } });
      expect(res.statusCode).toBe(200);
    }
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/actions', headers: { 'x-api-key': 'test-key' }, payload: { n: 6 } });
    expect(res.statusCode).toBe(429);
    expect(JSON.parse(res.body).error).toMatch(/rate limit/i);
  });
});
