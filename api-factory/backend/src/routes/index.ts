import type { FastifyInstance } from 'fastify';
import resourcesRoutes from './resources.js';
import keysRoutes from './keys.js';
import apiKeyMiddleware from '../middleware/api-key.js';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (_request, _reply) => {
    return { message: 'Hello from the API!' };
  });

  // Public keys endpoint
  fastify.register(keysRoutes);

  // Protected resource endpoints (apply api key middleware locally)
  fastify.register(async function (instance) {
    instance.addHook('preHandler', apiKeyMiddleware as any);
    instance.register(resourcesRoutes);
  });
}