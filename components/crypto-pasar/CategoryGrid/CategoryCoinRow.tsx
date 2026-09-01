import Link from "next/link";
import type { CoinTickerItem } from "@/lib/api";
import { formatPrice } from "@/components/crypto-page/cryptoFormatters";
import { cn } from "@/lib/utils";
import { formatPriceChange, priceChangeTone } from "./formatters";

interface CategoryCoinRowProps {
  /** One coin row inside `<CategoryListItem />`. The image URL
   *  is a remote CoinGecko CDN asset (passed through as a plain
   *  `<img>` so it works without a next/image loader setup —
   *  the rest of the crypto widgets follow the same pattern).
   *  `ticker` drives the link to `/crypto/{ticker}`. */
  coin: CoinTickerItem;
}

/**
 * One coin row inside a `<CategoryListItem />` group:
 *
 *   [icon]  BTC  Bitcoin          $11.38   +2,05%
 *
 * Layout (left → right):
 *
 *   1. **Icon** — coin's logo (CDN URL, rounded full).
 *   2. **Ticker** — bold uppercase ticker on the baseline.
 *   3. **Name** — full ticker name, truncates if it overflows.
 *   4. **Price** — right-aligned, locale-formatted via
 *      `formatPrice` (the same formatter the `/crypto` page
 *      uses for its ticker card so the two surfaces match).
 *   5. **24h change** — signed percent below the price, tinted
 *      via `priceChangeTone`: bullish for up moves, bearish
 *      for down moves, muted for flat moves so a `0.00%` row
 *      doesn't pick up either sentiment color by accident.
 *
 * The whole row is a `<Link>` to `/crypto/{ticker}` so the
 * click hit area covers the full row, mirroring the
 * `<CoinTickerCard />` convention.
 */
export function CategoryCoinRow({ coin }: CategoryCoinRowProps) {
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
      <span className="shrink-0 text-right font-mono leading-tight">
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
    </Link>
  );
}
