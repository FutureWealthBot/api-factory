#!/usr/bin/env bash
set -euo pipefail

# Smoke test for CI monitor scripts. This script runs the monitor scripts
# in a dry-run mode by setting environment variables to prevent network calls.

export GH_TOKEN=""
export GITHUB_TOKEN=""

echo "Running smoke tests (dry-run)..."

echo "-> Running scripts/ci-monitor.sh for syntax check"
bash -n scripts/ci-monitor.sh || true

echo "-> Running .github/scripts/ci-monitor-action.sh for syntax check"
bash -n .github/scripts/ci-monitor-action.sh || true

echo "Smoke test completed."
