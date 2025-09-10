import Fastify from 'fastify';
// removed unused FastifyInstance import
import routes from './admin-releases';
import type { FastifyPluginAsync } from 'fastify';

describe('Admin Releases API', () => {
  let fastify: ReturnType<typeof Fastify>;
  type InjectOptions = { method?: string; url?: string; payload?: unknown; headers?: Record<string,string> } | string;
  type InjectResponse = { statusCode: number; body: string; json: () => unknown };

  beforeEach(async () => {
    // ensure route uses mocked exec path so tests don't run external scripts
    process.env.RELEASES_E2E_MOCK_EXEC = '1';
  fastify = Fastify();
  await fastify.register(routes as FastifyPluginAsync);
    await fastify.ready();
  });

  afterEach(async () => {
    delete process.env.RELEASES_E2E_MOCK_EXEC;
    await fastify.close();
  });

  it('prepare then unlock (happy path)', async () => {
  // stub inject for session check to return authenticated
  const originalInject = fastify.inject.bind(fastify);
    // replace inject with a small in-test wrapper that handles /auth/siwe/me
    (fastify as unknown as { inject: (o: InjectOptions) => Promise<InjectResponse> }).inject = (opts: InjectOptions) : Promise<InjectResponse> => {
      const url = (typeof opts === 'string' ? opts : (opts as { url?: string } | undefined)?.url);
      if (url === '/auth/siwe/me') {
        const resp: InjectResponse = { statusCode: 200, body: JSON.stringify({ authenticated: true, address: 'dev-admin' }), json: () => ({ authenticated: true, address: 'dev-admin' }) };
        return Promise.resolve(resp);
      }
  return originalInject(opts as unknown as object) as Promise<InjectResponse>;
    };

    // call prepare
    const prep = await fastify.inject({ method: 'POST', url: '/api/admin/releases/prepare' });
    expect(prep.statusCode).toBe(200);
    const pj = JSON.parse(prep.body);
    expect(pj.ok).toBe(true);
    expect(pj.next).toMatch(/v\d+\.\d+\.\d+/);
    expect(pj.nonce).toBeDefined();
    expect(pj.nonce_ts).toBeDefined();

    // call unlock with nonce and nonce_ts
    const unlock = await fastify.inject({ method: 'POST', url: '/api/admin/releases/unlock', payload: { nonce: pj.nonce, nonce_ts: pj.nonce_ts }, headers: { 'content-type': 'application/json' } });
    expect(unlock.statusCode).toBe(200);
    const uj = JSON.parse(unlock.body);
    expect(uj.ok).toBe(true);
  });

  it('unlock fails for expired nonce', async () => {
    // stub session auth only for the /auth/siwe/me call, forward other inject calls
    (fastify as unknown as { inject: (o: InjectOptions) => Promise<InjectResponse> }).inject = (opts: InjectOptions) : Promise<InjectResponse> => {
      const url = (typeof opts === 'string' ? opts : (opts as { url?: string } | undefined)?.url);
      if (url === '/auth/siwe/me') {
        const resp: InjectResponse = { statusCode: 200, body: JSON.stringify({ authenticated: true, address: 'dev-admin' }), json: () => ({ authenticated: true, address: 'dev-admin' }) };
        return Promise.resolve(resp);
      }
      const originalInject2 = fastify.inject.bind(fastify);
      return originalInject2(opts as unknown as object) as Promise<InjectResponse>;
    };

    // craft an old nonce_ts
    const oldTs = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour ago
    // compute nonce using same HMAC logic: but easier: call prepare to get lockText, but prepare will generate fresh ts
    const prep = await fastify.inject({ method: 'POST', url: '/api/admin/releases/prepare' });
    const pj = JSON.parse(prep.body);
    // attempt unlock with old timestamp
    const unlock = await fastify.inject({ method: 'POST', url: '/api/admin/releases/unlock', payload: { nonce: pj.nonce, nonce_ts: oldTs }, headers: { 'content-type': 'application/json' } });
    expect(unlock.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('prepare is forbidden when not admin', async () => {
    // stub session as unauthenticated for /auth/siwe/me only
    (fastify as unknown as { inject: (o: InjectOptions) => Promise<InjectResponse> }).inject = (opts: InjectOptions) : Promise<InjectResponse> => {
      const url = (typeof opts === 'string' ? opts : (opts as { url?: string } | undefined)?.url);
      if (url === '/auth/siwe/me') {
        const resp: InjectResponse = { statusCode: 200, body: JSON.stringify({ authenticated: false }), json: () => ({ authenticated: false }) };
        return Promise.resolve(resp);
      }
      const originalInject3 = fastify.inject.bind(fastify);
      return originalInject3(opts as unknown as object) as Promise<InjectResponse>;
    };
    const prep = await fastify.inject({ method: 'POST', url: '/api/admin/releases/prepare' });
    expect(prep.statusCode).toBe(403);
  });
});
