# report-cli

Small CLI to generate a Total Account Status Report for a project folder.

Usage

```bash
cd tools/report-cli
pnpm install
pnpm run build
node dist/index.js /path/to/project /path/to/out.json
```

The current implementation uses stubs for GitHub/Vercel/Supabase connectors. I can wire real APIs when you provide which providers to prioritize and tokens.

Environment

Set these environment variables to enable real connectors:

```
GITHUB_TOKEN
VERCEL_TOKEN
SUPABASE_URL
SUPABASE_KEY
```
