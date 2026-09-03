#!/usr/bin/env node
/**
 * CLI wrapper — runs `regenerateSitemaps` against `./public/`.
 * Useful for local dev: `npm run build:sitemaps` populates the
 * sitemap files before smoke-testing the build without booting
 * the full Next.js server.
 *
 * Production regeneration is handled by `instrumentation.ts`,
 * which imports the same shared `regenerateSitemaps` function
 * (see `lib/sitemap/generate.mjs`) and runs it on a 15-min cron
 * inside the same Node process — no `spawn()`, no scripts/ in
 * the runtime image.
 */

import { regenerateSitemaps } from "../lib/sitemap/generate.mjs";

const summary = await regenerateSitemaps();
console.log(
  `[build-sitemaps] wrote ${summary.files} files; ${summary.headlines} headlines indexed`,
);
