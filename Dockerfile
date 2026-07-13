# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps with cache-friendly layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the standalone server bundle
COPY . .
RUN npm run build

# ---------- Stage 2: serve ----------
# `output: "standalone"` puts a self-contained Node.js server at
# .next/standalone/server.js. It already traces in only the runtime
# deps it needs, so we don't ship node_modules or the full source.
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Server entrypoint
COPY --from=builder /app/.next/standalone ./

# Static assets (Next.js _next/static) and user-uploaded public/
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]