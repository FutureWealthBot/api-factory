import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import routesIndex from './index';
import consentMiddleware from '../middleware/consent-middleware';

// Minimal smoke test for consent middleware + route
describe('consent middleware integration', () => {
  it('starts and registers routes without throwing', async () => {
    const fastify = Fastify();
    fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const url = (request.raw.url || '');
      if (url.startsWith('/api/')) {
        await consentMiddleware(request, reply);
      }
    });
    fastify.register(routesIndex);

    const listener = await fastify.listen({ port: 0 });
    // ensure server started (listener contains address info)
    expect(listener).toBeDefined();
    await fastify.close();
  });
});
