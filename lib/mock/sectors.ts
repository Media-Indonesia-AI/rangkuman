import type { Sentimen } from "./recaps";
import { stocks, type Saham } from "./stocks";

export type SektorHue = "amber" | "sky" | "rose" | "violet" | "emerald" | "slate";

export interface Sektor {
  slug: string;
  name: string;
  description: string;
  hue: SektorHue;
  sentiment: Sentimen;
  avgChange: number;
  stocks: Saham[];
}

/**
 * 12 sektor pasar modal Indonesia, di-tweak dari klasifikasi IDX-IC.
 * Sentiment & avg change dihitung live dari mock stocks (bukan hardcode)
 * supaya konsisten dengan data saham.
 */
const SEKTOR_DEFS: Array<{
  slug: string;
  name: string;
  description: string;
  hue: SektorHue;
  sentiment: Sentimen;
  stockKodes: string[];
}> = [
  {
    slug: "perbankan",
    name: "Perbankan",
    description:
      "Bank-bank besar IDX. Didukung dividen yield tinggi & NIM stabil pasca BI Rate pause.",
    hue: "amber",
    sentiment: "positif",
    stockKodes: ["BBCA", "BBRI", "BMRI", "BBNI"],
  },
  {
    slug: "pertambangan",
    name: "Pertambangan",
    description:
      "Emiten nikel, batu bara, tembaga, dan emas. Sensitif terhadap harga logam LME & ekspor.",
    hue: "rose",
    sentiment: "negatif",
    stockKodes: ["ANTM", "INCO", "MDKA", "PTBA"],
  },
  {
    slug: "telekomunikasi",
    name: "Telekomunikasi",
    description:
      "Operator telekomunikasi & data center. Katalis: data center hyperscale & fixed broadband.",
    hue: "sky",
    sentiment: "positif",
    stockKodes: ["TLKM", "FREN"],
  },
  {
    slug: "consumer-goods",
    name: "Consumer Goods",
    description:
      "FMCG, makanan, minuman, dan tembakau. Defensif dengan margin tekanan dari input cost.",
    hue: "emerald",
    sentiment: "netral",
    stockKodes: ["UNVR", "ICBP", "HMSP"],
  },
  {
    slug: "property",
    name: "Property",
    description:
      "Pengembang properti residensial & komersial. Sensitif terhadap suku bunga KPR.",
    hue: "amber",
    sentiment: "negatif",
    stockKodes: ["BSDE", "CTRA", "PWON"],
  },
  {
    slug: "infrastruktur",
    name: "Infrastruktur",
    description:
      "Konstruksi, jalan tol, dan utilitas. Didorong proyek pemerintah & IKN.",
    hue: "slate",
    sentiment: "netral",
    stockKodes: ["JSMR", "WIKA", "PTPP"],
  },
  {
    slug: "energi",
    name: "Energi",
    description:
      "Distribusi & infrastruktur energi: gas, batu bara termal, dan ritel BBM.",
    hue: "slate",
    sentiment: "positif",
    stockKodes: ["PGAS", "AKRA"],
  },
  {
    slug: "teknologi",
    name: "Teknologi",
    description:
      "Software, e-commerce, fintech, dan petrokimia teknologi. Pertumbuhan eksponensial.",
    hue: "emerald",
    sentiment: "netral",
    stockKodes: ["GOTO", "BRPT"],
  },
  {
    slug: "kesehatan",
    name: "Kesehatan",
    description:
      "Farmasi, alat kesehatan, dan consumer health. Defensive play dengan dividen yield menarik.",
    hue: "emerald",
    sentiment: "positif",
    stockKodes: ["KLBF"],
  },
  {
    slug: "transportasi",
    name: "Transportasi",
    description:
      "Maskapai, pelayaran, logistik, dan asuransi perjalanan. Pulih pasca-pandemi.",
    hue: "sky",
    sentiment: "netral",
    stockKodes: ["GIAA", "SMDR", "ASLR"],
  },
  {
    slug: "agrikultur",
    name: "Agrikultur",
    description:
      "Perkebunan sawit, karet, dan kakao. Katalis: harga CPO global & permintaan biodiesel.",
    hue: "emerald",
    sentiment: "positif",
    stockKodes: ["AALI", "LSIP", "SIME"],
  },
  {
    slug: "manufaktur",
    name: "Manufaktur",
    description:
      "Otomotif, mesin berat, semen, dan material. Siklikal, sensitif terhadap daya beli & proyek.",
    hue: "slate",
    sentiment: "netral",
    stockKodes: ["ASII", "UNTR", "SMGR"],
  },
];

function pickSaham(kodes: string[]): Saham[] {
  return kodes
    .map((k) => stocks.find((s) => s.kode === k))
    .filter((s): s is Saham => s !== undefined);
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export const sektorList: Sektor[] = SEKTOR_DEFS.map((d) => {
  const stocks = pickSaham(d.stockKodes);
  return {
    slug: d.slug,
    name: d.name,
    description: d.description,
    hue: d.hue,
    sentiment: d.sentiment,
    avgChange: avg(stocks.map((s) => s.changePercent)),
    stocks,
  };
});

/** Lookup by slug. */
export function getSektorBySlug(slug: string): Sektor | undefined {
  return sektorList.find((s) => s.slug === slug);
}

/** Aggregate counts. */
export function getSektorCounts() {
  const total = sektorList.length;
  const positif = sektorList.filter((s) => s.sentiment === "positif").length;
  const netral = sektorList.filter((s) => s.sentiment === "netral").length;
  const negatif = sektorList.filter((s) => s.sentiment === "negatif").length;
  const totalStocks = sektorList.reduce((acc, s) => acc + s.stocks.length, 0);
  return { total, positif, netral, negatif, totalStocks };
}

/** Top 3 stocks in the sector by today's change. */
export function getTopStocksInSektor(s: Sektor, n: number = 3): Saham[] {
  return [...s.stocks]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, n);
}
