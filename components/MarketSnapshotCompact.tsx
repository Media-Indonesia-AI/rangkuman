import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { useMarketMoodData } from "@/lib/hooks/useMarketMoodData";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Shimmer } from "@/components/Shimmer";

export interface MarketSnapshotItem {
  id: string;
  label: string;
  value: string;
  change: number;
  changeUnit?: "%" | "bps" | "";
  /** Per-row shimmer flag — true while the matching fetch is still
   *  in flight. Drives the row to render pulsing placeholders
   *  instead of `n/a` so the loading window reads as "data on its
   *  way" rather than "data missing". */
  isLoading?: boolean;
}

interface MarketSnapshotCompactProps {
  className?: string;
  /** Header label override. */
  label?: string;
  /** Right-side meta override. */
  meta?: string;
}

/** Placeholder rendered for any field whose live source settled
 *  (success or error) but still returned nothing. Using `n/a`
 *  rather than `—` so the missing-value rows scan as "data not
 *  available" rather than decorative dash separators. The
 *  loading window is covered by {@link Shimmer} rows above this
 *  constant — see the `isLoading` flag on `MarketSnapshotItem`. */
const NA = "n/a";

/** Skeleton row mirroring the real row's two-column layout (label
 *  + value stacked on the left, change indicator on the right) so
 *  the card height stays stable while the data resolves and the
 *  swap to the real row doesn't cause a layout shift. Reused for
 *  every row regardless of which source is still in flight — the
 *  shape is identical so a single component covers all five. */
function MarketSnapshotRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Shimmer className="h-2 w-12" />
        <Shimmer className="h-3.5 w-20" />
      </div>
      <Shimmer className="h-3 w-14" />
    </div>
  );
}

function DirectionText({ value, unit }: { value: number; unit?: string }) {
  const u = unit ?? "%";
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-saham">
        <TrendingUp className="h-2.5 w-2.5" aria-hidden />
        +{value.toFixed(2).replace(/\.00$/, "")}
        {u}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-cat-kebijakan">
        <TrendingDown className="h-2.5 w-2.5" aria-hidden />
        {value.toFixed(2).replace(/\.00$/, "")}
        {u}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold text-text-muted">
      <Minus className="h-2.5 w-2.5" aria-hidden />
      0,00%
    </span>
  );
}

/**
 * Compact vertical market snapshot for sidebar use. 5 indicators stacked
 * vertically. Designed for narrow column (sticky, ~280-320px wide).
 *
 * Data source: live `useMarketMoodData()` hook → 5 rows mapped
 * 1-to-1 from the matching fetch payload. No mock fallback. Any
 * field whose source is still `null` (in-flight or failed fetch)
 * renders `n/a` in place of the value so the layout stays stable
 * while the rest of the row is still readable.
 *
 * Rendered values:
 *
 *   - IHSG        ← `compositeChart[last].price` (formatted with
 *                   thousand separators), change from `mood.ihsg_pct_change`
 *   - USD/IDR     ← `exchangeRate.data[last].rate`, change from `mood.usd_idr_pct_change`
 *   - BI Rate     ← `biRate.rate` (formatted as %, 2 dp), change from `biRate.bps` (bps)
 *   - Foreign Net ← `foreignFlow.summary.net_value` (compact Rp T/M),
 *                   change = sign of net value (signed magnitude
 *                   doesn't read as a direction)
 *   - Mood        ← `mood.label` + `mood.score` (no delta — the
 *                   label already encodes the band)
 */
