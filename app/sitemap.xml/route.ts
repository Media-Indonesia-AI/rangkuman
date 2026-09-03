import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `/sitemap.xml/` — sitemap index.
 *
 * Why a route handler instead of Next.js's built-in `app/sitemap.ts`
 * (`MetadataRoute.Sitemap`) convention:
 *
 *   1. The cron in `instrumentation.ts` refreshes `/app/public/*.xml`
 *      every 15 min from live headline data — that's the source of
 *      truth for what gets crawled.
 *   2. Next.js standalone snapshots `/public` ONCE at boot into an
 *      in-memory `Set` (`publicFolderItems` in
 *      `next/dist/server/lib/router-utils/filesystem.js`). Files
 *      written at runtime by the cron never enter that set, so
 *      `/sitemap.xml` 404s despite the file being on disk. A route
 *      handler bypasses that scan — it's matched from
 *      `app-paths-manifest.json`, not `publicFolderItems`.
 *
 * `force-dynamic` so Next.js never prerenders this at build time
 * (the cron, not the build, owns the content).
 * `Cache-Control: no-cache` so crawlers always refetch.
 */
export async function GET() {
  const filePath = join(process.cwd(), "public", "sitemap.xml");
  const body = await readFile(filePath, "utf8");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
