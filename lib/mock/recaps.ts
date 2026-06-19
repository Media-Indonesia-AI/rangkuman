export type Sentimen = "positif" | "netral" | "negatif";

export interface Sumber {
  media: string;
  logo: string;
  jumlah: number;
}

export interface DailyRecap {
  id: string;
  /** ISO date (YYYY-MM-DD) this recap belongs to. */
  tanggal: string;
  /** Stock ticker this recap covers. */
  sahamKode: string;
  /** 2-3 sentence aggregate summary. */
  ringkasan: string;
  /** Aggregate sentiment across all underlying articles. */
  sentimen: Sentimen;
  /** Total article count. */
  jumlahBerita: number;
  /** Breakdown by source. */
  sumber: Sumber[];
}

/**
 * The site pretends "today" is 2026-06-07. We keep that pinned so that
 * previews and tests stay deterministic across rebuilds regardless of
 * wall-clock time on the build machine.
 */
export const TODAY_ISO = "2026-06-07";
export const YESTERDAY_ISO = "2026-06-06";
/** Two days back, for the date picker's "older" data sets. */
export const DAY_BEFORE_ISO = "2026-06-05";
/** Window of historical dates available in mock data (oldest → newest). */
export const AVAILABLE_DATE_ISOS = [DAY_BEFORE_ISO, YESTERDAY_ISO, TODAY_ISO] as const;

