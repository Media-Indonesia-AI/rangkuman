import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { SentimentBadge } from "@/components/SentimentBadge";
import { Shimmer } from "@/components/Shimmer";
import type { RelatedStock } from "@/lib/api";
import { stocks as mockStocks, type Saham } from "@/lib/mock/stocks";
import { getRecapForStock } from "@/lib/mock/recaps";
import type { Sentimen } from "@/lib/mock/recaps";
import { cn } from "@/lib/utils";

interface SimilarStocksProps {
  /** Ticker to exclude from results. Used only by the mock-based
   *  fallback — when `relatedStocks` is provided, the backend has
   *  already excluded the current ticker. */
  excludeKode: string;
  /** Sector of the current stock. Used only by the mock-based
   *  fallback to filter peers. Ignored when `relatedStocks` is
   *  provided. */
  sektor: string;
  /** How many similar stocks to show. Default 3. Also drives the
   *  number of skeleton rows shown while `loading` is true. */
  limit?: number;
  className?: string;
  /**
   * When `true`, render only the `<ol>` peer list — no outer
   * `<section>` and no header. Used when composing into another
   * widget that already provides the container and label. Default
   * `false` (standalone card).
   *
   * In bare mode a top border is added to the list so it visually
   * separates from whatever sits above it inside the parent.
   */
  bare?: boolean;
  /**
   * Direct list of peer stocks from the API (e.g.
   * `ticker-information.related_stocks`). When provided, this list
   * is rendered as-is — preserving the backend's order — and the
   * mock-based sector filter is skipped.
   *
   * Each entry is shaped like `{ name, company_name, price,
   * pct_change }`. The backend is expected to have already
   * excluded the current ticker; `excludeKode` is not applied to
   * this list.
   *
   * `limit` still applies (caps the rendered slice) so callers can
   * keep using the same prop whether they pass API data or rely on
   * the mock fallback.
   */
  relatedStocks?: RelatedStock[];
  /**
   * When `true`, render a shimmer skeleton instead of real rows.
   * Set this while the upstream fetch (e.g. `useTickerInformation`)
   * is in flight — otherwise the widget would briefly fall back to
   * the mock catalog and flash real-but-wrong data before the API
   * response lands.
   *
   * The skeleton mirrors the real row layout (ticker slot + name
   * line + price/change line + arrow slot) and produces `limit`
   * rows so the card height matches the eventual content.
   */
  loading?: boolean;
}

/** Internal shape — both the mock `Saham` and the API `RelatedStock`
 *  get normalized here so the JSX only deals with one shape. */
interface NormalizedStock {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
  /** Mock-based stocks can attach a recap-derived sentiment. API
   *  stocks don't carry one (the backend doesn't include it in
   *  `related_stocks`), so it's optional. */
  sentiment?: Sentimen;
}

/** Mock recap lookup is keyed by a hardcoded "today" date inside
 *  `getRecapForStock`; keep the wrapper here so the render stays
 *  oblivious to that quirk. */
function normalizeMock(s: Saham): NormalizedStock {
  const recap = getRecapForStock(s.kode, "2026-06-07");
  return {
    ticker: s.kode,
    companyName: s.nama,
    price: s.price,
    changePercent: s.changePercent,
    sentiment: recap?.sentimen,
  };
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
  bare,
}: {
  count: number;
  bare: boolean;
}) {
  const list = (
    <ol
      className={cn(
        "divide-y divide-border",
        bare && "border-t border-border",
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

  if (bare) return list;

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
  excludeKode,
  sektor,
  limit = 3,
  className,
  bare = false,
  relatedStocks,
  loading = false,
}: SimilarStocksProps) {
  if (loading) {
    return <SimilarStocksShimmer count={limit} bare={bare} />;
  }

  const raw: NormalizedStock[] = relatedStocks
    ? relatedStocks.map(normalizeApi)
    : mockStocks
        .filter(
          (s) => s.sektor === sektor && s.kode !== excludeKode.toUpperCase(),
        )
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .map(normalizeMock);

  const items = raw.slice(0, limit);

  if (items.length === 0) {
    return null;
  }

  const list = (
    <ol
      className={cn(
        "divide-y divide-border",
        bare && "border-t border-border",
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
              {s.sentiment && (
                <SentimentBadge
                  sentiment={s.sentiment}
                  size="sm"
                  showLabel={false}
                />
              )}
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

  if (bare) return list;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-bg-secondary",
        className,
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