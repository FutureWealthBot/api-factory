# Repository TRACK

This repository includes a top-level `TRACK` file that records the active release track.

Purpose
- Provide a single source of truth for the release track (for example: `MVP`, `canary`, `stable`).

How it's used
- GitHub Actions: workflows load `TRACK` into the job environment as `TRACK`.
- Runtime: services read `process.env.TRACK` or fall back to the `TRACK` file.
- Docker: Dockerfiles accept `ARG TRACK` and set `ENV TRACK` so containers see the value.

Quick check
- Start the `api-cli` service (locally or in Docker) and call `GET /_meta` to see the active track.
