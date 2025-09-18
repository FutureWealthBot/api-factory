# Guardrails Overview

This document summarizes the security, compliance, CI/CD, developer, and observability guardrails implemented in the API Factory monorepo as of September 2025.

## Security & Compliance
- **Policy Enforcement Middleware**: All API requests are subject to runtime policy checks (`backend/src/middleware/policyEnforcer.js`).
- **Zero-Trust Config**: Startup blocks if required secrets/env vars are missing or set to defaults.
- **Consent Middleware**: Enforces consent checks for sensitive API routes.
- **SBOM Generation**: Syft-based SBOM workflow (`.github/workflows/sbom.yml`).
- **CodeQL Static Analysis**: Automated static analysis for JS/TS (`.github/workflows/codeql.yml`).

## CI/CD Guardrails
- **Coverage Enforcement**: Jest coverage threshold set to 80% global (`backend/jest.config.js`).
- **Ephemeral Backend Preview**: Docker Compose preview for PRs (`.github/workflows/backend-preview.yml`).
- **Docker Image Signing**: Cosign-based signing in CI (`.github/workflows/docker-sign.yml`).
- **Dependency Review**: PRs are checked for risky dependency changes (`.github/workflows/dependency-review.yml`).

## Developer Guardrails
- **Pre-commit Hooks**: Husky runs lint-staged on staged files (`.husky/pre-commit`).
- **Commit Message Linting**: Conventional commit enforcement (`.husky/commit-msg`, `commitlint.config.js`).
- **Lint-staged**: Runs eslint, tsc, and jest on staged JS/TS files (`.lintstagedrc.json`).

## Observability
- **Structured Logging**: All logs include correlation IDs for traceability.
- **SLO Alerting Placeholder**: SLO metrics and threshold breach logging (`backend/src/sloAlerting.ts`).
- **Audit Trail Logging**: Sensitive actions are logged for compliance (`backend/src/auditTrail.ts`).

## Integration
All guardrails are integrated into the Fastify backend and CI/CD workflows. See `backend/src/server.ts` for middleware registration and workflow files in `.github/workflows/` for CI/CD automation.

---

For details, see the referenced files or contact the maintainers.
