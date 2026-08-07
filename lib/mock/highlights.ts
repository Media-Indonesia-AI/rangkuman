/**
 * Highlight / Sorotan data for the new Rangkuman homepage.
 * Each story is a curated, multi-source summary across business, economy,
 * stocks, policy, global, and commodities categories.
 *
 * Stories are EVENT-DRIVEN, not category-driven. One event (e.g. "BI Rate turun")
 * affects multiple categories at once — that's why `affectedCategories` is
 * a list, not a single value. The `category` field is the PRIMARY category
 * used for color/positioning.
 */

import { KeywordItem } from "../api/types/story";

export type Category = "saham" | "bisnis" | "ekonomi" | "kebijakan" | "global" | "komoditas" | "crypto";

/** Single event in a story's timeline. */
export interface StoryEvent {
  /** Short title of the event, e.g. "BI umumkan rate turun 25 bps" */
  title: string;
  /** Detail/description, optional. */
  detail?: string;
  /** Time of the event, e.g. "14:30" */
  time: string;
  /** Source for this specific event, e.g. "Bloomberg" */
  source?: string;
  /** Optional icon hint for this event (used to color the timeline dot) */
  category?: Category;
}

/** A single key data point shown in the "Data Kunci" callout on the story page. */
export interface KeyDataPoint {
  /** Big number/value, e.g. "6,25%" or "US$ 1,2 M" or "51%". */
  value: string;
  /** Short label, e.g. "Rate baru" or "Valuasi". */
  label: string;
  /** Optional sublabel for context, e.g. "Level terendah Apr 2022". */
  sublabel?: string;
  /** Visual trend indicator. */
  trend?: "up" | "down" | "neutral";
}

export interface Highlight {
  id: string;
  /** Short, factual headline. No clickbait. */
  title: string;
  /** 1-2 sentence summary (the "intinya"). */
  summary: string;
  /** Primary category — used for color/positioning. */
  category: Category;
  /**
   * All categories affected by this event. Includes the primary `category`.
   * E.g. BI Rate story affects [ekonomi, saham, bisnis, kebijakan].
   */
  affectedCategories: Category[];
  /** Source media names, e.g. ["Bloomberg", "CNBC Indonesia"] */
  sources: string[];
  /** Total unique sources covering this story. */
  sourceCount: number;
  /** Estimated read time, e.g. "2 mnt". */
  readTime: string;
  /** Relative time, e.g. "1 jam lalu". */
  timeAgo: string;
  /** Short tags, e.g. ["Fed", "Suku Bunga"]. */
  tags: string[];
  /** Optional country flag emoji (for /global/ stories) — e.g. "🇺🇸". */
  flag?: string;
  /** Optional: which stock tickers are most affected (for cross-linking). */
  tickers?: string[];
  /** Importance rank 1-5 (1 = most important). Used to sort Sorotan. */
  rank: number;
  /** Chronological timeline of events in this story. */
  events: StoryEvent[];
  /** 2-4 key data points shown as a callout block on the story page. */
  keyData?: KeyDataPoint[];
  keywords?: KeywordItem[];
}

