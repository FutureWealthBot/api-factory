import Fastify from 'fastify';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create a Fastify instance
const fastify = Fastify({ logger: true });

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register all route modules (use static imports to avoid ESM/CJS cycles)
import routesIndex from './routes/index.js';
import siweRoutes from './routes/siwe.js';
import tiersRoutes from './routes/tiers.js';
import marketplaceRoutes from './routes/marketplace.js';
import billingRoutes from './routes/billing.js';
import sdkTemplatesRoutes from './routes/sdk-templates.js';

fastify.register(routesIndex);
fastify.register(siweRoutes);
fastify.register(tiersRoutes);
fastify.register(marketplaceRoutes);
fastify.register(billingRoutes);
fastify.register(sdkTemplatesRoutes);

// Serve static files
// In dev we avoid registering @fastify/static (plugin version mismatches across workspace).
// Provide a tiny static file handler that streams files from the `public` folder.
import { createReadStream, promises as fsPromises } from 'fs';
import mime from 'mime';

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
    } catch (err) {
      reply.status(404).send({ error: 'Not found' });
    }
  });
} else {
  fastify.log.info('Attempting to register @fastify/static plugin (USE_DEV_FALLBACKS=0)');
  // dynamic import so missing plugin doesn't crash startup; use promise chain to avoid top-level await
  import('@fastify/static')
    .then((mod) => {
      const fastifyStatic = (mod as any).default || mod;
      // @ts-expect-error: plugin type mismatch in some workspace setups
      fastify.register(fastifyStatic, {
        root: join(__dirname, 'public'),
        prefix: '/public/',
      });
    })
    .catch((err: any) => {
      fastify.log.warn('Failed to register @fastify/static, falling back to dev static handler:', err?.message || String(err));
         // log full stack for diagnostics
         fastify.log.debug(err?.stack || String(err));
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
        } catch (err) {
          reply.status(404).send({ error: 'Not found' });
        }
      });
    });
}

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();