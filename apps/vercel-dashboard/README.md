Vercel Dashboard

This small Next.js app proxies GitHub Deployments for the `FutureWealthBot/api-factory` repo and lists recent deployments.

Setup

1. Add a repository or project secret `GITHUB_TOKEN` with a token that has `repo` scope (or at least `deployments:read`).
2. Deploy to Vercel (this repo already has a Vercel team/project). The dashboard will use the token to query the GitHub Deployments API.

Local dev

```bash
cd apps/vercel-dashboard
pnpm install
pnpm dev
```

Notes

- The serverless API route `/api/deployments` proxies GitHub's deployments API to avoid exposing the token client-side.
- Optionally, add a `VERCEL_TOKEN` env var to fetch Vercel-specific build logs via the Vercel API.
