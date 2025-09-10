# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
ENV PNPM_HOME=/root/.pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# --- deps (cached) ---
COPY pnpm-lock.yaml package.json ./
COPY packages ./packages
COPY apps/api-cli/package.json ./apps/api-cli/package.json
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile --filter ./apps/api-cli...

# --- build (tsup) ---
COPY . .
RUN pnpm --filter ./apps/api-cli... build

# --- runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/api-cli/dist ./apps/api-cli/dist
COPY --from=base /app/apps/api-cli/package.json ./apps/api-cli/package.json
COPY --from=base /app/node_modules ./node_modules
EXPOSE 8787
CMD ["node","apps/api-cli/dist/index.js"]
