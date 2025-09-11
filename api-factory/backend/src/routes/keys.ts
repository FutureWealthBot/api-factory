import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';
import { upsertKey } from '../lib/key-store';

export default async function keysRoutes(fastify: FastifyInstance) {
  // create a new API key (for MVP, no auth required)
  fastify.post('/api/v1/keys', async (_request, reply) => {
    const raw = randomBytes(24).toString('hex');
    const key = `sk_live_${raw}`;
    const rec = await upsertKey(key, { status: 'active' });
  // return key value once
  return reply.status(201).send({ key: rec.key });
  });
}
