/**
 * Site-wide sitemap — covers the static (non-listing) routes
 * plus the per-headline detail URLs.
 *
 * The `/story` *listings* live in their own sub-sitemap
 * (`app/story/sitemap.ts`); Next.js automatically merges every
 * `sitemap.ts` it finds in the route tree into the same
 * `/sitemap.xml` output, so there's no manual `append` glue to
 * maintain here.
 *
 * URL policy:
 *
 *   - `trailingSlash: true` in `next.config.js` means the
 *     canonical is served at `/path/` — we mirror that here so
 *     Google doesn't see a 301 chain on its first crawl.
 *   - `<lastmod>` is fixed per-route-class, not `now`, because
 *     these pages don't carry row-level timestamps and we don't
 *     want to ping Google every build for a static page that
 *     only changes when the copy changes. The per-headline URLs
 *     do use `updated_at` from the wire — see below.
 *   - `changeFrequency` and `priority` follow Google's published
 *     guidance: home + section landings at 0.8, evergreen pages
 *     at 0.3.
 *
 * Per-headline detail URLs: the homepage's headline cards link
 * to `/sorotan/detail/[id]/`, so each headline id is a real
 * indexable page. We walk `/api/v1/headlines/` (the homepage's
 * auth-free data source — see `lib/sitemap/storyUrls.ts`) and
 * emit one entry per headline with `<lastmod>` from the wire's
 * `updated_at`. The walker is auth-free because it goes through
 * the Next.js middleware proxy the same way the browser does,
 * and the underlying endpoint gates on nothing.
 *
 * Routes that *aren't* listed here, by design:
 *
 *   - `/login/`, `/daftar/`, `/profile/*`, `/watchlist/`,
 *     `/profile/top-up/`, `/profile/whatsapp/`, `/search/[ticker]/`
 *     — auth-gated or user-private. `robots.ts` additionally
 *     `disallow`s these so the crawler doesn't even try.
 *   - `/stock/[kode]/[recapDate]/` — that's a per-day URL space
 *     that grows unboundedly; emitting each one would balloon
 *     the sitemap. It's reachable from the per-stock page
 *     (`/stock/[kode]/`) which IS indexed.
 *   - `/sektor/[slug]/`, `/sorotan/detail/[id]/` *and*
 *     `/story/[id]/` overlap — `/sorotan/detail/[id]/` is the
 *     canonical detail page and is emitted from the walker
 *     below; `/story/[id]/` is a sibling route for the same
 *     headline id. We emit only the canonical surface to keep
 *     the sitemap from double-counting and confusing Google
 *     about which URL to index.
 */
import type { MetadataRoute } from "next";
import { walkHeadlines } from "@/lib/sitemap/storyUrls";

const SITE_URL = "https://rangkuman.news";

/** Sections that look identical to users but have different
 *  copy/scope — emitted as their own entries so Google sees the
 *  landing surfaces distinctly instead of one canonical URL
 *  with no signal that the others exist. */
const SECTION_LANDINGS: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "hourly" },
  { path: "/saham/", priority: 0.8, changeFrequency: "hourly" },
  { path: "/crypto/", priority: 0.8, changeFrequency: "hourly" },
  { path: "/trending/", priority: 0.7, changeFrequency: "hourly" },
];

/** Evergreen / non-time-sensitive surfaces — terms, contact,
 *  search landing, etc. These get a low `priority` and a slow
 *  `changeFrequency` so Google doesn't churn on them. */
const EVERGREEN_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/syarat-ketentuan/", changeFrequency: "yearly" },
  { path: "/kontak-kerjasama/", changeFrequency: "yearly" },
  { path: "/search/", changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Single shared `lastModified` per build — fixed at function
  // entry so the sitemap is byte-stable across multiple sitemap
  // merges that happen in the same request. (Otherwise each
  // `new Date()` call would micro-drift and we'd emit a new
  // `<lastmod>` on every internal request.)
  const now = new Date();

  const sectionEntries: MetadataRoute.Sitemap = SECTION_LANDINGS.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const evergreenEntries: MetadataRoute.Sitemap = EVERGREEN_PAGES.map(
    ({ path, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority: 0.3,
    }),
  );

  // Per-headline detail URLs. The walker returns one entry per
  // published headline id, and each id maps to
  // `/sorotan/detail/[id]/` (the same URL the homepage cards
  // link to). `<lastmod>` is the wire's `updated_at` so Google
  // re-crawls changed rows faster than the static landings.
  // `changeFrequency: daily` is a safe default — the homepage
  // rotates throughout the day, so most rows DO change daily.
  const headlines = await walkHeadlines();
  const headlineEntries: MetadataRoute.Sitemap = headlines.map((h) => ({
    url: `${SITE_URL}/sorotan/detail/${h.id}/`,
    lastModified: h.updatedAt ?? now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...sectionEntries, ...evergreenEntries, ...headlineEntries];
}