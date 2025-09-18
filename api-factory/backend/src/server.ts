import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { registerSLOAlerting } from './sloAlerting.js';
import { registerAuditTrail } from './auditTrail.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { randomUUID } from 'crypto';

// Create a Fastify instance with structured JSON logger
const fastify = Fastify({
  logger: {
    level: 'info',
    formatters: {
      bindings (bindings) { return { pid: bindings.pid, hostname: bindings.hostname }; },
      level (label) { return { level: label }; },
      log (obj) { return { ...obj, correlationId: obj.correlationId }; }
    }
  }
});

// Inject correlation ID for every request
fastify.addHook('onRequest', async (request) => {
  request.headers['x-correlation-id'] = request.headers['x-correlation-id'] || randomUUID();
  request.log = request.log.child({ correlationId: request.headers['x-correlation-id'] });
});

// Optionally register OpenAPI/Swagger if requested (set USE_OPENAPI=1)
if (process.env.USE_OPENAPI === '1') {
  try {
    // dynamic imports so missing plugins don't crash startup in stripped environments
    import('@fastify/swagger').then((mod) => {
      const swagger = (mod as any).default ?? mod;
      fastify.register(swagger, {
        routePrefix: '/openapi.json',
        swagger: {
          info: {
            title: 'API Factory',
            description: 'Auto-generated OpenAPI spec',
            version: '1.0.0',
          },
        },
      });
    }).catch(() => {
      fastify.log.warn('Swagger plugin not available');
    });

    import('@fastify/swagger-ui').then((mod) => {
      const swaggerUi = (mod as any).default ?? mod;
      fastify.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'list',
        },
        uiHooks: {
          onRequest: function (request: any, reply: any, next: any) { next(); },
          preHandler: function (request: any, reply: any, next: any) { next(); }
        },
        staticCSP: true,
        transformSpec: (spec: any, req: any, reply: any) => spec,
      });
    }).catch(() => {
      fastify.log.warn('Swagger UI plugin not available');
    });
  } catch (err) {
    // `err` is unknown, stringify for logging
    fastify.log.warn('Failed to initialize OpenAPI plugins: ' + String(err));
  }
}

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register all route modules (use static imports to avoid ESM/CJS cycles)
import routesIndex from './routes/index.js';
import siweRoutes from './routes/siwe.js';
import tiersRoutes from './routes/tiers.js';
import marketplaceRoutes from './routes/marketplace.js';
import billingRoutes from './routes/billing.js';
import stripeWebhookRoutes from './routes/stripe-webhook.js';
import sdkTemplatesRoutes from './routes/sdk-templates.js';
import adminUsageRoutes from './routes/admin-usage.js';
import adminBillingRoutes from './routes/admin-billing.js';
import adminReleasesRoutes from './routes/admin-releases.js';
import helloRoutes from './routes/hello.js';
import retirementRoutes from './routes/retirement.js';
import actionsRoutes from './routes/actions.js';

// Global policy enforcement: runs before all API requests
import { policyEnforcer } from './middleware/policyEnforcer.js';

// global preHandler for paths starting with /api
fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  await policyEnforcer(request, reply);
});

// Consent middleware: applied to API routes under /api as a fail-closed guard
import consentMiddleware from './middleware/consent-middleware.js';
import { getKey } from './lib/key-store.js';

// global preHandler for paths starting with /api
fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const url = (request.raw.url || '');
      if (url.startsWith('/api/')) {
        // Allow unauthenticated API key creation: POST /api/v1/keys must be public
        try {
          const method = (request.method || '').toUpperCase();
          if (method === 'POST' && url === '/api/v1/keys') return;
        } catch {
          // ignore and proceed to middleware
        }

        // If a valid API key is provided, skip consent middleware (API-key auth is sufficient)
        try {
          const headerKey = request.headers['x-api-key'];
          if (typeof headerKey === 'string' && headerKey.length > 0) {
            const rec = await getKey(headerKey);
            if (rec && rec.status === 'active') {
              return;
            }
          }
        } catch {
          // if key lookup fails, continue to consent middleware (fail-closed)
        }

        // call middleware; it will send reply on failure
        await consentMiddleware(request, reply);
      }
  } catch {
    // ensure fail-closed
    reply.status(500).send({ error: 'Consent middleware failure' });
  }
});

fastify.register(routesIndex);
fastify.register(siweRoutes);
fastify.register(tiersRoutes);
fastify.register(marketplaceRoutes);
fastify.register(billingRoutes);
fastify.register(sdkTemplatesRoutes);
fastify.register(stripeWebhookRoutes);
fastify.register(adminUsageRoutes);
fastify.register(adminBillingRoutes);
fastify.register(adminReleasesRoutes);
fastify.register(helloRoutes);
fastify.register(retirementRoutes);
fastify.register(actionsRoutes);

