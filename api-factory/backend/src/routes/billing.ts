import { FastifyInstance } from 'fastify';

export default async function billingRoutes(fastify: FastifyInstance) {
  // On-chain payment endpoint (stub)
  fastify.post('/billing/onchain', async (request, reply) => {
    // TODO: Verify on-chain payment receipt
    reply.send({ status: 'ok', message: 'On-chain payment received (stub)' });
  });

  // Stripe payment endpoint (stub)
  fastify.post('/billing/stripe', async (request, reply) => {
    // TODO: Integrate with Stripe API
    reply.send({ status: 'ok', message: 'Stripe payment processed (stub)' });
  });

  // Payment status endpoint (stub)
  fastify.get('/billing/status/:userId', async (request, reply) => {
    // TODO: Return payment status for user
    reply.send({ status: 'ok', paid: true });
  });
}
