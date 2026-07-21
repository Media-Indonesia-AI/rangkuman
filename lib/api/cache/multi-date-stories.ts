/**
 * Request-level cache for `GET headlines/multi-date-stories`.
 *
 * Per-(ticker, limit, page) cache — different tuples get different
 * slots. Concurrent and subsequent callers for the same tuple share
 * one network round-trip. Errors clear the in-flight slot so the next
 * mount can retry.
 */

import { api } from "../client";
import type { MultiDateStoriesResponse } from "../types/headline";

const cached = new Map<string, MultiDateStoriesResponse>();
const inflight = new Map<string, Promise<MultiDateStoriesResponse>>();

/** Cache key for a (ticker, limit, page) tuple. Ticker is uppercased
 *  so callers with equal tickers in different cases share a slot. */
function key(ticker: string, limit: number, page: number): string {
  return `${ticker.toUpperCase()}|${limit}|${page}`;
}

/**
 * Fetch a page of multi-date stories for a (ticker, limit, page)
 * tuple, with request-level dedup.
 *
 * @param ticker Ticker code (e.g. `"ANTM"`).
 * @param limit  How many stories per page (default 5).
 * @param page   1-based page number (default 1).
 */
export function loadMultiDateStories(
  ticker: string,
  limit = 5,
  page = 1,
): Promise<MultiDateStoriesResponse> {
  const k = key(ticker, limit, page);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getMultiDateStories(ticker, limit, page)
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
