Admin Bot (long-polling)
========================

This is a minimal admin-bot that connects to the Telegram Bot API via long-polling and forwards admin commands to the local API.

Config (create a local `.env` in the repo root):

```
TELEGRAM_ADMIN_BOT_TOKEN=123456789:AA...your_admin_bot_token_here
TELEGRAM_ADMIN_CHAT_IDS=363048441
API_FACTORY_ADMIN_KEY=your_admin_key_here
# API_BASE=http://localhost:8787
```

Run:

```
cd apps/admin-bot
npm install
npm start
```

Notes:
- Keep tokens secret. `.env` is gitignored.
- Admin chat IDs whitelist admin access; only those IDs may execute commands.
- Commands: `/health`, `/ping`, `/metrics`, `/trigger`, `/upsert {json}`, `/echo text`, `/send <chat_id> <message>`.
