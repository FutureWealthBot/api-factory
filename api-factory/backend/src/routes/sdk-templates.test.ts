import Fastify from 'fastify';
import sdkTemplatesRoutes from './sdk-templates';

describe('SDK Templates API', () => {
  const fastify = Fastify();
  beforeAll(async () => {
    await fastify.register(sdkTemplatesRoutes);
    await fastify.ready();
  });
  afterAll(() => fastify.close());

  it('should list templates (empty)', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/sdk-templates' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).templates).toBeInstanceOf(Array);
  });

  it('should upload a template', async () => {
    const fileContent = Buffer.from('test').toString('base64');
    const payload = {
      name: 'Test Template',
      language: 'js',
      tags: 'test,example',
      author: 'tester',
      fileContent,
      fileName: 'test.txt',
    };
    const res = await fastify.inject({
      method: 'POST',
      url: '/sdk-templates/upload',
      payload,
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).status).toBe('ok');
  });
});
