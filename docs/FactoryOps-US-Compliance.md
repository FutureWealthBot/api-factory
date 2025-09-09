# FactoryOps — U.S. Compliance Edition

Mission
- Operate and scale API-Factory with U.S. regulatory compliance in mind.

What this artifact contains
- `schema/premium_app.schema.json` — JSON Schema for the Premium App data model including standard U.S. compliance tags.
- `types/premium-app.d.ts` — TypeScript type for the PremiumApp model.

Guiding principles
- Consent-first APIs: endpoints should verify consent and fail closed when consent or audit trails are missing.
- Tagging: each Premium App must include zero-or-more `us_compliance` tags drawn from the supported list.
- Pre-deploy checks: CI should validate schema, run automated compliance mapping tests, and require human review when ambiguous.

Next steps
1. Wire schema validation into the publishing flow for premium apps (tooling under `tools/` or `packages/admin`).
2. Add automated compliance check steps to CI to block deploys when required tags are missing.
3. Maintain a compliance mapping matrix linking tags to short remediation steps (e.g., HIPAA -> enable encryption at rest, BAA signed).
