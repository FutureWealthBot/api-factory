# API-Factory: Alignment & Operating Principles

Purpose
-------
This document captures the project-level principles and practical steps to keep the API-Factory repository aligned with the MVP roadmap, architecture, and Autopilot guardrails.

Before you start
---------------
- Always consult the roadmap and phase checklists in `/docs/roadmap/` and `docs/roadmap/MVP_NEXT_STEPS.md`.
- Confirm the item is "in progress" or "next-up" before changing scope.

Checklist (must follow)
----------------------
1. Always work from the roadmap & checklists
   - Reference `roadmap/`, `docs/roadmap/MVP_NEXT_STEPS.md`, and progress snapshots.
   - Before work: check in-progress/done/next-up and confirm "definition of done".
   - After work: update the checklist and export a snapshot to `/docs/roadmap/`.

2. Use the guardrails
   - CI enforcement: do not merge PRs that fail lint, typecheck, test, or build.
   - Run locally before PR: `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test --if-present`, `pnpm -r build`.
   - Autopilot: assistants can open PRs but a human reviews and merges; track changes in `/docs/roadmap/` and audit logs.

3. Work in small, reviewable PRs
   - Branch per checklist item.
   - PRs must reference the roadmap item(s) they address (see `.github/copilot-lock.json`).

4. Sync API, SDK, and docs
   - If you change an endpoint: update `openapi.yaml` and run `pnpm sdk:gen && pnpm sdk:build`.
   - Keep docs and SDK in sync with the deployed API.

5. Monitor risks
   - Keep `RISK_REGISTER.md` updated. Log mitigations with references to commits/PRs.

6. Keep the Admin and Monetization spine current
   - When plans/quotas/keys/billing logic change, update `MONETIZATION.md` and Admin Web displays.

7. Regular audits and snapshots
   - Produce a roadmap snapshot on major actions (deploy, feature complete, roadmap update) in `/docs/roadmap/`.
   - Use locked progress reports for scope freezes.

8. Stay modular; avoid scope creep
   - Ship only what's in the current phase; defer extras to Stretch/Post-MVP.

9. Leverage Copilot prompts
   - Use the prompts in `docs/roadmap/MVP_NEXT_STEPS.md` when generating code or PR templates.

Quick reference table
---------------------
Practice | Where
---|---
Reference Roadmap/Checklists | `docs/roadmap/`, `docs/roadmap/MVP_NEXT_STEPS.md`
Use CI/CD for all checks | `.github/workflows/ci.yml`
Work in small PRs | Branch per checklist item
Keep OpenAPI/SDK/docs in sync | `openapi.yaml`, SDK scripts
Export progress/audit snapshots | `/docs/roadmap/`
Monitor & log risks | `RISK_REGISTER.md`
Follow Copilot prompt conventions | `docs/roadmap/MVP_NEXT_STEPS.md`
Avoid scope creep | Stick to the active checklist

How to use this doc
-------------------
- Link to this file in PR descriptions and contributor guidance.
- Assistants should consult this file before proposing changes.

Next steps (recommended)
------------------------
1. Add a short CONTRIBUTING.md referencing this file and the copilot lock.
2. Add a GitHub Action to snapshot `docs/roadmap/` on merge (optional).
3. Enforce Admin route auth for `/api/admin/*` endpoints.
