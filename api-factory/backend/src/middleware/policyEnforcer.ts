// Fastify middleware for runtime policy enforcement
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function policyEnforcer(request: FastifyRequest, reply: FastifyReply) {
  // Example: Feature flag check
  if (process.env.FEATURE_FLAG_DISABLE_API === '1') {
    reply.code(403).send({ error: 'API is temporarily disabled by policy.' });
    return;
  }

  // Example: Rate limit (placeholder, use real rate limiter in prod)
  // if (tooManyRequests(request)) {
  //   reply.code(429).send({ error: 'Rate limit exceeded.' });
  //   return;
  // }

  // Example: Compliance check (GDPR/PCI)
  if (process.env.REQUIRE_GDPR === '1' && !request.headers['x-gdpr-consent']) {
    reply.code(451).send({ error: 'GDPR consent required.' });
    return;
  }
}
