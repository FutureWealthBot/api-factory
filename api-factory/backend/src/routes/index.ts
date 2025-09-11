import type { FastifyInstance } from 'fastify';
import resourcesRoutes from './resources';
import keysRoutes from './keys';
import apiKeyMiddleware from '../middleware/api-key';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (_request, _reply) => {
    return { message: 'Hello from the API!' };
  });

  // Public keys endpoint
  fastify.register(keysRoutes);

  // Protected resource endpoints (apply api key middleware locally)
  fastify.register(async function (instance) {
    instance.addHook('preHandler', apiKeyMiddleware as unknown as (request: unknown, reply: unknown) => Promise<void>);
    instance.register(resourcesRoutes);
  });
}