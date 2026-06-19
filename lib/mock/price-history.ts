import { stocks } from "./stocks";

/** 30-day price history, oldest → newest. */
export type PriceHistory = number[];

/** Tiny string-hash so the same ticker always gets the same series. */
function hashCode(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
    h = h & 0xffffffff;
  }
  return Math.abs(h);
}

/** Deterministic LCG (so SSR output is stable). */
function lcg(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Generate 30-day price history that ends at `endPrice` and matches the
 *  stock's overall 30-day trend (so the chart's start ≈ current / (1 + 30d%). */
export function getPriceHistory(kode: string, days: number = 30): PriceHistory {
  const upper = kode.toUpperCase();
  const stock = stocks.find((s) => s.kode === upper);
  const end = stock?.price ?? 1000;
  const totalChange = (stock?.change30dPercent ?? 0) / 100;
  const start = end / (1 + totalChange);

  const rnd = lcg(hashCode(upper) || 1);
  const points: number[] = [];
  // Volatility scales with the stock's beta — higher beta = wilder swings.
  const beta = stock?.beta ?? 1;
  const volatility = 0.012 * Math.max(0.5, Math.min(2, beta));

  let cur = start;
  for (let i = 0; i < days; i++) {
    const t = i / (days - 1);
    // Smooth drift from start to end so the curve naturally trends.
    const drift = (end - start) / (days - 1);
    // Random walk
    const noise = (rnd() - 0.5) * end * volatility;
    cur = cur + drift + noise;
    points.push(cur);
  }
  // Force the last point to be the actual end price.
  points[points.length - 1] = end;
  return points;
}
