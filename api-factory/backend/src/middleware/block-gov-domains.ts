import type { FastifyReply, FastifyRequest } from 'fastify';

// Simple middleware to block email addresses or domains that appear to be government (.gov/.mil)
// Looks for common locations in the request where an email or domain may be provided: body.email, body.contactEmail, headers['x-email']
// If a gov/mil domain is detected the middleware responds with 400 and does not continue.

const GOV_TLDS = ['.gov', '.mil'];

function extractEmailFromRequest(request: FastifyRequest): string | null {
  try {
    const body = request.body as Record<string, unknown> | undefined;
    const possible = [
      body && (body.email as string | undefined),
      body && (body.contactEmail as string | undefined),
      request.headers['x-email'] as string | undefined,
      request.query && (request.query as Record<string, unknown>)['email'] as string | undefined,
    ];
    for (const p of possible) {
      if (typeof p === 'string' && p.trim().length > 0) return p.trim().toLowerCase();
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function hostFromEmail(email: string): string | null {
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
}

export default async function blockGovDomains(request: FastifyRequest, reply: FastifyReply) {
  const email = extractEmailFromRequest(request);
  if (!email) return; // nothing to check

  const host = hostFromEmail(email);
  if (!host) return;

  for (const tld of GOV_TLDS) {
    if (host.endsWith(tld)) {
      reply.status(400).send({ error: 'Registrations from government domains are not allowed.' });
      return;
    }
  }
}
