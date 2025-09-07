import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { registerMetrics } from "./metrics.js";
import { ok, err, newRequestId } from "@api-factory/core";

const PORT = Number(process.env.PORT || 8787);
const BIND = process.env.BIND_HOST || "0.0.0.0";
const ADMIN_TOKEN = process.env.API_FACTORY_ADMIN_KEY || "dev-admin-key-change-me";

// Simple admin auth middleware
const requireAdminAuth = async (request: any, reply: any) => {
  const authHeader = request.headers.authorization;
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
app.get("/", async (req, reply) => {
  const rid = newRequestId();
  return reply.send(ok({
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


app.get("/_api/healthz", async (req, reply) => {
  const rid = newRequestId();
  return reply.send(ok({ status: "ok", service: "api-cli" }, rid));
});

app.get("/api/v1/hello/ping", async (req, reply) => {
  const rid = newRequestId();
  return reply.send(ok({ pong: true }, rid));
});

type ActionInput =
  | { action: "upsert_opportunities"; payload: Record<string, unknown> }
  | { action: "trigger_collection";  payload?: Record<string, unknown> }
  | { action: "send_telegram_alert"; payload: { chat_id?: string|number; message?: string } }
  | { action: "enqueue_trade";       payload: Record<string, unknown> };

app.post("/api/v1/actions", { preHandler: requireAdminAuth }, async (req, reply) => {
  const rid = newRequestId();
  const body = (req.body ?? {}) as Partial<ActionInput>;
  const action = (body as any).action as ActionInput["action"] | undefined;
  const payload = (body as any).payload ?? {};

  try {
    switch (action) {
      case "upsert_opportunities":
        return reply.send(ok({ received: "upsert_opportunities", count: Array.isArray((payload as any).items) ? (payload as any).items.length : 0 }, rid));
      case "trigger_collection":
        return reply.send(ok({ received: "trigger_collection", started: true }, rid));
      case "send_telegram_alert": {
        const { chat_id, message } = payload as any;
        if (!chat_id || !message) {
          return reply.status(400).send(err("BAD_REQUEST", "chat_id and message are required", rid));
        }
        return reply.send(ok({ received: "send_telegram_alert", delivered: true }, rid));
      }
      case "enqueue_trade":
        return reply.send(ok({ received: "enqueue_trade", queued: true }, rid));
      default:
        return reply.status(400).send(err("UNKNOWN_ACTION", "Unsupported action", rid, { action }));
    }
  } catch (e: any) {
    return reply.status(500).send(err("INTERNAL_ERROR", e?.message ?? "Unhandled", rid));
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
