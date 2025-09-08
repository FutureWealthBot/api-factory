#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install and authenticate (gh auth login) before running this script." >&2
  exit 1
fi

# Helper to create an issue (no labels to avoid missing-label errors)
create_issue(){
  local title="$1"
  local body="$2"
  echo "Creating issue: $title"
  gh issue create --title "$title" --body "$body" || { echo "Failed to create: $title" >&2; exit 1; }
}

create_issue "CI: Ensure images published with latest + SHA" "Make GitHub Actions reliably publish images tagged \`latest\` and the commit SHA. Acceptance: images appear in GHCR with both tags after merge. Add retries and backoff for pushes. See .github/workflows/docker.yml."

create_issue "Makefile: Robust local push & docs" "Finish and test \`make push\` for personal GHCR and Docker Hub. Ensure owner lowercasing, retries, and clear error messages. Update DEPLOYMENT.md with commands."

create_issue "Smoke tests: Add docker-compose health check Action" "Add a GitHub Action that runs \`docker compose up --build -d\` in a job, waits for health endpoints, and fails on unhealthy services. Useful as a post-merge smoke test."

create_issue "Docs: Troubleshooting & developer guide" "Polish DEPLOYMENT.md with a checklist for local devs: build, verbose logs, GHCR vs Docker Hub choices, and org-permissions section. Add a short quickstart to run compose."

create_issue "Staging: Provide Kubernetes manifests (optional)" "Add example Kubernetes Deployment and Service manifests for staging using the published images. Include a README to deploy to a test cluster. This is optional/stretch."

create_issue "Org: Request package publishing permission" "Draft message for org admin explaining how to enable package publishing / allow Actions to publish to GHCR for the org. Include required steps and permissions."

# Create project board (best-effort)
if gh project list >/dev/null 2>&1; then
  echo "Creating project 'Deployment Sprint'"
  gh project create "Deployment Sprint" --body "Sprint board for delivery: Reliable image builds & publish pipeline" || echo "Project creation failed or already exists"
else
  echo "gh project command not available in this environment (older gh). Please create a project manually if you want a board."
fi

echo "Done. Review the created issues in your repository." 
