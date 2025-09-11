import type { FastifyRequest, FastifyReply } from 'fastify';
import { getKey } from '../lib/key-store.js';

export default async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const key = (request.headers['x-api-key'] as string) || (request.query && (request.query as any).api_key) || undefined;
  if (!key) {
    reply.status(401).send({ error: 'Missing API key' });
    return;
  }
  const rec = await getKey(key);
  if (!rec || rec.status !== 'active') {
    reply.status(403).send({ error: 'Invalid API key' });
    return;
  }
  // attach to request for handlers
  (request as any).apiKeyRecord = rec;
}
