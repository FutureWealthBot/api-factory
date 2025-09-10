import Fastify from 'fastify';
import { promises as fs } from 'fs';
import { join } from 'path';

const app = Fastify({ logger: true });
const DATA_DIR = '/app/data';
const KEYS_FILE = join(DATA_DIR, 'keys.json');

app.get('/_meta', async () => ({ track: process.env.TRACK || 'unknown' }));

app.get('/api/admin/billing/key', async (req, reply) => {
  const key = req.query.key;
  try {
    const data = JSON.parse(await fs.readFile(KEYS_FILE, 'utf8'));
    const rec = data.find((r) => r.key === key);
    if (!rec) return reply.status(404).send({ error: 'not_found' });
    reply.send(rec);
  } catch (e) {
    reply.status(500).send({ error: 'io_error' });
  }
});

app.post('/api/admin/billing/key', async (req, reply) => {
  const body = req.body || {};
  try {
    let data = [];
    try { data = JSON.parse(await fs.readFile(KEYS_FILE, 'utf8')); } catch {};
    const idx = data.findIndex((r) => r.key === body.key);
    if (idx === -1) data.push(body);
    else data[idx] = body;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(KEYS_FILE, JSON.stringify(data, null, 2));
    reply.send({ status: 'ok' });
  } catch (e) {
    reply.status(500).send({ error: 'io_error' });
  }
});

app.listen({ host: '0.0.0.0', port: 8787 }).then(() => console.log('admin-shim listening'));
