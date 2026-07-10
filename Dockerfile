# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps with cache-friendly layer
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the static site
COPY . .
RUN npm run build

# ---------- Stage 2: serve ----------
FROM nginx:1.27-alpine

# Replace the default site config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static export output from Next.js (`output: 'export'` → ./out)
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]