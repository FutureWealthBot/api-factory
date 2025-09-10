Roadmap Co-Pilot
=================

Purpose
-------
This small scaffold helps bootstrap a "Roadmap Co-Pilot" for the repository. It contains a lightweight Node script that scans existing roadmap documents and release notes to produce a single `ROADMAP_PROPOSAL.md` you can iterate on.

Quick usage
-----------
From the repository root run:

    node tools/roadmap-copilot/generate_roadmap.js

This will create `tools/roadmap-copilot/output/ROADMAP_PROPOSAL.md` containing aggregated context and a short list of suggested next items.

Contract
--------
- Inputs: files under `docs/roadmap/`, `RELEASES/`, and `docs/` where applicable.
- Output: `tools/roadmap-copilot/output/ROADMAP_PROPOSAL.md` and console summary.
- Error modes: script exits with non-zero code when it cannot read the repository files or create output directory.

Notes
-----
- This is intentionally small and offline — it doesn't call external APIs or services.
- Use it as a starting point. You can extend the script to call AI services, create issues, or open pull requests.
