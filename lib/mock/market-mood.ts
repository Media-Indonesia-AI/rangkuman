import type { Sentimen } from "./recaps";
import { TODAY_ISO, YESTERDAY_ISO, DAY_BEFORE_ISO } from "./recaps";

export type MarketSentiment = Sentimen;

export interface MarketFactor {
  label: string;
  value: string;
  change?: string;
  sentiment: Sentimen;
}

export type MarketWidgetType = "sparkline" | "gauge" | "bar" | "static";

export interface MarketWidget {
  id: string;
  label: string;
  /** Big primary value, e.g. "7.245,50" */
  value: string;
  /** Day change % (can be negative). */
  changePercent: number;
  type: MarketWidgetType;
  /** Sparkline data points (20+ values for smooth line). Required if type="sparkline". */
  sparklineData?: number[];
  /** Gauge 0-100. Required if type="gauge". */
  gaugeValue?: number;
  /** Gauge label (e.g. "Optimis"). */
  gaugeLabel?: string;
  /** Bar 0-100 (left to right). Required if type="bar". */
  barValue?: number;
  /** Bar left label (e.g. "Net Sell"). */
  barLeftLabel?: string;
  /** Bar right label (e.g. "Net Buy"). */
  barRightLabel?: string;
  /** Static sub-label below the value (e.g. "+25 bps" or "Tahan"). Required if type="static". */
  staticSubLabel?: string;
  /** Static badge — controls color of sub-label (matches sentiment palette). */
  staticBadge?: "bullish" | "bearish" | "mixed";
}

export interface MarketMood {
  sentiment: MarketSentiment;
  sentimentLabel: string;
  summary: string;
  factors: MarketFactor[];
  widgets: MarketWidget[];
}

// Deterministic sparkline generator so SSR output is stable.
function buildSparkline(end: number, seed: number, volatility: number = 0.012): number[] {
  // Tiny LCG for deterministic pseudo-random
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points: number[] = [];
  let value = end * (1 - volatility * 4);
  for (let i = 0; i < 24; i++) {
    const drift = (rnd() - 0.5) * end * volatility;
    value += drift;
    points.push(value);
  }
  // Make sure we end at `end`
  points[points.length - 1] = end;
  return points;
}

export const marketMood: MarketMood = {
  sentiment: "positif",
  sentimentLabel: "Optimis",
  summary:
    "Sentimen positif ditopang kenaikan BI Rate yang dianggap akhir dari siklus tightening, apresiasi rupiah ke Rp 16.320, dan inflow asing Rp 312M di sesi I. Pasar perbankan memimpin kenaikan, sektor tambang tertahan pelemahan nikel global.",
  factors: [
    { label: "BI Rate", value: "6,25%", change: "+25 bps", sentiment: "netral" },
    { label: "USD/IDR", value: "Rp 16.320", change: "-0,40%", sentiment: "positif" },
    { label: "Foreign Flow", value: "Net buy", change: "Rp 312M", sentiment: "positif" },
    { label: "Minyak Dunia", value: "$79", change: "-1,20%", sentiment: "negatif" },
    { label: "Yield SUN 10Y", value: "6,92%", change: "-8 bps", sentiment: "positif" },
  ],
  widgets: [
    {
      id: "ihsg",
      label: "IHSG",
      value: "7.245,50",
      changePercent: 0.87,
      type: "sparkline",
      sparklineData: buildSparkline(7245.5, 137, 0.004),
    },
    {
      id: "idx30",
      label: "IDX30",
      value: "608,42",
      changePercent: 0.92,
      type: "sparkline",
      sparklineData: buildSparkline(608.42, 81, 0.0035),
    },
    {
      id: "fear-greed",
      label: "Sentimen Investor",
      value: "65",
      changePercent: 4.0,
      type: "gauge",
      gaugeValue: 65,
      gaugeLabel: "Optimis",
    },
    {
      id: "foreign-flow",
      label: "Foreign Flow",
      value: "+312M",
      changePercent: 0,
      type: "bar",
      barValue: 72,
      barLeftLabel: "Net Sell",
      barRightLabel: "Net Buy",
    },
    {
      id: "usd-idr",
      label: "USD/IDR",
      value: "16.320",
      changePercent: -0.4,
      type: "sparkline",
      sparklineData: buildSparkline(16320, 120, 0.0008),
    },
    {
      id: "bi-rate",
      label: "BI Rate",
      value: "6,25%",
      changePercent: 0,
      type: "static",
      staticSubLabel: "+25 bps",
      staticBadge: "mixed",
    },
  ],
};

