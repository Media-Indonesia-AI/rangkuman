/**
 * Request-level cache for `GET stocks/foreign-stocks`.
 *
 * Per-(startDate, endDate) cache with automatic 1-day date-shift fallback
 * when the API returns 503 (typical before market close on the latest
 * trading day, when the most recent session has no data yet).
 *
 * Only successful responses are cached — and they're cached under the
 * ORIGINAL key, so subsequent calls for "today" get yesterday's data
 * without re-trying the 503 chain. Errors clear the in-flight slot so
 * the next mount can retry.
 *
 * The wrapper exposes not just the payload but the **effective date**
 * — the ISO date the data actually represents. That's the date that
 * landed a 200 (after any 503 fallback shift) and is what the
 * Market Mood strip wants to show next to the net-flow number; the
 * caller's requested date may differ from it on fallback days.
 */

import { todayIsoDate } from "../client";
import { api } from "../client";
import type { ForeignStocksResponse } from "../types/stocks";

/** Tuple shape returned by `loadForeignStocks` — payload plus the
 *  date the payload actually represents (may differ from the
 *  requested date after a 503 fallback). */
export interface ForeignStocksResult {
  data: ForeignStocksResponse;
  effectiveDate: string;
}

const cached = new Map<string, ForeignStocksResult>();
const inflight = new Map<string, Promise<ForeignStocksResult>>();

/** Cache key for a given date range. Empty range = "default (today only)". */
function key(startDate?: string, endDate?: string): string {
  return `${startDate ?? ""}|${endDate ?? ""}`;
}

/** Shift an ISO date string (`YYYY-MM-DD`) by `days`, local-tz. */
function shiftIsoDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** How many days we walk back looking for a non-503 response before giving up. */
const MAX_FALLBACK_ATTEMPTS = 5;

/**
 * Fetch with automatic 1-day date-shift fallback. The API returns 503
 * when it has no data for the most recent session yet (typical before
 * market close on the latest trading day). On 503 we shift both
 * `startDate` and `endDate` back by 1 day and retry, up to
 * `MAX_FALLBACK_ATTEMPTS` times.
 *
 * `undefined` start/end dates are normalized to today up-front (using
 * the same `todayIsoDate()` helper as the underlying client) so the
 * shift has a concrete base — otherwise the first 503 would re-send
 * the same `undefined` dates, which the client would re-resolve to
 * "today" again, defeating the fallback.
 *
 * Returns the payload alongside the **shifted** date string that
 * actually landed a 200 — callers that just want the body can ignore
 * the second tuple field, but the Market Mood strip uses it to label
 * the widget with the session the net-flow numbers represent.
 */
function fetchWithFallback(
  startDate?: string,
  endDate?: string,
  attempt = 0,
): Promise<ForeignStocksResult> {
  const effectiveStart = startDate ?? todayIsoDate();
  const effectiveEnd = endDate ?? todayIsoDate();
  const s = shiftIsoDate(effectiveStart, -attempt);
  const e = shiftIsoDate(effectiveEnd, -attempt);
  return api
    .getForeignStocks(s, e)
    .then((data) => ({ data, effectiveDate: s }))
    .catch((err: { status?: number }) => {
      if (err?.status === 503 && attempt < MAX_FALLBACK_ATTEMPTS) {
        return fetchWithFallback(startDate, endDate, attempt + 1);
      }
      throw err;
    });
}

/**
 * Fetch foreign-investor buy/sell flow for a date range, with
 * request-level dedup and 1-day date-shift fallback on 503.
 *
 * Concurrent and subsequent callers for the same range share one
 * network chain (including any retries). Only successful responses are
 * cached — and they are cached under the ORIGINAL key along with the
 * effective date that landed the success, so subsequent calls for
 * "today" get yesterday's data AND see the correct shifted date
 * without re-trying. Errors clear the in-flight slot so the next
 * mount can retry.
 *
 * @param startDate ISO date string `YYYY-MM-DD` (defaults to today).
 * @param endDate ISO date string `YYYY-MM-DD` (defaults to today).
 */
export function loadForeignStocks(
  startDate?: string,
  endDate?: string,
): Promise<ForeignStocksResult> {
  const k = key(startDate, endDate);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = fetchWithFallback(startDate, endDate)
    .then((res) => {
      cached.set(k, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(k); // allow retry on next mount
      throw err;
    });
  inflight.set(k, promise);
  return promise;
}
