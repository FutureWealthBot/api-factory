# Privacy-first AI features

This project provides an AI proxy feature designed to minimize data exposure by default.

Key points:
- Default: we do NOT store raw prompts or generated responses. Prompts and outputs are processed in-memory and discarded.
- Opt-in: embeddings or derived metadata may be stored only when a user explicitly opts in; these are stored per-user and encrypted at rest.
- Telemetry: only aggregated, anonymized metrics are collected when enabled.
- Purge: opt-in stored artifacts can be purged via the `/v1/ai/purge` endpoint (to be implemented) and tooling.
- Secrets: provider API keys must be stored in a secrets manager for production; never commit keys to source control.

For implementation details and the API contract see the backend route `/api/v1/ai/generate` and `docs/` (planned).
