import express from 'express';
import marketingRoutes from './marketingRoutes';
import fortressRoutes from './fortressRoutes';

const app = express();
app.use(express.json());
app.use('/api/marketing', marketingRoutes);
app.use('/api/fortress', fortressRoutes);

const DEFAULT_PORT = 5178;
const desiredPort = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;
// If desiredPort is 0 or unset, let the OS pick a free port; otherwise try the desired port.
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
  process.exit(1);
});
