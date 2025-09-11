# User-bot

Telegram bot for user interactions with the API-Factory platform.

## Running the bot

```bash
cd apps/user-bot
npm start
```

## Testing

### Run Jest tests (unit + mocked)

```bash
cd apps/user-bot
npm install
npm test
```

### Run Jest tests in watch mode

```bash
cd apps/user-bot
npm run test:watch
```

### Run live Jest tests (requires backend running)

Live tests require a backend running at `http://localhost:3000` (or the URL specified in `API_BASE` environment variable):

```bash
cd apps/user-bot
RUN_LIVE_TESTS=1 npm run test:live:jest
```

### Run legacy node-style tests locally

```bash
cd apps/user-bot
./run-tests.sh [CONSENT_JWT_SECRET]
```

## Environment Variables

- `TELEGRAM_USER_BOT_TOKEN`: Required. Telegram bot token for user bot
- `API_BASE`: Optional. API base URL (defaults to `http://localhost:8787`)
- `TELEGRAM_ADMIN_CHAT_IDS`: Optional. Comma-separated admin chat IDs for support forwarding
- `RUN_LIVE_TESTS`: Set to `1` to enable live integration tests
- `NODE_ENV`: Set to `test` to prevent bot from starting when importing for tests