export const recaps: DailyRecap[] = [
  // ─── TODAY (2026-06-07) ─────────────────────────────────────────
  {
    id: "r-bbca-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "BBCA",
    ringkasan:
      "BBCA bukukan laba bersih Rp 12,5 triliun di K1 2026, tumbuh 11% YoY didorong kenaikan kredit korporasi dan fee-based income. Manajemen umumkan dividen interim Rp 200/saham dengan payout ratio 45%. Analis independen reaffirm target price Rp 10.500 dengan rekomendasi buy.",
    sentimen: "positif",
    jumlahBerita: 7,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 2 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Investing.com", logo: "📈", jumlah: 1 },
      { media: "Bareksa", logo: "💼", jumlah: 1 },
    ],
  },
  {
    id: "r-tlkm-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "TLKM",
    ringkasan:
      "Telkom Indonesia (TLKM) menutup sesi dengan kenaikan 2,8% setelah Indihome mencatat ARPU tertinggi dalam 3 tahun. Pelaku pasar menantikan pengumuman aksi korporasi data center yang dijadwalkan akhir bulan. Sentimen positif dari laporan Mei: fixed broadband tumbuh 4,1% YoY.",
    sentimen: "positif",
    jumlahBerita: 5,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Reuters", logo: "🌐", jumlah: 1 },
      { media: "IPOT", logo: "💼", jumlah: 1 },
    ],
  },
  {
    id: "r-antm-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "ANTM",
    ringkasan:
      "Saham ANTM tertekan 5,2% setelah harga nikel global anjlok 4% di sesi Asia. Investor khawatir oversupply bijih nikel dari Indonesia pasca moratorium RKAB. Volume perdagangan melonjak 2,3x rata-rata harian, indikasi distribusi besar dari institusi.",
    sentimen: "negatif",
    jumlahBerita: 6,
    sumber: [
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Reuters", logo: "🌐", jumlah: 1 },
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Investing.com", logo: "📈", jumlah: 1 },
    ],
  },
  {
    id: "r-goto-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "GOTO",
    ringkasan:
      "GOTO rilis laporan K1 2026: kontribusi layanan finansial (GoPay, Mitra) naik 38% YoY, menutupi pelemahan merchant. Manajemen维持 guidance EBITDA positif di akhir FY26. Saham ditutup flat di Rp 78 dengan volume moderat.",
    sentimen: "netral",
    jumlahBerita: 4,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Stockbit", logo: "💬", jumlah: 1 },
    ],
  },
  {
    id: "r-asii-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "ASII",
    ringkasan:
      "Astra International (ASII) turun 1,4% setelah data wholesales mobil nasional Mei turun 6% YoY. Kinerja divisi jasa keuangan masih solid dengan kredit tumbuh 12%. Analis sepakat penurunan siklikal ini temporer, target price rata-rata dipertahankan di Rp 6.200.",
    sentimen: "netral",
    jumlahBerita: 4,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "IPOT", logo: "💼", jumlah: 1 },
    ],
  },
  {
    id: "r-unvr-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "UNVR",
    ringkasan:
      "UNVR rebound 2,1% setelah laporan Channel News Asia menyebut parent company akan lakukan share buyback di level regional. Pelaku pasar lokal membaca ini sebagai sinyal支撑 fundamental jangka pendek. Volume tipis, dominasi retail.",
    sentimen: "positif",
    jumlahBerita: 3,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Reuters", logo: "🌐", jumlah: 1 },
    ],
  },
  {
    id: "r-mdka-2026-06-07",
    tanggal: TODAY_ISO,
    sahamKode: "MDKA",
    ringkasan:
      "MDKA ditutup mixed: produksi emas TFK sesuai ekspektasi, namun harga tembaga LME turun 1,8% di sesi sore menahan kenaikan. Manajemen reaffirm capex 2026 di USD 380 juta untuk ekspansi Wetar dan Toho. Saham berakhir +0,4%.",
    sentimen: "netral",
    jumlahBerita: 3,
    sumber: [
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
    ],
  },

  // ─── YESTERDAY (2026-06-06) ─────────────────────────────────────
  {
    id: "r-bbca-2026-06-06",
    tanggal: YESTERDAY_ISO,
    sahamKode: "BBCA",
    ringkasan:
      "BBCA ditutup flat di Rp 9.875 jelang rilis kinerja akhir bulan. Sektor perbankan dinilai menarik pasca keputusan BI tahan suku bunga di level 6%. Asing tercatat net buy Rp 215 miliar secara mingguan.",
    sentimen: "netral",
    jumlahBerita: 4,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Bareksa", logo: "💼", jumlah: 1 },
    ],
  },
  {
    id: "r-tlkm-2026-06-06",
    tanggal: YESTERDAY_ISO,
    sahamKode: "TLKM",
    ringkasan:
      "TLKM naik 1,9% di tengah rumor negosiasi kemitraan hyperscaler Asia untuk data center baru di Cikarang. Analis JP Morgan维持 rating overweight dengan target price Rp 4.200. Risiko utama: belanja modal lebih tinggi dari guidance.",
    sentimen: "positif",
    jumlahBerita: 3,
    sumber: [
      { media: "Reuters", logo: "🌐", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
    ],
  },
  {
    id: "r-icbp-2026-06-06",
    tanggal: YESTERDAY_ISO,
    sahamKode: "ICBP",
    ringkasan:
      "ICBP turun 1,8% setelah broker note dari Macquarie turunkan target price ke Rp 11.800 dari Rp 12.500, menyoroti margin tertekan harga gandum. Saham konsumer lain (INDF, UNVR) ikut tertekan di sesi yang sama.",
    sentimen: "negatif",
    jumlahBerita: 3,
    sumber: [
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
    ],
  },
  {
    id: "r-bbri-2026-06-06",
    tanggal: YESTERDAY_ISO,
    sahamKode: "BBRI",
    ringkasan:
      "BBRI rilis K1 2026 dengan NIM 7,8% (di atas konsensus). Kredit UMKM tumbuh 14% YoY, menjadi penopang utama. Manajemen维持 target NPL ratio di bawah 3%. Saham ditutup +1,4%.",
    sentimen: "positif",
    jumlahBerita: 3,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
    ],
  },
  {
    id: "r-bmri-2026-06-06",
    tanggal: YESTERDAY_ISO,
    sahamKode: "BMRI",
    ringkasan:
      "BMRI umumkan RUPSLB untuk restrukturisasi anak usaha. Pasar merespons positif, saham ditutup +0,9%. Dividen yield diproyeksikan tetap menarik di 5,2% annualized.",
    sentimen: "positif",
    jumlahBerita: 2,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
    ],
  },

  // ─── 2 DAYS AGO (2026-06-05) ───────────────────────────────────
  {
    id: "r-ihsg-window-2026-06-05",
    tanggal: DAY_BEFORE_ISO,
    sahamKode: "IHSG",
    ringkasan:
      "IHSG ditutup rebound 0,6% ke 7.198 setelah dua sesi terkoreksi. Penguatan ditopang sektor konsumer (+1,2%) dan perbankan (+0,8%). Asing catat net buy Rp 180 miliar setelah 4 hari net sell berturut-turut. Volume transaksi tipis 8,2T, indikasi wait-and-see jelang data inflasi akhir pekan.",
    sentimen: "positif",
    jumlahBerita: 5,
    sumber: [
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Bareksa", logo: "💼", jumlah: 1 },
    ],
  },
  {
    id: "r-inko-2026-06-05",
    tanggal: DAY_BEFORE_ISO,
    sahamKode: "INCO",
    ringkasan:
      "INCO anjlok 4,8% setelah analis UBS downgrade rating dari neutral ke sell, menyoroti oversupply nikel global. Target price dipangkas dari Rp 4.200 ke Rp 3.500. Volume perdagangan melonjak 1,8x rata-rata 20 hari.",
    sentimen: "negatif",
    jumlahBerita: 4,
    sumber: [
      { media: "Bloomberg", logo: "🌐", jumlah: 1 },
      { media: "Reuters", logo: "🌐", jumlah: 1 },
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
      { media: "Kontan", logo: "📊", jumlah: 1 },
    ],
  },
  {
    id: "r-fren-2026-06-05",
    tanggal: DAY_BEFORE_ISO,
    sahamKode: "FREN",
    ringkasan:
      "Saham FREN rally signifikan +11,4% ditopang rumor akuisisi oleh operator regional. Manajemen belum memberikan komentar resmi. Saham small-cap dengan likuiditas tipis, pergerakan harga rentan dimanipulasi. Analyst saran hold.",
    sentimen: "positif",
    jumlahBerita: 3,
    sumber: [
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "Stockbit", logo: "💬", jumlah: 1 },
    ],
  },
  {
    id: "r-hmsp-2026-06-05",
    tanggal: DAY_BEFORE_ISO,
    sahamKode: "HMSP",
    ringkasan:
      "HMSP turun 0,9% seiring tekanan terhadap sektor rokok. Wacana kenaikan cukai di RUU Kesehatan tahun depan membuat pelaku pasar pesimistis. Dividen yield masih menarik di 7,1% annualized — jadi penahan downside.",
    sentimen: "negatif",
    jumlahBerita: 2,
    sumber: [
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
      { media: "CNBC Indonesia", logo: "📺", jumlah: 1 },
    ],
  },
  {
    id: "r-bris-2026-06-05",
    tanggal: DAY_BEFORE_ISO,
    sahamKode: "BRIS",
    ringkasan:
      "BRIS stabil di Rp 2.480 pasca right issue yang oversubscribed 2,3x. Likuiditas saham membaik signifikan setelah masuknya investor institusi baru. Prospek Bank Syariah Indonesia sebagai bank syariah terbesar di Asia Tenggara tetap positif.",
    sentimen: "positif",
    jumlahBerita: 2,
    sumber: [
      { media: "Kontan", logo: "📊", jumlah: 1 },
      { media: "Bisnis.com", logo: "📰", jumlah: 1 },
    ],
  },
];

