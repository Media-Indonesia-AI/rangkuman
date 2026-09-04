/**
 * Domain types for the recap widgets (stock-card family,
 * `<SourceBar />`, `<SentimentBadge />`, Market Mood, etc.).
 *
 * These are the local adapter-output shapes the recap widgets
 * consume. The live wire shapes them today are still being shaped
 * by the recap endpoints, so widgets continue to read from
 * these types after the orchestrator adapts whatever the live
 * fetch lands on.
 *
 * History: this module used to live at `lib/mock/recaps.ts` and
 * also carried a `recaps: DailyRecap[]` mock catalog plus a pile
 * of `getRecapsByDate` / `getRecapsByRecentDays` / `getRecapForStock`
 * / `getRecapsForStock` helpers + pinned `TODAY_ISO` /
 * `YESTERDAY_ISO` / `DAY_BEFORE_ISO` / `AVAILABLE_DATE_ISOS`
 * constants. Every home/feed call site that ever fed those
 * helpers has since been deleted (`HomeFeed` → `HomeTabs` →
 * `DateTabs`, plus `ArsipSingkat`'s `getRecapsForStock` consumer),
 * and the only thing still in scope is the types — so the
 * catalog + helpers + pinned dates died with the move, and
 * the file path is now `lib/recap.ts` to match the top-level
 * "single-domain-type module" convention established by
 * `lib/highlight.ts`.
 */

export type Sentimen = "positif" | "netral" | "negatif";

export interface Sumber {
  media: string;
  logo: string;
  jumlah: number;
  /** URL of a representative article from this media. Optional —
   *  when present, `<SourceBar>` renders the chip as a link. */
  url?: string;
}

export interface DailyRecap {
  id: string;
  /** ISO date (YYYY-MM-DD) this recap belongs to. */
  tanggal: string;
  /** Stock ticker this recap covers. */
  sahamKode: string;
  /** Company name associated with the stock. */
  companyName?: string;
  /** 2-3 sentence aggregate summary. */
  ringkasan: string;
  /** Aggregate sentiment across all underlying articles. */
  sentimen: Sentimen;
  /** Total article count. */
  jumlahBerita: number;
  /** Breakdown by source. */
  sumber: Sumber[];
}
