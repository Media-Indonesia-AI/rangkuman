/**
 * `robots.txt` for the site.
 *
 * Two surfaces here:
 *
 *   1. **`rules`** — which crawlers can fetch which paths. We
 *      blanket-allow everything *except* the auth-gated and
 *      user-private routes (`/login/`, `/profile/*`, `/watchlist/`,
 *      `/search/[ticker]/` per-ticker result pages, etc.). The
 *      exclusion list mirrors the routes that have *no* entry in
 *      `app/sitemap.ts` — keeping the two files in lockstep is
 *      what tells Google "this isn't a bug, we actually don't
 *      want these crawled."
 *
 *   2. **`sitemap`** + **`host`** — point the crawler at every
 *      sitemap we publish. The standard `/sitemap.xml` is the
 *      union of `app/sitemap.ts` + `app/story/sitemap.ts`
 *      (Next.js merges them automatically). The news-specific
 *      `/news-sitemap.xml` (Google News format, separate
 *      namespace) is published at `app/news-sitemap.ts` for
 *      faster indexing of new stories.
 *
 * Why a separate news sitemap: Google indexes `news-sitemap.xml`
 * faster than the standard sitemap (which can take days to be
 * re-crawled). For time-sensitive content like Story cards this
 * is the difference between "indexed by tomorrow morning" and
 * "indexed next week". The cost is one extra endpoint that
 * duplicates the per-story URLs from the standard sitemap.
 *
 * `host` declares the canonical host — Google uses this to
 * consolidate duplicate-host signals (e.g. `www.` vs apex).
 */
import type { MetadataRoute } from "next";

const SITE_URL = "https://rangkuman.news";

/** Paths the crawler should NOT touch. Trailing slashes match
 *  `trailingSlash: true` in `next.config.js` and the canonical
 *  Next.js routing rules — `/profile` without a trailing slash
 *  308-redirects to `/profile/`, so disallow the slashed form
 *  only. */
const DISALLOWED_PATHS = [
  "/login/",
  "/daftar/",
  "/profile/",
  "/watchlist/",
  "/search/", // the search-results index; per-ticker pages are reachable from /search/
  "/api/", // any Next.js API routes (none today, but future-proof)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
    ],
    host: SITE_URL,
  };
}
