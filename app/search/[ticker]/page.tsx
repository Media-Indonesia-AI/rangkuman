import { redirect } from "next/navigation";

/**
 * Forward `/search/{ticker}` to `/search/?q={ticker}`.
 *
 * The stock-row click in [SearchBar] issues
 * `router.push('/search/{ticker}')` — a path-segment URL. The
 * upstream `SearchPage` (at `/search`) reads the ticker from a
 * `?q=` query param rather than the path segment, so this route
 * exists purely as a forwarding shim: it catches the path-segment
 * URL and redirects to the canonical search URL on the next tick.
 *
 * Empty or whitespace-only tickers fall through to `/search`
 * (bare page, EmptyState) instead of producing `/search/?q=`,
 * which `SearchPage` would render as "no results for ''".
 *
 * The redirect runs server-side, so the user never actually
 * sees `/search/{ticker}` in their address bar — the browser
 * follows the 307 to `/search/?q={ticker}`, where `SearchPage`
 * applies the `stock_ticker eq {ticker}` filter and renders.
 */
export default function TickerSearchPage({
  params,
}: {
  params: { ticker: string };
}) {
  const ticker = params.ticker?.trim();
  if (!ticker) {
    redirect("/search");
  }
  redirect(`/search/?q=${encodeURIComponent(ticker)}`);
}
