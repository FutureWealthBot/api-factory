Roadmap guide
=============

Place roadmap notes, proposals, and long-term plans in this folder. Use the issue template `.github/ISSUE_TEMPLATE/roadmap-suggestion.md` to collect suggestions from contributors.

Recommended files:
- `90-day.md` — short-term milestones
- `strategy.md` — long-term vision

Use `tools/roadmap-copilot/generate_roadmap.cjs` to aggregate these documents into a proposal.

CI / Automation
---------------
This repository includes a workflow `.github/workflows/roadmap-copilot.yml` that runs the generator on-demand or weekly and opens a pull request with the updated `ROADMAP_PROPOSAL.md` for review.

Review guidance:
- Inspect the generated `tools/roadmap-copilot/output/ROADMAP_PROPOSAL.md` in the PR.
- Update or split suggested items into milestone-backed issues before merging.
- Label and assign owners as appropriate.
