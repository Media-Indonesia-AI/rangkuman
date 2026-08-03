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
import type { MarketWidget } from "@/lib/mock/market-mood";
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

/**
 * Build the BI Rate widget from `loadInterestRate`'s payload. While
 * loading the widget renders with `value`/`staticSubLabel` as "—" so
 * the shimmer slot has shape to occupy. When data lands, formats
 * the rate as `"5,75%"` and the bps change as `"+25 bps"`, with the
 * badge color driven by the bps sign via `bpsBadge()`.
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
    staticSubLabel: biRate ? formatBps(biRate.bps) : PLACEHOLDER,
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
 * The day-change percentage is read from `mood.usd_idr_pct_change`
 * rather than derived from the sparkline endpoints — same reasoning
 * as `buildIhsgWidget`: the chart series is session-tick granularity,
 * so a first/last percentage wouldn't equal the official close-to-
 * close `usd_idr_pct_change` the API exposes on the mood snapshot.
 * The cell relies on this for the `▲/▼` sign and color.
 *
 * SparklineChart needs ≥2 points to render anything; below that
 * (loading, single-point response, error), `sparklineData` is left
 * undefined so the visualization column shows nothing rather than a
 * broken curve.
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
 * The day-change percentage is read from `mood.ihsg_pct_change` rather
 * than derived from the sparkline endpoints — the chart series is
 * intraday-tick granularity, so the first/last percentage wouldn't
 * equal the official session close-to-close `pct_change` the API
 * returns. The cell relies on this for the `▲/▼` sign and color.
 *
 * SparklineChart needs ≥2 points to render anything; below that,
 * `sparklineData` is left undefined so the visualization column
 * stays empty.
 */
export function buildIhsgWidget(
  chart: CompositeChartPoint[] | null,
  mood: MarketMood | null,
  loading: boolean,
): MarketWidget {
  const sparklineData =
    chart && chart.length >= 2
      ? chart
          .slice()
          .sort(
            (a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
          )
          .map((p) => p.price)
      : undefined;
  const last = sparklineData?.[sparklineData.length - 1];
  return {
    id: "ihsg",
    label: "IHSG",
    value: last !== undefined ? formatIhsgPrice(last) : PLACEHOLDER,
    changePercent: mood?.ihsg_pct_change ?? 0,
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
