import Fastify from 'fastify';
import type { FastifyPluginAsync } from 'fastify';
type InjectOptions = { url?: string; method?: string; payload?: unknown; headers?: Record<string,string> } | string;
type InjectResponse = { statusCode: number; body: string; json: () => unknown };
import routes from '../src/routes/admin-releases';
import { readFileSync } from 'fs';

async function main(){
  const fastify = Fastify({ logger: { level: 'debug' } });
  await fastify.register(routes as FastifyPluginAsync);
  await fastify.ready();

  // show current lock; resolve robustly relative to workspace root
  let lockPath = '';
  try {
    // prefer repository root (assumed to be process.cwd() when run from repo root)
    const possible = [
      `${process.cwd()}/RELEASES/LOCK`, // when running from repo root
      `${new URL('../../..', import.meta.url).pathname}/RELEASES/LOCK`, // relative to this script
      `/workspaces/api-factory/RELEASES/LOCK`, // fallback for codespaces path
    ];
    const found = possible.find(p => {
      try { readFileSync(p, 'utf8'); return true; } catch { return false; }
    });
  lockPath = String(found ?? possible[0]);

    const lock = readFileSync(lockPath, 'utf8');
    console.log('LOCK contents (resolved to', lockPath + '):\n', lock);
  } catch (e) {
    console.error('failed reading lock at', lockPath, e);
  }

  // stub inject for session on dev-admin
  const originalInject = fastify.inject.bind(fastify);
  (fastify as unknown as { inject: (o: InjectOptions) => Promise<InjectResponse> }).inject = (opts: InjectOptions): Promise<InjectResponse> => {
    const url = (typeof opts === 'string' ? opts : (opts as { url?: string } | undefined)?.url);
    if (url === '/auth/siwe/me') {
      const resp: InjectResponse = { statusCode: 200, body: JSON.stringify({ authenticated: true, address: 'dev-admin', role: 'admin' }), json: () => ({ authenticated: true, address: 'dev-admin', role: 'admin' }) };
      return Promise.resolve(resp);
    }
    return originalInject(opts as unknown as object) as Promise<InjectResponse>;
  };

  console.log('Calling /api/admin/releases/prepare');
  const prep = await fastify.inject({ method: 'POST', url: '/api/admin/releases/prepare' });
  console.log('prepare status', prep.statusCode, 'body', prep.body);
  const pj = JSON.parse(prep.body);

  console.log('Calling /api/admin/releases/unlock with nonce_ts and nonce');
  const unlock = await fastify.inject({ method: 'POST', url: '/api/admin/releases/unlock', payload: { nonce: pj.nonce, nonce_ts: pj.nonce_ts }, headers: { 'content-type': 'application/json' } });
  console.log('unlock status', unlock.statusCode, 'body', unlock.body);

  await fastify.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
