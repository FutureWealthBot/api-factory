import type { FastifyPluginAsync } from 'fastify';
import { getKey, upsertKey, type KeyRecord } from '../lib/key-store.js';

const adminBilling: FastifyPluginAsync = async (fastify) => {
  // GET -> fetch key record
  fastify.get('/api/admin/billing/key', async (request, reply) => {
    const q = (request.query as Record<string, string | undefined>) || {};
    const key = q.key;
    if (!key) return reply.status(400).send({ error: 'key required' });
    const rec = await getKey(key);
    if (!rec) return reply.status(404).send({ error: 'not_found' });
    return reply.send({ data: rec });
  });

  // POST -> upsert patch for key
  fastify.post('/api/admin/billing/key', async (request, reply) => {
    const body = (request.body as Record<string, unknown>) || {};
    const key = String(body.key || '');
    if (!key) return reply.status(400).send({ error: 'key required' });
  const patch: Partial<KeyRecord> = {};
    if (body.plan) patch.plan = String(body.plan);
    if (body.quota !== undefined) patch.quota = Number(body.quota) || 0;
  if (body.status) patch.status = String(body.status) as KeyRecord['status'];
  const updated = await upsertKey(key, patch);
    return reply.send({ data: updated });
  });
};

export default adminBilling;
