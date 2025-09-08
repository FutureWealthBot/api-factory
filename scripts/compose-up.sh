#!/usr/bin/env bash
# Simple wrapper to bring up the project with docker compose.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Building and starting services..."
docker compose up --build -d

echo "Waiting for API to become healthy..."
for i in {1..30}; do
  if docker compose exec -T api sh -c "curl -fsS http://127.0.0.1:8787/_api/healthz >/dev/null 2>&1"; then
    echo "API is healthy"
    break
  fi
  echo -n "."
  sleep 1
done

echo "Services started."
