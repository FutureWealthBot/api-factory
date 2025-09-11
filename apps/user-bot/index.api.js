// API-backed user-bot handler
const API_BASE = process.env.API_BASE || 'http://localhost:8787';

export async function apiCall(path, method = 'GET', body) {
  const url = `${API_BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts).catch(() => null);
  if (!res) return { error: 'no-response' };
  return res.json().catch(() => ({ error: 'invalid-json' }));
}

export async function handleCommandApi(chatId, text) {
  const [cmd, ...rest] = (text || '').trim().split(/\s+/);
  const arg = rest.join(' ');
  switch ((cmd || '').toLowerCase()) {
    case '/ping':
      return apiCall('/api/v1/hello/ping');
    case '/echo':
      return { echo: arg };
    case '/help':
      return { help: 'Available: /help /ping /echo <text> /support <message>' };
    default:
      return { error: 'unknown_command' };
  }
}
