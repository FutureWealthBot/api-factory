// use global fetch available in Node 18+
import readline from 'readline';

const TOKEN = process.env.TELEGRAM_ADMIN_BOT_TOKEN;
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const API_BASE = process.env.API_BASE || 'http://localhost:8787';

if (!TOKEN) {
  console.error('TELEGRAM_ADMIN_BOT_TOKEN not set. Set it in environment to run the admin bot.');
  process.exit(1);
}

const apiCall = async (path, method = 'GET', body) => {
  const url = `${API_BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.API_FACTORY_ADMIN_KEY || 'dev-admin-key-change-me'}` } };
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
  const [cmd, ...rest] = text.trim().split(/\s+/);
  const arg = rest.join(' ');
  switch ((cmd || '').toLowerCase()) {
    case '/health':
      return apiCall('/_api/healthz');
    case '/ping':
      return apiCall('/api/v1/hello/ping');
    case '/metrics':
      return apiCall('/_api/metrics');
    case '/trigger':
      return apiCall('/api/v1/actions', 'POST', { action: 'trigger_collection' });
    case '/upsert':
      try {
        const payload = JSON.parse(arg || '{}');
        return apiCall('/api/v1/actions', 'POST', { action: 'upsert_opportunities', payload });
      } catch {
        return { error: 'invalid-json-payload' };
      }
    case '/echo':
      return apiCall('/api/v1/hello/echo', 'POST', { from: 'admin-bot', text: arg });
    case '/send':
      // /send <chat_id> <message>
      {
        const parts = arg.split(' ');
        const to = parts.shift();
        const message = parts.join(' ');
        if (!to || !message) return { error: 'usage: /send <chat_id> <message>' };
        return apiCall('/api/v1/actions', 'POST', { action: 'send_telegram_alert', payload: { chat_id: to, message } });
      }
    default:
      return { error: 'unknown_command', help: 'Available: /health /ping /metrics /trigger /upsert {json} /echo text /send <chat_id> <message>' };
  }
};

// Simple long-poll loop using getUpdates
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
      console.log('incoming', chatId, text.slice(0, 200));
      if (ADMIN_IDS.length && !ADMIN_IDS.includes(String(chatId))) {
        console.log('reject non-admin', chatId);
        await sendTelegram(chatId, 'Unauthorized for admin commands.');
        continue;
      }
      const result = await handleCommand(chatId, text);
      const reply = typeof result === 'string' ? result : JSON.stringify(result, null, 2).slice(0, 4000);
      await sendTelegram(chatId, `Result:\n${reply}`);
    }
  } catch (_e) {
    console.error('poll error', _e?.message || _e);
  }
};

console.log('admin-bot starting (long-poll). Admin IDs:', ADMIN_IDS);
setInterval(poll, 1000);

// small REPL for manual commands
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.setPrompt('admin-bot> ');
rl.prompt();
rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) { rl.prompt(); return; }
  if (trimmed === 'exit') process.exit(0);
  const res = await handleCommand(ADMIN_IDS[0] || 'console', trimmed);
  console.log(res);
  rl.prompt();
});

// export for programmatic testing
export { handleCommand };
