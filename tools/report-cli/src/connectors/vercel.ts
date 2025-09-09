export async function gatherVercel() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { provider: 'vercel', authenticated: false };
  try {
    // use global fetch (Node 18+). Avoid introducing node-fetch dependency.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (globalThis as any).fetch('https://api.vercel.com/v6/deployments?limit=1', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { provider: 'vercel', authenticated: true, error: `status ${res.status}` };
  const j = (await res.json()) as Record<string, unknown> | undefined;
    const latest = j && (j['deployments'] as Array<Record<string, unknown>> | undefined)?.[0];
    return { provider: 'vercel', authenticated: true, latestDeployment: latest?.created_at ? new Date((latest.created_at as number) * 1000).toISOString() : undefined, details: latest };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { provider: 'vercel', authenticated: true, error: msg };
  }
}
