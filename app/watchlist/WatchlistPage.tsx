"use client";

import { useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useGetWatchlist } from "@/lib/hooks/useGetWatchlist";
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
 */
export default function WatchlistPage() {
  const user = useCurrentUser();
  const { items, isLoading } = useGetWatchlist();
  const [showAdd, setShowAdd] = useState(false);

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
        <WatchlistHeader onAddClick={() => setShowAdd(true)} />

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