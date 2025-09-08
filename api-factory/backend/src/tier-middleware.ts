import { Tier, TIER_FEATURES } from '@api-factory/core';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Example: In a real app, tier would be determined by user/org/account
function getUserTier(request: FastifyRequest): Tier {
  // Placeholder: always returns Advanced for demo
  // Replace with real logic (e.g., from JWT, DB, etc.)
  return Tier.Advanced;
}

// Middleware to check if a feature is allowed for the user's tier
export function requireFeature(feature: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const tier = getUserTier(request);
    // Flatten all features for the user's tier
    const features = TIER_FEATURES[tier].features.join('\n');
    if (!features.includes(feature)) {
      reply.status(403).send({ error: `Feature '${feature}' not available for your tier.` });
      return;
    }
  };
}
