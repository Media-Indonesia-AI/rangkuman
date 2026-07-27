"use client";

import Link from "next/link";
import { FileText, X } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { getStockByKode } from "@/lib/mock/stocks";
import { getRecapForStock, TODAY_ISO } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";

interface WatchlistStockCardProps {
  kode: string;
}

/** Single watchlist tile — ticker, price, day change, sentiment + remove button. */
export function WatchlistStockCard({ kode }: WatchlistStockCardProps) {
  const { remove } = useWatchlist();
  const stock = getStockByKode(kode);

  if (!stock) {
    return (
      <article className="rounded-lg border border-border bg-bg-secondary p-3.5">
        <p className="font-mono text-[12px] text-bearish">
          ⚠ {kode} gak ditemukan di database.
        </p>
        <button
          type="button"
          onClick={() => remove(kode)}
          className="mt-2 text-[11.5px] text-text-muted hover:text-bearish"
        >
          Hapus
        </button>
      </article>
    );
  }

  const recap = getRecapForStock(kode, TODAY_ISO);
  const positive = stock.changePercent >= 0;
  const href = `/stock/${kode}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong hover:shadow-card-hover">
      {/* Top: ticker + remove */}
      <header className="flex items-start justify-between border-b border-border bg-bg-tertiary px-3 py-2">
        <Link href={href} className="min-w-0">
          <p className="font-mono text-[18px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
            {kode}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] text-text-muted">{stock.nama}</p>
        </Link>
        <button
          type="button"
          onClick={() => remove(kode)}
          aria-label={`Hapus ${kode} dari watchlist`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-secondary hover:text-bearish"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Price + change */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-[18px] font-bold leading-none tracking-tight text-text-primary num-tabular">
              {stock.price.toLocaleString("id-ID")}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-text-faint">{stock.sektor}</p>
          </div>
          <p
            className={cn(
              "font-mono text-[12.5px] font-semibold num-tabular",
              positive ? "text-bullish" : "text-bearish",
            )}
          >
            {positive ? "▲ +" : "▼ "}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </p>
        </div>

        {/* Sentiment + article count */}
        {recap ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <SentimentBadge sentiment={recap.sentimen} size="sm" showLabel={false} />
            <span className="inline-flex items-center gap-1 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              <FileText className="h-2.5 w-2.5" aria-hidden />
              {recap.jumlahBerita} artikel
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {recap.sumber.length} media
            </span>
          </div>
        ) : (
          <p className="font-mono text-[10.5px] text-text-faint">
            Belum ada recap hari ini
          </p>
        )}
      </div>
    </article>
  );
}