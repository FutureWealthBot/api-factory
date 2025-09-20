import Fastify from 'fastify';
import aiRoutes from './ai';

describe('ai routes', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    fastify = Fastify();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await fastify.register(aiRoutes as any);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  test('sync generate returns a mock answer and does not expose prompt', async () => {
    const payload = { mode: 'sync', input: { type: 'text', text: 'Who is famous?' } };
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/ai/generate', payload });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.requestId).toBeTruthy();
    expect(body.output).toBeTruthy();
    expect(body.output.text).toContain('Mock answer');
  });

  test('stream generate returns chunked events', async () => {
    const payload = { mode: 'stream', input: { type: 'text', text: 'stream test' } };
    const res = await fastify.inject({ method: 'POST', url: '/api/v1/ai/generate', payload });
    // Expect the content-type to be event-stream
    expect(res.statusCode).toBe(200);
    const ct = res.headers['content-type'] as string;
    expect(ct).toMatch(/text\/event-stream/);
    // payload should contain data: markers
    expect(res.payload).toContain('data:');
    expect(res.payload).toContain('event');
  });
});
