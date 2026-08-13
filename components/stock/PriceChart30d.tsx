"use client";

import { cn } from "@/lib/utils";
import { useStockHistorical } from "@/lib/hooks/useStockHistorical";
import { Shimmer } from "@/components/Shimmer";
import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

interface PriceChart30dProps {
  /** Ticker code, e.g. `"ANTM"`. Drives the request URL; uppercased
   *  inside `useStockHistorical` so callers can pass any case. */
  kode: string;
  className?: string;
}

/** Skeleton shown while `GET stocks/stock/historical?ticker=...` is
 *  in flight. Mirrors the real card's structure (header strip with
 *  "Harga 30 Hari" + meta row, big chart area) so the layout
 *  doesn't shift when the real payload arrives. */
function PriceChart30dShimmer() {
  return (
    <section
      className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Pergerakan harga 30 hari"
      aria-busy="true"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Harga 30 Hari</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px]">
          <Shimmer className="h-2.5 w-8" />
          <Shimmer className="h-2.5 w-12" />
          <span className="text-text-faint">·</span>
          <Shimmer className="h-2.5 w-12" />
          <Shimmer className="h-2.5 w-12" />
          <span className="text-text-faint">·</span>
          <Shimmer className="h-2.5 w-14" />
        </div>
      </header>
      <div className="px-3.5 py-3">
        <Shimmer className="h-[140px] w-full rounded" />
      </div>
    </section>
  );
}

/** Empty-state shell. Same outer `<section>` + header strip as the
 *  real card so the layout stays stable when the backend returns no
 *  historical data for the ticker (or the fetch failed). The header
 *  collapses the meta row to a single muted "no data" hint so the
 *  row doesn't read as "ATH · Current · 0.00%" with no actual
 *  numbers behind it. */
function PriceChart30dEmpty({ kode }: { kode: string }) {
  return (
    <section
      className="relative overflow-hidden rounded-lg border border-border bg-bg-secondary"
      aria-label="Pergerakan harga 30 hari"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Harga 30 Hari</span>
        </div>
        <span className="font-mono text-[9.5px] text-text-faint">
          belum ada data untuk {kode}
        </span>
      </header>
      <div className="px-3.5 py-8 text-center">
        <p className="text-[12px] text-text-muted">
          Belum ada data historis untuk {kode}.
        </p>
      </div>
      <LoginPromptOverlay title="Masuk dulu untuk lihat chart harga" />
    </section>
  );
}

/**
 * 30-day price chart — SVG line + area fill.
 *
 * Data is fetched live from `GET stocks/stock/historical?ticker=...`
 * via `useStockHistorical`. The wire format is
 * `{ date_time, price, price_change }[]`; the component:
 *   - plots `price` as the line
 *   - derives `currentPrice` (last point) and `ath` (max)
 *   - derives `change30dPercent` from first vs. last point
 *   - color (green/red) tracks the sign of the 30D change
 *
 * Three render branches:
 *   1. `isLoading`     → shimmer skeleton (header + chart placeholder)
 *   2. `data` is null or empty → empty-state shell with a
 *      "Belum ada data historis" message
 *   3. real data       → the SVG line + area chart
 */
