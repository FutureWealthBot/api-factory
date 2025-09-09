FROM node:20-alpine
WORKDIR /app
ARG TRACK=""
ENV TRACK=${TRACK}
COPY . .
RUN npm ci --omit=dev && npm run build
CMD ["node", "dist/server.js"]
