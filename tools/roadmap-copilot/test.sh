#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Run the generator and assert the output contains the expected header
node generate_roadmap.cjs
OUT=output/ROADMAP_PROPOSAL.md
if [ ! -f "$OUT" ]; then
  echo "ERROR: $OUT not found"
  exit 2
fi

if grep -q '^# ROADMAP PROPOSAL' "$OUT" && grep -q 'AUTOPILOT GUARDRAILS' "$OUT"; then
  echo "Test passed: generated file contains expected header and guardrails"
  exit 0
else
  echo "Test failed: expected header and/or guardrails not found in $OUT"
  exit 1
fi
