"use client";

import { usePathname } from "next/navigation";
import { TopTicker, type TopTickerVariant } from "./TopTicker";

/** First matching prefix wins. Add new routes here as needed. */
const VARIANT_BY_PREFIX: Array<[string, TopTickerVariant]> = [
  ["/crypto", "crypto"],
];

/**
 * Mounts a single `<TopTicker>` and picks the variant from the current
 * route. Lives in the root layout so the ticker persists across page
 * navigations — only the variant prop changes in place when the route
 * switches between `/crypto` and the rest.
 */
export function TopTickerRouter() {
  const pathname = usePathname() ?? "";
  const variant =
    VARIANT_BY_PREFIX.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "stocks";
  return <TopTicker variant={variant} />;
}
