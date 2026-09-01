import { TrendingDown, TrendingUp } from "lucide-react";
import type { CoinCategory } from "@/lib/api";
import { CategoryCoinRow } from "./CategoryCoinRow";
import { formatFullUsd } from "./formatters";

interface CategoryListItemProps {
  /** One category returned by `GET coin-category/`. The list
   *  renders one item per category — header (category name +
   *  24h volume), then two stacked groups (gainer + looser),
   *  each rendering every coin the API returned for that
   *  group via `<CategoryCoinRow />`. */
  cat: CoinCategory;
}

/**
 * One row in the Pasar tab's category list. Replaces the old
 * card grid with a stacked, list-friendly layout:
 *
 *   WORLD LIBERTY FINANCIAL PORTFOLIO    Vol 24h     $609,880,000,000
 *                                        Kap. Pasar  $1,200,000,000,000
 *   ↑ Gainer
 *     [icon] BTC   Bitcoin          $0,14   +4,12%
 *     [icon] LINK  Chainlink        $11,38  +2,05%
 *     [icon] AVAX  Avalanche         $7,26  +0,98%
 *   ↓ Looser
 *     [icon] ETH   Ethereum          $2.460 -3,10%
 *     [icon] ENA   Ethena            $0,15  -1,75%
 *     [icon] AAVE  Aave              $124   -0,42%
 *
 * Header sits in its own `bg-bg-tertiary` strip (theme-aware
 * token — the same one `<SektorCard />` uses for its header)
 * with a `border-b` divider underneath so the category name
 * reads as a distinct block from the coin rows. The right side
 * of the header stacks the category's 24h volume above its
 * market cap (`Kap. Pasar`) using `formatFullUsd` so both
 * metrics render their full magnitude (no `T` / `B` / `M`
 * suffix) with `en-US` thousand grouping. Each metric line
 * pairs a semi-bold default-color label with the value so the
 * eye lands on the "what" first and reads the "how much"
 * second. The gainer and looser groups are stacked under mini
 * section headers (with the project's `TrendingUp` /
 * `TrendingDown` icons tinted to bullish / bearish) and split
 * by a thin `border-t` divider so the two groups read as
 * separate buckets without the whole card turning into three
 * bordered boxes. Each coin row's price-change line is tinted
 * via the `priceChangeTone` helper — bullish / bearish /
 * muted for up / down / flat moves respectively.
 */
export function CategoryListItem({ cat }: CategoryListItemProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
      <header className="flex items-center justify-between gap-2 border-b border-border bg-bg-tertiary px-3.5 py-2.5">
        <h3 className="truncate font-mono text-[13px] font-bold uppercase tracking-wider text-text-primary">
          {cat.name}
        </h3>
        <div className="shrink-0 text-right font-mono text-[12px] leading-tight">
          <div>
            <span className="font-semibold text-text-secondary">Vol 24h</span>{" "}
            {formatFullUsd(cat.volume_24h)}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">Kap. Pasar</span>{" "}
            {formatFullUsd(cat.market_cap)}
          </div>
        </div>
      </header>

      <div className="px-3.5 py-3">
        <CoinGroup
          heading="Gainer"
          tone="bullish"
          Icon={TrendingUp}
          coins={cat.top_gainers}
        />
        <div className="my-2.5 border-t border-border" aria-hidden />
        <CoinGroup
          heading="Looser"
          tone="bearish"
          Icon={TrendingDown}
          coins={cat.top_losers}
        />
      </div>
    </article>
  );
}

interface CoinGroupProps {
  heading: string;
  tone: "bullish" | "bearish";
  Icon: typeof TrendingUp;
  coins: import("@/lib/api").CoinTickerItem[];
}

/** One bucket (gainer or loser) inside the category item.
 *  Empty buckets fall back to a quiet em-dash so the section
 *  header still renders and the layout doesn't collapse. */
function CoinGroup({ heading, tone, Icon, coins }: CoinGroupProps) {
  return (
    <div>
      <p
        className={
          tone === "bullish"
            ? "mb-1 flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-bullish"
            : "mb-1 flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-bearish"
        }
      >
        <Icon className="h-3 w-3" aria-hidden />
        {heading}
      </p>
      {coins.length === 0 ? (
        <p className="font-mono text-[10.5px] text-text-faint">—</p>
      ) : (
        <div className="space-y-0.5">
          {coins.map((coin) => (
            <CategoryCoinRow key={coin.ticker} coin={coin} />
          ))}
        </div>
      )}
    </div>
  );
}
