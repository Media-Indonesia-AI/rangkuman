"use client";

import Link from "next/link";
import { FileText, X } from "lucide-react";
import type { WatchlistItem } from "@/lib/api";
import { useDeleteFromWatchlist } from "@/lib/hooks/useDeleteFromWatchlist";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";
import { cn } from "@/lib/utils";

interface WatchlistStockCardProps {
  item: WatchlistItem;
}

/** Single watchlist tile — ticker, price, day change, article count + remove button.
 *
 *  Every visible field is gated on the API actually returning it: the
 *  `/stocks/ticker-information/{ticker}` endpoint may omit `price`,
 *  `pct_change`, `company_name`, `sector_name`, or `articles` for
 *  sparsely-covered tickers, so each section renders only when its
 *  source data is present. */
export function WatchlistStockCard({ item }: WatchlistStockCardProps) {
  const { remove, isLoading: isRemoving } = useDeleteFromWatchlist();
  const { refresh } = useGetWatchlist();
  const { data, isLoading } = useTickerInformation(item.ticker_code);

  /** Delete this row, then force the list hook to re-fetch so the
   *  card unmounts. The mutation hook has already invalidated the
   *  cache; `refresh()` bumps `refreshKey` so `useGetWatchlist`
   *  picks up the empty slot on its next effect run. */
  const handleRemove = async () => {
    const res = await remove(item.ticker_code);
    if (res !== null) {
      refresh();
    }
  };

  // Loading — keep the card shell so the watchlist grid doesn't
  // reflow when the response lands. Only the ticker is safe to show
  // since everything else is still in flight.
  if (isLoading && !data) {
    return (
      <article className="rounded-lg border border-border bg-bg-secondary p-3.5">
        <p className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary">
          {item.ticker_code}
        </p>
        <p className="mt-2 font-mono text-[10.5px] text-text-faint">Memuat…</p>
      </article>
    );
  }

  // Error / ticker not in the API — used to be silently masked by
  // the mock lookup. Offer a remove action so the user can clean up
  // stale entries (e.g. a ticker that was delisted).
  if (!data) {
    return (
      <article className="rounded-lg border border-border bg-bg-secondary p-3.5">
        <p className="font-mono text-[12px] text-bearish">
          ⚠ {item.ticker_code} gak ditemukan.
        </p>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className="mt-2 text-[11.5px] text-text-muted hover:text-bearish disabled:opacity-50"
        >
          Hapus
        </button>
      </article>
    );
  }

  const positive = data.pct_change >= 0;
  const articleCount = data.articles.length;
  const mediaCount = new Set(
    data.articles.map((a) => a.source_name).filter(Boolean),
  ).size;
  const hasArticles = articleCount > 0;
  const showPrice = data.price != null;
  const showChange = data.pct_change != null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover">
      <header className="flex items-start justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <Link href={`/stock/${item.ticker_code}`} className="min-w-0">
          <p className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
            {item.ticker_code}
          </p>
          {data.company_name && (
            <p className="mt-0.5 truncate text-[10.5px] text-text-muted">
              {data.company_name}
            </p>
          )}
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Hapus ${item.ticker_code} dari watchlist`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-secondary hover:text-bearish disabled:opacity-50"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Price + change — each side rendered only when its data is present. */}
        <div className="flex items-baseline justify-between">
          <div>
            {showPrice && (
              <p className="font-mono text-[18px] font-bold leading-none tracking-tight text-text-primary num-tabular">
                {data.price.toLocaleString("id-ID")}
              </p>
            )}
            {data.sector_name && (
              <p className="mt-0.5 font-mono text-[10px] text-text-faint">
                {data.sector_name}
              </p>
            )}
          </div>
          {showChange && (
            <p
              className={cn(
                "font-mono text-[12.5px] font-semibold num-tabular",
                positive ? "text-bullish" : "text-bearish",
              )}
            >
              {positive ? "▲ +" : "▼ "}
              {Math.abs(data.pct_change).toFixed(2)}%
            </p>
          )}
        </div>

        {/* Article count + media count — derived from `articles[]`. The
            "N media" sub-text only shows when there are actual distinct
            sources attached, otherwise we'd render "0 media" alongside
            "5 artikel" which is contradictory. */}
        {hasArticles && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              <FileText className="h-2.5 w-2.5" aria-hidden />
              {articleCount} artikel
            </span>
            {mediaCount > 0 && (
              <span className="font-mono text-[10px] text-text-muted">
                {mediaCount} media
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