/** Today's curated highlights. */
export const TODAY_HIGHLIGHTS: Highlight[] = [
  {
    id: "hl-bi-rate-pivot-2026-06",
    title: "BI pangkas suku bunga ke 6,25% — akhir dari siklus tightening?",
    summary:
      "Bank Indonesia pangkas suku bunga acuan 25 bps ke 6,25% — level terendah sejak 2022. Gubernur: “kondisi makro sudah sesuai”, sinyal dovish untuk RDG berikutnya.",
    category: "ekonomi",
    affectedCategories: ["ekonomi", "saham", "bisnis", "kebijakan"],
    sources: ["Bloomberg", "Reuters", "Kontan", "Bisnis.com", "CNBC Indonesia"],
    sourceCount: 8,
    readTime: "2 mnt",
    timeAgo: "1 jam lalu",
    tags: ["BI Rate", "Suku Bunga", "Dovish", "RDG"],
    tickers: ["BBCA", "BBRI", "BMRI"],
    rank: 1,
    flag: "🇮🇩",
    events: [
      { time: "13:30", title: "RDG BI dimulai", detail: "Sesi rapat dewan gubernur bulanan di kantor pusat BI.", source: "Bisnis.com", category: "kebijakan" },
      { time: "14:00", title: "BI umumkan rate turun 25 bps", detail: "Dari 6,50% ke 6,25% — level terendah sejak April 2022.", source: "Bloomberg", category: "ekonomi" },
      { time: "14:10", title: "Pernyataan Gubernur Warjiyo", detail: "“Kondisi makro sudah sesuai. Kami jaga momentum pemulihan ekonomi.”", source: "Kontan", category: "kebijakan" },
      { time: "14:30", title: "Pasar respon positif", detail: "IHSG rebound 0,87% ke 7.245. Rupiah terapresiasi 0,4% ke Rp 16.320. Yield SUN 10Y turun 8 bps.", source: "Reuters", category: "saham" },
      { time: "14:45", title: "Sektor perbankan memimpin kenaikan", detail: "BBCA +2,2%, BBRI +1,4%, BMRI +0,9%. Asing catat net buy Rp 312M.", source: "CNBC Indonesia", category: "saham" },
      { time: "15:00", title: "Analis Mandiri Sekuritas: 'sinyal dovish'", detail: "“Ini signalling yang sangat dovish. Kami perkirakan BI tahan di 6,25% hingga akhir 2026.”", source: "Kontan", category: "bisnis" },
      { time: "15:30", title: "Bloomberg: 'BI dovish pivot'", detail: "Dovish pivot paling jelas di Asia Tenggara tahun ini. Pasar koreksi ekspektasi rate hike.", source: "Bloomberg", category: "global" },
    ],
    keyData: [
      { value: "6,25%", label: "Rate baru", sublabel: "Level terendah Apr 2022", trend: "down" },
      { value: "-25 bps", label: "Pemangkasan", sublabel: "dari 6,50%", trend: "down" },
      { value: "14:00 WIB", label: "Diumumkan", sublabel: "RDG BI Juni", trend: "neutral" },
      { value: "1,2 T", label: "Inflow asing", sublabel: "BBCA, BBRI, BMRI", trend: "up" },
    ],
  },
  {
    id: "hl-bca-q1-earnings",
    title: "BBCA bukukan laba bersih Rp 12,5 triliun di K1 2026, tumbuh 11% YoY",
    summary:
      "Bank Central Asia (BBCA) menutup K1 2026 dengan laba bersih Rp 12,5T, ditopang kenaikan kredit korporasi dan fee-based income. Manajemen umumkan dividen interim Rp 200/saham.",
    category: "saham",
    affectedCategories: ["saham", "bisnis", "ekonomi"],
    sources: ["CNBC Indonesia", "Bisnis.com", "Kontan", "Bloomberg"],
    sourceCount: 6,
    readTime: "2 mnt",
    timeAgo: "2 jam lalu",
    tags: ["BBCA", "Dividen", "Perbankan", "Earnings"],
    tickers: ["BBCA"],
    rank: 2,
    events: [
      { time: "08:00", title: "BBCA umumkan laporan keuangan K1 2026", detail: "Laba bersih Rp 12,5T (+11% YoY), NIM stabil di 5,2%.", source: "CNBC Indonesia", category: "saham" },
      { time: "08:30", title: "Kredit korporasi tumbuh 13% YoY", detail: "Kredit korporasi BBCA tumbuh paling kencang di antara bank besar.", source: "Bisnis.com", category: "bisnis" },
      { time: "09:00", title: "Dividen interim Rp 200/saham", detail: "Yield dividen 2,0%. Cum date 20 Juni 2026, payment 10 Juli 2026.", source: "Kontan", category: "saham" },
      { time: "09:30", title: "Analis: 'tetap BUY'", detail: "Mandiri Sekuritas pertahankan BUY dengan target price Rp 11.200 (+13%).", source: "Bloomberg", category: "ekonomi" },
      { time: "10:00", title: "Saham BBCA naik 2,2%", detail: "Menjadi top gainer di LQ45 hari ini. Volume traded 23,4jt lot.", source: "Kontan", category: "saham" },
    ],
    keyData: [
      { value: "Rp 12,5 T", label: "Laba bersih K1", sublabel: "+11% YoY", trend: "up" },
      { value: "Rp 200", label: "Dividen / saham", sublabel: "Yield 2,0%", trend: "up" },
      { value: "+2,2%", label: "Harga saham", sublabel: "Top gainer LQ45", trend: "up" },
    ],
  },
  {
    id: "hl-gojek-tokopedia-rumor",
    title: "Rumor akuisisi Tokopedia oleh konsorsium Singapura bikin GOTO rebound 5%",
    summary:
      "Saham GOTO rebound 5% setelah rumor akuisisi Tokopedia oleh konsorsium Singapura senilai US$ 1,2 miliar. Manajemen GOTO belum komentar, BEI minta klarifikasi atas pergerakan harga.",
    category: "bisnis",
    affectedCategories: ["bisnis", "saham", "global"],
    sources: ["Bloomberg", "Reuters", "CNBC Indonesia", "Bisnis.com"],
    sourceCount: 5,
    readTime: "2 mnt",
    timeAgo: "3 jam lalu",
    tags: ["GOTO", "Tokopedia", "Akuisisi", "M&A"],
    tickers: ["GOTO"],
    rank: 3,
    events: [
      { time: "10:15", title: "Reuters beberitakan rumor akuisisi", detail: "Konsorsium investor Singapura dirumorkan akan mengakuisisi 51% saham Tokopedia.", source: "Reuters", category: "global" },
      { time: "10:30", title: "Bloomberg konfirmasi 'advanced talks'", detail: "Sumber Bloomberg bilang negosiasi sudah tahap akhir, valuasi US$ 1,2 miliar.", source: "Bloomberg", category: "bisnis" },
      { time: "10:45", title: "GOTO rebound 5% intraday", detail: "Saham sempat disentuh level Rp 82 (+5%). Volume traded 1,2 miliar lot.", source: "CNBC Indonesia", category: "saham" },
      { time: "11:00", title: "Manajemen GOTO: 'no comment'", detail: "Saat dikonfirmasi, GOTO Corp menolak komentar, menyebut “tidak ada disclosure” saat ini.", source: "Bisnis.com", category: "bisnis" },
      { time: "11:15", title: "BEI minta klarifikasi", detail: "Bursa Efek Indonesia minta GOTO klarifikasi atas pergerakan harga signifikan.", source: "Kontan", category: "kebijakan" },
    ],
    keyData: [
      { value: "US$ 1,2 M", label: "Valuasi", sublabel: "Dilaporkan", trend: "neutral" },
      { value: "51%", label: "Saham diakuisisi", sublabel: "Tokopedia", trend: "neutral" },
      { value: "+5%", label: "GOTO intraday", sublabel: "rebound", trend: "up" },
    ],
  },
  {
    id: "hl-ojk-pinjol",
    title: "OJK perketat izin pinjol — 30-40% pemain diprediksi keluar",
    summary:
      "Otoritas Jasa Keuangan (OJK) rilis POJK terbaru yang memperketat syarat modal minimum pinjol dari Rp 25 miliar ke Rp 100 miliar. Asosiasi prediksi 30-40% pemain akan merger atau tutup dalam 18 bulan ke depan.",
    category: "kebijakan",
    affectedCategories: ["kebijakan", "bisnis", "ekonomi"],
    sources: ["Kontan", "Bisnis.com", "CNBC Indonesia", "Reuters", "Bloomberg"],
    sourceCount: 8,
    readTime: "3 mnt",
    timeAgo: "4 jam lalu",
    tags: ["OJK", "Pinjol", "POJK", "Regulasi Fintech"],
    rank: 4,
    events: [
      { time: "09:00", title: "OJK rilis POJK No. 12/2026", detail: "Syarat modal minimum naik dari Rp 25 miliar ke Rp 100 miliar. Berlaku per 1 Januari 2027.", source: "Kontan", category: "kebijakan" },
      { time: "09:30", title: "Asosiasi Fintech kumpul darurat", detail: "Asosiasi Fintech Indonesia gelar rapat darurat dengan 78 anggota.", source: "Bisnis.com", category: "bisnis" },
      { time: "10:00", title: "OJK: 'tidak ada lagi toleransi'", detail: "Ketua OJK: “Kami tidak akan memberikan toleransi untuk pemain yang tidak patuh.”", source: "CNBC Indonesia", category: "kebijakan" },
      { time: "10:30", title: "Analis: 30-40% pemain keluar", detail: "Citi Research prediksi 30-40% pinjol akan merger atau tutup dalam 18 bulan.", source: "Bloomberg", category: "ekonomi" },
      { time: "11:00", title: "Konsolidasi industri dimulai", detail: "Dua pinjol lokal kabarnya sedang dalam negosiasi merger eksklusif.", source: "Reuters", category: "bisnis" },
    ],
    keyData: [
      { value: "Rp 100 M", label: "Modal minimum", sublabel: "naik dari Rp 25 M", trend: "neutral" },
      { value: "1 Jan 2027", label: "Berlaku", sublabel: "Grace period 6 bulan", trend: "neutral" },
      { value: "30-40%", label: "Prediksi keluar", sublabel: "dari 78 anggota asosiasi", trend: "down" },
    ],
  },
  {
    id: "hl-nickel-glut",
    title: "Harga nikel global anjlok 4% — tekanan ke ANTM, INCO",
    summary:
      "Harga nikel di LME turun 4% ke US$16.200/ton setelah laporan peningkatan stok dan ekspektasi surplus produksi dari Indonesia & Filipina. Saham ANTM, INCO tertekan 3-5%.",
    category: "komoditas",
    affectedCategories: ["komoditas", "saham", "global"],
    sources: ["Bloomberg", "Reuters", "Kontan", "CNBC Indonesia"],
    sourceCount: 6,
    readTime: "2 mnt",
    timeAgo: "5 jam lalu",
    tags: ["Nikel", "ANTM", "INCO", "LME"],
    tickers: ["ANTM", "INCO"],
    rank: 5,
    events: [
      { time: "07:00", title: "LME buka: nikel turun 4%", detail: "Harga nikel 3-month futures turun ke US$16.200/ton, level terendah 6 bulan.", source: "Bloomberg", category: "komoditas" },
      { time: "08:00", title: "Berita: stok gudang LME naik 8%", detail: "Stok nikel di gudang LME naik ke 142.000 ton, tertinggi sejak November 2025.", source: "Reuters", category: "global" },
      { time: "08:30", title: "Indonesia: ekspor nikel naik 12% MoM", detail: "Ekspor nikel Indonesia Mei 2026 naik 12% MoM jadi 78.000 ton.", source: "Kontan", category: "komoditas" },
      { time: "09:00", title: "ANTM turun 5,2%, INCO turun 4,8%", detail: "Saham-saham tambang nikel kompak tertekan. Sektor turun 1,8% di IHSG.", source: "CNBC Indonesia", category: "saham" },
      { time: "09:30", title: "Analis UBS downgrade INCO", detail: "Target price dipangkas dari Rp 4.200 ke Rp 3.500, rating diturunkan ke SELL.", source: "Bloomberg", category: "bisnis" },
    ],
    keyData: [
      { value: "US$ 16.200", label: "Harga nikel", sublabel: "turun 4% (-6 bulan)", trend: "down" },
      { value: "142K ton", label: "Stok LME", sublabel: "+8% (Nov 2025)", trend: "down" },
      { value: "-5,2%", label: "Saham ANTM", sublabel: "tambang kompak jatuh", trend: "down" },
    ],
  },
  {
    id: "hl-ihsg-7ribu",
    title: "IHSG break 7.200 pertama kali, foreign inflow Rp 2,1T minggu ini",
    summary:
      "IHSG tembus level 7.200 untuk pertama kali sepanjang 2026, didorong foreign net buy Rp 2,1T minggu ini. Sektor finansial dan konsumer memimpin kenaikan.",
    category: "ekonomi",
    affectedCategories: ["ekonomi", "saham", "global"],
    sources: ["Kontan", "Bloomberg", "Reuters", "CNBC Indonesia"],
    sourceCount: 6,
    readTime: "2 mnt",
    timeAgo: "1 hari lalu",
    tags: ["IHSG", "Rekor", "Foreign Flow", "All-time high"],
    tickers: ["BBCA", "BMRI"],
    rank: 6,
    events: [
      { time: "11:00", title: "IHSG tembus 7.200", detail: "Level tertinggi sepanjang 2026, didorong inflow asing.", source: "Bloomberg", category: "saham" },
      { time: "13:00", title: "Foreign net buy Rp 2,1T", detail: "Minggu ini: BBCA, BMRI, ASII top pick. Asing net buy 5 hari berturut.", source: "Reuters", category: "saham" },
    ],
    keyData: [
      { value: "7.245", label: "IHSG level", sublabel: "all-time high", trend: "up" },
      { value: "Rp 2,1 T", label: "Foreign inflow", sublabel: "minggu ini", trend: "up" },
      { value: "5 hari", label: "Net buy streak", sublabel: "asing berturut", trend: "up" },
    ],
  },
  {
    id: "hl-indofood-bond",
    title: "Indofood terbitkan obligasi Rp 5T, yield 6,8% — oversubscribed 2,3x",
    summary:
      "Indofood Sukses Makmur (INDF) terbitkan obligasi Rp 5 triliun dengan kupon 6,8% tenor 5 tahun. Oversubscribed 2,3x. Ekspansi distribusi FMCG jadi alasan utama.",
    category: "bisnis",
    affectedCategories: ["bisnis", "saham", "ekonomi"],
    sources: ["Kontan", "Bisnis.com", "Bloomberg"],
    sourceCount: 4,
    readTime: "2 mnt",
    timeAgo: "2 hari lalu",
    tags: ["Indofood", "Obligasi", "INDF", "FMCG"],
    tickers: ["INDF"],
    rank: 7,
    events: [
      { time: "10:00", title: "INDF terbitkan obligasi Rp 5T", detail: "Kupon 6,8% tenor 5 tahun, oversubscribed 2,3x.", source: "Kontan", category: "bisnis" },
      { time: "11:00", title: "Dana untuk ekspansi FMCG", detail: "Ekspansi distribusi & ekspansi ke pasar Afrika.", source: "Bisnis.com", category: "bisnis" },
    ],
    keyData: [
      { value: "Rp 5 T", label: "Obligasi", sublabel: "diterbitkan", trend: "up" },
      { value: "6,8%", label: "Kupon", sublabel: "tenor 5 tahun", trend: "neutral" },
      { value: "2,3x", label: "Oversubscribed", sublabel: "demand tinggi", trend: "up" },
    ],
  },
  {
    id: "hl-mnc-rcti",
    title: "MNC Vision raih akuisisi 60% saham RCTI, target integrated media play",
    summary:
      "MNC Vision (IPTV) umumkan akuisisi 60% saham RCTI seharga Rp 4,8T. Strategi: integrated media — FTA + streaming + konten. Konsolidasi industri media diprediksi berlanjut.",
    category: "bisnis",
    affectedCategories: ["bisnis", "saham"],
    sources: ["Bloomberg", "Bisnis.com", "Kontan"],
    sourceCount: 4,
    readTime: "2 mnt",
    timeAgo: "1 hari lalu",
    tags: ["MNC", "RCTI", "Akuisisi", "Media"],
    tickers: ["MNC"],
    rank: 8,
    events: [
      { time: "09:00", title: "MNC umumkan akuisisi 60% RCTI", detail: "Nilai transaksi Rp 4,8T, integrated media play.", source: "Bisnis.com", category: "bisnis" },
      { time: "10:00", title: "Analis: konsolidasi industri", detail: "Mandiri Sekuritas: industri media sedang konsolidasi.", source: "Kontan", category: "bisnis" },
    ],
    keyData: [
      { value: "Rp 4,8 T", label: "Nilai akuisisi", sublabel: "60% saham RCTI", trend: "neutral" },
      { value: "60%", label: "Saham diakuisisi", sublabel: "RCTI", trend: "neutral" },
      { value: "1", label: "Integrated media", sublabel: "FTA + streaming", trend: "up" },
    ],
  },
  {
    id: "hl-bpjs-kelas1",
    title: "BPJS Kesehatan naikkan iuran kelas 1 ke Rp 175K mulai Juli 2026",
    summary:
      "BPJS Kesehatan umumkan kenaikan iuran kelas 1 dari Rp 150.000 ke Rp 175.000/bulan mulai 1 Juli 2026. Kelas 2 & 3 tetap. Defisit BPJS disebut sebagai alasan utama.",
    category: "kebijakan",
    affectedCategories: ["kebijakan", "ekonomi"],
    sources: ["Kontan", "Bisnis.com", "CNBC Indonesia"],
    sourceCount: 5,
    readTime: "2 mnt",
    timeAgo: "3 hari lalu",
    tags: ["BPJS", "Iuran", "Kesehatan", "Kelas 1"],
    rank: 9,
    events: [
      { time: "11:00", title: "BPJS naikkan iuran kelas 1", detail: "Dari Rp 150.000 ke Rp 175.000/bulan, mulai 1 Juli 2026.", source: "Kontan", category: "kebijakan" },
      { time: "12:00", title: "Kelas 2 & 3 tetap", detail: "Tidak ada perubahan untuk kelas 2 (Rp 100K) dan kelas 3 (Rp 42K).", source: "Bisnis.com", category: "ekonomi" },
    ],
    keyData: [
      { value: "Rp 175 K", label: "Iuran kelas 1", sublabel: "naik dari Rp 150 K", trend: "up" },
      { value: "1 Jul 2026", label: "Berlaku", sublabel: "kenaikan iuran", trend: "neutral" },
      { value: "0%", label: "Kelas 2 & 3", sublabel: "tidak naik", trend: "neutral" },
    ],
  },
  {
    id: "hl-fed-pause",
    title: "Fed tahan suku bunga 5,25%, Powell sinyal pause sampai Q4 2026",
    summary:
      "The Fed mempertahankan suku bunga acuan di 5,25% setelah FOMC Mei. Powell sebut ekonomi solid tapi inflasi jasa masih tinggi — pasar respon positif, S&P 500 naik 0,4%.",
    category: "ekonomi",
    affectedCategories: ["ekonomi", "global"],
    sources: ["Bloomberg", "Reuters", "CNBC", "WSJ"],
    sourceCount: 12,
    readTime: "3 mnt",
    timeAgo: "1 jam lalu",
    tags: ["Fed", "FOMC", "Powell", "DXY 103,8"],
    rank: 10,
    events: [
      { time: "01:00 WIB", title: "FOMC rilis keputusan rate", detail: "Suku bunga dipertahankan di 5,25%. Vote 9-2.", source: "Bloomberg", category: "global" },
      { time: "01:30 WIB", title: "Powell press conference", detail: "“Ekonomi solid, inflasi jasa masih tinggi. Kami akan patient.”", source: "WSJ", category: "global" },
      { time: "02:00 WIB", title: "S&P 500 naik 0,4%", detail: "Wall Street respon positif. Yield UST 10Y turun ke 4,32%.", source: "CNBC", category: "ekonomi" },
    ],
    keyData: [
      { value: "5,25%", label: "Fed rate", sublabel: "ditahankan", trend: "neutral" },
      { value: "9-2", label: "Vote", sublabel: "FOMC members", trend: "neutral" },
      { value: "Q4 2026", label: "Next pivot", sublabel: "Powell guidance", trend: "down" },
    ],
  },
  {
    id: "hl-binar-academy",
    title: "Binar Academy raih pendanaan Seri B Rp 250M, lead EV + ACV",
    summary:
      "Binar Academy, platform edutech Indonesia, tutup pendanaan Seri B Rp 250 miliar yang dipimpin oleh East Ventures dan AC Ventures. Ekspansi ke 10 kota tier 2.",
    category: "bisnis",
    affectedCategories: ["bisnis"],
    sources: ["Tech in Asia", "CNBC Indonesia", "DailySocial"],
    sourceCount: 4,
    readTime: "2 mnt",
    timeAgo: "5 jam lalu",
    tags: ["Startup", "Edutech", "Funding", "Binar Academy"],
    rank: 11,
    events: [
      { time: "10:00", title: "Binar Academy umumkan Seri B", detail: "Pendanaan Rp 250 miliar dipimpin EV & ACV.", source: "Tech in Asia", category: "bisnis" },
      { time: "11:00", title: "Ekspansi ke 10 kota baru", detail: "Ekspansi ke 10 kota tier 2 Indonesia.", source: "CNBC Indonesia", category: "bisnis" },
    ],
    keyData: [
      { value: "Rp 250 M", label: "Seri B", sublabel: "raised", trend: "up" },
      { value: "10 kota", label: "Ekspansi", sublabel: "tier 2", trend: "up" },
      { value: "2 VC", label: "Lead", sublabel: "EV + ACV", trend: "neutral" },
    ],
  },
];

