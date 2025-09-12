import express from 'express';
import marketingRoutes from './src/marketingRoutes';
import analyticsRoutes from './src/analytics/analyticsRoutes';
import { simpleRateLimiter } from './src/middleware/rateLimiter';

let fortressRoutes: express.Router | null = null;
try {
  // optional feature
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  fortressRoutes = require('./fortressRoutes').default;
} catch (e) {
  fortressRoutes = null;
}

const app = express();
app.use(express.json());
// Apply simple in-memory rate limiter globally
app.use(simpleRateLimiter);
app.use('/api/marketing', marketingRoutes);
app.use('/api/analytics', analyticsRoutes);
if (fortressRoutes) app.use('/api/fortress', fortressRoutes);

const DEFAULT_PORT = 5178;
const desiredPort = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;
const server = app.listen(desiredPort, () => {
  const addr = server.address();
  const actualPort = typeof addr === 'string' ? addr : addr && addr.port ? addr.port : desiredPort;
  console.log(`Admin API listening on port ${actualPort}`);
});

server.on('error', (err: any) => {
  if (err && err.code === 'EADDRINUSE') {
    console.warn(`Port ${desiredPort} in use — please set PORT to an available port.`);
  } else {
    console.error('Server error', err);
  }
  // don't exit the process to allow host to handle restarts
});
