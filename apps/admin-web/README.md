# admin-web (API Factory)

Quick notes to run the admin web app locally inside the monorepo.

Prereqs
- Node 18+
- pnpm

Run dev server (from repo root)

```bash
pnpm install
pnpm run dev:admin
# or to expose on the network:
pnpm run start:admin
```

Or from inside the app folder:

```bash
pnpm install
pnpm start
```

What's included
- `src/screens/Fortification.tsx` — Cyber Fortress screen
- `src/components/Sidebar.tsx` — Sidebar (uses react-router-dom)
- `src/styles/fortress.css` — styles and responsive helpers

Notes
- The dev server uses Vite and serves at `http://localhost:5173/` by default.
- Mobile: the topbar provides a toggle to reveal the sidebar on narrow screens.

If anything doesn't load, run `pnpm install` again at repo root and restart the dev server.
