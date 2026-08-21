/**
 * Widget builders for the Market Mood strip. Each `buildXWidget(...)`
 * constructs a complete `MarketWidget` from scratch using the live data
 * source plus a `loading` flag — no input array, no merge step. The
 * caller (`<MarketMood>`) just concatenates the returned widgets into
 * the strip's grid.
 *
 * `loading === true` → widget is flagged for shimmer rendering in
 * `<MarketMoodCell>`. Live fields (`value`, `staticSubLabel`,
 * `sparklineData`, etc.) get "—" placeholders so the cell layout is
 * stable while the fetch is in flight.
 *
 * `loading === false && data === null` → same placeholder values,
 * `loading: false`. Cell renders the static label with a blank value
 * row (a small visual regression vs. the prior mock-fallback behavior
 * — acceptable here since the user explicitly asked to drop the
 * `widgets` prop and source everything from live data).
 *
 * `loading === false && data !== null` → widget is populated with
 * the formatted live values.
 *
 * These are pure functions — no React, no I/O, no hooks — so they
 * can be unit-tested in isolation by passing in mock data and
 * asserting the returned widget's shape.
 */

import type {
  CompositeChartPoint,
  ExchangeRateChartResponse,
  ForeignStocksResponse,
  InterestRate,
  MarketMood,
} from "@/lib/api";
import { formatSingkat } from "@/lib/util/formatDate";
import {
  bpsBadge,
  buyRatioPercent,
  formatBps,
  formatCompactIdr,
  formatIhsgPrice,
  formatIdrRate,
  formatRate,
  isEmptyForeignFlow,
} from "@/lib/util/formatNumber";

/** Common placeholder when no data has arrived yet. */
const PLACEHOLDER = "—";

// ── Widget view-model ────────────────────────────────────────────
// `MarketWidget` is the cell-renderer's view-model: produced by the
// `buildXWidget(...)` builders below and consumed by `MarketMoodCell`,
// the cell renderer. It lives here (not in `lib/api/` or `lib/mock/`,
// both of which it is related to but neither of which it belongs to)
// because its shape is the contract between the builder and the
// renderer — co-locating it with the builder makes adding a new
// widget type a single-file change.

/** Visualization slot the cell renders. */
export type MarketWidgetType = "sparkline" | "gauge" | "bar" | "static";

/** One cell in the Market Mood strip's widget grid. */
export interface MarketWidget {
  id: string;
  label: string;
  /** Big primary value, e.g. "7.245,50". */
  value: string;
  /** Day change % (signed; can be negative). */
  changePercent: number;
  type: MarketWidgetType;
  /** Sparkline series. **Plain numbers** (`number[]`), not the rich
   *  `CompositeChartPoint[]` shape — the builders strip the
   *  metadata (`.map((p) => p.price)`) so the cell can hand the
   *  array straight to `<SparklineChart data={...} />`, which only
   *  knows how to draw a flat numeric series. Required if
   *  `type === "sparkline"`. */
  sparklineData?: number[];
  /** Gauge 0–100. Required if `type === "gauge"`. */
  gaugeValue?: number;
  /** Gauge label (e.g. "Optimis"). */
  gaugeLabel?: string;
  /** Bar 0–100 (left to right). Required if `type === "bar"`. */
  barValue?: number;
  /** Bar left label (e.g. "Net Sell"). */
  barLeftLabel?: string;
  /** Bar right label (e.g. "Net Buy"). */
  barRightLabel?: string;
  /** Static sub-label below the value (e.g. "+25 bps" or "Tahan").
   *  Required if `type === "static"`. */
  staticSubLabel?: string;
  /** Optional override for the right-column **badge** text — when
   *  set, the cell renders this in the badge slot instead of
   *  `staticSubLabel` (which would otherwise be reused for both
   *  slots). Useful when the sub-label and the badge should show
   *  different facts (e.g. BI Rate: bps in the sub-label, decision
   *  date in the badge) rather than a combined string. Falls back
   *  to `staticSubLabel` when omitted, so existing static widgets
   *  keep their current behavior untouched. */
  staticBadgeLabel?: string;
  /** Static badge — controls color of sub-label (matches sentiment palette). */
  staticBadge?: "bullish" | "bearish" | "mixed";
  /**
   * When `true`, the renderer replaces value + visualization with a
   * shimmer placeholder. The label stays visible (it's static across
   * all data states). Set by merge functions whose backing fetch is
   * still in flight.
   */
  loading?: boolean;
}

