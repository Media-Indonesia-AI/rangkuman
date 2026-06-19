import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorldIndex {
  id: string;
  region: "Amerika" | "Asia" | "Eropa" | "Timur Tengah";
  name: string;
  value: string;
  /** Today change % */
  change: number;
  /** Year-to-date change % */
  ytdChange: number;
  context: string;
  /** 12-point sparkline (0-1 normalized) */
  sparkline: number[];
}

const REGION_HUE: Record<WorldIndex["region"], string> = {
  Amerika: "text-sky-500",
  Asia: "text-amber-500",
  Eropa: "text-violet-500",
  "Timur Tengah": "text-emerald-500",
};

interface WorldIndicesProps {
  indices: WorldIndex[];
  className?: string;
}

/**
 * Widget showing major world stock indices grouped by region.
 * Each row: name, value, change%, YTD, sparkline.
 */
export function WorldIndices({ indices, className }: WorldIndicesProps) {
  // Group by region
  const grouped = indices.reduce<Record<string, WorldIndex[]>>(
    (acc, idx) => {
      if (!acc[idx.region]) acc[idx.region] = [];
      acc[idx.region].push(idx);
      return acc;
    },
    {},
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-secondary",
        className,
      )}
    >
      <div className="border-b border-border px-4 py-2.5">
        <h3 className="text-[12.5px] font-semibold text-text-primary">
          World Indices
        </h3>
        <p className="mt-0.5 text-[10.5px] text-text-muted">
          Bursa utama dunia — perubahan hari ini &amp; year-to-date
        </p>
      </div>
      <div className="divide-y divide-border">
        {Object.entries(grouped).map(([region, list]) => (
          <div key={region} className="px-4 py-2.5">
            <p
              className={cn(
                "mb-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest",
                REGION_HUE[region as WorldIndex["region"]],
              )}
            >
              {region}
            </p>
            <ul className="space-y-1.5">
              {list.map((idx) => (
                <WorldIndexRow key={idx.id} index={idx} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldIndexRow({ index }: { index: WorldIndex }) {
  const isUp = index.change >= 0;
  const isYtdUp = index.ytdChange >= 0;
  return (
    <li className="grid grid-cols-[1.4fr_auto_auto_70px] items-center gap-2.5">
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-text-primary">
          {index.name}
        </p>
        <p className="truncate text-[10px] text-text-muted">{index.context}</p>
      </div>
      <div className="text-right font-mono text-[12px] font-semibold tabular-nums text-text-primary">
        {index.value}
      </div>
      <div
        className={cn(
          "text-right font-mono text-[10.5px] font-semibold tabular-nums",
          isUp ? "text-cat-saham" : "text-cat-kebijakan",
        )}
      >
        <span className="inline-flex items-center gap-0.5">
          {isUp ? (
            <TrendingUp className="h-2.5 w-2.5" aria-hidden />
          ) : (
            <TrendingDown className="h-2.5 w-2.5" aria-hidden />
          )}
          {isUp ? "+" : ""}
          {index.change.toFixed(2)}%
        </span>
        <div
          className={cn(
            "mt-0.5 text-[9px] font-medium",
            isYtdUp ? "text-cat-saham/70" : "text-cat-kebijakan/70",
          )}
        >
          YTD {isYtdUp ? "+" : ""}
          {index.ytdChange.toFixed(1)}%
        </div>
      </div>
      <div className="flex justify-end">
        <Sparkline data={index.sparkline} isUp={isUp} />
      </div>
    </li>
  );
}

function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const w = 60;
  const h = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      preserveAspectRatio="none"
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#22c55e" : "#ef4444"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
