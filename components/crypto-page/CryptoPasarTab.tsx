"use client";

import { BarChart3 } from "lucide-react";
import { CryptoSection } from "@/components/CryptoSection";
import {
  COINS,
  TRENDING_COINS,
  TOP_GAINERS,
} from "@/lib/mock/crypto";
import { CryptoSectionHeader } from "./CryptoSectionHeader";
import { CoinTickerCard } from "./CoinTickerCard";

/**
 * "Pasar" tab content on the `/crypto` page — the market-data
 * pillar. Two stacked sections:
 *
 *  1. **Top Movers 24 jam** — the 6 highest-momentum coins.
 *     Merges `TOP_GAINERS` first, then `TRENDING_COINS` minus
 *     the duplicates, and slices to 6 cards. The merged list
 *     keeps the gainers pinned to the top of the visual grid
 *     regardless of trending overlap.
 *
 *  2. **Categories** — the per-category mosaic
 *     (`<CryptoSection />`), pulled from the existing shared
 *     component so this file stays free of category-specific
 *     data plumbing.
 *
 * Pure presentational — no state, no fetch, no auth gating.
 * All the underlying market / category data is mock-served
 * through `lib/mock/crypto` for now; when the API exposes
 * `GET /crypto/market` and `GET /crypto/categories`, this
 * widget becomes the single swap point for those fetches.
 */
export function CryptoPasarTab() {
  return (
    <div className="mt-5 space-y-6">
      {/* Top movers — per-token ticker */}
      <section>
        <CryptoSectionHeader
          icon={<BarChart3 className="h-3 w-3" aria-hidden />}
          title="Top Movers 24 jam"
          subtitle="Koin dengan perubahan harga terbesar"
          count={`${COINS.length} koin diliput`}
        />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ...TOP_GAINERS,
            ...TRENDING_COINS.filter((c) => !TOP_GAINERS.includes(c)),
          ]
            .slice(0, 6)
            .map((c) => (
              <CoinTickerCard key={c.kode} coin={c} />
            ))}
        </div>
      </section>

      {/* Categories */}
      <CryptoSection />
    </div>
  );
}