/** Per-date market mood registry. Each entry is the snapshot for that session. */
export const marketMoodByDate: Record<string, MarketMood> = {
  [TODAY_ISO]: marketMood,

  [YESTERDAY_ISO]: {
    sentiment: "netral",
    sentimentLabel: "Wait & see",
    summary:
      "IHSG konsolidasi di kisaran 7.150–7.200 jelang keputusan BI. Asing net sell tipis Rp 45M, rupiah stabil di Rp 16.380. Volume transaksi moderat, pasar nantikan katalis makro akhir pekan.",
    factors: [
      { label: "BI Rate", value: "6,00%", sentiment: "netral" },
      { label: "USD/IDR", value: "Rp 16.380", change: "+0,05%", sentiment: "netral" },
      { label: "Foreign Flow", value: "Net sell", change: "Rp 45M", sentiment: "negatif" },
      { label: "Minyak Dunia", value: "$80", change: "+0,30%", sentiment: "netral" },
      { label: "Yield SUN 10Y", value: "7,00%", change: "+2 bps", sentiment: "negatif" },
    ],
    widgets: [
      {
        id: "ihsg",
        label: "IHSG",
        value: "7.182,30",
        changePercent: 0.12,
        type: "sparkline",
        sparklineData: buildSparkline(7182.3, 191, 0.004),
      },
      {
        id: "idx30",
        label: "IDX30",
        value: "602,87",
        changePercent: 0.05,
        type: "sparkline",
        sparklineData: buildSparkline(602.87, 211, 0.0035),
      },
      {
        id: "fear-greed",
        label: "Sentimen Investor",
        value: "52",
        changePercent: 0,
        type: "gauge",
        gaugeValue: 52,
        gaugeLabel: "Netral",
      },
      {
        id: "foreign-flow",
        label: "Foreign Flow",
        value: "-45M",
        changePercent: 0,
        type: "bar",
        barValue: 35,
        barLeftLabel: "Net Sell",
        barRightLabel: "Net Buy",
      },
      {
        id: "usd-idr",
        label: "USD/IDR",
        value: "16.380",
        changePercent: 0.18,
        type: "sparkline",
        sparklineData: buildSparkline(16380, 200, 0.0006),
      },
      {
        id: "bi-rate",
        label: "BI Rate",
        value: "6,00%",
        changePercent: 0,
        type: "static",
        staticSubLabel: "Tahan",
        staticBadge: "mixed",
      },
    ],
  },

  [DAY_BEFORE_ISO]: {
    sentiment: "negatif",
    sentimentLabel: "Pesimis",
    summary:
      "Sentimen negatif pasca pelemahan sektor tambang dan consumer. IHSG ditutup turun 0,6% ke 7.198. Asing catat net buy tipis Rp 180M setelah 4 hari net sell. Rupiah stabil di Rp 16.410. Pasar masihwait-and-see melihat data inflasi akhir pekan.",
    factors: [
      { label: "BI Rate", value: "6,00%", sentiment: "netral" },
      { label: "USD/IDR", value: "Rp 16.410", change: "+0,12%", sentiment: "negatif" },
      { label: "Foreign Flow", value: "Net buy", change: "Rp 180M", sentiment: "positif" },
      { label: "Minyak Dunia", value: "$80,5", change: "-0,40%", sentiment: "negatif" },
      { label: "Yield SUN 10Y", value: "7,02%", change: "+1 bps", sentiment: "netral" },
    ],
    widgets: [
      {
        id: "ihsg",
        label: "IHSG",
        value: "7.198,12",
        changePercent: -0.58,
        type: "sparkline",
        sparklineData: buildSparkline(7198.12, 311, 0.0045),
      },
      {
        id: "idx30",
        label: "IDX30",
        value: "602,55",
        changePercent: -0.42,
        type: "sparkline",
        sparklineData: buildSparkline(602.55, 331, 0.0038),
      },
      {
        id: "fear-greed",
        label: "Sentimen Investor",
        value: "38",
        changePercent: -8.0,
        type: "gauge",
        gaugeValue: 38,
        gaugeLabel: "Pesimis",
      },
      {
        id: "foreign-flow",
        label: "Foreign Flow",
        value: "+180M",
        changePercent: 0,
        type: "bar",
        barValue: 58,
        barLeftLabel: "Net Sell",
        barRightLabel: "Net Buy",
      },
      {
        id: "usd-idr",
        label: "USD/IDR",
        value: "16.410",
        changePercent: 0.12,
        type: "sparkline",
        sparklineData: buildSparkline(16410, 200, 0.0007),
      },
      {
        id: "bi-rate",
        label: "BI Rate",
        value: "6,00%",
        changePercent: 0,
        type: "static",
        staticSubLabel: "Tahan",
        staticBadge: "mixed",
      },
    ],
  },
};

/** Get market mood snapshot for a given ISO date. Falls back to the latest
 *  available entry (today) if the date has no specific data. */
export function getMarketMoodByDate(isoDate: string): MarketMood {
  if (marketMoodByDate[isoDate]) return marketMoodByDate[isoDate];
  return marketMoodByDate[TODAY_ISO];
}
