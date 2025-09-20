import { FastifyInstance } from 'fastify';

/**
 * Mock AI route: POST /api/v1/ai/generate
 * - Does not persist prompts/responses
 * - Returns JSON or streams tokens when mode=stream
 */
export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/ai/generate', async (request, reply) => {
    try {
      const body = request.body as any || {};
      const mode = body.mode || 'sync';
      const input = (body.input && body.input.text) || '';

      // ephemeral request id
  const headerId = reply.getHeader('x-request-id');
  const requestId = headerId || `req-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      reply.header('X-Request-ID', String(requestId));

      // Basic auth: require X-API-KEY or x-api-key header in dev; otherwise allow
      // (This is a mock route; in production use proper auth)
      // DO NOT log the prompt
      fastify.log.info({ route: '/api/v1/ai/generate', requestId }, 'ai request received');

      if (mode === 'stream') {
        // Send SSE-like stream (chunked) with simulated tokens
        reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        reply.raw.setHeader('Cache-Control', 'no-cache');
        reply.raw.write('data: {"requestId":"' + requestId + '","event":"start"}\n\n');

        // simulate tokens
        const words = (input || 'Hello from mock AI').split(/\s+/);
        let idx = 0;
        const i = setInterval(() => {
          if (idx < words.length) {
            const chunk = { token: words[idx], idx };
            reply.raw.write('data: ' + JSON.stringify(chunk) + '\n\n');
            idx++;
          } else {
            reply.raw.write('data: {"event":"done"}\n\n');
            clearInterval(i);
            try { reply.raw.end(); } catch (e) { /* ignore */ }
          }
        }, 80);
        return reply;
      }

      // sync mode: return a canned response without persisting the prompt
      const output = { type: 'text', text: `Mock answer to: ${input || '...'}` };
      return reply.send({ requestId, status: 'ok', model: 'mock-v1', durationMs: 10, output });
    } catch (err) {
      fastify.log.error('ai.generate error');
      return reply.status(500).send({ error: 'internal' });
    }
  });
}
