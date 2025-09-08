Dev fallbacks and running backend

This backend currently uses small development fallbacks to avoid workspace-wide plugin version mismatches.

Environment switches

- USE_DEV_FALLBACKS=1 (default): use small in-repo handlers for sessions and static files. Fast to run and safe for local dev.
- USE_DEV_FALLBACKS=0: attempt to register the real @fastify/static plugin and (if chosen) a full session plugin; may fail if workspace has mixed fastify versions.

Run locally (recommended):

cd api-factory/backend
pnpm run dev

To force trying the real plugins (may require upgrading workspace packages):

USE_DEV_FALLBACKS=0 pnpm run dev
