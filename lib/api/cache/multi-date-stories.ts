/**
 * Request-level cache for `GET headlines/multi-date-stories`.
 *
 * Per-(ticker, topicId, limit, page) cache — different tuples get
 * different slots. Concurrent and subsequent callers for the same
 * tuple share one network round-trip. Errors clear the in-flight
 * slot so the next mount can retry.
 */

import { api } from "../client";
import type { MultiDateStoriesResponse } from "../types/headline";

const cached = new Map<string, MultiDateStoriesResponse>();
const inflight = new Map<string, Promise<MultiDateStoriesResponse>>();

/** Cache key for a (ticker, topicId, limit, page) tuple. Ticker
 *  and `topicId` are both optional — when omitted they serialize
 *  as the empty string so the cross-filter slot stays distinct
 *  from any single-filter slot. Present tickers are uppercased
 *  so callers with equal tickers in different cases share a slot.
 *  `topicId` is forwarded verbatim — topic ids are backend-issued
 *  canonical strings, so case-folding isn't necessary. */
function key(
  ticker: string | undefined,
  topicId: string | undefined,
  limit: number,
  page: number,
): string {
  return `${(ticker ?? "").toUpperCase()}|${topicId ?? ""}|${limit}|${page}`;
}

/**
 * Fetch a page of multi-date stories for a (ticker, topicId,
 * limit, page) tuple, with request-level dedup.
 *
 * `ticker` is optional — pass a non-empty string to scope the
 * feed to one emiten, or omit it (or pass `""`) for the
 * cross-ticker feed used by `/story/`. The cache key uppercases
 * the ticker (when present) so callers with equal tickers in
 * different cases share a slot; the cross-ticker feed lands on a
 * distinct slot from any single-ticker slot.
 *
 * `topicId` is an independent orthogonal filter (e.g. the resolved
 * id of the "saham" or "crypto" topic). The cache key treats it as
 * part of the tuple so the same `(ticker, limit, page)` with
 * different topics don't collide.
 *
 * @param ticker  Optional ticker code (e.g. `"ANTM"`). Empty /
 *                `undefined` → cross-ticker feed.
 * @param limit   How many stories per page (default 5).
 * @param page    1-based page number (default 1).
 * @param topicId Optional topic id (e.g. `"saham"`, `"crypto"`).
 *                Empty / `undefined` → cross-topic feed.
 */
export function loadMultiDateStories(
  ticker?: string,
  limit = 5,
  page = 1,
  topicId?: string,
): Promise<MultiDateStoriesResponse> {
  const k = key(ticker, topicId, limit, page);
  const hit = cached.get(k);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const promise = api
    .getMultiDateStories(ticker, limit, page, topicId)
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
