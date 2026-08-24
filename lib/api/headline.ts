/**
 * Headline-domain API endpoints.
 *
 * Hits `headlines/*` — the trending ticker snapshot, the paginated
 * headlines list, and the per-headline detail resource. Composed into
 * the top-level `api` object in `./client` so existing call sites
 * (`api.getTrendingStories()`, `api.getHeadlines()`,
 * `api.getHeadlineById()`) keep working.
 *
 * The split between this file and `./topic` mirrors the backend
 * route grouping: everything under `/headlines` lives here, the
 * topic list (`/topic`) lives next door.
 */

import { request, todayIsoDate } from "./client";
import type {
  StoryFilter,
  StoryResponse,
  TrendingStoriesResponse,
} from "./types/story";
import type {
  HeadlineDetail,
  HeadlineDetailResponse,
  HeadlinesLast7DaysResponse,
  MultiDateStoriesResponse,
} from "./types/headline";

/**
 * Fetch the current trending-ticker stories.
 *
 * @param limit How many trending tickers to return (default 20).
 */
export function getTrendingStories(
  limit = 20,
): Promise<TrendingStoriesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  return request<TrendingStoriesResponse>(
    `headlines/trending/?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch the headlines list, with optional structured filters.
 *
 * @param limit   How many headlines to return (default 10).
 * @param skip    How many headlines to skip from the start of the result
 *                set, for pagination (default 0).
 * @param filters Structured `{ field, operator, value }` filters to
 *                narrow the result set (default `[]`). The list is
 *                JSON-encoded into a single `filters` query param, e.g.
 *                `filters=[{"field":"primary_ticker_code","operator":"eq","value":"IHSG"}]`.
 *                Empty list omits the param entirely.
 */
export function getHeadlines(
  limit = 10,
  skip = 0,
  filters: StoryFilter[] = [],
): Promise<StoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  if (filters.length > 0) {
    params.set("filters", JSON.stringify(filters));
  }
  return request<StoryResponse>(
    `headlines/?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch a single headline by ID, with its related stories.
 *
 * The backend wraps the response in `{ data: HeadlineDetail }`
 * (same shape as the list endpoints); this function unwraps it
 * so call sites only see `HeadlineDetail`. See `HeadlineDetailResponse`
 * for the raw wire shape.
 *
 * The `id` is path-encoded with `encodeURIComponent` so callers can
 * pass any string the backend hands out (e.g. mongo-style hashes)
 * without worrying about reserved characters.
 *
 * @param id Headline ID — opaque string from a list response.
 */
export function getHeadlineById(
  id: string,
): Promise<HeadlineDetail> {
  return request<HeadlineDetailResponse>(
    `headlines/${encodeURIComponent(id)}/`,
    { method: "GET" },
  ).then((res) => res.data);
}

/**
 * Fetch the last-7-days headlines for a ticker.
 *
 * The `date` query param sent to the backend is an ISO 8601 timestamp
 * of the window *start* — i.e. the reference date minus 7 days.
 *
 * @param ticker Ticker code (e.g. `"ANTM"`). Uppercased before being
 *               inserted into the query so callers can pass either case.
 * @param date   Reference date (window end) as `YYYY-MM-DD`. The value
 *               actually sent is this date minus 7 days, formatted as an
 *               ISO 8601 timestamp. Defaults to today.
 */
export function getHeadlinesLast7Days(
  ticker: string,
  date: string = todayIsoDate(),
): Promise<HeadlinesLast7DaysResponse> {
  const params = new URLSearchParams({
    ticker: ticker.toUpperCase(),
    date: date,
  });
  return request<HeadlinesLast7DaysResponse>(
    `headlines/last-7-days/?${params.toString()}`,
    { method: "GET" },
  );
}

/**
 * Fetch a paginated, multi-date list of stories, optionally scoped
 * to a single ticker and/or a single topic.
 *
 * When `ticker` is provided (non-empty after `trim()`), the request
 * is scoped to that ticker — useful for the per-emiten Story feed
 * on `/stock/[kode]`. When `ticker` is omitted / blank, the param
 * is left off the query entirely and the endpoint returns the
 * cross-ticker feed — what `/story/` (the listing) renders.
 *
 * `topicId` is an independent orthogonal filter (e.g. the resolved
 * id of the "saham" or "crypto" topic). When supplied the request
 * is sent with `topic_id=<id>`; when omitted the param is left off
 * and the server applies its cross-topic default. Both `ticker`
 * and `topicId` can be combined or used independently.
 *
 * Same-case insensitive on `ticker`: a passed `"antm"` is uppercased
 * before being inserted so callers don't need to normalize themselves.
 * `topicId` is forwarded verbatim — topic ids are backend-issued
 * strings the caller already has in canonical form.
 *
 * @param ticker  Optional ticker code (e.g. `"ANTM"`). Empty string
 *                / `undefined` → cross-ticker feed (no `ticker=` param).
 * @param limit   How many stories to return per page (default 5).
 * @param page    1-based page number (default 1).
 * @param topicId Optional topic id (e.g. `"saham"`, `"crypto"`).
 *                Empty / `undefined` → cross-topic feed (no
 *                `topic_id=` param).
 */
export function getMultiDateStories(
  ticker?: string,
  limit = 5,
  page = 1,
  topicId?: string,
): Promise<MultiDateStoriesResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  // Only set `ticker=` when the caller actually wants one. Leaving
  // it off lets the server apply its cross-ticker default. Whitespace-
  // only input is treated the same as omitted so a stray " " from
  // a UI field doesn't accidentally filter to ticker `" "`.
  const trimmed = ticker?.trim();
  if (trimmed) {
    params.set("ticker", trimmed.toUpperCase());
  }
  // Same treatment for `topic_id=`. A blank/whitespace-only id is
  // treated as "no topic filter" rather than as the literal empty
  // string, so an undefined/empty `topicId` doesn't accidentally
  // pin the request to a topic the caller never intended.
  const trimmedTopicId = topicId?.trim();
  if (trimmedTopicId) {
    params.set("topic_id", trimmedTopicId);
  }
  return request<MultiDateStoriesResponse>(
    `headlines/multi-date-stories/?${params.toString()}`,
    { method: "GET" },
  );
}
