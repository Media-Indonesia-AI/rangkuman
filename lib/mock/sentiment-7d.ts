import type { Sentimen } from "./recaps";

/** 7-day rolling sentiment trail for a stock, oldest → newest. */
export type Sentiment7d = Sentimen[];

/** Lookup table: stock code → its 7-day pattern. Hand-curated so each ticker
 *  feels distinct. Order is oldest (left) → newest (right). */
const SENTIMENT_7D: Record<string, Sentiment7d> = {
  // ── Perbankan (mostly positif, defensive) ──
  BBCA: ["positif", "positif", "netral",  "positif", "positif", "positif", "positif"],
  BBRI: ["positif", "netral",  "positif", "positif", "netral",  "positif", "positif"],
  BMRI: ["netral",  "positif", "positif", "netral",  "positif", "positif", "positif"],
  BBNI: ["netral",  "positif", "positif", "netral",  "positif", "positif", "positif"],
  BRIS: ["positif", "positif", "netral",  "positif", "positif", "netral",  "positif"],

  // ── Telekomunikasi & Tech ──
  TLKM: ["netral",  "positif", "positif", "netral",  "positif", "netral",  "positif"],
  FREN: ["netral",  "positif", "positif", "positif", "netral",  "positif", "positif"],
  GOTO: ["netral",  "netral",  "positif", "netral",  "netral",  "netral",  "netral"],

  // ── Otomotif & Material (mostly netral/mixed) ──
  ASII: ["netral",  "netral",  "positif", "netral",  "netral",  "negatif", "netral"],
  UNTR: ["netral",  "netral",  "netral",  "negatif", "netral",  "netral",  "netral"],
  SMGR: ["negatif", "netral",  "netral",  "negatif", "netral",  "negatif", "negatif"],
  BRPT: ["netral",  "positif", "positif", "netral",  "positif", "positif", "positif"],

  // ── Tambang (mostly negatif) ──
  ANTM: ["netral",  "negatif", "positif", "negatif", "negatif", "negatif", "negatif"],
  INCO: ["netral",  "negatif", "netral",  "negatif", "negatif", "negatif", "netral"],
  MDKA: ["netral",  "negatif", "netral",  "netral",  "positif", "netral",  "netral"],
  PTBA: ["netral",  "positif", "positif", "positif", "netral",  "positif", "positif"],

  // ── Konsumer (mixed) ──
  UNVR: ["positif", "netral",  "positif", "positif", "netral",  "positif", "positif"],
  ICBP: ["netral",  "netral",  "negatif", "netral",  "negatif", "netral",  "negatif"],
  HMSP: ["netral",  "netral",  "negatif", "netral",  "negatif", "negatif", "netral"],

  // ── Kesehatan (mostly netral, defensive) ──
  KLBF: ["netral",  "netral",  "netral",  "positif", "netral",  "netral",  "positif"],
};

/** Get a 7-day sentiment trail for a given stock. Falls back to a
 *  deterministic generated pattern when the ticker isn't in the lookup. */
export function getSentiment7d(kode: string): Sentiment7d {
  const upper = kode.toUpperCase();
  if (SENTIMENT_7D[upper]) return SENTIMENT_7D[upper];

  // Deterministic fallback based on the code characters
  const code = upper;
  const seed = code
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const base = seed % 3; // 0=netral, 1=positif, 2=negatif
  const variants: Sentimen[][] = [
    ["netral",  "netral",  "netral",  "netral",  "netral",  "netral",  "netral"],
    ["positif", "positif", "netral",  "positif", "positif", "positif", "positif"],
    ["negatif", "negatif", "netral",  "negatif", "negatif", "negatif", "negatif"],
  ];
  return variants[base];
}

/** Distribution counts for the last 7 days. */
export function getSentiment7dCounts(kode: string): Record<Sentimen, number> {
  const trail = getSentiment7d(kode);
  return {
    positif: trail.filter((s) => s === "positif").length,
    netral: trail.filter((s) => s === "netral").length,
    negatif: trail.filter((s) => s === "negatif").length,
  };
}
