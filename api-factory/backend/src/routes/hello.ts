import type { FastifyInstance } from 'fastify';

export default async function helloRoutes(fastify: FastifyInstance) {
  // Simple health endpoint used by readiness/liveness checks
  fastify.get('/_api/healthz', async (_request, reply) => {
    return reply.send({ status: 'ok', uptime: process.uptime() });
  });

  // Ping endpoint for quick latency check
  fastify.get('/api/v1/hello/ping', async (_request, reply) => {
    return reply.send({ pong: true, ts: new Date().toISOString() });
  });

  // Echo endpoint: returns the posted body (useful for integration tests)
  fastify.post('/api/v1/hello/echo', async (request, reply) => {
    // Accept JSON or text; echo back payload with metadata
    const payload = request.body;
    return reply.send({ echoed: payload, receivedAt: new Date().toISOString() });
  });
}