/** Extended stories per category (for the /bisnis, /ekonomi, /kebijakan landing pages). */
export const STORIES_BY_CATEGORY: Record<Category, Highlight[]> = {
  crypto: [
    {
      id: "cr-btc-2026-06-07",
      title: "Bitcoin break US$71.000 setelah data US CPI lebih rendah",
      summary:
        "Bitcoin break US$71.000 setelah data US CPI Mei lebih rendah dari ekspektasi (2,9% YoY vs 3,1% est). Spot BTC ETF catat net inflow US$425 juta kemarin, terbesar dalam 4 minggu. MicroStrategy umumkan tambahan akuisisi 5.200 BTC.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["CoinDesk", "The Block", "Bloomberg", "Reuters", "Decrypt", "Cointelegraph"],
      sourceCount: 12,
      readTime: "2 mnt",
      timeAgo: "1 jam lalu",
      tags: ["Bitcoin", "BTC", "CPI", "ETF", "MicroStrategy"],
      rank: 1,
      flag: "🟠",
      events: [
        { time: "20:30 WIB", title: "Data US CPI rilis", detail: "CPI YoY 2,9% (est 3,1%). Dovish surprise.", source: "Bloomberg", category: "global" },
        { time: "21:00 WIB", title: "BTC tembus US$71.000", detail: "Break resistance. Volume spike 2x rata-rata 7 hari.", source: "CoinDesk", category: "global" },
        { time: "22:00 WIB", title: "Spot BTC ETF inflow US$425M", detail: "Net inflow terbesar dalam 4 minggu. IBIT & FBTC memimpin.", source: "The Block", category: "global" },
        { time: "23:00 WIB", title: "MicroStrategy tambah 5.200 BTC", detail: "Beli di harga rata-rata US$70.500. Total holdings 215.000 BTC.", source: "Reuters", category: "bisnis" },
      ],
      keyData: [
        { value: "US$71K", label: "Harga BTC", sublabel: "break resistance", trend: "up" },
        { value: "US$425M", label: "ETF inflow", sublabel: "terbesar 4 mgu", trend: "up" },
        { value: "5.200", label: "BTC dibeli MSTR", sublabel: "@ US$70.500 avg", trend: "up" },
      ],
    },
    {
      id: "cr-eth-2026-06-07",
      title: "Ethereum tembus US$3.800 didorong upgrade Pectra & spekulasi staking ETF",
      summary:
        "Ethereum tembus US$3.800, didorong upgrade Pectra yang sukses di mainnet dan spekulasi approval staking ETH ETF spot oleh SEC. Open interest futures ETH naik 18% dalam 24 jam.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["The Block", "CoinDesk", "Decrypt", "Bloomberg", "Cointelegraph"],
      sourceCount: 9,
      readTime: "2 mnt",
      timeAgo: "2 jam lalu",
      tags: ["Ethereum", "ETH", "Pectra", "ETF Staking"],
      rank: 2,
      flag: "🔷",
      events: [
        { time: "10:00 WIB", title: "Pectra aktif di mainnet", detail: "Upgrade sukses. Account abstraction & validator efficiency improve.", source: "The Block", category: "global" },
        { time: "11:00 WIB", title: "ETH ke US$3.800", detail: "Break 6 bulan high. Volume +180% vs avg 7 hari.", source: "Decrypt", category: "global" },
        { time: "12:00 WIB", title: "Open interest futures +18%", detail: "Spekulasi staking ETH ETF spot. Filing baru dari BlackRock.", source: "CoinDesk", category: "bisnis" },
      ],
      keyData: [
        { value: "US$3.800", label: "Harga ETH", sublabel: "6 bulan high", trend: "up" },
        { value: "+18%", label: "Open interest", sublabel: "futures 24 jam", trend: "up" },
        { value: "1", label: "Upgrade", sublabel: "Pectra sukses", trend: "up" },
      ],
    },
    {
      id: "cr-sol-2026-06-07",
      title: "Solana rally 5% setelah Firedancer mainnet beta, DEX volume salip ETH",
      summary:
        "Solana rally 5% ke US$178, leading L1. Firedancer mainnet beta diumumkan — validator client baru yang promise 1M TPS. Total DEX volume SOL链 tembus US$8 miliar minggu ini, salip Ethereum L1.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["Decrypt", "The Block", "Cointelegraph", "CoinDesk", "Bloomberg"],
      sourceCount: 7,
      readTime: "2 mnt",
      timeAgo: "3 jam lalu",
      tags: ["Solana", "SOL", "Firedancer", "DEX"],
      rank: 3,
      flag: "🟣",
      events: [
        { time: "14:00 WIB", title: "Firedancer mainnet beta", detail: "Jump Crypto rilis client v2. Promise 1M TPS. 5 validator pilot.", source: "Decrypt", category: "global" },
        { time: "15:00 WIB", title: "SOL +5% ke US$178", detail: "Top gainer L1. Volume DEX +35% intraday.", source: "The Block", category: "global" },
        { time: "16:00 WIB", title: "DEX volume SOL > ETH L1", detail: "Minggu ini US$8,2B vs US$7,8B. Pertama kali salip.", source: "Cointelegraph", category: "global" },
      ],
      keyData: [
        { value: "US$178", label: "Harga SOL", sublabel: "+5% hari ini", trend: "up" },
        { value: "1M TPS", label: "Firedancer", sublabel: "promise beta", trend: "up" },
        { value: "US$8,2B", label: "DEX volume", sublabel: "salip ETH L1", trend: "up" },
      ],
    },
    {
      id: "cr-doge-2026-06-07",
      title: "Dogecoin turun 2,8% setelah tweet Elon Musk, whale wallet pindahkan 1,2 miliar DOGE",
      summary:
        "Dogecoin turun 2,8% ke US$0,16 setelah Elon Musk mention DOGE di tweet tentang 'Department of Government Efficiency'. Whale wallet 1,2 miliar DOGE dipindahkan ke exchange — sinyal jual. Komunitas hold.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["Decrypt", "CoinDesk", "Cointelegraph", "Bloomberg"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "4 jam lalu",
      tags: ["Doge", "DOGE", "Musk", "Whale"],
      rank: 4,
      flag: "🐕",
      events: [
        { time: "08:00 WIB", title: "Tweet Musk soal DOGE", detail: "“DOGE to the moon... eventually.” Tweet picu volatilitas.", source: "Cointelegraph", category: "global" },
        { time: "09:00 WIB", title: "Whale pindahkan 1,2B DOGE", detail: "Dari cold wallet ke Binance. Nilai US$192 juta.", source: "Decrypt", category: "global" },
        { time: "10:00 WIB", title: "DOGE turun ke US$0,16", detail: "Open interest -8%. Liquidasi long US$24 juta.", source: "CoinDesk", category: "global" },
      ],
      keyData: [
        { value: "US$0,16", label: "Harga DOGE", sublabel: "-2,8% hari ini", trend: "down" },
        { value: "1,2B", label: "DOGE dipindah", sublabel: "ke Binance", trend: "down" },
        { value: "US$24M", label: "Long liquidasi", sublabel: "24 jam", trend: "down" },
      ],
    },
    {
      id: "cr-link-2026-06-07",
      title: "Chainlink naik 3,5% setelah partnership dengan Swift untuk oracle infrastructure",
      summary:
        "Chainlink naik 3,5% setelah partnership dengan Swift untuk oracle infrastructure. CCIP (Cross-Chain Interoperability Protocol) sekarang handle 100+ institution. Reserve LINK naik US$50 juta.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["The Block", "Decrypt", "CoinDesk"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["Chainlink", "LINK", "Swift", "CCIP", "Oracle"],
      rank: 5,
      flag: "🔗",
      events: [
        { time: "11:00 WIB", title: "Announcement partnership Swift", detail: "Chainlink CCIP jadi oracle layer untuk pesan cross-border Swift gpi.", source: "The Block", category: "global" },
        { time: "12:00 WIB", title: "100+ institutions on CCIP", detail: "Bank sentral, custodian, exchange. Visa & Mastercard onboard.", source: "Decrypt", category: "bisnis" },
        { time: "13:00 WIB", title: "Reserve LINK +US$50M", detail: "DAO alokasi tambahan. Staking yield naik 0,5%.", source: "CoinDesk", category: "global" },
      ],
      keyData: [
        { value: "US$18,4", label: "Harga LINK", sublabel: "+3,5% hari ini", trend: "up" },
        { value: "100+", label: "Institutions", sublabel: "on CCIP", trend: "up" },
        { value: "US$50M", label: "Reserve", sublabel: "LINK ditambah", trend: "up" },
      ],
    },
    {
      id: "cr-fet-2026-06-07",
      title: "Fetch.ai pump 6,8% jadi top gainer L1 AI, narrative AI agent makin panas",
      summary:
        "Fetch.ai pump 6,8% jadi top gainer L1 AI. Narrative AI agent makin panas — a16z rilis State of Crypto report highlight AI agent sebagai use case 2026. FET juga integrasi dengan Ocean Protocol.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["Decrypt", "The Block", "Cointelegraph", "CoinDesk"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["FET", "Fetch.ai", "AI Agent", "Ocean Protocol"],
      rank: 6,
      flag: "🤖",
      events: [
        { time: "10:00 WIB", title: "a16z State of Crypto 2026", detail: "Report: “AI agent = use case 2026”. FET, RNDR, TAO highlighted.", source: "The Block", category: "global" },
        { time: "11:00 WIB", title: "FET +US$1,42 (+6,8%)", detail: "Top gainer L1. Volume +220% intraday.", source: "Decrypt", category: "global" },
        { time: "12:00 WIB", title: "Integrasi Ocean Protocol", detail: "FET-Ocean data marketplace. Combined AI compute network.", source: "Cointelegraph", category: "global" },
      ],
      keyData: [
        { value: "US$1,42", label: "Harga FET", sublabel: "+6,8% hari ini", trend: "up" },
        { value: "Top 1", label: "Gainer L1", sublabel: "hari ini", trend: "up" },
        { value: "1", label: "AI agent", sublabel: "use case 2026", trend: "up" },
      ],
    },
  ],
  saham: [
    {
      id: "saham-bca-q1",
      title: "BBCA bukukan laba bersih Rp 12,5 triliun di K1 2026, tumbuh 11% YoY",
      summary:
        "Bank Central Asia (BBCA) menutup K1 2026 dengan laba bersih Rp 12,5T, ditopang kenaikan kredit korporasi dan fee-based income. Manajemen umumkan dividen interim Rp 200/saham.",
      category: "saham",
      affectedCategories: ["saham", "bisnis", "ekonomi"],
      sources: ["CNBC Indonesia", "Bisnis.com", "Kontan", "Bloomberg"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "2 jam lalu",
      tags: ["BBCA", "Dividen", "Perbankan", "Earnings"],
      tickers: ["BBCA"],
      rank: 1,
      events: [
        { time: "08:00", title: "BBCA umumkan laporan keuangan K1 2026", detail: "Laba bersih Rp 12,5T (+11% YoY), NIM stabil di 5,2%.", source: "CNBC Indonesia", category: "saham" },
        { time: "08:30", title: "Kredit korporasi tumbuh 13% YoY", detail: "Kredit korporasi BBCA tumbuh paling kencang di antara bank besar.", source: "Bisnis.com", category: "bisnis" },
        { time: "09:00", title: "Dividen interim Rp 200/saham", detail: "Yield dividen 2,0%. Cum date 20 Juni 2026, payment 10 Juli 2026.", source: "Kontan", category: "saham" },
      ],
    },
    {
      id: "saham-tlkm-arpu",
      title: "TLKM rebound 2,8% didorong kenaikan ARPU IndiHome tertinggi 3 tahun",
      summary:
        "Telkom Indonesia (TLKM) ditutup naik 2,8% ke Rp 3.420 setelah laporan ARPU IndiHome tembus Rp 320.000 — level tertinggi 3 tahun terakhir. Analis: ‘pertumbuhan ARPU IndiHome jadi katalis utama’.",
      category: "saham",
      affectedCategories: ["saham", "bisnis"],
      sources: ["CNBC Indonesia", "Bisnis.com", "Kontan", "Bloomberg"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "3 jam lalu",
      tags: ["TLKM", "IndiHome", "ARPU", "Telekomunikasi"],
      tickers: ["TLKM"],
      rank: 2,
      events: [
        { time: "10:00", title: "TLKM rilis data IndiHome", detail: "ARPU IndiHome tembus Rp 320.000 (+8% YoY), tertinggi 3 tahun.", source: "CNBC Indonesia", category: "bisnis" },
        { time: "10:30", title: "Saham TLKM naik 2,8%", detail: "Ditutup di Rp 3.420. Volume traded 12,4 juta lot.", source: "Kontan", category: "saham" },
      ],
    },
    {
      id: "saham-anta-hold",
      title: "ANTA tahan di Rp 2.475, analis MDKA sebut akumulasi lagi mulai terbentuk",
      summary:
        "Saham ANTA (ANTM) stabil di Rp 2.475 setelah 3 hari tekanan. Analis MDKA: akumulasi bandar mulai terlihat di bandarmology chart, target resistance Rp 2.600.",
      category: "saham",
      affectedCategories: ["saham", "komoditas"],
      sources: ["Kontan", "CNBC Indonesia", "Bisnis.com"],
      sourceCount: 3,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["ANTA", "ANTM", "Bandarmology", "Tambang"],
      tickers: ["ANTM"],
      rank: 3,
      events: [
        { time: "13:00", title: "ANTM stabil di Rp 2.475", detail: "Setelah 3 hari tekanan, ANTA mulai konsolidasi di level support.", source: "Kontan", category: "saham" },
        { time: "13:30", title: "Analis: akumulasi mulai terbentuk", detail: "MDKA: bandarmology chart tunjukkan akumulasi bandar.", source: "CNBC Indonesia", category: "bisnis" },
      ],
    },
    {
      id: "saham-unvr-buy",
      title: "UNVR rekomendasi BUY dari 3 analis, target price Rp 3.100",
      summary:
        "Saham Unilever Indonesia (UNVR) dapat rekomendasi BUY dari 3 analis besar (Mandiri Sekuritas, UBS, Macquarie) dengan rata-rata target price Rp 3.100 (+8% dari harga sekarang).",
      category: "saham",
      affectedCategories: ["saham", "bisnis"],
      sources: ["Kontan", "Bloomberg", "CNBC Indonesia"],
      sourceCount: 3,
      readTime: "1 mnt",
      timeAgo: "6 jam lalu",
      tags: ["UNVR", "Rekomendasi", "Consumer Goods"],
      tickers: ["UNVR"],
      rank: 4,
      events: [
        { time: "11:00", title: "Mandiri Sekuritas: BUY", detail: "Target price Rp 3.100, +8% upside.", source: "Kontan", category: "bisnis" },
        { time: "11:15", title: "UBS & Macquarie join", detail: "Dua analis besar global juga rekomendasi BUY dengan target price sama.", source: "Bloomberg", category: "global" },
      ],
    },
  ],
  bisnis: [
    {
      id: "bisnis-gojek-tokopedia",
      title: "Rumor akuisisi Tokopedia oleh konsorsium Singapura bikin GOTO rebound 5%",
      summary:
        "Saham GOTO rebound 5% setelah rumor akuisisi Tokopedia oleh konsorsium Singapura. Manajemen GOTO belum komentar, BEI minta klarifikasi atas pergerakan harga.",
      category: "bisnis",
      affectedCategories: ["bisnis", "saham", "global"],
      sources: ["Bloomberg", "Reuters", "CNBC Indonesia", "Bisnis.com"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "3 jam lalu",
      tags: ["GOTO", "Tokopedia", "Akuisisi", "M&A"],
      tickers: ["GOTO"],
      rank: 1,
      events: [
        { time: "10:15", title: "Reuters beberitakan rumor", detail: "Konsorsium Singapura akan akuisisi 51% Tokopedia.", source: "Reuters", category: "global" },
        { time: "10:30", title: "Bloomberg: advanced talks", detail: "Negosiasi tahap akhir, valuasi US$ 1,2 miliar.", source: "Bloomberg", category: "bisnis" },
        { time: "10:45", title: "GOTO rebound 5%", detail: "Sentuh Rp 82 intraday, volume 1,2M lot.", source: "CNBC Indonesia", category: "saham" },
      ],
      keyData: [
        { value: "US$ 1,2 M", label: "Valuasi", sublabel: "dilaporkan", trend: "neutral" },
        { value: "51%", label: "Saham diakuisisi", sublabel: "Tokopedia", trend: "neutral" },
        { value: "+5%", label: "GOTO intraday", sublabel: "rebound", trend: "up" },
      ],
    },
    {
      id: "bisnis-startup-funding",
      title: "Startup edutech Binar Academy raih pendanaan Seri B Rp 250 miliar",
      summary:
        "Binar Academy, platform edutech Indonesia, tutup pendanaan Seri B Rp 250 miliar yang dipimpin oleh East Ventures dan AC Ventures. Valuasi company tidak diungkap.",
      category: "bisnis",
      affectedCategories: ["bisnis"],
      sources: ["Tech in Asia", "CNBC Indonesia", "DailySocial"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["Startup", "Edutech", "Funding", "Binar Academy"],
      rank: 2,
      events: [
        { time: "10:00", title: "Binar Academy umumkan funding Seri B", detail: "Pendanaan Rp 250 miliar dipimpin East Ventures & AC Ventures.", source: "Tech in Asia", category: "bisnis" },
        { time: "11:00", title: "Ekspansi ke 10 kota baru", detail: "Dana segar akan digunakan untuk ekspansi ke 10 kota tier 2 Indonesia.", source: "CNBC Indonesia", category: "bisnis" },
      ],
      keyData: [
        { value: "Rp 250 M", label: "Seri B", sublabel: "raised", trend: "up" },
        { value: "10 kota", label: "Ekspansi", sublabel: "tier 2 Indonesia", trend: "up" },
        { value: "2 VC", label: "Lead investor", sublabel: "EV + ACV", trend: "neutral" },
      ],
    },
    {
      id: "bisnis-umkm-export",
      title: "UMKM Indonesia catat ekspor Rp 450 miliar ke Eropa lewat marketplace B2B",
      summary:
        "Kementerian UMKM laporkan 12.000 UMKM Indonesia catat ekspor kumulatif Rp 450 miliar ke Uni Eropa sepanjang 2026 lewat platform B2B. F&B dan fashion jadi kontributor utama.",
      category: "bisnis",
      affectedCategories: ["bisnis", "ekonomi", "global"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "7 jam lalu",
      tags: ["UMKM", "Ekspor", "Eropa", "B2B"],
      rank: 3,
      events: [
        { time: "08:00", title: "Kementerian UMKM rilis data ekspor", detail: "12.000 UMKM ekspor Rp 450 miliar ke Uni Eropa.", source: "Kontan", category: "ekonomi" },
        { time: "09:00", title: "F&B dan fashion kontributor utama", detail: "Kontribusi F&B 45%, fashion 30%, kerajinan 25%.", source: "Bisnis.com", category: "bisnis" },
      ],
      keyData: [
        { value: "Rp 450 M", label: "Ekspor 2026", sublabel: "ke Uni Eropa", trend: "up" },
        { value: "12.000", label: "UMKM", sublabel: "aktif ekspor", trend: "up" },
        { value: "45%", label: "F&B kontribusi", sublabel: "fashion 30%", trend: "neutral" },
      ],
    },
    {
      id: "bisnis-mnc-akuisisi",
      title: "MNC Vision raih akuisisi 60% saham RCTI, target integrated media play",
      summary:
        "MNC Vision (IPTV) umumkan akuisisi 60% saham RCTI seharga Rp 4,8T. Strategi: integrated media — FTA + streaming + konten. Konsolidasi industri media diprediksi berlanjut.",
      category: "bisnis",
      affectedCategories: ["bisnis", "saham"],
      sources: ["Bloomberg", "Bisnis.com", "Kontan"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["MNC", "RCTI", "Akuisisi", "Media"],
      tickers: ["MNC"],
      rank: 4,
      events: [
        { time: "09:00", title: "MNC umumkan akuisisi 60% RCTI", detail: "Nilai transaksi Rp 4,8T, integrated media play.", source: "Bisnis.com", category: "bisnis" },
        { time: "10:00", title: "Analis: konsolidasi industri", detail: "Mandiri Sekuritas: “Industri media sedang konsolidasi, MNC ambil posisi dominan.”", source: "Kontan", category: "bisnis" },
      ],
      keyData: [
        { value: "Rp 4,8 T", label: "Nilai akuisisi", sublabel: "60% saham RCTI", trend: "neutral" },
        { value: "60%", label: "Saham diakuisisi", sublabel: "RCTI", trend: "neutral" },
        { value: "1", label: "Integrated media", sublabel: "FTA + streaming", trend: "up" },
      ],
    },
    {
      id: "bisnis-unicorn-ipo",
      title: "Startup agritech Beleaf keluar unicorn setelah pendanaan Seri C US$80 juta",
      summary:
        "Beleaf, startup agritech Indonesia, keluar status unicorn (valuasi >US$1 miliar) setelah tutup pendanaan Seri C US$80 juta. Lead investor: Sequoia Capital India.",
      category: "bisnis",
      affectedCategories: ["bisnis", "ekonomi"],
      sources: ["Tech in Asia", "Bloomberg", "DailySocial"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["Startup", "Agritech", "Unicorn", "Beleaf"],
      rank: 5,
      events: [
        { time: "11:00", title: "Beleaf tutup Seri C US$80 juta", detail: "Pendanaan dipimpin Sequoia Capital India, valuasi >US$1 miliar.", source: "Tech in Asia", category: "bisnis" },
        { time: "12:00", title: "Status unicorn confirmed", detail: "Beleaf jadi unicorn agritech ke-3 Indonesia.", source: "Bloomberg", category: "bisnis" },
      ],
      keyData: [
        { value: "US$ 80 M", label: "Seri C raised", sublabel: "Sequoia lead", trend: "up" },
        { value: ">US$ 1 B", label: "Valuasi", sublabel: "unicorn status", trend: "up" },
        { value: "3rd", label: "Agritech unicorn", sublabel: "di Indonesia", trend: "neutral" },
      ],
    },
    {
      id: "bisnis-phk-tech",
      title: "Tech company lokal PHK 8% karyawan, restrukturisasi fokus ke AI product",
      summary:
        "Salah satu tech company lokal (nama belum diungkap) PHK 8% karyawan atau sekitar 200 orang. Manajemen: restrukturisasi untuk fokus ke produk AI dan efisiensi biaya.",
      category: "bisnis",
      affectedCategories: ["bisnis"],
      sources: ["Tech in Asia", "DailySocial", "CNBC Indonesia"],
      sourceCount: 3,
      readTime: "2 mnt",
      timeAgo: "2 hari lalu",
      tags: ["PHK", "Tech", "Restrukturisasi", "AI"],
      rank: 6,
      events: [
        { time: "14:00", title: "Tech company PHK 8% karyawan", detail: "~200 orang kena dampak. Restrukturisasi fokus AI.", source: "Tech in Asia", category: "bisnis" },
        { time: "15:00", title: "Manajemen: efisiensi biaya", detail: "“Fokus ke produk AI. Beberapa divisi akan di-reorganize.”", source: "CNBC Indonesia", category: "bisnis" },
      ],
      keyData: [
        { value: "8%", label: "Karyawan PHK", sublabel: "~200 orang", trend: "down" },
        { value: "1", label: "Alasan", sublabel: "restrukturisasi AI", trend: "neutral" },
        { value: "30 hari", label: "Severance pay", sublabel: "rata-rata industri", trend: "neutral" },
      ],
    },
    {
      id: "bisnis-corporate-bond",
      title: "Indofood terbitkan obligasi Rp 5T, yield 6,8% tenor 5 tahun",
      summary:
        "Indofood Sukses Makmur (INDF) terbitkan obligasi Rp 5 triliun dengan kupon 6,8% tenor 5 tahun. Oversubscribed 2,3x. Ekspansi distribusi FMCG jadi alasan utama.",
      category: "bisnis",
      affectedCategories: ["bisnis", "saham", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "Bloomberg"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "2 hari lalu",
      tags: ["Indofood", "Obligasi", "INDF", "FMCG"],
      tickers: ["INDF"],
      rank: 7,
      events: [
        { time: "10:00", title: "INDF terbitkan obligasi Rp 5T", detail: "Kupon 6,8% tenor 5 tahun, oversubscribed 2,3x.", source: "Kontan", category: "bisnis" },
        { time: "11:00", title: "Dana untuk ekspansi FMCG", detail: "Ekspansi distribusi & ekspansi ke pasar Afrika.", source: "Bisnis.com", category: "bisnis" },
      ],
      keyData: [
        { value: "Rp 5 T", label: "Obligasi", sublabel: "diterbitkan", trend: "up" },
        { value: "6,8%", label: "Kupon", sublabel: "tenor 5 tahun", trend: "neutral" },
        { value: "2,3x", label: "Oversubscribed", sublabel: "demand tinggi", trend: "up" },
      ],
    },
  ],
  ekonomi: [
    {
      id: "ekonomi-fed-pause",
      title: "Fed tahan suku bunga 5,25%, Powell sinyal pause sampai Q4",
      summary:
        "The Fed mempertahankan suku bunga acuan di 5,25%. Powell sebut ekonomi solid tapi inflasi jasa masih tinggi — pasar respon positif, S&P 500 naik 0,4%.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "global"],
      sources: ["Bloomberg", "Reuters", "CNBC Indonesia", "Kontan"],
      sourceCount: 7,
      readTime: "2 mnt",
      timeAgo: "1 jam lalu",
      tags: ["Fed", "Suku Bunga", "DXY 103,8", "Yield UST 4,32%"],
      rank: 1,
      events: [
        { time: "01:00 WIB", title: "FOMC rilis keputusan rate", detail: "Suku bunga dipertahankan di 5,25%. Vote 9-2.", source: "Bloomberg", category: "global" },
        { time: "01:30 WIB", title: "Powell press conference", detail: "“Ekonomi solid, inflasi jasa masih tinggi. Kami akan patient.”", source: "Reuters", category: "global" },
        { time: "02:00 WIB", title: "S&P 500 naik 0,4%", detail: "Wall Street respon positif. Yield UST 10Y turun ke 4,32%.", source: "CNBC Indonesia", category: "ekonomi" },
      ],
      keyData: [
        { value: "5,25%", label: "Fed rate", sublabel: "ditahankan", trend: "neutral" },
        { value: "9-2", label: "Vote", sublabel: "FOMC members", trend: "neutral" },
        { value: "Q4 2026", label: "Next pivot", sublabel: "Powell guidance", trend: "down" },
      ],
    },
    {
      id: "ekonomi-inflasi",
      title: "BI prediksi inflasi Juni 2,8% YoY, masih dalam target 2,5±1%",
      summary:
        "Bank Indonesia (BI) prediksi inflasi Juni 2026 di level 2,8% year-on-year, masih dalam target 2,5±1%. Beras dan bawang merah jadi kontributor utama deflasi.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "kebijakan"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia", "Bloomberg"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "4 jam lalu",
      tags: ["Inflasi", "BI", "IHK", "Beras"],
      rank: 2,
      events: [
        { time: "10:00", title: "BI prediksi inflasi Juni 2,8%", detail: "Inflasi YoY 2,8%, masih di dalam target 2,5±1%.", source: "Kontan", category: "ekonomi" },
        { time: "10:30", title: "Beras & bawang merah deflasi", detail: "Beras -1,2% MoM, bawang merah -3,4% MoM.", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "2,8%", label: "Inflasi Juni", sublabel: "YoY estimate", trend: "down" },
        { value: "2,5±1%", label: "Target BI", sublabel: "in range", trend: "neutral" },
        { value: "-1,2%", label: "Beras MoM", sublabel: "deflasi", trend: "down" },
      ],
    },
    {
      id: "ekonomi-apbn",
      title: "Sri Mulyani: defisit APBN K1 2026 hanya 0,4% PDB, di bawah target",
      summary:
        "Menteri Keuangan Sri Mulyani laporkan defisit APBN K1 2026 hanya 0,4% PDB, lebih rendah dari target 2,2% di Perpres 54/2025. Penerimaan pajak tumbuh 7,3% YoY.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "kebijakan"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia", "Bloomberg"],
      sourceCount: 5,
      readTime: "3 mnt",
      timeAgo: "6 jam lalu",
      tags: ["APBN", "Defisit", "Pajak", "Sri Mulyani"],
      rank: 3,
      events: [
        { time: "14:00", title: "Sri Mulyani laporkan defisit K1 2026", detail: "Defisit 0,4% PDB, di bawah target 2,2%.", source: "Kontan", category: "kebijakan" },
        { time: "14:30", title: "Penerimaan pajak tumbuh 7,3% YoY", detail: "PPh Badan tumbuh 8,1%, PPN tumbuh 6,5%.", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "0,4%", label: "Defisit PDB", sublabel: "K1 2026", trend: "down" },
        { value: "7,3%", label: "Pajak tumbuh", sublabel: "YoY", trend: "up" },
        { value: "2,2%", label: "Target Perpres", sublabel: "54/2025", trend: "neutral" },
      ],
    },
    {
      id: "ekonomi-ihsg-7ribu",
      title: "IHSG break 7.200 pertama kali, foreign inflow Rp 2,1T minggu ini",
      summary:
        "IHSG tembus level 7.200 untuk pertama kali sepanjang 2026, didorong foreign net buy Rp 2,1T minggu ini. Sektor finansial dan konsumer memimpin kenaikan.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "saham", "global"],
      sources: ["Kontan", "Bloomberg", "Reuters", "CNBC Indonesia"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["IHSG", "Rekor", "Foreign Flow", "All-time high"],
      tickers: ["BBCA", "BMRI"],
      rank: 4,
      events: [
        { time: "11:00", title: "IHSG tembus 7.200", detail: "Level tertinggi sepanjang 2026, didorong inflow asing.", source: "Bloomberg", category: "saham" },
        { time: "13:00", title: "Foreign net buy Rp 2,1T", detail: "Minggu ini: BBCA, BMRI, ASII top pick. Asing net buy 5 hari berturut.", source: "Reuters", category: "saham" },
      ],
      keyData: [
        { value: "7.245", label: "IHSG level", sublabel: "all-time high", trend: "up" },
        { value: "Rp 2,1 T", label: "Foreign inflow", sublabel: "minggu ini", trend: "up" },
        { value: "5 hari", label: "Net buy streak", sublabel: "asing berturut", trend: "up" },
      ],
    },
    {
      id: "ekonomi-rupiah-ritel",
      title: "Rupiah rebound ke 16.280 setelah intervensi BI, terbaik 3 bulan",
      summary:
        "Rupiah rebound ke 16.280/US$ setelah BI intervensi di pasar spot. Level terkuat 3 bulan. Analis: tekanan DXY dan surplus neraca dagang April support.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "global"],
      sources: ["Bloomberg", "Reuters", "Kontan"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["Rupiah", "BI", "Intervensi", "Neraca Dagang"],
      rank: 5,
      events: [
        { time: "10:00", title: "Rupiah rebound ke 16.280", detail: "Setelah BI intervensi spot, level terkuat 3 bulan.", source: "Bloomberg", category: "ekonomi" },
        { time: "11:00", title: "BI: 'pertahankan stabilitas'", detail: "“Kami akan terus intervensi untuk jaga stabilitas.”", source: "Kontan", category: "kebijakan" },
      ],
      keyData: [
        { value: "16.280", label: "Rupiah", sublabel: "vs US$", trend: "up" },
        { value: "3 bulan", label: "Tercatat", sublabel: "level terkuat", trend: "up" },
        { value: "+1,2%", label: "YTD appreciation", sublabel: "vs akhir 2025", trend: "up" },
      ],
    },
    {
      id: "ekonomi-cadangan-devisa",
      title: "Cadangan devisa Mei US$138,5 miliar, tertinggi 6 bulan",
      summary:
        "BI laporkan posisi cadangan devisa akhir Mei US$138,5 miliar, tertinggi 6 bulan. Setara 6,1 bulan impor dan pembayaran utang luar negeri.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "kebijakan"],
      sources: ["Kontan", "Bloomberg", "Reuters"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "2 hari lalu",
      tags: ["Devisa", "BI", "Impor", "Reservasi"],
      rank: 6,
      events: [
        { time: "13:00", title: "BI rilis data cadangan devisa", detail: "Posisi US$138,5 miliar, tertinggi 6 bulan. Naik US$1,8 miliar MoM.", source: "Kontan", category: "ekonomi" },
        { time: "13:30", title: "BI: perkuat fundamental", detail: "“Cadangan devisa kuat memperkuat fundamental ekonomi.”", source: "Bloomberg", category: "kebijakan" },
      ],
      keyData: [
        { value: "US$ 138,5 B", label: "Cadangan devisa", sublabel: "akhir Mei 2026", trend: "up" },
        { value: "6,1 bulan", label: "Impor cover", sublabel: "standar IMF: 3 bulan", trend: "up" },
        { value: "+US$ 1,8 B", label: "MoM", sublabel: "kenaikan", trend: "up" },
      ],
    },
    {
      id: "ekonomi-trade-surplus",
      title: "Neraca dagang April surplus US$2,8 miliar, tertinggi 8 bulan",
      summary:
        "BPS laporkan neraca dagang April 2026 surplus US$2,8 miliar — tertinggi 8 bulan terakhir. Ekspor non-migas tumbuh 11% YoY, terutama manufaktur dan pertanian.",
      category: "ekonomi",
      affectedCategories: ["ekonomi", "global"],
      sources: ["Kontan", "Bisnis.com", "Reuters"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "3 hari lalu",
      tags: ["Neraca Dagang", "Surplus", "Ekspor", "BPS"],
      rank: 7,
      events: [
        { time: "11:00", title: "BPS rilis neraca dagang April", detail: "Surplus US$2,8 miliar, tertinggi 8 bulan.", source: "Kontan", category: "ekonomi" },
        { time: "12:00", title: "Ekspor non-migas tumbuh 11%", detail: "Manufaktur +12%, pertanian +9%, pertambangan -2%.", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "US$ 2,8 B", label: "Surplus", sublabel: "neraca dagang", trend: "up" },
        { value: "8 bulan", label: "Tertinggi", sublabel: "sejak Sept 2025", trend: "up" },
        { value: "+11%", label: "Ekspor non-migas", sublabel: "YoY", trend: "up" },
      ],
    },
  ],
  kebijakan: [
    {
      id: "kebijakan-ojk-pinjol",
      title: "OJK perketat izin pinjol, pemain kecil diprediksi konsolidasi",
      summary:
        "Otoritas Jasa Keuangan (OJK) rilis POJK terbaru yang memperketat syarat modal minimum pinjol dari Rp 25 miliar ke Rp 100 miliar. Asosiasi prediksi 30-40% pemain akan merger atau tutup.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "bisnis", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia", "Reuters"],
      sourceCount: 8,
      readTime: "3 mnt",
      timeAgo: "4 jam lalu",
      tags: ["OJK", "Pinjol", "POJK", "Regulasi Fintech"],
      rank: 1,
      events: [
        { time: "09:00", title: "OJK rilis POJK No. 12/2026", detail: "Modal minimum naik dari Rp 25 miliar ke Rp 100 miliar.", source: "Kontan", category: "kebijakan" },
        { time: "09:30", title: "Asosiasi kumpul darurat", detail: "78 anggota asosiasi fintech gelar rapat darurat.", source: "Bisnis.com", category: "bisnis" },
        { time: "10:00", title: "OJK: tidak ada toleransi", detail: "Ketua OJK: “Tidak ada toleransi untuk pemain yang tidak patuh.”", source: "CNBC Indonesia", category: "kebijakan" },
      ],
      keyData: [
        { value: "Rp 100 M", label: "Modal minimum", sublabel: "naik dari Rp 25 M", trend: "neutral" },
        { value: "1 Jan 2027", label: "Berlaku", sublabel: "grace period 6 bulan", trend: "neutral" },
        { value: "30-40%", label: "Prediksi keluar", sublabel: "dari 78 anggota", trend: "down" },
      ],
    },
    {
      id: "kebijakan-pajak-kripto",
      title: "Pemerintah rilis PP baru: pajak kripto naik dari 0,1% ke 0,2%",
      summary:
        "Kementerian Keuangan rilis PP 12/2026 yang menyesuaikan tarif PPh atas transaksi kripto dari 0,1% ke 0,2% mulai 1 Agustus 2026. Asosiasi trader kritik kebijakan ini.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "bisnis", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia", "Bloomberg"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "8 jam lalu",
      tags: ["Pajak", "Kripto", "PP 12/2026", "PPh"],
      rank: 2,
      events: [
        { time: "08:00", title: "Kemenkeu rilis PP 12/2026", detail: "Tarif PPh transaksi kripto naik dari 0,1% ke 0,2%.", source: "Kontan", category: "kebijakan" },
        { time: "09:00", title: "Asosiasi trader: 'overregulasi'", detail: "Asosiasi kritik kebijakan ini sebagai overregulasi.", source: "Bisnis.com", category: "bisnis" },
      ],
      keyData: [
        { value: "0,2%", label: "PPh kripto", sublabel: "naik dari 0,1%", trend: "down" },
        { value: "1 Agt 2026", label: "Berlaku", sublabel: "transaksi kripto", trend: "neutral" },
        { value: "2x", label: "Tarif naik", sublabel: "dari aturan lama", trend: "down" },
      ],
    },
    {
      id: "kebijakan-ikn",
      title: "Jokowi ground-break tol IKN Seksi 6A, target rampung 2027",
      summary:
        "Presiden Jokowi lakukan ground-breaking tol IKN Seksi 6A (Sepaku-Balikpapan) senilai Rp 8,9T. Target rampung 2027 jelang HUT RI ke-82 di IKN.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNN Indonesia"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "10 jam lalu",
      tags: ["IKN", "Infrastruktur", "Tol", "Jokowi"],
      rank: 3,
      events: [
        { time: "10:00", title: "Jokowi ground-break tol IKN", detail: "Tol Seksi 6A Sepaku-Balikpapan, senilai Rp 8,9T.", source: "Kontan", category: "kebijakan" },
        { time: "10:30", title: "Target rampung 2027", detail: "Jelang HUT RI ke-82 di IKN. Kontraktor utama Waskita Karya.", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "Rp 8,9 T", label: "Nilai proyek", sublabel: "tol Seksi 6A", trend: "neutral" },
        { value: "2027", label: "Target rampung", sublabel: "jelang HUT RI ke-82", trend: "neutral" },
        { value: "Waskita", label: "Kontraktor utama", sublabel: "WSKT", trend: "up" },
      ],
    },
    {
      id: "kebijakan-bansos-2026",
      title: "Pemerintah gelontorkan bansos Rp 28T K2 2026, fokus ke keluarga rentan",
      summary:
        "Kemensos gelontorkan bansos tahap II Rp 28T untuk 18,8 juta KPM (Keluarga Penerima Manfaat) di K2 2026. Fokus ke keluarga rentan dan rentan miskin.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["Bansos", "Kemsos", "APBN", "KPM"],
      rank: 4,
      events: [
        { time: "10:00", title: "Kemensos gelontorkan bansos K2", detail: "Rp 28T untuk 18,8 juta KPM, fokus keluarga rentan.", source: "Kontan", category: "kebijakan" },
        { time: "11:00", title: "Penyaluran via Pos & Bank Himbara", detail: "Penyaluran lewat PT Pos & bank Himbara, mulai 10 Juni.", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "Rp 28 T", label: "Bansos K2", sublabel: "2026", trend: "up" },
        { value: "18,8 juta", label: "KPM", sublabel: "keluarga penerima", trend: "up" },
        { value: "10 Juni", label: "Mulai salur", sublabel: "Pos & Himbara", trend: "neutral" },
      ],
    },
    {
      id: "kebijakan-ruu-pemilu",
      title: "DPR setujui RUU Pemilu baru: proporsional terbuka, presidential threshold 20%",
      summary:
        "DPR setujui RUU Pemilu baru dalam rapat paripurna. Proporsional terbuka kembali diterapkan, presidential threshold naik dari 25% ke 20%. Akan berlaku mulai Pemilu 2029.",
      category: "kebijakan",
      affectedCategories: ["kebijakan"],
      sources: ["CNN Indonesia", "Kontan", "Detik"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["RUU Pemilu", "Proporsional Terbuka", "Presidential Threshold", "DPR"],
      rank: 5,
      events: [
        { time: "14:00", title: "DPR setujui RUU Pemilu", detail: "Rapat paripurna, 9 fraksi setuju, 2 fraksi menolak.", source: "CNN Indonesia", category: "kebijakan" },
        { time: "15:00", title: "Threshold 20%, proporsional terbuka", detail: "Berlaku mulai Pemilu 2029. Presidential threshold turun.", source: "Kontan", category: "kebijakan" },
      ],
      keyData: [
        { value: "20%", label: "Threshold", sublabel: "turun dari 25%", trend: "down" },
        { value: "9-2", label: "Vote fraksi", sublabel: "setuju vs menolak", trend: "neutral" },
        { value: "2029", label: "Berlaku", sublabel: "Pemilu berikutnya", trend: "neutral" },
      ],
    },
    {
      id: "kebijakan-permendag-impor",
      title: "Mendag terbitkan Permendag 12/2026: longgarkan impor 7 kategori barang",
      summary:
        "Menteri Perdagangan terbitkan Permendag 12/2026 yang melonggarkan impor 7 kategori barang (tekstil, elektronik, dll). Tujuannya: stabilkan harga dan penuhi permintaan K2.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "bisnis", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia"],
      sourceCount: 4,
      readTime: "2 mnt",
      timeAgo: "2 hari lalu",
      tags: ["Permendag", "Impor", "Permendag 12", "Stabilisasi Harga"],
      rank: 6,
      events: [
        { time: "10:00", title: "Mendag terbitkan Permendag 12/2026", detail: "Longgarkan 7 kategori barang: tekstil, elektronik, dll.", source: "Kontan", category: "kebijakan" },
        { time: "11:00", title: "Target stabilkan harga K2", detail: "Mendag: “Stabilkan harga dan penuhi permintaan.”", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "7", label: "Kategori dilonggarkan", sublabel: "tekstil, elektronik, dll", trend: "up" },
        { value: "K2 2026", label: "Target", sublabel: "stabilkan harga", trend: "neutral" },
        { value: "30 hari", label: "Sosialisasi", sublabel: "sebelum berlaku", trend: "neutral" },
      ],
    },
    {
      id: "kebijakan-bpjs-kesehatan",
      title: "BPJS Kesehatan naikkan iuran kelas 1 ke Rp 175.000 mulai Juli 2026",
      summary:
        "BPJS Kesehatan umumkan kenaikan iuran kelas 1 dari Rp 150.000 ke Rp 175.000/bulan mulai 1 Juli 2026. Kelas 2 & 3 tetap. Defisit BPJS disebut sebagai alasan utama.",
      category: "kebijakan",
      affectedCategories: ["kebijakan", "ekonomi"],
      sources: ["Kontan", "Bisnis.com", "CNBC Indonesia"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "3 hari lalu",
      tags: ["BPJS", "Iuran", "Kesehatan", "Kelas 1"],
      rank: 7,
      events: [
        { time: "11:00", title: "BPJS naikkan iuran kelas 1", detail: "Dari Rp 150.000 ke Rp 175.000/bulan, mulai 1 Juli 2026.", source: "Kontan", category: "kebijakan" },
        { time: "12:00", title: "Kelas 2 & 3 tetap", detail: "Tidak ada perubahan untuk kelas 2 (Rp 100K) dan kelas 3 (Rp 42K).", source: "Bisnis.com", category: "ekonomi" },
      ],
      keyData: [
        { value: "Rp 175 K", label: "Iuran kelas 1", sublabel: "naik dari Rp 150 K", trend: "up" },
        { value: "1 Jul 2026", label: "Berlaku", sublabel: "kenaikan iuran", trend: "neutral" },
        { value: "0%", label: "Kelas 2 & 3", sublabel: "tidak naik", trend: "neutral" },
      ],
    },
  ],
  global: [
    {
      id: "global-fed-pause",
      title: "Fed tahan suku bunga 5,25%, Powell sinyal pause sampai Q4",
      flag: "🇺🇸",
      summary:
        "The Fed mempertahankan suku bunga acuan di 5,25%. Powell sebut ekonomi solid tapi inflasi jasa masih tinggi — pasar respon positif, S&P 500 naik 0,4%.",
      category: "global",
      affectedCategories: ["global", "ekonomi"],
      sources: ["Bloomberg", "Reuters", "CNBC Indonesia", "Kontan"],
      sourceCount: 7,
      readTime: "2 mnt",
      timeAgo: "1 jam lalu",
      tags: ["Fed", "Suku Bunga", "DXY 103,8", "Yield UST 4,32%"],
      rank: 1,
      events: [
        { time: "01:00 WIB", title: "FOMC rilis keputusan rate", detail: "Suku bunga dipertahankan di 5,25%. Vote 9-2.", source: "Bloomberg", category: "global" },
        { time: "01:30 WIB", title: "Powell press conference", detail: "“Ekonomi solid, inflasi jasa masih tinggi. Kami akan patient.”", source: "Reuters", category: "global" },
        { time: "02:00 WIB", title: "S&P 500 naik 0,4%", detail: "Wall Street respon positif. Yield UST 10Y turun ke 4,32%.", source: "CNBC Indonesia", category: "ekonomi" },
      ],
      keyData: [
        { value: "5,25%", label: "Fed rate", sublabel: "ditahankan", trend: "neutral" },
        { value: "9-2", label: "Vote", sublabel: "FOMC members", trend: "neutral" },
        { value: "Q4 2026", label: "Next pivot", sublabel: "Powell guidance", trend: "down" },
      ],
    },
    {
      id: "global-tariff-china",
      flag: "🇺🇸🇨🇳",
      title: "Trump ancam tarif 60% buat China, yuan anjlok ke level terendah 2024",
      summary:
        "Donald Trump ancam naikkan tarif barang China dari 25% ke 60% jika terpilih kembali. Pasar global koreksi, yuan anjlok ke 7,45/US$ — level terendah sejak 2024. Eksportir China & importir AS was-was.",
      category: "global",
      affectedCategories: ["global", "bisnis", "ekonomi"],
      sources: ["Bloomberg", "Reuters", "WSJ", "CNBC Indonesia"],
      sourceCount: 9,
      readTime: "3 mnt",
      timeAgo: "3 jam lalu",
      tags: ["Trump", "China", "Tarif", "Yuan 7,45", "Trade War"],
      rank: 2,
      events: [
        { time: "20:00 WIB", title: "Trump statement di rally", detail: "“Kami akan naikkan tarif China ke 60% pada hari pertama.”", source: "Reuters", category: "global" },
        { time: "20:30 WIB", title: "Yuan anjlok ke 7,45", detail: "Offshore yuan ke level terendah 6 bulan. PBoC intervensi tipis.", source: "Bloomberg", category: "global" },
        { time: "21:00 WIB", title: "S&P futures turun 0,8%", detail: "Wall Street futures drop. Nasdaq futures -1,2%.", source: "WSJ", category: "ekonomi" },
      ],
      keyData: [
        { value: "60%", label: "Tarif ancam", sublabel: "naik dari 25%", trend: "down" },
        { value: "7,45", label: "Yuan/US$", sublabel: "level terendah 2024", trend: "down" },
        { value: "-1,2%", label: "Nasdaq fut", sublabel: "respon awal", trend: "down" },
      ],
    },
    {
      id: "global-brent-oil",
      flag: "🇸🇦",
      title: "Harga Brent oil tembus US$92/barel, tertinggi sejak Oktober 2024",
      summary:
        "Minyak Brent naik ke US$92/barel setelah serangan drone Houthi ke fasilitas minyak Saudi Aramco. OPEC+ pertahankan produksi. Inflasi global berpotensi naik.",
      category: "global",
      affectedCategories: ["global", "ekonomi", "komoditas"],
      sources: ["Bloomberg", "Reuters", "WSJ", "CNBC"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["Brent", "Minyak", "Houthi", "Aramco", "OPEC"],
      rank: 3,
      events: [
        { time: "06:00 WIB", title: "Drone Houthi serang Aramco", detail: "Serangan ke fasilitas Abqaiq, produksi turun 800rb barel/hari.", source: "Reuters", category: "global" },
        { time: "08:00 WIB", title: "Brent tembus US$92", detail: "Waktu Asia: US$92,3/barel. Tertinggi sejak Okt 2024.", source: "Bloomberg", category: "komoditas" },
        { time: "10:00 WIB", title: "OPEC+: no change", detail: "Pertemuan Vienna: produksi tetap. Saudi tidak tambah supply.", source: "WSJ", category: "global" },
      ],
      keyData: [
        { value: "US$92", label: "Brent/barel", sublabel: "+3,2% hari ini", trend: "up" },
        { value: "800rb", label: "Produksi off", sublabel: "barel/hari Aramco", trend: "down" },
        { value: "0", label: "OPEC+ tambah", sublabel: "supply", trend: "neutral" },
      ],
    },
    {
      id: "global-china-pmi",
      flag: "🇨🇳",
      title: "China PMI manufacturing rebound ke 51,2, ekportir Asia sumringah",
      summary:
        "Caixin China manufacturing PMI rebound ke 51,2 di Mei 2026 (vs 50,4 April) — pertama kali di atas 50,5 dalam 6 bulan. Permintaan domestik & eksternal pulih. Saham Asia rally.",
      category: "global",
      affectedCategories: ["global", "ekonomi"],
      sources: ["Bloomberg", "Caixin", "Reuters", "CNBC Indonesia"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "7 jam lalu",
      tags: ["China", "PMI", "Manufacturing", "Asia Rally"],
      rank: 4,
      events: [
        { time: "08:00 WIB", title: "Caixin rilis PMI", detail: "Manufacturing PMI 51,2, di atas ekspektasi 50,8.", source: "Caixin", category: "global" },
        { time: "09:00 WIB", title: "Hang Seng +1,8%", detail: "Saham Asia rally. Nikkei +1,2%, Kospi +1,5%, ASX200 +0,9%.", source: "Bloomberg", category: "ekonomi" },
        { time: "10:00 WIB", title: "PBoC inject likuiditas", detail: "PBOC tambah US$15B likuiditas via MLF untuk dukung demand.", source: "Reuters", category: "global" },
      ],
      keyData: [
        { value: "51,2", label: "PMI", sublabel: "vs 50,8 est", trend: "up" },
        { value: "+1,8%", label: "Hang Seng", sublabel: "rally regional", trend: "up" },
        { value: "US$15B", label: "PBoC inject", sublabel: "likuiditas", trend: "up" },
      ],
    },
    {
      id: "global-japan-boj",
      flag: "🇯🇵",
      title: "BoJ naikkan suku bunga ke 0,75%, yen balik ke 152/US$",
      summary:
        "Bank of Japan (BoJ) naikkan suku bunga acuan dari 0,50% ke 0,75% — level tertinggi sejak 2008. Yen balik ke 152/US$. Carry trade unwind dimulai.",
      category: "global",
      affectedCategories: ["global", "ekonomi"],
      sources: ["Nikkei", "Reuters", "Bloomberg", "WSJ"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "10 jam lalu",
      tags: ["BoJ", "Yen", "Carry Trade", "Suku Bunga Jepang"],
      rank: 5,
      events: [
        { time: "11:00 WIB", title: "BoJ naikkan rate ke 0,75%", detail: "Vote 7-2. BoJ: “perlu normalisasi bertahap.”", source: "Nikkei", category: "global" },
        { time: "11:30 WIB", title: "Yen ke 152/US$", detail: "USD/JPY turun dari 156 ke 152 dalam 1 jam. Carry unwind.", source: "Bloomberg", category: "global" },
        { time: "12:00 WIB", title: "Nikkei turun 2,1%", detail: "Saham Jepang koreksi setelah rally YTD. Eksportir turun.", source: "Reuters", category: "ekonomi" },
      ],
      keyData: [
        { value: "0,75%", label: "BoJ rate", sublabel: "vs 0,50% sebelumnya", trend: "up" },
        { value: "152", label: "Yen/US$", sublabel: "dari 156", trend: "up" },
        { value: "-2,1%", label: "Nikkei", sublabel: "respon pasar", trend: "down" },
      ],
    },
    {
      id: "global-taiwan-strait",
      flag: "🇹🇼",
      title: "Tegang Selat Taiwan, kapal induk China lintasi zona identifikasi pertahanan udara",
      summary:
        "Tegang di Selat Taiwan memuncak — kapal induk Shandong & 8 kapal perang China lintasi ADIZ Taiwan. Taiwan kirim jet tempur. IHSG turun 1,2% sesi I, ASIA mixed.",
      category: "global",
      affectedCategories: ["global"],
      sources: ["Reuters", "Bloomberg", "Nikkei", "WSJ", "CNBC Indonesia"],
      sourceCount: 8,
      readTime: "3 mnt",
      timeAgo: "12 jam lalu",
      tags: ["Taiwan", "China", "Geopolitik", "Selat Taiwan", "IHSG -1,2%"],
      rank: 6,
      events: [
        { time: "05:00 WIB", title: "Shandong lintasi ADIZ", detail: "Kapal induk Shandong + 8 kapal perang lintasi zona ADIZ Taiwan.", source: "Reuters", category: "global" },
        { time: "06:00 WIB", title: "Taiwan scramble jet", detail: "Taiwan kirim F-16 & kapal perang ke selat. Siaga tempur.", source: "Bloomberg", category: "global" },
        { time: "09:00 WIB", title: "IHSG turun 1,2%", detail: "Bursa Asia mixed. IHSG -1,2% sesi I, Hang Seng -0,8%, Nikkei flat.", source: "CNBC Indonesia", category: "ekonomi" },
      ],
      keyData: [
        { value: "1", label: "Kapal induk", sublabel: "Shandong", trend: "neutral" },
        { value: "8", label: "Kapal perang", sublabel: "China", trend: "neutral" },
        { value: "-1,2%", label: "IHSG", sublabel: "respon", trend: "down" },
      ],
    },
    {
      id: "global-uk-rates",
      flag: "🇬🇧",
      title: "BoE tahan rate 4,25%, tapi voting split 5-4 — sinyal dovish di Q3",
      summary:
        "Bank of England (BoE) mempertahankan suku bunga di 4,25% dengan voting 5-4. 4 member voting untuk cut — sinyal pertama kali sejak 2020. Sterling turun ke 1,27/US$.",
      category: "global",
      affectedCategories: ["global", "ekonomi"],
      sources: ["Reuters", "FT", "Bloomberg", "BBC"],
      sourceCount: 5,
      readTime: "2 mnt",
      timeAgo: "1 hari lalu",
      tags: ["BoE", "UK", "Sterling", "Suku Bunga Inggris"],
      rank: 7,
      events: [
        { time: "18:00 WIB", title: "BoE rilis keputusan", detail: "Rate tahan 4,25%. Voting 5-4, 4 member voting cut.", source: "FT", category: "global" },
        { time: "18:30 WIB", title: "Sterling turun ke 1,27", detail: "GBP/USD turun 0,6% jadi 1,2708. Gilts rally.", source: "Bloomberg", category: "global" },
        { time: "19:00 WIB", title: "FTSE 100 +0,4%", detail: "Saham Inggris naik, bank & property rally. Construction +2,1%.", source: "BBC", category: "ekonomi" },
      ],
      keyData: [
        { value: "4,25%", label: "BoE rate", sublabel: "ditahankan", trend: "neutral" },
        { value: "5-4", label: "Vote", sublabel: "4 dovish", trend: "down" },
        { value: "1,27", label: "GBP/US$", sublabel: "turun", trend: "down" },
      ],
    },
  ],
  komoditas: [
    {
      id: "hl-nickel-glut-2",
      title: "Harga nikel global anjlok 4%, ancaman oversupply dari Indonesia",
      summary:
        "Harga nikel di LME turun 4% ke US$16.200/ton setelah laporan peningkatan stok dan ekspektasi surplus produksi dari Indonesia & Filipina. Saham ANTM, INCO tertekan.",
      category: "komoditas",
      affectedCategories: ["komoditas", "saham", "global"],
      sources: ["Bloomberg", "Reuters", "Kontan", "CNBC Indonesia"],
      sourceCount: 6,
      readTime: "2 mnt",
      timeAgo: "5 jam lalu",
      tags: ["Nikel", "ANTM", "INCO", "LME"],
      tickers: ["ANTM", "INCO"],
      rank: 1,
      events: [
        { time: "07:00", title: "LME buka: nikel turun 4%", detail: "Harga US$16.200/ton, level terendah 6 bulan.", source: "Bloomberg", category: "komoditas" },
        { time: "08:00", title: "Stok LME naik 8%", detail: "Stok naik ke 142.000 ton, tertinggi sejak November 2025.", source: "Reuters", category: "global" },
        { time: "08:30", title: "Indonesia ekspor naik 12% MoM", detail: "Ekspor nikel Mei 2026 naik 12% MoM jadi 78.000 ton.", source: "Kontan", category: "komoditas" },
      ],
    },
  ],
};

/** Category metadata with display config. */
export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    /** Emoji or lucide icon name */
    icon: string;
    /** Color token name (without "text-" prefix) */
    colorClass: string;
    /** Soft background for cards */
    softClass: string;
    /** Description for category landing page header. */
    description: string;
    /** Sub-routes for the category landing page. */
    slug: string;
  }
> = {
  saham: {
    label: "Saham",
    icon: "trending-up",
    colorClass: "text-cat-saham",
    softClass: "bg-cat-saham-soft border-cat-saham-line",
    description:
      "Recap emiten LQ45 & IDX30, dividen, earnings, sentimen & pergerakan harga harian.",
    slug: "/saham/",
  },
  bisnis: {
    label: "Bisnis",
    icon: "building-2",
    colorClass: "text-cat-bisnis",
    softClass: "bg-cat-bisnis-soft border-cat-bisnis-line",
    description:
      "Akuisisi, startup, UMKM, korporasi, PHK, ekspansi, funding — dunia bisnis Indonesia.",
    slug: "/bisnis/",
  },
  ekonomi: {
    label: "Ekonomi",
    icon: "landmark",
    colorClass: "text-cat-ekonomi-2",
    softClass: "bg-cat-ekonomi-2-soft border-cat-ekonomi-2-line",
    description:
      "Inflasi, suku bunga, APBN, pertumbuhan, perdagangan, fiskal — indikator & kebijakan moneter.",
    slug: "/ekonomi/",
  },
  kebijakan: {
    label: "Kebijakan",
    icon: "scale",
    colorClass: "text-cat-kebijakan",
    softClass: "bg-cat-kebijakan-soft border-cat-kebijakan-line",
    description:
      "Regulasi, UU, PP, Permendag, POJK, pajak, kebijakan pemerintah yang affect bisnis.",
    slug: "/kebijakan/",
  },
  global: {
    label: "Global",
    icon: "globe",
    colorClass: "text-cat-global",
    softClass: "bg-cat-global-soft border-cat-global-line",
    description:
      "Berita dunia yang relevan buat Indonesia: Fed, geopolitik, commodity, trade war.",
    slug: "/global/",
  },
  komoditas: {
    label: "Komoditas",
    icon: "gem",
    colorClass: "text-cat-komoditas",
    softClass: "bg-cat-komoditas-soft border-cat-komoditas-line",
    description:
      "Harga batu bara, nikel, CPO, minyak — apa yang lo perlu tahu tiap pagi.",
    slug: "/komoditas/",
  },
  crypto: {
    label: "Crypto",
    icon: "bitcoin",
    colorClass: "text-cat-amber-500",
    softClass: "bg-cat-amber-500-soft border-cat-amber-500-line",
    description:
      "Recap Bitcoin, Ethereum, Solana, dan koin top lainnya. Harga, sentimen, dan cerita yang gerak-gerakin pasar.",
    slug: "/crypto/",
  },
};

/** Get all stories for a given category (for the landing pages). */
export function getStoriesByCategory(category: Category): Highlight[] {
  return STORIES_BY_CATEGORY[category] ?? [];
}

/** Get the top N highlights (for Sorotan section on homepage). */
export function getTopHighlights(n: number = 5): Highlight[] {
  return [...TODAY_HIGHLIGHTS].sort((a, b) => a.rank - b.rank).slice(0, n);
}

/** Get a single highlight by id (for /sorotan/detail/[id]).
 *
 *  Searches the FULL story catalog (today's top stories + per-category
 *  archives) so it stays consistent with `generateStaticParams` —
 *  pages are prerendered for every id in `getAllStories()` but a
 *  narrower lookup here would 404 the per-category ones even though
 *  Next.js knows about them. Returns `undefined` if the id is unknown
 *  (e.g. a live API id that doesn't exist in the mock catalog). */
export function getHighlightById(id: string): Highlight | undefined {
  return getAllStories().find((h) => h.id === id);
}

/** Flatten all stories (top + per-category) into a single list. */
export function getAllStories(): Highlight[] {
  return [
    ...TODAY_HIGHLIGHTS,
    ...Object.values(STORIES_BY_CATEGORY).flat(),
  ];
}

/**
 * Find related stories for a given story. Matches by:
 *  1. Same primary category (highest priority)
 *  2. Any overlapping affected category
 *  Excludes the story itself. Returns up to `n` stories.
 */
export function getRelatedStories(story: Highlight, n: number = 4): Highlight[] {
  const all = getAllStories().filter((s) => s.id !== story.id);
  const scored = all.map((s) => {
    let score = 0;
    if (s.category === story.category) score += 3;
    const overlap = s.affectedCategories.filter((c) =>
      story.affectedCategories.includes(c),
    ).length;
    score += overlap;
    return { story: s, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.story.rank - b.story.rank)
    .slice(0, n)
    .map((s) => s.story);
}
