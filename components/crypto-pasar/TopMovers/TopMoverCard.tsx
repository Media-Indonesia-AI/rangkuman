import { cn } from "@/lib/utils";
import type { CoinTickerItem } from "@/lib/api";
import { formatPrice } from "../formatters";

interface TopMoverCardProps {
  /** One coin row from the `top-gainer` or `top-looser` group. */
  coin: CoinTickerItem;
}

/**
 * Compact coin card on the Pasar tab's Top Movers grid.
 *
 * Layout: image avatar (CoinGecko CDN) + ticker / name (left),
 * price / change (right).
 *
 * The card is intentionally non-interactive (no `<Link>` wrapper,
 * no hover border / brand tint) — it reads as a passive data
 * card on the Pasar overview, not a clickable entry point.
 * Per-coin navigation is available on the `/crypto` listing.
 *
 * `bg-bg-tertiary` on the image gives a placeholder color when
 * the CDN hasn't resolved yet, so the card height stays stable
 * during the swap-in.
 */
export function TopMoverCard({ coin }: TopMoverCardProps) {
  const positive = coin.price_change >= 0;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coin.image}
        alt=""
        width={24}
        height={24}
        loading="lazy"
        className="h-6 w-6 shrink-0 rounded-full bg-bg-tertiary"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-[13px] font-bold uppercase tracking-tight text-text-primary">
          {coin.ticker}
        </div>
        <div className="truncate text-[10.5px] text-text-muted">
          {coin.ticker_name}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-[12.5px] font-bold tabular-nums text-text-primary">
          {formatPrice(coin.price)}
        </div>
        <div
          className={cn(
            "font-mono text-[10.5px] font-semibold tabular-nums",
            positive ? "text-bullish" : "text-bearish",
          )}
        >
          {positive ? "+" : ""}
          {coin.price_change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
