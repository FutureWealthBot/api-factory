import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

// Minimal JWT consent middleware with OPA policy evaluation.
// Workflow:
// 1. Verify JWT (uses CONSENT_JWT_SECRET or CONSENT_JWT_SECRET_FILE)
// 2. Build input payload and attempt to evaluate `policy/consent/consent.rego` via local `opa` binary.
// 3. If OPA is present and returns true -> allow. If OPA returns false -> deny.
// 4. If OPA is not available or evaluation fails, fallback to a local scopes check (still fail-closed).

const PUBLIC_KEY_PATH = process.env.CONSENT_JWT_SECRET_FILE || '';

type Consent = { scopes?: string[] } | null;

// lightweight extension to allow attaching consent to the request in a typed way
interface RequestWithConsent extends FastifyRequest {
  consent?: Consent;
}

function localScopeCheck(request: FastifyRequest, consent: Consent): boolean {
  // Expecting request to have a .body or query that defines requested scope; fallback to header
  const body = (request.body as Record<string, unknown> | undefined) || undefined;
  const requested = (body && (body.scope as string)) || (request.headers['x-scope'] as string) || 'read:unknown';
  const scopes = Array.isArray(consent?.scopes) ? (consent!.scopes as string[]) : [];
  return scopes.includes(requested);
}

export async function consentMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers['authorization'] || request.headers['Authorization'];
  if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Missing Authorization header' });
    return;
  }
  const token = auth.replace(/^Bearer\s+/, '');
  let payload: Record<string, unknown> | null = null;
  try {
    const secret = PUBLIC_KEY_PATH ? fs.readFileSync(PUBLIC_KEY_PATH, 'utf8') : (process.env.CONSENT_JWT_SECRET || 'dev-secret');
    payload = jwt.verify(token, secret) as Record<string, unknown>;
  } catch (err: unknown) {
    reply.status(401).send({ error: err instanceof Error ? err.message : String(err) });
    return;
  }

  const consent = (payload && (payload['consent'] as Consent)) || null;
  if (!consent) {
    reply.status(403).send({ error: 'Consent missing' });
    return;
  }

  // Build OPA input
  const now = Math.floor(Date.now() / 1000);
  const body = (request.body as Record<string, unknown> | undefined) || undefined;
  const opaInput = {
    request: {
      // minimal request shape for the example policy
      scope: (body && (body.scope as string)) || (request.headers['x-scope'] as string) || 'read:unknown',
    },
    consent,
    now,
  };

  // Try to evaluate with local opa binary
  try {
    const policyPath = path.join(process.cwd(), 'policy', 'consent', 'consent.rego');
    const args = ['eval', '-i', '-', '--format', 'json', 'data.policy.consent.allow', '--data', policyPath];
    const proc = spawnSync('opa', args, { input: JSON.stringify({ input: opaInput }), encoding: 'utf8' });
    if (proc.status === 0 && proc.stdout) {
      try {
        const out = JSON.parse(proc.stdout) as { result?: Array<{ expressions?: Array<{ value: unknown }> }> };
        const result = out.result && out.result[0] && out.result[0].expressions && out.result[0].expressions[0] && out.result[0].expressions[0].value;
        if (result === true) {
          // attach consent to request for handlers
          (request as RequestWithConsent).consent = consent;
          return;
        }
        // explicit deny
        reply.status(403).send({ error: 'Policy denied' });
        return;
      } catch {
        // fallthrough to local check
      }
    }
    // if opa not found or non-zero exit, fallback
  } catch {
    // ignore and use fallback
  }

  // Fallback: simple scope inclusion check (still fail-closed)
  const ok = localScopeCheck(request, consent);
  if (!ok) {
    reply.status(403).send({ error: 'Consent scope missing or invalid (fallback)' });
    return;
  }

  (request as RequestWithConsent).consent = consent;
}

export default consentMiddleware;
