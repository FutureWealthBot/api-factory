# Deployment Sprint — Project Seed

This file is a repo-side seed for the "Deployment Sprint" project board. It documents the intended columns, card types, and links to the sprint issues that were created by the sprint autopilot run.

Project name: Deployment Sprint

Columns (recommended)
- Backlog
- To Do
- In Progress
- Review
- Done

How to use
- Create a Projects (beta) project in the GitHub UI named **Deployment Sprint**.
- Create the columns above (Backlog / To Do / In Progress / Review / Done).
- Use this file as the canonical layout and add the linked issues as cards on the board.

Sprint issues (created automatically):

- CI: Ensure images published with latest + SHA — https://github.com/FutureWealthBot/api-factory/issues/21
- Makefile: Robust local push & docs — https://github.com/FutureWealthBot/api-factory/issues/22
- Smoke tests: Add docker-compose health check Action — https://github.com/FutureWealthBot/api-factory/issues/23
- Docs: Troubleshooting & developer guide — https://github.com/FutureWealthBot/api-factory/issues/24
- Staging: Provide Kubernetes manifests (optional) — https://github.com/FutureWealthBot/api-factory/issues/25
- Org: Request package publishing permission — https://github.com/FutureWealthBot/api-factory/issues/26

Suggested card templates
- Task (assignee, estimate, acceptance criteria)
- CI (owner, flaky steps, retry plan)
- Docs (owner, short checklist)

Automation notes
- CI should run `opa test ./policy` and `pnpm -w dlx tsx api-factory/backend/src/routes/consent.test.ts` as part of validation for policy + middleware changes.
- The repo contains `.github/workflows/autopilot-auto-push.yml` which can be extended to update seed files periodically.

If you want, I can also open a PR that creates the project seed file and adds a short checklist comment to each issue. I created this file in `docs/PROJECT-SEED/DEPLOYMENT-SPRINT.md` and will push it in a branch and open a PR now.
