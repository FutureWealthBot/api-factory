import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { upsertKey } from '../lib/key-store.js';
import { getPlanInfo } from '../lib/plans.js';
import Stripe from 'stripe';

export default async function stripeWebhookRoutes(fastify: FastifyInstance) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const stripeKey = process.env.STRIPE_API_KEY || '';
  const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15' }) : null;

  fastify.post('/api/stripe/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let event: { type?: string; data?: { object?: Record<string, unknown> } } | null = null;

      if (secret && stripe) {
        // Verify signature using raw body
        const sig = (request.headers as Record<string, unknown>)['stripe-signature'] as string | undefined;
        const raw = (request.raw as unknown) as { body?: Buffer };
        let payload = raw && raw.body ? raw.body : undefined;
        // fallback: if raw body isn't present (tests or some parsers), try request.body
        if (!payload) {
          const b = (request.body as unknown) as unknown;
          if (typeof b === 'string') payload = Buffer.from(b as string);
          else if (b && typeof b === 'object') payload = Buffer.from(JSON.stringify(b));
          else if (Buffer.isBuffer(b)) payload = b as Buffer;
        }
        if (!payload || !sig) {
          reply.status(400).send({ error: 'Missing payload or stripe signature' });
          return;
        }
        try {
          const constructed = stripe.webhooks.constructEvent(payload, sig, secret);
          event = constructed as unknown as { type?: string; data?: { object?: Record<string, unknown> } };
  } catch {
          reply.status(400).send({ error: 'Invalid signature' });
          return;
        }
      } else {
        // dev fallback: accept parsed JSON body
        event = (request.body as unknown) as { type?: string; data?: { object?: Record<string, unknown> } };
      }

      // handle a few event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data?.object as Record<string, unknown> | undefined;
          const apiKey = session && (session['client_reference_id'] as string | undefined);
          if (apiKey) {
            const plan = 'starter';
            const p = getPlanInfo(plan);
            await upsertKey(apiKey, { status: 'active', plan: p.id, quota: p.quota });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data?.object as Record<string, unknown> | undefined;
          const apiKey = sub && ((sub['metadata'] as Record<string, unknown> | undefined)?.['api_key'] as string | undefined);
          if (apiKey) {
            const status = (sub && (sub['status'] as string | undefined)) === 'active' ? 'active' : (sub && (sub['status'] as string | undefined)) === 'past_due' ? 'past_due' : 'suspended';
            let planName = 'unknown';
            const items = sub && (sub['items'] as Record<string, unknown> | undefined);
            if (items) {
              const dataArr = items['data'] as Array<Record<string, unknown>> | undefined;
              if (Array.isArray(dataArr) && dataArr[0]) {
                planName = (dataArr[0]['plan'] as Record<string, unknown> | undefined)?.['nickname'] as string | undefined || 'unknown';
              }
            }
            const p = getPlanInfo(planName);
            await upsertKey(apiKey, { status, plan: p.id, quota: p.quota });
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data?.object as Record<string, unknown> | undefined;
          const apiKey = invoice && ((invoice['metadata'] as Record<string, unknown> | undefined)?.['api_key'] as string | undefined);
          if (apiKey) {
            await upsertKey(apiKey, { status: 'past_due' });
          }
          break;
        }
        default:
          // ignore others for now
          break;
      }

      reply.send({ ok: true });
  } catch {
      reply.status(500).send({ error: 'webhook processing error' });
    }
  });
}
