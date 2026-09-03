#!/usr/bin/env node
/**
 * Build script — generates `sitemap.xml`, `page-sitemap.xml`,
 * `news-sitemap.xml` and writes them to `public/` so they're
 * deployed as static assets (and refreshed on a cron schedule
 * by `instrumentation.ts` while the server is running).
 *
 * Why a script (and not route handlers with ISR):
 *   - The output is meant to be a real file on disk that you
 *     can inspect, commit, and serve as a static asset.
 *   - The cron runs this same script on a 15-minute tick, so
 *     the files stay fresh while the container is up — no
 *     separate worker, no second runtime.
 *   - Build-time invocation (`npm run build` chains this in
 *     before `next build`) bakes the files into the standalone
 *     bundle, so the very first request after deploy is
 *     already fresh.
 *
 * Source data:
 *   The cross-topic headline feed (`GET /api/v1/headlines/`).
 *   Same surface the homepage uses, so the URLs we emit map
 *   1:1 to real indexable pages. Auth: the endpoint accepts an
 *   `X-Token` header (the same header the Next.js middleware
 *   injects). We pull the token from `API_INTERNAL_TOKEN`.
 *
 *   Pagination: same cap as the previous walker — 500 pages ×
 *   10 rows = 5k URLs, well under Google's 50k/sitemap ceiling
 *   and bounded against backend slowness.
 *
 * Usage:
 *   node scripts/build-sitemaps.mjs           # writes to ./public/
 *   SITE_URL=https://staging... node ...      # override canonical host
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const SITE_URL = process.env.SITE_URL ?? "https://rangkuman.news";
const API_BACKEND_URL = process.env.API_BACKEND_URL;
const API_INTERNAL_TOKEN = process.env.API_INTERNAL_TOKEN;

const PUBLICATION_NAME = "Rangkuman";
const PUBLICATION_LANGUAGE = "id";

const PAGE_SIZE = 10;
const MAX_HEADLINE_PAGES = 500;

const WIB_OFFSET_MINUTES = 7 * 60;

// ────────────────────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────────────────────

function wibIso(d) {
  const wib = new Date(d.getTime() + WIB_OFFSET_MINUTES * 60_000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}` +
    `T${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}:${pad(wib.getUTCSeconds())}` +
    `+07:00`
  );
}

// ────────────────────────────────────────────────────────────
// XML helpers
// ────────────────────────────────────────────────────────────

/** CDATA-wrap a value, defending against the `]]>` sequence
 *  that would otherwise break out of the section. */
