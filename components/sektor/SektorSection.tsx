"use client";

import { CommodityPrices } from "@/components/commodity-prices";
import { SektorGrid } from "./SektorGrid";

interface SektorSectionProps {
  /** Optional wrapper className for the outer `<div>`. */
  className?: string;
}

/**
 * Sektor block on the `/saham/` "Sektor" sub-tab: `<CommodityPrices />`
 * on top + `<SektorGrid />` below.
 *
 * The previous standalone `/sektor/` index route was removed — the
 * grid only renders here now. Detail pages (`/sektor/[slug]/`) are
 * still served from a sibling route and untouched.
 *
 * Each block is self-contained (data lifecycle, render branches,
 * 401 login prompt) — this component is just the composition.
 */
export function SektorSection({
  className,
}: SektorSectionProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <CommodityPrices />
      </div>
      <SektorGrid />
    </div>
  );
}
