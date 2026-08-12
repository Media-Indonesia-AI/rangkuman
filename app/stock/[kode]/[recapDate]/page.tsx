import type { Metadata } from "next";
import { loadTickerInformation } from "@/lib/api/cache";

interface PageProps {
  params: { kode: string; recapDate: string };
}

/**
 * Cap `text` at `maxChars` characters, breaking at the last word
 * boundary and appending "…" if truncated. Keeps the OG/Twitter
 * description under the rough 200-character sweet spot that
 * Telegram, WhatsApp, X, LinkedIn, and Slack all render cleanly.
 */
function clampText(text: string, maxChars: number): string {
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
 * Note on `og:image`: this route uses the root-level
 * `/og-default.png` fallback rather than the dynamic
 * `/og/[id]/` route. The dynamic OG route is wired to
 * `loadHeadlineById` (story/headline data model), not to
 * `loadTickerInformation` (saham data model). Shipping a stock-
 * specific dynamic OG route is a separate task; the default image
 * still produces a working share preview.
 *
 * `loadTickerInformation` is wrapped in try/catch because if the
 * API is unreachable we still want to emit valid `<meta>` tags
 * (Telegram drops the whole preview when any tag is broken).
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const kode = params.kode.toUpperCase();
  const { recapDate } = params;

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
  const descriptionText = clampText(description ?? fallbackDescription, 200);

  // Relative path resolves against metadataBase in app/layout.tsx,
  // which is https://rangkuman.news. `trailingSlash: true` means
  // the URL is served with a trailing slash.
  const canonical = `/stock/${kode}/${recapDate}/`;
  const ogImage = "/og-default.png";
  return {
    title,
    description: descriptionText,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description: descriptionText,
      siteName: "Rangkuman",
      locale: "id_ID",
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: descriptionText,
      images: [ogImage],
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