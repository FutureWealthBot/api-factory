// Simple API-key auth middleware for MVP
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  let apiKey = request.headers['x-api-key'];
  if (!apiKey && typeof request.query === 'object' && request.query !== null && 'api_key' in request.query) {
    apiKey = (request.query as any)['api_key'];
  }
  // For MVP, accept a hardcoded key (replace with real store later)
  const validKey = process.env.MVP_API_KEY || 'test-key';
  if (apiKey !== validKey) {
    return reply.status(401).send({ error: 'Invalid or missing API key' });
  }
}
