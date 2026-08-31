import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoinTickerItem } from "@/lib/api";
import { TopMoverCard } from "./TopMoverCard";

export type TopMoverTone = "bullish" | "bearish";

const TONE_CLASS: Record<TopMoverTone, string> = {
  bullish: "text-bullish",
  bearish: "text-bearish",
};

interface TopMoverGroupProps {
  /** Group label shown above the grid ("Top Gainer" /
   *  "Top Looser"). */
  title: string;
  /** Drives both the icon tint and the header label tint. */
  tone: TopMoverTone;
  /** Lucide icon component (`TrendingUp` / `TrendingDown`). */
  Icon: LucideIcon;
  /** Coins to render — order is preserved from the API (largest
   *  absolute move first). */
  coins: CoinTickerItem[];
}

/**
 * One side of the Top Movers split — header (icon + label +
 * count) + 3-col grid of `<TopMoverCard />` rows.
 */
export function TopMoverGroup({
  title,
  tone,
  Icon,
  coins,
}: TopMoverGroupProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon
          className={cn("h-3 w-3", TONE_CLASS[tone])}
          aria-hidden
        />
        <h3
          className={cn(
            "font-mono text-[10px] font-semibold uppercase tracking-widest",
            TONE_CLASS[tone],
          )}
        >
          {title}
        </h3>
        <span className="ml-auto font-mono text-[10px] text-text-faint num-tabular">
          {coins.length} koin
        </span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {coins.map((c) => (
          <TopMoverCard key={c.ticker} coin={c} />
        ))}
      </div>
    </div>
  );
}
