#!/usr/bin/env bash
set -euo pipefail

# Helper to run legacy node-style tests for the user-bot locally.
# Usage: ./run-tests.sh [CONSENT_JWT_SECRET]

CONSENT=${1:-dev-secret}

echo "Running legacy tests: unit + api mocks"
node test.js
node test-api.js

echo "Running live test (requires backend at http://localhost:3000)"
CONSENT_JWT_SECRET=${CONSENT} node test-api-live.js

echo "Running echo and negative tests"
node test-api-echo.js
node test-api-negative.js

echo "All legacy tests executed"
