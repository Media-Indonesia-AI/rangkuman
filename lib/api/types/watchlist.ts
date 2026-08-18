/**
 * Types for the `/watchlist` endpoint.
 *
 * Consumed by `../watchlist.ts` (request functions) and any
 * downstream consumer that needs the active user's watchlist
 * rows. The endpoint is auth-gated — the backend resolves the
 * user from the auth header and returns the rows scoped to that
 * user. `user_id` is echoed back on each row for cross-checking.
 *
 * Note: this endpoint uses the `{ items: [...] }` envelope,
 * NOT the `{ data: [...] }` envelope used by the rest of the
 * API (stocks, headlines, wallet, etc). The shape is locked
 * to the wire format the backend ships — don't normalize to
 * `data` here without also updating the backend contract.
 */

// ─── WATCHLIST ROW ──────────────────────────────────────────────

/**
 * One ticker the active user is tracking on their watchlist.
 *
 *   - `id`           — opaque watchlist-row id from the backend
 *                      (mongo-style hash, e.g.
 *                      `"6a841469dbbef3bdbc0b14d0"`); forwarded
 *                      on subsequent mutations (add / remove /
 *                      reorder) to target the right row.
 *   - `user_id`      — the row's owning user, echoed back for
 *                      client-side cross-checking. Always equals
 *                      the active session user; the backend
 *                      rejects mismatched `user_id` mutations.
 *   - `ticker_code`  — the ticker being tracked (e.g. `"BBCA"`).
 *                      Uppercased by the backend on write; the
 *                      front-end can pass any case and rely on
 *                      the wire to normalize.
 *   - `order`        — 0-based display position within the
 *                      watchlist. Render rows ascending so the
 *                      user-defined top-of-list lands first.
 *                      Sparse / non-contiguous values are
 *                      tolerated by the backend (the reorder
 *                      endpoint writes explicit positions), so
 *                      consumers should sort by `order` rather
 *                      than assuming a dense 0..N sequence.
 *   - `created_at`   — ISO timestamp of when the row was first
 *                      added to the watchlist.
 *   - `updated_at`   — ISO timestamp of the most recent mutation
 *                      to the row (add, reorder, etc).
 */
export interface WatchlistItem {
  id: string;
  user_id: string;
  ticker_code: string;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Wire format for `GET watchlist` — `{ items: WatchlistItem[] }`.
 * NOT the `{ data: ... }` envelope used elsewhere in the API
 * (the backend ships this one with a top-level `items` key);
 * see the file-level note.
 */
export interface WatchlistResponse {
  items: WatchlistItem[];
}

// ─── WATCHLIST MUTATIONS ───────────────────────────────────────

/**
 * Request body for `POST watchlist` (add) and `PUT watchlist`
 * (update). Same shape for both operations — the backend
 * distinguishes them by the HTTP method.
 *
 *   - `ticker_code` — the ticker to track (e.g. `"BBCA"`).
 *                     Uppercased by the backend on write.
 *   - `order`      — 0-based display position. On `add` the
 *                     value positions the new row in the user's
 *                     list; on `update` it overwrites the
 *                     existing row's position (use this for
 *                     drag-to-reorder flows).
 *
 * Both methods return the full `WatchlistItem` (raw, not wrapped
 * in an envelope) so the consumer can drop the result straight
 * into their list state without unwrapping.
 */
export interface AddToWatchlistRequest {
  ticker_code: string;
  order: number;
}

/**
 * Request body for `DELETE watchlist`. Ticker-only — the
 * active user is resolved from the auth header, so the
 * `user_id` field on the row doesn't need to be echoed back.
 *
 * The backend returns the updated full list (the
 * `{ items: [...] }` envelope, same as `GET watchlist`) so
 * the consumer can refresh their local state in one round-
 * trip instead of a follow-up `loadWatchlist()`.
 */
export interface DeleteWatchlistRequest {
  ticker_code: string;
}
