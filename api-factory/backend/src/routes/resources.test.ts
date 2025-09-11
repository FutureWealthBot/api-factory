import Fastify from 'fastify';
import routes from './index';

describe('resources + keys basic flow', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    fastify = Fastify();
    // register routes plugin
    await fastify.register(routes as unknown as (instance: unknown) => void);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('creates a key, creates a resource with key, fetches resource', async () => {
    const keyRes = await fastify.inject({ method: 'POST', url: '/api/v1/keys' });
    expect(keyRes.statusCode).toBe(201);
    const body = JSON.parse(keyRes.payload || '{}');
    const key = body.key;
    expect(key).toBeDefined();

    const createRes = await fastify.inject({ method: 'POST', url: '/api/v1/resources', headers: { 'x-api-key': key }, payload: { name: 'test' } });
    expect(createRes.statusCode).toBe(201);
    const created = JSON.parse(createRes.payload || '{}');
    expect(created.id).toBeDefined();

    const getRes = await fastify.inject({ method: 'GET', url: `/api/v1/resources/${created.id}`, headers: { 'x-api-key': key } });
    expect(getRes.statusCode).toBe(200);
    const fetched = JSON.parse(getRes.payload || '{}');
    expect(fetched.name).toBe('test');
  });
});
