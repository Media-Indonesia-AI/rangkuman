/**
 * Request-level cache for `GET interest-rate`.
 *
 * Per-date cache — different dates get different slots. Concurrent and
 * subsequent callers for the same date share one network round-trip.
 * Errors clear the in-flight slot so the next mount can retry.
 *
 * The default date when callers pass none is "today" in the user's
 * local timezone, computed via `todayIsoDate()` from `../client`.
 */

import { todayIsoDate } from "../client";
import { api } from "../client";
import type { InterestRate } from "../types/market";

const cached = new Map<string, InterestRate>();
const inflight = new Map<string, Promise<InterestRate>>();

/**
 * Fetch the BI Rate snapshot for a given date, with request-level dedup.
 *
 * @param date ISO date string `YYYY-MM-DD`. Defaults to today (local TZ).
 */
export function loadInterestRate(date?: string): Promise<InterestRate> {
  const d = date ?? todayIsoDate();
  const hit = cached.get(d);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(d);
  if (pending) return pending;
  const promise = api
    .getInterestRate(d)
    .then((res) => {
      cached.set(d, res);
      return res;
    })
    .catch((err) => {
      inflight.delete(d); // allow retry on next mount
      throw err;
    });
  inflight.set(d, promise);
  return promise;
}
