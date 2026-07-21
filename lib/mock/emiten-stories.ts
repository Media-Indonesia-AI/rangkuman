/**
 * Mock data for the "Story" widget on `/saham` — curated narrative
 * contexts per emiten ("Konteks emiten yang lagi berkembang").
 *
 * This is hand-authored editorial content, not an API resource: each
 * entry is an ongoing storyline (digital transformation, an
 * acquisition saga, a turnaround) with a coverage count, a rough
 * "last updated" label, and the price move since the story began.
 *
 * Consumed by `<EmitenStories>`. When a real endpoint lands, swap the
 * `getEmitenStories()` accessor for a fetch/hook and keep the widget.
 */

/** Lifecycle stage of a story. Drives the colored status pill. */
export type EmitenStoryStatus = "berlangsung" | "berkembang";

export interface EmitenStory {
  id: string;
  /** Ticker code (e.g. `"BBCA"`). */
  kode: string;
  /** Story headline. */
  title: string;
  /** One-line editorial summary. */
  summary: string;
  /** Lifecycle stage — `berlangsung` (ongoing) or `berkembang` (developing). */
  status: EmitenStoryStatus;
  /** Number of articles covering this story. */
  liputanCount: number;
  /** Human "last updated" label (e.g. `"3 hari lalu"`). */
  updatedLabel: string;
  /** Signed price move since the story began, in percent. */
  changePercent: number;
  /** Topic tag — shown on the featured card footer. */
  topic?: string;
  /** Timeline meta for the featured card: how many milestone dots to
   *  render and the label of the next milestone. */
  timeline?: { steps: number; milestone: string };
}

/**
 * Curated storylines, most prominent first. The first entry renders as
 * the large featured card; the rest render as compact list rows.
 */
export const emitenStories: EmitenStory[] = [
  {
    id: "story-bbca-transformasi-digital",
    kode: "BBCA",
    title: "Transformasi Digital BBCA",
    summary:
      "Peluncuran mobile banking baru + akuisisi 3 fintech. Target 5 juta user aktif digital di 2026.",
    status: "berlangsung",
    liputanCount: 12,
    updatedLabel: "3 hari lalu",
    changePercent: 5.2,
    topic: "Perbankan",
    timeline: { steps: 3, milestone: "Rilis mobile banking" },
  },
  {
    id: "story-mdka-akuisisi-tambang",
    kode: "MDKA",
    title: "Saga Akuisisi Tambang Emas",
    summary:
      "Target takeover senilai US$ 2,1 M. Negosiasi masih alot, deadline K3 mundur ke K4 2026.",
    status: "berkembang",
    liputanCount: 18,
    updatedLabel: "1 hari lalu",
    changePercent: 12.8,
  },
  {
    id: "story-goto-profitability",
    kode: "GOTO",
    title: "Perjalanan Menuju Profitability",
    summary:
      "PHK 12% karyawan + refocus ke 3 core. Target EBIT positif K4 2026, setelah rugi 6 tahun berturut.",
    status: "berlangsung",
    liputanCount: 24,
    updatedLabel: "2 hari lalu",
    changePercent: -8.5,
  },
  {
    id: "story-tlkm-5g-fiberisasi",
    kode: "TLKM",
    title: "Rollout 5G & Fiberisasi",
    summary:
      "Capex US$ 1,8 B untuk 5G + fiberisasi 5 juta homepass. Target coverage 50% kota tier-1 akhir 2026.",
    status: "berlangsung",
    liputanCount: 9,
    updatedLabel: "5 hari lalu",
    changePercent: 3.4,
  },
  {
    id: "story-bmri-kredit-umkm",
    kode: "BMRI",
    title: "Ekspansi Kredit UMKM Digital",
    summary:
      "Penyaluran KUR digital Rp150 T. Fokus segmen mikro dan pembiayaan rantai pasok.",
    status: "berlangsung",
    liputanCount: 15,
    updatedLabel: "1 hari lalu",
    changePercent: 2.1,
  },
  {
    id: "story-asii-energi-hijau",
    kode: "ASII",
    title: "Diversifikasi ke Energi Hijau",
    summary:
      "Investasi pabrik baterai EV + panel surya. Target kontribusi 10% laba grup di 2027.",
    status: "berkembang",
    liputanCount: 11,
    updatedLabel: "3 hari lalu",
    changePercent: -1.2,
  },
  {
    id: "story-inco-hilirisasi-nikel",
    kode: "INCO",
    title: "Hilirisasi Nikel Sulawesi",
    summary:
      "Groundbreaking smelter HPAL. Pasokan bahan baku baterai global dimulai 2027.",
    status: "berkembang",
    liputanCount: 13,
    updatedLabel: "4 hari lalu",
    changePercent: -4.8,
  },
  {
    id: "story-unvr-turnaround",
    kode: "UNVR",
    title: "Turnaround Volume Penjualan",
    summary:
      "Reformulasi produk + penyesuaian harga. Target pulihkan pangsa pasar sepanjang 2026.",
    status: "berlangsung",
    liputanCount: 7,
    updatedLabel: "6 hari lalu",
    changePercent: 1.5,
  },
];

/** Accessor mirroring the other mock modules — swap for a fetch later. */
export function getEmitenStories(): EmitenStory[] {
  return emitenStories;
}
