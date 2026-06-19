# Base image
FROM node:18-alpine

WORKDIR /app

# Allow selecting environment file at build-time (defaults to development)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy only necessary files first (layer-cache friendly)
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Copy the requested environment file to .env (soft step — won't fail if missing)
RUN cp .env.${NODE_ENV} .env || true

# Build the static export (next build writes to ./out/ thanks to output: 'export')
RUN npm run build

EXPOSE 8080

# Serve the static export on 8080.
# --single makes SPA routes like /stock/BBCA fall back to index.html.
CMD ["sh", "-c", "npx --yes serve out -l 8080 --single"]