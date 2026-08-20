"use client";

import {
  BarChart3,
  Layers,
  Activity,
  TrendingUp,
  Award,
  Percent,
} from "lucide-react";
import { Shimmer } from "@/components/Shimmer";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { useKeyMetrics } from "@/lib/hooks/useKeyMetrics";
import { formatCompactIdr } from "@/lib/util/formatNumber";
import { cn } from "@/lib/utils";

interface KeyMetricsProps {
  /** Ticker code, e.g. `"ANTM"`. Drives the request URL; uppercased
   *  inside `useKeyMetrics` so callers can pass any case. */
  kode: string;
  className?: string;
}

interface MetricProps {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  color?: string;
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  color = "text-text-primary",
}: MetricProps) {
  return (
    <div className="rounded-md border border-border bg-bg-tertiary/50 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-text-faint" aria-hidden />
        <span className="label">{label}</span>
      </div>
      <p
        className={cn(
          "font-mono text-[16px] font-bold leading-none num-tabular",
          color,
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 font-mono text-[10px] text-text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Skeleton shown while `GET stocks/key-metrics/{kode}` is in flight.
 *  Mirrors the 6-tile grid (3 cols × 2 rows on sm+) so the card
 *  height matches the eventual real layout and doesn't shift on
 *  resolution. Header stays mostly real — the icon and label are
 *  static — only the right-side "live data" suffix shimmer-checks
 *  until we know what to render. */
function KeyMetricsShimmer() {
  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Key metrics"
      aria-busy="true"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <BarChart3 className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h3 className="label">Key Metrics</h3>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skel-${i}`}
            className="rounded-md border border-border bg-bg-tertiary/50 px-3 py-2.5"
          >
            <Shimmer className="mb-1.5 h-2.5 w-16" />
            <Shimmer className="h-4 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Key metrics tile: Market Cap · P/E · Volume · Dividend Yield · Beta · Day Change.
 *
 *  Data is fetched live from `GET stocks/key-metrics/{kode}` via
 *  `useKeyMetrics`. While the request is in flight a shimmer skeleton
 *  is shown so the card height doesn't shift on resolution; if the
 *  fetch fails (`data === null` and not loading) every tile falls
 *  back to `—` placeholders, matching the original "no data" path.
 *
 *  Formatting conventions:
 *    - Market Cap    → Indonesian compact IDR (`"84,1 T"`, `"1,2 M"`)
 *    - P/E Ratio     → one decimal + `x` suffix (`"21,7x"`)
 *    - Volume        → Indonesian compact IDR (`"522,3 rb"`)
 *    - Dividend Yield → one decimal + `%` (`"1,8%"`)
 *    - Beta          → two decimals (`"1,46"`)
 *    - Day Change    → signed, two decimals + `%` (`"+5,14%"`)
 *
 *  Color cues:
 *    - P/E color follows the cheap/fair/expensive band the
 *      original mock-driven component used.
 *    - Dividend Yield flips to bullish at 4%+.
 *    - Day Change flips bullish/bearish on sign.
 */
export function KeyMetrics({ kode, className }: KeyMetricsProps) {
  const { data, isLoading } = useKeyMetrics(kode);

  if (isLoading) {
    return <KeyMetricsShimmer />;
  }

  // Failed fetch (or no data yet) — render the real shell with `—`
  // placeholders so the page keeps its layout.
  const isEmpty = data === null;

  const peRatio = isEmpty ? null : data.pe_ratio;
  const peColor =
    peRatio == null
      ? "text-text-faint"
      : peRatio > 30
        ? "text-bearish"
        : peRatio < 0
          ? "text-mixed"
          : peRatio < 15
            ? "text-bullish"
            : "text-text-primary";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-bg-secondary",
        className,
      )}
      aria-label="Key metrics"
    >
      <header className="flex items-center gap-1.5 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <BarChart3 className="h-3.5 w-3.5 text-brand" aria-hidden />
        <h3 className="label">Key Metrics</h3>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <Metric
          icon={Layers}
          label="Market Cap"
          value={isEmpty ? "—" : `Rp ${formatCompactIdr(data.market_cap).replace(/^[+-]/, "")}`}
          hint={isEmpty ? undefined : `${kode} listed`}
        />
        <Metric
          icon={Activity}
          label="P/E Ratio"
          value={
            isEmpty
              ? "—"
              : peRatio == null
                ? "—"
                : peRatio < 0
                  ? "NM"
                  : `${peRatio.toFixed(1).replace(".", ",")}x`
          }
          hint={
            isEmpty || peRatio == null
              ? undefined
              : peRatio < 0
                ? "Belum profitable"
                : peRatio < 15
                  ? "Murah"
                  : peRatio < 25
                    ? "Wajar"
                    : "Mahal"
          }
          color={peColor}
        />
        <Metric
          icon={BarChart3}
          label="Volume"
          value={isEmpty ? "—" : formatCompactIdr(data.volume).replace(/^[+-]/, "")}
          hint={isEmpty ? undefined : "lembar diperdagangkan"}
        />
        <Metric
          icon={Percent}
          label="Dividend Yield"
          value={isEmpty ? "—" : `${(data.dividend_yield ?? 0).toFixed(1).replace(".", ",")}%`}
          hint={isEmpty ? undefined : "annualized"}
          color={
            isEmpty
              ? "text-text-faint"
              : (data.dividend_yield ?? 0) >= 4
                ? "text-bullish"
                : "text-text-primary"
          }
        />
        <Metric
          icon={Award}
          label="Beta"
          value={isEmpty ? "—" : data.beta.toFixed(2).replace(".", ",")}
          hint={
            isEmpty
              ? undefined
              : data.beta > 1.2
                ? "Lebih volatil dari IHSG"
                : data.beta < 0.8
                  ? "Lebih stabil"
                  : "Sejalan IHSG"
          }
        />
        <Metric
          icon={TrendingUp}
          label="30D Change"
          value={
            isEmpty
              ? "—"
              : `${data.pct_change >= 0 ? "+" : ""}${data.pct_change.toFixed(2).replace(".", ",")}%`
          }
          hint={isEmpty ? undefined : "1 bulan terakhir"}
          color={
            isEmpty
              ? "text-text-faint"
              : data.pct_change >= 0
                ? "text-bullish"
                : "text-bearish"
          }
        />
      </div>
      <LoginPromptOverlay title="Masuk dulu untuk lihat key metrics" />
    </section>
  );
}