export function MarketSnapshotCompact({
  className,
  label = "Markets Snapshot",
  meta = "real-time",
}: MarketSnapshotCompactProps) {
  const { biRate, exchangeRate, foreignFlow, compositeChart, mood, isLoading } =
    useMarketMoodData();

  const items = useMemo<MarketSnapshotItem[]>(() => {
    // IHSG — composite chart's last point is the freshest closing
    // value. The mood snapshot's `ihsg_pct_change` is the matching
    // day-change percent, so we pair them: value = price, change
    // = pct move. `isLoading.compositeChart || isLoading.mood`
    // because both sources drive this row — keep the shimmer up
    // until the last one settles.
    const ihsgClose = compositeChart?.[compositeChart.length - 1]?.price;
    const ihsgRow: MarketSnapshotItem = {
      id: "ihsg",
      label: "IHSG",
      value: ihsgClose != null ? formatNumber(ihsgClose, 2) : NA,
      change: mood?.ihsg_pct_change ?? 0,
      changeUnit: "%",
      isLoading: isLoading.compositeChart || isLoading.mood,
    };

    // USD/IDR — exchange rate series' last point. Pair with the
    // mood's `usd_idr_pct_change` for the day delta.
    const usdIdr = exchangeRate?.data?.[exchangeRate.data.length - 1]?.rate;
    const usdRow: MarketSnapshotItem = {
      id: "usd",
      label: "USD/IDR",
      value: usdIdr != null ? formatNumber(usdIdr, 0) : NA,
      change: mood?.usd_idr_pct_change ?? 0,
      changeUnit: "%",
      isLoading: isLoading.exchangeRate || isLoading.mood,
    };

    // BI Rate — dedicated `biRate` snapshot. The `rate` field is
    // already a percent (e.g. 6.25 → "6,25%"); the matching `bps`
    // change uses the `bps` unit, not percent.
    const biRow: MarketSnapshotItem = {
      id: "bi",
      label: "BI Rate",
      value: biRate ? `${formatNumber(biRate.rate, 2).replace(",", ".")}%` : NA,
      change: biRate?.bps ?? 0,
      changeUnit: "bps",
      isLoading: isLoading.biRate,
    };

    // Foreign Net — `summary.net_value` is the cross-market flow
    // in raw IDR. Compact-ify for the sidebar; the `change` field
    // is the sign (magnitude doesn't read as a direction).
    const netValue = foreignFlow?.summary.net_value;
    const foreignRow: MarketSnapshotItem = {
      id: "foreign",
      label: "Foreign Net",
      value: netValue != null ? formatCurrency(netValue, { compact: true }) : NA,
      change: netValue != null ? Math.sign(netValue) : 0,
      changeUnit: "%",
      isLoading: isLoading.foreignFlow,
    };

    // Market Mood — composite label band + score. No change
    // indicator because the label already encodes the band and
    // the score is the magnitude.
    const moodRow: MarketSnapshotItem = {
      id: "mood",
      label: "Market Mood",
      value: mood ? `${mood.label} · ${mood.score}` : NA,
      change: 0,
      changeUnit: "",
      isLoading: isLoading.mood,
    };

    return [ihsgRow, usdRow, biRow, foreignRow, moodRow];
  }, [biRate, exchangeRate, foreignFlow, compositeChart, mood, isLoading]);

  return (
    <section
      aria-label="Pasar hari ini"
      className={`rounded-lg border border-border-strong bg-bg-secondary/50 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between border-b border-border-strong px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-cat-ekonomi-2" aria-hidden />
          <h3 className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-secondary">
            {label}
          </h3>
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-text-faint">
          {meta}
        </span>
      </div>
      <ul>
        {items.map((it, i) =>
          // Per-row shimmer: when this row's source fetch is still
          // in flight we render the matching skeleton in place of
          // the real row — same outer `<li>` shell so the dividers
          // between rows stay aligned, and `aria-busy` so assistive
          // tech knows the section is mid-load. Once the fetch
          // settles (success or error) we fall back to the real
          // row, which uses `NA` for any field that arrived empty.
          it.isLoading ? (
            <li
              key={it.id}
              aria-busy="true"
              className={
                i < items.length - 1 ? "border-b border-border/50" : ""
              }
            >
              <MarketSnapshotRowSkeleton />
            </li>
          ) : (
            <li
              key={it.id}
              className={`flex items-center justify-between px-3 py-2 ${
                i < items.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-text-muted">
                  {it.label}
                </p>
                <p className="font-mono text-[14px] font-bold leading-none tracking-tight text-text-primary">
                  {it.value}
                </p>
              </div>
              <DirectionText value={it.change} unit={it.changeUnit} />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
