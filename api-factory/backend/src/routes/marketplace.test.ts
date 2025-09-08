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
    const res = await fastify.inject({ method: 'POST', url: '/marketplace/publish' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toMatch(/published/i);
  });
});
