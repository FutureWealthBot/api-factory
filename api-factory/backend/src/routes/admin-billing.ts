// Stripe admin endpoints: fetch subscriptions and events
// Using CommonJS require pattern for Stripe to avoid ESM default import typing ambiguity under current TS config.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
// Stripe constructor default export returns an instance whose type is Stripe (the namespace also provides types)
// Use InstanceType to avoid "refers to a value, but is being used as a type" confusion with esModuleInterop.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe: any = STRIPE_API_KEY ? new Stripe.Stripe(STRIPE_API_KEY, { apiVersion: '2022-11-15' }) : null;

import type { FastifyPluginAsync } from 'fastify';
import { getKey, upsertKey, type KeyRecord } from '../lib/key-store.js';

const adminBilling: FastifyPluginAsync = async (fastify) => {
  // List all Stripe subscriptions (paginated, for admin)
  fastify.get('/api/admin/billing/stripe/subscriptions', async (_req, reply) => {
    if (!stripe) return reply.status(501).send({ error: 'Stripe not configured' });
    try {
      const subs = await stripe.subscriptions.list({ limit: 20 });
      return reply.send({ data: subs.data });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // List recent Stripe events (for admin audit)
  fastify.get('/api/admin/billing/stripe/events', async (_req, reply) => {
    if (!stripe) return reply.status(501).send({ error: 'Stripe not configured' });
    try {
      const events = await stripe.events.list({ limit: 20 });
      return reply.send({ data: events.data });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
  // GET -> fetch key record
  fastify.get('/api/admin/billing/key', async (request, reply) => {
    const q = (request.query as Record<string, string | undefined>) || {};
    const key = q.key;
    if (!key) return reply.status(400).send({ error: 'key required' });
    const rec = await getKey(key);
    if (!rec) return reply.status(404).send({ error: 'not_found' });
    return reply.send({ data: rec });
  });

  // POST -> upsert patch for key
  fastify.post('/api/admin/billing/key', async (request, reply) => {
    const body = (request.body as Record<string, unknown>) || {};
    const key = String(body.key || '');
    if (!key) return reply.status(400).send({ error: 'key required' });
  const patch: Partial<KeyRecord> = {};
    if (body.plan) patch.plan = String(body.plan);
    if (body.quota !== undefined) patch.quota = Number(body.quota) || 0;
  if (body.status) patch.status = String(body.status) as KeyRecord['status'];
  const updated = await upsertKey(key, patch);
    return reply.send({ data: updated });
  });
};

export default adminBilling;
