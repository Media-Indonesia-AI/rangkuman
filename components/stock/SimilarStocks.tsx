import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import type { RelatedStock } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SimilarStocksProps {
  sektor: string;
  relatedStocks?: RelatedStock[];
  loading?: boolean;
}

/** Internal shape — both the mock `Saham` and the API `RelatedStock`
 *  get normalized here so the JSX only deals with one shape. */
interface NormalizedStock {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
}

function normalizeApi(s: RelatedStock): NormalizedStock {
  return {
    ticker: s.name,
    companyName: s.company_name,
    price: s.price,
    changePercent: s.pct_change,
  };
}

/** Skeleton shown while the upstream fetch is in flight. Layout
 *  mirrors the real rows so the card height doesn't shift when
 *  the real payload arrives. Header stays mostly real — the icon
 *  and label are static across all data states, only the "sektor
 *  X" suffix shimmer-checks until we know what to render. */
function SimilarStocksShimmer({
  count,
}: {
  count: number;
}) {
  const list = (
    <ol
      className={cn(
        "divide-y divide-border",
      )}
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={`skel-${i}`} className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Ticker slot */}
          <Shimmer className="h-4 w-14" />
          {/* Middle column: name + price/change line */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <Shimmer className="h-2.5 w-3/4" />
            <div className="flex items-center gap-1.5">
              <Shimmer className="h-2.5 w-10" />
              <Shimmer className="h-2.5 w-8" />
            </div>
          </div>
          {/* Arrow slot */}
          <Shimmer className="h-3 w-3" />
        </li>
      ))}
    </ol>
  );

  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Saham serupa di sektor yang sama"
      aria-busy="true"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Saham Serupa</span>
        </div>
        <Shimmer className="h-2.5 w-20" />
      </header>
      {list}
    </section>
  );
}

/**
 * "Saham Serupa" — peer stocks surfaced either from the live
 * `ticker-information` API (preferred when `relatedStocks` is
 * passed) or from the in-memory mock catalog filtered by `sektor`
 * (fallback). Each card shows ticker, name, price, change, and an
 * optional sentiment badge derived from today's recap.
 *
 * Renders a shimmer skeleton while `loading` is true so the
 * upstream fetch's in-flight window doesn't fall through to the
 * mock fallback and flash real-but-wrong data.
 */
export function SimilarStocks({
  sektor,
  relatedStocks,
  loading = false,
}: SimilarStocksProps) {
  if (loading) {
    return <SimilarStocksShimmer count={3}/>;
  }

  const items: NormalizedStock[] = relatedStocks
    ? relatedStocks.map(normalizeApi)
    : [];

  if (items.length === 0) {
    return null;
  }

  const list = (
    <ol
      className={cn(
        "divide-y divide-border",
      )}
    >
      {items.map((s) => {
        const positive = s.changePercent >= 0;
        const href = `/stock/${s.ticker}`;
        return (
          <li key={s.ticker}>
            <Link
              href={href}
              className="group flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-bg-tertiary"
            >
              <span className="font-mono text-[14px] font-bold leading-none tracking-tighter text-text-primary group-hover:text-brand">
                {s.ticker}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] text-text-muted">
                  {s.companyName}
                </span>
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

              <ArrowUpRight
                className="h-3 w-3 shrink-0 text-text-faint transition-colors group-hover:text-brand"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-bg-secondary",
        'Similar Stocks',
      )}
      aria-label="Saham serupa di sektor yang sama"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Saham Serupa</span>
        </div>
        {/* Suffix is only meaningful when the list is sector-filtered
            from the mock; the API already pre-filters and the
            "sektor X" label would be misleading. */}
        {!relatedStocks && (
          <span className="font-mono text-[9.5px] text-text-faint">
            sektor {sektor}
          </span>
        )}
      </header>
      {list}
    </section>
  );
}