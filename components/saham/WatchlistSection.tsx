"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Plus, Newspaper, ArrowUpRight } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { getStockByKode } from "@/lib/mock/stocks";
import { getRecapForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";

/**
 * Home-page preview of the user's watchlist. Only renders when:
 *   - the user is logged in (caller decides via `enabled`)
 *   - the watchlist is non-empty
 */
export function WatchlistSection() {
  const { codes } = useWatchlist();

  const items = useMemo(() => {
    return codes
      .map((kode) => {
        const stock = getStockByKode(kode);
        const recap = getRecapForStock(kode, TODAY_ISO);
        if (!stock) return null;
        return { stock, recap };
      })
      .filter((it): it is NonNullable<typeof it> => it !== null);
  }, [codes]);

  if (items.length === 0) return null;

  // Aggregate: most discussed news from the watchlist
  const topNews = items
    .map((it) => it.recap)
    .filter((r): r is NonNullable<typeof r> => r !== undefined)
    .sort((a, b) => b.jumlahBerita - a.jumlahBerita)
    .slice(0, 5);

  return (
    <section aria-label="Watchlist kamu" className="mb-5">
      <header className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="label text-text-secondary">Watchlist kamu</span>
            <span className="font-mono text-[10.5px] text-text-muted">
              · {items.length} saham
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
        {items.slice(0, 6).map(({ stock, recap }) => {
          const positive = stock.changePercent >= 0;
          const href = `/stock/${stock.kode}`;
          return (
            <Link
              key={stock.kode}
              href={href}
              className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-3 transition-all hover:border-border-strong hover:shadow-card-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[15px] font-bold tracking-tighter text-text-primary group-hover:text-brand">
                    {stock.kode}
                  </span>
                  <span className="truncate text-[10.5px] text-text-muted">{stock.nama}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-text-secondary num-tabular">
                    {stock.price.toLocaleString("id-ID")}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10.5px] font-semibold num-tabular",
                      positive ? "text-bullish" : "text-bearish",
                    )}
                  >
                    {positive ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                  {recap && (
                    <SentimentBadge sentiment={recap.sentimen} size="sm" showLabel={false} />
                  )}
                </div>
              </div>
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-text-faint transition-colors group-hover:text-brand"
                aria-hidden
              />
            </Link>
          );
        })}

        {/* Show a CTA tile if user has 0-5 stocks */}
        {items.length < 6 && (
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

      {/* Top news from watchlist */}
      {topNews.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-bg-secondary/50">
          <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3 py-1.5">
            <Newspaper className="h-3 w-3 text-brand" aria-hidden />
            <span className="label">Berita terbaru dari watchlist</span>
            <span className="ml-auto font-mono text-[10px] text-text-faint">
              {topNews.length} cerita · {formatDate(TODAY_ISO)}
            </span>
          </header>
          <ul className="divide-y divide-border">
            {topNews.map((r) => {
              const href = `/stock/${r.sahamKode}`;
              return (
              <li key={r.id}>
                <Link
                  href={href}
                  className="group flex items-center gap-2 px-3 py-2 transition-colors hover:bg-bg-tertiary"
                >
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-faint num-tabular">
                    #{r.sahamKode}
                  </span>
                  <span className="line-clamp-1 flex-1 text-[12.5px] text-text-primary group-hover:text-brand">
                    {r.ringkasan.slice(0, 120)}
                    {r.ringkasan.length > 120 ? "…" : ""}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {r.jumlahBerita} art
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
