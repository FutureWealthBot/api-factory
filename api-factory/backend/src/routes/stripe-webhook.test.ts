import Fastify from 'fastify';
import type { FastifyPluginAsync } from 'fastify';
import stripeWebhookRoutes from './stripe-webhook.js';

describe('stripe webhook route', () => {
  it('accepts dev fallback unsigned JSON', async () => {
  const fastify = Fastify({ logger: false });
  // register plugin with a proper Fastify plugin type to avoid using `any`
  await fastify.register((stripeWebhookRoutes as unknown) as FastifyPluginAsync);
    const res = await fastify.inject({ method: 'POST', url: '/api/stripe/webhook', payload: { type: 'checkout.session.completed', data: { object: { client_reference_id: 'test-key' } } } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).ok).toBe(true);
    await fastify.close();
  });

  it('rejects missing signature when secret is set', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_API_KEY = 'sk_test';
  const fastify = Fastify({ logger: false });
  await fastify.register((stripeWebhookRoutes as unknown) as FastifyPluginAsync);
    const res = await fastify.inject({ method: 'POST', url: '/api/stripe/webhook', payload: { foo: 'bar' } });
    expect(res.statusCode).toBe(400);
    await fastify.close();
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_API_KEY;
  });

  it('accepts signed event when constructEvent returns valid event', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_API_KEY = 'sk_test';
    // Mock Stripe constructEvent
  // import stripe at runtime but avoid depending on Stripe types in the test compile step
  const stripeModule = (await import('stripe')) as unknown as { default: { prototype: { webhooks: { constructEvent: (...args: unknown[]) => unknown } } } };
    const orig = stripeModule.default.prototype.webhooks.constructEvent;
    // mock constructEvent and use unused-arg prefix to satisfy lint rules
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - runtime monkeypatch for testing
    stripeModule.default.prototype.webhooks.constructEvent = (_payload: Buffer, _sig: string, _secret: string) => {
      return { type: 'invoice.payment_failed', data: { object: { metadata: { api_key: 'signed-key' } } } };
    };

  const fastify = Fastify({ logger: false });
  await fastify.register((stripeWebhookRoutes as unknown) as FastifyPluginAsync);
    const payload = JSON.stringify({ type: 'invoice.payment_failed', data: { object: { metadata: { api_key: 'signed-key' } } } });
    const res = await fastify.inject({ method: 'POST', url: '/api/stripe/webhook', payload, headers: { 'stripe-signature': 't=1,v1=signature' } });
    expect(res.statusCode).toBe(200);

    // restore
  // restore
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  stripeModule.default.prototype.webhooks.constructEvent = orig;
    await fastify.close();
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_API_KEY;
  });
});

export {};
