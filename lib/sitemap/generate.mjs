/**
 * Shared sitemap generation — single source of truth for
 * `public/sitemap.xml`, `public/page-sitemap.xml`, and
 * `public/news-sitemap.xml`.
 *
 * Two callers, same module:
 *
 *   - `instrumentation.ts` — runs at Next.js server boot and on
 *     a 15-minute cron, so the sitemaps stay fresh while the
 *     container is up. The cron lives in the same Node process
 *     as the main HTTP server, so there's no external scheduler
 *     to babysit and no `spawn()`-into-an-image-with-no-scripts/
 *     indirection.
 *
 *   - `scripts/build-sitemaps.mjs` — CLI for local dev. Same
 *     function, same output. Lets you populate the sitemaps
 *     without booting the full Next.js server.
 *
 * Plain ESM (`.mjs`) so both the standalone Node script and the
 * Next.js instrumentation hook can import it without a TS
 * transpile step.
 *
 * Node built-ins (`fs`, `path`) are loaded via dynamic import
 * inside the functions that need them — Next.js's webpack
 * treats `instrumentation.ts` (and modules it statically
 * imports) as edge-runtime compatible, where `fs` and `path`
 * don't exist. Dynamic imports of Node built-ins bypass that
 * bundling: webpack externalizes them, Node resolves them at
 * runtime. Native `fetch` is a global on Node 18+, no import.
 */

// No top-level Node imports — see comment above.
// (Top-level constants are fine; webpack handles plain string
// and number initializers without issue.)

const SITE_URL = process.env.SITE_URL ?? "https://rangkuman.news";
const API_BACKEND_URL = process.env.API_BACKEND_URL;
const API_INTERNAL_TOKEN = process.env.API_INTERNAL_TOKEN;

const PUBLICATION_NAME = "Rangkuman";
const PUBLICATION_LANGUAGE = "id";

const PAGE_SIZE = 10;
const MAX_HEADLINE_PAGES = 500;
const WIB_OFFSET_MINUTES = 7 * 60;

// Google News sitemap limits. Per
// https://developers.google.com/search/docs/specialty/news/sitemap-news:
//   - URLs must have been published in the last 2 days
//   - A news sitemap may contain at most 1,000 URLs
//
// Articles older than 48h go to the standard `/article-sitemap.xml`
// instead, which carries `<lastmod>` (no per-URL publication-date
// cap) and is also capped at 1,000 URLs to keep file size well
// under Google's 50 MB / 50,000-URL per-sitemap limits.
const NEWS_MAX_AGE_HOURS = 48;
const NEWS_MAX_URLS = 1000;
const ARTICLE_MAX_URLS = 1000;

// ────────────────────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────────────────────

/** Format a Date as a WIB (UTC+7) ISO string with seconds
 *  precision (no millis, trailing `+07:00` offset). `+07:00`
 *  keeps the wall-clock honest for an Indonesian publisher;
 *  Google accepts both `+07:00` and `Z` for `<lastmod>` and
 *  publication dates. */
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

/** XML special-char escape — used for fields where the content
 *  comes from the wire and could carry `&`, `<`, `>`, `'`, or
 *  `"`. Defensive escaping is cheap and keeps the file valid
 *  under schema changes on the backend side. */
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
 * Walks `${API_BACKEND_URL}/v1/headlines/` paginated by
 * `limit`/`skip` and returns a flat list of
 * `{ id, title, updatedAt, keywords }`. Returns `[]` on any
 * failure — never throws — so a transient backend hiccup
 * doesn't fail the whole regeneration.
 *
 * Hits the backend directly (bypassing the Next.js middleware
 * proxy) and injects `X-Token` ourselves — same header the
 * middleware injects on `/api/*` paths.
 */
