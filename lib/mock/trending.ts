import type { Sentimen } from "./recaps";
import { stocks } from "./stocks";

export type TrendingPeriod = "today" | "week" | "month";

export interface TrendingStock {
  rank: number;
  kode: string;
  nama: string;
  sektor: string;
  sentiment: Sentimen;
  price: number;
  changePercent: number;
  articleCount: number;
  mediaCount: number;
  /** Used to pick the row's gradient accent. */
  hue: (typeof stocks)[number]["hue"];
}

const stockByKode = new Map(stocks.map((s) => [s.kode, s]));

function stockBaseData(kode: string) {
  const s = stockByKode.get(kode);
  if (!s) {
    return {
      nama: kode,
      sektor: "—",
      price: 1000,
      changePercent: 0,
      hue: "slate" as const,
    };
  }
  return {
    nama: s.nama,
    sektor: s.sektor,
    price: s.price,
    changePercent: s.changePercent,
    hue: s.hue,
  };
}

/** Build a trending entry with the given activity counters. */
function row(
  rank: number,
  kode: string,
  sentiment: Sentimen,
  articleCount: number,
  mediaCount: number,
  priceOverride?: number,
  changeOverride?: number,
): TrendingStock {
  const base = stockBaseData(kode);
  return {
    rank,
    kode,
    nama: base.nama,
    sektor: base.sektor,
    sentiment,
    price: priceOverride ?? base.price,
    changePercent: changeOverride ?? base.changePercent,
    articleCount,
    mediaCount,
    hue: base.hue,
  };
}

/**
 * 20 most-discussed stocks per time window. Curated by hand so each period
 * has its own ordering and story. The first 7 entries are the ones we surface
 * on the home page as "trending" (the same 7 also appear in the recap feed).
 */
export const trendingByPeriod: Record<TrendingPeriod, TrendingStock[]> = {
  // ───── HARI INI (7 Juni 2026) ─────
  today: [
    row(1,  "BBCA", "positif", 12, 6, 9875,  2.22),
    row(2,  "TLKM", "positif", 9,  5, 3420,  2.86),
    row(3,  "ANTM", "negatif", 9,  4, 1815, -5.22),
    row(4,  "GOTO", "netral",  7,  4, 78,    0.00),
    row(5,  "ASII", "netral",  6,  4, 5125, -1.40),
    row(6,  "UNVR", "positif", 5,  3, 2875,  2.10),
    row(7,  "MDKA", "netral",  4,  3, 2425,  0.41),
    row(8,  "BBRI", "positif", 4,  3, 5420,  1.40),
    row(9,  "INCO", "negatif", 4,  3, 4250, -4.81),
    row(10, "BMRI", "positif", 3,  2, 6750,  0.90),
    row(11, "ICBP", "negatif", 3,  3, 11250, -1.80),
    row(12, "KLBF", "netral",  2,  2, 1610,  0.31),
    row(13, "BRIS", "positif", 2,  2, 2580,  1.78),
    row(14, "FREN", "positif", 2,  2, 88,   11.39),
    row(15, "HMSP", "negatif", 2,  2, 805,  -0.62),
    row(16, "BBNI", "positif", 2,  2, 5210,  1.12),
    row(17, "BRPT", "positif", 2,  2, 1180,  2.85),
    row(18, "PTBA", "positif", 1,  1, 2680,  2.10),
    row(19, "UNTR", "netral",  1,  1, 24850, -0.78),
    row(20, "SMGR", "negatif", 1,  1, 4250, -1.20),
  ],

  // ───── SEMINGGU (1-7 Juni 2026) ─────
  week: [
    row(1,  "BBCA", "positif", 23, 7, 9875,   4.10),
    row(2,  "TLKM", "positif", 17, 6, 3420,   6.20),
    row(3,  "INCO", "negatif", 14, 5, 4250,  -7.50),
    row(4,  "ANTM", "negatif", 13, 5, 1815,  -8.10),
    row(5,  "ASII", "netral",  12, 5, 5125,  -0.50),
    row(6,  "GOTO", "netral",  11, 4, 78,     1.20),
    row(7,  "BMRI", "positif", 10, 4, 6750,   3.20),
    row(8,  "UNVR", "positif", 9,  4, 2875,   4.80),
    row(9,  "BBRI", "positif", 8,  4, 5420,   2.90),
    row(10, "MDKA", "netral",  7,  4, 2425,   1.20),
    row(11, "ICBP", "negatif", 6,  3, 11250, -2.40),
    row(12, "HMSP", "negatif", 5,  3, 805,   -1.50),
    row(13, "BBNI", "positif", 4,  3, 5210,   1.80),
    row(14, "FREN", "positif", 4,  3, 88,    14.20),
    row(15, "KLBF", "netral",  3,  2, 1610,   0.40),
    row(16, "BRIS", "positif", 3,  2, 2580,   2.30),
    row(17, "PTBA", "positif", 2,  2, 2680,   3.40),
    row(18, "BRPT", "positif", 2,  2, 1180,   3.10),
    row(19, "UNTR", "netral",  2,  2, 24850,  0.20),
    row(20, "SMGR", "negatif", 2,  2, 4250,  -1.50),
  ],

  // ───── SEBULAN (8 Mei - 7 Juni 2026) ─────
  month: [
    row(1,  "BBCA", "positif", 78, 12, 9875,   8.40),
    row(2,  "TLKM", "positif", 64, 9,  3420,  12.20),
    row(3,  "ANTM", "negatif", 52, 8,  1815, -15.30),
    row(4,  "BMRI", "positif", 48, 8,  6750,   6.80),
    row(5,  "INCO", "negatif", 44, 7,  4250, -18.40),
    row(6,  "GOTO", "positif", 41, 7,  78,     3.20),
    row(7,  "ASII", "netral",  38, 7,  5125,  -1.20),
    row(8,  "UNVR", "positif", 35, 6,  2875,   5.40),
    row(9,  "BBRI", "positif", 32, 6,  5420,   4.60),
    row(10, "MDKA", "netral",  28, 6,  2425,   0.80),
    row(11, "HMSP", "negatif", 24, 5,  805,   -3.20),
    row(12, "ICBP", "negatif", 22, 5,  11250, -5.40),
    row(13, "PTBA", "positif", 18, 4,  2680,   6.10),
    row(14, "BBNI", "positif", 16, 4,  5210,   3.80),
    row(15, "FREN", "positif", 14, 4,  88,    18.40),
    row(16, "BRIS", "positif", 12, 4,  2580,   4.20),
    row(17, "BRPT", "positif", 10, 3,  1180,   7.20),
    row(18, "KLBF", "netral",  8,  3,  1610,   0.50),
    row(19, "UNTR", "netral",  6,  3,  24850,  0.30),
    row(20, "SMGR", "negatif", 5,  3,  4250,  -2.80),
  ],
};

export function getTrending(period: TrendingPeriod): TrendingStock[] {
  return trendingByPeriod[period];
}

/** Counts for the period filter pills. */
export const trendingCounts: Record<TrendingPeriod, number> = {
  today: 20,
  week: 20,
  month: 20,
};

export const periodLabel: Record<TrendingPeriod, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
};
