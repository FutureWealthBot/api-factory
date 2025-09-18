import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';

// In-memory rate limit store for MVP (reset on restart)
export const rateLimitStore = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5; // 5 requests per minute per key for MVP
const WINDOW_MS = 60 * 1000;

export default async function actionsRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/actions', { preHandler: apiKeyAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = request.headers['x-api-key'] || request.query['api_key'];
    if (!apiKey || typeof apiKey !== 'string') {
      return reply.status(401).send({ error: 'Missing API key' });
    }
    // Rate limit logic
    const now = Date.now();
    let entry = rateLimitStore.get(apiKey);
    if (!entry || now > entry.reset) {
      entry = { count: 0, reset: now + WINDOW_MS };
      rateLimitStore.set(apiKey, entry);
    }
    if (entry.count >= RATE_LIMIT) {
      const retryAfter = Math.ceil((entry.reset - now) / 1000);
      return reply.status(429).header('Retry-After', retryAfter).send({ error: 'Rate limit exceeded', retryAfter });
    }
    entry.count++;
    // For MVP, just echo the action
    return reply.send({ status: 'ok', action: request.body, remaining: RATE_LIMIT - entry.count });
  });
}
