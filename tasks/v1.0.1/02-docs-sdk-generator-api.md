# Docs & SDK Generator API — Task stub

Goal
----
Provide an API to accept OpenAPI specs, generate static docs, and produce TypeScript/Python SDKs.

Contract
--------
- POST /api/v1/generator/submit - accepts OpenAPI JSON/YAML; returns job id
- GET /api/v1/generator/status/{job_id} - returns status + logs
- GET /api/v1/generator/artifact/{job_id} - returns a zip of generated artifacts (docs + SDKs)

Data shapes
-----------
- Job record: { id: string, status: 'pending'|'running'|'failed'|'done', created_at, finished_at?, logs: string[] }

Acceptance criteria
-------------------
1. End-to-end test: submit a small OpenAPI doc and assert that generated TypeScript SDK contains a usable client file.
2. Generated docs should include a webpage with at least: endpoints list, example request/response for one endpoint.
3. Jobs must be idempotent and retry-safe.

Edge cases
----------
- Invalid OpenAPI: return 400 with parse error details.
- Large specs: generator should stream progress and avoid OOM.

Notes
-----
Use open-source tools for generation (OpenAPI Generator, Redocly, or custom scripts). For beta, run generation in-process and store artifacts on disk.
