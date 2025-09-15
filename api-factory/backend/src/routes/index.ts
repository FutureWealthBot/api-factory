  // Example signup endpoint with gov domain blocking middleware
  fastify.post('/auth/signup', {
    preHandler: async (request, reply) => {
      await blockGovDomains(request as any, reply as any);
      // If middleware sent a response, reply.sent will be true and we should return
      // @ts-ignore - reply.sent is present at runtime
      if ((reply as any).sent) return reply;
    }
  }, async (request, reply) => {
    // Simulate user creation logic
    const body = request.body as Record<string, unknown>;
    // In a real app, insert user into DB, send verification, etc.
    reply.send({ ok: true, message: 'Signup successful (gov domain check passed)', user: { email: body?.email } });
  });
import type { FastifyInstance } from 'fastify';
import resourcesRoutes from './resources';
import keysRoutes from './keys';
import apiKeyMiddleware from '../middleware/api-key';
import blockGovDomains from '../middleware/block-gov-domains';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (_request, _reply) => {
    return { message: 'Hello from the API!' };
  });

  // Lightweight endpoint to let frontends validate an email before attempting signup.
  // Expects JSON body: { email: string }
  fastify.post('/auth/check-email', async (request, reply) => {
    // run the gov/domain middleware inline to reuse logic and short-circuit on gov domains
    await blockGovDomains(request as any, reply as any);
    // If middleware sent a response, reply.sent will be true and we should return
    // Fastify sets reply.sent when using reply.send; check and return
    // @ts-ignore - reply.sent is present at runtime
    if ((reply as any).sent) return;
    reply.send({ ok: true });
  });

  // Public keys endpoint
  fastify.register(keysRoutes);

  // Protected resource endpoints (apply api key middleware locally)
  fastify.register(async function (instance) {
    instance.addHook('preHandler', apiKeyMiddleware as unknown as (request: unknown, reply: unknown) => Promise<void>);
    instance.register(resourcesRoutes);
  });
}