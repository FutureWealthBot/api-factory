 # API-Factory — MVP Next Steps (Paste-Ready for GitHub Copilot)

 _Target: ship an end-to-end, billable MVP with health/ping/echo + guarded Actions + Stripe + usage + CI._

 ---

 ## 0) Definition of MVP (Scope Lock)
 - [ ] Public API: `/_api/healthz`, `/api/v1/hello/ping`, `/api/v1/hello/echo`
 - [ ] Guarded Actions: `POST /api/v1/actions` (Bearer/x-api-key, rate-limited)
 - [ ] Monetization (Stripe): plan → key lifecycle (issue/suspend/revoke) via webhooks
 - [ ] Usage: per-key counters (requests, status), Prometheus scrape + simple Admin charts
 - [ ] CI/CD: lint + typecheck + test + build on PR
 - [ ] Admin Web: Health, Ping, Actions console, Rate badge, Metrics (parsed text), Key status

 ---

 ## 1) CI/CD (close the red gap first)
 - [ ] Add `.github/workflows/ci.yml` with matrix:
       - workspaces: `apps/api-cli`, `apps/admin-web`, `packages/core`
       - steps: `pnpm install`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test --if-present`, `pnpm -r build`
 - [ ] Require checks on `main` branch (GitHub settings)

 **Copilot prompt tip:** “Create a GitHub Actions workflow `ci.yml` for a pnpm monorepo (apps/*, packages/*) running lint, typecheck, test, build.”

 ---

 ## 2) Stripe Monetization (minimal but real)
 - [ ] Server: Stripe webhook endpoint `/api/stripe/webhook` (events: `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`)
 - [ ] Map plan → quota & rate caps; write key to store (Supabase or KV)
 - [ ] Admin Web: show billing status + current quota, expose “Test Webhook” button in dev

 **Copilot prompt:** “Add a Fastify route `/api/stripe/webhook` that verifies signatures and updates API key status and plan quota.”

 ---

 ## 3) API Key Guard + Rate Limit (production posture)
 - [ ] Constant-time API key guard (Bearer + `x-api-key`)
 - [ ] `@fastify/rate-limit` per key (fallback per IP), return `RATE_LIMITED` JSON
 - [ ] Admin Web: rate badge (remaining/limit/reset) + toast on 401/429 (already partially implemented)

 **Copilot prompt:** “Wire per-key rate limiting on `/api/v1/actions` using `@fastify/rate-limit` and a keyGenerator that prefers the API key.”

 ---

 ## 4) Usage Tracking & Metrics
 - [ ] Fastify `onResponse` hook → enqueue usage events `{api_key, route, status, bytes, ts}`
 - [ ] Batch insert to `usage_events` (Supabase table already defined)
 - [ ] Admin Web: Metrics card parses Prometheus text; add `req/sec` + status bars (done); show last 50 events (simple table)

 **Copilot prompt:** “Create a `usage.ts` batching queue that inserts rows to Supabase every second, with retry on error.”

 ---

 ## 5) Admin Web polish (operator-ready)
 - [ ] Actions Console: trigger sample actions, show last response, disable buttons when out of quota
 - [ ] Metrics: auto-refresh toggle + interval, latency p50/p90/p99 if buckets exist
 - [ ] Keys panel (MVP): read-only view of current key + plan + quota (data from backend endpoint)

 **Copilot prompt:** “Add a React panel that fetches `/api/admin/keys/me` and shows plan/quota/status, with simple error states.”

 ---

 ## 6) OpenAPI & SDK
 - [ ] Ensure `openapi.yaml` has health/ping/echo/actions; mark `Authorization` header
 - [ ] `pnpm sdk:gen && pnpm sdk:build` for `@api-factory/sdk-ts`
 - [ ] Use the SDK in Admin Web for `/ping` (smoke test)

 **Copilot prompt:** “Extend openapi.yaml to include `/api/v1/actions` with union request schema and `Authorization` header.”

 ---

 ## 7) Release & Ops
 - [ ] Dockerfiles validated (`api`, `web`), `docker compose up --build` happy path
 - [ ] ENV checklist: `API_FACTORY_ADMIN_KEY`, `STRIPE_WEBHOOK_SECRET`, Supabase keys, CORS allowlist
 - [ ] README quickstart: dev, test, build, Docker, ENV

 **Copilot prompt:** “Write a ‘Quickstart’ section showing dev (`pnpm dev`), ENV variables, and Docker compose usage.”

 ---

 ## Stretch (post-MVP)
 - [ ] Marketplace MVP: `/marketplace/publish` + `/discover`, Admin publish form + list
 - [ ] Tiered API validation (Core/Standard/Advanced/Enterprise) on publish
 - [ ] SDK Templates upload/browse (deferred until after MVP)

 ---

 ### Done Criteria (MVP)
 - All CI checks green on PR
 - Stripe can issue/suspend keys; Actions route enforces key + rate + quota
 - Admin Web shows health, ping, actions, rate badge, metrics; displays key/plan
 - OpenAPI + SDK generated; Docker images run locally

---

## Next 7 days (prioritized)

Focus: ship a small, testable beta that demonstrates billing + guarded actions + basic observability.

- [ ] DevOps: Provision production secrets in a secret manager and wire a `.env.production` (owner: @devops)
      - Acceptance: deploy job can read secrets and a deploy to a staging target succeeds (smoke health checks return 200).

- [ ] Backend: Add basic auth and per-key rate-limiting to `admin-api` and the `POST /api/v1/actions` route (owner: @backend)
      - Acceptance: calls without a valid key return 401; 429 is returned when quota exceeded; unit/integration tests cover both.

- [ ] Billing: Add Stripe webhook verification + small handler to map a plan to quota and persist to key store (owner: @billing)
      - Acceptance: a test webhook updates plan/quota in the store; no secret left in repo.

- [ ] QA/Fullstack: Run smoke tests against staging (owner: @qa)
      - Acceptance: basic flows pass (health, ping, actions, billing webhook flow), and failures are triaged into issues.

- [ ] Admin Web: Surface a read-only Keys panel and a Billing status card (owner: @web)
      - Acceptance: Admin shows current key, plan, and quota; errors are shown when backend returns 401/429.

Notes and small intents
- Keep changes minimal and behind feature flags where possible so we can roll forward or back.
- Prefer testing with a shared staging Stripe webhook secret for this sprint; rotate after beta.
- Add small curl-based smoke-test scripts to `/scripts/` for quick validation during deploys.

Quick verification checklist (smoke)
- curl /_api/healthz -> 200
- curl /api/v1/hello/ping -> 200
- POST /api/v1/actions with invalid key -> 401
- POST /api/v1/actions with valid key until quota -> expected responses then 429
- POST mock Stripe webhook -> backend updates key quota

---

If you'd like, I can: open a PR with these edits, create the smoke-test curl scripts under `/scripts/`, or generate the CI workflow to run the smoke checks in staging. Tell me which and I'll proceed.
