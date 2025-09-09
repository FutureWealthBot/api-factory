FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm i --frozen-lockfile || pnpm i
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY --from=build /app ./
ARG TRACK=""
ENV TRACK=${TRACK}
EXPOSE 3000
CMD ["pnpm","preview","--port","3000","--host"]
