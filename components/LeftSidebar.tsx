"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { api, type TopStockItem } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Skeleton row count per group — matches the 10-row layout shown in the design (5 gainers + 5 losers). */
const SKELETON_ROWS = 5;

/**
 * Left rail — Top Movers (gainers + losers). Visible on desktop only.
 * Fetches live data from /stocks/top-stocks; renders a shimmer skeleton
 * (10 rows) while loading or when the request fails so the rail never
 * flashes to an empty state.
 */
export function LeftSidebar() {
  const [gainers, setGainers] = useState<TopStockItem[] | null>(null);
  const [losers, setLosers] = useState<TopStockItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getTopStocks()
      .then((res) => {
        if (cancelled) return;
        setGainers(res.find((g) => g.type === "top-gainer")?.stocks ?? []);
        setLosers(res.find((g) => g.type === "top-looser")?.stocks ?? []);
      })
      .catch(() => {
        // Leave state null → shimmer stays
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = gainers === null || losers === null;
  const total = loading
    ? SKELETON_ROWS * 2
    : gainers.length + losers.length;

  return (
    <aside className="space-y-4" aria-label="Top movers kiri">
      <section
        className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
        aria-label="Top movers"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3 py-2">
          <h3 className="label">Top Movers · IDX</h3>
          <span className="font-mono text-[10px] text-text-muted num-tabular">
            {total} saham
          </span>
        </header>

        <MoverList
          title="Gainers"
          direction="up"
          loading={loading}
          rows={gainers ?? []}
        />
        <div className="border-t border-border" />
        <MoverList
          title="Losers"
          direction="down"
          loading={loading}
          rows={losers ?? []}
        />
      </section>
    </aside>
  );
}

interface MoverListProps {
  title: string;
  direction: "up" | "down";
  loading: boolean;
  rows: TopStockItem[];
}

function MoverList({ title, direction, loading, rows }: MoverListProps) {
  const Icon = direction === "up" ? ArrowUp : ArrowDown;
  const colorClass = direction === "up" ? "text-bullish" : "text-bearish";

  return (
    <div className="px-3 py-2">
      <p
        className={cn(
          "label mb-1.5 flex items-center gap-1",
          colorClass,
        )}
      >
        <Icon className="h-2.5 w-2.5" aria-hidden /> {title}
      </p>
      <ul className="space-y-0.5">
        {loading
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          : rows.map((s) => <Row key={s.ticker} stock={s} colorClass={colorClass} />)}
      </ul>
    </div>
  );
}

function Row({
  stock,
  colorClass,
}: {
  stock: TopStockItem;
  colorClass: string;
}) {
  const positive = stock.percent_change >= 0;
  return (
    <li>
      <Link
        href={`/stock/${stock.ticker}`}
        className="group flex items-center justify-between gap-2 rounded px-1 py-1.5 transition-colors hover:bg-bg-tertiary"
      >
        <div className="min-w-0">
          <p className="truncate font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand">
            {stock.ticker}
          </p>
          <p className="truncate text-[10.5px] text-text-muted">
            {stock.company_name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="num-tabular text-[11.5px] font-medium text-text-primary">
            {stock.price.toLocaleString("id-ID")}
          </p>
          <p
            className={cn(
              "num-tabular text-[10.5px] font-semibold",
              colorClass,
            )}
          >
            {positive ? "▲ +" : "▼ "}
            {Math.abs(stock.percent_change).toFixed(2)}%
          </p>
        </div>
      </Link>
    </li>
  );
}

/** Single shimmer row matching the layout of <Row>: ticker / name on the left, price / % on the right. */
function SkeletonRow() {
  return (
    <li className="flex items-center justify-between gap-2 rounded px-1 py-1.5">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-2.5 w-20 animate-pulse rounded bg-bg-tertiary/60" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-3 w-14 animate-pulse rounded bg-bg-tertiary" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-bg-tertiary/60" />
      </div>
    </li>
  );
}