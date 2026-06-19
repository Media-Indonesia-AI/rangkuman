/**
 * PolicyTracker — trending Indonesian policy topics with status & timeline.
 *
 * Design intent: replace the static "Kalender Regulasi" with a live status
 * board. Each topic shows:
 * - Where the discussion currently stands (status)
 * - How it got there (mini timeline)
 * - How much coverage it's getting (story count)
 * - Which sectors are affected
 * - Quick links to related stories
 */

export type PolicyStatus =
  | "draft" // 🟡 RUU / rancangan awal
  | "dpr" // 🔵 Dalam pembahasan DPR
  | "public_hearing" // 🟣 Uji publik / konsultasi
  | "approved" // 🟢 Disahkan / berlaku
  | "delayed" // 🟠 Ditunda
  | "rejected"; // 🔴 Ditolak

export interface PolicyEvent {
  /** Status this event represents. */
  status: PolicyStatus;
  /** Human label, e.g. "DPR setujui". */
  label: string;
  /** ISO date. */
  date: string;
  /** Relative time for display, e.g. "2 hari lalu". */
  timeAgo: string;
}

export interface PolicyTopic {
  id: string;
  topic: string; // "Kenaikan BBM Subsidi"
  slug: string; // for URL fragments
  brief: string; // 1-sentence summary
  currentStatus: PolicyStatus;
  currentStatusLabel: string; // "Ditolak Presiden"
  /** Most recent event. */
  lastEventLabel: string; // "Demo masif"
  lastUpdateTimeAgo: string; // "2 jam lalu"
  storyCount: number;
  affectedSectors: string[];
  /** Mini timeline — most recent 3-4 events. */
  timeline: PolicyEvent[];
  /** Story slugs/IDs to link to. */
  relatedStoryIds: string[];
}

