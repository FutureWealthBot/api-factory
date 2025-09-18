import Fastify from 'fastify';
import marketplaceRoutes from './marketplace';

describe('Marketplace API', () => {
  const fastify = Fastify();
  beforeAll(async () => {
    await fastify.register(marketplaceRoutes);
    await fastify.ready();
  });
  afterAll(() => fastify.close());

  it('should list APIs in the marketplace', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/marketplace' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).apis).toBeInstanceOf(Array);
  });

  it('should publish a new API (stub)', async () => {
    // Mock global fetch to return a minimal OpenAPI spec
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      text: async () => JSON.stringify({ openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } }),
      ok: true
    }) as any;
    const payload = {
      name: 'Test API',
      tier: 'free',
      docs: 'https://example.com/openapi.json',
      tags: [],
      price: 0
    };
    const res = await fastify.inject({ method: 'POST', url: '/marketplace/publish', headers: { 'x-api-key': 'test-key' }, payload });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toMatch(/published/i);
    global.fetch = originalFetch;
  });
});
