import type { Metadata } from "next";
import { loadTickerInformation } from "@/lib/api/cache";
import { clampDescription } from "@/lib/util/clampDescription";

interface PageProps {
  params: { kode: string };
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * route. Telegram, WhatsApp, X, LinkedIn, and Slack all fetch a
 * shared URL and read these tags to render the link preview —
 * without them the shared link shows only the bare URL.
 *
 * The data source is the same `loadTickerInformation(ticker)`
 * the client page body uses (`useTickerInformation` calls the
 * same function), so the share preview never disagrees with what
 * the visitor sees after clicking through. Omitting the `date`
 * argument lets the API fall back to today (the per-(ticker,
 * date) cache key in `lib/api/cache/ticker-information.ts`
 * reflects that — an empty date is treated as "no date segment").
 *
 * Note on `og:image`: this route intentionally ships no OG image.
 * The dynamic `/og/[id]/` route is wired to `loadHeadlineById`
 * (story/headline data model), not to `loadTickerInformation`
 * (saham data model), so it can't be reused here. Shipping a
 * stock-specific dynamic OG route is a separate task; for now the
 * share preview renders title + description without a thumbnail.
 *
 * `loadTickerInformation` is wrapped in try/catch because if the
 * API is unreachable we still want to emit valid `<meta>` tags
 * (Telegram drops the whole preview when any tag is broken). On
 * error we fall through to a route-specific fallback that names
 * the ticker — better than letting Next.js fall back to the root
 * layout's generic brand metadata.
 *
 * Mirrors the structure of `app/sorotan/detail/[id]/page.tsx` and
 * `app/stock/[kode]/[recapDate]/page.tsx`, including the
 * `await params` (Next.js 15) and the 160-char description clamp
 * from `lib/util/clampDescription`.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const kode = resolvedParams.kode.toUpperCase();

  let companyName: string | null = null;
  let description: string | null = null;
  let sector: string | null = null;
  try {
    const info = await loadTickerInformation(kode);
    companyName = info.company_name || null;
    description = info.description || null;
    sector = info.sector_name || null;
  } catch {
    // API unreachable — fall through to the generic copy below
    // so the share preview still renders.
  }

  const displayName = companyName ?? kode;
  const title = `${kode} — ${displayName} · Rangkuman`;
  const fallbackDescription = sector
    ? `Ringkasan saham ${displayName} (${kode}) di sektor ${sector}.`
    : `Ringkasan saham ${displayName} (${kode}).`;
  const clippedDescription = clampDescription(description ?? fallbackDescription);

  // Relative path resolves against metadataBase in app/layout.tsx,
  // which is https://rangkuman.news. `trailingSlash: true` means
  // the URL is served with a trailing slash.
  const canonical = `/stock/${kode}/`;
  return {
    title,
    description: clippedDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
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

export { default } from "./StockDetailPage";