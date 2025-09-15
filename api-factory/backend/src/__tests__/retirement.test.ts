import Fastify from 'fastify';
import retirementRoutes from '../routes/retirement';

describe('retirement estimate route', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(retirementRoutes as any);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('computes monthly savings needed', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/retirement/estimate',
      payload: { age: 40, income: 100000, savings: 50000, retirementAge: 65 }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('monthlySavingsNeeded');
    expect(body.monthlySavingsNeeded).toBeGreaterThan(0);
  });
});
