import type { Sentimen } from "./recaps";

export interface MarketHeadline {
  id: string;
  /** ISO datetime, e.g. "2026-06-07T16:00:00" */
  publishedAt: string;
  /** Pre-formatted relative time, e.g. "2 jam lalu" */
  relativeTime: string;
  title: string;
  /** Optional ticker badge inline */
  ticker?: string;
  /** % change for the ticker badge color */
  tickerChange?: number;
  /** Optional sentiment badge */
  sentiment?: Sentimen;
  /** Group key: headlines sharing a storyId are part of the same thread. */
  storyId?: string;
  source?: string;
}

export const headlines: MarketHeadline[] = [
  // ─── TODAY (2026-06-07) ──────────────────────────────────────────
  {
    id: "h-001",
    publishedAt: "2026-06-07T16:30:00",
    relativeTime: "30 menit lalu",
    title:
      "IHSG ditutup +0,87% ke 7.245, ditopang sektor perbankan & telekomunikasi",
    ticker: "IHSG",
    tickerChange: 0.87,
    sentiment: "positif",
    storyId: "story-bi-rate-pivot",
    source: "Bloomberg",
  },
  {
    id: "h-002",
    publishedAt: "2026-06-07T16:00:00",
    relativeTime: "1 jam lalu",
    title:
      "BI naikkan suku bunga acuan 25bps ke 6,25%, pasar merespons positif",
    ticker: "BI",
    tickerChange: 0.25,
    sentiment: "positif",
    storyId: "story-bi-rate-pivot",
    source: "CNBC Indonesia",
  },
  {
    id: "h-003",
    publishedAt: "2026-06-07T14:30:00",
    relativeTime: "3 jam lalu",
    title:
      "Rupiah menguat ke Rp 16.320, terbaik dalam 2 minggu ditopang sinyal dovish BI",
    ticker: "USD/IDR",
    tickerChange: -0.40,
    sentiment: "positif",
    storyId: "story-bi-rate-pivot",
    source: "Reuters",
  },
  {
    id: "h-004",
    publishedAt: "2026-06-07T11:00:00",
    relativeTime: "6 jam lalu",
    title:
      "Foreign flow kembali net buy Rp 312 miliar, perbankan & telko jadi tujuan utama",
    sentiment: "positif",
    storyId: "story-foreign-flow",
    source: "Bisnis.com",
  },
  {
    id: "h-005",
    publishedAt: "2026-06-07T09:30:00",
    relativeTime: "8 jam lalu",
    title:
      "Harga minyak turun ke $79/barel, bantu margin emiten konsumer & transportasi",
    ticker: "OIL",
    tickerChange: -1.20,
    sentiment: "positif",
    source: "Bloomberg",
  },
  {
    id: "h-006",
    publishedAt: "2026-06-07T09:00:00",
    relativeTime: "8 jam lalu",
    title:
      "S&P 500 ditutup +0,52% semalam, Asian markets diproyeksikan dibuka hijau",
    ticker: "SPX",
    tickerChange: 0.52,
    sentiment: "positif",
    source: "CNBC",
  },

  // ─── YESTERDAY (2026-06-06) ────────────────────────────────────
  {
    id: "h-007",
    publishedAt: "2026-06-06T17:00:00",
    relativeTime: "Kemarin · 17:00",
    title:
      "BI akan umumkan keputusan suku bunga besok, konsensus prediksi kenaikan 25bps",
    sentiment: "netral",
    storyId: "story-bi-rate-pivot",
    source: "Kontan",
  },
  {
    id: "h-008",
    publishedAt: "2026-06-06T15:00:00",
    relativeTime: "Kemarin · 15:00",
    title:
      "Rupiah ditutup di Rp 16.385, konsisten di kisaran sempit jelang RDG BI",
    ticker: "USD/IDR",
    tickerChange: 0.10,
    sentiment: "netral",
    source: "Bisnis.com",
  },
  {
    id: "h-009",
    publishedAt: "2026-06-06T11:00:00",
    relativeTime: "Kemarin · 11:00",
    title:
      "China Caixin PMI manufaktur turun ke 49,5, sinyal perlambatan berlanjut",
    ticker: "CNPMI",
    tickerChange: -0.30,
    sentiment: "negatif",
    source: "Reuters",
  },
  {
    id: "h-010",
    publishedAt: "2026-06-06T09:30:00",
    relativeTime: "Kemarin · 09:30",
    title:
      "Wall Street ditutup mixed, S&P 500 flat setelah data payrolls AS",
    ticker: "SPX",
    tickerChange: 0.05,
    sentiment: "netral",
    source: "Bloomberg",
  },

  // ─── 2 DAYS AGO (2026-06-05) ────────────────────────────────────
  {
    id: "h-011",
    publishedAt: "2026-06-05T16:00:00",
    relativeTime: "2 hari lalu · 16:00",
    title:
      "Sri Mulyani: defisit fiskal 2026 dijaga di bawah 2,5% PDB, sentimen positif obligasi",
    ticker: "SUN",
    sentiment: "positif",
    source: "Bisnis.com",
  },
  {
    id: "h-012",
    publishedAt: "2026-06-05T14:00:00",
    relativeTime: "2 hari lalu · 14:00",
    title:
      "Harga nikel LME turun 4% setelah Indonesia umumkan rencana peningkatan ekspor",
    ticker: "NIKEL",
    tickerChange: -4.20,
    sentiment: "negatif",
    source: "Bloomberg",
  },
  {
    id: "h-013",
    publishedAt: "2026-06-05T10:00:00",
    relativeTime: "2 hari lalu · 10:00",
    title:
      "IHSG rebound tipis +0,12% setelah tekanan 2 hari sebelumnya",
    ticker: "IHSG",
    tickerChange: 0.12,
    sentiment: "positif",
    source: "CNBC Indonesia",
  },

  // ─── 3 DAYS AGO (2026-06-04) ────────────────────────────────────
  {
    id: "h-014",
    publishedAt: "2026-06-04T17:00:00",
    relativeTime: "3 hari lalu",
    title:
      "IHSG turun 0,8% tertekan pelemahan emiten tambang & properti",
    ticker: "IHSG",
    tickerChange: -0.80,
    sentiment: "negatif",
    source: "Kontan",
  },
];

