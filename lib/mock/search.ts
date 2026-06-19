import { stocks } from "./stocks";

/** A topic/keyword that doesn't map to a single stock. */
export interface SearchTopic {
  id: string;
  label: string;          // user-facing label, e.g. "Dividen"
  /** Total number of stories tagged with this topic (mocked). */
  storyCount: number;
  /** Category of the topic — used to pick an icon/colour. */
  category: "ekonomi" | "pemerintah" | "politik" | "emiten" | "global" | "komoditas";
}

export const searchTopics: SearchTopic[] = [
  { id: "dividen",     label: "Dividen",        storyCount: 18, category: "emiten" },
  { id: "nikel",       label: "Nikel",          storyCount: 12, category: "komoditas" },
  { id: "inflasi",     label: "Inflasi",        storyCount: 14, category: "ekonomi" },
  { id: "bi-rate",     label: "BI Rate",        storyCount: 22, category: "ekonomi" },
  { id: "ihsg",        label: "IHSG",           storyCount: 36, category: "ekonomi" },
  { id: "rupiah",      label: "Rupiah",         storyCount: 15, category: "ekonomi" },
  { id: "ipo",         label: "IPO",            storyCount: 7,  category: "emiten" },
  { id: "batu-bara",   label: "Batu bara",      storyCount: 9,  category: "komoditas" },
  { id: "right-issue", label: "Right Issue",    storyCount: 5,  category: "emiten" },
  { id: "pilkada",     label: "Pilkada",        storyCount: 8,  category: "politik" },
];

export type SearchItemType = "stock" | "topic";

export interface SearchItem {
  type: SearchItemType;
  id: string;
  label: string;        // primary text
  hint: string;         // secondary text (nama / storyCount)
  href: string;         // link target
}

/** Build a SearchItem from a stock entry. */
function stockToItem(s: (typeof stocks)[number]): SearchItem {
  return {
    type: "stock",
    id: s.kode,
    label: s.kode,
    hint: s.nama,
    href: `/stock/${s.kode}`,
  };
}

/** Build a SearchItem from a topic. */
function topicToItem(t: SearchTopic): SearchItem {
  return {
    type: "topic",
    id: t.id,
    label: t.label,
    hint: `${t.storyCount} cerita`,
    href: `/search/?q=${encodeURIComponent(t.label.toLowerCase())}`,
  };
}

const stockItems: SearchItem[] = stocks.map(stockToItem);
const topicItems: SearchItem[] = searchTopics.map(topicToItem);

const allItems: SearchItem[] = [...stockItems, ...topicItems];

/** Filter search items by query (case-insensitive, matches label OR hint). */
export function searchAll(query: string, limit = 8): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allItems
    .filter((it) => it.label.toLowerCase().includes(q) || it.hint.toLowerCase().includes(q))
    .slice(0, limit);
}

/** Split filtered items into stock / topic groups. */
export function groupByType(items: SearchItem[]): { stocks: SearchItem[]; topics: SearchItem[] } {
  return {
    stocks: items.filter((it) => it.type === "stock"),
    topics: items.filter((it) => it.type === "topic"),
  };
}

/** Result rows for the /search page. Each item is a "match" between a keyword
 *  and a curated news entry — hand-tuned so different keywords yield different
 *  result sets. */
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  category: "ekonomi" | "pemerintah" | "politik" | "emiten" | "global" | "komoditas";
  source: string;
  timeAgo: string;
  ticker?: string;     // related stock, optional
  href: string;        // link target
}

interface KeywordResults {
  stockResults?: { kode: string; name: string };
  stories: SearchResult[];
}

