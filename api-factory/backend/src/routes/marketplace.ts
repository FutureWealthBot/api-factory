
import type { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import yaml from 'js-yaml';

const DATA_FILE = path.join(process.cwd(), 'data', 'marketplace-apis.json');

type ApiRecord = {
  id: string;
  name: string;
  tier: string;
  tags: string[];
  price: number;
  docs: string; // OpenAPI spec URL
  description?: string;
  owner?: string;
  contact?: string;
  logo?: string;
  version?: string;
  openapi?: any;
  history?: ApiRecord[];
  deprecated?: boolean;
  usage?: {
    calls: number;
    errors: number;
    consumers: string[];
    lastCall?: string;
  };
  [key: string]: any;
};
  // Update an existing API by ID and track version history

async function readApis(): Promise<ApiRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as ApiRecord[];
  } catch {
    return [];
  }
}

async function writeApis(apis: ApiRecord[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(apis, null, 2), 'utf8');
}

export default async function marketplaceRoutes(fastify: FastifyInstance) {
  // Helper: Require API key and check role
  async function requireApiKeyWithRole(request: any, reply: any, allowedRoles: string[] = ['admin', 'publisher']) {
    // Use apiKeyMiddleware to attach apiKeyRecord
    await (await import('../middleware/api-key')).default(request, reply);
    // If middleware sent a response, reply.sent will be true
    if ((reply as any).sent) return false;
    const rec = (request as any).apiKeyRecord as { role?: string } | undefined;
    if (!rec || !rec.role || !allowedRoles.includes(rec.role)) {
      reply.status(403).send({ error: 'Insufficient permissions' });
      return false;
    }
    return true;
  }
  // Increment API usage (calls/errors)
  async function incrementUsage(apiId: string, type: 'calls' | 'errors', consumerId?: string) {
    const apis = await readApis();
    const idx = apis.findIndex(api => api.id === apiId);
    if (idx === -1) return;
    if (!apis[idx].usage) {
      apis[idx].usage = { calls: 0, errors: 0, consumers: [] };
    }
    apis[idx].usage[type] = (apis[idx].usage[type] || 0) + 1;
    if (type === 'calls') {
      apis[idx].usage.lastCall = new Date().toISOString();
    }
    if (consumerId && !apis[idx].usage.consumers.includes(consumerId)) {
      apis[idx].usage.consumers.push(consumerId);
    }
    await writeApis(apis);
  }

  // Endpoint to record API usage (call or error)
  fastify.post('/marketplace/usage', async (request, reply) => {
    // No auth required for usage tracking
    const body = request.body as { id: string; type: 'calls' | 'errors'; consumerId?: string };
    if (!body.id || !body.type) {
      return reply.status(400).send({ status: 'error', message: 'Missing id or type' });
    }
    await incrementUsage(body.id, body.type, body.consumerId);
    reply.send({ status: 'ok' });
  });

  // Endpoint to get API usage analytics
  fastify.get('/marketplace/usage/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const apis = await readApis();
    const api = apis.find(api => api.id === id);
    if (!api) {
      return reply.status(404).send({ status: 'error', message: 'API not found' });
    }
    reply.send({ status: 'ok', usage: api.usage || { calls: 0, errors: 0, consumers: [] } });
  });
  // List APIs in the marketplace with search/filter support (public)
  fastify.get('/marketplace', async (request, reply) => {
    const apis = await readApis();
    const query = request.query as {
      tag?: string;
      tier?: string;
      owner?: string;
      name?: string;
      deprecated?: string;
    };
    let filtered = apis;
    if (query.tag) {
      filtered = filtered.filter(api => Array.isArray(api.tags) && api.tags.includes(query.tag!));
    }
    if (query.tier) {
      filtered = filtered.filter(api => api.tier === query.tier);
    }
    if (query.owner) {
      filtered = filtered.filter(api => api.owner === query.owner);
    }
    if (query.name) {
      filtered = filtered.filter(api => api.name && api.name.toLowerCase().includes(query.name!.toLowerCase()));
    }
    if (query.deprecated === 'true') {
      filtered = filtered.filter(api => api.deprecated === true);
    } else if (query.deprecated === 'false') {
      filtered = filtered.filter(api => !api.deprecated);
    }
    // Add OpenAPI summary fields for each API
    const apisWithSummary = filtered.map(api => {
      let openapiSummary = undefined;
      if (api.openapi && typeof api.openapi === 'object') {
        const info = api.openapi.info || {};
        const paths = api.openapi.paths || {};
        openapiSummary = {
          title: info.title || '',
          version: info.version || '',
          endpointCount: Object.keys(paths).length
        };
      }
      return { ...api, openapiSummary };
    });
    reply.send({ status: 'ok', apis: apisWithSummary });
  });

  // Update an existing API by ID and track version history (auth required)
  fastify.post('/marketplace/update', async (request, reply) => {
    if (!await requireApiKeyWithRole(request, reply)) return;
    const body = request.body as Partial<ApiRecord> & { id: string };
    if (!body.id) {
      return reply.status(400).send({ status: 'error', message: 'Missing API id' });
    }
    const apis = await readApis();
    const idx = apis.findIndex(api => api.id === body.id);
    if (idx === -1) {
      return reply.status(404).send({ status: 'error', message: 'API not found' });
    }
    // Save previous version to history
    const prev = { ...apis[idx] };
    if (!apis[idx].history) apis[idx].history = [];
    apis[idx].history!.push(prev);
    // Update fields (except id/history)
    Object.keys(body).forEach(key => {
      if (key !== 'id' && key !== 'history') {
        (apis[idx] as any)[key] = (body as any)[key];
      }
    });
    await writeApis(apis);
    reply.send({ status: 'ok', api: apis[idx] });
  });

    // Delete an API by ID

    // Deprecate an API by ID

  // Publish a new API (auth required)
  fastify.post('/marketplace/publish', async (request, reply) => {
    if (!await requireApiKeyWithRole(request, reply)) return;
    const body = request.body as Partial<ApiRecord>;
    if (!body.name || !body.tier || !body.docs) {
      return reply.status(400).send({ status: 'error', message: 'Missing required fields' });
    }
    // Optional: validate new fields
    if (body.logo && typeof body.logo !== 'string') {
      return reply.status(400).send({ status: 'error', message: 'logo must be a string URL' });
    }
    if (body.contact && typeof body.contact !== 'string') {
      return reply.status(400).send({ status: 'error', message: 'contact must be a string' });
    }
    if (body.version && typeof body.version !== 'string') {
      return reply.status(400).send({ status: 'error', message: 'version must be a string' });
    }
    // Validate docs is a valid URL
    let openapiUrl: URL;
    try {
      openapiUrl = new URL(body.docs);
    } catch {
      return reply.status(400).send({ status: 'error', message: 'docs must be a valid URL' });
    }
    // Fetch and parse OpenAPI spec (JSON or YAML)
    let openapiSpec: any = null;
    try {
      const res = await fetch(openapiUrl.toString());
      const text = await res.text();
      try {
        openapiSpec = JSON.parse(text);
      } catch {
        try {
          openapiSpec = yaml.load(text);
        } catch {
          return reply.status(400).send({ status: 'error', message: 'docs must be valid OpenAPI JSON or YAML' });
        }
      }
      if (!openapiSpec || typeof openapiSpec !== 'object' || !openapiSpec.openapi) {
        return reply.status(400).send({ status: 'error', message: 'Not a valid OpenAPI spec' });
      }
    } catch (err) {
      return reply.status(400).send({ status: 'error', message: 'Failed to fetch or parse OpenAPI spec' });
    }
    const apis = await readApis();
    const newApi: ApiRecord = {
      id: (Date.now() + Math.random()).toString(36),
      name: body.name,
      tier: body.tier,
      tags: Array.isArray(body.tags) ? body.tags : [],
      price: typeof body.price === 'number' ? body.price : 0,
      docs: body.docs,
      description: body.description || '',
      owner: body.owner || '',
      contact: body.contact || '',
      logo: body.logo || '',
      version: body.version || '',
      openapi: openapiSpec,
      ...body
    };
    apis.push(newApi);
    await writeApis(apis);
    reply.send({ status: 'ok', message: 'API published', api: newApi });
  });

  // Update an existing API by ID and track version history

  // Delete an API by ID

  // Deprecate an API by ID
}