export function PriceChart30d({ kode, className }: PriceChart30dProps) {
  const { data, isLoading } = useStockHistorical(kode);

  if (isLoading) {
    return <PriceChart30dShimmer />;
  }

  if (!data || data.length === 0) {
    return <PriceChart30dEmpty kode={kode} />;
  }

  // Series is API-ordered (oldest → newest). Derive everything
  // the chart needs from the points so the component never
  // depends on stale parent-supplied numbers.
  const prices = data.map((p) => p.price);
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const ath = Math.max(...prices);
  const change30dPercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const positive = change30dPercent >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  // Layout
  const W = 600;
  const H = 140;
  const padL = 36;
  const padR = 50;
  const padT = 8;
  const padB = 18;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  // Y grid: 4 lines (min, 25%, 75%, max)
  const gridLevels = 4;
  const yTicks = Array.from(
    { length: gridLevels },
    (_, i) => min + (range * i) / (gridLevels - 1),
  );

  // X axis: 6 evenly-spaced labels across the series. With N=30
  // points the labels land at indices 0, 6, 12, 18, 24, 29 — same
  // as the original 30-day mock. For shorter series the indices
  // compress accordingly so the labels stay evenly distributed.
  const N = prices.length;
  const xLabelIdx = N <= 6
    ? Array.from({ length: N }, (_, i) => i)
    : [0, Math.floor(N * 0.2), Math.floor(N * 0.4), Math.floor(N * 0.6), Math.floor(N * 0.8), N - 1];
  const dayLabels = xLabelIdx.map((i) =>
    i === N - 1 ? "today" : `${-(N - 1 - i)}d`,
  );

  // Build smooth path
  const points = prices.map((v, i) => {
    const x = padL + (i / (prices.length - 1)) * chartW;
    const y = padT + (1 - (v - min) / range) * chartH;
    return [x, y] as const;
  });

  const path = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    const [px, py] = arr[i - 1];
    const mx = (px + x) / 2;
    return `${acc} C ${mx.toFixed(2)} ${py.toFixed(2)}, ${mx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`;
  }, "");

  const areaPath = `${path} L ${padL + chartW} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

  const stroke = positive ? "#16C784" : "#EA3943";
  const gradientId = `pc30d-${positive ? "up" : "down"}`;

  // Format price compactly for Y axis labels
  function fmt(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`;
    return v.toFixed(0);
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-bg-secondary",
        className,
      )}
      aria-label="Pergerakan harga 30 hari"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-brand" aria-hidden />
          <span className="label">Harga 30 Hari</span>
        </div>
        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="font-mono text-text-faint">ATH</span>
          <span className="font-mono font-semibold text-text-primary num-tabular">
            {ath.toLocaleString("id-ID")}
          </span>
          <span className="text-text-faint">·</span>
          <span className="font-mono text-text-faint">Current</span>
          <span className="font-mono font-semibold text-text-primary num-tabular">
            {lastPrice.toLocaleString("id-ID")}
          </span>
          <span className="text-text-faint">·</span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono font-semibold num-tabular",
              positive ? "text-bullish" : "text-bearish",
            )}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {positive ? "+" : ""}
            {change30dPercent.toFixed(2).replace(".", ",")}%
          </span>
        </div>
      </header>

      <div className="px-3.5 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Chart harga 30 hari, perubahan ${change30dPercent.toFixed(2).replace(".", ",")}%`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.30" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis grid + labels */}
          {yTicks.map((v, i) => {
            const y = padT + (1 - (v - min) / range) * chartH;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + chartW}
                  y2={y}
                  stroke="#262626"
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
                <text
                  x={padL - 4}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="#525252"
                >
                  {fmt(v)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabelIdx.map((idx, i) => {
            if (idx >= prices.length) return null;
            const x = padL + (idx / (prices.length - 1)) * chartW;
            return (
              <text
                key={idx}
                x={x}
                y={H - 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill={idx === prices.length - 1 ? "#F7931A" : "#525252"}
                fontWeight={idx === prices.length - 1 ? "700" : "500"}
              >
                {dayLabels[i]}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          {/* Line */}
          <path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* End-point dot (today) */}
          {(() => {
            const [lx, ly] = points[points.length - 1];
            return (
              <>
                <circle cx={lx} cy={ly} r="5" fill={stroke} opacity="0.25" />
                <circle
                  cx={lx}
                  cy={ly}
                  r="2.5"
                  fill={stroke}
                  stroke="#0A0A0B"
                  strokeWidth="1"
                />
              </>
            );
          })()}

          {/* ATH dashed line */}
          {(() => {
            const yAth = padT + (1 - (ath - min) / range) * chartH;
            if (yAth < padT || yAth > padT + chartH) return null;
            return (
              <g>
                <line
                  x1={padL}
                  y1={yAth}
                  x2={padL + chartW}
                  y2={yAth}
                  stroke="#525252"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL + chartW + 4}
                  y={yAth + 3}
                  fontSize="8"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="#737373"
                >
                  ATH
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
      <LoginPromptOverlay title="Masuk dulu untuk lihat chart harga" />
    </section>
  );
}
