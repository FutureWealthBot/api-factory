import Fastify from 'fastify';
import tiersRoutes from './tiers';

describe('Tiers API', () => {
  const fastify = Fastify();
  beforeAll(async () => {
    await fastify.register(tiersRoutes);
    await fastify.ready();
  });
  afterAll(() => fastify.close());

  it('should validate API definition for core tier', async () => {
    const apiDef = { openapi: true, health: true, ping: true, docs: true };
    const res = await fastify.inject({
      method: 'POST',
      url: '/tiers/validate',
      payload: { apiDef, tier: 'core' },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).missing).toEqual([]);
  });

  it('should return missing fields for incomplete API definition', async () => {
    const apiDef = { openapi: true };
    const res = await fastify.inject({
      method: 'POST',
      url: '/tiers/validate',
      payload: { apiDef, tier: 'core' },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).missing).toContain('health');
  });
});
