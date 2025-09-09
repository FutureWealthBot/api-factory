export async function gatherStripe() {
  const key = process.env.STRIPE_KEY;
  if (!key) return { provider: 'stripe', authenticated: false };
  // avoid calling Stripe API in this run; return placeholder
  return { provider: 'stripe', authenticated: true, revenue30d: null };
}
