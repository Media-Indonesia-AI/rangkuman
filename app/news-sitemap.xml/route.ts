import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `/news-sitemap.xml/` — Google News sitemap (separate namespace,
 * faster indexing of fresh story cards than the standard sitemap).
 *
 * See `app/sitemap.xml/route.ts` for the full rationale on why
 * this is a route handler instead of `app/news-sitemap.xml.ts`
 * (Next.js's `MetadataRoute.Sitemap` convention). Short version:
 * Next.js standalone only scans `/public` at boot, so files
 * written at runtime by the sitemap cron are invisible to the
 * public-file router. A route handler bypasses that scan.
 */
export async function GET() {
  const filePath = join(process.cwd(), "public", "news-sitemap.xml");
  const body = await readFile(filePath, "utf8");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
