import { request } from "./client";
import type {
  AddToWatchlistRequest,
  DeleteWatchlistRequest,
  WatchlistItem,
  WatchlistResponse,
} from "./types/watchlist";

/**
 * `GET watchlist` — the active user's watchlist rows. Auth-gated:
 * the backend resolves the user from the auth header and returns
 * only that user's rows. Response uses the `{ items: [...] }`
 * envelope (NOT the `{ data: [...] }` envelope used by the rest
 * of the API) — see `lib/api/types/watchlist.ts` for the shape
 * and the file-level note on the envelope mismatch.
 *
 * Render rows in `order` ascending so the user-defined top-of-
 * list lands first; the backend doesn't guarantee a wire order.
 */
export function getWatchlist(): Promise<WatchlistResponse> {
  return request<WatchlistResponse>("watchlist", {
    method: "GET",
  });
}

/**
 * `POST watchlist` — add a ticker to the active user's
 * watchlist. Auth-gated. The backend resolves the user from
 * the auth header; the body's `ticker_code` and `order` are
 * the only required fields.
 *
 * Returns the full `WatchlistItem` (raw, not wrapped in an
 * envelope) so the consumer can append the row to their
 * local list state without unwrapping. The caller is
 * responsible for invalidating the watchlist cache after a
 * successful add (`invalidateWatchlist()` from
 * `@/lib/api/cache`) so the next `loadWatchlist()` refetches
 * the up-to-date list — same pattern as the wallet
 * top-up flow.
 */
export function addToWatchlist(
  body: AddToWatchlistRequest,
): Promise<WatchlistItem> {
  return request<WatchlistItem>("watchlist", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * `PUT watchlist` — update an existing watchlist row. Today
 * the only mutable field is `order` (for drag-to-reorder
 * flows); the backend uses the body's `ticker_code` to
 * identify which row to update, so the caller doesn't need
 * to track the row's `id`.
 *
 * Returns the updated `WatchlistItem` (raw). Same caller-side
 * cache-invalidation contract as `addToWatchlist`:
 * `invalidateWatchlist()` after a successful update.
 *
 * Shares `AddToWatchlistRequest` with `addToWatchlist` —
 * the body shape is identical, only the HTTP method differs.
 */
export function updateWatchlist(
  body: AddToWatchlistRequest,
): Promise<WatchlistItem> {
  return request<WatchlistItem>("watchlist", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * `DELETE watchlist` — remove a ticker from the active user's
 * watchlist. Auth-gated. Ticker-only body — the user is
 * resolved from the auth header, so `user_id` doesn't need to
 * be echoed back.
 *
 * Returns the updated full list (`WatchlistResponse` — the
 * `{ items: [...] }` envelope, same as `GET watchlist`) on
 * success, or `null` when the backend answers 204 No Content
 * (no body). The `null` branch and the failure branch are
 * distinguishable via the mutation hook's `{ ok }` return —
 * this function only signals wire shape, not success/failure.
 * Same caller-side cache-invalidation contract as the other
 * mutations.
 */
export function deleteWatchlist(
  body: DeleteWatchlistRequest,
): Promise<WatchlistResponse | null> {
  return request<WatchlistResponse | null>("watchlist", {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
