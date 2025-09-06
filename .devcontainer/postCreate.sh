#!/usr/bin/env bash
set -euo pipefail

# Ensure pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  npm i -g pnpm
fi

# Install Supabase CLI (linux amd64)
if ! command -v supabase >/dev/null 2>&1; then
  curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz \
    | tar -xz && sudo mv supabase /usr/local/bin/supabase
fi

# Optional: Bun
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
fi

# Workspace installs (pnpm if present, else npm)
if command -v pnpm >/dev/null 2>&1; then
  [ -d "tools/fwb-cli" ] && (cd tools/fwb-cli && pnpm i)
  [ -d "apps/web" ]      && (cd apps/web && pnpm i)
  [ -f "package.json" ]  && pnpm i
else
  [ -d "tools/fwb-cli" ] && (cd tools/fwb-cli && npm i)
  [ -d "apps/web" ]      && (cd apps/web && npm i)
  [ -f "package.json" ]  && npm i
fi

echo "✅ postCreate complete."
