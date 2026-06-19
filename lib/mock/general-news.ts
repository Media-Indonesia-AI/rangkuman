import { TODAY_ISO, YESTERDAY_ISO, DAY_BEFORE_ISO } from "./recaps";

export type NewsCategory = "ekonomi" | "pemerintah" | "politik" | "emiten" | "global";

export interface NewsSource {
  name: string;      // media outlet
  timeAgo: string;   // e.g. "2 jam lalu"
}

export interface NewsStory {
  id: string;
  category: NewsCategory;
  title: string;            // combined title of the story
  summary: string;          // 2-3 sentence synthesis across sources
  /** 1-2 short highlights pulled from the coverage. */
  keyPoints: string[];
  sources: NewsSource[];
}

/**
 * Berita yang sudah diagregasi: kalau 2+ media nulis story yang sama,
 * digabung jadi 1 entry dengan ringkasan. Investor cukup lihat di sini
 * tanpa harus bolak-balik ke media asal.
 */
export const newsStories: NewsStory[] = [
  // ───── EKONOMI ─────
  {
    id: "ek-bi-rate",
    category: "ekonomi",
    title: "BI pertahankan BI Rate di 6,25%, Gubernur Perry sinyalkan \"akhir siklus tightening\"",
    summary:
      "Gubernur Bank Indonesia Perry Warjiyo mempertahankan BI Rate di level 6,25% dan memberi sinyal dovish — menyebut ini \"akhir siklus\" yang dimulai 2022. Pasar merespons positif: IHSG futures naik 0,4%, yield SUN tenor 10 tahun turun ke 6,52%, dan rupiah menguat ke Rp 15.850/US$.",
    keyPoints: ["BI Rate 6,25%", "Sinyal pause", "IHSG futures +0,4%"],
    sources: [
      { name: "Bloomberg", timeAgo: "2 jam lalu" },
      { name: "Kontan", timeAgo: "3 jam lalu" },
      { name: "CNBC Indonesia", timeAgo: "4 jam lalu" },
      { name: "Reuters", timeAgo: "5 jam lalu" },
    ],
  },
  {
    id: "ek-apbn",
    category: "ekonomi",
    title: "Sri Mulyani: defisit APBN 2026 terjaga di 2,4% PDB, di bawah target",
    summary:
      "Menteri Keuangan Sri Mulyani Indrawati mengumumkan defisit APBN 2026 berhasil dijaga di level 2,4% PDB — di bawah target 2,6%. Pencapaian ini ditopang oleh kenaikan pajak 11% YoY dan belanja modal yang lebih efisien. Defisit 2027 diproyeksikan turun lagi ke 2,1% PDB.",
    keyPoints: ["Defisit 2,4% PDB", "Pajak +11% YoY"],
    sources: [
      { name: "Bisnis.com", timeAgo: "4 jam lalu" },
      { name: "Kontan", timeAgo: "5 jam lalu" },
    ],
  },
  {
    id: "ek-inflasi",
    category: "ekonomi",
    title: "Inflasi Mei 2,8% YoY, di bawah ekspektasi pasar",
    summary:
      "BPS mencatat inflasi Mei 2026 di level 2,8% YoY — di bawah konsensus analis 2,9%. Tekanan harga pangan mereda setelah operasi pasar oleh Bulog, sementara inflasi inti stabil di 2,4%. BI melihat ini mendukung ruang untuk mempertahankan BI Rate.",
    keyPoints: ["Inflasi 2,8% YoY", "Inflasi inti 2,4%"],
    sources: [
      { name: "Kontan", timeAgo: "5 jam lalu" },
      { name: "CNBC Indonesia", timeAgo: "6 jam lalu" },
      { name: "Reuters", timeAgo: "7 jam lalu" },
    ],
  },
  {
    id: "ek-pdb-q1",
    category: "ekonomi",
    title: "PDB Q1 2026 tumbuh 5,1% YoY, tertinggi dalam 8 kuartal",
    summary:
      "BPS melaporkan pertumbuhan PDB Q1 2026 mencapai 5,1% YoY — di atas konsensus 4,9% dan tertinggi dalam 8 kuartal terakhir. Konsumsi rumah tangga tumbuh 5,3%, investasi bangunan 6,2%, dan ekspor 7,1%. Ini memberi ruang bagi BI dan pemerintah untuk tetap akomodatif.",
    keyPoints: ["PDB 5,1% YoY", "Konsumsi RT 5,3%", "Ekspor 7,1%"],
    sources: [
      { name: "CNBC Indonesia", timeAgo: "8 jam lalu" },
      { name: "Bisnis.com", timeAgo: "9 jam lalu" },
      { name: "Bloomberg", timeAgo: "10 jam lalu" },
    ],
  },
  {
    id: "ek-rupiah",
    category: "ekonomi",
    title: "Rupiah stabil di Rp 15.850/US$, BI siap intervensi jika tembus Rp 16.000",
    summary:
      "Rupiah stabil di level Rp 15.850/US$ setelah keputusan BI Rate. Bank Indonesia menyatakan siap melakukan intervensi di pasar jika rupiah menembus Rp 16.000/US$. Cadangan devisa Mei tercatat USD 145 miliar — cukup untuk 6,5 bulan impor.",
    keyPoints: ["Rp 15.850/US$", "Cadangan USD 145M"],
    sources: [
      { name: "Reuters", timeAgo: "6 jam lalu" },
      { name: "Bloomberg", timeAgo: "7 jam lalu" },
      { name: "Kontan", timeAgo: "8 jam lalu" },
    ],
  },

  // ───── PEMERINTAH ─────
  {
    id: "pm-ikn",
    category: "pemerintah",
    title: "Prabowo resmikan proyek IKN tahap III, investasi Rp 47 triliun",
    summary:
      "Presiden Prabowo meresmikan tahap III pembangunan IKN dengan total investasi Rp 47 triliun. Proyek ini mencakup 12 gedung pemerintah, 2 universitas, dan infrastruktur dasar (jalan, air, listrik). Tahap III ditargetkan selesai akhir 2027 dan membuka 85.000 lapangan kerja baru.",
    keyPoints: ["Rp 47T investasi", "12 gedung pemerintah", "85K lapangan kerja"],
    sources: [
      { name: "Kompas", timeAgo: "3 jam lalu" },
      { name: "Bisnis.com", timeAgo: "4 jam lalu" },
      { name: "CNN Indonesia", timeAgo: "5 jam lalu" },
    ],
  },
  {
    id: "pm-uu-pdp",
    category: "pemerintah",
    title: "DPR sahkan revisi UU PDP, denda maksimal naik ke Rp 50 miliar",
    summary:
      "DPR resmi mengesahkan revisi UU Perlindungan Data Pribadi dalam rapat paripurna. Aturan baru menaikkan denda maksimal dari Rp 5 miliar menjadi Rp 50 miliar untuk perusahaan yang lalai melindungi data konsumen. Aturan turunan ditargetkan rampung dalam 6 bulan.",
    keyPoints: ["Denda maks Rp 50M", "Aturan turunan 6 bulan"],
    sources: [
      { name: "CNN Indonesia", timeAgo: "5 jam lalu" },
      { name: "Tempo", timeAgo: "6 jam lalu" },
      { name: "Kompas", timeAgo: "7 jam lalu" },
    ],
  },
  {
    id: "pm-migas",
    category: "pemerintah",
    title: "ESDM naikkan target produksi migas 2026 ke 1 juta barel/hari",
    summary:
      "Kementerian ESDM merevisi target produksi migas 2026 menjadi 1 juta barel setara minyak per hari — naik dari target sebelumnya 950 ribu barel. Pencapaian ini ditopang oleh investasi hulu migas USD 18 miliar dan sumur baru di lapangan Banyu Urip & Cepu.",
    keyPoints: ["Target 1 juta barel/hari", "Investasi hulu USD 18M"],
    sources: [
      { name: "Kontan", timeAgo: "7 jam lalu" },
      { name: "Bloomberg", timeAgo: "8 jam lalu" },
      { name: "Reuters", timeAgo: "9 jam lalu" },
    ],
  },
  {
    id: "pm-ppn-umkm",
    category: "pemerintah",
    title: "Pemerintah luncurkan insentif PPN 0% UMKM, berlaku mulai Q3 2026",
    summary:
      "Pemerintah mengumumkan insentif PPN 0% untuk UMKM dengan omzet di bawah Rp 4,8 miliar/tahun, berlaku mulai Q3 2026. Insentif ini diproyeksikan menambah basis pajak formal hingga 500 ribu UMKM baru dalam 12 bulan, sambil menahan tekanan ke konsumen kelas bawah.",
    keyPoints: ["PPN 0% UMKM", "+500K UMKM formal"],
    sources: [
      { name: "Bisnis.com", timeAgo: "9 jam lalu" },
      { name: "Kontan", timeAgo: "10 jam lalu" },
      { name: "CNN Indonesia", timeAgo: "11 jam lalu" },
    ],
  },

  // ───── POLITIK ─────
  {
    id: "pl-koalisi",
    category: "politik",
    title: "Koalisi jelang pilkada 2027 mulai bermanuver, PDIP rangkul sekutu baru",
    summary:
      "Koalisi Indonesia Maju (KIM) membentuk sekretariat baru untuk mengonsolidasikan pemenangan 224 Pilkada serentak 2027. PDIP juga mulai merangkul koalisi baru untuk pilpres 2029, dengan beberapa partai non-parlemen mulai deklarasikan dukungan.",
    keyPoints: ["224 Pilkada 2027", "Sekretariat KIM baru"],
    sources: [
      { name: "CNN Indonesia", timeAgo: "1 jam lalu" },
      { name: "Kompas", timeAgo: "3 jam lalu" },
      { name: "Detik", timeAgo: "4 jam lalu" },
    ],
  },
  {
    id: "pl-ppn-12",
    category: "politik",
    title: "Polemik PPN 12% di parlemen, PKS usulkan moratorium, Gerindra tolak",
    summary:
      "PKS mengusulkan moratorium kenaikan PPN 12% yang dijadwalkan berlaku 1 Januari 2027. Fraksi Gerindra menolak, menyebut keputusan sudah final lewat UU HPP. Polemik ini membuat pasar menunggu kepastian, dengan analis memproyeksikan dampak ke konsumsi Q4 2026 jika kenaikan jadi berlaku.",
    keyPoints: ["PPN 12% mulai 1 Jan 2027", "Moratorium ditolak"],
    sources: [
      { name: "Tempo", timeAgo: "5 jam lalu" },
      { name: "Bisnis.com", timeAgo: "6 jam lalu" },
      { name: "Detik", timeAgo: "7 jam lalu" },
    ],
  },
  {
    id: "pl-smrc",
    category: "politik",
    title: "Survei SMRC: elektabilitas Prabowo 62%, turun 3 poin dari bulan lalu",
    summary:
      "Survei SMRC Juni 2026 mencatat elektabilitas Presiden Prabowo di 62%, turun 3 poin dari bulan lalu. Penurunan terutama di segmen urban dan generasi Z. PDIP menjadi penantang terkuat dengan elektabilitas 22% di simulasi capres, mengakhiri tren penurunannya sejak 2024.",
    keyPoints: ["Prabowo 62%", "Turun 3 poin", "PDIP 22% di simulasi"],
    sources: [
      { name: "CNN Indonesia", timeAgo: "10 jam lalu" },
      { name: "Kompas", timeAgo: "11 jam lalu" },
      { name: "Tempo", timeAgo: "12 jam lalu" },
      { name: "Detik", timeAgo: "1 hari lalu" },
    ],
  },

  // ───── EMITEN ─────
  {
    id: "em-bbca-dividen",
    category: "emiten",
    title: "BBCA bagikan dividen interim Rp 215/saham, yield 1,8% — payout ratio 55%",
    summary:
      "BBCA mengumumkan dividen interim Rp 215 per saham untuk tahun buku 2026, dengan cum date 14 Juni. Yield efektif 1,8% berdasarkan harga penutupan kemarin. Rasio pembayaran 55% dari laba Q1 — di atas ekspektasi analis 50%. Total dividen tahun ini diproyeksikan Rp 425/saham.",
    keyPoints: ["Dividen Rp 215/saham", "Yield 1,8%", "Cum date 14 Jun"],
    sources: [
      { name: "Bloomberg", timeAgo: "1 jam lalu" },
      { name: "Kontan", timeAgo: "2 jam lalu" },
      { name: "Bisnis.com", timeAgo: "3 jam lalu" },
      { name: "CNBC Indonesia", timeAgo: "4 jam lalu" },
    ],
  },
  {
    id: "em-tlkm-data-center",
    category: "emiten",
    title: "TLKM umumkan kontrak data center hyperscale Rp 1,5T, naik 60% YoY",
    summary:
      "Telkom Indonesia (TLKM) mengumumkan kontrak data center hyperscale baru di Cikarang senilai Rp 1,5 triliun per tahun, naik 60% YoY. Pelanggan adalah operator cloud tier-1 global yang namanya masih dirahasiakan. Kontrak mulai berlaku Q3 2026 dengan tenor 5 tahun.",
    keyPoints: ["Rp 1,5T/tahun", "+60% YoY", "Tenor 5 tahun"],
    sources: [
      { name: "Reuters", timeAgo: "2 jam lalu" },
      { name: "Bloomberg", timeAgo: "3 jam lalu" },
      { name: "Kontan", timeAgo: "4 jam lalu" },
    ],
  },
  {
    id: "em-goto-ebitda",
    category: "emiten",
    title: "GOTO cetak EBITDA positif pertama Rp 320M di Q1 2026, di atas guidance",
    summary:
      "GoTo Gojek Tokopedia (GOTO) melaporkan EBITDA positif pertama Rp 320 miliar di Q1 2026, di atas guidance manajemen. Pencapaian ini didorong oleh layanan finansial (GoPay, Mitra) yang tumbuh 42% YoY menutupi pelemahan merchant. Manajemen naikkan target EBITDA FY26 jadi Rp 1,4T.",
    keyPoints: ["EBITDA Rp 320M", "+42% fintech", "Target FY26 Rp 1,4T"],
    sources: [
      { name: "CNBC Indonesia", timeAgo: "5 jam lalu" },
      { name: "Bisnis.com", timeAgo: "6 jam lalu" },
      { name: "Tempo", timeAgo: "7 jam lalu" },
      { name: "Kontan", timeAgo: "8 jam lalu" },
    ],
  },
  {
    id: "em-asii-rights",
    category: "emiten",
    title: "ASII rights issue Astra Financial Rp 12T, bayar utang & ekspansi fintech",
    summary:
      "Astra International (ASII) akan melakukan rights issue untuk unit Astra Financial senilai Rp 12 triliun. Hasilnya digunakan untuk membayar utang dan ekspansi bisnis fintech termasuk Astra Pay dan Asuransi Astra Life. Rasio rights 2:1, harga pelaksanaan Rp 5.800/saham.",
    keyPoints: ["Rights issue Rp 12T", "Rasio 2:1", "Harga Rp 5.800"],
    sources: [
      { name: "Bisnis.com", timeAgo: "6 jam lalu" },
      { name: "Kontan", timeAgo: "7 jam lalu" },
      { name: "Bloomberg", timeAgo: "8 jam lalu" },
    ],
  },

  // ───── GLOBAL ─────
  {
    id: "gl-fed",
    category: "global",
    title: "The Fed tahan suku bunga di 5,25%, Powell sinyalkan pause sampai Q4",
    summary:
      "The Federal Reserve mempertahankan Fed Funds Rate di level 5,25% dan memberi sinyal pause sampai Q4 2026. Ketua Fed Jerome Powell menyebut ekonomi AS solid tapi inflasi jasa masih tinggi. Pasar saham AS rally 1,2%, dolar index turun 0,6% ke 103,8. Yield UST tenor 10 tahun stabil di 4,32%.",
    keyPoints: ["Fed Rate 5,25%", "DXY 103,8", "Yield UST 4,32%"],
    sources: [
      { name: "Bloomberg", timeAgo: "1 jam lalu" },
      { name: "Reuters", timeAgo: "2 jam lalu" },
      { name: "CNBC Indonesia", timeAgo: "3 jam lalu" },
      { name: "Kontan", timeAgo: "4 jam lalu" },
    ],
  },
  {
    id: "gl-oil",
    category: "global",
    title: "Harga minyak WTI turun ke USD 78/barel, OPEC+ longgarkan supply",
    summary:
      "Harga minyak mentah WTI turun 2,3% ke USD 78/barel setelah OPEC+ mengumumkan kenaikan output 500 ribu barel/hari mulai Agustus. Arab Saudi dan UEA memimpin longgarnya kuota. Saham energi Asia dan Indonesia terpantau tertekan; ANTM dan PTBA bisa terimbas negatif.",
    keyPoints: ["WTI USD 78", "+500K barel/hari", "Efek ke ANTM/PTBA"],
    sources: [
      { name: "Reuters", timeAgo: "2 jam lalu" },
      { name: "Bloomberg", timeAgo: "3 jam lalu" },
      { name: "Bisnis.com", timeAgo: "4 jam lalu" },
    ],
  },
  {
    id: "gl-china-pmi",
    category: "global",
    title: "China PMI manufaktur rebound ke 51,2, keluar dari kontraksi 3 bulan",
    summary:
      "China's official manufacturing PMI rebound ke 51,2 di Mei 2026 — di atas ekspektasi 50,5 dan keluar dari kontraksi 3 bulan. Kenaikan didorong oleh stimulus Beijing dan rebound ekspor. Indeks Hang Seng futures naik 1,4%; rupiah dan IHSG berpotensi terimbas positif lewat sentimen regional.",
    keyPoints: ["PMI 51,2", "Keluar kontraksi", "Hang Seng +1,4%"],
    sources: [
      { name: "Bloomberg", timeAgo: "4 jam lalu" },
      { name: "Reuters", timeAgo: "5 jam lalu" },
      { name: "Kontan", timeAgo: "6 jam lalu" },
    ],
  },
  {
    id: "gl-japan-yen",
    category: "global",
    title: "Yen menguat ke 148/USD, Bank of Japan lakukan intervensi verbal",
    summary:
      "Yen Jepang menguat 1,8% ke level 148/USD setelah Bank of Japan mengeluarkan komentar intervensi verbal. Wakil Gubernur Uchida menyebut spekulan \"akan menanggung konsekuensi\" jika yen terus melemah. Pasar Asia mengikuti, dengan Nikkei futures naik 0,9%. Investor Indonesia diminta waspadai volatilitas cross-rate USD/JPY.",
    keyPoints: ["JPY 148/USD", "BoJ intervensi verbal", "Nikkei futures +0,9%"],
    sources: [
      { name: "Reuters", timeAgo: "3 jam lalu" },
      { name: "Bloomberg", timeAgo: "4 jam lalu" },
      { name: "CNBC Indonesia", timeAgo: "5 jam lalu" },
    ],
  },
];

