echo "Running smoke tests against $BASE_URL"
#!/usr/bin/env bash
# Quick smoke tests for API-Factory MVP (local/staging)
# Usage: ./scripts/smoke-tests.sh [WEB_BASE_URL] [API_BASE_URL]
# If the web server proxies /_api to the API, you can just pass the web URL.

set -euo pipefail
WEB_BASE=${1:-http://localhost:3000}
API_BASE=${2:-}

echo "Running smoke tests: web=$WEB_BASE api=${API_BASE:-<auto-detect>}"

echo -n "(web) check root / -> "
if curl -fsS "$WEB_BASE/" >/dev/null; then
  echo "OK"
else
  echo "FAIL (web root unreachable)"; exit 2
fi

# Detect whether web proxies /_api to the API. If not, fall back to localhost:8787
echo -n "(web) check /_api/healthz -> "
if curl -s -o /dev/null -w "%{http_code}" "$WEB_BASE/_api/healthz" | grep -q '^200$'; then
  echo "proxied"
  API_TARGET="$WEB_BASE"
else
  echo "not proxied"
  if [ -n "${API_BASE}" ]; then
    API_TARGET="$API_BASE"
  else
    API_TARGET="http://localhost:8787"
  fi
  echo "Using API target: $API_TARGET"
fi

echo -n "1) healthz (api) ... "
if curl -fsS "$API_TARGET/_api/healthz" >/dev/null; then
  echo "OK"
else
  echo "FAIL"; exit 2
fi

echo -n "2) ping (api) ... "
if curl -fsS "$API_TARGET/api/v1/hello/ping" >/dev/null; then
  echo "OK"
else
  echo "FAIL"; exit 2
fi

echo -n "3) actions without key (expect 401) ... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_TARGET/api/v1/actions" -d '{"type":"noop"}' -H "Content-Type: application/json")
if [ "$HTTP_STATUS" = "401" ]; then
  echo "OK"
else
  echo "FAIL (got $HTTP_STATUS)"; exit 2
fi

cat <<EOF
All smoke tests passed (so far). Next:
 - Test POST /api/v1/actions with a valid key until quota is exhausted (requires provisioning a test key)
 - POST a mock Stripe webhook to /api/stripe/webhook and verify key quota update
EOF
