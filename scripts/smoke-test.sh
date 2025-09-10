#!/usr/bin/env bash
set -eu

# Usage: ./scripts/smoke-test.sh <TARGET_BASE_URL> [API_KEY]
# Example: ./scripts/smoke-test.sh https://staging.example.com "sk_test_..."

TARGET=${1:-${SMOKE_TARGET:-http://localhost:8787}}
API_KEY=${2:-${SMOKE_API_KEY:-}}

fail=0
echo "Smoke test target: $TARGET"

ok_or_fail() {
  if [ "$1" -ne 0 ]; then
    echo "FAIL: $2"
    fail=1
  else
    echo "OK: $2"
  fi
}

echo "-> health check: ${TARGET}/_api/healthz"
curl -sS -o /dev/null -w "%{http_code}" "${TARGET}/_api/healthz" | grep -q '^200$'
ok_or_fail $? "healthz"

echo "-> ping check: ${TARGET}/api/v1/hello/ping"
curl -sS -o /dev/null -w "%{http_code}" "${TARGET}/api/v1/hello/ping" | grep -q '^200$'
ok_or_fail $? "ping"

echo "-> unauthenticated actions check (expect 401): ${TARGET}/api/v1/actions"
curl -sS -X POST -H "Content-Type: application/json" -d '{"action":"noop"}' -o /dev/null -w "%{http_code}" "${TARGET}/api/v1/actions" | grep -q '^401$'
ok_or_fail $? "actions: unauthenticated -> 401"

if [ -n "${API_KEY}" ]; then
  echo "-> authenticated actions check with provided API key"
  code=$(curl -sS -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${API_KEY}" -d '{"action":"noop"}' -w "%{http_code}" -o /dev/null "${TARGET}/api/v1/actions" || true)
  if echo "$code" | grep -q '^20[0-9]$\|^429$'; then
    echo "OK: actions with key returned $code (expected 2xx or 429)"
  else
    echo "FAIL: actions with key returned $code"
    fail=1
  fi
fi

if [ "$fail" -ne 0 ]; then
  echo "Smoke tests failed"
  exit 2
fi

echo "All smoke tests passed"
exit 0
