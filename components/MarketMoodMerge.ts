/**
 * Pure widget-transform functions for the Market Mood strip. Each
 * `mergeX(widgets, data, loading)` function takes the current
 * widgets array, the live data for that widget (or null), and the
 * matching loading flag, and returns a new array with the target
 * widget updated. If `loading === true` the widget is flagged for
 * shimmer rendering via `widget.loading = true`. Otherwise the data
 * path runs (or the mock fallback if data is still null).
 *
 * These are pure functions — no React, no I/O, no hooks — so they
 * can be unit-tested in isolation by passing in a mock widgets array
 * and asserting the returned array's shape.
 */

import type {
  CompositeChartPoint,
  ExchangeRate,
  ForeignStocksResponse,
  InterestRate,
} from "@/lib/api";
import type { MarketWidget } from "@/lib/mock/market-mood";
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

/**
 * Replace the `bi-rate` widget in the list with live data from the API.
 * The mock widget is kept as a fallback until the fetch resolves, and
 * stays in place if the request fails (auth, network, etc.).
 *
 * While `loading === true` the widget is flagged for shimmer rendering
 * via `widget.loading` — the label stays visible but the value /
 * sub-label / badge slot is replaced by a placeholder until the fetch
 * completes (success or error).
 */
export function mergeBiRate(
  widgets: MarketWidget[],
  biRate: InterestRate | null,
  loading: boolean,
): MarketWidget[] {
  if (loading) {
    return widgets.map((w) =>
      w.id === "bi-rate" ? { ...w, loading: true } : w,
    );
  }
  if (!biRate) return widgets;
  return widgets.map((w) =>
    w.id === "bi-rate"
      ? {
          ...w,
          loading: false,
          value: formatRate(biRate.rate),
          staticSubLabel: formatBps(biRate.bps),
          staticBadge: bpsBadge(biRate.bps),
        }
      : w,
  );
}

/**
 * Replace the `usd-idr` widget with the live USD rate from the exchange
 * snapshot. The mock widget stays in place until the fetch resolves and
 * on any error (auth, network, missing key in the response, etc.).
 *
 * While `loading === true` the widget is flagged for shimmer rendering.
 */
export function mergeUsdIdr(
  widgets: MarketWidget[],
  exchangeRate: ExchangeRate | null,
  loading: boolean,
): MarketWidget[] {
  if (loading) {
    return widgets.map((w) =>
      w.id === "usd-idr" ? { ...w, loading: true } : w,
    );
  }
  if (!exchangeRate) return widgets;
  const usd = exchangeRate.USD;
  if (typeof usd !== "number") return widgets;
  return widgets.map((w) =>
    w.id === "usd-idr"
      ? { ...w, loading: false, value: formatIdrRate(usd) }
      : w,
  );
}

/**
 * Replace the `foreign-flow` widget with live data from the
 * `/stocks/foreign-stocks` summary row. Updates both `value` (formatted
 * net_value) and `barValue` (buy-volume ratio, used by the progress
 * bar to indicate the buy/sell balance visually).
 *
 * Falls back to `'-'` when the snapshot is missing or has no flow to
 * display (all zero). The mock widget's other fields (`label`, `type`,
 * `barLeftLabel`, `barRightLabel`, etc.) are preserved either way.
 *
 * While `loading === true` the widget is flagged for shimmer rendering.
 */
export function mergeForeignFlow(
  widgets: MarketWidget[],
  foreignFlow: ForeignStocksResponse | null,
  loading: boolean,
): MarketWidget[] {
  return widgets.map((w) => {
    if (w.id !== "foreign-flow") return w;
    if (loading) return { ...w, loading: true };
    if (isEmptyForeignFlow(foreignFlow)) {
      return { ...w, loading: false, value: "-", barValue: undefined };
    }
    const s = foreignFlow!.summary;
    const barValue = buyRatioPercent(s.buy_volume, s.sell_volume);
    return {
      ...w,
      loading: false,
      value: formatCompactIdr(s.net_value),
      ...(barValue !== undefined ? { barValue } : {}),
    };
  });
}

/**
 * Replace the `ihsg` widget's `value` with the price from the **last**
 * data point of the composite-chart series, and feed the full price
 * series into its `sparklineData` so the SparklineChart renders the
 * real intraday curve instead of the deterministic mock shape.
 *
 * The widget's other fields (`changePercent`, `label`, `type`, etc.)
 * are preserved from the mock.
 *
 * Falls back to the mock value + mock sparkline when the chart is
 * missing or has fewer than 2 points (SparklineChart's own guard —
 * below that it would render an empty placeholder).
 *
 * While `loading === true` the widget is flagged for shimmer rendering
 * (label stays visible, value + sparkline are placeholders).
 */
export function mergeIhsg(
  widgets: MarketWidget[],
  chart: CompositeChartPoint[] | null,
  loading: boolean,
): MarketWidget[] {
  if (loading) {
    return widgets.map((w) =>
      w.id === "ihsg" ? { ...w, loading: true } : w,
    );
  }
  // SparklineChart needs ≥2 points to render anything (returns an
  // empty placeholder otherwise). Below that, keep the deterministic
  // mock sparkline so the widget still shows a curve during the brief
  // loading window before the first retry returns enough data.
  if (!chart || chart.length < 2) return widgets;

  // Sort by dateTime to be robust against the backend's ordering.
  // For "1D" the chart is hourly (~24 points); for "5D"/"1M" it's
  // daily. Either way the cost of sorting is negligible. `slice()`
  // first so we don't mutate the cached API response.
  const sparklineData = chart
    .slice()
    .sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )
    .map((p) => p.price);

  const last = sparklineData[sparklineData.length - 1];

  return widgets.map((w) =>
    w.id === "ihsg"
      ? { ...w, loading: false, value: formatIhsgPrice(last), sparklineData }
      : w,
  );
}