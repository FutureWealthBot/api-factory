# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS build
ENV PNPM_HOME=/root/.pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml package.json ./
COPY packages ./packages
COPY apps/admin-web/package.json ./apps/admin-web/package.json
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter ./apps/admin-web...

COPY . .
RUN pnpm --filter ./apps/admin-web... build

# Nginx (or any static server). Using tiny static server:
FROM pierrezemb/gostatic:latest
COPY --from=build /app/apps/admin-web/dist /srv/http
EXPOSE 3000
CMD ["-port","3000","-enable-logging"]
