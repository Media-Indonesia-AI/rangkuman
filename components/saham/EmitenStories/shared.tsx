/**
 * Shared style map and small primitives used by every
 * `EmitenStories/*` widget. Kept in one file so the visual language
 * (pill border, dot color, mono type) stays consistent across the
 * featured card, the list rows, and the timeline.
 */
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import type { Sentimen } from "@/lib/mock/recaps";
import type { HeadlineLast7DaysItem } from "@/lib/api";

/** Visual style per sentiment — pill colors + status dot. */
export const sentimentStyle: Record<
  Sentimen,
  { label: string; pill: string; dot: string }
> = {
  positif: { label: "Positif", pill: "border-bullish/30 text-bullish", dot: "bg-bullish" },
  netral: { label: "Netral", pill: "border-border text-text-muted", dot: "bg-text-muted" },
  negatif: { label: "Negatif", pill: "border-bearish/30 text-bearish", dot: "bg-bearish" },
};

/**
 * "Since story" price-move chip — turns `HeadlineLast7DaysItem[
 * 'pct_change_since_story']` into a sign + color + arrow.
 * Returns `null` when the field is absent so the caller can fall
 * back to its own `n/a` placeholder. Sign convention matches the
 * price APIs: positive = up (bullish, `TrendingUp`), negative =
 * down (bearish, `TrendingDown`), zero renders as neutral with
 * `TrendingUp` (no arrow flip on 0).
 */
export function PctChangeChip({ pct }: { pct: number | undefined }) {
  if (pct === undefined || pct === null) return null;
  const isPositive = pct >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "text-bullish" : "text-bearish";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[11px] font-bold tabular-nums",
        color,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

/** Ticker code chip. */
export function TickerBadge({ kode }: { kode: string }) {
  return (
    <span className="rounded border border-white bg-bg-tertiary px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-brand">
      {kode}
    </span>
  );
}

/** Colored sentiment pill with a leading dot. */
export function SentimentPill({
  sentiment,
}: {
  sentiment: HeadlineLast7DaysItem["sentiment"];
}) {
  const s = sentimentStyle[toSentimen(sentiment)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest",
        s.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

/** Muted "N/A" marker for fields the endpoint doesn't provide yet. */
export function NotAvailable({ className }: { className?: string }) {
  return (
    <span className={cn("font-mono text-[10.5px] text-text-faint", className)}>
      N/A
    </span>
  );
}

/**
 * Human "X waktu lalu" label from an ISO timestamp. Returns "N/A" if
 * the string can't be parsed.
 */
export function relativeUpdated(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "N/A";
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 1) return `${days} hari lalu`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours} jam lalu`;
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  return `${mins} menit lalu`;
}
