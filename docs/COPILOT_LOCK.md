## Co‑Pilot Lock: MVP + API‑Factory Roadmap

Purpose
-------
This file documents a repository-level instruction set for interactive assistant agents (Co‑Pilot) used while working on this repository. Its intent is to constrain assistant suggestions, edits, and decisions to the project's MVP roadmap and the API‑Factory roadmap.

Scope
-----
- All code, docs, issues, and branches in this repository.
- Assistant behavior when authoring code, proposing design changes, creating issue/PR descriptions, and writing CI/CD or deployment configuration.

Primary Roadmaps to Follow
--------------------------
- MVP Roadmap (primary): use the repository's active MVP checklist and sprint seeds. See `roadmap/` and `docs/`.
- API‑Factory Roadmap (context): see `roadmap/` and `api-factory/README.md` for project context.

Behavior Rules for Assistant
----------------------------
1. Prioritize tasks and changes that move the MVP forward. If a requested change or feature is outside the MVP scope, provide a short justification and mark it as "deferred" with a suggested place in the roadmap.
2. Before making edits, read the relevant roadmap and any related files listed in the machine-readable lock file (`.github/copilot-lock.json`).
3. When creating or editing files, include a brief note linking the change to a roadmap item (e.g., "implements: roadmap/v1.0.1-feature-x").
4. Avoid wide-scope refactors unless they are required by the MVP acceptance criteria or fix critical security/CI issues. Propose large refactors as standalone PRs and label them "refactor/deferred" if outside the MVP.
5. For any decision that affects security, compliance, API contracts, or billing (Stripe, keys, rate limits), include failing-safe defaults and a short test plan.

Required Checks
---------------
- Confirm the change maps to one of the roadmap items in `roadmap/` or `api-factory/README.md`.
- Run the repository's typecheck and lint before finalizing any PR that changes TypeScript/JS code.
- For runtime code additions, include a minimal smoke test or coverage note.

How to use this file
--------------------
1. Human reviewers and CI bots should scan the top of PR descriptions for a line that references the roadmap item implemented.
2. Assistants should consult `.github/copilot-lock.json` (machine-readable) for the authoritative list of roadmap files and lock state before making edits.

Acceptance Criteria for "Locked"
--------------------------------
- This file exists and is referenced by the repository's contribution guidance.
- `.github/copilot-lock.json` lists the roadmap files to consult.
- The assistant's PR descriptions link changes to roadmap items.

Notes
-----
- This is an operational convenience file. It does not enforce behavior automatically but documents the desired guardrails for human reviewers and automated tools.
- If you want automated enforcement, add a CI check that validates PR descriptions and commit messages against the roadmap items listed in `.github/copilot-lock.json`.

Relevant paths (examples):
- `roadmap/`
- `api-factory/README.md`
- `docs/LOCAL_DEV.md`
