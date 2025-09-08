#!/usr/bin/env bash
# Run monorepo build and Docker builds with BuildKit, saving logs to ./build-logs
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build-logs

echo "Running pnpm install and pnpm -w build..."
corepack enable || true
corepack prepare pnpm@9.9.0 --activate || true
pnpm install --reporter=silent 2>&1 | tee build-logs/pnpm-install.log
pnpm -w build 2>&1 | tee build-logs/pnpm-build.log

echo "Running Docker builds with BuildKit..."
DOCKER_BUILDKIT=1 docker build --progress=plain -f Dockerfile.api -t api-factory-api:local . 2>&1 | tee build-logs/docker-api-build.log
DOCKER_BUILDKIT=1 docker build --progress=plain -f Dockerfile.web -t api-factory-web:local . 2>&1 | tee build-logs/docker-web-build.log

echo "Build logs saved to build-logs/"
