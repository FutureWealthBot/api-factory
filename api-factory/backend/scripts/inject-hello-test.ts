import Fastify from 'fastify';
import helloRoutes from '../src/routes/hello';

(async function(){
  const fastify = Fastify({ logger: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await fastify.register(helloRoutes as any);
  await fastify.ready();

  const h = await fastify.inject({ method: 'GET', url: '/_api/healthz' });
  console.log('/_api/healthz', h.statusCode, h.payload);

  const p = await fastify.inject({ method: 'GET', url: '/api/v1/hello/ping' });
  console.log('/api/v1/hello/ping', p.statusCode, p.payload);

  const e = await fastify.inject({ method: 'POST', url: '/api/v1/hello/echo', payload: { msg: 'hello' } });
  console.log('/api/v1/hello/echo', e.statusCode, e.payload);

  await fastify.close();
})();
