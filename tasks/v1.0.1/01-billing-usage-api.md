# Billing & Usage API — Task stub

Goal
----
Implement a Billing & Usage API to track credits, quotas, API key lifecycle, and integrate with Stripe for payments and key issuance.

Contract (high level)
---------------------
- POST /api/v1/billing/charge - create a Stripe charge + credit account
- POST /api/v1/billing/keys - issue API key for a customer (admin scope)
- POST /api/v1/billing/keys/revoke - revoke API key
- GET /api/v1/billing/usage?api_key=... - return usage stats for the api key
- GET /api/v1/billing/account/{id} - summary: credits, tier, next_billing

Data shapes
-----------
- Usage record: { api_key: string, endpoint: string, status: number, bytes: number, timestamp: string }
- Billing account: { id: string, credits: number, tier: string, stripe_customer_id?: string }

Acceptance criteria
-------------------
1. Unit tests for billing logic (credit decrement, quota enforcement).
2. Integration test that simulates a Stripe charge (using Stripe test keys) and results in added credits.
3. Admin endpoint to issue/revoke keys must be authenticated (mock admin token allowed in beta).
4. A smoke test that simulates API usage and verifies usage records and quota enforcement.

Edge cases
----------
- Out-of-credits: calls receive 402 or 429 with clear error code.
- Double-charge prevention: idempotency keys for Stripe calls.
- Revoked key usage should be rejected immediately.

Notes
-----
For beta use a lightweight persistence layer (SQLite or in-memory store) behind a repository interface so we can swap in production stores later.
