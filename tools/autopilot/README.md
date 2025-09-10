Autopilot tooling for MVP sprint mode
===================================

This folder contains a small script `run_autopilot.cjs` used by the `mvp-autopilot` GitHub Actions workflow.

Behavior:
- Idempotently ensures a short list of labels exist.
- Creates (or finds) the milestone "MVP — 90 days".
- Creates a few starter issues (guardrails: only creates; no destructive ops).
- DEBUG: set env `AUTO_DEBUG=true` to enable verbose logs.

To run locally:

```bash
AUTO_DEBUG=true gh auth login # ensure gh is authenticated
node tools/autopilot/run_autopilot.cjs
```

Safety/Guardrails
- The script avoids destructive operations. To extend for PRs/commits, add explicit human-approval checks (label or issue comment).
