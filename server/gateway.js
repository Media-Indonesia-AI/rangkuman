// Express-based reverse proxy gateway for Berita Investor.
// - Loads env file based on NODE_ENV (development/production).
// - Proxies /api/* → TARGET_API_BASE (strip /api prefix).
// - Proxies /ws/* → ws://TARGET_API_BASE (WebSocket upgrade).
// - CORS: allow ALLOWED_ORIGINS (comma-separated); defaults to "*" when unset.
// - GET /health → { status: "ok", target: TARGET_API_BASE }.
//
// Run with: npm run gateway
//
// Env (read from .env.development or .env.production based on NODE_ENV):
//   GATEWAY_PORT       default 5050
//   TARGET_API_BASE    default http://localhost:4004
//   ALLOWED_ORIGINS    default "" → allows "*"
//   NODE_ENV           development | production (controls which .env file is loaded)

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: resolve(__dirname, '..', envFile) });

const GATEWAY_PORT = Number(process.env.GATEWAY_PORT ?? 5050);
const TARGET_API_BASE =
  process.env.TARGET_API_BASE ?? 'http://localhost:4004';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowOrigin = (reqOrigin) => {
  if (ALLOWED_ORIGINS.length === 0) return '*';
  if (!reqOrigin) return undefined;
  return ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : undefined;
};

const setCorsHeaders = (req, res, next) => {
  const origin = allowOrigin(req.headers.origin);
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] ?? '*',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
};

const app = express();
app.disable('x-powered-by');
app.use(setCorsHeaders);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', target: TARGET_API_BASE }),
);

app.use(
  '/api',
  createProxyMiddleware({
    target: TARGET_API_BASE,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    logLevel: 'warn',
  }),
);

app.use(
  '/ws',
  createProxyMiddleware({
    target: TARGET_API_BASE.replace(/^http/, 'ws'),
    changeOrigin: true,
    pathRewrite: { '^/ws': '' },
    ws: true,
    logLevel: 'warn',
  }),
);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(GATEWAY_PORT, () => {
  console.debug(
    '[gateway] listening on http://localhost:' + GATEWAY_PORT,
  );
  console.debug('[gateway] proxying /api -> ' + TARGET_API_BASE);
});