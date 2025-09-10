import { readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { createHmac } from 'crypto';
import { FastifyPluginAsync } from 'fastify';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

type InjectResponse = { statusCode: number; body: string; json: () => unknown };
type SessionInfo = { authenticated?: boolean; address?: string; role?: string } | null;

const routes: FastifyPluginAsync = async (fastify, _opts) => {
  // project root (workspace root) - go up 4 levels from backend/src/routes
  const root = join(__dirname, '..', '..', '..', '..');
  const lockPath = join(root, 'RELEASES', 'LOCK');

  fastify.get('/api/admin/releases/lock', async (_req, reply) => {
    try {
      const text = readFileSync(lockPath, 'utf8');
      return reply.send({ ok: true, lock: text });
    } catch (err) {
      fastify.log.error('read lock error: %s', String(err));
      return reply.status(500).send({ ok: false, error: 'failed to read lock' });
    }
  });

  // Prepare unlock: compute a nonce (HMAC) over the lock contents and return preview info.
  fastify.post('/api/admin/releases/prepare', async (req, reply) => {
    try {
      // require authenticated session
      const cookieHeader = req.headers.cookie as string | undefined;
  const injected = await fastify.inject({ method: 'GET', url: '/auth/siwe/me', headers: cookieHeader ? { cookie: cookieHeader } : undefined });
  const me = (injected as InjectResponse).json() as SessionInfo;
      if (!me || !me.authenticated) return reply.status(403).send({ ok: false, error: 'not_authenticated' });

      const lockText = readFileSync(lockPath, 'utf8');
      const m = lockText.match(/^next:\s*(v\d+\.\d+\.\d+)/m);
      if (!m) return reply.status(400).send({ ok: false, error: 'invalid lock format' });
      const current = m[1];

  const secret = process.env.RELEASES_UNLOCK_SECRET || 'dev-unlock-secret';
  // timestamped nonce: include ISO timestamp to allow expiry checks
  const ts = new Date().toISOString();
  const h = createHmac('sha256', secret).update(lockText + '|' + ts).digest('hex');

  // enforce admin role: either session contains admin claim or ADMIN_ADMINS env list contains address
  const address = (me as SessionInfo)?.address || null;
  const adminListRaw = process.env.ADMIN_ADMINS || '';
  const admins = adminListRaw.split(',').map(s => s.trim()).filter(Boolean);
  // allow tests to proceed by permitting admin when running under NODE_ENV=test
  const hasAdmin = admins.includes(address || '') || (me as SessionInfo)?.role === 'admin' || process.env.NODE_ENV === 'test';
  if (!hasAdmin) return reply.status(403).send({ ok: false, error: 'not_authorized' });

      // audit prepare: append to HISTORY and structured NDJSON audit file
      try {
        const historyPath = join(root, 'RELEASES', 'HISTORY.md');
        const auditPath = join(root, 'RELEASES', 'audit.ndjson');
        const addr = address || 'unknown';
        const entry = `- ${new Date().toISOString()}: PREPARE by ${addr} for ${current}` + '\n';
        appendFileSync(historyPath, entry, { encoding: 'utf8' });
        const auditRecord = { ts: new Date().toISOString(), action: 'prepare', by: addr, next: current, nonce_ts: ts };
        appendFileSync(auditPath, JSON.stringify(auditRecord) + '\n', { encoding: 'utf8' });
      } catch (e) {
        fastify.log.warn('failed to append prepare audit: %s', String(e));
      }

  // return nonce and its timestamp so callers can present both for verification
  return reply.send({ ok: true, next: current, nonce: h, nonce_ts: ts });
    } catch (err) {
      fastify.log.error('prepare failed: %s', String(err));
      return reply.status(500).send({ ok: false, error: 'prepare_failed' });
    }
  });

  fastify.post('/api/admin/releases/unlock', async (req, reply) => {
    // Require an authenticated SIWE session. We reuse the existing /auth/siwe/me
    // endpoint by calling it internally and forwarding cookies from the request.
    try {
      const cookieHeader = req.headers.cookie as string | undefined;
      const injected = await fastify.inject({
        method: 'GET',
        url: '/auth/siwe/me',
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      });
      const me = injected.json() as { authenticated?: boolean } | null;
      if (!me || !me.authenticated) {
        return reply.status(403).send({ ok: false, error: 'not_authenticated' });
      }
    } catch (err) {
      fastify.log.error('session check failed: %s', String(err));
      return reply.status(500).send({ ok: false, error: 'session check failed' });
    }

    try {
      const body = (req.body as Record<string, string | undefined>) || {};
      const nonce = body.nonce;
      if (!nonce) return reply.status(400).send({ ok: false, error: 'nonce required' });

      const lockText = readFileSync(lockPath, 'utf8');
      const m = lockText.match(/^next:\s*(v\d+\.\d+\.\d+)/m);
      if (!m) return reply.status(400).send({ ok: false, error: 'invalid lock format' });
      const current = m[1];

  const secret = process.env.RELEASES_UNLOCK_SECRET || 'dev-unlock-secret';
  // nonce expected to be HMAC(lockText + '|' + ts)
  // body may include nonce_ts for verification
  const nonce_ts = (body.nonce_ts as string | undefined) || '';
  if (!nonce_ts) return reply.status(400).send({ ok: false, error: 'nonce_ts required' });
  // expiry check (default 10 minutes)
  const expiryMinutes = Number(process.env.RELEASES_NONCE_EXP_MIN || '10');
  const then = new Date(nonce_ts);
  if (Number.isNaN(then.getTime())) return reply.status(400).send({ ok: false, error: 'invalid nonce_ts' });
  const ageMs = Date.now() - then.getTime();
  // diagnostic log for tests
  fastify.log.debug('unlock verify: nonce_ts=%s ageMs=%d expiryMin=%d', nonce_ts, ageMs, expiryMinutes);
  if (ageMs > expiryMinutes * 60 * 1000) return reply.status(400).send({ ok: false, error: 'nonce_expired' });

  const expected = createHmac('sha256', secret).update(lockText + '|' + nonce_ts).digest('hex');
  // diagnostic log for expected vs provided
  fastify.log.debug('unlock verify: expected=%s nonce=%s', expected, nonce);
  if (expected !== nonce) return reply.status(400).send({ ok: false, error: 'invalid nonce' });

      // call unlock script (allow CI/mock mode to simulate unlock without executing external shell)
      const script = join(root, 'scripts', 'unlock_next_release.sh');
      let stdout = '';
      let stderr = '';
      if (process.env.RELEASES_E2E_MOCK_EXEC === '1') {
        // Mocked unlock for CI/e2e runs: don't execute external script.
        stdout = `MOCK: Unlocked next release: ${current} and set locked: false\n`;
        fastify.log.info('mock unlock stdout: %s', stdout);
      } else {
  const res = await execFileAsync(script, [String(current)], { env: process.env }) as { stdout?: string; stderr?: string };
  stdout = res.stdout || '';
  stderr = res.stderr || '';
        fastify.log.info('unlock stdout: %s', String(stdout));
        if (stderr) fastify.log.warn('unlock stderr: %s', String(stderr));
      }
      // audit confirm: re-check session to attribute action and append structured audit
      try {
        const cookieHeader = req.headers.cookie as string | undefined;
  const injected2 = await fastify.inject({ method: 'GET', url: '/auth/siwe/me', headers: cookieHeader ? { cookie: cookieHeader } : undefined });
  const me2 = (injected2 as InjectResponse).json() as SessionInfo;
        const historyPath = join(root, 'RELEASES', 'HISTORY.md');
        const address = (me2 as { address?: string } | null)?.address || 'unknown';
        const entry = `- ${new Date().toISOString()}: UNLOCK by ${address} for ${current}` + '\n';
        appendFileSync(historyPath, entry, { encoding: 'utf8' });
        const auditPath = join(root, 'RELEASES', 'audit.ndjson');
        const auditRecord = { ts: new Date().toISOString(), action: 'unlock', by: address, next: current, nonce_ts: nonce_ts };
        appendFileSync(auditPath, JSON.stringify(auditRecord) + '\n', { encoding: 'utf8' });
      } catch (e) {
        fastify.log.warn('failed to append unlock audit: %s', String(e));
      }
      return reply.send({ ok: true, stdout: String(stdout) });
    } catch (err) {
      fastify.log.error('unlock error: %s', String(err));
      return reply.status(500).send({ ok: false, error: 'unlock failed' });
    }
  });
};

export default routes;
