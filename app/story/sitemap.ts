/**
 * Sitemap for the `/story` listing pages.
 *
 * Two URL surfaces feed this sitemap:
 *
 *   1. The cross-topic listing at `/story/`.
 *   2. The topic-scoped variants `/story/?topic=saham` and
 *      `/story/?topic=crypto` (driven by the inbound `?topic=`
 *      hint the listing reads — see `app/story/StoryPage.tsx:73-90`).
 *
 * Per-headline detail URLs (`/sorotan/detail/[id]/`) used to live
 * here too, fed by walking `headlines/multi-date-stories`. That
 * endpoint is auth-gated, so the walker would 401 from the
 * server-side sitemap context (no per-user Basic credentials are
 * reachable server-side). The walker was switched to the
 * auth-free `/api/v1/headlines/` endpoint that powers the
 * homepage, and the resulting `/sorotan/detail/[id]/` URLs now
 * live in the root sitemap (`app/sitemap.ts`) where they're
 * indexed together with the rest of the site's per-row URLs.
 *
 * `generateSitemaps()` + `revalidate` give us ISR on this segment
 * without forcing a full site rebuild every time the newsroom
 * publishes. Next.js calls `sitemap({ id })` once per id listed
 * below, caches the XML on disk for `revalidate` seconds, and
 * regenerates it on the next request after expiry.
 */
import type { MetadataRoute } from "next";

const SITE_URL = "https://rangkuman.news";

/** Topic-hint variants the listing accepts as `?topic=` — keeps
 *  the sitemap in lockstep with `StoryPage.tsx`'s accepted
 *  values (`"saham" | "crypto"` plus the absent-parameter
 *  default). */
const TOPIC_VARIANTS = ["", "saham", "crypto"] as const;

/** Refresh cadence for this sitemap's cached XML. One hour
 *  matches the listing page's `changeFrequency` below — the
 *  per-headline `<lastmod>` (in the root sitemap) already
 *  drives faster re-crawls for changed rows. */
export const revalidate = 3600;

/** One sitemap per topic variant. Next.js calls `sitemap()`
 *  below once per id; each invocation produces the matching
 *  slice. With only the three listing URLs here, this could be
 *  folded into a single sitemap; the split is kept so adding
 *  a topic-variant in the future is a one-line edit here. */
export function generateSitemaps() {
  return TOPIC_VARIANTS.map((topic) => ({ id: topic }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const topic = id;
  // The `topic` here is the `?topic=` hint the listing renders
  // against — `""` for the cross-topic default. Anything outside
  // the accepted set means `generateSitemaps` drifted out of sync
  // with `TOPIC_VARIANTS`; emit an empty sitemap rather than a
  // 500 so the rest of the site keeps rendering.
  if (!(TOPIC_VARIANTS as readonly string[]).includes(topic)) {
    return [];
  }
  const now = new Date();

  // `lastModified` is `now` rather than a fixed seed: the
  // listing content rotates as the newsroom publishes, so
  // "today" is the honest signal. `priority` is the standard
  // 0.8 for a section landing page; the topic variants drop to
  // 0.7 to reflect that they're filtered views of the same
  // content.
  return [
    {
      url: `${SITE_URL}/story/${topic ? `?topic=${topic}` : ""}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: topic === "" ? 0.8 : 0.7,
    },
  ];
}