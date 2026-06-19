export type Sentimen = "positif" | "netral" | "negatif";

export interface CoinSumber {
  media: string;
  logo: string;
  jumlah: number;
}

export interface CoinRecap {
  id: string;
  /** ISO date (YYYY-MM-DD). */
  tanggal: string;
  /** Coin ticker, e.g. "BTC". */
  coinKode: string;
  /** 2-3 sentence aggregate summary. */
  ringkasan: string;
  /** Aggregate sentiment. */
  sentimen: Sentimen;
  /** Total article count. */
  jumlahBerita: number;
  /** Breakdown by source. */
  sumber: CoinSumber[];
  /** Optional chain/category emoji (for /crypto/ stories) — e.g. "🟠" for BTC. */
  flag?: string;
}

export interface Coin {
  /** Ticker code, e.g. "BTC" */
  kode: string;
  /** Full name, e.g. "Bitcoin" */
  nama: string;
  /** Category (Layer 1, DeFi, Meme, etc.) */
  kategori: "Layer 1" | "Layer 2" | "DeFi" | "Meme" | "Payments" | "Stablecoin" | "AI" | "RWA";
  /** Current mock price in USD */
  price: number;
  /** 1h change % */
  change1hPercent: number;
  /** 24h change % */
  changePercent: number;
  /** 7d change % */
  change7dPercent: number;
  /** Market cap (USD) */
  marketCap: string;
  /** 24h volume */
  volume24h: string;
  /** Circulating supply (formatted string) */
  circulatingSupply: string;
  /** Sparkline data points (24 values, 0-1 normalized) for 7d chart */
  sparkline: number[];
  /** Hue for category color */
  hue: "amber" | "emerald" | "rose" | "sky" | "violet" | "slate";
}

export const COIN_CATEGORIES: {
  key: Coin["kategori"];
  label: string;
  description: string;
  icon: string; // Lucide kebab-case
  hue: "amber" | "violet" | "sky" | "rose" | "emerald" | "slate";
}[] = [
  {
    key: "Layer 1",
    label: "Layer 1",
    description: "Base blockchain — BTC, ETH, SOL, dll",
    icon: "layers",
    hue: "amber",
  },
  {
    key: "Layer 2",
    label: "Layer 2",
    description: "Scaling solution — MATIC, ARB, OP",
    icon: "git-merge",
    hue: "sky",
  },
  {
    key: "DeFi",
    label: "DeFi",
    description: "Decentralized finance — LINK, UNI, AAVE",
    icon: "coins",
    hue: "emerald",
  },
  {
    key: "Meme",
    label: "Meme",
    description: "Community coin — DOGE, SHIB, PEPE",
    icon: "smile",
    hue: "rose",
  },
  {
    key: "Payments",
    label: "Payments",
    description: "Remittance & transfer — XRP, XLM",
    icon: "send",
    hue: "violet",
  },
  {
    key: "AI",
    label: "AI",
    description: "AI x crypto — FET, RNDR, TAO",
    icon: "cpu",
    hue: "amber",
  },
  {
    key: "RWA",
    label: "RWA",
    description: "Real-world assets — ONDO, POLYX",
    icon: "landmark",
    hue: "emerald",
  },
  {
    key: "Stablecoin",
    label: "Stable",
    description: "Stablecoin — USDT, USDC, DAI",
    icon: "shield-check",
    hue: "slate",
  },
];

