#!/usr/bin/env bash
# run-admin-web-e2e.sh
# 1. Build all packages
# 2. Start admin-web dev server in background
# 3. Wait for server to be ready
# 4. Run Playwright E2E tests
# 5. Kill dev server

set -e

pnpm build

pnpm --filter admin-web dev &
DEV_PID=$!

./scripts/wait-for-admin-web.sh

pnpm --filter admin-web test:playwright || {
  echo "E2E tests failed";
  kill $DEV_PID;
  exit 1;
}

kill $DEV_PID
