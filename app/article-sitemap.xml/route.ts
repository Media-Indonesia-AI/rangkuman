import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `/article-sitemap.xml/` — per-article detail URLs with `lastmod`.
 *
 * Sister of `app/news-sitemap.xml/route.ts`. Where the news sitemap
 * is limited to the last 48h per the Google News spec, this one
 * carries the same URLs without a date cutoff (capped at 1,000
 * most-recent) so the full archive is crawlable via the standard
 * sitemap protocol.
 *
 * `force-dynamic` so Next.js never prerenders this at build time
 * (the cron, not the build, owns the content).
 * `Cache-Control: no-cache` so crawlers always refetch.
 *
 * See `app/sitemap.xml/route.ts` for the rationale on why a route
 * handler is used instead of `app/article-sitemap.xml.ts`
 * (`MetadataRoute.Sitemap`) — short version: Next.js standalone
 * only scans `/public` at boot, so files written at runtime by
 * the sitemap cron are invisible to the public-file router. A
 * route handler bypasses that scan.
 */
export async function GET() {
  const filePath = join(process.cwd(), "public", "article-sitemap.xml");
  const body = await readFile(filePath, "utf8");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
