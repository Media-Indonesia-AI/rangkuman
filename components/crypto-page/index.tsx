"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, ArrowUpRight, Flame, BookOpen, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CryptoSubNav,
  type CryptoSubNavValue,
} from "@/components/CryptoSubNav";
import { CryptoSection } from "@/components/CryptoSection";
import { CryptoInfoBar } from "@/components/CryptoInfoBar";
import { COINS, TRENDING_COINS, TOP_GAINERS } from "@/lib/mock/crypto";
import { CryptoSectionHeader } from "./CryptoSectionHeader";
import { CryptoFeaturedCard } from "./CryptoFeaturedCard";
import { CryptoStoryCard } from "./CryptoStoryCard";
import { CoinTickerCard } from "./CoinTickerCard";
import { CRYPTO_PAGE_STORIES } from "./cryptoStories";

/**
 * `/crypto` page — the crypto pillar of the home feed. Composes
 * the small widgets in this folder:
 *   - `<CryptoSectionHeader />` — title + subtitle + count row,
 *   - `<CryptoFeaturedCard />` — Sorotan (lead) story,
 *   - `<CryptoStoryCard />` — Sedang Terjadi / Cerita Lain cards,
 *   - `<CoinTickerCard />` — Pasar tab's Top Movers tiles,
 *   - `<CryptoSubNav />`, `<CryptoInfoBar />`, `<CryptoSection />`,
 *     `<Navbar />`, `<Footer />` — pulled from the existing
 *     shared components.
 *
 * The page owns:
 *   - the active sub-tab state (`"top" | "pasar"`),
 *   - the slice of `CRYPTO_PAGE_STORIES` into the three layers
 *     (lead = index 0, sedang-terjadi = indices 1-4, cerita-lain
 *     = the rest),
 *   - the empty-state row,
 *   - the bottom "Lihat lebih banyak" CTA,
 *   - the Pasar tab's "Top Movers" merge (TOP_GAINERS first,
 *     TRENDING_COINS minus the duplicates), deduplicated to the
 *     first 6 entries.
 *
 * `CryptoPage` is a client component because it owns the
 * sub-tab state.
 */
export default function CryptoPage() {
  const [subTab, setSubTab] = useState<CryptoSubNavValue>("top");

  // Slice the mock story list into the three layers the Sorotan
  // page renders. The lead is always index 0; layers 2-3 split the
  // tail with a fixed 4-card "Sedang Terjadi" cap so the layout
  // stays predictable as new recaps arrive.
  const lead = CRYPTO_PAGE_STORIES[0];
  const sedangTerjadi = CRYPTO_PAGE_STORIES.slice(1, 5);
  const ceritaLain = CRYPTO_PAGE_STORIES.slice(5);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-3 sm:px-6 sm:pt-4 md:max-w-4xl lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Crypto: Berita Crypto Hari Ini
        </h1>

        {/* Sub-nav (Recap | Pasar) — replaces section header */}
        <div className="flex items-center justify-start pt-1">
          <CryptoSubNav active={subTab} onChange={setSubTab} />
        </div>

        {/* 1-line info bar — F&G gauge + 3 sparklines (BTC/ETH/SOL) */}
        <CryptoInfoBar className="mt-3" />

        {subTab === "top" && (
          <>
            {/* 🔥 LAYER 1: SOROTAN — 1 big card */}
            {lead && (
              <section aria-label="Sorotan" className="mt-4">
                <CryptoSectionHeader
                  icon={<Flame className="h-3 w-3" aria-hidden />}
                  title="Sorotan"
                  subtitle="Cerita paling penting hari ini"
                  count="1 cerita"
                />
                <CryptoFeaturedCard story={lead} />
              </section>
            )}

            {/* 📋 LAYER 2: SEDANG TERJADI — 4 cards in 2-col */}
            {sedangTerjadi.length > 0 && (
              <section aria-label="Sedang terjadi" className="mt-8">
                <CryptoSectionHeader
                  icon={<Flame className="h-3 w-3" aria-hidden />}
                  title="Sedang Terjadi"
                  subtitle="Cerita penting lainnya"
                  count={`Top ${sedangTerjadi.length} · 1 jam terakhir`}
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {sedangTerjadi.map((s) => (
                    <CryptoStoryCard key={s.id} story={s} />
                  ))}
                </div>
              </section>
            )}

            {/* 📚 LAYER 3: CERITA LAIN — 3-col grid (compact, no summary) */}
            {ceritaLain.length > 0 && (
              <section aria-label="Cerita lain" className="mt-8">
                <CryptoSectionHeader
                  icon={<BookOpen className="h-3 w-3" aria-hidden />}
                  title="Cerita Lain"
                  subtitle="Berita tambahan hari ini"
                  count={`${ceritaLain.length} cerita`}
                />
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {ceritaLain.map((s) => (
                    <CryptoStoryCard key={s.id} story={s} compact />
                  ))}
                </div>
              </section>
            )}

            {CRYPTO_PAGE_STORIES.length === 0 && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-12 text-center">
                <Inbox className="h-7 w-7 text-text-faint" aria-hidden />
                <p className="mt-2 text-[13.5px] font-semibold text-text-primary">
                  Belum ada cerita untuk tanggal ini
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Link
                href="/trending"
                className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary transition-all hover:border-brand hover:text-brand"
              >
                Lihat lebih banyak
                <ArrowUpRight
                  className="h-3 w-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  aria-hidden
                />
              </Link>
            </div>
          </>
        )}

        {subTab === "pasar" && (
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
                {[...TOP_GAINERS, ...TRENDING_COINS.filter((c) => !TOP_GAINERS.includes(c))].slice(0, 6).map((c) => (
                  <CoinTickerCard key={c.kode} coin={c} />
                ))}
              </div>
            </section>

            {/* Categories */}
            <CryptoSection />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
