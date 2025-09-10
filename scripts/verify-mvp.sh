#!/usr/bin/env bash
# One-click MVP verification for /workspaces/api-factory
# Exit on first failure, collect outputs into artifacts/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUTDIR="$ROOT/artifacts/verify-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUTDIR"

echo "workspace: $ROOT" > "$OUTDIR/summary.txt"
echo "start: $(date -u)" >> "$OUTDIR/summary.txt"

# 1) Git status + recent log
git status --porcelain > "$OUTDIR/git-status.txt" || true
git log --oneline -n 20 > "$OUTDIR/git-log.txt" || true

# 2) Lint (auto-detect Node or Python)
echo "Running lint..." | tee "$OUTDIR/lint.log"
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  if npm run --silent lint >/dev/null 2>&1; then
    npm run --silent lint 2>&1 | tee "$OUTDIR/lint.log"
  else
    # try eslint directly
    if command -v npx >/dev/null 2>&1; then
      npx eslint . 2>&1 | tee "$OUTDIR/lint.log" || true
    fi
  fi
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  if command -v flake8 >/dev/null 2>&1; then
    flake8 . 2>&1 | tee "$OUTDIR/lint.log" || true
  else
    echo "flake8 not found; skipping lint" | tee -a "$OUTDIR/lint.log"
  fi
else
  echo "No recognized lint target (package.json or pyproject.toml missing)" | tee -a "$OUTDIR/lint.log"
fi

# 3) Unit tests (auto-detect)
echo "Running unit tests..." | tee "$OUTDIR/tests.log"
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  if npm test --silent 2>&1 | tee "$OUTDIR/tests.log"; then
    echo "npm tests passed" >> "$OUTDIR/tests.log"
  else
    echo "npm tests failed (see tests.log)" >> "$OUTDIR/tests.log"
    exit 2
  fi
elif command -v pytest >/dev/null 2>&1 && ([ -d tests ] || ls *_test.py 2>/dev/null | grep -q .); then
  pytest --maxfail=1 --disable-warnings -q 2>&1 | tee "$OUTDIR/tests.log" || exit 2
else
  echo "No test runner detected or no tests found; skipping unit tests" | tee -a "$OUTDIR/tests.log"
fi

# 4) Run migrations if script exists
if [ -x ./scripts/migrate.sh ]; then
  echo "Running migrations via scripts/migrate.sh" | tee "$OUTDIR/migrate.log"
  ./scripts/migrate.sh 2>&1 | tee "$OUTDIR/migrate.log" || { echo "Migrations failed"; exit 3; }
else
  echo "No ./scripts/migrate.sh found or not executable; skipping migrations" > "$OUTDIR/migrate.log"
fi

# 5) Contract / integration tests
if [ -x ./scripts/contract-test.sh ]; then
  echo "Running contract tests" | tee "$OUTDIR/contract.log"
  ./scripts/contract-test.sh 2>&1 | tee "$OUTDIR/contract.log" || { echo "Contract tests failed"; exit 4; }
else
  echo "No ./scripts/contract-test.sh found; skipping contract tests" > "$OUTDIR/contract.log"
fi

# 6) CI status (requires gh CLI + repo remote)
echo "Checking recent CI runs (gh)... " | tee "$OUTDIR/ci.log"
if command -v gh >/dev/null 2>&1 && git remote get-url origin >/dev/null 2>&1; then
  ORIGIN_URL="$(git remote get-url origin)"
  # try to parse owner/repo
  REPO="$(echo "$ORIGIN_URL" | sed -E 's#(.*/)?([^/]+/[^/]+)(\.git)?#\2#')"
  if [ -n "$REPO" ]; then
    echo "repo: $REPO" >> "$OUTDIR/ci.log"
    gh run list --repo "$REPO" --limit 5 2>&1 | tee -a "$OUTDIR/ci.log" || true
  else
    echo "Could not parse repo from origin: $ORIGIN_URL" >> "$OUTDIR/ci.log"
  fi
else
  echo "gh not installed or git remote missing; skipping CI check" > "$OUTDIR/ci.log"
fi

# 7) Security scan (npm audit or pip-audit)
echo "Running security scan..." | tee "$OUTDIR/security.log"
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  npm audit --audit-level=high 2>&1 | tee "$OUTDIR/security.log" || true
elif command -v pip-audit >/dev/null 2>&1; then
  pip-audit 2>&1 | tee "$OUTDIR/security.log" || true
else
  echo "No security scanner found (npm or pip-audit); skipping" | tee "$OUTDIR/security.log"
fi

# 8) Staging smoke test (if script or STAGING_URL provided)
echo "Running staging smoke test..." | tee "$OUTDIR/staging.log"
if [ -x ./scripts/deploy-staging.sh ]; then
  ./scripts/deploy-staging.sh 2>&1 | tee -a "$OUTDIR/staging.log" || echo "deploy script exited non-zero" >> "$OUTDIR/staging.log"
fi

STAGING_URL="${STAGING_URL:-$(grep -Eo 'STAGING_URL=.+$' .env 2>/dev/null | cut -d= -f2- || true)}"
STAGING_URL="${STAGING_URL:-https://staging.example.com/health}"

if command -v curl >/dev/null 2>&1; then
  HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$STAGING_URL" || echo "000")"
  echo "curl $STAGING_URL -> $HTTP_CODE" | tee -a "$OUTDIR/staging.log"
  if [ "$HTTP_CODE" != "200" ]; then
    echo "Staging health check did not return 200 (got $HTTP_CODE). See $OUTDIR/staging.log" >> "$OUTDIR/summary.txt"
  else
    echo "Staging health OK" >> "$OUTDIR/summary.txt"
  fi
else
  echo "curl not available; cannot run staging check" | tee -a "$OUTDIR/staging.log"
fi

# 9) Pack artifacts
tar -C "$OUTDIR/.." -czf "$OUTDIR".tar.gz "$(basename "$OUTDIR")"
echo "Artifacts written to: $OUTDIR and $OUTDIR.tar.gz" >> "$OUTDIR/summary.txt"
echo "end: $(date -u)" >> "$OUTDIR/summary.txt"

# Print short summary
echo "Verification complete. Artifacts: $OUTDIR.tar.gz"
echo "To inspect results: ls -la $OUTDIR; tail -n +1 $OUTDIR/*.log"
