import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { SiweMessage } from 'siwe';
import fastifyCookie from '@fastify/cookie';
import { randomUUID } from 'crypto';

const useDevFallbacks = process.env.USE_DEV_FALLBACKS !== '0';

// Simple in-memory store for development fallback
const devSessionStore = new Map<string, unknown>();

export default async function siweRoutes(fastify: FastifyInstance) {
  if (useDevFallbacks) {
  // register cookie plugin with explicit Fastify plugin type
  fastify.register(fastifyCookie as unknown as FastifyPluginAsync);

    const getSession = (request: FastifyRequest): unknown | null => {
      const cookies = request.cookies as Record<string, string> | undefined;
      const id = typeof cookies?.siwe_session === 'string' ? cookies.siwe_session : undefined;
      if (!id) return null;
      return devSessionStore.get(id) || null;
    };

  const setSession = (reply: FastifyReply, payload: unknown) => {
      const id = randomUUID();
      devSessionStore.set(id, payload);
      reply.setCookie('siwe_session', id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
    };

    const clearSession = (reply: FastifyReply, request: FastifyRequest) => {
      const cookies = request.cookies as Record<string, string> | undefined;
      const id = typeof cookies?.siwe_session === 'string' ? cookies.siwe_session : undefined;
      if (id) devSessionStore.delete(id);
      reply.setCookie('siwe_session', '', { path: '/', httpOnly: true, maxAge: 0 });
    };

    fastify.post('/auth/siwe/verify', async (request: FastifyRequest, reply: FastifyReply) => {
      const { message, signature } = (request.body ?? {}) as { message?: string; signature?: string };
      try {
  const siwe = new SiweMessage(message || '');
  type SiweFields = Record<string, unknown> & { address?: string };
  const fields = await (siwe as unknown as { validate: (sig?: string) => Promise<SiweFields> }).validate(signature);
  setSession(reply, fields as unknown);
  const address = fields.address;
        reply.send({ ok: true, address });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        reply.status(400).send({ error: msg });
      }
    });

    fastify.get('/auth/siwe/me', async (request: FastifyRequest, reply: FastifyReply) => {
      const session = getSession(request);
      if (session) {
        const address = (session as { address?: string } | null)?.address;
        reply.send({ authenticated: true, address });
      } else {
        reply.send({ authenticated: false });
      }
    });

    fastify.post('/auth/siwe/logout', async (request: FastifyRequest, reply: FastifyReply) => {
      clearSession(reply, request);
      reply.send({ ok: true });
    });
  } else {
    // Attempt to use real @fastify/session plugin
    // register cookie + session plugins
      try {
        const cookie = (await import('@fastify/cookie')).default;
        const session = (await import('@fastify/session')).default;
  // register dynamic cookie/session plugins with FastifyPluginAsync typing
  fastify.register(cookie as unknown as FastifyPluginAsync);
        fastify.register(session as unknown as FastifyPluginAsync, ({
        secret: 'a-very-secret-key-that-is-at-least-32-characters',
        cookie: { secure: false },
      } as unknown) as Record<string, unknown>);

      fastify.post('/auth/siwe/verify', async (request: FastifyRequest, reply: FastifyReply) => {
        const { message, signature } = (request.body ?? {}) as { message?: string; signature?: string };
        try {
          const siwe = new SiweMessage(message || '');
          type SiweFields = Record<string, unknown> & { address?: string };
          const fields = await (siwe as unknown as { validate: (sig?: string) => Promise<SiweFields> }).validate(signature);
          // attach to session (plugin-typed session may exist at runtime)
          const reqAny = request as unknown as Record<string, unknown> & { session?: Record<string, unknown> };
          reqAny.session = reqAny.session || {};
          reqAny.session.siwe = fields as unknown;
          const address = (fields as { address?: string } | undefined)?.address;
          reply.send({ ok: true, address });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          reply.status(400).send({ error: msg });
        }
      });

        fastify.get('/auth/siwe/me', async (request: FastifyRequest, reply: FastifyReply) => {
          const reqAny = request as unknown as Record<string, unknown> & { session?: Record<string, unknown> };
          if (reqAny.session?.siwe) {
            const address = (reqAny.session.siwe as { address?: string } | undefined)?.address;
            reply.send({ authenticated: true, address });
          } else {
            reply.send({ authenticated: false });
          }
        });

        fastify.post('/auth/siwe/logout', async (request: FastifyRequest, reply: FastifyReply) => {
          const reqAny = request as unknown as Record<string, unknown> & { session?: { destroy?: () => void } };
          reqAny.session?.destroy?.();
          reply.send({ ok: true });
        });
    } catch (err: unknown) {
      fastify.log.error({ err }, 'Failed to register real session plugins:');
      fastify.log.debug({ err }, 'Failed to register real session plugins - debug');
      // fallback to dev behavior if plugins fail
      return siweRoutesDevFallback(fastify);
    }
  }
}

// extracted dev fallback to reuse
function siweRoutesDevFallback(fastify: FastifyInstance) {
  // register cookie plugin
  fastify.register(fastifyCookie as unknown as FastifyPluginAsync);

  const getSession = (request: FastifyRequest) => {
    const cookies = request.cookies as Record<string, string> | undefined;
    const id = cookies?.siwe_session as string | undefined;
    if (!id) return null;
    return devSessionStore.get(id) || null;
  };

  const setSession = (reply: FastifyReply, payload: unknown) => {
    const id = randomUUID();
    devSessionStore.set(id, payload);
    reply.setCookie('siwe_session', id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
  };

  const clearSession = (reply: FastifyReply, request: FastifyRequest) => {
    const cookies = request.cookies as Record<string, string> | undefined;
    const id = cookies?.siwe_session as string | undefined;
    if (id) devSessionStore.delete(id);
    reply.setCookie('siwe_session', '', { path: '/', httpOnly: true, maxAge: 0 });
  };

  fastify.post('/auth/siwe/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    const { message, signature } = (request.body ?? {}) as { message?: string; signature?: string };
    try {
    const siwe = new SiweMessage(message || '');
    type SiweFields = Record<string, unknown> & { address?: string };
    const fields = await (siwe as unknown as { validate: (sig?: string) => Promise<SiweFields> }).validate(signature);
      setSession(reply, fields as unknown);
      const address = (fields as { address?: string } | undefined)?.address;
      reply.send({ ok: true, address });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      reply.status(400).send({ error: msg });
    }
  });

  fastify.get('/auth/siwe/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const session = getSession(request);
    if (session) {
      const address = (session as { address?: string } | null)?.address;
      reply.send({ authenticated: true, address });
    } else {
      reply.send({ authenticated: false });
    }
  });

  fastify.post('/auth/siwe/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    clearSession(reply, request);
    reply.send({ ok: true });
  });
}
