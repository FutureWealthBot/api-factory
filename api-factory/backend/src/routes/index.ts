import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/api/example', async (request, reply) => {
    return { message: 'Hello from the API!' };
  });

  // Add more routes here as needed
}