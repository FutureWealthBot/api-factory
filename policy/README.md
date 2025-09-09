Policy directory for machine-readable regulatory rules.

Structure:
- policy/consent/consent.rego         # Consent enforcement rule (example)
- policy/consent/consent_test.rego    # Rego unit tests

How to run (requires OPA installed):

Run all policy tests:

```bash
opa test ./policy
```

Run just the consent tests:

```bash
opa test ./policy/consent
```

Notes:
- Keep policies small and versioned.
- Place per-domain rules under `policy/<domain>/`.
- CI should run `opa test` before deployment to catch policy regressions.