export const COINS: Coin[] = [
  {
    kode: "BTC",
    nama: "Bitcoin",
    kategori: "Layer 1",
    price: 71250,
    change1hPercent: 0.4,
    changePercent: 1.8,
    change7dPercent: 4.2,
    marketCap: "$1,40T",
    volume24h: "$28,4B",
    circulatingSupply: "19,7M BTC",
    hue: "amber",
    sparkline: [0.6, 0.62, 0.65, 0.63, 0.68, 0.7, 0.66, 0.72, 0.75, 0.7, 0.74, 0.78, 0.76, 0.82, 0.8, 0.85, 0.83, 0.87, 0.85, 0.9, 0.88, 0.92, 0.95, 1.0],
  },
  {
    kode: "ETH",
    nama: "Ethereum",
    kategori: "Layer 1",
    price: 3850,
    change1hPercent: 0.2,
    changePercent: 2.4,
    change7dPercent: 6.1,
    marketCap: "$462B",
    volume24h: "$14,2B",
    circulatingSupply: "120,2M ETH",
    hue: "slate",
    sparkline: [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.83, 0.88, 0.9, 0.92, 0.88, 0.93, 0.95, 0.97, 1.0],
  },
  {
    kode: "SOL",
    nama: "Solana",
    kategori: "Layer 1",
    price: 178,
    change1hPercent: 0.8,
    changePercent: 5.2,
    change7dPercent: 12.4,
    marketCap: "$82B",
    volume24h: "$3,8B",
    circulatingSupply: "461,2M SOL",
    hue: "violet",
    sparkline: [0.4, 0.45, 0.5, 0.48, 0.55, 0.6, 0.65, 0.62, 0.7, 0.75, 0.7, 0.78, 0.82, 0.85, 0.88, 0.85, 0.9, 0.92, 0.95, 0.93, 0.96, 0.98, 0.99, 1.0],
  },
  {
    kode: "BNB",
    nama: "BNB",
    kategori: "Layer 1",
    price: 612,
    change1hPercent: -0.1,
    changePercent: 0.8,
    change7dPercent: 2.1,
    marketCap: "$90B",
    volume24h: "$1,6B",
    circulatingSupply: "147,2M BNB",
    hue: "amber",
    sparkline: [0.55, 0.58, 0.6, 0.62, 0.6, 0.65, 0.63, 0.68, 0.7, 0.68, 0.72, 0.7, 0.75, 0.78, 0.76, 0.8, 0.78, 0.82, 0.8, 0.84, 0.82, 0.85, 0.83, 0.86],
  },
  {
    kode: "ADA",
    nama: "Cardano",
    kategori: "Layer 1",
    price: 0.48,
    change1hPercent: -0.3,
    changePercent: -1.2,
    change7dPercent: -3.5,
    marketCap: "$17B",
    volume24h: "$420M",
    circulatingSupply: "35,4B ADA",
    hue: "sky",
    sparkline: [0.7, 0.68, 0.65, 0.62, 0.6, 0.58, 0.6, 0.55, 0.52, 0.5, 0.48, 0.45, 0.5, 0.46, 0.44, 0.42, 0.4, 0.38, 0.4, 0.36, 0.34, 0.32, 0.34, 0.36],
  },
  {
    kode: "AVAX",
    nama: "Avalanche",
    kategori: "Layer 1",
    price: 36.2,
    change1hPercent: 0.5,
    changePercent: 2.1,
    change7dPercent: 5.8,
    marketCap: "$14B",
    volume24h: "$380M",
    circulatingSupply: "386,7M AVAX",
    hue: "rose",
    sparkline: [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.6, 0.65, 0.68, 0.7, 0.68, 0.72, 0.75, 0.78, 0.76, 0.8, 0.78, 0.82, 0.85, 0.83, 0.87, 0.85, 0.9, 0.93],
  },
  {
    kode: "MATIC",
    nama: "Polygon",
    kategori: "Layer 2",
    price: 0.72,
    change1hPercent: 0.2,
    changePercent: 1.4,
    change7dPercent: 3.2,
    marketCap: "$7,1B",
    volume24h: "$290M",
    circulatingSupply: "9,8B MATIC",
    hue: "violet",
    sparkline: [0.55, 0.58, 0.6, 0.58, 0.62, 0.65, 0.63, 0.68, 0.7, 0.72, 0.7, 0.74, 0.72, 0.76, 0.78, 0.8, 0.78, 0.82, 0.8, 0.84, 0.82, 0.85, 0.83, 0.86],
  },
  {
    kode: "LINK",
    nama: "Chainlink",
    kategori: "DeFi",
    price: 18.4,
    change1hPercent: 0.6,
    changePercent: 3.5,
    change7dPercent: 8.1,
    marketCap: "$11,5B",
    volume24h: "$480M",
    circulatingSupply: "625,0M LINK",
    hue: "sky",
    sparkline: [0.4, 0.45, 0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.88, 0.93, 0.95, 0.97],
  },
  {
    kode: "DOGE",
    nama: "Dogecoin",
    kategori: "Meme",
    price: 0.16,
    change1hPercent: -0.8,
    changePercent: -2.8,
    change7dPercent: -6.2,
    marketCap: "$23B",
    volume24h: "$1,1B",
    circulatingSupply: "143,8B DOGE",
    hue: "amber",
    sparkline: [0.7, 0.65, 0.62, 0.6, 0.55, 0.58, 0.5, 0.48, 0.45, 0.42, 0.4, 0.38, 0.4, 0.35, 0.32, 0.3, 0.28, 0.3, 0.25, 0.22, 0.2, 0.22, 0.18, 0.2],
  },
  {
    kode: "XRP",
    nama: "XRP",
    kategori: "Payments",
    price: 0.54,
    change1hPercent: 0.1,
    changePercent: 0.4,
    change7dPercent: -1.2,
    marketCap: "$30B",
    volume24h: "$820M",
    circulatingSupply: "55,5B XRP",
    hue: "slate",
    sparkline: [0.55, 0.58, 0.55, 0.6, 0.57, 0.62, 0.6, 0.58, 0.6, 0.62, 0.6, 0.58, 0.6, 0.62, 0.6, 0.58, 0.6, 0.62, 0.6, 0.58, 0.6, 0.62, 0.6, 0.62],
  },
  {
    kode: "FET",
    nama: "Fetch.ai",
    kategori: "AI",
    price: 1.42,
    change1hPercent: 1.2,
    changePercent: 6.8,
    change7dPercent: 18.2,
    marketCap: "$1,5B",
    volume24h: "$220M",
    circulatingSupply: "1,06B FET",
    hue: "amber",
    sparkline: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.78, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95, 0.93, 0.96, 0.98, 0.95, 0.97, 0.99, 1.0],
  },
  {
    kode: "ONDO",
    nama: "Ondo Finance",
    kategori: "RWA",
    price: 0.98,
    change1hPercent: 0.4,
    changePercent: 4.2,
    change7dPercent: 9.5,
    marketCap: "$1,4B",
    volume24h: "$95M",
    circulatingSupply: "1,43B ONDO",
    hue: "emerald",
    sparkline: [0.5, 0.55, 0.58, 0.62, 0.6, 0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.78, 0.82, 0.85, 0.83, 0.86, 0.88, 0.9, 0.87, 0.92, 0.9, 0.94, 0.96],
  },
];