const KEYWORD_INDEX: Record<string, KeywordResults> = {
  dividen: {
    stockResults: { kode: "BBCA", name: "Bank Central Asia" },
    stories: [
      {
        id: "sr-dividen-1",
        title: "BBCA bagikan dividen interim Rp 215/saham, yield 1,8%",
        summary: "BBCA umumkan dividen interim untuk tahun buku 2026, payout ratio 55% — di atas ekspektasi analis. Cum date 14 Juni.",
        category: "emiten",
        source: "Bloomberg",
        timeAgo: "2 jam lalu",
        ticker: "BBCA",
        href: "/stock/BBCA",
      },
      {
        id: "sr-dividen-2",
        title: "Musim dividen 2026: 12 emiten BUMN jadwalkan payout di Q3",
        summary: "Kementerian BUMN koordinasi jadwal dividen emiten BUMN agar gak menumpuk di akhir tahun. Total estimasi payout Rp 87T.",
        category: "emiten",
        source: "Bisnis.com",
        timeAgo: "5 jam lalu",
        href: "#",
      },
      {
        id: "sr-dividen-3",
        title: "BMRI proyeksikan dividen yield 5,2% annualized, top pick analis",
        summary: "Bank Mandiri proyeksikan dividen payout ratio 60% di FY26. Beberapa analis rekomendasikan BMRI sebagai top pick untuk income investor.",
        category: "emiten",
        source: "Kontan",
        timeAgo: "7 jam lalu",
        ticker: "BMRI",
        href: "/stock/BMRI",
      },
      {
        id: "sr-dividen-4",
        title: "HMSP tahan dividen 7,1% annualized meski saham tertekan",
        summary: "Saham HMSP turun 0,9% tapi yield dividen masih menarik di level 7,1% — jadi penahan downside untuk income investor.",
        category: "emiten",
        source: "Reuters",
        timeAgo: "9 jam lalu",
        ticker: "HMSP",
        href: "/stock/HMSP",
      },
      {
        id: "sr-dividen-5",
        title: "ASII bakal bagi dividen final Juni, ekspektasi yield 4,8%",
        summary: "Astra International umumkan jadwal RUPS akhir Juni, bakal bagi dividen final dengan estimasi yield 4,8% annualized.",
        category: "emiten",
        source: "CNBC Indonesia",
        timeAgo: "1 hari lalu",
        ticker: "ASII",
        href: "/stock/ASII",
      },
      {
        id: "sr-dividen-6",
        title: "OJK: total dividen emiten 2025 tembus Rp 412T, rekor tertinggi",
        summary: "Otoritas Jasa Keuangan catat total dividen yang dibagikan emiten sepanjang 2025 mencapai Rp 412 triliun — rekor tertinggi.",
        category: "ekonomi",
        source: "Kontan",
        timeAgo: "2 hari lalu",
        href: "#",
      },
    ],
  },

  nikel: {
    stockResults: { kode: "ANTM", name: "Aneka Tambang" },
    stories: [
      {
        id: "sr-nikel-1",
        title: "Harga nikel LME anjlok 4% setelah rencana ekspor nikel RI diumumkan",
        summary: "Harga nikel LME jatuh ke USD 17.850/ton setelah Indonesia umumkan rencana peningkatan ekspor bijih nikel. Kekhawatiran oversupply menjatuhkan ANTM, INCO.",
        category: "komoditas",
        source: "Reuters",
        timeAgo: "3 jam lalu",
        ticker: "ANTM",
        href: "/stock/ANTM",
      },
      {
        id: "sr-nikel-2",
        title: "INCO pimpin pelemahan, analis UBS downgrade ke sell",
        summary: "Vale Indonesia (INCO) pimpin pelemahan di sektor tambang dengan koreksi 4,8%. Target price dipangkas dari Rp 4.200 ke Rp 3.500.",
        category: "emiten",
        source: "Bloomberg",
        timeAgo: "5 jam lalu",
        ticker: "INCO",
        href: "/stock/INCO",
      },
      {
        id: "sr-nikel-3",
        title: "Indonesia moratorium RKAB, apa artinya buat emiten nikel?",
        summary: "Rencana moratorium RKAB bisa menahan produksi nikel, tapi efektivitasnya dipertanyakan analis. ANTM, INCO, MDKA jadi sorotan.",
        category: "pemerintah",
        source: "Bisnis.com",
        timeAgo: "8 jam lalu",
        href: "#",
      },
      {
        id: "sr-nikel-4",
        title: "NCKL IPO di BEI, fokus ke bisnis nikel matte",
        summary: "PT Merdeka Tsingshan Indonesia (NCKL) gelar IPO di BEI dengan fokus pada produksi nikel matte. Oversubscribed 4,2x.",
        category: "emiten",
        source: "Kontan",
        timeAgo: "10 jam lalu",
        href: "#",
      },
      {
        id: "sr-nikel-5",
        title: "Eropa hormati nikel Indonesia, tetap jadi importir terbesar",
        summary: "Uni Eropa catat Indonesia sebagai importir nikel terbesar di luar China. Volume ekspor naik 18% YoY meski ada tekanan oversupply.",
        category: "global",
        source: "Bloomberg",
        timeAgo: "12 jam lalu",
        href: "#",
      },
      {
        id: "sr-nikel-6",
        title: "MDKA diversifikasi dari nikel ke tembaga-emas, kurangi eksposur",
        summary: "Merdeka Copper Gold (MDKA) percepat diversifikasi dari nikel murni ke tembaga-emas. TFK project akan menjadi tulang punggung baru.",
        category: "emiten",
        source: "CNBC Indonesia",
        timeAgo: "1 hari lalu",
        ticker: "MDKA",
        href: "/stock/MDKA",
      },
    ],
  },

  inflasi: {
    stories: [
      {
        id: "sr-inflasi-1",
        title: "Inflasi Mei 2026 di 2,8% YoY, di bawah ekspektasi pasar",
        summary: "BPS catat inflasi Mei 2,8% YoY — di bawah konsensus 2,9%. Tekanan harga pangan mereda setelah operasi pasar Bulog.",
        category: "ekonomi",
        source: "Kontan",
        timeAgo: "4 jam lalu",
        href: "#",
      },
      {
        id: "sr-inflasi-2",
        title: "BI: inflasi inti stabil, dukung ruang pause BI Rate",
        summary: "Bank Indonesia catat inflasi inti stabil di 2,4%. Ini memberi ruang bagi BI untuk mempertahankan BI Rate di level 6,25%.",
        category: "ekonomi",
        source: "CNBC Indonesia",
        timeAgo: "6 jam lalu",
        href: "#",
      },
      {
        id: "sr-inflasi-3",
        title: "Inflasi Indonesia Q2 diproyeksikan 2,7-2,9%, dalam target BI",
        summary: "Bank Indonesia proyeksikan inflasi Q2 2026 di kisaran 2,7-2,9% — masih dalam target BI 2,5±1%.",
        category: "ekonomi",
        source: "Bloomberg",
        timeAgo: "8 jam lalu",
        href: "#",
      },
      {
        id: "sr-inflasi-4",
        title: "Bapanas stabilkan harga pangan, sukses tekan inflasi pangan ke 1,2%",
        summary: "Badan Pangan Nasional stabilkan harga pangan lewat operasi pasar. Inflasi pangan turun ke 1,2% YoY — terendah dalam 18 bulan.",
        category: "pemerintah",
        source: "Bisnis.com",
        timeAgo: "10 jam lalu",
        href: "#",
      },
      {
        id: "sr-inflasi-5",
        title: "Analis: deflasi 2026 tidak akan terjadi, tekanan eksternal masih ada",
        summary: "Beberapa analis memprediksi deflasi tipis di 2026, tapi consensus tetap pada inflasi moderat 2,6-2,8%.",
        category: "ekonomi",
        source: "Reuters",
        timeAgo: "1 hari lalu",
        href: "#",
      },
    ],
  },

  "bi-rate": {
    stories: [
      {
        id: "sr-bi-1",
        title: "BI pertahankan BI Rate di 6,25%, Gubernur Perry: \"Akhir siklus\"",
        summary: "Gubernur BI Perry Warjiyo pertahankan BI Rate di 6,25% dan beri sinyal dovish. Pasar merespons positif: IHSG futures +0,4%.",
        category: "ekonomi",
        source: "Bloomberg",
        timeAgo: "2 jam lalu",
        href: "#",
      },
      {
        id: "sr-bi-2",
        title: "BI Rate naik 25bps akhir RDG: 5 dari 7 bank sentral Asia ikut pause",
        summary: "Pasar melihat kenaikan 25bps oleh BI sebagai akhir siklus. Mayoritas bank sentral Asia (BoJ, BoT, BoK) juga sedang pause.",
        category: "ekonomi",
        source: "Reuters",
        timeAgo: "5 jam lalu",
        href: "#",
      },
      {
        id: "sr-bi-3",
        title: "Mandiri Sekuritas: \"Ini signalling yang sangat dovish, BI tahan hingga akhir 2026\"",
        summary: "Mandiri Sekuritas melihat pernyataan Perry sebagai sinyal pause hingga akhir 2026. Rekomendasi overweight sektor perbankan.",
        category: "ekonomi",
        source: "Kontan",
        timeAgo: "7 jam lalu",
        href: "#",
      },
      {
        id: "sr-bi-4",
        title: "Suku bunga kredit korporasi turun tipis, dampak BI Rate butuh waktu",
        summary: "Suku bunga kredit korporasi turun tipis ke 9,1% dari 9,3%. Dampak penuh BI Rate biasanya baru terasa 2-3 kuartal setelah keputusan.",
        category: "ekonomi",
        source: "Bisnis.com",
        timeAgo: "9 jam lalu",
        href: "#",
      },
    ],
  },

  ihsg: {
    stories: [
      {
        id: "sr-ihsg-1",
        title: "IHSG ditutup rebound 0,6% ke 7.198, ditopang sektor konsumer & perbankan",
        summary: "IHSG rebound 0,6% ke 7.198 setelah dua sesi terkoreksi. Penguatan ditopang sektor konsumer (+1,2%) dan perbankan (+0,8%).",
        category: "ekonomi",
        source: "CNBC Indonesia",
        timeAgo: "2 jam lalu",
        href: "#",
      },
      {
        id: "sr-ihsg-2",
        title: "IHSG sideways di 7.180, asing net sell Rp 45M",
        summary: "IHSG bergerak sideways di kisaran 7.150–7.200. Asing catat net sell tipis Rp 45 miliar.",
        category: "ekonomi",
        source: "Bisnis.com",
        timeAgo: "4 jam lalu",
        href: "#",
      },
      {
        id: "sr-ihsg-3",
        title: "IHSG YTD +12,4%, jadi salah satu bursa berkinerja terbaik di Asia",
        summary: "IHSG YTD +12,4% — terbaik di antara indeks Asia. Didorong oleh sektor perbankan dan konsumer.",
        category: "ekonomi",
        source: "Bloomberg",
        timeAgo: "6 jam lalu",
        href: "#",
      },
      {
        id: "sr-ihsg-4",
        title: "Analis: IHSG punya ruang naik ke 7.500 dalam 6 bulan ke depan",
        summary: "Beberapa analis melihat IHSG punya ruang ke 7.500 dalam 6 bulan. Target berdasarkan multiple expansion dan earnings growth.",
        category: "ekonomi",
        source: "Kontan",
        timeAgo: "8 jam lalu",
        href: "#",
      },
    ],
  },

  rupiah: {
    stories: [
      {
        id: "sr-rupiah-1",
        title: "Rupiah stabil di Rp 15.850/US$, BI siap intervensi",
        summary: "Rupiah stabil di level Rp 15.850 setelah keputusan BI Rate. BI siap intervensi jika tembus Rp 16.000.",
        category: "ekonomi",
        source: "Reuters",
        timeAgo: "3 jam lalu",
        href: "#",
      },
      {
        id: "sr-rupiah-2",
        title: "Rupiah menguat ke Rp 15.780, sentimen positif BI Rate pause",
        summary: "Rupiah terapresiasi ke Rp 15.780 setelah sinyal dovish BI. Mata uang regional juga kompak menguat.",
        category: "ekonomi",
        source: "Bloomberg",
        timeAgo: "5 jam lalu",
        href: "#",
      },
      {
        id: "sr-rupiah-3",
        title: "Cadangan devisa Mei USD 145M, cukup untuk 6,5 bulan impor",
        summary: "Bank Indonesia umumkan cadangan devisa Mei USD 145 miliar — cukup untuk 6,5 bulan impor. Stabilitas eksternal terjaga.",
        category: "ekonomi",
        source: "Bisnis.com",
        timeAgo: "7 jam lalu",
        href: "#",
      },
    ],
  },

  ipo: {
    stories: [
      {
        id: "sr-ipo-1",
        title: "NCKL IPO oversubscribed 4,2x, fokus nikel matte",
        summary: "PT Merdeka Tsingshan Indonesia (NCKL) IPO oversubscribed 4,2x. Harga pelaksanaan di upper range Rp 1.250.",
        category: "emiten",
        source: "Kontan",
        timeAgo: "4 jam lalu",
        href: "#",
      },
      {
        id: "sr-ipo-2",
        title: "5 emiten antri IPO di BEI Q3 2026, total筹集 Rp 8,2T",
        summary: "Bursa Efek Indonesia catat 5 emiten antri IPO di Q3 2026. Total pendanaan ditargetkan Rp 8,2 triliun.",
        category: "emiten",
        source: "Bisnis.com",
        timeAgo: "6 jam lalu",
        href: "#",
      },
      {
        id: "sr-ipo-3",
        title: "OJK: pipeline IPO 2026 capai Rp 25T, didorong sektor konsumer",
        summary: "Otoritas Jasa Keuangan catat pipeline IPO 2026 mencapai Rp 25 triliun, didorong oleh sektor konsumer dan teknologi.",
        category: "ekonomi",
        source: "Reuters",
        timeAgo: "8 jam lalu",
        href: "#",
      },
      {
        id: "sr-ipo-4",
        title: "Daftar tunggu IPO BEI penuh, window 2026 akan ramai",
        summary: "Daftar tunggu IPO di BEI penuh. Window 2026 akan menjadi yang paling ramai sejak 2021.",
        category: "emiten",
        source: "CNBC Indonesia",
        timeAgo: "1 hari lalu",
        href: "#",
      },
    ],
  },

  "batu-bara": {
    stories: [
      {
        id: "sr-batubara-1",
        title: "Harga batu bara HBA naik 1,8% ke USD 134/ton, menopang ADRO & PTBA",
        summary: "Harga batu bara acuan (HBA) naik ke USD 134/ton. Saham ADRO dan PTBA kompak menghijau.",
        category: "komoditas",
        source: "Bloomberg",
        timeAgo: "2 jam lalu",
        href: "#",
      },
      {
        id: "sr-batubara-2",
        title: "PTBA umumkan capex USD 380 juta untuk ekspansi tambang 2026",
        summary: "PT Bukit Asam (PTBA) umumkan capex 2026 USD 380 juta untuk ekspansi tambang dan peningkatan kapasitas produksi.",
        category: "emiten",
        source: "Bisnis.com",
        timeAgo: "4 jam lalu",
        href: "#",
      },
      {
        id: "sr-batubara-3",
        title: "Permintaan batu bara Asia naik jelang musim dingin",
        summary: "Permintaan batu bara dari Asia Timur naik 8% YoY jelang musim dingin. Harga HBA berpotensi lanjut naik.",
        category: "global",
        source: "Reuters",
        timeAgo: "6 jam lalu",
        href: "#",
      },
    ],
  },

  "right-issue": {
    stories: [
      {
        id: "sr-ri-1",
        title: "ASII rights issue Astra Financial Rp 12T, bayar utang & ekspansi fintech",
        summary: "Astra International (ASII) rights issue untuk unit Astra Financial Rp 12 triliun. Rasio 2:1, harga Rp 5.800.",
        category: "emiten",
        source: "Bisnis.com",
        timeAgo: "4 jam lalu",
        ticker: "ASII",
        href: "/stock/ASII",
      },
      {
        id: "sr-ri-2",
        title: "BRIS rights issue oversubscribed 2,3x, likuiditas saham membaik",
        summary: "Bank Syariah Indonesia (BRIS) rights issue oversubscribed 2,3x. Likuiditas saham meningkat signifikan.",
        category: "emiten",
        source: "Kontan",
        timeAgo: "7 jam lalu",
        ticker: "BRIS",
        href: "/stock/BRIS",
      },
      {
        id: "sr-ri-3",
        title: "Daftar rights issue semester 2 2026: 8 emiten, total Rp 18T",
        summary: "Bursa catat 8 emiten akan lakukan rights issue di semester 2 2026. Total pendanaan ditargetkan Rp 18 triliun.",
        category: "emiten",
        source: "CNBC Indonesia",
        timeAgo: "1 hari lalu",
        href: "#",
      },
    ],
  },

  pilkada: {
    stories: [
      {
        id: "sr-pilkada-1",
        title: "KPU mulai persiapan teknis pilkada 2027",
        summary: "KPU gelar rapat koordinasi internal untuk persiapan teknis pilkada serentak 2027. Anggaran dialokasikan Rp 4,2 triliun.",
        category: "politik",
        source: "CNN Indonesia",
        timeAgo: "2 jam lalu",
        href: "#",
      },
      {
        id: "sr-pilkada-2",
        title: "Koalisi Indonesia Maju bentuk sekretariat baru jelang pilkada 2027",
        summary: "Koalisi Indonesia Maju (KIM) bentuk sekretariat baru untuk mengonsolidasikan pemenangan 224 Pilkada serentak 2027.",
        category: "politik",
        source: "Kompas",
        timeAgo: "4 jam lalu",
        href: "#",
      },
      {
        id: "sr-pilkada-3",
        title: "PDIP mulai rangkul koalisi baru untuk pilpres 2029",
        summary: "Partai Demokrasi Indonesia Perjuangan (PDIP) mulai merangkul koalisi baru untuk persiapan pilpres 2029.",
        category: "politik",
        source: "Detik",
        timeAgo: "6 jam lalu",
        href: "#",
      },
      {
        id: "sr-pilkada-4",
        title: "MPR bahas amandemen terbatas UUD 1945, wacana MPR kembali dipilih rakyat",
        summary: "MPR gelar sidang paripurna membahas wacana amandemen terbatas UUD 1945. Salah satu poin: mekanisme pemilihan MPR dikembalikan ke rakyat.",
        category: "politik",
        source: "Tempo",
        timeAgo: "1 hari lalu",
        href: "#",
      },
    ],
  },
};

/** Generic fallback when query doesn't match a curated keyword. */
function genericSearch(query: string): SearchResult[] {
  return [
    {
      id: `gen-1`,
      title: `Pencarian untuk "${query}"`,
      summary: `Belum ada hasil yang dikurasi khusus untuk kata kunci ini. Coba kata kunci populer: dividen, nikel, inflasi, BI Rate, IHSG, rupiah.`,
      category: "ekonomi",
      source: "Rangkuman",
      timeAgo: "Sekarang",
      href: "#",
    },
    {
      id: `gen-2`,
      title: `Topik "${query}" — 12 cerita agregat`,
      summary: `Tiap hari, tim kurasi kami menghimpun cerita dari CNBC, Bisnis, Kontan, Bloomberg, Reuters, dan 20+ media lainnya. Hasil spesifik untuk topik ini akan muncul setelah data di-update.`,
      category: "ekonomi",
      source: "Tim Redaksi",
      timeAgo: "—",
      href: "#",
    },
  ];
}

/** Search results for a given query. If the query matches a curated keyword
 *  the curated set is returned; otherwise a generic placeholder is shown. */
export function searchResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const indexed = KEYWORD_INDEX[q];
  if (indexed) return indexed.stories;
  return genericSearch(q);
}
