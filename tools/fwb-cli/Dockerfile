FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm i --prod --frozen-lockfile || pnpm i --prod
COPY . .
ENV PORT=8787 NODE_ENV=production
EXPOSE 8787
CMD ["node","server.js"]
