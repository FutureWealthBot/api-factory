#!/usr/bin/env bash
set -euo pipefail

echo "Checking API health..."
if curl -fsS http://127.0.0.1:8787/_api/healthz >/dev/null; then
  echo "API healthy"
else
  echo "API unhealthy" >&2
  exit 2
fi

echo "Checking Web root..."
if curl -fsS http://127.0.0.1:3000/ >/dev/null; then
  echo "Web healthy"
else
  echo "Web unhealthy" >&2
  exit 3
fi

echo "All services healthy"
