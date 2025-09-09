import type { FastifyInstance } from 'fastify';

const APIS = [
  { id: '1', name: 'Echo API', tier: 'core', tags: ['utility'], price: 0, docs: '/docs/echo' },
  { id: '2', name: 'Payments API', tier: 'standard', tags: ['payments'], price: 10, docs: '/docs/payments' },
];

export default async function marketplaceRoutes(fastify: FastifyInstance) {
  // List APIs in the marketplace
  fastify.get('/marketplace', async (request, reply) => {
    reply.send({ status: 'ok', apis: APIS });
  });

  // Publish a new API (stub)
  fastify.post('/marketplace/publish', async (request, reply) => {
    // TODO: Add API to marketplace
    reply.send({ status: 'ok', message: 'API published (stub)' });
  });
}
