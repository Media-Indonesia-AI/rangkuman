"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useHeadlinesLast7Days } from "@/lib/hooks/useHeadlinesLast7Days";
import type { HeadlineLast7DaysItem } from "@/lib/api";
import { todayIsoDate } from "@/lib/api/client";

interface Last7DaysHeadlinesContextValue {
  headlines: HeadlineLast7DaysItem[];
  isLoading: boolean;
  /** Local-tz today as `YYYY-MM-DD`. Stable for the lifetime of the
   *  page so the "today" highlight in <NewsTimeline /> and
   *  <SentimentSparkline /> doesn't flicker across re-renders. */
  todayIso: string;
}

/** Sentinel for consumers rendered outside a provider — the
 *  "today" highlight simply never matches this date. */
const FALLBACK_TODAY = "1970-01-01";

const Last7DaysHeadlinesContext = createContext<Last7DaysHeadlinesContextValue>({
  headlines: [],
  isLoading: false,
  todayIso: FALLBACK_TODAY,
});

/**
 * Single `headlines/last-7-days` fetch shared by the two widgets
 * on the stock detail page that need the same ticker-scoped story
 * list: `<NewsTimeline />` (day-by-day buckets) and
 * `<SentimentSparkline />` (sentiment trail).
 *
 * Without this provider, each widget calls `useHeadlinesLast7Days`
 * independently. The underlying request cache (`loadHeadlinesLast7Days`)
 * only happens to dedup them when the (ticker, date) tuple is stable
 * across mounts — and the cache key churns on every render when the
 * `date` default is `todayIsoDate()` (full date-time). Mounting both
 * widgets inside this provider calls the hook exactly once, so the
 * 308 + 200 redirect pair only fires once per page load instead of
 * being amplified by N mounts.
 *
 * The default context value is `{ headlines: [], isLoading: false }`
 * so consumers rendered outside a provider degrade to their fallback
 * paths without an extra null check.
 *
 * `todayIso` is computed once here and exposed via context so the
 * children can highlight the matching day without each one having
 * to take (and recompute) a prop. The window-end is also "today" by
 * default — the provider omits the optional `date` arg, letting the
 * cache layer default to today for the fetch.
 *
 * The default context value carries a sentinel `todayIso` so
 * consumers rendered outside a provider degrade to their fallback
 * paths without an extra null check (the "today" highlight simply
 * never matches `FALLBACK_TODAY`).
 */
export function Last7DaysHeadlinesProvider({
  kode,
  children,
}: {
  kode: string;
  children: ReactNode;
}) {
  const todayIso = useMemo(todayIsoDate, []);
  const { data: headlines, isLoading } = useHeadlinesLast7Days(kode, todayIso);
  return (
    <Last7DaysHeadlinesContext.Provider
      value={{ headlines, isLoading, todayIso }}
    >
      {children}
    </Last7DaysHeadlinesContext.Provider>
  );
}

/** Read the shared last-7-days headlines. Returns the empty
 *  default context outside a provider so consumers render their
 *  fallback paths without an extra null check. */
export function useLast7DaysHeadlines(): Last7DaysHeadlinesContextValue {
  return useContext(Last7DaysHeadlinesContext);
}
