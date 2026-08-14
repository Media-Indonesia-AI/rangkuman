import type { Metadata } from "next";
import { loadTickerInformation } from "@/lib/api/cache";

interface PageProps {
  params: { kode: string; recapDate: string };
}

/**
 * Cap `text` at `maxChars` characters, breaking at the last word
 * boundary and appending "…" if truncated. Keeps the
 * `og:description` / Twitter `description` under Telegram /
 * WhatsApp / X / LinkedIn / Slack's rough 160-character preview
 * sweet spot — otherwise the social scraper clips mid-word and
 * the preview reads as broken.
 *
 * Same helper as `app/sorotan/detail/[id]/page.tsx` and
 * `app/story/[id]/page.tsx` — duplicated rather than extracted
 * to a shared lib because each route is allowed to tweak the
 * default. Here the default stays 160 to match the other two
 * detail pages.
 */
function clampDescription(text: string, maxChars = 160): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

/**
 * Build the `<meta name="og:*">` and Twitter Card tags for this
 * recap day route. Telegram, WhatsApp, X, LinkedIn, and Slack all
 * fetch a shared URL and read these tags to render the link
 * preview — without them the shared link shows only the bare URL.
 *
 * The data source is the same `loadTickerInformation(ticker, date)`
 * the client page body uses (`useTickerInformation` calls the same
 * function), so the share preview never disagrees with what the
 * visitor sees after clicking through. The `(ticker, date)` cache
 * key in `lib/api/cache/ticker-information.ts` ensures concurrent
 * scrapers hitting the same URL share one upstream round-trip.
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
 * the ticker + (if known) its sector — better than letting
 * Next.js fall back to the root layout's generic brand metadata.
 *
 * Mirrors the structure of `app/sorotan/detail/[id]/page.tsx`,
 * including the `await params` (Next.js 15) and the 160-char
 * description clamp.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const kode = resolvedParams.kode.toUpperCase();
  const { recapDate } = resolvedParams;

  let companyName: string | null = null;
  let description: string | null = null;
  let sector: string | null = null;
  try {
    const info = await loadTickerInformation(kode, recapDate);
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
  const canonical = `/stock/${kode}/${recapDate}/`;
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

/**
 * Route handler for `/stock/{kode}/{recapDate}` (e.g. a search-result
 * card linking to a specific recap day for a ticker). The component
 * at `../StockDetailPage` already accepts an optional `recapDate` in
 * its `PageProps`, so this is a thin re-export — same forwarding
 * shape as `/search/[ticker]`.
 *
 * We never re-export the *static* path segment version of the file:
 * `app/stock/[kode]/page.tsx` owns `/stock/{kode}` (no recap date),
 * this file owns `/stock/{kode}/{recapDate}`. Both call the same
 * component, but Next.js needs a separate `page.tsx` per segment.
 */
export { default } from "../StockDetailPage";