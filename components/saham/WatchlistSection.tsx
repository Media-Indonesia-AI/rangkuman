"use client";

import Link from "next/link";
import { Sparkles, ChevronRight, Plus, X } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { useDeleteFromWatchlist } from "@/lib/hooks/useDeleteFromWatchlist";
import { WATCHLIST_LIMIT } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface WatchlistItemCardProps {
  kode: string;
}

/** Single watchlist tile — ticker, company name, price, day change, description, and remove.
 *
 *  Every visible field is gated on the API actually returning it: the
 *  `/stocks/ticker-information/{ticker}` endpoint may omit `company_name`,
 *  `price`, or `pct_change` for sparsely-covered tickers, so each section
 *  renders only when its source data is present. The `description` line
 *  is intentionally hidden when the API returns an empty string so the
 *  card doesn't reserve a blank line for tickers with no editorial
 *  summary yet.
 *
 *  The X (remove) button is a sibling of the Link, not a child of it,
 *  so click events don't bubble up to the link navigation. The list
 *  auto-refreshes after a successful remove: the mutation hook
 *  invalidates the watchlist cache, which notifies every mounted
 *  `useGetWatchlist` via the subscriber bus and the card unmounts when
 *  its row is dropped from the refreshed `items`. */
function WatchlistItemCard({ kode }: WatchlistItemCardProps) {
  const { data, isLoading } = useTickerInformation(kode);
  const { remove, isLoading: isRemoving } = useDeleteFromWatchlist();
  const description = data?.description?.trim() ?? "";
  const showDescription = description.length > 0;

  const handleRemove = async () => {
    // Capture the result so a failed remove is a visible
    // branch instead of a silent no-op — the previous version
    // discarded `await remove(...)` entirely, which would
    // hide failures from the toast pipeline. `watchlist_remove`
    // is fired from the hook on success only; the failure
    // branch surfaces the hook's localised `error` through
    // the consumer toast that's already wired up by callers.
    const result = await remove(kode);
    if (!result.ok) {
      // Hook has populated `error`; parent's toast pipeline
      // surfaces it. No further action needed here.
    }
  };

  return (
    <article className="group flex flex-col gap-2 rounded-lg border border-border bg-bg-secondary p-3 transition-all hover:border-border-strong hover:shadow-card-hover">
      <div className="flex items-center gap-3">
        <Link href={`/stock/${kode}`} className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[15px] font-bold tracking-tighter text-text-primary group-hover:text-brand">
              {kode}
            </span>
            {isLoading || !data ? (
              <Shimmer className="h-3 w-24" />
            ) : (
              <span className="truncate text-[10.5px] text-text-muted">
                {data.company_name}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {isLoading || !data ? (
              <Shimmer className="h-3 w-20" />
            ) : (
              <>
                <span className="font-mono text-[11px] text-text-secondary num-tabular">
                  {data.price.toLocaleString("id-ID")}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10.5px] font-semibold num-tabular",
                    data.pct_change >= 0 ? "text-bullish" : "text-bearish",
                  )}
                >
                  {data.pct_change >= 0 ? "+" : ""}
                  {data.pct_change.toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Hapus ${kode} dari watchlist`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-secondary hover:text-bearish disabled:opacity-50"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </div>
      {showDescription && (
        <p className="line-clamp-2 text-[11.5px] leading-snug text-text-muted">
          {description}
        </p>
      )}
    </article>
  );
}

export function WatchlistSection() {
  const { items } = useGetWatchlist();
  // Backend doesn't promise wire order; `order` is the source of
  // truth (sparse-tolerant per the schema). `.slice()` keeps the
  // sort from mutating React's state array.
  const codes = items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => item.ticker_code);
  const visibleCodes = codes.slice(0, WATCHLIST_LIMIT);
  const isAtLimit = codes.length >= WATCHLIST_LIMIT;

  if (codes.length === 0) return null;

  return (
    <section aria-label="Watchlist kamu" className="mb-5">
      <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Watchlist kamu</span>
            <span
              className={cn(
                "font-mono text-[10.5px]",
                // At the cap the counter shifts to `text-text-
                // secondary` so the fullness reads as deliberate
                // state, not just a quieter color.
                isAtLimit ? "text-text-secondary" : "text-text-muted",
              )}
            >
              · {codes.length}/{WATCHLIST_LIMIT} saham
            </span>
          </div>
          <h2 className="text-[15px] font-bold tracking-tight text-text-primary">
            Recap saham yang kamu pantau
          </h2>
        </div>
        {/* Same brand-primary button as the /watchlist page header so
            the two entry points read as one action. Hidden at the cap:
            the only path to add then is to remove a row from the grid
            first, and the empty-state CTA on /watchlist is unaffected
            because empty-state implies zero rows (never at the cap). */}
        {!isAtLimit && (
          <Link
            href="/watchlist"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-[12.5px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Tambah saham
          </Link>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCodes.map((kode) => (
          <WatchlistItemCard key={kode} kode={kode} />
        ))}
      </div>
    </section>
  );
}