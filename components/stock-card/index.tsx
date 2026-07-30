"use client";

import { StockCardCompact } from "./StockCardCompact";
import { StockCardFeatured } from "./StockCardFeatured";
import { StockCardFeed } from "./StockCardFeed";
import { StockCardList } from "./StockCardList";
import { getStockByKode, type Saham } from "@/lib/mock/stocks";
import type { DailyRecap } from "@/lib/mock/recaps";

export interface StockCardProps {
  recap: DailyRecap;
  stock?: Saham;
  variant?: "feed" | "featured" | "compact" | "list";
  className?: string;
  rank?: number;
}

/**
 * `<StockCard />` — the public entry point. Thin dispatcher that
 * builds the deep-link href (with optional `?id=` query) and
 * delegates to the per-variant implementation under the
 * `stock-card/` folder.
 *
 * Variants live in their own files so each card shape is
 * independently scannable / editable without paging through a
 * 400-line monolith:
 *
 *   - `<StockCardCompact />` — single-row ticker chip
 *   - `<StockCardFeed />`    — dense vertical feed card (default)
 *   - `<StockCardFeatured />`— wide hero-driven card
 *   - `<StockCardList />`    — responsive mobile/desktop card
 *
 * Shared widgets (`<StockCardHero />`, `<StockCardActions />`,
 * `<StockCardFooter />`, `<StockCardOverlayLink />`) live alongside
 * the variants and are imported by whichever variant needs them.
 *
 * The local `getStockByKode` lookup is intentionally commented
 * out — recap data is already complete (ticker, sentiment,
 * counts) and falling back to the static stock catalog would
 * reintroduce dead `Saham` data the variant files don't render.
 */
export function StockCard({
  recap,
  variant = "feed",
  className,
  rank,
}: StockCardProps) {
  const href = `/stock/${recap.sahamKode}`;

  // `stock` is accepted for API parity with the original monolith
  // but the variants render the recap directly; the unused lookup
  // is intentionally not run. Reference kept to silence unused-var.
  void getStockByKode;

  switch (variant) {
    case "compact":
      return (
        <StockCardCompact
          recap={recap}
          href={href}
          className={className}
        />
      );
    case "featured":
      return (
        <StockCardFeatured
          recap={recap}
          href={href}
          rank={rank}
          className={className}
        />
      );
    case "list":
      return (
        <StockCardList
          recap={recap}
          href={href}
          rank={rank}
          className={className}
        />
      );
    case "feed":
    default:
      return (
        <StockCardFeed
          recap={recap}
          href={href}
          rank={rank}
          className={className}
        />
      );
  }
}
