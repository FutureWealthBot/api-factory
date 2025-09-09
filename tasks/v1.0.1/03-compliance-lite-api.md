# Compliance Lite API — Task stub

Goal
----
Implement a minimal compliance layer: KYC-lite (email verification + dummy ID check) and fraud risk scoring (IP/device heuristics).

Contract
--------
- POST /api/v1/compliance/verify-email - send verification email (beta: return code and mock token)
- POST /api/v1/compliance/verify-id - accepts basic ID info, returns result { passed: boolean, reason?: string }
- POST /api/v1/compliance/score - accepts context (ip, user_agent, device_fingerprint) returns { score: number, risk: 'low'|'medium'|'high' }

Acceptance criteria
-------------------
1. Email verification flow test: request, receive mock token, confirm verification endpoint accepts the token.
2. Fraud scoring: provide deterministic heuristics (e.g., high risk for TOR exit IPs, mismatched geo/user agent) and unit tests for rules.
3. Admin telemetry endpoint to list recent verifications and flagged accounts.

Edge cases
----------
- Rate-limiting for verification endpoints.
- Privacy: do not log full PII in plain text in production (beta may mock data).

Notes
-----
Keep the implementation modular so enterprise-grade third-party integrations (Jumio, Sift) can be swapped in later.
