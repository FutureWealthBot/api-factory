import Fastify from 'fastify';
import billingRoutes from './billing';

describe('Billing API', () => {
  const fastify = Fastify();
  beforeAll(async () => {
    await fastify.register(billingRoutes);
    await fastify.ready();
  });
  afterAll(() => fastify.close());

  it('should accept on-chain payment (stub)', async () => {
    const res = await fastify.inject({ method: 'POST', url: '/billing/onchain' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toMatch(/on-chain/i);
  });

  it('should accept Stripe payment (stub)', async () => {
    const res = await fastify.inject({ method: 'POST', url: '/billing/stripe' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).message).toMatch(/stripe/i);
  });

  it('should return payment status (stub)', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/billing/status/testuser' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).paid).toBe(true);
  });
});

