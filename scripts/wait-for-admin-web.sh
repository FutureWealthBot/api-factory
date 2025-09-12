#!/usr/bin/env bash
# wait-for-admin-web.sh
# Waits for http://localhost:5173 to be available (default 60s timeout)

set -e
URL="http://localhost:5173"
TIMEOUT="60"
INTERVAL="2"

if [ -n "$1" ]; then
  URL="$1"
fi

if [ -n "$2" ]; then
  TIMEOUT="$2"
fi

elapsed=0
while ! curl -sSf "$URL" > /dev/null; do
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "Timeout waiting for $URL after $TIMEOUT seconds"
    exit 1
  fi
  echo "Waiting for $URL... ($elapsed/$TIMEOUT)"
  sleep "$INTERVAL"
  elapsed=$((elapsed+INTERVAL))
done

echo "$URL is up!"
exit 0
