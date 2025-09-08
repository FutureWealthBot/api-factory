# Marketing Automation & Content Generation — 2025-09-07

Summary
- Adds Marketing Workspace to Admin for campaign content generation and automation.
- Uses an LLM (OpenAI by default) to generate email copy, social posts, subject lines, and campaign assets.
- Generated content is committed to a new branch and a PR is opened (labels: marketing, marketing-autogen) for review — merges remain gated by repo protections (guardrails preserved).
- Admin UI can dispatch generation (via workflow_dispatch) or call the admin-api which may create PRs directly.
- A GitHub workflow is included to run marketing generation in CI or by schedule.

Security & Secrets
- GITHUB_TOKEN (Actions) is available automatically — for the workflow, ensure the default token has write permissions for contents/pulls or use a PAT secret with appropriate scopes.
- OPENAI_API_KEY (or other LLM provider API key)
- Optional: SENDGRID_API_KEY, TWITTER_BEARER, LINKEDIN_TOKEN, etc for channel posting (not auto-posting in this initial scaffold — posts should remain manual or gated)
- Store tokens in environment or GitHub Secrets. Admin API must be deployed behind admin authentication.

Architecture
- packages/admin: Marketing UI page to create campaigns, view campaign files, generate content, open marketing PRs.
- packages/admin-api: endpoints:
  - GET /api/marketing/campaigns — list existing campaign folders from marketing/campaigns/
  - POST /api/marketing/generate — generate content from LLM (returns result, does not commit)
  - POST /api/marketing/create-pr — create branch, add generated content file, open PR
- .github/workflows/marketing-autogen.yml — dispatchable workflow that runs a generation script and opens PR using repo secrets (useful for scheduled campaigns).

Next steps & recommendations
1. Add admin auth + rate-limiting to admin-api before exposing to the internet.
2. Keep PR creation gated — do not auto-merge.
3. Add provider adapters for other LLMs or marketing channels.
4. Implement analytics & tracking for campaign performance.
