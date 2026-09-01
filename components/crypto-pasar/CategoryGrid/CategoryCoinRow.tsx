import Link from "next/link";
import type { CoinTickerItem } from "@/lib/api";
import { formatPrice } from "@/components/crypto-page/cryptoFormatters";
import { SparklineChart } from "@/components/SparklineChart";
import { cn } from "@/lib/utils";
import { useCoinHistorical } from "@/lib/hooks/useCoinHistorical";
import { formatPriceChange, priceChangeTone } from "./formatters";

interface CategoryCoinRowProps {
  /** One coin row inside `<CategoryListItem />`. The image URL
   *  is a remote CoinGecko CDN asset (passed through as a plain
   *  `<img>` so it works without a next/image loader setup —
   *  the rest of the crypto widgets follow the same pattern).
   *  `ticker` drives the link to `/crypto/{ticker}` and is also
   *  used to fetch the per-coin 1D price history for the
   *  trailing sparkline. */
  coin: CoinTickerItem;
}

/**
 * One coin row inside a `<CategoryListItem />` group, laid out
 * on a single horizontal baseline so the eye can scan
 * left-to-right without dropping between stacks:
 *
 *   [icon]  BTC  Bitcoin          $11.38  +2,05%  1D  ╱╲╱╲╱╱╲╱
 *
 * Layout (left → right, all on one line):
 *
 *   1. **Icon** — coin's logo (CDN URL, rounded full).
 *   2. **Ticker** — bold uppercase ticker on the baseline.
 *   3. **Name** — full ticker name, truncates if it overflows
 *      via `flex-1 min-w-0 truncate`.
 *   4. **Price** — locale-formatted via `formatPrice` (the same
 *      formatter the `/crypto` page uses for its ticker card
 *      so the two surfaces match).
 *   5. **24h change** — signed percent, tinted via
 *      `priceChangeTone`: bullish for up moves, bearish for
 *      down moves, muted for flat moves so a `0.00%` row
 *      doesn't pick up either sentiment color by accident.
 *      Price and change sit `items-baseline gap-2` so the
 *      smaller change line aligns to the price's baseline
 *      rather than its center.
 *   6. **1D label + sparkline** — `1D` period label in
 *      `text-text-faint` sits inline before the chart, and the
 *      trailing inline SVG of the day's price series is
 *      fetched via `useCoinHistorical(coin.ticker, "1D")`.
 *      The request is per-coin and deduped through the
 *      `loadCoinHistorical` cache module, so the same ticker
 *      mounted elsewhere (e.g. inside a gainer and looser
 *      group of two different categories) shares one network
 *      round-trip. Stroke color follows the same bullish /
 *      bearish pair as the change line — green if the day's
 *      last price is at or above the first, red otherwise.
 *      While the fetch is in flight the slot shows a pulsing
 *      shimmer so the row height stays stable and the swap
 *      to the real chart doesn't cause a vertical shift.
 *
 * The whole row is a `<Link>` to `/crypto/{ticker}` so the
 * click hit area covers the full row, mirroring the
 * `<CoinTickerCard />` convention.
 */
export function CategoryCoinRow({ coin }: CategoryCoinRowProps) {
  const { state: histState } = useCoinHistorical(coin.ticker, "1D");

  const prices =
    histState.kind === "ready"
      ? histState.points.map((p) => p.price)
      : [];
  const loading = histState.kind === "loading";
  // Fall back to the 24h change's sign while the sparkline is
  // loading or empty so the eventual paint matches the change
  // line sitting next to it — a gainer row never paints a red
  // sparkline, and vice versa.
  const positive =
    prices.length >= 2
      ? prices[prices.length - 1] >= prices[0]
      : coin.price_change >= 0;

  return (
    <Link
      href={`/crypto/${coin.ticker}`}
      className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-bg-tertiary/40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coin.image}
        alt={coin.ticker_name || coin.ticker}
        width={20}
        height={20}
        loading="lazy"
        className="h-5 w-5 shrink-0 rounded-full"
      />
      <span className="shrink-0 font-mono text-[12px] font-bold text-text-primary">
        {coin.ticker.toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-[10.5px] text-text-muted">
        {coin.ticker_name}
      </span>
      <span className="mr-3 shrink-0 text-right font-mono leading-tight">
        <span className="block text-[11.5px] font-semibold text-text-primary num-tabular">
          ${formatPrice(coin.price)}
        </span>
        <span
          className={cn(
            "block text-[10px] font-semibold num-tabular",
            priceChangeTone(coin.price_change),
          )}
        >
          {formatPriceChange(coin.price_change)}
        </span>
      </span>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="font-mono text-[8.5px] uppercase tracking-widest text-text-faint">
          1D
        </span>
        <SparklineChart
          data={prices}
          positive={positive}
          isLoading={loading}
          height={20}
          showArea={false}
          showDots={false}
          className="w-14"
        />
      </div>
    </Link>
  );
}
