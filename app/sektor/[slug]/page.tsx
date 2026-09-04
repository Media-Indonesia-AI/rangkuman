import { loadSectors } from "@/lib/api/cache";
import { mapSector } from "@/lib/util/sectorMappers";
import { clampDescription } from "@/lib/util/clampDescription";

interface PageProps {
  params: { slug: string };
}

/**
 * Build the static-params list at build time by fetching the
 * live `GET stocks/sectors` catalog and mapping each wire row
 * to its display slug. Mirrors the structure of
 * `app/headline/detail/[id]/page.tsx`: `await params` (Next.js
 * 15), `alternates: { canonical }`, 160-char description clamp.
 *
 * Returns `[]` when the backend is unreachable so the build
 * doesn't hard-fail — the route falls back to on-demand
 * rendering via Next.js's `dynamicParams` default (`true`),
 * letting individual sector URLs still resolve at request time.
 */
export async function generateStaticParams() {
  try {
    const res = await loadSectors();
    return res.data.map((api) => ({ slug: mapSector(api).slug }));
  } catch {
    return [];
  }
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * route. Telegram, WhatsApp, X, LinkedIn, and Slack all fetch a
 * shared URL and read these tags to render the link preview —
 * without them the shared link shows only the bare URL.
 *
 * Sector data is fetched live via `loadSectors()` (the
 * request-level cache around `GET stocks/sectors`) and projected
 * onto the display shape by `mapSector()`. Wrapped in try/catch
 * so an unreachable backend still yields valid `<meta>` tags —
 * Telegram in particular drops the whole preview when one tag
 * is broken.
 */
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  let sektorName: string | null = null;
  let avgChange = 0;
  let topKodes: string[] = [];
  let totalStock = 0;
  let sektorSlug: string | null = null;
  try {
    const res = await loadSectors();
    const found = res.data
      .map(mapSector)
      .find((s) => s.slug === resolvedParams.slug);
    if (found) {
      sektorName = found.name;
      avgChange = found.avgChange;
      totalStock = found.totalStock;
      sektorSlug = found.slug;
      topKodes = [...found.stocks]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 4)
        .map((s) => s.kode);
    }
  } catch {
    // API unreachable — fall through to the generic "Sektor tidak
    // ditemukan" copy below so the share preview still indexes.
  }
  if (!sektorName || !sektorSlug) {
    return { title: "Sektor tidak ditemukan · Rangkuman" };
  }
  const changeStr = `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`;
  const title = `Sektor ${sektorName} ${changeStr} · Rangkuman`;
  const desc = `${topKodes.join(", ")} — ${totalStock} emiten ${sektorName.toLowerCase()}.`;
  const clippedDescription = clampDescription(desc);
  const canonical = `/sektor/${sektorSlug}/`;
  return {
    title,
    description: clippedDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: clippedDescription,
      siteName: "Rangkuman",
      locale: "id_ID",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: clippedDescription,
    },
  };
}

/** Route handler for /sektor/[slug]. Component lives in the
 *  `@/components/sektor-detail` widget folder (orchestrator +
 *  focused sub-components + state variants) — this file just
 *  re-exports the default so Next.js can pick it up.
 *
 *  `generateMetadata` / `generateStaticParams` live here too —
 *  both now source from the live `GET stocks/sectors` endpoint
 *  via `loadSectors()` + `mapSector()`, matching how every other
 *  page that needs SEO metadata at build time pulls live data. */
export { default } from "@/components/sektor-detail";