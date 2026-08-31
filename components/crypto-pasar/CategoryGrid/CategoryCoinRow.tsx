import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Coin } from "@/lib/mock/crypto";

interface CategoryCoinRowProps {
  /** Mock coin to render. `changePercent` drives the right-side
   *  tint (bullish / bearish). */
  coin: Coin;
}

/**
 * Single coin row inside a category card — ticker on the left
 * (linked to `/crypto/{kode}`), signed change % on the right.
 * The `%` is truncated to 1 decimal to keep the row height
 * stable across the grid.
 */
export function CategoryCoinRow({ coin }: CategoryCoinRowProps) {
  const isUp = coin.changePercent >= 0;
  return (
    <li className="flex items-center justify-between text-[11.5px]">
      <Link
        href={`/crypto/${coin.kode.toLowerCase()}`}
        className="font-mono font-semibold text-text-primary hover:text-brand"
      >
        {coin.kode}
      </Link>
      <span
        className={cn(
          "font-mono tabular-nums",
          isUp ? "text-cat-saham" : "text-cat-kebijakan",
        )}
      >
        {isUp ? "+" : ""}
        {coin.changePercent.toFixed(1)}%
      </span>
    </li>
  );
}
