import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } }) : null;

export default async function usageRoutes(fastify: FastifyInstance) {
  // Per-key usage summary

  fastify.get('/api/usage/:key', async (request, reply) => {
    if (!supabase) return reply.status(501).send({ error: 'Usage metrics require SUPABASE_URL/KEY' });
    const key = (request.params as any).key;
    // Use group by in select string
    const { data, error } = await supabase
      .from('usage_events')
      .select('status, count:count(*)')
      .eq('api_key', key);
    if (error) return reply.status(500).send({ error: error.message });
    return reply.send({ key, usage: data });
  });

  // Global usage summary
  fastify.get('/api/usage', async (_request, reply) => {
    if (!supabase) return reply.status(501).send({ error: 'Usage metrics require SUPABASE_URL/KEY' });
    // Use group by in select string
    const { data, error } = await supabase
      .from('usage_events')
      .select('api_key, count:count(*)');
    if (error) return reply.status(500).send({ error: error.message });
    return reply.send({ usage: data });
  });
}
