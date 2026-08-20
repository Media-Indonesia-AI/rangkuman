"use client";

import Link from "next/link";
import { Sparkles, ChevronRight, Plus, ArrowUpRight } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { useTickerInformation } from "@/lib/hooks/useTickerInformation";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { WATCHLIST_LIMIT } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface WatchlistItemCardProps {
  kode: string;
}

/** Single watchlist tile — ticker, company name, price, day change, description.
 *
 *  Every visible field is gated on the API actually returning it: the
 *  `/stocks/ticker-information/{ticker}` endpoint may omit `company_name`,
 *  `price`, or `pct_change` for sparsely-covered tickers, so each section
 *  renders only when its source data is present. The `description` line
 *  is intentionally hidden when the API returns an empty string so the
 *  card doesn't reserve a blank line for tickers with no editorial
 *  summary yet. */
function WatchlistItemCard({ kode }: WatchlistItemCardProps) {
  const { data, isLoading } = useTickerInformation(kode);
  const description = data?.description?.trim() ?? "";
  const showDescription = description.length > 0;

  return (
    <Link
      href={`/stock/${kode}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-bg-secondary p-3 transition-all hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
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
        </div>
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 text-text-faint transition-colors group-hover:text-brand"
          aria-hidden
        />
      </div>
      {showDescription && (
        <p className="line-clamp-2 text-[11.5px] leading-snug text-text-muted">
          {description}
        </p>
      )}
    </Link>
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
        <Link
          href="/watchlist"
          className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-text-muted transition-colors hover:text-brand"
        >
          Lihat semua
          <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCodes.map((kode) => (
          <WatchlistItemCard key={kode} kode={kode} />
        ))}

        {/* CTA fills the remaining slot up to the visible cap.
            At the watchlist cap (10) this branch is also implicitly
            false because `MAX_VISIBLE_WATCHLIST` < `WATCHLIST_LIMIT` —
            every user at the cap already has ≥6 rows, so the grid
            is full and there's no slot to fill. */}
        {codes.length < WATCHLIST_LIMIT && (
          <Link
            href="/watchlist"
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-bg-secondary/40 p-3 text-center transition-colors hover:border-brand hover:bg-bg-secondary"
          >
            <Plus className="h-4 w-4 text-text-faint" aria-hidden />
            <span className="text-[12px] font-semibold text-text-primary">
              Tambah saham
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              Buka watchlist
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}