/**
 * Mock story shapes for the `/crypto` page. Lives next to the page
 * widgets (not in `lib/mock/crypto.ts`) because the page-level
 * stories carry page-specific display fields (`timeAgo`, `readTime`,
 * `flag`, the per-story title/summary) that are unrelated to the
 * structured `CoinRecap` archive consumed by `/headline/detail/[id]` and
 * `/crypto/{date}` views.
 */

import type { Sentimen } from "@/lib/recap";
import type { StoryItem } from "@/lib/api";
import { toSentimen } from "@/lib/util/sentiment";
import { getRelativeTime } from "@/lib/util/formatDate";
import { findCryptoTopicId } from "@/lib/util/topicId";

/** Re-exported so existing imports (`from "@/components/crypto-page/cryptoStories"`)
 *  keep working — the canonical definition lives in
 *  `lib/util/topicId.ts` alongside its `findSahamTopicId` mirror. */
export { findCryptoTopicId };

export interface CryptoStory {
  id: string;
  title: string;
  summary: string;
  coinKode: string;
  coinName: string;
  coinPrice: number;
  coinChange: number;
  sentimen: Sentimen;
  jumlahBerita: number;
  sumber: string[];
  timeAgo: string;
  readTime: string;
  flag?: string;
}

/** Mocked stories for the `/crypto` page — one per active coin
 *  recap, sorted recency-desc. Six stories today so the layout can
 *  exercise all three layers (Headline / Sedang Terjadi / Cerita
 *  Lain) without branching on `length`. */
export const CRYPTO_PAGE_STORIES: CryptoStory[] = [
  {
    id: "cr-btc-2026-06-07",
    title: "Bitcoin break US$71.000 setelah data US CPI lebih rendah",
    summary:
      "Bitcoin break US$71.000 setelah data US CPI Mei lebih rendah dari ekspektasi (2,9% YoY vs 3,1% est). Spot BTC ETF catat net inflow US$425 juta kemarin, terbesar dalam 4 minggu. MicroStrategy umumkan tambahan akuisisi 5.200 BTC.",
    coinKode: "BTC",
    coinName: "Bitcoin",
    coinPrice: 71250,
    coinChange: 1.8,
    sentimen: "positif",
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
    sentimen: "positif",
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
    sentimen: "positif",
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
    sentimen: "negatif",
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
    sentimen: "positif",
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
    sentimen: "positif",
    jumlahBerita: 6,
    sumber: ["Decrypt", "The Block", "Cointelegraph", "CoinDesk"],
    timeAgo: "5 jam lalu",
    readTime: "2 mnt",
    flag: "🤖",
  },
];

/** `CoinTickerCard` needs to deep-link each ticker to its
 *  recap-detail page. Today the recap IDs are date-stamped, so we
 *  hard-map the 6 tickers the Pasar tab surfaces; for any ticker
 *  outside this set the card falls back to `""` and renders as
 *  unclickable. Centralizing the map here keeps the lookup out of
 *  the card component. */
export const COIN_KODE_TO_STORY_ID: Record<string, string> = {
  BTC: "cr-btc-2026-06-07",
  ETH: "cr-eth-2026-06-07",
  SOL: "cr-sol-2026-06-07",
  DOGE: "cr-doge-2026-06-07",
  LINK: "cr-link-2026-06-07",
  FET: "cr-fet-2026-06-07",
};

/**
 * Best-effort `StoryItem` (live wire) → `CryptoStory` (card
 * shape) adapter. Used by `<CryptoRecapTab />` to feed the
 * existing `<CryptoStoryCard />` and `<CryptoFeaturedCard />`
 * widgets from the live `useHeadlines(topic_id)` response.
 *
 * The live wire shape (`StoryItem`) doesn't carry page-specific
 * display fields, so we derive sensible defaults:
 *
 *   - `coinKode`  ← `primary_ticker_code` (or `"—"` when absent),
 *   - `coinName`  ← same as `coinKode` (no separate API name today),
 *   - `coinPrice` ← `0` (live wire doesn't ship price; the cards
 *                   render `$0` until the recap-detail API exposes
 *                   current market data — acceptable short-term
 *                   visual debt, less disruptive than reshaping the
 *                   card widgets),
 *   - `coinChange`< `0`  (same rationale),
 *   - `flag`      ← `undefined` (only the mock-known tickers carry
 *                   flag emojis today; the live API doesn't ship
 *                   one),
 *   - `timeAgo`   ← derived from `created_at` via the shared
 *                   `getRelativeTime()` helper,
 *   - `jumlahBerita` ← `1` (one story ≈ one article count baseline),
 *   - `readTime`  ← `"2 mnt"` placeholder,
 *   - `sumber`    ← `[]`  (live wire doesn't break down sources
 *                   here; the per-story `sources` arrive later via
 *                   the recap-detail fetch).
 *
 * This keeps the cards' prop contract stable while letting the
 * tab render any `StoryItem[]` shape it gets from the API.
 */
export function storyItemToCryptoStory(item: StoryItem): CryptoStory {
  const ticker = item.primary_ticker_code ?? "—";
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    coinKode: ticker,
    coinName: ticker,
    coinPrice: 0,
    coinChange: 0,
    sentimen: toSentimen(item.sentiment),
    jumlahBerita: 1,
    sumber: [],
    timeAgo: getRelativeTime(item.created_at),
    readTime: "2 mnt",
    flag: undefined,
  };
}
