import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

type Resource = { id: string; name: string; createdAt: string };

const STORE: Record<string, Resource> = {};

export default async function resourcesRoutes(fastify: FastifyInstance) {
  // create resource
  fastify.post('/api/v1/resources', async (request, reply) => {
    const body = request.body as { name?: string } | undefined;
    if (!body || typeof body.name !== 'string' || body.name.length === 0) return reply.status(400).send({ error: 'name is required' });
    const id = randomUUID();
    const r: Resource = { id, name: body.name, createdAt: new Date().toISOString() };
    STORE[id] = r;
    return reply.status(201).send(r);
  });

  // fetch resource
  fastify.get('/api/v1/resources/:id', async (request, reply) => {
    const params = request.params as { id?: string } | undefined;
    const id = params && typeof params.id === 'string' ? params.id : undefined;
    if (!id) return reply.status(400).send({ error: 'id required' });
    const r = STORE[id];
    if (!r) return reply.status(404).send({ error: 'not found' });
    return reply.send(r);
  });
}
