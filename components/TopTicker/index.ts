/**
 * Barrel for the `TopTicker` widget family. Each piece lives in
 * its own file so the orchestrator stays thin and the per-row
 * formatters / data adapters can be tested in isolation.
 *
 * The public surface is re-exported here so a single import line
 * covers every consumer:
 *
 *   import { TopTicker, type TopTickerVariant } from "@/components/TopTicker";
 *
 * Internally, the family is:
 *   - `TopTicker` — the orchestrator (props → hook → `<Marquee />`).
 *   - `Marquee`   — the scroll container (border + edge fades +
 *                    doubled rows).
 *   - `TickerRowView` — a single marquee cell.
 *   - `useTopTickerRows` — row-resolution hook (label/variant
 *                    dispatch + hydration-safe shuffle).
 *   - `formatters` — IDR/USD price formatters.
 *   - `tickerData` — entry mappers, shuffle, recap-href lookup.
 *   - `types` — `TickerRow`, `TopTickerVariant`, `TopTickerLabel`.
 */
export { TopTicker } from "./TopTicker";
export type { TopTickerVariant, TopTickerLabel, TickerRow } from "./types";