// Serve static files
// In dev we avoid registering @fastify/static (plugin version mismatches across workspace).
// Provide a tiny static file handler that streams files from the `public` folder.
import { createReadStream, promises as fsPromises } from 'fs';
import mime from 'mime';

// usage batching (dev file-backed)
import usage from './lib/usage.js';
import { getTrack } from './lib/track.js';

// Dev fallback switch: set USE_DEV_FALLBACKS=0 to attempt to use the real @fastify/static plugin.
const useDevFallbacks = process.env.USE_DEV_FALLBACKS !== '0';

if (useDevFallbacks) {
  fastify.log.info('Using dev static file handler (USE_DEV_FALLBACKS=1)');
  fastify.get('/public/*', async (request, reply) => {
    try {
      const url = (request.raw.url || '').replace(/^\/public\//, '');
      const filePath = join(__dirname, 'public', url);
      // check file exists
      await fsPromises.access(filePath);
      const stream = createReadStream(filePath);
      const contentType = mime.getType(filePath) || 'application/octet-stream';
      reply.type(contentType);
      return reply.send(stream);
    } catch {
      reply.status(404).send({ error: 'Not found' });
    }
  });
} else {
  fastify.log.info('Attempting to register @fastify/static plugin (USE_DEV_FALLBACKS=0)');
  // dynamic import so missing plugin doesn't crash startup; use promise chain to avoid top-level await
  import('@fastify/static')
    .then((mod) => {
      const fastifyStatic = (mod as unknown as { default?: unknown }).default ?? mod;
      // plugin may have mismatched types across workspaces; register dynamically
      fastify.register(fastifyStatic as unknown as (instance: unknown, opts?: unknown) => void, {
        root: join(__dirname, 'public'),
        prefix: '/public/',
      });
    })
    .catch(() => {
  const msg = 'failed to register static plugin';
  // log a single string to avoid typed-logger overload issues
  fastify.log.warn(`Failed to register @fastify/static, falling back to dev static handler: ${msg}`);
  // log minimal diagnostics
  fastify.log.debug('static plugin registration failed; falling back to dev handler');
      // fallback to the simple handler
      fastify.get('/public/*', async (request, reply) => {
        try {
          const url = (request.raw.url || '').replace(/^\/public\//, '');
          const filePath = join(__dirname, 'public', url);
          await fsPromises.access(filePath);
          const stream = createReadStream(filePath);
          const contentType = mime.getType(filePath) || 'application/octet-stream';
          reply.type(contentType);
          return reply.send(stream);
        } catch {
          reply.status(404).send({ error: 'Not found' });
        }
      });
    });
}
// expose a tiny meta endpoint reporting the repository track
fastify.get('/_meta', async (_req, reply) => {
  try {
    const track = getTrack();
    return reply.send({ track });
  } catch {
    return reply.send({ track: 'unknown' });
  }
});

// Zero-trust config: block startup if required secrets/env vars are missing or default
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL'];
for (const key of requiredEnv) {
  if (!process.env[key] || process.env[key] === 'changeme' || process.env[key] === 'default') {
    throw new Error(`FATAL: Required env var ${key} is missing or set to a default value.`);
  }
}


// Register SLO alerting and audit trail logging
registerSLOAlerting(fastify);
registerAuditTrail(fastify);

// Start the server
const start = async () => {
  try {
    // start background usage flusher
    usage.start();

    // record usage on every response (only for API routes)
    fastify.addHook('onResponse', async (request, reply) => {
      try {
        const url = (request.raw.url || '');
        if (!url.startsWith('/api/')) return;
        const apiKey = (request.headers['x-api-key'] as string) || undefined;
        const event = {
          apiKey,
          route: url,
          method: request.method,
          status: reply.statusCode,
          bytes: reply.getHeader ? Number(reply.getHeader('content-length') || 0) : undefined,
          ts: new Date().toISOString(),
        } as const;
        usage.enqueue(event as unknown as { apiKey?: string; route: string; method: string; status: number; bytes?: number; ts: string });
      } catch (err) {
        // don't fail responses
        console.error('onResponse usage hook error', err);
      }
    });

    const port = Number(process.env.PORT || 3000);
    await fastify.listen({ port });
    fastify.log.info(`Server listening on http://localhost:${port}`);
  } catch {
    fastify.log.error('startup error');
    process.exit(1);
  }
};

// stop usage flusher on process exit
process.on('SIGINT', async () => {
  try {
    await usage.stop();
  } finally {
    process.exit(0);
  }
});

start();