/** All recaps that fall on a given ISO date. */
export function getRecapsByDate(isoDate: string): DailyRecap[] {
  return recaps
    .filter((r) => r.tanggal === isoDate)
    .sort((a, b) => b.jumlahBerita - a.jumlahBerita);
}

/** All recaps in the last N days (inclusive of today), grouped by date, sorted desc. */
export function getRecapsByRecentDays(days: number): Record<string, DailyRecap[]> {
  const today = new Date(TODAY_ISO);
  const out: Record<string, DailyRecap[]> = {};
  for (let i = 0; i < days; i++) {
    const iso = formatDateOnly(subtractDays(today, i));
    out[iso] = getRecapsByDate(iso);
  }
  return out;
}

/** Lookup recap for one stock on a specific date. */
export function getRecapForStock(kode: string, isoDate: string): DailyRecap | undefined {
  return recaps.find((r) => r.sahamKode === kode.toUpperCase() && r.tanggal === isoDate);
}

/** All recaps mentioning the given ticker across all available dates. */
export function getRecapsForStock(kode: string): DailyRecap[] {
  return recaps
    .filter((r) => r.sahamKode === kode.toUpperCase())
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

// ── tiny inline helpers (avoid bringing date-fns into a mock-data file) ──
function subtractDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - days);
  return copy;
}
function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
