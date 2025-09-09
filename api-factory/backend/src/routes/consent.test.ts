import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import routesIndex from './index.js';
import consentMiddleware from '../middleware/consent-middleware.js';

// Minimal smoke test for consent middleware + route
(async () => {
  const fastify = Fastify();
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = (request.raw.url || '');
    if (url.startsWith('/api/')) {
      await consentMiddleware(request, reply);
    }
  });
  fastify.register(routesIndex);

  await fastify.listen({ port: 0 });
  const address = fastify.server.address();
  console.log('Test server started:', address);
  await fastify.close();
})();
