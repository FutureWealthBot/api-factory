# Release Gate (RELEASES)

Purpose
- The `RELEASES/LOCK` file controls which release is next and whether the gate is locked. After a successful release, run the unlock script to advance to the next patch release and unlock the gate.

Workflow
1. Release branch is cut and release performed for the version listed in `RELEASES/LOCK` under `next`.
2. After successful production rollout and verification, run `scripts/unlock_next_release.sh <released-version>`.
3. The script will append an entry to `RELEASES/HISTORY.md` and update `RELEASES/LOCK` to the next patch (e.g., v1.0.1) and set `locked: false`.

See `scripts/unlock_next_release.sh` for details.
