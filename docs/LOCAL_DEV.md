Local development

This repo runs two dev servers together: the API (CLI) and the admin web UI.

To avoid intermittent "EADDRINUSE" errors when starting the workspace dev task, this repository pins the API ports for local development.

Defaults

- PORT=8787
- API_PORT=8787
- Vite (admin web) default: 5173 (vite may pick another if 5173 is in use)

How to run

The workspace dev task sets the environment vars and runs both services:

```bash
pnpm dev
# or
PORT=8787 API_PORT=8787 pnpm dev
```

Override

If you need different ports, export them first or create a `.env` file in the repo root with the variables above.

Troubleshooting

- If you see `EADDRINUSE`, ensure no other workspace dev instances are running. Use `ss -ltnp` and `ps -ef | grep pnpm` to find duplicates.
- To force a clean start: kill stray node/pnpm processes started from this workspace and re-run `pnpm dev`.
