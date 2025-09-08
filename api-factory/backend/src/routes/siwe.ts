import { FastifyInstance } from 'fastify';
import { SiweMessage } from 'siwe';
import fastifyCookie from '@fastify/cookie';
import { randomUUID } from 'crypto';

const useDevFallbacks = process.env.USE_DEV_FALLBACKS !== '0';

// Simple in-memory store for development fallback
const devSessionStore = new Map<string, any>();

export default async function siweRoutes(fastify: FastifyInstance) {
  if (useDevFallbacks) {
    // register cookie plugin
    // @ts-expect-error: plugin types
    fastify.register(fastifyCookie);

    const getSession = (request: any) => {
      const id = request.cookies?.siwe_session as string | undefined;
      if (!id) return null;
      return devSessionStore.get(id) || null;
    };

    const setSession = (reply: any, payload: any) => {
      const id = randomUUID();
      devSessionStore.set(id, payload);
      reply.setCookie('siwe_session', id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
    };

    const clearSession = (reply: any, request: any) => {
      const id = request.cookies?.siwe_session as string | undefined;
      if (id) devSessionStore.delete(id);
      reply.setCookie('siwe_session', '', { path: '/', httpOnly: true, maxAge: 0 });
    };

    fastify.post('/auth/siwe/verify', async (request: any, reply: any) => {
      const { message, signature } = request.body as { message: string; signature: string };
      try {
        const siwe = new SiweMessage(message);
        // @ts-expect-error: validate is not typed in siwe v3
        const fields = await siwe.validate(signature);
        setSession(reply, fields);
        reply.send({ ok: true, address: fields.address });
      } catch (e: any) {
        reply.status(400).send({ error: e.message });
      }
    });

    fastify.get('/auth/siwe/me', async (request: any, reply: any) => {
      const session = getSession(request);
      if (session) {
        reply.send({ authenticated: true, address: session.address });
      } else {
        reply.send({ authenticated: false });
      }
    });

    fastify.post('/auth/siwe/logout', async (request: any, reply: any) => {
      clearSession(reply, request);
      reply.send({ ok: true });
    });
  } else {
    // Attempt to use real @fastify/session plugin
    // register cookie + session plugins
    try {
      const cookie = (await import('@fastify/cookie')).default;
      const session = (await import('@fastify/session')).default;
      // @ts-expect-error: plugin types
      fastify.register(cookie);
      // @ts-expect-error: plugin types
      fastify.register(session, {
        secret: 'a-very-secret-key-that-is-at-least-32-characters',
        cookie: { secure: false },
      });

      fastify.post('/auth/siwe/verify', async (request: any, reply: any) => {
        const { message, signature } = request.body as { message: string; signature: string };
        try {
          const siwe = new SiweMessage(message);
          // @ts-expect-error: validate is not typed in siwe v3
          const fields = await siwe.validate(signature);
          // @ts-expect-error: session property
          request.session.siwe = fields;
          reply.send({ ok: true, address: fields.address });
        } catch (e: any) {
          reply.status(400).send({ error: e.message });
        }
      });

      fastify.get('/auth/siwe/me', async (request: any, reply: any) => {
        // @ts-expect-error: session property
        if (request.session?.siwe) {
          // @ts-expect-error
          reply.send({ authenticated: true, address: request.session.siwe.address });
        } else {
          reply.send({ authenticated: false });
        }
      });

      fastify.post('/auth/siwe/logout', async (request: any, reply: any) => {
        // @ts-expect-error
        request.session?.destroy?.();
        reply.send({ ok: true });
      });
    } catch (err: any) {
      fastify.log.error('Failed to register real session plugins:', err?.message || String(err));
      fastify.log.debug(err?.stack || String(err));
      // fallback to dev behavior if plugins fail
      return siweRoutesDevFallback(fastify);
    }
  }
}

// extracted dev fallback to reuse
function siweRoutesDevFallback(fastify: FastifyInstance) {
  // register cookie plugin
  // @ts-expect-error
  fastify.register(fastifyCookie);

  const getSession = (request: any) => {
    const id = request.cookies?.siwe_session as string | undefined;
    if (!id) return null;
    return devSessionStore.get(id) || null;
  };

  const setSession = (reply: any, payload: any) => {
    const id = randomUUID();
    devSessionStore.set(id, payload);
    reply.setCookie('siwe_session', id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 });
  };

  const clearSession = (reply: any, request: any) => {
    const id = request.cookies?.siwe_session as string | undefined;
    if (id) devSessionStore.delete(id);
    reply.setCookie('siwe_session', '', { path: '/', httpOnly: true, maxAge: 0 });
  };

  fastify.post('/auth/siwe/verify', async (request: any, reply: any) => {
    const { message, signature } = request.body as { message: string; signature: string };
    try {
      const siwe = new SiweMessage(message);
      // @ts-expect-error: validate is not typed in siwe v3
      const fields = await siwe.validate(signature);
      setSession(reply, fields);
      reply.send({ ok: true, address: fields.address });
    } catch (e: any) {
      reply.status(400).send({ error: e.message });
    }
  });

  fastify.get('/auth/siwe/me', async (request: any, reply: any) => {
    const session = getSession(request);
    if (session) {
      reply.send({ authenticated: true, address: session.address });
    } else {
      reply.send({ authenticated: false });
    }
  });

  fastify.post('/auth/siwe/logout', async (request: any, reply: any) => {
    clearSession(reply, request);
    reply.send({ ok: true });
  });
}
