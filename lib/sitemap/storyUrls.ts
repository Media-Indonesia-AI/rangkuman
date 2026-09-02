/**
 * Shared walker for sitemap routes that need to enumerate every
 * headline we publish.
 *
 * Used by two distinct surfaces today:
 *
 *   - `app/sitemap.ts` — the main site sitemap. Next.js merges
 *     this file's output with the per-`story` sitemap entries,
 *     so per-headline URLs land under `/sitemap.xml`.
 *   - `app/news-sitemap.xml/route.ts` — Google's News sitemap,
 *     which carries extra `<news:*>` fields and uses the same
 *     headline ids.
 *
 * Keeping the walk in one place means a single change (different
 * endpoint, different cache slot, different cap) propagates to
 * both surfaces — without it, the two sitemaps can drift (one
 * emits a headline, the other doesn't) and Google gets confused
 * about which one to trust.
 *
 * Error policy: any single page error `break`s rather than
 * throwing. A transient backend hiccup during a build shouldn't
 * 500 the sitemap — Google re-crawls on the next ISR tick.
 *
 * ## Why `/api/v1/headlines/` and not `headlines/multi-date-stories`
 *
 * `headlines/multi-date-stories` is the Stories feed (the
 * `/story/` listing's data source). The Stories endpoint is
 * gated on user auth (HTTP Basic from `localStorage`), and the
 * sitemap walker runs server-side with no access to those
 * credentials. Calling it without `Authorization: Basic` returns
 * `401 Unauthorized`, which is what we saw when this walker went
 * through `request()`.
 *
 * The cross-ticker headline feed (`GET /api/v1/headlines/`) is
 * what the homepage (`/`) renders, and the homepage works for
 * anonymous visitors — i.e. the endpoint is auth-free. That's
 * what makes it usable from a server context: the middleware
 * adds `X-Token` and the backend accepts the request without
 * any per-user credentials.
 *
 * Trade-off: the headline list covers every published headline
 * (saham, crypto, etc.) rather than only the Story listings.
 * For SEO purposes this is the right surface — each card on
 * the home page links to `/sorotan/detail/[id]/`, so each
 * headline id is a real indexable page. Walking a wider surface
 * gives Google a complete URL inventory of the site.
 *
 * ## Why a direct `fetch()` (and not `loadHeadlines()`)
 *
 * `loadHeadlines()` → `request()` short-circuits on the server
 * when `API_BACKEND_URL` is set and dials the backend host
 * directly (`lib/api/client.ts:84-90`). In dev that's often a
 * host the dev server can't reach. The relative `/api/v1/`
 * fallback also can't be used on Node — `fetch()` requires an
 * absolute URL and there's no implicit base to resolve against
 * server-side.
 *
 * Going through the middleware (`/api/v1/...`) re-uses the
 * exact path the browser already uses, so whatever auth / proxy
 * / rewrite chain makes the browser work also makes this fetch
 * work. The middleware is what adds the shared `X-Token` for
 * the upstream hop; we don't need to send any auth header here
 * because the headline endpoint is auth-free.
 */

import { headers } from "next/headers";
import type { StoryResponse } from "@/lib/api/types/story";

/** Page size for each walker request. 10 keeps the per-page
 *  payload small (headlines can carry long summaries) while
 *  still bounding the total request count: `MAX_HEADLINE_PAGES
 *  × 10 = 5k URLs`, well under Google's 50k-per-sitemap cap. */
const PAGE_SIZE = 10;

/** Hard cap on walked pages. 500 pages × 10 rows = 5k URLs —
 *  well below Google's 50k-per-sitemap ceiling and bounds the
 *  build cost if the backend is slow. The headline endpoint
 *  reports a `total` of ~8k rows as of writing, so this walks
 *  the entire public inventory; if it grows further, the right
 *  move is a sitemap index (one entry per topic-slice), not
 *  raising this cap. */
export const MAX_HEADLINE_PAGES = 500;

export interface HeadlineEntry {
  /** Headline id — used as `/sorotan/detail/[id]/` slug. */
  id: string;
  /** Headline title — only set when the caller needs it (e.g.
   *  Google's `<news:title>`). The standard sitemap doesn't
   *  use this so we keep it lazy. */
  title?: string;
  /** ISO `updated_at` from the wire — drives `<lastmod>` on
   *  the standard sitemap and `<news:publication_date>` on
   *  the news sitemap. `undefined` when the backend didn't
   *  ship the field (older responses) — callers fall back to
   *  `now`. */
  updatedAt?: Date;
}

/** Build the absolute origin the walker should hit. Pulls from
 *  the incoming request's `host` header so dev (`localhost:8080`)
 *  and prod (`rangkuman.news`) both resolve to a URL Node's
 *  `fetch()` can actually dial.
 *
 *  Falls back to a sensible default when `headers()` isn't
 *  available (e.g. during a static build with no request
 *  context). `x-forwarded-proto` is set by the upstream proxy
 *  in prod; in dev the request is plain http. */
function resolveOrigin(): string {
  const protoFallback = "http";
  const hostFallback = "localhost:8080";
  try {
    const h = headers();
    const proto = h.get("x-forwarded-proto") ?? protoFallback;
    const host = h.get("host") ?? hostFallback;
    return `${proto}://${host}`;
  } catch {
    // No request context — static prerender with no incoming
    // request. The sitemap will be regenerated on the next
    // request anyway (ISR), so this fallback only matters for
    // build-time placeholder output.
    return `${protoFallback}://${hostFallback}`;
  }
}

/** Walk the cross-topic headline feed page-by-page using
 *  `limit`/`skip` (offset) pagination.
 *
 *   - Returns a flat list of `{ id, title?, updatedAt? }`.
 *   - Stops on the first short page (`< PAGE_SIZE` rows) —
 *     that's the backend's terminal signal.
 *   - Stops on the first per-page error — callers should emit
 *     whatever was collected so far rather than failing the
 *     whole sitemap.
 *   - Stops after `MAX_HEADLINE_PAGES` to bound the build cost.
 *
 * Each entry maps to a real indexable page at
 * `/sorotan/detail/[id]/` — the same URL the homepage cards
 * link to. */
export async function walkHeadlines(
  options: { includeTitle?: boolean } = {},
): Promise<HeadlineEntry[]> {
  const includeTitle = options.includeTitle ?? false;
  const entries: HeadlineEntry[] = [];
  const origin = resolveOrigin();

  for (let page = 0; page < MAX_HEADLINE_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const url =
      `${origin}/api/v1/headlines/?limit=${PAGE_SIZE}&skip=${skip}`;

    let res: Response;
    try {
      // `cache: "no-store"` so the walker doesn't accidentally
      // cache a stale page response under Next.js's data cache.
      // ISR on the sitemap itself handles the per-sitemap
      // caching — we don't want a second cache layer hiding
      // fresh headlines from the walker.
      res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch {
      break;
    }
    if (!res.ok) break;

    let body: StoryResponse;
    try {
      body = (await res.json()) as StoryResponse;
    } catch {
      break;
    }
    const items = body?.data ?? [];
    if (items.length === 0) break;
    for (const item of items) {
      if (!item?.id) continue;
      const updatedAt = item.updated_at
        ? new Date(item.updated_at)
        : undefined;
      const entry: HeadlineEntry = { id: item.id, updatedAt };
      if (includeTitle) entry.title = item.title;
      entries.push(entry);
    }
    if (items.length < PAGE_SIZE) break;
  }
  return entries;
}