/** Filter helpers */
export function getStoriesByCategory(cat: NewsCategory): NewsStory[] {
  return newsStories.filter((s) => s.category === cat);
}

export function getStoryCounts(): Record<NewsCategory, number> {
  return {
    ekonomi: newsStories.filter((s) => s.category === "ekonomi").length,
    pemerintah: newsStories.filter((s) => s.category === "pemerintah").length,
    politik: newsStories.filter((s) => s.category === "politik").length,
    emiten: newsStories.filter((s) => s.category === "emiten").length,
    global: newsStories.filter((s) => s.category === "global").length,
  };
}

/** Most recent timestamp across all sources of a story. */
export function getLatestTime(story: NewsStory): string {
  // Sources are authored in time-desc order; first is the latest.
  return story.sources[0]?.timeAgo ?? "—";
}

/** Per-date news registry. Each date has its own curated set of aggregated
 *  stories so the date picker feels alive when scrolling back. */
export const newsStoriesByDate: Record<string, NewsStory[]> = {
  [TODAY_ISO]: newsStories,

  [YESTERDAY_ISO]: [
    {
      id: "ek-bi-rdg",
      category: "ekonomi",
      title: "BI gelar RDG bulanan, pasar tunggu sinyal kebijakan suku bunga",
      summary:
        "Bank Indonesia (BI) gelar Rapat Dewan Gubernur (RDG) bulanan untuk menentukan stance kebijakan moneter. Konsensus analis: 60% prediksi hold, 30% hawkish 25bps, 10% dovish cut. Pasar wait & see, volume transaksi tipis.",
      keyPoints: ["RDG BI Kamis", "Konsensus: hold 60%"],
      sources: [
        { name: "CNBC Indonesia", timeAgo: "1 jam lalu" },
        { name: "Kontan", timeAgo: "2 jam lalu" },
        { name: "Bloomberg", timeAgo: "3 jam lalu" },
      ],
    },
    {
      id: "ek-ihsg-sideways",
      category: "ekonomi",
      title: "IHSG sideways di 7.180, asing net sell Rp 45M",
      summary:
        "IHSG bergerak sideways di kisaran 7.150–7.200 pada sesi kemarin. Asing catat net sell tipis Rp 45 miliar, sementara institusi lokal mendominasi volume. Rupiah stabil di Rp 16.380/US$.",
      keyPoints: ["IHSG 7.180", "Net sell Rp 45M"],
      sources: [
        { name: "Bisnis.com", timeAgo: "4 jam lalu" },
        { name: "Kontan", timeAgo: "5 jam lalu" },
      ],
    },
    {
      id: "pm-rupiah",
      category: "pemerintah",
      title: "Rupiah stabil di Rp 16.380, BI perkuat intervensi",
      summary:
        "Bank Indonesia perkuat komitmen intervensi untuk jaga stabilitas rupiah di tengah ketidakpastian global. Cadangan devisa Mei tercatat USD 145 miliar, cukup untuk 6,5 bulan impor.",
      keyPoints: ["Rp 16.380", "Cadangan USD 145M"],
      sources: [
        { name: "Reuters", timeAgo: "3 jam lalu" },
        { name: "Bloomberg", timeAgo: "4 jam lalu" },
      ],
    },
    {
      id: "pl-pilkada-persiapan",
      category: "politik",
      title: "KPU mulai persiapan teknis pilkada 2027",
      summary:
        "Komisi Pemilihan Umum (KPU) mulai gelar rapat koordinasi internal untuk persiapan teknis pilkada serentak 2027. Anggaran dialokasikan Rp 4,2 triliun, fokus ke penguatan teknologi voting dan integrasi data pemilih.",
      keyPoints: ["Rp 4,2T anggaran", "Pilkada 2027"],
      sources: [
        { name: "CNN Indonesia", timeAgo: "2 jam lalu" },
        { name: "Kompas", timeAgo: "4 jam lalu" },
      ],
    },
    {
      id: "em-bbri-nim",
      category: "emiten",
      title: "BBRI rilis K1 2026: NIM 7,8% di atas konsensus, kredit UMKM +14%",
      summary:
        "Bank Rakyat Indonesia (BBRI) rilis kinerja K1 2026 dengan NIM 7,8% — di atas konsensus analis 7,6%. Kredit UMKM tumbuh 14% YoY menjadi penopang utama. Manajemen target NPL ratio di bawah 3%.",
      keyPoints: ["NIM 7,8%", "Kredit UMKM +14%"],
      sources: [
        { name: "CNBC Indonesia", timeAgo: "5 jam lalu" },
        { name: "Bisnis.com", timeAgo: "6 jam lalu" },
        { name: "Kontan", timeAgo: "7 jam lalu" },
      ],
    },
    {
      id: "em-bmri-rupslb",
      category: "emiten",
      title: "BMRI gelar RUPSLB restrukturisasi anak usaha",
      summary:
        "Bank Mandiri (BMRI) gelar RUPSLB untuk restrukturisasi anak usaha. Pasar merespons positif, saham ditutup +0,9%. Dividen yield diproyeksikan tetap menarik di 5,2% annualized.",
      keyPoints: ["RUPSLB restrukturisasi", "Dividen 5,2%"],
      sources: [
        { name: "CNBC Indonesia", timeAgo: "3 jam lalu" },
        { name: "Bisnis.com", timeAgo: "4 jam lalu" },
      ],
    },
    {
      id: "gl-fed-powell",
      category: "global",
      title: "Powell: \"Inflasi masih di atas target, kami sabar\"",
      summary:
        "Ketua The Fed Jerome Powell tekankan komitmen bank sentral untuk sabar dalam menurunkan inflasi. Pernyataan ini dovish tapi hati-hati, pasar saham AS ditutup mixed. Yield UST tenor 10 tahun stabil di 4,35%.",
      keyPoints: ["Sabar tunggu data", "UST 10Y 4,35%"],
      sources: [
        { name: "Bloomberg", timeAgo: "4 jam lalu" },
        { name: "Reuters", timeAgo: "5 jam lalu" },
      ],
    },
  ],

  [DAY_BEFORE_ISO]: [
    {
      id: "ek-rumah-subsidi",
      category: "ekonomi",
      title: "Pemerintah genjot pembangunan rumah subsidi 1 juta unit di 2026",
      summary:
        "Kementerian PUPR percepat program 1 juta rumah subsidi tahun 2026, dengan fokus ke kawasan industri dan pinggiran kota. Anggaran naik 18% YoY, diharapkan bisa menahan deflasi properti residensial.",
      keyPoints: ["1 juta unit", "Anggaran +18%"],
      sources: [
        { name: "Kompas", timeAgo: "5 jam lalu" },
        { name: "Bisnis.com", timeAgo: "6 jam lalu" },
        { name: "CNBC Indonesia", timeAgo: "7 jam lalu" },
      ],
    },
    {
      id: "ek-ihsg-rebound",
      category: "ekonomi",
      title: "IHSG rebound 0,6% ke 7.198, ditopang sektor konsumer & perbankan",
      summary:
        "IHSG rebound 0,6% ke 7.198 setelah dua sesi terkoreksi. Penguatan ditopang sektor konsumer (+1,2%) dan perbankan (+0,8%). Asing catat net buy Rp 180 miliar setelah 4 hari net sell berturut-turut.",
      keyPoints: ["IHSG 7.198", "Net buy Rp 180M"],
      sources: [
        { name: "CNBC Indonesia", timeAgo: "2 jam lalu" },
        { name: "Bisnis.com", timeAgo: "3 jam lalu" },
        { name: "Bloomberg", timeAgo: "4 jam lalu" },
      ],
    },
    {
      id: "pm-uu-cipta-kerja",
      category: "pemerintah",
      title: "Pemerintah revisi UU Cipta Kerja untuk tarik investasi asing",
      summary:
        "Pemerintah revisi UU Cipta Kerja untuk menarik lebih banyak investasi asing di sektor manufaktur. Poin revisi: kemudahan perizinan, tax holiday diperpanjang 5 tahun untuk high-tech investment, dan kepastian hukum jangka panjang.",
      keyPoints: ["Tax holiday +5Y", "Kemudahan perizinan"],
      sources: [
        { name: "Kontan", timeAgo: "3 jam lalu" },
        { name: "Bisnis.com", timeAgo: "4 jam lalu" },
        { name: "Reuters", timeAgo: "5 jam lalu" },
      ],
    },
    {
      id: "pl-mpr-amandemen",
      category: "politik",
      title: "MPR bahas amandemen terbatas UUD 1945, wacana MPR kembali dipilih rakyat",
      summary:
        "MPR gelar sidang paripurna membahas wacana amandemen terbatas UUD 1945. Salah satu poin: mekanisme pemilihan MPR dikembalikan ke rakyat, bukan lagi dipilih oleh DPR/DPD. Diskusi alot antar fraksi.",
      keyPoints: ["Amandemen terbatas", "MPR dipilih rakyat"],
      sources: [
        { name: "CNN Indonesia", timeAgo: "4 jam lalu" },
        { name: "Tempo", timeAgo: "5 jam lalu" },
        { name: "Kompas", timeAgo: "6 jam lalu" },
      ],
    },
    {
      id: "em-inko-downgrade",
      category: "emiten",
      title: "INCO pimpin pelemahan, analis UBS downgrade ke sell",
      summary:
        "Vale Indonesia (INCO) pimpin pelemahan di sektor tambang dengan koreksi 4,8%. Analis UBS downgrade rating dari neutral ke sell, target price dipangkas dari Rp 4.200 ke Rp 3.500. Kekhawatiran oversupply nikel global jadi sentimen utama.",
      keyPoints: ["Downgrade sell", "TP Rp 3.500"],
      sources: [
        { name: "Bloomberg", timeAgo: "3 jam lalu" },
        { name: "Reuters", timeAgo: "4 jam lalu" },
        { name: "CNBC Indonesia", timeAgo: "5 jam lalu" },
      ],
    },
    {
      id: "em-fren-rumor",
      category: "emiten",
      title: "Saham FREN rally +11,4% ditopang rumor akuisisi regional",
      summary:
        "Saham FREN rally signifikan +11,4% ditopang rumor akuisisi oleh operator regional. Manajemen belum memberikan komentar resmi. Saham small-cap dengan likuiditas tipis, pergerakan rentan dimanipulasi. Analis saran hold.",
      keyPoints: ["+11,4%", "Rumor akuisisi"],
      sources: [
        { name: "Kontan", timeAgo: "2 jam lalu" },
        { name: "Bisnis.com", timeAgo: "3 jam lalu" },
        { name: "Stockbit", timeAgo: "4 jam lalu" },
      ],
    },
    {
      id: "gl-china-pmi",
      category: "global",
      title: "China PMI manufaktur rebound ke 51,2, keluar dari kontraksi",
      summary:
        "China's official manufacturing PMI rebound ke 51,2 di Mei 2026 — di atas ekspektasi 50,5 dan keluar dari kontraksi 3 bulan. Kenaikan didorong oleh stimulus Beijing dan rebound ekspor. Hang Seng futures naik 1,4%.",
      keyPoints: ["PMI 51,2", "Hang Seng +1,4%"],
      sources: [
        { name: "Bloomberg", timeAgo: "5 jam lalu" },
        { name: "Reuters", timeAgo: "6 jam lalu" },
      ],
    },
  ],
};

/** Get aggregated news stories for a given ISO date. */
export function getNewsStoriesByDate(isoDate: string): NewsStory[] {
  return newsStoriesByDate[isoDate] ?? [];
}

/** Count stories per category for a given ISO date. */
export function getStoryCountsByDate(isoDate: string): Record<NewsCategory, number> {
  const stories = getNewsStoriesByDate(isoDate);
  return {
    ekonomi: stories.filter((s) => s.category === "ekonomi").length,
    pemerintah: stories.filter((s) => s.category === "pemerintah").length,
    politik: stories.filter((s) => s.category === "politik").length,
    emiten: stories.filter((s) => s.category === "emiten").length,
    global: stories.filter((s) => s.category === "global").length,
  };
}