async function fetchHeadlines() {
  if (!API_BACKEND_URL) {
    console.warn("[sitemap] API_BACKEND_URL not set — skipping headlines");
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
    const url = `${API_BACKEND_URL}/v1/headlines/?limit=${PAGE_SIZE}&skip=${skip}`;

    let res;
    try {
      res = await fetch(url, { method: "GET", headers });
    } catch (err) {
      console.warn(`[sitemap] fetch failed at page ${page}:`, err.message);
      break;
    }
    if (!res.ok) {
      console.warn(`[sitemap] non-OK ${res.status} at page ${page}`);
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
 *  publication_date, and keywords. Limited to the last 48 hours
 *  per the Google News sitemap spec; older articles go to the
 *  standard `/article-sitemap.xml`. Also capped at 1,000 URLs
 *  (the spec's hard limit). */
function buildNewsSitemap(headlines) {
  const cutoff = Date.now() - NEWS_MAX_AGE_HOURS * 60 * 60 * 1000;
  const recent = headlines
    .filter((h) => {
      const t = h.updatedAt ? h.updatedAt.getTime() : 0;
      return t >= cutoff;
    })
    .slice(0, NEWS_MAX_URLS);

  const urls = recent
    .map((h) => {
      const title = h.title?.trim() || h.id;
      const publicationDate = wibIso(h.updatedAt ?? new Date());
      const keywordsValue = (h.keywords ?? []).join(", ");

      const lines = [
        "\t<url>",
        // `<loc>` is plain text — no CDATA, and definitely no
        // leading/trailing whitespace (Google's parser is lenient
        // but other crawlers and validators are not).
        `\t\t<loc>${escapeXml(`${SITE_URL}/headline/detail/${h.id}/`)}</loc>`,
        "\t\t<news:news>",
        "\t\t\t<news:publication>",
        `\t\t\t\t<news:name>${escapeXml(PUBLICATION_NAME)}</news:name>`,
        `\t\t\t\t<news:language>${escapeXml(PUBLICATION_LANGUAGE)}</news:language>`,
        "\t\t\t</news:publication>",
        `\t\t\t<news:publication_date>${publicationDate}</news:publication_date>`,
        // `news:title` is the only field that genuinely benefits
        // from CDATA (titles can contain `&`, `<`, `>`, etc.).
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

/** Standard per-article sitemap — same URLs as the news sitemap
 *  but without the 48-hour cutoff, so the archive is fully
 *  crawlable. Capped at 1,000 URLs (most-recent first) so the
 *  file stays well inside Google's 50 MB / 50K-URL per-sitemap
 *  limits. The route handler for this file lives at
 *  `app/article-sitemap.xml/route.ts`. */
function buildArticleSitemap(headlines) {
  const recent = headlines.slice(0, ARTICLE_MAX_URLS);

  const urls = recent
    .map((h) => {
      const lastmod = wibIso(h.updatedAt ?? new Date());
      const loc = escapeXml(`${SITE_URL}/headline/detail/${h.id}/`);
      return [
        "\t<url>",
        `\t\t<loc>${loc}</loc>`,
        `\t\t<lastmod>${lastmod}</lastmod>`,
        "\t</url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

/** Sitemap index pointing at the three sub-sitemaps. */
function buildSitemapIndex(now) {
  const lastmod = wibIso(now);
  const entries = [
    "/page-sitemap.xml",
    "/article-sitemap.xml",
    "/news-sitemap.xml",
  ]
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
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Generate all three sitemap files and write them to `publicDir`.
 *
 * @param {object} [opts]
 * @param {string} [opts.publicDir] - override the output directory
 *   (defaults to `<cwd>/public`, which is `/app/public` at runtime
 *   in the standalone container — exactly where Next.js serves
 *   static files from).
 * @returns {Promise<{files: number, headlines: number}>}
 */
export async function regenerateSitemaps(opts = {}) {
  // Dynamic imports so this module can be bundled by Next.js's
  // webpack (which refuses Node built-ins in the instrumentation
  // context). Node resolves both `fs` and `path` natively at
  // runtime; the local CLI (`scripts/build-sitemaps.mjs`) doesn't
  // go through webpack and gets the same behavior.
  const { mkdirSync, writeFileSync } = await import(
    /* webpackIgnore: true */ "fs"
  );
  const { join } = await import(
    /* webpackIgnore: true */ "path"
  );

  const publicDir = opts.publicDir ?? join(process.cwd(), "public");
  mkdirSync(publicDir, { recursive: true });

  const now = new Date();
  const headlines = await fetchHeadlines();

  const files = [
    { name: "sitemap.xml", body: buildSitemapIndex(now) },
    { name: "page-sitemap.xml", body: buildPageSitemap(now) },
    { name: "article-sitemap.xml", body: buildArticleSitemap(headlines) },
    { name: "news-sitemap.xml", body: buildNewsSitemap(headlines) },
  ];

  for (const { name, body } of files) {
    writeFileSync(join(publicDir, name), body, "utf8");
  }

  return { files: files.length, headlines: headlines.length };
}
