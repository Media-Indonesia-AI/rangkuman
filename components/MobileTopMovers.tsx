"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { stocks } from "@/lib/mock/stocks";
import { cn } from "@/lib/utils";

/**
 * Mobile-only Top Movers strip — horizontal scrollable ticker of gainers/losers.
 * On desktop, the full Top Movers widget is shown in the left sidebar instead.
 */
export function MobileTopMovers() {
  const gainers = [...stocks]
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
  const losers = [...stocks]
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary xl:hidden"
      aria-label="Top Movers"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3 py-1.5">
        <TrendingUp className="h-3 w-3 text-brand" aria-hidden />
        <h2 className="label">Top Movers · IDX</h2>
        <span className="ml-auto font-mono text-[10px] text-text-faint num-tabular">
          {gainers.length + losers.length} saham
        </span>
      </header>

      {/* Gainers — horizontal scroll */}
      <MoverRow title="Gainers" Icon={ArrowUp} rows={gainers} direction="up" />
      <div className="border-t border-border" />
      {/* Losers — horizontal scroll */}
      <MoverRow title="Losers" Icon={ArrowDown} rows={losers} direction="down" />
    </section>
  );
}

interface MoverRowProps {
  title: string;
  rows: typeof stocks;
  direction: "up" | "down";
  Icon: typeof ArrowUp;
}

function MoverRow({ title, rows, direction, Icon }: MoverRowProps) {
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
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide">
        {rows.map((s) => (
          <Link
            key={s.kode}
            href={`/stock/${s.kode}`}
            className="flex min-w-[120px] shrink-0 flex-col gap-0.5 rounded-md border border-border bg-bg-tertiary px-2.5 py-1.5 transition-colors hover:border-border-strong"
          >
            <span className="font-mono text-[12px] font-semibold text-text-primary">
              {s.kode}
            </span>
            <span className="truncate text-[10px] text-text-muted">
              {s.nama}
            </span>
            <span
              className={cn(
                "mt-0.5 font-mono text-[11px] font-semibold num-tabular",
                colorClass,
              )}
            >
              {s.changePercent >= 0 ? "+" : ""}
              {s.changePercent.toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
