Vercel deployment instructions

1) Import repository into Vercel
   - Go to https://vercel.com/new
   - Choose your Git provider (GitHub) and select the `FutureWealthBot/api-factory` repo

2) Project settings
   - Root directory: `/` (monorepo root)
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: (leave blank for Next.js)

3) Environment variables
   - Add values from `deploy/VERCEL_ENV.example` to your Vercel project (ensure server-only vars are masked)
   - Important: `NEXT_PUBLIC_*` variables are build-time; set them in the Production environment.

4) Monorepo (if using packages)
   - If you use a monorepo with multiple apps, configure the Root to `/` and set the build command to run the correct project (e.g., `pnpm --filter web build`)

5) Designer
   - After the first deployment, open the Designer from the project overview to visually edit pages.

6) Secrets & tokens
   - Use Vercel's Environment Variables and Secrets for API keys and tokens. Do not commit secrets to the repo.

7) Troubleshooting
   - If build fails, check the build logs in Vercel and ensure `pnpm` is selected as the package manager.
