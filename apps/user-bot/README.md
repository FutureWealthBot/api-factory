User-bot test runner

Run legacy node-style tests locally:

```bash
cd apps/user-bot
./run-tests.sh [CONSENT_JWT_SECRET]
```

Run Jest tests (unit + mocked):

```bash
cd apps/user-bot
npm install
npm test
```

To run live Jest tests (backend must be running):

```bash
cd apps/user-bot
RUN_LIVE_TESTS=1 npm run test:live:jest
```
