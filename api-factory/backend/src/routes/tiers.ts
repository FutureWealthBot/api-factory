import type { FastifyInstance } from 'fastify';
import { validateApiForTier } from '../../../../packages/core/src/tiers';
import type { ApiTier } from '../../../../packages/core/src/tiers';

export default async function tiersRoutes(fastify: FastifyInstance) {
  // Validate API definition against a tier
  fastify.post('/tiers/validate', async (request, reply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const apiDef = body?.apiDef as Record<string, unknown> | undefined;
    const tier = body?.tier as ApiTier | undefined;
    if (!apiDef || !tier) return reply.status(400).send({ error: 'Missing apiDef or tier' });
  const missing = validateApiForTier(apiDef as Record<string, unknown>, tier);
    reply.send({ status: 'ok', missing });
  });
}
