import Fastify from 'fastify';
import usageRoutes from './usage';
import { createClient } from '@supabase/supabase-js';

describe('Usage Analytics API', () => {
  let fastify: ReturnType<typeof Fastify>;
  let supabase: ReturnType<typeof createClient>;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  beforeAll(async () => {
    fastify = Fastify();
    await usageRoutes(fastify);
    await fastify.ready();
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    }
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('returns 501 if Supabase is not configured', async () => {
    const f = Fastify();
    await usageRoutes(f);
    await f.ready();
    const res = await f.inject({ method: 'GET', url: '/api/usage/somekey' });
    expect(res.statusCode).toBe(501);
    await f.close();
  });

  (SUPABASE_URL && SUPABASE_SERVICE_KEY ? it : it.skip)('returns usage for a key (empty if none)', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/usage/somekey' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('key', 'somekey');
    expect(res.json()).toHaveProperty('usage');
    expect(Array.isArray(res.json().usage)).toBe(true);
  });

  (SUPABASE_URL && SUPABASE_SERVICE_KEY ? it : it.skip)('returns global usage (empty if none)', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/usage' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('usage');
    expect(Array.isArray(res.json().usage)).toBe(true);
  });
});
