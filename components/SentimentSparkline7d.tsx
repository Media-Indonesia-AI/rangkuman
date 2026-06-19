import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import type { Sentimen } from "@/lib/mock/recaps";
import type { Sentiment7d } from "@/lib/mock/sentiment-7d";
import { cn } from "@/lib/utils";

interface SentimentSparkline7dProps {
  /** 7-item array, oldest (left) → newest (right). */
  data: Sentiment7d;
  /** ISO date for "today" — the rightmost bar. */
  todayIso?: string;
  className?: string;
}

const sentimentColor: Record<Sentimen, { bar: string; text: string; bg: string; label: string }> = {
  positif: { bar: "#16C784", text: "text-bullish", bg: "bg-bullish-soft", label: "Positif" },
  netral:  { bar: "#737373", text: "text-muted",   bg: "bg-bg-tertiary",  label: "Netral" },
  negatif: { bar: "#EA3943", text: "text-bearish", bg: "bg-bearish-soft", label: "Negatif" },
};

const dayShort = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

/** Compute the day-of-week label for an offset back from today. */
function dayLabel(isoDate: string | undefined, offset: number): { day: string; date: number } {
  if (!isoDate) return { day: "—", date: 0 };
  const d = new Date(isoDate);
  d.setDate(d.getDate() - (6 - offset));
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sat"];
  return { day: days[d.getDay()], date: d.getDate() };
}

/**
 * Mini 7-bar vertical chart showing daily sentiment.
 * Green = Positif, gray = Netral, red = Negatif.
 * Netral bars are slightly shorter so the visual hierarchy is clear.
 */
export function SentimentSparkline7d({ data, todayIso, className }: SentimentSparkline7dProps) {
  // SVG layout
  const W = 320;
  const H = 88;
  const padX = 8;
  const padTop = 4;
  const padBottom = 22; // room for day labels
  const chartH = H - padTop - padBottom;
  const barAreaW = W - padX * 2;
  const slotW = barAreaW / 7;
  const barW = slotW * 0.55;

  // Distribution for the header
  const counts = {
    positif: data.filter((d) => d === "positif").length,
    netral: data.filter((d) => d === "netral").length,
    negatif: data.filter((d) => d === "negatif").length,
  };
  const dominant = (Object.entries(counts) as [Sentimen, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const DominantIcon =
    dominant === "positif" ? TrendingUp : dominant === "negatif" ? TrendingDown : Minus;

  return (
    <section
      className={cn("overflow-hidden rounded-lg border border-border bg-bg-secondary", className)}
      aria-label="Sentimen 7 hari terakhir"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="label">Sentimen 7 Hari</span>
          <span className="font-mono text-[9.5px] text-text-faint">· hari ini + 6 hari ke belakang</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold",
            sentimentColor[dominant].text,
          )}
        >
          <DominantIcon className="h-2.5 w-2.5" aria-hidden />
          {counts.positif}↑ · {counts.netral}= · {counts.negatif}↓
        </span>
      </header>

      <div className="px-3.5 py-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Sentimen 7 hari: ${counts.positif} positif, ${counts.netral} netral, ${counts.negatif} negatif`}
        >
          {/* Subtle baseline at the bottom of the chart area */}
          <line
            x1={padX}
            y1={padTop + chartH}
            x2={W - padX}
            y2={padTop + chartH}
            stroke="#262626"
            strokeWidth="0.5"
          />

          {/* 7 bars */}
          {data.map((s, i) => {
            const cfg = sentimentColor[s];
            // Netral bar is shorter to soften the silhouette.
            const isNetral = s === "netral";
            const barH = isNetral ? chartH * 0.5 : chartH * 0.9;
            const x = padX + i * slotW + (slotW - barW) / 2;
            const y = padTop + chartH - barH;
            const { day, date } = dayLabel(todayIso, i);
            const isToday = i === data.length - 1;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={3}
                  fill={cfg.bar}
                  opacity={isToday ? 1 : 0.85}
                />
                {/* Highlight ring on today's bar */}
                {isToday && (
                  <rect
                    x={x - 1.5}
                    y={y - 1.5}
                    width={barW + 3}
                    height={barH + 3}
                    rx={4.5}
                    fill="none"
                    stroke={cfg.bar}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.6}
                  />
                )}
                {/* Date label */}
                <text
                  x={x + barW / 2}
                  y={H - 9}
                  textAnchor="middle"
                  className="num-tabular"
                  fontSize="9"
                  fontWeight="500"
                  fill={isToday ? "#F7931A" : "#737373"}
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {date}
                </text>
                {/* Day-of-week label */}
                <text
                  x={x + barW / 2}
                  y={H - 1}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill={isToday ? "#A3A3A3" : "#525252"}
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  letterSpacing="0.05em"
                >
                  {day.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex items-center gap-3">
            <LegendItem color="bg-bullish" label="Positif" count={counts.positif} />
            <LegendItem color="bg-text-muted" label="Netral" count={counts.netral} />
            <LegendItem color="bg-bearish" label="Negatif" count={counts.negatif} />
          </div>
          <span className="font-mono text-[9.5px] text-text-faint">
            Sumber: agregat media, dikurasi harian
          </span>
        </div>
      </div>
    </section>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-sm", color)} aria-hidden />
      <span className="font-mono text-[10px] text-text-secondary">
        {label}
      </span>
      <span className="font-mono text-[10.5px] font-semibold text-text-primary num-tabular">
        {count}
      </span>
    </div>
  );
}
