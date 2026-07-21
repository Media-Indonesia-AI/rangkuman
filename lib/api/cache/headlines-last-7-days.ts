/**
 * Request-level cache for `GET headlines/last-7-days`.
 *
 * Per-(ticker, date) cache — different tuples get different slots.
 * Concurrent and subsequent callers for the same tuple share one
 * network round-trip. Errors clear the in-flight slot so the next
 * mount can retry.
 */

import { api, todayIsoDate } from "../client";
import type { HeadlinesLast7DaysResponse } from "../types/headline";

const cached = new Map<string, HeadlinesLast7DaysResponse>();
const inflight = new Map<string, Promise<HeadlinesLast7DaysResponse>>();

/** Cache key for a (ticker, date) tuple. Ticker is uppercased so
 *  callers with equal tickers in different cases share a slot. */
function key(ticker: string, date: string): string {
  return `${ticker.toUpperCase()}|${date}`;
}

/**
 * Fetch the last-7-days headlines for a (ticker, date) tuple, with
 * request-level dedup.
 *
 * @param ticker Ticker code (e.g. `"ANTM"`).
 * @param date   Reference date as `YYYY-MM-DD`. Defaults to today.
 */
export function loadHeadlinesLast7Days(
  ticker: string,
  date: string = todayIsoDate(),
): Promise<HeadlinesLast7DaysResponse> {
  const k = key(ticker, date);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getHeadlinesLast7Days(ticker, date)
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
