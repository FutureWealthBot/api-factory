This folder contains minimal ambient TypeScript declaration shims used across the monorepo.

Purpose
- Provide tiny, local declarations for a handful of small modules (for example `mime` and `chokidar`) when the upstream package either ships no types or a project chooses to rely on a small local shim instead of third-party `@types`.

When to add a shim
- Add a shim when a package import lacks type declarations and the required surface is small and unlikely to change.
- Prefer publishing or depending on an official type package for larger or public-facing APIs.

Location & scope
- Files in this directory are intentionally listed in the root `tsconfig` so they are visible to all workspaces.
- Keep these shims minimal: declare only the functions/types you actually use.

Policy
- Avoid adding `@types/<pkg>` devDependencies across packages unless the types are needed for that package specifically.
- If you must add `@types/<pkg>` at package-level, ensure the package is actually installed and kept in sync.
- Prefer a single source of small shims in `types/` to avoid duplication and inconsistent declarations.

How to update
1. If the upstream package acquires official TypeScript types, remove the local shim and prefer the upstream types.
2. When replacing a shim with `@types` or upstream types, remove the shim and update `tsconfig`/typeRoots as needed.

Examples
- `types/global-shims.d.ts` contains small declarations for `mime` and `chokidar` used across the monorepo.

Contact
- If unsure, open a PR and tag the maintainers for review so we keep the declarations accurate and minimal.
