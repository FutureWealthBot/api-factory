name: CI / Deployment failure
about: Open this when a GitHub Actions job or a deployment (Vercel) fails after a merge/PR.
title: '[CI FAILURE] <short description>'
labels: bug, ci

---

## What happened
Describe the failing job or deployment, and when it happened (PR/commit). Include links to the GitHub Actions job and Vercel deployment if available.

## Reproduction steps
1. Commit / PR: <sha or PR link>
2. Steps to reproduce locally (commands to run)

## Logs
Paste the relevant failing logs (truncated to the failing section). If the log is long, attach a file.

## Environment
- Node version used in CI / locally
- pnpm / npm / yarn version
- Any relevant environment variables (do NOT paste secrets)

## Suggested next steps
- Collect full CI logs and failing step
- Try local repro with same Node version
- If deployment: re-run deployment in Vercel and capture the build log

---

Thanks — maintainers will triage and assign.
