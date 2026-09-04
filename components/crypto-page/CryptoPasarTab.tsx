"use client";

import { CryptoSection } from "@/components/CryptoSection";

/**
 * "Pasar" tab content on the `/crypto` page — the market-data
 * pillar. Currently a thin shell around `<CryptoSection />`
 * (per-category mosaic driven by `GET coin-category/`).
 *
 * Pure presentational — no state, no fetch, no auth gating.
 * When the API exposes a `GET /crypto/market` aggregate, this
 * widget becomes the single swap point for that pillar's
 * "Top Movers" section.
 */
export function CryptoPasarTab() {
  return (
    <div className="mt-5 space-y-6">
      {/* Categories */}
      <CryptoSection />
    </div>
  );
}
