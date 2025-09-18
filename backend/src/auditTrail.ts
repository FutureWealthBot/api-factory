// Audit Trail Logging
// This module provides a basic audit trail logger for sensitive actions.
// Extend as needed for compliance requirements.

import { FastifyInstance } from 'fastify';

export function registerAuditTrail(server: FastifyInstance) {
  server.addHook('onRequest', async (request) => {
    // Example: Log sensitive actions (customize as needed)
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      server.log.info({
        audit: true,
        method: request.method,
        url: request.url,
        user: request.user?.id || 'anonymous',
        time: new Date().toISOString(),
      }, 'Audit trail event');
    }
  });
}
