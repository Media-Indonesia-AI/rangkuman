import type { TopStocksResponse } from "@/lib/api";
import { stocks } from "./stocks";

/**
 * Fallback payload for the `/stocks/top-stocks` endpoint, used by
 * `LeftSidebar` and `MobileTopMovers` when the request is rejected with 401
 * (logged-out user — the LoginPromptOverlay is the primary UI, the list
 * underneath is just visual context).
 *
 * Mirrors the backend wire format (`{ data: TopStockGroup[] }`) so consumers
 * can treat it identically to a real response.
 */
function toItem(s: (typeof stocks)[number]) {
  return {
    ticker: s.kode,
    company_name: s.nama,
    price: s.price,
    percent_change: s.changePercent,
  };
}

// Sort the universe once, then take the two ends. A stable sort isn't
// required — ties are arbitrary, the mock is purely decorative.
const sortedByChange = [...stocks].sort(
  (a, b) => b.changePercent - a.changePercent,
);

const topGainers = sortedByChange.slice(0, 5).map(toItem);
const topLosers = sortedByChange
  .slice(-5)
  .reverse()
  .map(toItem);

export const MOCK_TOP_STOCKS: TopStocksResponse = {
  data: [
    { type: "top-gainer", stocks: topGainers },
    { type: "top-looser", stocks: topLosers },
  ],
};
