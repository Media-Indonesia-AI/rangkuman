export interface Saham {
  /** Ticker code, e.g. "BBCA" */
  kode: string;
  /** Full company name, e.g. "Bank Central Asia" */
  nama: string;
  /** Sector classification */
  sektor: string;
  /** Current mock price (in IDR) */
  price: number;
  /** Day change in % (positive or negative) */
  changePercent: number;
  /** Ticker color hint for the gradient hero — maps to a brand category */
  hue: "amber" | "emerald" | "rose" | "sky" | "violet" | "slate";
  /** Key metrics (mock). */
  marketCap: string;     // e.g. "Rp 1.214T"
  peRatio: number;       // e.g. 23.4
  volume: string;        // e.g. "23,4jt"
  /** 30-day change, signed %. */
  change30dPercent: number;
  /** All-time high (mock). */
  ath: number;
  /** Dividend yield, annualized %. */
  dividendYield: number;
  /** Beta vs IHSG (mock). */
  beta: number;
}

export const stocks: Saham[] = [
  { kode: "BBCA", nama: "Bank Central Asia", sektor: "Perbankan", price: 9875, changePercent: 2.22, hue: "amber", marketCap: "Rp 1.214T", peRatio: 23.4, volume: "23,4jt", change30dPercent: 8.4, ath: 10.250, dividendYield: 1.8, beta: 0.85 },
  { kode: "BBRI", nama: "Bank Rakyat Indonesia", sektor: "Perbankan", price: 5420, changePercent: 1.40, hue: "amber", marketCap: "Rp 819T", peRatio: 14.2, volume: "85,2jt", change30dPercent: 4.6, ath: 5.850, dividendYield: 3.2, beta: 0.92 },
  { kode: "BMRI", nama: "Bank Mandiri", sektor: "Perbankan", price: 6750, changePercent: 0.90, hue: "amber", marketCap: "Rp 632T", peRatio: 11.8, volume: "18,7jt", change30dPercent: 6.8, ath: 7.100, dividendYield: 5.2, beta: 0.78 },
  { kode: "TLKM", nama: "Telkom Indonesia", sektor: "Telekomunikasi", price: 3420, changePercent: 2.86, hue: "sky", marketCap: "Rp 339T", peRatio: 14.6, volume: "12,5jt", change30dPercent: 12.2, ath: 3.650, dividendYield: 4.4, beta: 0.65 },
  { kode: "ASII", nama: "Astra International", sektor: "Otomotif & Industri", price: 5125, changePercent: -1.40, hue: "slate", marketCap: "Rp 207T", peRatio: 9.4, volume: "8,2jt", change30dPercent: -1.2, ath: 6.200, dividendYield: 4.8, beta: 1.15 },
  { kode: "ANTM", nama: "Aneka Tambang", sektor: "Tambang", price: 1815, changePercent: -5.22, hue: "rose", marketCap: "Rp 43T", peRatio: 12.8, volume: "65,4jt", change30dPercent: -15.3, ath: 2.450, dividendYield: 2.1, beta: 1.65 },
  { kode: "INCO", nama: "Vale Indonesia", sektor: "Tambang", price: 4250, changePercent: -4.81, hue: "rose", marketCap: "Rp 53T", peRatio: 16.2, volume: "21,8jt", change30dPercent: -18.4, ath: 5.800, dividendYield: 1.5, beta: 1.55 },
  { kode: "UNVR", nama: "Unilever Indonesia", sektor: "Konsumer", price: 2875, changePercent: 2.10, hue: "emerald", marketCap: "Rp 109T", peRatio: 21.8, volume: "6,4jt", change30dPercent: 5.4, ath: 3.200, dividendYield: 5.6, beta: 0.42 },
  { kode: "ICBP", nama: "Indofood CBP Sukses Makmur", sektor: "Konsumer", price: 11250, changePercent: -1.80, hue: "rose", marketCap: "Rp 130T", peRatio: 15.4, volume: "5,1jt", change30dPercent: -5.4, ath: 12.800, dividendYield: 2.4, beta: 0.55 },
  { kode: "KLBF", nama: "Kalbe Farma", sektor: "Kesehatan", price: 1610, changePercent: 0.31, hue: "emerald", marketCap: "Rp 75T", peRatio: 24.2, volume: "11,3jt", change30dPercent: 0.5, ath: 1.750, dividendYield: 2.1, beta: 0.38 },
  { kode: "MDKA", nama: "Merdeka Copper Gold", sektor: "Tambang", price: 2425, changePercent: 0.41, hue: "amber", marketCap: "Rp 58T", peRatio: 18.5, volume: "32,4jt", change30dPercent: 0.8, ath: 2.850, dividendYield: 0.0, beta: 1.45 },
  { kode: "GOTO", nama: "GoTo Gojek Tokopedia", sektor: "Teknologi", price: 78, changePercent: 0.00, hue: "slate", marketCap: "Rp 87T", peRatio: -45.2, volume: "125,4jt", change30dPercent: 3.2, ath: 410, dividendYield: 0.0, beta: 1.32 },
  { kode: "FREN", nama: "Smartfren Telecom", sektor: "Telekomunikasi", price: 88, changePercent: 11.39, hue: "emerald", marketCap: "Rp 6.2T", peRatio: -12.4, volume: "98,7jt", change30dPercent: 18.4, ath: 215, dividendYield: 0.0, beta: 1.85 },
  { kode: "BRIS", nama: "Bank Syariah Indonesia", sektor: "Perbankan Syariah", price: 2580, changePercent: 1.78, hue: "emerald", marketCap: "Rp 75T", peRatio: 18.4, volume: "21,5jt", change30dPercent: 4.2, ath: 2.780, dividendYield: 1.4, beta: 0.82 },
  { kode: "HMSP", nama: "HM Sampoerna", sektor: "Konsumer", price: 805, changePercent: -0.62, hue: "slate", marketCap: "Rp 93T", peRatio: 12.6, volume: "7,8jt", change30dPercent: -3.2, ath: 1.150, dividendYield: 7.1, beta: 0.48 },
  { kode: "BBNI", nama: "Bank Negara Indonesia", sektor: "Perbankan", price: 5210, changePercent: 1.12, hue: "amber", marketCap: "Rp 194T", peRatio: 9.8, volume: "12,4jt", change30dPercent: 3.8, ath: 5.650, dividendYield: 4.5, beta: 0.95 },
  { kode: "BRPT", nama: "Barito Pacific", sektor: "Petrokimia", price: 1180, changePercent: 2.85, hue: "emerald", marketCap: "Rp 24T", peRatio: 15.6, volume: "45,8jt", change30dPercent: 7.2, ath: 1.450, dividendYield: 0.8, beta: 1.18 },
  { kode: "UNTR", nama: "United Tractors", sektor: "Otomotif & Industri", price: 24850, changePercent: -0.78, hue: "slate", marketCap: "Rp 93T", peRatio: 6.8, volume: "1,8jt", change30dPercent: 0.3, ath: 31.500, dividendYield: 5.4, beta: 1.05 },
  { kode: "SMGR", nama: "Semen Indonesia", sektor: "Material", price: 4250, changePercent: -1.20, hue: "rose", marketCap: "Rp 32T", peRatio: 16.8, volume: "6,5jt", change30dPercent: -2.8, ath: 5.200, dividendYield: 2.4, beta: 0.95 },
  { kode: "PTBA", nama: "Bukit Asam", sektor: "Tambang", price: 2680, changePercent: 2.10, hue: "emerald", marketCap: "Rp 31T", peRatio: 6.5, volume: "8,4jt", change30dPercent: 6.1, ath: 3.200, dividendYield: 7.8, beta: 1.25 },

  // ── Property ──
  { kode: "BSDE", nama: "Bumi Serpong Damai", sektor: "Property", price: 1240, changePercent: -3.21, hue: "amber", marketCap: "Rp 24T", peRatio: 9.4, volume: "18,5jt", change30dPercent: -8.4, ath: 1.680, dividendYield: 1.2, beta: 1.15 },
  { kode: "CTRA", nama: "Ciputra Development", sektor: "Property", price: 1280, changePercent: -2.81, hue: "amber", marketCap: "Rp 23T", peRatio: 8.5, volume: "14,2jt", change30dPercent: -7.8, ath: 1.580, dividendYield: 1.0, beta: 1.18 },
  { kode: "PWON", nama: "Pakuwon Jati",       sektor: "Property", price: 520,  changePercent: -1.85, hue: "amber", marketCap: "Rp 12T", peRatio: 10.8, volume: "9,8jt", change30dPercent: -4.5, ath: 670, dividendYield: 1.6, beta: 1.05 },

  // ── Infrastruktur ──
  { kode: "JSMR", nama: "Jasa Marga",         sektor: "Infrastruktur", price: 4980, changePercent: 0.42, hue: "sky", marketCap: "Rp 28T", peRatio: 14.5, volume: "3,2jt", change30dPercent: 1.8, ath: 5.200, dividendYield: 1.8, beta: 0.78 },
  { kode: "WIKA",  nama: "Wijaya Karya",       sektor: "Infrastruktur", price: 280,  changePercent: -0.71, hue: "slate", marketCap: "Rp 3.1T", peRatio: -2.4, volume: "32,4jt", change30dPercent: -12.4, ath: 580, dividendYield: 0.0, beta: 1.45 },
  { kode: "PTPP", nama: "PP Persero",         sektor: "Infrastruktur", price: 580,  changePercent: -1.05, hue: "slate", marketCap: "Rp 9.2T", peRatio: 18.5, volume: "12,5jt", change30dPercent: -5.8, ath: 840, dividendYield: 1.4, beta: 1.32 },

  // ── Energi ──
  { kode: "PGAS", nama: "Perusahaan Gas Negara", sektor: "Energi",     price: 1620, changePercent: 0.34, hue: "slate", marketCap: "Rp 39T", peRatio: 8.4, volume: "5,4jt", change30dPercent: 2.4, ath: 1.850, dividendYield: 3.8, beta: 0.88 },
  { kode: "AKRA", nama: "AKR Corporindo",        sektor: "Energi",     price: 1480, changePercent: 1.20, hue: "amber", marketCap: "Rp 18T", peRatio: 9.2, volume: "4,8jt", change30dPercent: 4.5, ath: 1.650, dividendYield: 4.2, beta: 0.92 },

  // ── Transportasi ──
  { kode: "GIAA", nama: "Garuda Indonesia",    sektor: "Transportasi", price: 52,    changePercent: -0.52, hue: "slate", marketCap: "Rp 2.3T", peRatio: -1.8, volume: "54,2jt", change30dPercent: 2.4, ath: 520, dividendYield: 0.0, beta: 1.85 },
  { kode: "SMDR", nama: "Samudera Indonesia",  sektor: "Transportasi", price: 580,   changePercent: 0.84,  hue: "emerald", marketCap: "Rp 6.5T", peRatio: 7.5, volume: "2,4jt", change30dPercent: 5.8, ath: 720, dividendYield: 3.2, beta: 1.05 },
  { kode: "ASLR", nama: "Asuransi Harta Aman", sektor: "Transportasi", price: 1240,  changePercent: 0.10,  hue: "sky", marketCap: "Rp 4.8T", peRatio: 12.4, volume: "1,2jt", change30dPercent: 1.4, ath: 1.450, dividendYield: 2.8, beta: 0.85 },

  // ── Agrikultur ──
  { kode: "AALI", nama: "Astra Agro Lestari",  sektor: "Agrikultur", price: 8920,  changePercent: 1.50, hue: "emerald", marketCap: "Rp 17T", peRatio: 12.5, volume: "1,8jt", change30dPercent: 6.4, ath: 11.500, dividendYield: 5.4, beta: 0.92 },
  { kode: "LSIP", nama: "PP London Sumatra",   sektor: "Agrikultur", price: 1180,  changePercent: 0.80, hue: "emerald", marketCap: "Rp 8.4T", peRatio: 8.8, volume: "3,5jt", change30dPercent: 4.2, ath: 1.580, dividendYield: 4.5, beta: 0.95 },
  { kode: "SIME", nama: "Sime Darby",          sektor: "Agrikultur", price: 850,   changePercent: 0.50, hue: "emerald", marketCap: "Rp 5.8T", peRatio: 10.2, volume: "1,5jt", change30dPercent: 3.5, ath: 1.120, dividendYield: 4.8, beta: 0.88 },
];

export function getStockByKode(kode: string): Saham | undefined {
  return stocks.find((s) => s.kode === kode.toUpperCase());
}

export const HUE_GRADIENT: Record<Saham["hue"], string> = {
  amber: "from-amber-500/20 via-orange-500/10 to-transparent",
  emerald: "from-emerald-500/20 via-teal-500/10 to-transparent",
  rose: "from-rose-500/20 via-red-500/10 to-transparent",
  sky: "from-sky-500/20 via-cyan-500/10 to-transparent",
  violet: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
  slate: "from-slate-500/20 via-zinc-500/10 to-transparent",
};
