const TOKEN = process.env.TELEGRAM_USER_BOT_TOKEN;
const API_BASE = process.env.API_BASE || 'http://localhost:8787';
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

if (!TOKEN) {
  console.error('TELEGRAM_USER_BOT_TOKEN not set. Set it in environment to run the user bot.');
  process.exit(1);
}

const apiCall = async (path, method = 'GET', body) => {
  const url = `${API_BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json().catch(() => ({ error: 'invalid-json' }));
};

const sendTelegram = async (chat_id, text) => {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: String(chat_id), text })
  });
  return res.json().catch(() => ({ ok: false }));
};

const handleCommand = async (chatId, text) => {
  const [cmd, ...rest] = (text || '').trim().split(/\s+/);
  const arg = rest.join(' ');
  switch ((cmd || '').toLowerCase()) {
    case '/help':
      return { help: 'Available: /help /ping /echo <text> /support <message>' };
    case '/ping':
      return apiCall('/api/v1/hello/ping');
    case '/echo':
      return { echo: arg };
    case '/support':
      // forward to admin via API action
      if (!arg) return { error: 'usage: /support <message>' };
      await apiCall('/api/v1/actions', 'POST', { action: 'send_telegram_alert', payload: { chat_id: ADMIN_IDS[0], message: `[support from ${chatId}] ${arg}` } });
      return { sent: true };
    default:
      return { error: 'unknown_command', help: 'Use /help' };
  }
};

// long-poll loop (minimal)
let offset = 0;
const poll = async () => {
  try {
    const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?timeout=20&offset=${offset}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!data || !data.result) return;
    for (const upd of data.result) {
      offset = Math.max(offset, (upd.update_id || 0) + 1);
      const msg = upd.message || upd.edited_message;
      if (!msg) continue;
      const chatId = msg.chat?.id;
      const text = msg.text || '';
      console.log('user incoming', chatId, text.slice(0,200));
      const result = await handleCommand(chatId, text);
      await sendTelegram(chatId, JSON.stringify(result).slice(0,4000));
    }
  } catch (e) {
    console.error('poll error', e?.message || e);
  }
};

// Only start polling if not in test mode
if (process.env.NODE_ENV !== 'test') {
  console.log('user-bot starting (long-poll)');
  setInterval(poll, 1000);
}

// export for testing
export { handleCommand };