export const CRYPTO_TODAY_ISO = "2026-06-07";
export const CRYPTO_YESTERDAY_ISO = "2026-06-06";
export const CRYPTO_DAY_BEFORE_ISO = "2026-06-05";
export const CRYPTO_AVAILABLE_DATE_ISOS = [
  CRYPTO_DAY_BEFORE_ISO,
  CRYPTO_YESTERDAY_ISO,
  CRYPTO_TODAY_ISO,
] as const;

/**
 * Aggregate market data for the CMC-style KPI cards.
 */
export interface MarketSnapshot {
  totalMarketCap: string;
  totalMarketCapChange: number;
  cmc20: string;
  cmc20Change: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  altcoinSeasonIndex: number;
  altcoinSeasonLabel: string;
  btcDominance: string;
  marketCapSparkline: number[];
  cmc20Sparkline: number[];
}

export const CRYPTO_MARKET: MarketSnapshot = {
  totalMarketCap: "$2,68T",
  totalMarketCapChange: 2.4,
  cmc20: "$124,18",
  cmc20Change: 1.8,
  fearGreedIndex: 68,
  fearGreedLabel: "Greed",
  altcoinSeasonIndex: 49,
  altcoinSeasonLabel: "Bitcoin Season",
  btcDominance: "52,2%",
  marketCapSparkline: [0.55, 0.58, 0.6, 0.62, 0.6, 0.65, 0.63, 0.68, 0.7, 0.68, 0.72, 0.7, 0.75, 0.78, 0.76, 0.8, 0.78, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.96],
  cmc20Sparkline: [0.6, 0.62, 0.65, 0.63, 0.66, 0.7, 0.68, 0.72, 0.7, 0.74, 0.76, 0.74, 0.78, 0.8, 0.78, 0.82, 0.85, 0.83, 0.86, 0.88, 0.9, 0.87, 0.92, 0.94],
};

/** 24h Trading Volume (US$). */
export const CRYPTO_24H_VOLUME = "$104,93B";
export const CRYPTO_24H_VOLUME_CHANGE = 1.6;
export const CRYPTO_24H_VOLUME_SPARKLINE = [0.45, 0.48, 0.5, 0.55, 0.6, 0.65, 0.7, 0.68, 0.72, 0.75, 0.78, 0.82, 0.85, 0.88, 0.9, 0.88, 0.92, 0.95, 0.93, 0.97, 0.95, 0.98, 0.99, 1.0];

/** Trending coins (top by 24h volume). */
export const TRENDING_COINS: Coin[] = [
  COINS.find((c) => c.kode === "BTC")!,
  COINS.find((c) => c.kode === "ETH")!,
  COINS.find((c) => c.kode === "SOL")!,
];

