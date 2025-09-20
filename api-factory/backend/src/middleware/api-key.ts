
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getKey } from '../lib/key-store';

export default async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Prefer header, fallback to query param `api_key` if present
  const headerKey = request.headers['x-api-key'];
  let key: string | undefined;
  if (typeof headerKey === 'string' && headerKey.length > 0) key = headerKey;
  else if (headerKey && typeof headerKey === 'object') {
    // ignore non-string header shape
  }
  else if (request.query && typeof request.query === 'object') {
    const q = request.query as Record<string, unknown>;
    if (q['api_key'] && typeof q['api_key'] === 'string') key = q['api_key'];
  }

  if (!key) {
    reply.status(401).send({ error: 'Missing API key' });
    return;
  }
  const rec = await getKey(key);
  // lookup result available in `rec` for handlers
  if (!rec || rec.status !== 'active') {
    reply.status(403).send({ error: 'Invalid API key' });
    return;
  }
  // Check for expiration if expiresAt is present
  if (rec.expiresAt) {
    const now = Date.now();
    const expires = new Date(rec.expiresAt).getTime();
    if (Number.isFinite(expires) && now > expires) {
      reply.status(403).send({ error: 'API key expired' });
      return;
    }
  }
  // attach to request for handlers (typed as unknown to avoid `any`)
  (request as unknown as { apiKeyRecord?: unknown }).apiKeyRecord = rec;
}
