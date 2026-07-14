import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { stocks, type Saham } from "@/lib/mock/stocks";
import { getRecapForStock } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";

interface SimilarStocksProps {
  /** Ticker to exclude from results. */
  excludeKode: string;
  /** Sector of the current stock. */
  sektor: string;
  /** How many similar stocks to show. Default 3. */
  limit?: number;
  className?: string;
}

/**
 * "Saham Serupa" — up to N other stocks in the same sector. Each card shows
 * ticker, name, price, change, sentiment (from today's recap) and a small
 * cross-link to the stock detail page.
 */
export function SimilarStocks({ excludeKode, sektor, limit = 3, className }: SimilarStocksProps) {
  const similar: Saham[] = stocks
    .filter((s) => s.sektor === sektor && s.kode !== excludeKode.toUpperCase())
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)) // most-active first
    .slice(0, limit);

  if (similar.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Saham serupa di sektor yang sama"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Saham Serupa</span>
        </div>
        <span className="font-mono text-[9.5px] text-text-faint">sektor {sektor}</span>
      </header>

      <ol className="divide-y divide-border">
        {similar.map((s) => {
          const positive = s.changePercent >= 0;
          const href = `/stock/${s.kode}`;
          return (
            <li key={s.kode}>
              <Link
                href={href}
                className="group flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-bg-tertiary"
              >
                <span className="font-mono text-[14px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                  {s.kode}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] text-text-muted">{s.nama}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-text-faint">
                    <span className="num-tabular text-text-secondary">
                      {s.price.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={cn(
                        "num-tabular font-semibold",
                        positive ? "text-bullish" : "text-bearish",
                      )}
                    >
                      {positive ? "+" : ""}
                      {s.changePercent.toFixed(2)}%
                    </span>
                  </span>
                </span>
                {(() => {
                  const recap = getRecapForStock(s.kode, "2026-06-07");
                  if (!recap) return null;
                  return <SentimentBadge sentiment={recap.sentimen} size="sm" showLabel={false} />;
                })()}
                <ArrowUpRight
                  className="h-3 w-3 shrink-0 text-text-faint transition-colors group-hover:text-brand"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
