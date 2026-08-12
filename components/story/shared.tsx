import { cn } from "@/lib/utils";
import { toSentimen } from "@/lib/util/sentiment";
import type { Sentimen } from "@/lib/mock/recaps";
import type { HeadlineLast7DaysItem } from "@/lib/api";

/** Page-size for the cross-ticker multi-date stories listing. Mirrors
 *  the ticker-scoped widget's `STORY_LIMIT = 6` × ~3 sections so the
 *  featured + grid reads as a single feed. */
export const STORY_LIMIT = 20;

/** Pill / dot colors per sentiment. Mirrors the same map used by
 *  `EmitenStories` so the chip reads the same on the listing and
 *  the ticker-scoped widget. */
export const sentimentStyle: Record<
  Sentimen,
  { label: string; pill: string; dot: string }
> = {
  positif: {
    label: "Positif",
    pill: "border-bullish/30 text-bullish",
    dot: "bg-bullish",
  },
  netral: {
    label: "Netral",
    pill: "border-border text-text-muted",
    dot: "bg-text-muted",
  },
  negatif: {
    label: "Negatif",
    pill: "border-bearish/30 text-bearish",
    dot: "bg-bearish",
  },
};

/** Muted "n/a" marker for fields the API doesn't yet return.
 *  Stays consistent across the page so missing-data cells read as
 *  one pattern. */
export function NotAvailable() {
  return (
    <span className="font-mono text-[10.5px] text-text-faint">n/a</span>
  );
}

/** "Since story" price-move chip — turns `HeadlineLast7DaysItem[
 *  'pct_change_since_story']` into a sign + arrow + percentage.
 *  Sign convention matches the price APIs: positive = up (bullish,
 *  `TrendingUp`), negative = down (bearish, `TrendingDown`). Zero
 *  renders as positive with no arrow flip. Returns `null` when the
 *  field is absent so the caller can fall back to its own `n/a`
 *  placeholder. Mirrors the chip in
 *  `components/saham/EmitenStories/shared.tsx` so a story row
 *  looks the same wherever it renders. */
export function PctChangeChip({ pct }: { pct: number | undefined }) {
  if (pct === undefined || pct === null) return null;
  const isPositive = pct >= 0;
  const color = isPositive ? "text-bullish" : "text-bearish";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-[10.5px] font-semibold tabular-nums",
        color,
      )}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

/** Human "X waktu lalu" label from an ISO timestamp. Returns "n/a"
 *  if the string can't be parsed. */
export function relativeUpdated(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "n/a";
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 1) return `${days} hari lalu`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours} jam lalu`;
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  return `${mins} menit lalu`;
}

/** Ticker code chip — shared by FeaturedCard and StoryListRow. */
export function TickerBadge({ kode }: { kode: string }) {
  return (
    <span className="rounded border border-border bg-bg-tertiary px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-text-primary">
      {kode}
    </span>
  );
}

/** Sentiment pill with a leading dot — shared by FeaturedCard and
 *  StoryListRow. Reads `HeadlineLast7DaysItem["sentiment"]` and
 *  normalizes via `toSentimen` (the API returns `"positive" |
 *  "negative" | "neutral"`; the UI helper maps to the
 *  Indonesian `Sentimen` union used elsewhere). */
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
