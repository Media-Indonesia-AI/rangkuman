export interface Commodity {
  id: string;
  name: string;
  ticker: string;            // short code, e.g. "HBA"
  category: "energi" | "logam" | "pertanian";
  /** Price unit description, e.g. "USD/ton", "USD/barel". */
  unit: string;
  price: number;
  changePercent: number;     // day change %, signed
  /** ~20 points for sparkline (oldest → newest). */
  history: number[];
  /** Related IDX-listed stocks. */
  relatedStocks: string[];
}

/** Simple deterministic mock data: 20-point history that ends at `price`
 *  and shows realistic volatility. */
function makeHistory(end: number, volatility = 0.012): number[] {
  // Pseudo-random based on a seed-like pattern; small drift + noise.
  const points: number[] = [];
  const start = end * (1 - (Math.random() * 0.08 - 0.04));
  let current = start;
  for (let i = 0; i < 20; i++) {
    // Drift toward `end` + random noise
    const drift = (end - current) * 0.18;
    const noise = (Math.random() - 0.5) * end * volatility;
    current = current + drift + noise;
    points.push(current);
  }
  // Force the last point to be exactly `end`
  points[points.length - 1] = end;
  return points;
}

export const commodities: Commodity[] = [
  // ───── ENERGI ─────
  {
    id: "batu-bara",
    name: "Batu bara",
    ticker: "HBA",
    category: "energi",
    unit: "USD/ton",
    price: 134.50,
    changePercent: 1.82,
    history: makeHistory(134.5, 0.008),
    relatedStocks: ["ADRO", "PTBA", "BYAN", "HRUM"],
  },
  {
    id: "minyak-wti",
    name: "Minyak mentah",
    ticker: "WTI",
    category: "energi",
    unit: "USD/barel",
    price: 78.20,
    changePercent: -2.34,
    history: makeHistory(78.2, 0.015),
    relatedStocks: ["AKRA", "PGAS", "ELSA"],
  },
  {
    id: "gas-alam",
    name: "Gas alam",
    ticker: "NG",
    category: "energi",
    unit: "USD/MMBtu",
    price: 2.84,
    changePercent: 0.45,
    history: makeHistory(2.84, 0.018),
    relatedStocks: ["PGAS", "ELSA"],
  },

  // ───── LOGAM ─────
  {
    id: "nikel",
    name: "Nikel",
    ticker: "NI",
    category: "logam",
    unit: "USD/ton",
    price: 17850,
    changePercent: -3.92,
    history: makeHistory(17850, 0.022),
    relatedStocks: ["ANTM", "INCO", "MDKA", "NCKL"],
  },
  {
    id: "emas",
    name: "Emas",
    ticker: "XAU",
    category: "logam",
    unit: "USD/oz",
    price: 2418.30,
    changePercent: 0.62,
    history: makeHistory(2418.3, 0.006),
    relatedStocks: ["ANTM", "MDKA", "PSAB"],
  },
  {
    id: "tembaga",
    name: "Tembaga",
    ticker: "CU",
    category: "logam",
    unit: "USD/ton",
    price: 9650,
    changePercent: -0.85,
    history: makeHistory(9650, 0.012),
    relatedStocks: ["MDKA", "INCO"],
  },
  {
    id: "timah",
    name: "Timah",
    ticker: "SN",
    category: "logam",
    unit: "USD/ton",
    price: 31250,
    changePercent: 1.45,
    history: makeHistory(31250, 0.014),
    relatedStocks: ["TINS", "NIKL"],
  },

  // ───── PERTANIAN ─────
  {
    id: "cpo",
    name: "Minyak sawit (CPO)",
    ticker: "CPO",
    category: "pertanian",
    unit: "MYR/ton",
    price: 3925,
    changePercent: 0.95,
    history: makeHistory(3925, 0.010),
    relatedStocks: ["SIME", "AALI", "LSIP", "SMAR"],
  },
  {
    id: "karet",
    name: "Karet",
    ticker: "RSS3",
    category: "pertanian",
    unit: "US¢/kg",
    price: 184.5,
    changePercent: -0.68,
    history: makeHistory(184.5, 0.013),
    relatedStocks: ["GJTL", "BATA"],
  },
  {
    id: "gandum",
    name: "Gandum",
    ticker: "WHT",
    category: "pertanian",
    unit: "US¢/bushel",
    price: 612.5,
    changePercent: -1.12,
    history: makeHistory(612.5, 0.014),
    relatedStocks: ["ICBP", "INDF"],
  },
];

export function getCommodityCounts(): Record<Commodity["category"], number> {
  return {
    energi: commodities.filter((c) => c.category === "energi").length,
    logam: commodities.filter((c) => c.category === "logam").length,
    pertanian: commodities.filter((c) => c.category === "pertanian").length,
  };
}
