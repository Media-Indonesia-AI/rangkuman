import type { PolicyStatus } from "./policy-tracker";

/**
 * Mock related stories for each policy topic.
 * These power the "Lihat cerita" view on the detail page.
 * They are story-shaped (title, summary, timeAgo, sources) but DO NOT
 * need to match the /sorotan/[id]/ route — the detail page renders them inline.
 */

export interface PolicyStory {
  id: string;
  title: string;
  summary: string;
  timeAgo: string;
  date: string;
  sources: string[];
  /** Status that this story represents / reports on. */
  status?: PolicyStatus;
}

const TOPIC_STORIES: Record<string, PolicyStory[]> = {
  "kenaikan-bbm-subsidi": [
    {
      id: "hl-bbm-tolak-presiden",
      title: "Presiden Prabowo tolak kenaikan BBM, minta Pertamina efisiensi",
      summary:
        "Keputusan diambil setelah rapat terbatas semalam. Pertamina diminta pangkas biaya distribusi dan benahi subsidi tepat sasaran.",
      timeAgo: "2 jam lalu",
      date: "2026-06-07",
      sources: ["CNBC Indonesia", "Kompas", "Bisnis.com"],
      status: "rejected",
    },
    {
      id: "hl-bbm-demo-jakarta",
      title: "Demo tolak kenaikan BBM di 12 kota, 5.000an massa kumpul di Patung Kuda",
      summary:
        "Aksi massa gabungan buruh, mahasiswa, dan pengemudi ojol. Polri kerahkan 4.000 personel, lalu lintas tersendat 3 jam.",
      timeAgo: "5 hari lalu",
      date: "2026-06-05",
      sources: ["Tempo", "CNN Indonesia", "Detik"],
      status: "public_hearing",
    },
    {
      id: "hl-bbm-dpr-setujui",
      title: "DPR setujui kenaikan Pertamax Rp 3.500 & Pertalite Rp 2.000/liter",
      summary:
        "Rapat paripurna hasilnya 9 fraksi setuju, 4 menolak. PDIP dan PKS walkout. Berlaku 1 Juni jika disahkan presiden.",
      timeAgo: "3 minggu lalu",
      date: "2026-05-20",
      sources: ["Kontan", "Republika", "Bloomberg"],
      status: "dpr",
    },
    {
      id: "hl-bbm-ruu-dpr",
      title: "RUU kenaikan BBM diajukan, target tambah penerimaan Rp 24T",
      summary:
        "Pemerintah klaim kenaikan Pertamax ke Rp 14.200/liter dan Pertalite ke Rp 11.000/liter. Subsidi diproyeksi turun Rp 18T.",
      timeAgo: "2 bulan lalu",
      date: "2026-04-15",
      sources: ["Bisnis.com", "Reuters", "CNBC Indonesia"],
      status: "draft",
    },
  ],

  "ekspor-satu-pintu-dmo": [
    {
      id: "hl-ekspor-pp-18",
      title: "PP 18/2026 diteken: ekspor minerba wajib lewat BUMN mulai K3",
      summary:
        "Semua ekspor nikel, bauksit, dan konsentrat harus lewat 4 BUMN holding. Transisi 6 bulan,例外 untuk smelter domestik.",
      timeAgo: "4 jam lalu",
      date: "2026-06-08",
      sources: ["Bisnis.com", "Bloomberg", "Reuters"],
      status: "approved",
    },
    {
      id: "hl-ekspor-smelter",
      title: "Asosiasi smelter keberatan, minta masa transisi 12 bulan",
      summary:
        "APNI klaim 60% smelter belum terverifikasi. Pemerintah beri transisi 6 bulan, perpanjang bisa 12 bulan lewat rapat khusus.",
      timeAgo: "1 bulan lalu",
      date: "2026-05-15",
      sources: ["Kontan", "CNBC Indonesia"],
      status: "public_hearing",
    },
    {
      id: "hl-ekspor-ruu",
      title: "DPR sahkan RUU Minerba: ekspor 1 pintu, royalti nikel naik",
      summary:
        "Rapat paripurna hasilnya 8 fraksi setuju. Royalti nikel dari 5% ke 10%, bauksit ke 7,5%. Berlaku setelah PP turun.",
      timeAgo: "3 bulan lalu",
      date: "2026-03-10",
      sources: ["Bisnis.com", "Bloomberg"],
      status: "dpr",
    },
  ],

  "pajak-ekspor-mineral": [
    {
      id: "hl-pajak-permen",
      title: "Permen ESDM diteken: pajak ekspor nikel resmi 10%, bauksit 7,5%",
      summary:
        "Target tambahan penerimaan Rp 8,2 T per tahun. Mulai berlaku awal K3 2026, smelter dalam negeri tidak kena.",
      timeAgo: "1 hari lalu",
      date: "2026-06-06",
      sources: ["Kontan", "CNBC Indonesia", "Bloomberg"],
      status: "approved",
    },
    {
      id: "hl-pajak-konsultasi",
      title: "Asosiasi smelter konsultasi aturan transisi, antrian panjang izin出口",
      summary:
        "40+ smelter antre verifikasi, 12 sudah dapat sertifikat. 8 smelter nikel di Morowali dan Weda prioritas verifikasi cepat.",
      timeAgo: "3 minggu lalu",
      date: "2026-05-20",
      sources: ["Bisnis.com", "Kontan"],
      status: "public_hearing",
    },
    {
      id: "hl-pajak-dpr",
      title: "DPR setujui perubahan royalti minerba, selaras dengan RUU sebelumnya",
      summary:
        "Komisi VII DPR rapat 4 jam, hasilnya disahkan. Nikel 5% ke 10%, bauksit 5% ke 7,5%, tembaga tetap 4%.",
      timeAgo: "2 bulan lalu",
      date: "2026-04-08",
      sources: ["Kontan", "Republika"],
      status: "dpr",
    },
  ],

  "thr-karyawan-swasta": [
    {
      id: "thr-kemnaker-se",
      title: "Kemnaker rilis SE baru: THR wajib H-7, sanksi izin operasional",
      summary:
        "Surat edaran merevisi Permenaker 6/2026. Mulai berlaku Ramadhan 1447 H, perusahaan yang telat kena audit ketenagakerjaan.",
      timeAgo: "3 hari lalu",
      date: "2026-06-04",
      sources: ["Kompas", "CNN Indonesia", "Kontan"],
      status: "approved",
    },
    {
      id: "thr-batas-akhir",
      title: "Batas akhir pembayaran THR 2026: H-7 Lebaran",
      summary:
        "Kemnaker terima 142 laporan pelanggaran, 65 perusahaan kena sanksi administratif. Total 4,2 juta pekerja terima THR tepat waktu.",
      timeAgo: "2 bulan lalu",
      date: "2026-04-15",
      sources: ["Kontan", "Bisnis.com"],
      status: "approved",
    },
  ],

  "tapera-tabungan-perumahan": [
    {
      id: "hl-tapera-tunda-2027",
      title: "Pemerintah tunda Tapera sampai 2027, buruh tuntut kepastian",
      summary:
        "Keputusan setelah rapat terbatas. Belum ada jadwal pembahasan ulang. KSPI ancam mogok nasional jika diaktifkan lagi.",
      timeAgo: "1 minggu lalu",
      date: "2026-06-02",
      sources: ["Kompas", "Tempo", "CNN Indonesia"],
      status: "delayed",
    },
    {
      id: "hl-tapera-buruh-tolak",
      title: "Buruh tolak iuran 2,5%, KSPI siapkan gugatan ke PTUN",
      summary:
        "Said Iqbal: ini adalah pungutan liar yang menyamarkan pajak. APindo dukung, minta ada dialog tripartit sebelum berlaku.",
      timeAgo: "2 minggu lalu",
      date: "2026-05-25",
      sources: ["Tempo", "Detik", "Republika"],
      status: "rejected",
    },
    {
      id: "hl-tapera-pp-21",
      title: "PP 21/2024 diteken: Tapera berlaku 2025, iuran 2,5% dari gaji",
      summary:
        "Iuran pekerja 0,5%, pemberi kerja 1,5%, pemerintah 0,5% (FLPP). Target 60 juta peserta dalam 5 tahun.",
      timeAgo: "2 tahun lalu",
      date: "2024-05-20",
      sources: ["Bisnis.com", "Kontan"],
      status: "approved",
    },
  ],

  "pajak-digital-pmse": [
    {
      id: "hl-pmse-shopee-tokped",
      title: "Shopee & Tokopedia patuh PMSE, setor PPN Rp 1,2 T K1 2026",
      summary:
        "DJP klaim 73% perusahaan PMSE sudah patuh. 4 perusahaan masih negosiasi: Lazada, TikTok Shop, Meta, Google.",
      timeAgo: "6 jam lalu",
      date: "2026-06-07",
      sources: ["Bisnis.com", "Kontan", "Reuters"],
      status: "approved",
    },
    {
      id: "hl-pmse-negosiasi",
      title: "DJP konsultasi 4 perusahaan, warning soal sandbox terbatas",
      summary:
        "Lazada dan TikTok Shop ajukan skema PPN dipungut merchant. Meta dan Google negosiasi tarif 11% untuk iklan digital.",
      timeAgo: "1 minggu lalu",
      date: "2026-05-30",
      sources: ["Kontan", "CNBC Indonesia"],
      status: "public_hearing",
    },
    {
      id: "hl-pmse-berlaku",
      title: "PMSE berlaku Januari 2026, 11 perusahaan domisili luar wajib pungut PPN",
      summary:
        "Peraturan Menteri Keuangan 48/2025. Target penerimaan Rp 6,8 T di 2026, naik ke Rp 12 T di 2027.",
      timeAgo: "5 bulan lalu",
      date: "2026-01-01",
      sources: ["Bisnis.com", "Bloomberg"],
      status: "approved",
    },
  ],

  "subsidi-lpg-3kg": [
    {
      id: "hl-lpg-tunda-panja",
      title: "DPR tunda rapat panja konversi LPG 3 Kg, target Q4 molor ke 2027",
      summary:
        "Panja belum capai kuorum, 5 fraksi walkout. ESDM klaim perlu data lapangan dari 5 kota percontohan dulu.",
      timeAgo: "2 hari lalu",
      date: "2026-06-05",
      sources: ["Kontan", "Tempo", "Republika"],
      status: "dpr",
    },
    {
      id: "hl-lpg-uji-5kota",
      title: "ESDM uji konversi LPG ke kompor listrik di 5 kota percontohan",
      summary:
        "Surabaya, Semarang, Makassar, Medan, Denpasar jadi pilot. 25.000 RT dapat kompor + instalasi gratis. Hasil evaluasi K4 2026.",
      timeAgo: "1 bulan lalu",
      date: "2026-05-12",
      sources: ["Bisnis.com", "Kompas"],
      status: "public_hearing",
    },
    {
      id: "hl-lpg-prolegnas",
      title: "RUU konversi LPG 3 Kg masuk Prolegnas 2026, prioritas 78",
      summary:
        "Komisi VII DPR terima DIM RUU dari pemerintah. Target konversi 5,8 juta RT dalam 3 tahun, alokasi subsidi Rp 32 T.",
      timeAgo: "3 bulan lalu",
      date: "2026-03-15",
      sources: ["Kontan", "CNN Indonesia"],
      status: "dpr",
    },
  ],

  "subsidi-pln-kompor-listrik": [
    {
      id: "hl-pln-subsidi-naik",
      title: "Alokasi subsidi PLN naik 12%, Rp 87 T untuk kompor listrik + listrik pintar",
      summary:
        "APBN-P 2026 alokasikan tambahan Rp 9,4 T. PLN target konversi 1,8 juta RT ke kompor listrik sampai akhir 2026.",
      timeAgo: "1 hari lalu",
      date: "2026-06-06",
      sources: ["Kontan", "Bisnis.com", "Bloomberg"],
      status: "approved",
    },
    {
      id: "hl-pln-molor-q2",
      title: "Q2 molor: PLN perpanjang target konversi kompor listrik",
      summary:
        "Hanya 350 ribu RT yang terkonversi dari target 600 ribu. PLN: distribusi kompor lambat, izin SMB molor.",
      timeAgo: "3 minggu lalu",
      date: "2026-05-20",
      sources: ["Bisnis.com", "Republika"],
      status: "delayed",
    },
  ],
};

export function getStoriesForTopic(slug: string): PolicyStory[] {
  return TOPIC_STORIES[slug] ?? [];
}
