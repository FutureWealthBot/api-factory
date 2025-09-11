CI monitor
==========

Small helper script to poll recent workflow runs on the `main` branch and
create GitHub issues when a run fails. This is intentionally minimal — it
requires the `gh` CLI to be installed and authenticated with permissions to
create issues on the repository.

Usage:

```bash
# run in repo root
scripts/ci-monitor.sh &
```

Environment variables:
- POLL_INTERVAL: seconds between polls (default 60)
- MAX_LOG_LINES: how many tail lines of logs to include in the created issue (default 800)

Notes:
- The script stores seen run IDs in `.ci-monitor-state.json` to avoid duplicate issues.
- It will attempt to attach the tail of the run logs to the issue body.
