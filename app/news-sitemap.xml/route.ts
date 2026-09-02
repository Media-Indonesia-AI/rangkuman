/**
 * News sitemap — exposed at `/news-sitemap.xml`.
 *
 * Why a separate News sitemap:
 *
 *   Google's News crawler indexes `news-sitemap.xml` much faster
 *   than the standard sitemap (which can take days to be re-crawled
 *   even after a `<lastmod>` bump). For time-sensitive content like
 *   headlines — where the newsroom publishes throughout the day —
 *   the News sitemap is the difference between "indexed by tomorrow
 *   morning" and "indexed next week."
 *
 *   The format uses Google's `sitemap-news` namespace alongside the
 *   standard `sitemap` namespace:
 *
 *     - `<news:publication>` — publisher name + language. Hardcoded
 *       to "Rangkuman" / "id" because we have a single publisher.
 *     - `<news:publication_date>` — ISO timestamp of the headline's
 *       `updated_at` (or `now` when the backend didn't ship the
 *       field).
 *     - `<news:title>` — the headline. Falls back to the id when
 *       the title is missing so we never emit an empty title
 *       element (Google rejects the whole entry if `<news:title>`
 *       is empty).
 *
 *   Next.js's `sitemap.ts` convention only emits `/sitemap.xml`,
 *   not arbitrary XML paths. This file is a route handler
 *   instead — the `.xml` directory name makes the URL
 *   `/news-sitemap.xml` so the entry in `app/robots.ts` lines
 *   up directly.
 *
 * Source: the walker reads the same `/api/v1/headlines/` endpoint
 * the homepage uses (`<HomeHeadlines />` on `/`), so it's
 * auth-free — the Stories feed (`headlines/multi-date-stories`)
 * is auth-gated and can't be reached from a server-side walker
 * without per-user Basic credentials. The headline endpoint is
 * the right surface for a News sitemap anyway: every published
 * headline is a candidate news story.
 *
 * ISR: `revalidate` mirrors `app/sitemap.ts`'s cadence so both
 * surfaces refresh in lockstep.
 */
import { NextResponse } from "next/server";
import { walkHeadlines } from "@/lib/sitemap/storyUrls";

const SITE_URL = "https://rangkuman.news";
const PUBLICATION_NAME = "Rangkuman";
const PUBLICATION_LANGUAGE = "id";

/** One hour, matching the standard sitemap's cadence. The News
 *  crawler ignores `<lastmod>` but uses its own crawl schedule,
 *  so this only bounds the build cost of regenerating the file. */
export const revalidate = 3600;

/** XML special-char escape — used for the `<news:title>` and id
 *  fields where the content comes from the wire and could carry
 *  `&`, `<`, `>`, `'`, or `"`. We escape every value going into
 *  the XML body even when the input "looks safe" — defensive
 *  escaping is cheap and keeps the file valid under schema
 *  changes on the backend side. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Google requires `YYYY-MM-DDThh:mm:ss+00:00` (or `Z`) for
 *  `<news:publication_date>`. `Date.prototype.toISOString()` emits
 *  `YYYY-MM-DDTHH:mm:ss.sssZ` — the milliseconds and trailing `Z`
 *  are accepted by Google, but we normalize to seconds precision
 *  to keep the file byte-stable across regenerations on the same
 *  dataset (so the cache hit rate isn't tanked by 1-ms drift). */
function isoSeconds(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

export async function GET(): Promise<NextResponse> {
  // `<news:title>` is required, so we ask the walker to include
  // titles here. The standard sitemap skips this for size.
  const headlines = await walkHeadlines({ includeTitle: true });
  const now = new Date();

  const urls = headlines
    .map((h) => {
      // Empty title — fall back to the id so we never emit
      // `<news:title></news:title>` (which Google treats as a
      // hard validation error and skips the whole entry).
      const title = h.title?.trim() || h.id;
      const publicationDate = isoSeconds(h.updatedAt ?? now);
      return [
        "  <url>",
        `    <loc>${xmlEscape(`${SITE_URL}/sorotan/detail/${h.id}/`)}</loc>`,
        "    <news:news>",
        "      <news:publication>",
        `        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>`,
        `        <news:language>${xmlEscape(PUBLICATION_LANGUAGE)}</news:language>`,
        "      </news:publication>",
        `      <news:publication_date>${publicationDate}</news:publication_date>`,
        `      <news:title>${xmlEscape(title)}</news:title>`,
        "    </news:news>",
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      // `application/xml` is the canonical MIME for any XML
      // sitemap. `Cache-Control` lets CDNs and the browser cache
      // the file for the full revalidate window without
      // re-fetching on every ISR tick — Next.js revalidates the
      // underlying fetch and serves the cached bytes between.
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
