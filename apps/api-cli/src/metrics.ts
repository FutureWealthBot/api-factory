import client from "prom-client";
import type { FastifyInstance } from "fastify";

export async function registerMetrics(app: FastifyInstance) {
  // Default Node process metrics
  client.collectDefaultMetrics();

  // HTTP metrics
  const httpReqs = new client.Counter({
    name: "http_requests_total",
    help: "Count of HTTP requests",
    labelNames: ["method", "route", "status"] as const
  });

  app.addHook("onResponse", async (req, reply) => {
    // Fastify v5: routerPath is not available. Use routeOptions?.url or req.url
    const route = (req.routeOptions && req.routeOptions.url) || req.url;
    httpReqs.inc({ method: req.method, route, status: String(reply.statusCode) });
  });

  app.get("/_api/metrics", async (_req, reply) => {
    reply.header("Content-Type", client.register.contentType);
    return client.register.metrics();
  });
}
