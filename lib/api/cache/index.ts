/**
 * Barrel for the request-level cache modules.
 *
 * One file per endpoint category, each owning its private cache state
 * (`cached`, `inflight`) and its dedup key shape. This barrel re-exports
 * every `load*` function so existing call sites can keep importing from
 * `@/lib/api/cache`:
 *
 *   import { loadTopStocks } from "@/lib/api/cache";
 *
 * Or import directly from the per-endpoint file when the call site
 * knows which endpoint it's hitting — useful for code-splitting later
 * if a particular endpoint's cache stops being needed:
 *
 *   import { loadTopStocks } from "@/lib/api/cache/top-stocks";
 *
 * Both forms work. Adding a new endpoint: drop a new file alongside the
 * others and add its re-export here.
 */

export { loadTopStocks } from "./top-stocks";
export { loadTickers, peekTickers } from "./tickers";
export { loadTickerInformation } from "./ticker-information";
export { loadKeyMetrics } from "./key-metrics";
export { loadInterestRate } from "./interest-rate";
export { loadExchangeRate } from "./exchange-rate";
export { loadMarketMood } from "./market-mood";
export { loadForeignStocks } from "./foreign-stocks";
export { loadCompositeChart } from "./composite-chart";
export { loadTrendingStories } from "./trending-stories";
export { loadHeadlines } from "./headlines";
export { loadTopic } from "./topics";
export { loadListStory } from "./stories";
export { loadHeadlineById } from "./headline-detail";
