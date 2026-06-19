import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { stocks } from "@/lib/mock/stocks";
import { cn } from "@/lib/utils";

/**
 * Left rail — Top Movers (gainers + losers). Visible on desktop only.
 */
export function LeftSidebar() {
  const topGainers = [...stocks]
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
  const topLosers = [...stocks]
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <aside className="space-y-4" aria-label="Top movers kiri">
      {/* Top Movers combined widget — like cryptoslate's right column */}
      <section
        className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
        aria-label="Top movers"
      >
        <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3 py-2">
          <h3 className="label">Top Movers · IDX</h3>
          <span className="font-mono text-[10px] text-text-muted num-tabular">
            {topGainers.length + topLosers.length} saham
          </span>
        </header>

        <MoverList title="Gainers" rows={topGainers} direction="up" />
        <div className="border-t border-border" />
        <MoverList title="Losers" rows={topLosers} direction="down" />
      </section>
    </aside>
  );
}

interface MoverListProps {
  title: string;
  rows: typeof stocks;
  direction: "up" | "down";
}

function MoverList({ title, rows, direction }: MoverListProps) {
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
        {rows.map((s) => (
          <li key={s.kode}>
            <Link
              href={`/stock/${s.kode}`}
              className="group flex items-center justify-between gap-2 rounded px-1 py-1.5 transition-colors hover:bg-bg-tertiary"
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate font-mono text-[12px] font-semibold text-text-primary group-hover:text-brand",
                    // ANTM (loser) shows orange — keep its original ticker color highlight if we wanted
                  )}
                >
                  {s.kode}
                </p>
                <p className="truncate text-[10.5px] text-text-muted">
                  {s.nama}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="num-tabular text-[11.5px] font-medium text-text-primary">
                  {s.price.toLocaleString("id-ID")}
                </p>
                <p
                  className={cn(
                    "num-tabular text-[10.5px] font-semibold",
                    colorClass,
                  )}
                >
                  {s.changePercent >= 0 ? "+" : ""}
                  {s.changePercent.toFixed(2)}%
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
