const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
console.log('API BASE:', API_BASE);
export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestInit = {},
  retries = 2,
  backoffMs = 400
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    if (retries <= 0) throw err
    await new Promise(r => setTimeout(r, backoffMs))
    return apiFetch<T>(path, opts, retries - 1, backoffMs * 2)
  }
}
