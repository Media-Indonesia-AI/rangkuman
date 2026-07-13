"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, ArrowUpRight, Flame, BookOpen, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoSubNav, type CryptoSubNavValue } from "@/components/CryptoSubNav";
import { CryptoSection } from "@/components/CryptoSection";
import { CryptoInfoBar } from "@/components/CryptoInfoBar";
import { cn } from "@/lib/utils";
import {
  COINS,
  TRENDING_COINS,
  TOP_GAINERS,
  type Coin,
} from "@/lib/mock/crypto";

const HUE_BG: Record<Coin["hue"], string> = {
  amber: "from-amber-500/30 to-amber-700/10",
  emerald: "from-emerald-500/30 to-emerald-700/10",
  rose: "from-rose-500/30 to-rose-700/10",
  sky: "from-sky-500/30 to-sky-700/10",
  violet: "from-violet-500/30 to-violet-700/10",
  slate: "from-slate-500/30 to-slate-700/10",
};

export default function CryptoPage() {
  const [subTab, setSubTab] = useState<CryptoSubNavValue>("top");

  // All coin stories (mapped to /sorotan/[id]/ links)
  const stories: Story[] = [
      {
        id: "cr-btc-2026-06-07",
        title: "Bitcoin break US$71.000 setelah data US CPI lebih rendah",
        summary:
          "Bitcoin break US$71.000 setelah data US CPI Mei lebih rendah dari ekspektasi (2,9% YoY vs 3,1% est). Spot BTC ETF catat net inflow US$425 juta kemarin, terbesar dalam 4 minggu. MicroStrategy umumkan tambahan akuisisi 5.200 BTC.",
        coinKode: "BTC",
        coinName: "Bitcoin",
        coinPrice: 71250,
        coinChange: 1.8,
        sentimen: "positif" as const,
        jumlahBerita: 12,
        sumber: ["CoinDesk", "The Block", "Bloomberg", "Reuters", "Decrypt", "Cointelegraph"],
        timeAgo: "1 jam lalu",
        readTime: "2 mnt",
        flag: "🟠",
      },
      {
        id: "cr-eth-2026-06-07",
        title: "Ethereum tembus US$3.800 didorong upgrade Pectra & spekulasi staking ETF",
        summary:
          "Ethereum tembus US$3.800, didorong upgrade Pectra yang sukses di mainnet dan spekulasi approval staking ETH ETF spot oleh SEC. Open interest futures ETH naik 18% dalam 24 jam.",
        coinKode: "ETH",
        coinName: "Ethereum",
        coinPrice: 3850,
        coinChange: 2.4,
        sentimen: "positif" as const,
        jumlahBerita: 9,
        sumber: ["The Block", "CoinDesk", "Decrypt", "Bloomberg", "Cointelegraph"],
        timeAgo: "2 jam lalu",
        readTime: "2 mnt",
        flag: "🔷",
      },
      {
        id: "cr-sol-2026-06-07",
        title: "Solana rally 5% setelah Firedancer mainnet beta, DEX volume salip ETH",
        summary:
          "Solana rally 5% ke US$178, leading L1. Firedancer mainnet beta diumumkan — validator client baru yang promise 1M TPS. Total DEX volume SOL链 tembus US$8 miliar minggu ini, salip Ethereum L1.",
        coinKode: "SOL",
        coinName: "Solana",
        coinPrice: 178,
        coinChange: 5.2,
        sentimen: "positif" as const,
        jumlahBerita: 7,
        sumber: ["Decrypt", "The Block", "Cointelegraph", "CoinDesk", "Bloomberg"],
        timeAgo: "3 jam lalu",
        readTime: "2 mnt",
        flag: "🟣",
      },
      {
        id: "cr-doge-2026-06-07",
        title: "Dogecoin turun 2,8% setelah tweet Elon Musk, whale wallet pindahkan 1,2 miliar DOGE",
        summary:
          "Dogecoin turun 2,8% ke US$0,16 setelah Elon Musk mention DOGE di tweet tentang 'Department of Government Efficiency'. Whale wallet 1,2 miliar DOGE dipindahkan ke exchange — sinyal jual. Komunitas hold.",
        coinKode: "DOGE",
        coinName: "Dogecoin",
        coinPrice: 0.16,
        coinChange: -2.8,
        sentimen: "negatif" as const,
        jumlahBerita: 5,
        sumber: ["Decrypt", "CoinDesk", "Cointelegraph", "Bloomberg"],
        timeAgo: "4 jam lalu",
        readTime: "2 mnt",
        flag: "🐕",
      },
      {
        id: "cr-link-2026-06-07",
        title: "Chainlink naik 3,5% setelah partnership dengan Swift untuk oracle infrastructure",
        summary:
          "Chainlink naik 3,5% setelah partnership dengan Swift untuk oracle infrastructure. CCIP (Cross-Chain Interoperability Protocol) sekarang handle 100+ institution. Reserve LINK naik US$50 juta.",
        coinKode: "LINK",
        coinName: "Chainlink",
        coinPrice: 18.4,
        coinChange: 3.5,
        sentimen: "positif" as const,
        jumlahBerita: 4,
        sumber: ["The Block", "Decrypt", "CoinDesk"],
        timeAgo: "5 jam lalu",
        readTime: "2 mnt",
        flag: "🔗",
      },
      {
        id: "cr-fet-2026-06-07",
        title: "Fetch.ai pump 6,8% jadi top gainer L1 AI, narrative AI agent makin panas",
        summary:
          "Fetch.ai pump 6,8% jadi top gainer L1 AI. Narrative AI agent makin panas — a16z rilis State of Crypto report highlight AI agent sebagai use case 2026. FET juga integrasi dengan Ocean Protocol.",
        coinKode: "FET",
        coinName: "Fetch.ai",
        coinPrice: 1.42,
        coinChange: 6.8,
        sentimen: "positif" as const,
        jumlahBerita: 6,
        sumber: ["Decrypt", "The Block", "Cointelegraph", "CoinDesk"],
        timeAgo: "5 jam lalu",
        readTime: "2 mnt",
        flag: "🤖",
      },
  ];

  const lead = stories[0];
  const sedangTerjadi = stories.slice(1, 5);
  const ceritaLain = stories.slice(5);

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
                <SectionHeader
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
                <SectionHeader
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
                <SectionHeader
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

            {stories.length === 0 && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-secondary/50 px-6 py-12 text-center">
                <Inbox className="h-7 w-7 text-text-faint" aria-hidden />
                <p className="text-[13.5px] font-semibold text-text-primary">
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
              <SectionHeader
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

function SectionHeader({
  icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  title2?: string;
  subtitle: string;
  count: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <h2 className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          {icon}
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] text-text-muted">{subtitle}</p>
      </div>
      <span className="font-mono text-[10px] text-text-faint">{count}</span>
    </div>
  );
}

interface Story {
  id: string;
  title: string;
  summary: string;
  coinKode: string;
  coinName: string;
  coinPrice: number;
  coinChange: number;
  sentimen: "positif" | "netral" | "negatif";
  jumlahBerita: number;
  sumber: string[];
  timeAgo: string;
  readTime: string;
  flag?: string;
}

function CryptoFeaturedCard({ story }: { story: Story }) {
  const isUp = story.coinChange >= 0;
  return (
    <article className="group relative overflow-hidden rounded-lg border border-border-strong bg-bg-secondary">
      <Link href={`/sorotan/${story.id}`} className="block">
        {/* Gradient header */}
        <div
          className="relative h-28 w-full overflow-hidden sm:h-32 bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-bg-secondary"
          aria-hidden
        >
          <div className="absolute inset-0 opacity-50 pattern-chart-line" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 sm:left-4 sm:top-4">
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {story.flag} {story.coinKode}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              LIVE
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <h3 className="font-mono text-[22px] font-bold leading-[1.1] tracking-tight text-text-primary transition-colors group-hover:text-text-primary sm:text-[28px] sm:leading-[1.08] lg:text-[32px] lg:leading-[1.05]">
            {story.title}
          </h3>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-text-secondary sm:text-[13.5px]">
            {story.summary}
          </p>

          {/* Price block */}
          <div className="mt-3 flex flex-wrap items-baseline gap-2 border-t border-border pt-3">
            <span className="font-mono text-[20px] font-bold tabular-nums text-text-primary">
              ${formatPrice(story.coinPrice)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[12px] font-semibold tabular-nums",
                isUp ? "text-cat-saham" : "text-cat-kebijakan",
              )}
            >
              {isUp ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              {isUp ? "+" : ""}
              {story.coinChange.toFixed(2)}%
              <span className="text-[10px] text-text-faint">· 24 jam</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] text-text-muted">
            <span className="text-text-secondary">By Tim Redaksi</span>
            <span className="text-text-faint">·</span>
            <span>{story.timeAgo}</span>
            <span className="text-text-faint">·</span>
            <span className="font-bold tabular-nums text-cat-amber-500">
              {story.jumlahBerita}
            </span>
            <span>sumber</span>
            <span className="text-text-faint">·</span>
            <span>{story.readTime}</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded border border-current/30 bg-current/5 px-2 py-0.5 text-[10px] font-semibold text-text-primary transition-all hover:bg-current/10">
              Baca cerita
              <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CryptoStoryCard({
  story,
  compact = false,
}: {
  story: Story;
  compact?: boolean;
}) {
  const isUp = story.coinChange >= 0;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong">
      <Link href={`/sorotan/${story.id}`} className="flex h-full flex-col">
        <div className="relative flex h-1.5 w-full bg-gradient-to-r from-amber-500/40 to-amber-700/10" aria-hidden />
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-amber-500">
              {story.flag} {story.coinKode}
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              {story.timeAgo}
            </span>
          </div>
          <h3 className="font-mono text-[16.5px] font-bold leading-[1.2] tracking-tight text-text-primary sm:text-[18px]">
            {story.title}
          </h3>
          {!compact && (
            <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {story.summary}
            </p>
          )}
          <div className="mt-auto" />
          <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
            <div className="flex items-center gap-2 font-mono text-[9.5px] text-text-muted">
              <span className="font-bold tabular-nums text-cat-amber-500">
                {story.jumlahBerita}
              </span>
              <span>sumber</span>
              <span className="mx-1">·</span>
              <span>{story.readTime}</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-[12px] font-bold tabular-nums text-text-primary">
                ${formatPrice(story.coinPrice)}
              </div>
              <div
                className={cn(
                  "font-mono text-[10px] font-semibold tabular-nums",
                  isUp ? "text-cat-saham" : "text-cat-kebijakan",
                )}
              >
                {isUp ? "+" : ""}
                {story.coinChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CoinTickerCard({ coin }: { coin: Coin }) {
  const isUp = coin.changePercent >= 0;
  return (
    <Link
      href={`/sorotan/${coin.kode === "BTC" ? "cr-btc-2026-06-07" : coin.kode === "ETH" ? "cr-eth-2026-06-07" : coin.kode === "SOL" ? "cr-sol-2026-06-07" : coin.kode === "FET" ? "cr-fet-2026-06-07" : coin.kode === "LINK" ? "cr-link-2026-06-07" : coin.kode === "DOGE" ? "cr-doge-2026-06-07" : ""}`}
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

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(3);
  }
  return price.toFixed(4);
}
