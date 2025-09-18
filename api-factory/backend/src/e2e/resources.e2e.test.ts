import { spawn, ChildProcess } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

const START_TIMEOUT = 15000;
const HEALTH_URL = (port: number) => `http://localhost:${port}/_api/healthz`;

function startServer(port = 3010): { proc: ChildProcess; port: number } {
  // Use pnpm exec to run tsx so we can execute TypeScript entrypoint
  const env = {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    DATABASE_URL: 'postgres://test:test@localhost:5432/testdb'
  } as NodeJS.ProcessEnv;
  const proc = spawn('pnpm', ['exec', 'tsx', 'src/server.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'], cwd: __dirname + '/..' });
  proc.stdout?.on('data', (d) => console.log('[server]', d.toString().trim()));
  proc.stderr?.on('data', (d) => console.error('[server-err]', d.toString().trim()));
  return { proc, port };
}

async function waitForHealth(port: number, timeout = START_TIMEOUT) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(HEALTH_URL(port));
      if (res.ok) return;
    } catch (e) {
      // ignore
    }
    await wait(500);
  }
  throw new Error('Server did not become healthy in time');
}

describe('E2E: resources happy path', () => {
  jest.setTimeout(30000);
  let serverProc: ChildProcess | null = null;
  const port = 3010;

  beforeAll(async () => {
    const s = startServer(port);
    serverProc = s.proc;
    await waitForHealth(port);
  });

  afterAll(async () => {
    if (serverProc && !serverProc.killed) {
      serverProc.kill('SIGINT');
      // give it a moment
      await wait(500);
    }
  });

  test('create key -> create resource -> fetch resource (HTTP)', async () => {
    // create key
    const keyRes = await fetch(`http://localhost:${port}/api/v1/keys`, { method: 'POST' });
    expect(keyRes.status).toBe(201);
    const keyJson = await keyRes.json();
    const key = keyJson.key;
    expect(key).toBeTruthy();

    // create resource
    const createRes = await fetch(`http://localhost:${port}/api/v1/resources`, { method: 'POST', headers: { 'x-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify({ name: 'e2e-test' }) });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.id).toBeTruthy();

    // fetch resource
    const getRes = await fetch(`http://localhost:${port}/api/v1/resources/${created.id}`, { method: 'GET', headers: { 'x-api-key': key } });
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.name).toBe('e2e-test');
  });
});
