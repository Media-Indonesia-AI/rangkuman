"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
import { WATCHLIST_LIMIT } from "@/lib/auth";
import { track, EVENTS } from "@/lib/analytics-events";
import {
  WatchlistHeader,
  WatchlistEmptyState,
  WatchlistStockGrid,
  AddStockDialog,
} from "@/components/watchlist";

/**
 * /watchlist — thin orchestrator. Holds page-level state (modal flags,
 * auth-redirect guard) and composes the small widgets in
 * `@/components/watchlist`.
 *
 * The auto-redirect-to-/login effect uses a ref (`justLoggedOut`) so
 * that pressing Keluar (which clears auth synchronously) doesn't race
 * with the effect and pull the user to /login instead of "/" — the
 * actual sign-out then does a hard navigation to clean state.
 *
 * `WATCHLIST_LIMIT` (10) caps the user's free-tier watchlist. At
 * the cap, the header's "Tambah saham" button is hidden so the
 * dialog can't be opened — the only path to add more is to
 * remove one from the grid first. `isAtLimit` is derived purely
 * from `items.length` so the page reacts as soon as a mutation
 * (add / remove via the dialog) lands and `useGetWatchlist`
 * re-fetches via its subscriber bus.
 */
export default function WatchlistPage() {
  const user = useCurrentUser();
  const { items, isLoading } = useGetWatchlist();
  const [showAdd, setShowAdd] = useState(false);
  const isAtLimit = items.length >= WATCHLIST_LIMIT;

  // Fire a single `watchlist_view` event when the page becomes
  // interactive. Fires AFTER the auth gate (`user === null`
  // returns early above) so the event is only recorded for
  // authenticated views — anonymous visitors get bounced to
  // `/login` and shouldn't pollute the watchlist funnel. Skipped
  // during the initial auth-resolution render (`user === undefined`)
  // for the same reason. `items_count` lets the report segment
  // empty vs populated views, which is the meaningful funnel
  // split (empty → "did they add?") rather than treating every
  // load as identical.
  useEffect(() => {
    if (!user) return;
    track(EVENTS.watchlist_view, {
      items_count: items.length,
      is_empty: items.length === 0,
      is_at_limit: isAtLimit,
    });
    // Intentionally fire ONCE on mount. Including `items` /
    // `isAtLimit` in deps would re-fire on every cache refresh
    // (after add/remove), inflating counts. The watchlist
    // mutation events already cover those transitions; this
    // event is purely "user opened the page".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydration state — show a neutral loader while we figure out auth.
  if (user === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-text-muted">
        Memuat…
      </div>
    );
  }
  if (user === null) return null;

  return (
    <>
      <main className="flex flex-col">
        <WatchlistHeader
          onAddClick={() => setShowAdd(true)}
          isAtLimit={isAtLimit}
        />

        {items.length === 0 && !isLoading ? (
          <WatchlistEmptyState onAddClick={() => setShowAdd(true)} />
        ) : (
          <WatchlistStockGrid items={items} />
        )}
      </main>

      {showAdd && (
        <AddStockDialog
          onClose={() => setShowAdd(false)}
          existing={items}
        />
      )}
    </>
  );
}