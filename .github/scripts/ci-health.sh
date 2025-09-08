#!/usr/bin/env bash
set -euo pipefail
echo "==> ci-health (local)"
PORT="${PORT:-8787}"
URL="http://127.0.0.1:${PORT}/healthz"
echo "Waiting for $URL ..."
npx --yes wait-on@7 "http-get://127.0.0.1:${PORT}/healthz" --timeout 120000
curl -fsS "http://127.0.0.1:${PORT}/healthz" | tee /tmp/healthz.out
echo ; curl -fsS "http://127.0.0.1:${PORT}/version" | tee /tmp/version.out
echo ; echo "Done."

