export async function handleCommand(chatId, text) {
  const cmd = (text || '').trim().split(/\s+/)[0] || '';
  if (cmd === '/ping') return { pong: true };
  if (cmd === '/echo') return { echo: (text || '').split(/\s+/).slice(1).join(' ') };
  if (cmd === '/help') return { help: 'Available: /help /ping /echo <text>' };
  return { error: 'unknown_command' };
}