/**
 * Compute the percent change from a single `CompositeChartPoint`.
 *
 * The API exposes each point's accumulated session change directly
 * as `price_change` (the absolute delta from the previous close to
 * this tick) and `price` (the current price). The percentage change
 * is just the ratio, so `((price_change) / price) * 100`. The
 * `?? 0` / `?? 1` fallbacks keep the math safe when a point is
 * missing (`undefined`) or malformed (`price: 0` would otherwise
 * produce `Infinity` / `NaN`). Both fallbacks collapse to `0`%
 * so the cell renders a placeholder rather than a broken number.
 */
function pctChangeFromSeries(series: CompositeChartPoint | undefined): number {
  return ((series?.price_change ?? 0) / (series?.price ?? 1)) * 100;
}

/**
 * Build the BI Rate widget from `loadInterestRate`'s payload. While
 * loading the widget renders with `value`/`staticSubLabel` as "—" so
 * the shimmer slot has shape to occupy. When data lands, formats
 * the rate as `"5,75%"`, the left-column sub-label as the raw bps
 * delta (`"25 bps"` — no `+` prefix, per request), and the right-
 * column badge as the previous rate decision's `last_rate_date`
 * (`"3 Agt 2026"`). Decoupling the two lets the cell show two
 * distinct facts side-by-side instead of a single combined string,
 * and the existing `staticSubLabel` slot stays untouched in case
 * future consumers want it back.
 */
export function buildBiRateWidget(
  biRate: InterestRate | null,
  loading: boolean,
): MarketWidget {
  return {
    id: "bi-rate",
    label: "BI Rate",
    value: biRate ? formatRate(biRate.rate) : PLACEHOLDER,
    changePercent: 0,
    type: "static",
    staticSubLabel: biRate ? `${biRate.bps} bps` : PLACEHOLDER,
    staticBadgeLabel: biRate
      ? formatSingkat(biRate.last_rate_date, "d MMM y")
      : undefined,
    staticBadge: biRate ? bpsBadge(biRate.bps) : "mixed",
    loading,
  };
}

/**
 * Build the USD/IDR widget from the exchange-rate chart series.
 * `value` is the latest rate (formatted as `"16.320"`), and the full
 * sorted series feeds `sparklineData` so the existing sparkline slot
 * renders the real curve.
 *
 * `changePercent` is derived from the sparkline endpoints
 * (`((last - first) / first) * 100`) rather than read from the
 * mood snapshot. Because the chart series is session-tick granularity,
 * the first/last percentage reflects the change from the first tick
 * of the session to the latest tick — a "session today" figure
 * rather than the API's previous-close-to-now `pct_change`. The
 * cell relies on this for the `▲/▼` sign and color.
 *
 * SparklineChart needs ≥2 points to render anything; below that
 * (loading, single-point response, error), `sparklineData` is left
 * undefined so the visualization column shows nothing rather than a
 * broken curve, and `changePercent` falls back to `0` (via
 * `pctChangeFromSeries`).
 */
export function buildUsdIdrWidget(
  res: ExchangeRateChartResponse | null,
  mood: MarketMood | null,
  loading: boolean,
): MarketWidget {
  const points = res?.data;
  const sortedRates =
    points && points.length >= 2
      ? points
          .slice()
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .map((p) => p.rate)
      : undefined;
  const last = sortedRates?.[sortedRates.length - 1];
  return {
    id: "usd-idr",
    label: "USD/IDR",
    value: last !== undefined ? formatIdrRate(last) : PLACEHOLDER,
    changePercent: mood?.usd_idr_pct_change ?? 0,
    type: "sparkline",
    ...(sortedRates !== undefined ? { sparklineData: sortedRates } : {}),
    loading,
  };
}

/**
 * Build the Foreign Flow widget from `/stocks/foreign-stocks`'s
 * summary row. `value` is the formatted net_value (e.g. `"-412,5 M"`)
 * and `barValue` is the buy/sell ratio (used by the progress bar to
 * indicate buy-side dominance visually).
 *
 * `requestDate` is the **effective** ISO date (`YYYY-MM-DD`) the
 * payload actually represents — the cache wrapper may have shifted
 * back a day on 503 before landing a 200, and the date the widget
 * shows should match the data, not the caller's initial request.
 * Surfaced as the sub-label slot (e.g. `"3 Agt 2026"`) so the
 * user sees which trading session the net-flow numbers represent.
 *
 * `null` while the fetch is in flight or after an error — no
 * successful response → no effective date to show, so
 * `staticSubLabel` is left undefined and `<MarketMoodCell>` falls
 * back to its `"Harian"` placeholder instead of flashing a stale
 * or misleading date.
 *
 * When the snapshot is missing or has no flow to display (all zeros),
 * `value` becomes "—" and `barValue` is undefined so the bar slot
 * renders nothing; the date label still surfaces so the user knows
 * the snapshot is current.
 */
