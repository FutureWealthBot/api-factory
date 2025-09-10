import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Provide a __dirname global for legacy build artifacts that reference it
globalThis.__dirname = dirname(fileURLToPath(import.meta.url));

// Allow extensionless imports to resolve when needed
// Start the built backend server
await import('./api-factory/backend/dist/api-factory/backend/src/server.js');
