import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoinCategory, CoinTickerItem } from "@/lib/api";
import { formatUsd } from "./formatters";

interface CategoryCardBodyProps {
  cat: CoinCategory;
}

/** Body: market-cap blurb + the two-column top gainers / top
 *  losers block. Mirrors `<SektorCard />`'s body layout — the
 *  two columns stay at equal height via `min-w-0` + `grid-cols-2`. */
export function CategoryCardBody({ cat }: CategoryCardBodyProps) {
  return (
    <>
      <p className="px-3.5 pt-2.5 text-[11.5px] leading-snug text-text-secondary line-clamp-2">
        Market cap {formatUsd(cat.market_cap)} ·{" "}
        {cat.top_gainers.length + cat.top_losers.length} koin top movers
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-border px-3.5 py-2.5">
        <CoinColumn
          heading="Top Gainer"
          icon={<TrendingUp className="h-3 w-3 text-bullish" aria-hidden />}
          coins={cat.top_gainers}
        />
        <CoinColumn
          heading="Top Looser"
          icon={<TrendingDown className="h-3 w-3 text-bearish" aria-hidden />}
          coins={cat.top_losers}
        />
      </div>
    </>
  );
}

/** One bucket (gainer or loser) inside the card's two-column
 *  block. Empty buckets fall back to a quiet em-dash so the
 *  column doesn't collapse and break the alignment with the
 *  sibling column. */
function CoinColumn({
  heading,
  icon,
  coins,
}: {
  heading: string;
  icon: React.ReactNode;
  coins: CoinTickerItem[];
}) {
  return (
    <div className="min-w-0">
      <p className="label mb-1.5 flex items-center gap-1">
        {icon}
        {heading}
      </p>
      {coins.length === 0 ? (
        <p className="font-mono text-[10.5px] text-text-faint">—</p>
      ) : (
        <ol className="space-y-1">
          {coins.map((coin, idx) => (
            <CoinRow key={coin.ticker} coin={coin} rank={idx + 1} />
          ))}
        </ol>
      )}
    </div>
  );
}

/** One coin row: rank · ticker (linked to `/crypto/{ticker}`)
 *  · optional full name · signed percent change.
 *
 *  Matches `<SektorCard />`'s `<StockRow />` shape so the two
 *  grids read as one design language — only the color tokens
 *  and percent precision differ (crypto 2 decimals to match
 *  the rest of the Pasar tab). */
function CoinRow({
  coin,
  rank,
}: {
  coin: CoinTickerItem;
  rank: number;
}) {
  const positive = coin.price_change >= 0;
  return (
    <li className="flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold text-text-faint num-tabular">
        #{rank}
      </span>
      <Link
        href={`/crypto/${coin.ticker}`}
        className="font-mono text-[11.5px] font-semibold text-text-primary hover:text-brand"
      >
        {coin.ticker.toUpperCase()}
      </Link>
      {coin.ticker_name && (
        <span className="flex-1 truncate text-[10.5px] text-text-muted">
          {coin.ticker_name}
        </span>
      )}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold num-tabular",
          positive ? "text-bullish" : "text-bearish",
        )}
      >
        {positive ? "+" : ""}
        {coin.price_change.toFixed(2).replace(".", ",")}%
      </span>
    </li>
  );
}
