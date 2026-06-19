export interface BeritaIndividual {
  id: string;
  recapId: string;
  media: string;
  judulAsli: string;
  /** 1-kalimat inti/gist of the article. */
  inti: string;
  url: string;
}

/**
 * Hand-curated articles for the recaps reachable from the demo. Each
 * recap has 3-6 articles whose `media` matches the breakdown in
 * `recaps.ts`. URLs are realistic-looking but obviously fake.
 */
export const articles: BeritaIndividual[] = [
  // ── BBCA · 2026-06-07 (7 articles) ─────────────────────────────
  {
    id: "a-bbca-07-cnbc-1",
    recapId: "r-bbca-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "BBCA Cetak Laba Rp 12,5 T di K1 2026, Naik 11% YoY",
    inti: "Pertumbuhan ditopang kredit korporasi dan transaksi digital, dengan NIM stabil di 5,4%.",
    url: "https://www.cnbcindonesia.com/market/20260607/bbca-laba-k1-2026",
  },
  {
    id: "a-bbca-07-cnbc-2",
    recapId: "r-bbca-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Dividen Interim BBCA Rp 200/Saham, Cum Date 18 Juni",
    inti: "Payout ratio 45%, di atas rata-rata industri dan mencerminkan keyakinan manajemen.",
    url: "https://www.cnbcindonesia.com/market/20260607/bbca-dividen-interim",
  },
  {
    id: "a-bbca-07-bisnis",
    recapId: "r-bbca-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "Analis Rekomendasi Buy BBCA, Target Price Rp 10.500",
    inti: "Setidaknya 4 sekuritas mempertahankan rekomendasi buy dengan rata-rata upside 8%.",
    url: "https://bisnis.com/2026/06/07/bbca-rekomendasi-buy-target-10500",
  },
  {
    id: "a-bbca-07-kontan",
    recapId: "r-bbca-2026-06-07",
    media: "Kontan",
    judulAsli: "BBCA Tambah Cadangan Rp 1,2 T untuk Kredit Korporasi",
    inti: "Bank tetap konservatif menutupi eksposur sektor properti dan konstruksi.",
    url: "https://www.kontan.co.id/news/bbca-cadangan-kredit-korporasi",
  },
  {
    id: "a-bbca-07-bloomberg",
    recapId: "r-bbca-2026-06-07",
    media: "Bloomberg",
    judulAsli: "Djarum Group Raises Stake in BBCA to 15.2%",
    inti: "Pembelian bertahap oleh keluarga Hartono menambah keyakinan investor ritel.",
    url: "https://www.bloomberg.com/news/2026-06-07/djarum-bbca-stake",
  },
  {
    id: "a-bbca-07-investing",
    recapId: "r-bbca-2026-06-07",
    media: "Investing.com",
    judulAsli: "BBCA Technical: Bullish Continuation di Area 9.800",
    inti: "Saham bertahan di atas MA-50 dengan target berikutnya 10.200; support kuat 9.650.",
    url: "https://www.investing.com/news/bbca-technical-june-2026",
  },
  {
    id: "a-bbca-07-bareksa",
    recapId: "r-bbca-2026-06-07",
    media: "Bareksa",
    judulAsli: "Reksa Dana Saham BBCA: Alokasi Naik 3% di Mei",
    inti: "Manager reksa dana mulai akumulasi BBCA setelah pelemahan empat minggu sebelumnya.",
    url: "https://bareksa.com/berita/reksa-dana-saham-bbca-mei-2026",
  },

  // ── TLKM · 2026-06-07 (5 articles) ────────────────────────────
  {
    id: "a-tlkm-07-cnbc",
    recapId: "r-tlkm-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Indihome ARPU Tembus Rp 285 Ribu, Tertinggi 3 Tahun",
    inti: "Kenaikan didorong migrasi paket kecepatan lebih tinggi dan cross-sell konten.",
    url: "https://www.cnbcindonesia.com/telco/20260607/indihome-arpu-3-tahun",
  },
  {
    id: "a-tlkm-07-bisnis",
    recapId: "r-tlkm-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "Telkom Buka Data Center Hyperscale di Cikarang Kuartal III",
    inti: "Fasilitas 60 MW ditargetkan melayani 3 anchor tenant enterprise Asia Tenggara.",
    url: "https://bisnis.com/2026/06/07/telkom-data-center-cikarang",
  },
  {
    id: "a-tlkm-07-kontan",
    recapId: "r-tlkm-2026-06-07",
    media: "Kontan",
    judulAsli: "Fixed Broadband TLKM Tumbuh 4,1% YoY di Mei",
    inti: "Pertumbuhan positif ditopang program bundling dengan Disney+ dan Netflix.",
    url: "https://www.kontan.co.id/news/tlkm-broadband-mei-2026",
  },
  {
    id: "a-tlkm-07-reuters",
    recapId: "r-tlkm-2026-06-07",
    media: "Reuters",
    judulAsli: "Telkom in Talks With Asian Hyperscaler for Cikarang Site",
    inti: "Sumber menyebut negosiasi tahap akhir, kontrak 10 tahun dengan revenue minimal USD 80 juta/tahun.",
    url: "https://www.reuters.com/business/telkom-hyperscaler-2026-06-07",
  },
  {
    id: "a-tlkm-07-ipot",
    recapId: "r-tlkm-2026-06-07",
    media: "IPOT",
    judulAsli: "TLKM Dijagokan Masuk Watchlist Komunitas Investor Q3 2026",
    inti: "Survei internal IPOT menunjukkan TLKM naik ke posisi #4 dari #8 di Q2.",
    url: "https://ipotnews.com/tlkm-watchlist-q3-2026",
  },

  // ── ANTM · 2026-06-07 (6 articles) ────────────────────────────
  {
    id: "a-antm-07-bloomberg",
    recapId: "r-antm-2026-06-07",
    media: "Bloomberg",
    judulAsli: "Nickel Prices Drop 4% as Indonesia Supply Fears Ease",
    inti: "Sentimen membaik setelah kepastian ekspor dari Morowali, nikel LME turun ke USD 17.200/ton.",
    url: "https://www.bloomberg.com/news/2026-06-07/nickel-4-percent",
  },
  {
    id: "a-antm-07-reuters",
    recapId: "r-antm-2026-06-07",
    media: "Reuters",
    judulAsli: "ANTM Slumps 5% on Nickel Oversupply Worries",
    inti: "Volume jual institusi melonjak, free float terkuras hampir 2% di sesi I.",
    url: "https://www.reuters.com/markets/asia/antm-slumps-2026-06-07",
  },
  {
    id: "a-antm-07-cnbc",
    recapId: "r-antm-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Investor Hati-Hati, ANTM Tertekan Nikel dan Wacana RKAB",
    inti: "Ekspektasi moratorium RKAB membuat saham ANTM dan INCO kompak tertekan.",
    url: "https://www.cnbcindonesia.com/market/20260607/antm-rkab",
  },
  {
    id: "a-antm-07-bisnis",
    recapId: "r-antm-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "Penjualan Bijih Nikel ANTM Naik 8% YoY di K1 2026",
    inti: "Di balik tekanan harga, volume produksi dan penjualan masih tumbuh positif.",
    url: "https://bisnis.com/2026/06/07/antm-penjualan-bijih-k1",
  },
  {
    id: "a-antm-07-kontan",
    recapId: "r-antm-2026-06-07",
    media: "Kontan",
    judulAsli: "Rekomendasi Saham ANTM: Sell on Strength, Target Rp 1.700",
    inti: "Analis merekomendasikan jual dengan target turun 6% dari level penutupan kemarin.",
    url: "https://www.kontan.co.id/news/rekomendasi-antm-jun-2026",
  },
  {
    id: "a-antm-07-investing",
    recapId: "r-antm-2026-06-07",
    media: "Investing.com",
    judulAsli: "ANTM Breaks Below 50-Day Moving Average on Heavy Volume",
    inti: "Pola teknikal mengindikasikan support berikutnya di area 1.760-1.780.",
    url: "https://www.investing.com/news/antm-technical-2026-06-07",
  },

  // ── GOTO · 2026-06-07 (4 articles) ────────────────────────────
  {
    id: "a-goto-07-cnbc",
    recapId: "r-goto-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Kontribusi Layanan Finansial GOTO Naik 38% YoY di K1",
    inti: "GoPay dan Mitra compensating growth di merchant yang masih lemah.",
    url: "https://www.cnbcindonesia.com/tech/20260607/goto-finansial-38-persen",
  },
  {
    id: "a-goto-07-bisnis",
    recapId: "r-goto-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "GOTO Pertahankan Target EBITDA Positif Akhir FY26",
    inti: "Manajemen optimistis setelah Q1 mencatat rugi bersih turun 42% YoY.",
    url: "https://bisnis.com/2026/06/07/goto-target-ebitda-fy26",
  },
  {
    id: "a-goto-07-kontan",
    recapId: "r-goto-2026-06-07",
    media: "Kontan",
    judulAsli: "GOTO Tutup Sesi Flat di Rp 78, Volume Moderat",
    inti: "Investor menunggu hasil RUPS yang diagendakan akhir bulan ini.",
    url: "https://www.kontan.co.id/news/goto-rups-juni-2026",
  },
  {
    id: "a-goto-07-stockbit",
    recapId: "r-goto-2026-06-07",
    media: "Stockbit",
    judulAsli: "Diskusi GOTO: Antara Penggemar Bull Case dan Keraguan Fundamental",
    inti: "Sentimen retail terbelah, sentimen teknikal dominasi trader harian.",
    url: "https://stockbit.com/discussion/goto-jun-2026",
  },

  // ── ASII · 2026-06-07 (4 articles) ────────────────────────────
  {
    id: "a-asii-07-cnbc",
    recapId: "r-asii-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Penjualan Mobil Nasional Turun 6% YoY di Mei",
    inti: "Penurunan terbesar dari segmen niaga, mobil penumpang relatif tahan.",
    url: "https://www.cnbcindonesia.com/otomotif/20260607/wholesales-mei-2026",
  },
  {
    id: "a-asii-07-bisnis",
    recapId: "r-asii-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "Jasa Keuangan Astra Tetap Tumbuh 12%, Topang Laba",
    inti: "Kredit konsumen dan UMKM menjadi penopang di tengah koreksi mobil.",
    url: "https://bisnis.com/2026/06/07/astra-jasa-keuangan-12-persen",
  },
  {
    id: "a-asii-07-kontan",
    recapId: "r-asii-2026-06-07",
    media: "Kontan",
    judulAsli: "ASII: Target Price Rata-Rata di Rp 6.200",
    inti: "Setidaknya 5 analis mempertahankan rekomendasi netral, dengan 2 di antaranya upgrade ke buy.",
    url: "https://www.kontan.co.id/news/asii-target-price-jun-2026",
  },
  {
    id: "a-asii-07-ipot",
    recapId: "r-asii-2026-06-07",
    media: "IPOT",
    judulAsli: "ASII Turun 1,4%, Pelaku Pasar Ambil Untung",
    inti: "Saham menyentuh area resistance Rp 5.250 dan terkoreksi sehat.",
    url: "https://ipotnews.com/asii-jun-2026",
  },

  // ── UNVR · 2026-06-07 (3 articles) ────────────────────────────
  {
    id: "a-unvr-07-cnbc",
    recapId: "r-unvr-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "Unilever Indonesia Rebound 2,1% Setelah Parent Buyback",
    inti: "Sinyal positif dari group memberi harapan distribusi kembali ke pasar lokal.",
    url: "https://www.cnbcindonesia.com/market/20260607/unvr-buyback-region",
  },
  {
    id: "a-unvr-07-kontan",
    recapId: "r-unvr-2026-06-07",
    media: "Kontan",
    judulAsli: "Volume UNVR Tipis, Dominasi Retail",
    inti: "Akumulasi didominasi investor ritel, institusi masih wait and see.",
    url: "https://www.kontan.co.id/news/unvr-volume-tipis",
  },
  {
    id: "a-unvr-07-reuters",
    recapId: "r-unvr-2026-06-07",
    media: "Reuters",
    judulAsli: "Unilever PLC to Buy Back Up to GBP 1.5B Shares",
    inti: "Pengumuman regional langsung berdampak positif ke UNVR meski tidak di-cover spesifik.",
    url: "https://www.reuters.com/business/unilever-buyback-2026-06-07",
  },

  // ── MDKA · 2026-06-07 (3 articles) ────────────────────────────
  {
    id: "a-mdka-07-bloomberg",
    recapId: "r-mdka-2026-06-07",
    media: "Bloomberg",
    judulAsli: "MDKA Gold Output on Track; Copper LME Slips 1.8%",
    inti: "Tembaga tertekan permintaan China yang melambat, produksi emas TFK sesuai target.",
    url: "https://www.bloomberg.com/news/2026-06-07/mdka-output-jun",
  },
  {
    id: "a-mdka-07-cnbc",
    recapId: "r-mdka-2026-06-07",
    media: "CNBC Indonesia",
    judulAsli: "MDKA Tutup Mixed, Reaffirm Capex USD 380 Juta",
    inti: "Ekspansi Wetar dan Toho jadi katalis jangka menengah.",
    url: "https://www.cnbcindonesia.com/market/20260607/mdka-capex-380-juta",
  },
  {
    id: "a-mdka-07-bisnis",
    recapId: "r-mdka-2026-06-07",
    media: "Bisnis.com",
    judulAsli: "Saham MDKA Ditutup Menguat Tipis 0,4%",
    inti: "Aksi bargain hunting di area 2.380 menopang pergerakan sore.",
    url: "https://bisnis.com/2026/06/07/mdka-bargain-hunting",
  },

  // ── BBCA · 2026-06-06 (4 articles) ────────────────────────────
  {
    id: "a-bbca-06-cnbc",
    recapId: "r-bbca-2026-06-06",
    media: "CNBC Indonesia",
    judulAsli: "BBCA Tunggu Rilis Kinerja, Investor Konsolidasi Posisi",
    inti: "Saham ditutup flat Rp 9.875, pasar tunggu data akhir bulan.",
    url: "https://www.cnbcindonesia.com/market/20260606/bbca-konsolidasi",
  },
  {
    id: "a-bbca-06-bisnis",
    recapId: "r-bbca-2026-06-06",
    media: "Bisnis.com",
    judulAsli: "BI Tahan Suku Bunga di 6%, Sektor Perbankan Diuntungkan",
    inti: "Spread bunga simpan-pinjam diprediksi makin lebar, sentimen positif perbankan.",
    url: "https://bisnis.com/2026/06/06/bi-suku-bunga-6-persen",
  },
  {
    id: "a-bbca-06-kontan",
    recapId: "r-bbca-2026-06-06",
    media: "Kontan",
    judulAsli: "Asing Net Buy BBCA Rp 215 M di Pekan Ini",
    inti: "Akumulasi asing memperkuat ekspektasi window dressing akhir semester.",
    url: "https://www.kontan.co.id/news/asing-net-buy-bbca-pekan",
  },
  {
    id: "a-bbca-06-bareksa",
    recapId: "r-bbca-2026-06-06",
    media: "Bareksa",
    judulAsli: "Reksa Dana Pendapatan Tetap Masih Dominasi, Saham BBCA Sideways",
    inti: "Manajer reksa dana menunggu rilis kinerja baru untuk repositioning.",
    url: "https://bareksa.com/berita/reksa-dana-bbca-jun-2026",
  },

  // ── TLKM · 2026-06-06 (3 articles) ────────────────────────────
  {
    id: "a-tlkm-06-reuters",
    recapId: "r-tlkm-2026-06-06",
    media: "Reuters",
    judulAsli: "Telkom in Talks With Asian Hyperscaler for Cikarang Site",
    inti: "Kontrak 10 tahun dengan revenue minimal USD 80 juta per tahun.",
    url: "https://www.reuters.com/business/telkom-hyperscaler-2026-06-06",
  },
  {
    id: "a-tlkm-06-bloomberg",
    recapId: "r-tlkm-2026-06-06",
    media: "Bloomberg",
    judulAsli: "JP Morgan Overweight TLKM, Target Price Rp 4.200",
    inti: "Risiko utama: belanja modal lebih tinggi dari guidance.",
    url: "https://www.bloomberg.com/news/2026-06-06/tlkm-jpmorgan",
  },
  {
    id: "a-tlkm-06-bisnis",
    recapId: "r-tlkm-2026-06-06",
    media: "Bisnis.com",
    judulAsli: "TLKM Naik 1,9% di Tengah Isu Kemitraan Hyperscaler",
    inti: "Investor menunggu konfirmasi resmi dari emiten.",
    url: "https://bisnis.com/2026/06/06/tlkm-hyperscaler-jun",
  },

  // ── ICBP · 2026-06-06 (3 articles) ────────────────────────────
  {
    id: "a-icbp-06-bloomberg",
    recapId: "r-icbp-2026-06-06",
    media: "Bloomberg",
    judulAsli: "Macquarie Cuts ICBP Target to Rp 11.800 on Wheat Costs",
    inti: "Margin tertekan harga gandum impor, saham konsumer tertekan merata.",
    url: "https://www.bloomberg.com/news/2026-06-06/icbp-macquarie",
  },
  {
    id: "a-icbp-06-cnbc",
    recapId: "r-icbp-2026-06-06",
    media: "CNBC Indonesia",
    judulAsli: "ICBP Turun 1,8%, Saham Konsumer Kompak Melemah",
    inti: "UNVR dan INDF ikut tertekan di sesi yang sama.",
    url: "https://www.cnbcindonesia.com/market/20260606/icbp-turun",
  },
  {
    id: "a-icbp-06-kontan",
    recapId: "r-icbp-2026-06-06",
    media: "Kontan",
    judulAsli: "Saham Konsumer Catat Net Sell Terbesar Pekan Ini",
    inti: "Investor institusi mengurangi eksposur pada barang konsumsi primer.",
    url: "https://www.kontan.co.id/news/konsumer-net-sell-pekan",
  },

  // ── BBRI · 2026-06-06 (3 articles) ────────────────────────────
  {
    id: "a-bbri-06-cnbc",
    recapId: "r-bbri-2026-06-06",
    media: "CNBC Indonesia",
    judulAsli: "BBRI NIM 7,8% di K1 2026, Di Atas Konsensus",
    inti: "Kredit UMKM tumbuh 14% YoY jadi penopang utama.",
    url: "https://www.cnbcindonesia.com/market/20260606/bbri-nim-7-8",
  },
  {
    id: "a-bbri-06-bisnis",
    recapId: "r-bbri-2026-06-06",
    media: "Bisnis.com",
    judulAsli: "BBRI Tutup +1,4%, Target NPL Tetap di Bawah 3%",
    inti: "Manajemen tetap konservatif pada eksposur kredit konsumsi.",
    url: "https://bisnis.com/2026/06/06/bbri-npl-3-persen",
  },
  {
    id: "a-bbri-06-kontan",
    recapId: "r-bbri-2026-06-06",
    media: "Kontan",
    judulAsli: "BBRI Akumulasi Asing, Saham Perbankan Jadi Pilihan Jangka Pendek",
    inti: "Window dressing akhir semester menopang aksi beli institusi.",
    url: "https://www.kontan.co.id/news/bbri-window-dressing",
  },

  // ── BMRI · 2026-06-06 (2 articles) ────────────────────────────
  {
    id: "a-bmri-06-cnbc",
    recapId: "r-bmri-2026-06-06",
    media: "CNBC Indonesia",
    judulAsli: "BMRI Umumkan RUPSLB Restrukturisasi Anak Usaha",
    inti: "Pasar merespons positif, saham ditutup +0,9%.",
    url: "https://www.cnbcindonesia.com/market/20260606/bmri-rupslb",
  },
  {
    id: "a-bmri-06-bisnis",
    recapId: "r-bmri-2026-06-06",
    media: "Bisnis.com",
    judulAsli: "BMRI Dividen Yield Diproyeksi 5,2% Annualized",
    inti: "Payout ratio 60% menjadi yang tertinggi di antara bank BUMN besar.",
    url: "https://bisnis.com/2026/06/06/bmri-dividen-yield-5-2",
  },
];

/** All articles attached to one recap, in their original order. */
export function getArticlesByRecapId(recapId: string): BeritaIndividual[] {
  return articles.filter((a) => a.recapId === recapId);
}

/** Group articles under a recap by media outlet. */
export function groupArticlesByMedia(
  recapId: string,
): { media: string; items: BeritaIndividual[] }[] {
  const map = new Map<string, BeritaIndividual[]>();
  for (const a of articles) {
    if (a.recapId !== recapId) continue;
    const arr = map.get(a.media) ?? [];
    arr.push(a);
    map.set(a.media, arr);
  }
  return Array.from(map.entries()).map(([media, items]) => ({ media, items }));
}