import type { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (_request, _reply) => {
    return { message: 'Hello from the API!' };
  });

  // Add more routes here as needed
}