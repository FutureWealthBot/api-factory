# Completed TODOs

This file records small, completed tasks related to the `ci/turbo-hardening` branch and the active PR (#59).

- [x] Add `scripts/dev-start.sh` — opt-in helper that can stop Docker containers binding `PORT`/`API_PORT` and starts the monorepo dev servers.
- [x] Update top-level `dev` script in `package.json` to run `bash ./scripts/dev-start.sh`.
- [x] Append local development notes to `README.md` explaining `pnpm dev`, `AUTO_STOP_CONTAINERS=1`, and custom ports.

Verification performed
- Ran `AUTO_STOP_CONTAINERS=1 pnpm dev` in the dev container and confirmed the admin web (Vite) and API server start.

Notes
- These are small, low-risk changes intended to improve local developer experience. The auto-stop behavior is opt-in and only affects Docker containers when `AUTO_STOP_CONTAINERS=1`.
