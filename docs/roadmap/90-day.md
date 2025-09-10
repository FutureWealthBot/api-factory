90-Day MVP Roadmap
===================

Summary
-------
This 90-day plan targets a minimal, billable MVP for API-Factory: public health/ping APIs, guarded Actions with API-key auth and rate-limits, Stripe monetization with plan→quota mapping, basic usage metrics (Prometheus), and a minimal Admin UI for key and billing visibility.

Owners (suggested)
- Backend: @backend-owner
- Billing: @billing-owner
- Admin UI: @frontend-owner
- Infra / SRE: @infra-owner
- Product / Release: @pm-owner

Milestones
----------

0–30 days — End-to-end loop (P0)
- Implement endpoints: `/_api/healthz`, `/api/v1/hello/ping`, `/api/v1/hello/echo` (done in branch).  
- Implement `POST /api/v1/actions` scaffold with auth middleware (API key) and simple rate-limit.  
- Add Stripe webhook stub and local test flow.  
- Expose Prometheus metrics endpoint and add a basic Admin health/usage page.  
- Add CI skeleton for lint/typecheck/tests.

Acceptance (30d): manual end-to-end test: create key → call action → observe quota/metrics; CI runs on PRs.

31–60 days — Persist and stabilize (P1)
- Persist keys & usage counters (Postgres/Redis).  
- Harden auth endpoint and key lifecycle endpoints (issue/suspend/revoke).  
- Add integration tests for webhook and action flows.  
- Add Prometheus dashboards and alert rules.

Acceptance (60d): integration tests pass in CI; persistence across restarts; alerts fire on defined thresholds.

61–90 days — Beta rollout (P1)
- Deploy to staging and run full smoke tests.  
- Billing reconciliation and retry logic for invoice failures.  
- Admin UI: billing view and test-webhook button in dev.  
- Onboard small pilot group, collect feedback, and prepare release notes.

Acceptance (90d): staged beta sign off, pilot onboarding started, release notes published.

Key risks & mitigations
- Secrets leakage: never commit keys; use secret stores and guardrails (automation PRs require human review).  
- Webhook idempotency: implement idempotent handlers and reconciliation jobs.  
- Scaling counters: use Redis or batched aggregation; benchmark early.

Immediate actions (ready-to-run issue commands)
--------------------------------------------
Below are suggested `gh issue create` commands you can paste locally to create the issues and attach them to the "MVP — 90 days" milestone. Adjust assignees and labels as needed.

1) Implement health/ping/echo endpoints + auth middleware

```bash
gh issue create --title "Implement health/ping/echo endpoints + auth middleware" \
  --body "Implement endpoints: /_api/healthz, /api/v1/hello/ping, /api/v1/hello/echo. Add simple API-key auth middleware and tests. Acceptance: inject tests pass and endpoints respond 200." \
  --label mvp,backend,tests --milestone "MVP — 90 days"
```

2) Implement POST /api/v1/actions + rate-limit enforcement

```bash
gh issue create --title "Implement POST /api/v1/actions + rate-limit enforcement" \
  --body "Add guarded Actions endpoint with API key/Bearer auth and per-key rate limiting. Include logging and tests. Acceptance: rate limit enforced in tests." \
  --label mvp,backend
```

3) Add Stripe webhook endpoint + plan→quota logic (idempotent)

```bash
gh issue create --title "Add Stripe webhook endpoint + plan→quota logic (idempotent)" \
  --body "Implement Stripe webhook handler for checkout.session.completed, customer.subscription.updated, invoice.payment_failed. Map plans to quotas and update key state. Ensure idempotent processing and tests for webhook handling." \
  --label mvp,billing,backend
```

4) Add Admin pages: health, keys, billing status (basic)

```bash
gh issue create --title "Add Admin pages: health, keys, billing status (basic)" \
  --body "Add minimal Admin UI pages to view health, list keys and show billing status. Provide ability to revoke/suspend keys. Acceptance: pages render and show sample data." \
  --label mvp,admin,frontend
```

5) Add persistent key store & usage counters (Postgres/Redis)

```bash
gh issue create --title "Add persistent key store & usage counters (Postgres/Redis)" \
  --body "Persist API keys and usage counters in a durable store (Postgres or Redis). Provide migration or schema. Acceptance: keys persist across restarts and usage increments stored." \
  --label mvp,infra,backend
```

6) Add Prometheus scrape + dashboard and basic alerts

```bash
gh issue create --title "Add Prometheus scrape + dashboard and basic alerts" \
  --body "Expose /metrics, create Prometheus job/scrape config and a basic Grafana dashboard or static charts; add alert rules for high error rate or quota exhaustion." \
  --label mvp,infra
```

7) Add CI workflow ci.yml and require checks on main

```bash
gh issue create --title "Add CI workflow ci.yml and require checks on main" \
  --body "Create `.github/workflows/ci.yml` to run lint, typecheck, tests, and builds across packages. Ensure CI is required on main branch protection. Acceptance: CI runs on PRs and provides status checks." \
  --label mvp,ci
```

8) Run security checklist (secrets, tokens, endpoint auth)

```bash
gh issue create --title "Run security checklist (secrets, tokens, endpoint auth)" \
  --body "Conduct a quick security checklist: ensure no secrets in repo, require secret store for tokens, validate auth on endpoints, and set up basic audit logging. Assign owner for follow-up." \
  --label mvp,security
```

9) Docs: add `docs/roadmap/90-day.md` (this file)

```bash
gh issue create --title "Docs: add docs/roadmap/90-day.md" \
  --body "Add a one-page 90-day roadmap under docs/roadmap/90-day.md summarizing milestones and owners. Acceptance: file added and linked from README." \
  --label mvp,docs
```

Notes
-----
- Adjust assignees in each `gh issue create` command (add `--assignee <user>` as needed).  
- If the milestone doesn't exist yet, create it in the GitHub UI or run:  
  `gh milestone create "MVP — 90 days" --description "Milestone for MVP 90-day plan"`  
- The `backend-tests` CI workflow will run on PRs touching `api-factory/backend/**` and report status checks.

If you want, I can run these `gh issue create` commands for you (I attempted earlier but they didn't appear to create issues in this environment). If you prefer, paste the commands into your terminal and they will create the issues and attach them to the milestone.
