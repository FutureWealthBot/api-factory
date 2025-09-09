import type { FastifyPluginAsync } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';

const DEFAULT_PATH = process.env.USAGE_EVENTS_PATH || '/tmp/api-factory-usage.ndjson';

const adminUsage: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/admin/usage/recent', async (request, reply) => {
    const q = (request.query as Record<string, string | undefined>) || {};
    const nRaw = q.n;
    const parsed = Number(nRaw ?? '');
    const n = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.max(parsed, 1), 1000) : 50;

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
      const { data, error } = await supabase.from('usage_events').select('*').order('ts', { ascending: false }).limit(n);
      if (error) {
        fastify.log.error(`supabase query error: ${String(error)}`);
        return reply.status(500).send({ error: 'supabase query failed' });
      }
      return reply.send({ data });
    }

    // fallback: tail the NDJSON file
    try {
      const raw = await fs.readFile(DEFAULT_PATH, 'utf8');
      const lines = raw.trim().split('\n').filter(Boolean);
      const last = lines.slice(-n).reverse().map((l) => JSON.parse(l));
      return reply.send({ data: last });
    } catch (err: unknown) {
      fastify.log.warn(`admin usage read fallback failed: ${String(err)}`);
      return reply.status(500).send({ error: 'no usage data available' });
    }
  });
};

export default adminUsage;