const STATUS_META: Record<PolicyStatus, { label: string; color: string; dot: string }> = {
  draft: {
    label: "Rancangan",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  dpr: {
    label: "Pembahasan DPR",
    color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-700",
    dot: "bg-blue-500",
  },
  public_hearing: {
    label: "Uji Publik",
    color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-700",
    dot: "bg-purple-500",
  },
  approved: {
    label: "Disahkan",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  delayed: {
    label: "Ditunda",
    color: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-700",
    dot: "bg-orange-500",
  },
  rejected: {
    label: "Ditolak",
    color: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-700",
    dot: "bg-rose-500",
  },
};

export function getPolicyStatusMeta(status: PolicyStatus) {
  return STATUS_META[status];
}

export const POLICY_TOPICS: PolicyTopic[] = [
  {
    id: "topic-bbm",
    topic: "Kenaikan BBM Subsidi",
    slug: "kenaikan-bbm-subsidi",
    brief:
      "Rencana kenaikan Pertamax dan Pertalite Rp 2.000-3.500/liter. Ditolak setelah demo masif Mei lalu.",
    currentStatus: "rejected",
    currentStatusLabel: "Ditolak Presiden",
    lastEventLabel: "Demo masif di 12 kota",
    lastUpdateTimeAgo: "2 jam lalu",
    storyCount: 12,
    affectedSectors: ["Energi", "Subsidi", "Konsumen", "Transportasi"],
    timeline: [
      { status: "rejected", label: "Presiden tolak kenaikan", date: "2026-06-07", timeAgo: "2 hari lalu" },
      { status: "public_hearing", label: "Demo masif di 12 kota", date: "2026-06-05", timeAgo: "5 hari lalu" },
      { status: "dpr", label: "DPR setujui kenaikan", date: "2026-05-20", timeAgo: "3 minggu lalu" },
      { status: "draft", label: "RUU diajukan ke DPR", date: "2026-04-15", timeAgo: "2 bulan lalu" },
    ],
    relatedStoryIds: ["hl-bbm-naik", "hl-demo-bbm"],
  },
  {
    id: "topic-ekspor-1pintu",
    topic: "Ekspor 1 Pintu (DMO)",
    slug: "ekspor-satu-pintu-dmo",
    brief:
      "Wajibkan semua ekspor minerba lewat BUMN. Mulai berlaku Q3 2026 setelah masa transisi 6 bulan.",
    currentStatus: "approved",
    currentStatusLabel: "Berlaku Q3 2026",
    lastEventLabel: "PP 18/2026 diteken",
    lastUpdateTimeAgo: "4 jam lalu",
    storyCount: 8,
    affectedSectors: ["Pertambangan", "Nikel", "BUMN", "Ekspor"],
    timeline: [
      { status: "approved", label: "PP 18/2026 diteken", date: "2026-06-08", timeAgo: "4 jam lalu" },
      { status: "public_hearing", label: "Masa transisi 6 bulan", date: "2026-05-15", timeAgo: "1 bulan lalu" },
      { status: "dpr", label: "DPR sahkan RUU Minerba", date: "2026-03-10", timeAgo: "3 bulan lalu" },
    ],
    relatedStoryIds: ["hl-ekspor-1pintu"],
  },
  {
    id: "topic-pajak-ekspor",
    topic: "Pajak Ekspor Mineral",
    slug: "pajak-ekspor-mineral",
    brief:
      "Royalty nikel naik dari 5% ke 10%, bauksit 7,5%. Berlaku K3 2026, target tambah penerimaan Rp 8,2 T.",
    currentStatus: "approved",
    currentStatusLabel: "Berlaku K3 2026",
    lastEventLabel: "Peraturan Menteri ditandatangani",
    lastUpdateTimeAgo: "1 hari lalu",
    storyCount: 6,
    affectedSectors: ["Pertambangan", "Nikel", "APBN", "Smelter"],
    timeline: [
      { status: "approved", label: "Permen ESDM ditandatangani", date: "2026-06-06", timeAgo: "1 hari lalu" },
      { status: "public_hearing", label: "Konsultasi industri smelter", date: "2026-05-20", timeAgo: "3 minggu lalu" },
      { status: "dpr", label: "DPR setujui perubahan", date: "2026-04-08", timeAgo: "2 bulan lalu" },
    ],
    relatedStoryIds: ["hl-pajak-ekspor"],
  },
  {
    id: "topic-thr",
    topic: "THR Karyawan Swasta",
    slug: "thr-karyawan-swasta",
    brief:
      "THR wajib dibayar H-7 Lebaran. Sanksi administratif hingga pencabutan izin operasional.",
    currentStatus: "approved",
    currentStatusLabel: "Berlaku tiap Lebaran",
    lastEventLabel: "Kemnaker rilis SE baru",
    lastUpdateTimeAgo: "3 hari lalu",
    storyCount: 9,
    affectedSectors: ["Ketenagakerjaan", "UMR", "Swasta", "Konsumen"],
    timeline: [
      { status: "approved", label: "Kemnaker rilis SE baru", date: "2026-06-04", timeAgo: "3 hari lalu" },
      { status: "approved", label: "Batas akhir pembayaran", date: "2026-04-15", timeAgo: "2 bulan lalu" },
    ],
    relatedStoryIds: ["hl-thr-2026"],
  },
  {
    id: "topic-tapera",
    topic: "Tapera (Tabungan Perumahan)",
    slug: "tapera-tabungan-perumahan",
    brief:
      "Iuran Tapera 2,5% dari gaji. Ditunda sampai 2027, belum ada jadwal pembahasan ulang.",
    currentStatus: "delayed",
    currentStatusLabel: "Ditunda ke 2027",
    lastEventLabel: "Demo buruh & demo pekerja",
    lastUpdateTimeAgo: "1 minggu lalu",
    storyCount: 14,
    affectedSectors: ["Perumahan", "Ketenagakerjaan", "Bank", "Konstruksi"],
    timeline: [
      { status: "delayed", label: "Pemerintah tunda ke 2027", date: "2026-06-02", timeAgo: "1 minggu lalu" },
      { status: "rejected", label: "Buruh tolak iuran 2,5%", date: "2026-05-25", timeAgo: "2 minggu lalu" },
      { status: "approved", label: "PP Tapera 21/2024 diteken", date: "2024-05-20", timeAgo: "2 tahun lalu" },
    ],
    relatedStoryIds: ["hl-tapera-tunda"],
  },
  {
    id: "topic-pmse",
    topic: "Pajak Digital PMSE",
    slug: "pajak-digital-pmse",
    brief:
      "Pajak 11% untuk marketplace, OTT, dan game. 11 perusahaan sudah patuh, negosiasi 4 lagi.",
    currentStatus: "approved",
    currentStatusLabel: "Berlaku, kepatuhan 73%",
    lastEventLabel: "Shopee & Tokopedia bayar",
    lastUpdateTimeAgo: "6 jam lalu",
    storyCount: 11,
    affectedSectors: ["Digital", "Marketplace", "E-commerce", "APBN"],
    timeline: [
      { status: "approved", label: "Shopee & Tokopedia patuh", date: "2026-06-07", timeAgo: "6 jam lalu" },
      { status: "public_hearing", label: "Konsultasi 4 perusahaan", date: "2026-05-30", timeAgo: "1 minggu lalu" },
      { status: "approved", label: "PMSE berlaku Januari", date: "2026-01-01", timeAgo: "5 bulan lalu" },
    ],
    relatedStoryIds: ["hl-pmse-11"],
  },
  {
    id: "topic-lpg",
    topic: "Subsidi LPG 3 Kg",
    slug: "subsidi-lpg-3kg",
    brief:
      "RUU konversi LPG 3 Kg ke kompor listrik. Pembahasan DPR molor, target Q4 2026 molor ke 2027.",
    currentStatus: "dpr",
    currentStatusLabel: "Pembahasan molor",
    lastEventLabel: "DPR tunda rapat panja",
    lastUpdateTimeAgo: "2 hari lalu",
    storyCount: 7,
    affectedSectors: ["Energi", "Rumah Tangga", "UMKM", "Konversi"],
    timeline: [
      { status: "dpr", label: "DPR tunda rapat panja", date: "2026-06-05", timeAgo: "2 hari lalu" },
      { status: "public_hearing", label: "ESDM uji 5 kota percontohan", date: "2026-05-12", timeAgo: "1 bulan lalu" },
      { status: "dpr", label: "RUU masuk Prolegnas", date: "2026-03-15", timeAgo: "3 bulan lalu" },
    ],
    relatedStoryIds: ["hl-lpg-listrik"],
  },
  {
    id: "topic-pln",
    topic: "Subsidi PLN & Kompor Listrik",
    slug: "subsidi-pln-kompor-listrik",
    brief:
      "Target konversi 1,8 juta RT ke kompor listrik. Implementasi dipercepat pasca molor Q2.",
    currentStatus: "approved",
    currentStatusLabel: "Dipercepat",
    lastEventLabel: "Alokasi subsidi naik 12%",
    lastUpdateTimeAgo: "1 hari lalu",
    storyCount: 5,
    affectedSectors: ["Energi", "PLN", "APBN", "Rumah Tangga"],
    timeline: [
      { status: "approved", label: "Alokasi subsidi naik 12%", date: "2026-06-06", timeAgo: "1 hari lalu" },
      { status: "delayed", label: "Q2 molor, perpanjang target", date: "2026-05-20", timeAgo: "3 minggu lalu" },
    ],
    relatedStoryIds: ["hl-pln-subsidi"],
  },
];
