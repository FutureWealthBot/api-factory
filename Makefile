
# Small convenience Makefile for local deployment with verbose Docker builds

.PHONY: up down build push logs

up:
	docker compose up --build -d

down:
	docker compose down

logs-api:
	docker compose logs -f api

logs-web:
	docker compose logs -f web

# Build images locally with BuildKit and plain progress for easier debugging
build:
	@echo "Running monorepo build (pnpm) and then Docker builds with BuildKit"
	@corepack enable || true
	@corepack prepare pnpm@9.9.0 --activate || true
	@pnpm install --reporter=silent || true
	@pnpm -w build || true

	@DOCKER_BUILDKIT=1 docker build --progress=plain -f Dockerfile.api -t api-factory-api:local .
	@DOCKER_BUILDKIT=1 docker build --progress=plain -f Dockerfile.web -t api-factory-web:local .


# Only require OWNER when running the `push` target to avoid Makefile parsing errors
REGISTRY ?= ghcr.io

ifneq ($(filter push,$(MAKECMDGOALS)),)
ifndef OWNER
$(error OWNER is required. Usage: make push OWNER=<your-username-or-org> [REGISTRY=ghcr.io])
endif
endif

.PHONY: push
push: build
	@OWNER_LC=$$(echo "$(OWNER)" | tr '[:upper:]' '[:lower:]') ; \
	if [ "$$OWNER_LC" != "$(OWNER)" ]; then echo "Warning: owner lowercased to $$OWNER_LC"; fi ; \
	echo "Tagging images for $(REGISTRY)/$$OWNER_LC" ; \
	docker tag api-factory-api:local $(REGISTRY)/$$OWNER_LC/api-factory-api:latest ; \
	docker tag api-factory-web:local $(REGISTRY)/$$OWNER_LC/api-factory-web:latest ; \
	echo "Pushing images to $(REGISTRY)/$$OWNER_LC" ; \
	docker push $(REGISTRY)/$$OWNER_LC/api-factory-api:latest ; \
	docker push $(REGISTRY)/$$OWNER_LC/api-factory-web:latest

.PHONY: verbose-build
verbose-build:
	@echo "Running verbose build via bash (no execute permission required)"
	@bash ./scripts/verbose-build.sh
