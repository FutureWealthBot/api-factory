import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { registerMetrics } from "./metrics.js";
import { ok, err, newRequestId } from "@api-factory/core";

const PORT = Number(process.env.PORT || 8787);
const BIND = process.env.BIND_HOST || "0.0.0.0";
const ADMIN_TOKEN = process.env.API_FACTORY_ADMIN_KEY || "dev-admin-key-change-me";

// Simple admin auth middleware
const requireAdminAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
  const authHeader = (request.headers as Record<string, string | undefined>).authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  if (token !== ADMIN_TOKEN) {
    throw new Error('Invalid admin token');
  }
};

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

// Rate limiting
await app.register(rateLimit, {
  max: 100, // requests
  timeWindow: '1 minute',
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true
  },
  errorResponseBuilder: (req, context) => {
    return err("RATE_LIMITED", `Rate limit exceeded, retry after ${Math.round(context.ttl / 1000)} seconds`, newRequestId(), {
      limit: context.max,
      ttl: context.ttl
    });
  }
});

await registerMetrics(app);

// Friendly index
app.get("/", async (req, _reply) => {
  const rid = newRequestId();
  return _reply.send(ok({
    status: "ok",
    service: "api-cli",
    endpoints: [
      { method: "GET",  path: "/_api/healthz",      desc: "Health check" },
      { method: "GET",  path: "/_api/metrics",      desc: "Prometheus metrics" },
      { method: "GET",  path: "/api/v1/hello/ping", desc: "Ping example" },
      { method: "POST", path: "/api/v1/actions",    desc: "Action dispatcher" }
    ]
  }, rid));
});


app.get("/_api/healthz", async (req, _reply) => {
  const rid = newRequestId();
  return _reply.send(ok({ status: "ok", service: "api-cli" }, rid));
});

app.get("/api/v1/hello/ping", async (req, _reply) => {
  const rid = newRequestId();
  return _reply.send(ok({ pong: true }, rid));
});

type ActionInput =
  | { action: "upsert_opportunities"; payload: Record<string, unknown> }
  | { action: "trigger_collection";  payload?: Record<string, unknown> }
  | { action: "send_telegram_alert"; payload: { chat_id?: string|number; message?: string } }
  | { action: "enqueue_trade";       payload: Record<string, unknown> };

app.post("/api/v1/actions", { preHandler: requireAdminAuth }, async (req, reply) => {
  const rid = newRequestId();
  const body = (req.body ?? {}) as Partial<ActionInput>;
  const action = body.action as ActionInput["action"] | undefined;
  const payloadObj = (body.payload ?? {}) as Record<string, unknown>;

  try {
    switch (action) {
      case "upsert_opportunities": {
        const items = Array.isArray(payloadObj.items as unknown) ? (payloadObj.items as unknown[]) : [];
        return reply.send(ok({ received: "upsert_opportunities", count: items.length }, rid));
      }
      case "trigger_collection":
        return reply.send(ok({ received: "trigger_collection", started: true }, rid));
      case "send_telegram_alert": {
            const chat_id = payloadObj.chat_id as string | number | undefined;
            const message = payloadObj.message as string | undefined;
            if (!chat_id || !message) {
              return reply.status(400).send(err("BAD_REQUEST", "chat_id and message are required", rid));
            }

            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (!token) {
              // Token not configured — respond with delivered:false but accept the request
              return reply.send(ok({ received: "send_telegram_alert", delivered: false, reason: "missing_telegram_token" }, rid));
            }

            try {
              const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
              const body = {
                chat_id: String(chat_id),
                text: String(message)
              };

              const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              });

              const data = (await res.json().catch(() => ({}))) as Record<string, unknown> | undefined;
              const delivered = res.ok && data?.ok === true;

              return reply.send(ok({ received: "send_telegram_alert", delivered, telegram: { status: res.status, ok: !!(data?.ok) } }, rid));
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : String(e);
              return reply.send(ok({ received: "send_telegram_alert", delivered: false, error: msg }, rid));
            }
      }
      case "enqueue_trade":
        return reply.send(ok({ received: "enqueue_trade", queued: true }, rid));
      default:
        return reply.status(400).send(err("UNKNOWN_ACTION", "Unsupported action", rid, { action }));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return reply.status(500).send(err("INTERNAL_ERROR", msg, rid));
  }
});

app.setNotFoundHandler((req, reply) => {
  const rid = newRequestId();
  reply.status(404).send(err("NOT_FOUND", "Route not found", rid, { method: req.method, url: req.url }));
});

app.setErrorHandler((error, req, reply) => {
  const rid = newRequestId();
  reply.status(500).send(err("INTERNAL_ERROR", error?.message ?? "Unexpected error", rid));
});

app.listen({ host: BIND, port: PORT }).then(() => {
  console.log(`[api-cli] listening on http://${BIND}:${PORT}`);
});