/** Top gainers (sorted by changePercent desc). */
export const TOP_GAINERS: Coin[] = [...COINS]
  .sort((a, b) => b.changePercent - a.changePercent)
  .slice(0, 3);

export const coinRecaps: CoinRecap[] = [
  // ─── TODAY (2026-06-07) ─────────────────────────────────────────
  {
    id: "cr-btc-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "BTC",
    ringkasan:
      "Bitcoin break US$71.000 setelah data US CPI Mei lebih rendah dari ekspektasi (2,9% YoY vs 3,1% est). Spot BTC ETF catat net inflow US$425 juta kemarin, terbesar dalam 4 minggu. MicroStrategy umumkan tambahan akuisisi 5.200 BTC.",
    sentimen: "positif",
    jumlahBerita: 12,
    sumber: [
      { media: "CoinDesk", logo: "📰", jumlah: 3 },
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Bloomberg", logo: "🌐", jumlah: 2 },
      { media: "Reuters", logo: "📡", jumlah: 2 },
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
    ],
    flag: "🟠",
  },
  {
    id: "cr-eth-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "ETH",
    ringkasan:
      "Ethereum tembus US$3.800, didorong upgrade Pectra yang sukses di mainnet dan spekulasi approval staking ETH ETF spot oleh SEC. Open interest futures ETH naik 18% dalam 24 jam.",
    sentimen: "positif",
    jumlahBerita: 9,
    sumber: [
      { media: "The Block", logo: "📊", jumlah: 3 },
      { media: "CoinDesk", logo: "📰", jumlah: 2 },
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
    ],
    flag: "🔷",
  },
  {
    id: "cr-sol-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "SOL",
    ringkasan:
      "Solana rally 5% ke US$178, leading L1. Firedancer mainnet beta diumumkan — validator client baru yang promise 1M TPS. Total DEX volume SOL链 tembus US$8 miliar minggu ini, salip Ethereum L1.",
    sentimen: "positif",
    jumlahBerita: 7,
    sumber: [
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
      { media: "CoinDesk", logo: "📰", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
    ],
    flag: "🟣",
  },
  {
    id: "cr-doge-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "DOGE",
    ringkasan:
      "Dogecoin turun 2,8% ke US$0,16 setelah Elon Musk mention DOGE di tweet tentang 'Department of Government Efficiency'. Whale wallet 1,2 miliar DOGE dipindahkan ke exchange — sinyal jual. Komunitas hold.",
    sentimen: "negatif",
    jumlahBerita: 5,
    sumber: [
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "CoinDesk", logo: "📰", jumlah: 1 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
    ],
    flag: "🐕",
  },
  {
    id: "cr-link-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "LINK",
    ringkasan:
      "Chainlink naik 3,5% setelah partnership dengan Swift untuk oracle infrastructure. CCIP (Cross-Chain Interoperability Protocol) sekarang handle 100+ institution. Reserve LINK naik US$50 juta.",
    sentimen: "positif",
    jumlahBerita: 4,
    sumber: [
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Decrypt", logo: "🔓", jumlah: 1 },
      { media: "CoinDesk", logo: "📰", jumlah: 1 },
    ],
    flag: "🔗",
  },
  {
    id: "cr-fet-2026-06-07",
    tanggal: CRYPTO_TODAY_ISO,
    coinKode: "FET",
    ringkasan:
      "Fetch.ai pump 6,8% jadi top gainer L1 AI. Narrative AI agent makin panas — a16z rilis State of Crypto report highlight AI agent sebagai use case 2026. FET juga integrasi dengan Ocean Protocol.",
    sentimen: "positif",
    jumlahBerita: 6,
    sumber: [
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
      { media: "CoinDesk", logo: "📰", jumlah: 1 },
    ],
    flag: "🤖",
  },

  // ─── YESTERDAY (2026-06-06) ─────────────────────────────────────
  {
    id: "cr-btc-2026-06-06",
    tanggal: CRYPTO_YESTERDAY_ISO,
    coinKode: "BTC",
    ringkasan:
      "Bitcoin sideways US$70.500 kemarin jelang data CPI US. Volume spot tipis. Whale wallet dormant 14 tahun aktif — pindahkan 1.000 BTC ke Coinbase. Spekulasi distribusi.",
    sentimen: "netral",
    jumlahBerita: 8,
    sumber: [
      { media: "CoinDesk", logo: "📰", jumlah: 2 },
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Bloomberg", logo: "🌐", jumlah: 2 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
      { media: "Reuters", logo: "📡", jumlah: 1 },
    ],
  },
  {
    id: "cr-eth-2026-06-06",
    tanggal: CRYPTO_YESTERDAY_ISO,
    coinKode: "ETH",
    ringkasan:
      "ETH stabil di US$3.760. Upgrade Pectra tinggal 2 hari lagi. Validator queue antri 28 hari untuk exit. Lido stETH/ETH depeg tipis ke 0,998.",
    sentimen: "netral",
    jumlahBerita: 6,
    sumber: [
      { media: "The Block", logo: "📊", jumlah: 2 },
      { media: "Decrypt", logo: "🔓", jumlah: 2 },
      { media: "CoinDesk", logo: "📰", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
    ],
  },

  // ─── DAY BEFORE (2026-06-05) ───────────────────────────────────
  {
    id: "cr-btc-2026-06-05",
    tanggal: CRYPTO_DAY_BEFORE_ISO,
    coinKode: "BTC",
    ringkasan:
      "BTC rebound 2% ke US$70.200 setelah sentimen risk-on pulih pasca data NFP US lebih lemah. Powell dovish di forum ECB. Miners terus distribute — hash rate all-time high 740 EH/s.",
    sentimen: "positif",
    jumlahBerita: 7,
    sumber: [
      { media: "CoinDesk", logo: "📰", jumlah: 2 },
      { media: "Bloomberg", logo: "🌐", jumlah: 2 },
      { media: "Reuters", logo: "📡", jumlah: 1 },
      { media: "Cointelegraph", logo: "📺", jumlah: 1 },
      { media: "The Block", logo: "📊", jumlah: 1 },
    ],
  },
];

export function getCoinRecapsByDate(isoDate: string): CoinRecap[] {
  return coinRecaps.filter((r) => r.tanggal === isoDate);
}

export function getCoinRecapsByRecentDays(
  days: number,
): Record<string, CoinRecap[]> {
  const dates = CRYPTO_AVAILABLE_DATE_ISOS.slice(-days);
  return Object.fromEntries(
    dates.map((d) => [d, getCoinRecapsByDate(d)]),
  );
}

export function getCoinByKode(kode: string): Coin | undefined {
  return COINS.find((c) => c.kode === kode);
}

export function getCoinsByCategory(kategori: Coin["kategori"]): Coin[] {
  return COINS.filter((c) => c.kategori === kategori);
}

export function getTopMovers(limit: number = 5): {
  gainers: Coin[];
  losers: Coin[];
} {
  const sorted = [...COINS].sort((a, b) => b.changePercent - a.changePercent);
  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse(),
  };
}

/**
 * Aggregate market mood for crypto (similar to MarketMood widget on /saham/).
 * Returns sentiment, label, summary text, and key factors.
 */
export function getCryptoMarketMood(isoDate: string): {
  sentiment: Sentimen;
  sentimentLabel: string;
  summary: string;
  factors: { label: string; status: "positive" | "neutral" | "negative" }[];
  totalMarketCap: string;
  btcDominance: string;
  fearGreedIndex: number; // 0-100
} {
  const recaps = getCoinRecapsByDate(isoDate);
  const positifCount = recaps.filter((r) => r.sentimen === "positif").length;
  const negatifCount = recaps.filter((r) => r.sentimen === "negatif").length;
  const totalRecaps = recaps.length || 1;

  let sentiment: Sentimen = "netral";
  let sentimentLabel = "Netral";
  if (positifCount > negatifCount * 1.5) {
    sentiment = "positif";
    sentimentLabel = "Bullish";
  } else if (negatifCount > positifCount * 1.5) {
    sentiment = "negatif";
    sentimentLabel = "Bearish";
  }

  return {
    sentiment,
    sentimentLabel,
    summary: `${recaps.length} koin aktif diliput media. ${positifCount} sentimen positif, ${negatifCount} negatif. BTC dominan, altcoin season moderat.`,
    factors: [
      {
        label: `BTC: ${isoDate === CRYPTO_TODAY_ISO ? "+1,8%" : "sideways"}`,
        status: "positive",
      },
      {
        label: `ETH: ${isoDate === CRYPTO_TODAY_ISO ? "+2,4%" : "+1,1%"}`,
        status: "positive",
      },
      {
        label: `SOL: ${isoDate === CRYPTO_TODAY_ISO ? "+5,2%" : "+2,8%"}`,
        status: "positive",
      },
      {
        label: "Fear & Greed: 68 (Greed)",
        status: "positive",
      },
    ],
    totalMarketCap: "$2,68T",
    btcDominance: "52,2%",
    fearGreedIndex: 68,
  };
}
