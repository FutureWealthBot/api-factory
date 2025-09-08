import { FastifyInstance } from 'fastify';
import { validateApiForTier, ApiTier } from '../../../../packages/core/src/tiers';

export default async function tiersRoutes(fastify: FastifyInstance) {
  // Validate API definition against a tier
  fastify.post('/tiers/validate', async (request, reply) => {
    const { apiDef, tier } = request.body as { apiDef: any; tier: ApiTier };
    if (!apiDef || !tier) return reply.status(400).send({ error: 'Missing apiDef or tier' });
    const missing = validateApiForTier(apiDef, tier);
    reply.send({ status: 'ok', missing });
  });
}
