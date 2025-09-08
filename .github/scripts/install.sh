#!/usr/bin/env bash
set -euo pipefail

echo "==> API-Factory installer (local developer bootstrap)"

if ! command -v node >/dev/null 2>&1; then
  echo "::error::Node.js not found. Install Node 20+ and re-run." ; exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Enabling corepack and installing pnpm@9..."
  corepack enable && corepack prepare pnpm@9 --activate
fi

echo "==> Installing dependencies via pnpm"
pnpm install

echo "==> Ensuring helper scripts exist (minimal stubs if missing)"
for f in ci-health.sh ci-smoke.sh ci-rate-headers.sh ci-assert-json.sh ci-assert-resolve.sh ci-retry.sh; do
  p=".github/scripts/$f"
  [ -f "$p" ] || (echo "#!/usr/bin/env bash" > "$p"; chmod +x "$p")
done

echo "==> Install complete."
