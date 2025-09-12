# Admin API Analytics

This small module stores analytics events to `data/analytics.json` and exposes a summary endpoint.

Endpoints:
- `POST /api/analytics/event` — record an event (`{ type: string, payload: object }`)
- `GET /api/analytics/summary` — returns a simple aggregation of events

Run (dev):

```bash
cd packages/admin-api
pnpm install
pnpm dev
```
