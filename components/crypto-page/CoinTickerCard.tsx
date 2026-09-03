"use client";

import Link from "next/link";
import type { Coin } from "@/lib/mock/crypto";
import { cn } from "@/lib/utils";
import { formatPrice, HUE_BG } from "./cryptoFormatters";
import { COIN_KODE_TO_STORY_ID } from "./cryptoStories";

interface CoinTickerCardProps {
  /** The coin to render. Ticker kode drives the avatar pill,
   *  price, and 24h change; `nama` is the muted secondary label. */
  coin: Coin;
}

/**
 * Compact ticker card on the Pasar tab's "Top Movers 24 jam"
 * grid — circular hue pill with the coin's first letter, full
 * ticker code, full name, current price, and 24h change.
 *
 * The whole card is a single `<Link>` so the click hit area
 * covers the entire pill, mirroring the `CoinPillBar` /
 * `TickerRow` conventions. The link target is the per-coin recap
 * detail at `/headline/detail/{recapId}`; the ID is looked up from
 * `COIN_KODE_TO_STORY_ID`. For tickers the Pasar tab surfaces
 * that aren't in the lookup, the card renders as unclickable
 * (empty `href`).
 */
export function CoinTickerCard({ coin }: CoinTickerCardProps) {
  const isUp = coin.changePercent >= 0;
  const href = `/headline/detail/${COIN_KODE_TO_STORY_ID[coin.kode] ?? ""}`;
  return (
    <Link
      href={href}
      aria-disabled={href === "/headline/detail/" ? "true" : undefined}
      tabIndex={href === "/headline/detail/" ? -1 : undefined}
      className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2.5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-mono text-[11px] font-bold text-white",
            HUE_BG[coin.hue],
          )}
        >
          {coin.kode.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-bold tracking-tight text-text-primary group-hover:text-brand">
            {coin.kode}
          </p>
          <p className="truncate text-[10.5px] text-text-muted">{coin.nama}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[12.5px] font-bold tabular-nums text-text-primary">
          ${formatPrice(coin.price)}
        </div>
        <div
          className={cn(
            "font-mono text-[10.5px] font-semibold tabular-nums",
            isUp ? "text-cat-saham" : "text-cat-kebijakan",
          )}
        >
          {isUp ? "+" : ""}
          {coin.changePercent.toFixed(2)}%
        </div>
      </div>
    </Link>
  );
}
