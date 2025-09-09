#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test: call the api-cli _meta endpoint and print the track
URL=${1:-http://127.0.0.1:8787/_meta}
echo "Checking TRACK at $URL"
resp=$(curl -sSfL "$URL" || true)
if [ -z "$resp" ]; then
  echo "no response from $URL" >&2
  exit 2
fi
echo "response: $resp"
if echo "$resp" | grep -iq 'track'; then
  echo "TRACK found"
  exit 0
else
  echo "TRACK not present in response" >&2
  exit 3
fi
