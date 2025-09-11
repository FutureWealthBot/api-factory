# PR #87 — Summary: Jest tests, guarded live-tests, and CI workflow

Status: merged (squash-merged into branch `chore/upgrade-admin-vite`; feature branch deleted)

Short description
- Added Jest testing infra for `apps/user-bot` (unit + mocked API + guarded live tests).
- Added guarded live tests which only run when `RUN_LIVE_TESTS=1` and a backend is available.
- Added a lightweight GitHub Actions workflow for running the package tests in CI.

What changed (high level)
- apps/user-bot/jest.config.cjs — Jest config for ESM and node environment.
- apps/user-bot/__tests__/* — Unit, API-mock, and guarded live tests.
- apps/user-bot/index.js and index.api.js — Exported handlers made import-safe for tests.
- apps/user-bot/package.json — Added `test` and `test:live` scripts; `cross-env` added to devDependencies.
- .github/workflows/user-bot-tests.yml — CI workflow (added in PR changes).

Why
- Make user-bot codebase testable with Jest and run both unit/mocked and (opt-in) integration tests in CI.

Verification / How to run locally
1. Install dependencies (workspace root):
   - pnpm install
2. Run unit + mocked tests for user-bot:
   - cd apps/user-bot
   - npm test
3. Run guarded live integration tests (backend required; will only run when RUN_LIVE_TESTS=1):
   - cross-env RUN_LIVE_TESTS=1 npm run test:live
4. Legacy tests are kept for backwards compatibility:
   - npm run test:legacy

Known post-merge issue
- The Vercel preview deployment for the admin web failed when this branch was opened (status check: `Vercel` — failure). The PR was still mergeable and was merged; the Vercel failure is unrelated to the Jest changes in `apps/user-bot` but likely surfaced because the PR targeted `chore/upgrade-admin-vite` (admin web changes).
- Vercel link (from run): https://vercel.com/futurewealthbots-projects/api-factory-admin-web/xtmPMrrsSJ28XuWkd42gKaeXTTiz

Recommended immediate actions
- Re-run the Vercel deployment for the failing preview (via Vercel UI or re-run the commit/PR). Collect the Vercel build logs.
- If the failure persists, open an issue (template provided) with the Vercel build logs, commit SHA and the failing step.
- Locally reproduce the web build: from repo root try `pnpm --filter web build` or the repository's documented Vercel build command.

Next steps (follow-ups)
- If Vercel failure is due to Node version or missing env vars, update the Vercel project settings to match the repo's engine (Node >= 18) and required env variables.
- If tests in CI fail, inspect GitHub Actions logs (job `user-bot-tests`), copy the console output and open an issue using the CI failure template.

Contact
- If you want me to triage the failing Vercel build, paste the Vercel build log or allow me to fetch it and I will open a follow-up PR or fix.