export interface MarketStory {
  id: string;
  title: string;
  summary: string;
  sentiment: Sentimen;
  startedAt: string;
  headlineCount: number;
}

export const marketStories: MarketStory[] = [
  {
    id: "story-bi-rate-pivot",
    title: "BI Rate naik 25bps — akhir dari siklus tightening?",
    summary:
      "Bank Indonesia naikkan BI Rate 25bps ke 6,25%, namun nada Gubernur dovish — membuka peluang pause. Rupiah menguat, yield SUN turun, sektor perbankan memimpin kenaikan.",
    sentiment: "positif",
    startedAt: "2026-06-06T15:00:00",
    headlineCount: 4,
  },
  {
    id: "story-foreign-flow",
    title: "Foreign flow kembali masuk, perbankan jadi tujuan",
    summary:
      "Setelah 2 minggu net sell, asing mulai akumulasi lagi. Top picks: BBCA, BBRI, TLKM, BMRI. Top sells terbatas di ANTM, INCO.",
    sentiment: "positif",
    startedAt: "2026-06-07T11:00:00",
    headlineCount: 1,
  },
  {
    id: "story-nickel-pressure",
    title: "Nikel global tertekan, emiten tambang domestik koreksi",
    summary:
      "Harga nikel LME turun 4% setelah Indonesia umumkan rencana peningkatan ekspor. ANTM, INCO, MDKA kompak terkoreksi. Volume perdagangan melonjak 2x.",
    sentiment: "negatif",
    startedAt: "2026-06-05T14:00:00",
    headlineCount: 1,
  },
];

export function getStoryById(id: string): MarketStory | undefined {
  return marketStories.find((s) => s.id === id);
}