export function buildForeignFlowWidget(
  foreignFlow: ForeignStocksResponse | null,
  loading: boolean,
  requestDate: string | null,
): MarketWidget {
  const empty = isEmptyForeignFlow(foreignFlow);
  const s = empty ? null : foreignFlow!.summary;
  const barValue = s ? buyRatioPercent(s.buy_volume, s.sell_volume) : undefined;
  return {
    id: "foreign-flow",
    label: "Foreign Flow",
    value: s ? formatCompactIdr(s.net_value) : PLACEHOLDER,
    changePercent: 0,
    type: "bar",
    barValue,
    barLeftLabel: "Net Sell",
    barRightLabel: "Net Buy",
    // Reused as the sub-label slot — `<MarketMoodCell>` renders
    // `staticSubLabel` for `type === "bar"` (muted) in place of
    // the previous hardcoded `"Harian"`. `formatSingkat` returns
    // `"N/A"` if the date is malformed, which is preferable to
    // crashing on bad input. We only set the label when the
    // hook has handed us a real effective date — `null` →
    // undefined here so the cell's `Harian` fallback fires
    // instead of showing a misleading label during loading /
    // error states.
    staticSubLabel: requestDate
      ? formatSingkat(requestDate, "d MMM y")
      : undefined,
    loading,
  };
}

/**
 * Build the IHSG widget from the composite-chart series. `value` is
 * the price from the **last** data point (formatted as `"7.245,50"`),
 * and the full price series feeds `sparklineData` so the SparklineChart
 * renders the real intraday curve.
 *
 * `changePercent` is derived from the **last** `CompositeChartPoint`'s
 * `price_change / price` ratio (via `pctChangeFromSeries`) rather than
 * re-derived from the sparkline endpoints. The API already exposes
 * `price_change` as the session's accumulated change up to that tick,
 * so reading it directly is both simpler and matches the API's
 * day-change semantics — unlike a first/last endpoint computation,
 * which would mix the chart's drift with the open-of-session price
 * (the API's "today" change is previous-close-to-now, not first-tick-
 * to-now). The cell relies on this for the `▲/▼` sign and color.
 *
 * SparklineChart needs ≥2 points to render anything; below that,
 * `sparklineData` is left undefined so the visualization column
 * stays empty, and `changePercent` falls back to `0` (via
 * `pctChangeFromSeries`).
 */
export function buildIhsgWidget(
  chart: CompositeChartPoint[] | null,
  loading: boolean,
): MarketWidget {
  // Two outputs from the same array:
  //   - `sparklineData` — flat `number[]` (just prices) for the
  //     `<SparklineChart>` consumer.
  //   - `last` — the **last** `CompositeChartPoint` so the helper
  //     can read `price_change` / `price` directly. The point's
  //     `price_change` is the session's accumulated change up to
  //     this tick — no need to re-derive from first/last
  //     endpoints.
  const sparklineData =
    chart && chart.length >= 2
      ? chart.slice().map((p) => p.price)
      : undefined;
  const last = chart && chart.length > 0 ? chart[chart.length - 1] : undefined;
  return {
    id: "ihsg",
    label: "IHSG",
    value: last !== undefined ? formatIhsgPrice(last.price) : PLACEHOLDER,
    changePercent: pctChangeFromSeries(last),
    type: "sparkline",
    ...(sparklineData !== undefined ? { sparklineData } : {}),
    loading,
  };
}

/**
 * Build the "Sentimen Investor" gauge widget from the composite
 * `MarketMood` snapshot. The API returns `score: 0–100` and a
 * `MarketMoodLabel` band (e.g. `"Pesimis"`, `"Optimis"`) — we surface
 * both directly in the gauge.
 *
 * Until the snapshot lands, the gauge shows "—" with `gaugeValue`
 * undefined so the gauge component renders nothing.
 */
export function buildFearGreedWidget(
  mood: MarketMood | null,
  loading: boolean,
): MarketWidget {
  return {
    id: "fear-greed",
    label: "Sentimen Investor",
    value: mood ? String(mood.score) : PLACEHOLDER,
    changePercent: 0,
    type: "gauge",
    ...(mood ? { gaugeValue: mood.score } : {}),
    gaugeLabel: mood?.label ?? PLACEHOLDER,
    loading,
  };
}
