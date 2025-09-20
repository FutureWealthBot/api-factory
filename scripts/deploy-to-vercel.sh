#!/usr/bin/env bash
# deploy-to-vercel.sh
# Deploys the current branch to Vercel using the Vercel CLI.

set -e

if ! command -v vercel >/dev/null 2>&1; then
  echo "Please install the Vercel CLI: npm i -g vercel"
  exit 1
fi

# Use VERCEL_TOKEN env var or interactive login
if [ -z "$VERCEL_TOKEN" ]; then
  echo "No VERCEL_TOKEN found; will attempt interactive deploy. For CI, set VERCEL_TOKEN env var."
fi

# Deploy to production
vercel --prod --confirm
