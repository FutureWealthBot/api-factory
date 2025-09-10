#!/usr/bin/env bash
# dev-start.sh
# Small helper for starting the monorepo dev environment.
# If AUTO_STOP_CONTAINERS=1 is set, it will attempt to stop any docker container
# that is binding the configured PORT or API_PORT before starting the dev servers.

set -euo pipefail

# Defaults - keep in sync with previous package.json defaults
PORT_DEFAULT=8787
API_PORT_DEFAULT=8787

PORT=${PORT:-$PORT_DEFAULT}
API_PORT=${API_PORT:-$API_PORT_DEFAULT}

echo "Starting dev with PORT=$PORT API_PORT=$API_PORT (AUTO_STOP_CONTAINERS=${AUTO_STOP_CONTAINERS:-0})"

if [ "${AUTO_STOP_CONTAINERS:-0}" = "1" ]; then
  echo "AUTO_STOP_CONTAINERS=1 -> scanning for docker containers holding ports $PORT or $API_PORT..."

  # Find containers mapping either port
  MAPS=$(docker ps --format '{{.ID}} {{.Ports}}' | grep -E ":${PORT}[^0-9]|:${API_PORT}[^0-9]" || true)

  if [ -n "$MAPS" ]; then
    echo "Found containers mapping target ports, stopping them:" 
    echo "$MAPS" | while read -r line; do
      CONTAINER_ID=$(echo "$line" | awk '{print $1}')
      echo "- stopping $CONTAINER_ID"
      docker stop "$CONTAINER_ID" || true
    done
  else
    echo "No containers found mapping those ports."
  fi
fi

# Preserve previous behavior: set PORT and API_PORT env vars and run concurrently
PORT=$PORT API_PORT=$API_PORT npx concurrently -n CLI,WEB -c auto "pnpm --filter api-cli dev" "pnpm --filter admin-web dev"
