"use client";

import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COIN_CATEGORIES,
  getCoinsByCategory,
} from "@/lib/mock/crypto";
import { HUE_BG, HUE_BORDER, HUE_TEXT } from "./categoryStyles";
import { CategoryCoinRow } from "./CategoryCoinRow";

interface CategoryCardProps {
  /** One entry from `COIN_CATEGORIES`. `icon` is a kebab-case
   *  Lucide name (`"bar-chart-3"`); the card looks up the
   *  component from the lucide-react namespace and falls back
   *  to `Coins` when the name doesn't resolve. */
  cat: (typeof COIN_CATEGORIES)[number];
}

/** Resolves a kebab-case lucide icon name (e.g. `"bar-chart-3"`)
 *  to the lucide-react component, capitalising each segment.
 *  Falls back to `Coins` so a missing icon never blanks the chip. */
function resolveLucideIcon(name: string): Icons.LucideIcon {
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return (
    (Icons as unknown as Record<string, Icons.LucideIcon>)[pascal] ??
    Icons.Coins
  );
}

/**
 * One category card on the Pasar tab's category grid.
 *
 * Shows the category's icon chip, label, description, the day's
 * average change across all coins in the category, and a top-3
 * preview list. Empty categories render an italic placeholder
 * instead of the preview list so the card height stays stable.
 */
export function CategoryCard({ cat }: CategoryCardProps) {
  const IconComponent = resolveLucideIcon(cat.icon);
  const coinsInCat = getCoinsByCategory(cat.key);
  const avgChange =
    coinsInCat.length > 0
      ? coinsInCat.reduce((acc, c) => acc + c.changePercent, 0) /
        coinsInCat.length
      : 0;
  const isUp = avgChange >= 0;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-bg-secondary transition-colors hover:border-border-strong",
        HUE_BORDER[cat.hue],
      )}
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-md",
                HUE_BG[cat.hue],
                HUE_TEXT[cat.hue],
              )}
            >
              <IconComponent className="h-3.5 w-3.5" aria-hidden />
            </span>
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-wider text-text-primary">
              {cat.label}
            </h3>
          </div>
          <span
            className={cn(
              "font-mono text-[11px] font-semibold tabular-nums",
              isUp ? "text-cat-saham" : "text-cat-kebijakan",
            )}
          >
            {isUp ? "+" : ""}
            {avgChange.toFixed(2)}%
          </span>
        </div>

        {/* Description */}
        <p className="line-clamp-1 text-[10.5px] text-text-muted">
          {cat.description}
        </p>

        {/* Top 3 coins in category */}
        {coinsInCat.length > 0 ? (
          <ul className="mt-2.5 space-y-1">
            {coinsInCat.slice(0, 3).map((c) => (
              <CategoryCoinRow key={c.kode} coin={c} />
            ))}
          </ul>
        ) : (
          <p className="mt-2.5 text-[11px] italic text-text-faint">
            Belum ada koin di kategori ini
          </p>
        )}
      </div>
    </article>
  );
}
