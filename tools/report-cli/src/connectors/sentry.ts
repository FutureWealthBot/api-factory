export async function gatherSentry() {
  const token = process.env.SENTRY_AUTH_TOKEN || process.env.SENTRY_TOKEN || process.env.SENTRY_DSN;
  if (!token) return { provider: 'sentry', authenticated: false };
  return { provider: 'sentry', authenticated: true, lastEvent: null };
}