function cdata(value) {
  if (!value) return "";
  return `<![CDATA[${String(value).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ────────────────────────────────────────────────────────────
// Headline fetcher
// ────────────────────────────────────────────────────────────

/**
 * Walks `/api/v1/headlines/` and returns a flat list of
 * `{ id, title, updatedAt, keywords }`. Returns `[]` on any
 * failure — never throws — so a transient backend hiccup
 * doesn't fail the whole build.
 */
async function fetchHeadlines() {
  if (!API_BACKEND_URL) {
    console.warn("[build-sitemaps] API_BACKEND_URL not set — skipping headlines");
    return [];
  }

  const entries = [];
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (API_INTERNAL_TOKEN) headers["X-Token"] = API_INTERNAL_TOKEN;

  for (let page = 0; page < MAX_HEADLINE_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    // The Next.js middleware proxies `/api/*` by stripping
    // `/api` and forwarding to `API_BACKEND_URL` with the
    // `X-Token` header injected. From this build script we
    // bypass that proxy and hit the backend directly — same
    // path the middleware would have rewritten to.
    const url = `${API_BACKEND_URL}/v1/headlines/?limit=${PAGE_SIZE}&skip=${skip}`;

    let res;
    try {
      res = await fetch(url, { method: "GET", headers });
    } catch (err) {
      console.warn(`[build-sitemaps] fetch failed at page ${page}:`, err.message);
      break;
    }
    if (!res.ok) {
      console.warn(`[build-sitemaps] non-OK ${res.status} at page ${page}`);
      break;
    }

    let body;
    try {
      body = await res.json();
    } catch {
      break;
    }
    const items = body?.data ?? [];
    if (items.length === 0) break;

    for (const item of items) {
      if (!item?.id) continue;
      const updatedAt = item.updated_at ? new Date(item.updated_at) : undefined;
      const keywords = (item.keywords ?? [])
        .map((k) => k?.label?.trim())
        .filter(Boolean);
      entries.push({
        id: item.id,
        title: item.title,
        updatedAt,
        keywords,
      });
    }
    if (items.length < PAGE_SIZE) break;
  }
  return entries;
}

// ────────────────────────────────────────────────────────────
// XML builders
// ────────────────────────────────────────────────────────────

/** Section landings + story listings + evergreen pages. */
function buildPageSitemap(now) {
  const lastmod = wibIso(now);

  const sections = [
    { path: "/", priority: "1.0", changefreq: "hourly" },
    { path: "/saham/", priority: "0.8", changefreq: "hourly" },
    { path: "/crypto/", priority: "0.8", changefreq: "hourly" },
    { path: "/trending/", priority: "0.7", changefreq: "hourly" },
  ];
  const stories = ["", "saham", "crypto"];
  const evergreen = [
    { path: "/syarat-ketentuan/", changefreq: "yearly" },
    { path: "/kontak-kerjasama/", changefreq: "yearly" },
    { path: "/search/", changefreq: "weekly" },
  ];

  const entry = (loc, priority, changefreq) =>
    [
      "\t<url>",
      `\t\t<loc>${escapeXml(loc)}</loc>`,
      `\t\t<lastmod>${lastmod}</lastmod>`,
      `\t\t<changefreq>${changefreq}</changefreq>`,
      `\t\t<priority>${priority}</priority>`,
      "\t</url>",
    ].join("\n");

  const urls = [
    ...sections.map((s) => entry(`${SITE_URL}${s.path}`, s.priority, s.changefreq)),
    ...stories.map((topic) =>
      entry(
        topic ? `${SITE_URL}/story/?topic=${topic}` : `${SITE_URL}/story/`,
        topic === "" ? "0.8" : "0.7",
        "hourly",
      ),
    ),
    ...evergreen.map((e) =>
      entry(`${SITE_URL}${e.path}`, "0.3", e.changefreq),
    ),
  ].join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** Google News format — per-headline detail URLs with title,
 *  publication_date, and keywords. Mirrors the format used by
 *  Indonesian newswires (see
 *  https://www.cnbcindonesia.com/market/sitemap_news.xml). */
function buildNewsSitemap(headlines) {
  const urls = headlines
    .map((h) => {
      const title = h.title?.trim() || h.id;
      const publicationDate = wibIso(h.updatedAt ?? new Date());
      const keywordsValue = (h.keywords ?? []).join(", ");

      const lines = [
        "\t<url>",
        `\t\t<loc>${cdata(` ${SITE_URL}/headline/detail/${h.id}/ `)}</loc>`,
        "\t\t<news:news>",
        "\t\t\t<news:publication>",
        `\t\t\t\t<news:name>${escapeXml(PUBLICATION_NAME)}</news:name>`,
        `\t\t\t\t<news:language>${escapeXml(PUBLICATION_LANGUAGE)}</news:language>`,
        "\t\t\t</news:publication>",
        `\t\t\t<news:publication_date>${publicationDate}</news:publication_date>`,
        `\t\t\t<news:title>${cdata(title)}</news:title>`,
      ];
      if (keywordsValue) {
        lines.push(`\t\t\t<news:keywords>${cdata(keywordsValue)}</news:keywords>`);
      }
      lines.push("\t\t</news:news>", "\t</url>");
      return lines.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<urlset",
    '\txmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '\txmlns:news="http://www.google.com/schemas/sitemap-news/0.9" >',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** Sitemap index pointing at the two sub-sitemaps. */
function buildSitemapIndex(now) {
  const lastmod = wibIso(now);
  const entries = ["/page-sitemap.xml", "/news-sitemap.xml"]
    .map(
      (path) =>
        [
          "\t<sitemap>",
          `\t\t<loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
          `\t\t<lastmod>${lastmod}</lastmod>`,
          "\t</sitemap>",
        ].join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
    "",
  ].join("\n");
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  mkdirSync(PUBLIC_DIR, { recursive: true });

  const now = new Date();
  const headlines = await fetchHeadlines();

  const files = [
    { name: "sitemap.xml", body: buildSitemapIndex(now) },
    { name: "page-sitemap.xml", body: buildPageSitemap(now) },
    { name: "news-sitemap.xml", body: buildNewsSitemap(headlines) },
  ];

  for (const { name, body } of files) {
    const target = join(PUBLIC_DIR, name);
    writeFileSync(target, body, "utf8");
    console.log(`✓ ${target} — ${body.length} bytes`);
  }

  console.log(
    `[build-sitemaps] wrote ${files.length} files; ${headlines.length} headlines indexed`,
  );
}

main().catch((err) => {
  console.error("[build-sitemaps] failed:", err);
  process.exit(1);
});
