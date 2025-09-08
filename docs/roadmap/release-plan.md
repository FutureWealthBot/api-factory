```markdown
# Release plan — v1.0.0-beta

**Generated:** 2025-09-08

Summary
- Beta snapshot shows core modules ready: SDK Templates, Marketplace, Billing, Tiers, Compliance, Admin UI.
- Several features scaffolded (web3 billing, marketplace, plugins, SDK voting); marketing automation scaffold exists but requires gated PR/workflow permissions.

Top priorities
- Prepare production secrets & env (DevOps) — High
  - Provision secrets in a secret manager and reference them from deploy configs.
- Harden `admin-api` (Backend) — High
  - Add auth, rate-limiting, and integration tests before public exposure.
- Update deployment configs & deploy to beta/staging (DevOps/Eng) — High
  - Review Dockerfiles, `docker-compose.yml`, Vercel configs; set ports, resource limits, domains.
- Smoke test major flows (QA/Fullstack) — High
  - Login, API publish, billing flow, marketplace purchase/listing, plugin onboarding.

Quick checklist (for the next 72 hours)
- [ ] Add production secrets to secret manager and wire `.env.production` (DevOps).
- [ ] Add basic admin-api auth + rate-limiting and run integration tests (Backend).
- [ ] Review & update Docker/Vercel deployment configs (DevOps).
- [ ] Deploy to beta/staging and validate services are reachable (DevOps/Eng).
- [ ] Run smoke tests and file critical bug tickets (QA).
- [ ] Tag release `v1.0.0-beta` after smoke test sign-off (Release lead).
- [ ] Publish beta snapshot and onboarding notes to `/docs/roadmap/` (Docs/PM).

Smoke test checklist (minimal)
- Auth: create account, sign in, sign out
- API flow: publish an API, call endpoint, validate responses and quotas
- Billing: create plan, subscribe, simulate invoice/payment
- Marketplace: list an item, purchase or install, confirm entitlement
- Admin: create marketing campaign (dry-run), ensure PR creation is gated

Risks & mitigation
- Secrets misconfiguration — use a secret manager and avoid committing `.env` files.
- Admin-api exposed without auth — keep behind auth and rate limits; block external access until hardened.
- Workflow token scope for marketing PRs — prefer a scoped PAT or use Actions with least privilege.

Suggested owners
- DevOps: prepare secrets, update deploys, run beta deploy
- Backend: admin-api hardening, integration tests
- QA/Fullstack: smoke tests and bug triage
- Release lead / PM: tagging and announcements

Estimated timeline
- Beta deploy + smoke tests: 2–5 days (with a small focused team)
- Harden admin and observability: +1 week

Next steps I can do for you
- Open a PR with this file (I will do that now).
- Create a runnable smoke-test script (curl/postman collection).
- Generate a deploy-to-beta runbook with commands.

---
*File: `docs/roadmap/release-plan.md`*
```
