# API-Factory — Environment Variables (MVP)

This document lists environment variables used across the repo and indicates which are required for a functional MVP (backend, admin web, billing, and usage). Use this as the single source of truth when creating `.env` for local development or configuring CI/production.

Notes
- Secrets must not be committed. Use your platform's secret store (GitHub Secrets, Vercel, Fly, etc.).
- Many vars are optional for local dev and have safe defaults (see `.env.example`).

Core (runtime)
- API_FACTORY_ADMIN_KEY (required for admin endpoints)
  - Description: Shared admin key for dev/admin scripts and bots.
  - Example: a long random string. Required for admin endpoints in MVP.

- PORT / API_PORT (optional)
  - Description: Server port. Default: 8787 or 3000 depending on app.

- BIND_HOST (optional)
  - Description: Host bind address (default 0.0.0.0).

Consent/JWT
- CONSENT_JWT_SECRET_FILE (optional)
  - Description: Path to a file containing the public key or secret used to verify consent JWTs.
  - If unset, `CONSENT_JWT_SECRET` may be used for dev.

- CONSENT_JWT_SECRET (dev fallback)

Monetization / Stripe
- STRIPE_KEY (required for Stripe API operations)
  - Description: Secret API key for creating customers/checkout (server-side).

- STRIPE_WEBHOOK_SECRET (required for webhook verification)
  - Description: Signing secret for Stripe webhook events.

Supabase / Storage / Usage
- SUPABASE_URL (required if using Supabase sink)
- SUPABASE_SERVICE_KEY (required if using Supabase sink for server-side writes)
- SUPABASE_ANON_KEY (optional, for browser/client use)
  - Usage: usage batching and storing key/usage state in Supabase for MVP.

Usage & debugging
- USAGE_EVENTS_PATH (optional)
  - Description: File path used by the dev NDJSON sink. Default `/tmp/api-factory-usage.ndjson`.

Third-party connectors & bots
- TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_BOT_TOKEN / TELEGRAM_USER_BOT_TOKEN (optional)
  - Tokens for Telegram bots used by admin/user bots.

- TELEGRAM_ADMIN_CHAT_IDS (optional)
  - Comma-separated list of admin chat ids for bot notifications.

- GITHUB_TOKEN (CI / optional locally)
  - Used by scripts that interact with GitHub (create labels, CI). GitHub Actions injects this automatically in workflows.

- VERCEL_TOKEN (optional)
  - For Vercel integrations in `tools/report-cli`.

- SENTRY_AUTH_TOKEN or SENTRY_TOKEN or SENTRY_DSN (optional)
  - For Sentry integration.

Feature flags / dev settings
- USE_DEV_FALLBACKS
  - If set to `0` attempts to use the real plugin (e.g., `@fastify/static`); default is dev-friendly fallbacks.

Rate limiting / actions
- ACTIONS_RATE_MAX / ACTIONS_RATE_WINDOW
  - Tune rate limiter for Actions route. Defaults are set in README/config examples.

CI / Release
- GHCR / Docker: uses GitHub Actions and the automatically-provided `GITHUB_TOKEN` in workflows for GHCR login.

Security & best practices
- Store secrets in GitHub Secrets / Vercel environment variables or your chosen secret manager.
- Never put production keys in `.env.example` or commit them.

What to set for a functional MVP (minimum)
1. `API_FACTORY_ADMIN_KEY` — a long random secret for admin actions.
2. `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` — or leave unset to use NDJSON local sink.
3. `STRIPE_KEY` and `STRIPE_WEBHOOK_SECRET` — for real monetization tests (optional for local dev).
4. `GITHUB_TOKEN` — only needed for label/script actions when run locally; CI provides this automatically.

If you prefer a fully self-contained local dev experience without external services, you can run with only `API_FACTORY_ADMIN_KEY` set and rely on file-backed usage sink and dev fallbacks.
